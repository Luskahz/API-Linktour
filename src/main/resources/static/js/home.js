// ===== API =====
const API = {
  usuario: (id) => fetch(`/usuarios/${id}`),
  publicacoes: () => fetch(`/publicacoes`),

  participarEvento: (eventoId, payload) =>
    fetch(`/participacoes/eventos/${eventoId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  buscarParticipacaoEvento: (eventoId, usuarioId) =>
    fetch(`/participacoes/eventos/${eventoId}?usuarioId=${encodeURIComponent(usuarioId)}`),

  cancelarParticipacaoEvento: (eventoId, usuarioId) =>
    fetch(`/participacoes/eventos/${eventoId}?usuarioId=${encodeURIComponent(usuarioId)}`, {
      method: "DELETE",
    }),
};

// ===== Auth (front-only / "ríspido") =====
function redirectToLogin() {
  sessionStorage.removeItem("linktour_user_id");
  location.replace("/index.html"); // não volta no "voltar"
}

function requireLoginOrRedirect() {
  const raw = (sessionStorage.getItem("linktour_user_id") || "").trim();
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
    redirectToLogin();
    return null;
  }
  return raw;
}

function isAuthProblem(resp) {
  // 404 aqui costuma significar "usuário não existe" no /usuarios/{id}
  return resp && (resp.status === 401 || resp.status === 403 || resp.status === 404);
}

function isAuthOnly(resp) {
  return resp && (resp.status === 401 || resp.status === 403);
}

// ===== State =====
let userId = null;       // usuario logado (session)
let user = null;         // usuario logado (obj)
let publicacoes = [];    // feed bruto do backend

const authorCache = new Map();        // idUsuario -> usuario response
const participacaoCache = new Map();  // eventoId -> ParticipacaoEventoResponseDTO | null
const countdownTimers = new Map();    // eventoId -> intervalId

// ===== Utils =====
function qs(k) {
  return new URLSearchParams(location.search).get(k);
}

function fmtDateTime(dt) {
  if (!dt) return "—";
  try {
    const s = String(dt);
    const base = s.replace("Z", "").split(".")[0];
    const [d, t] = base.split("T");
    if (!d || !t) return s;
    const [y, m, day] = d.split("-");
    return `${day}/${m}/${y} ${t.slice(0, 5)}`;
  } catch {
    return String(dt);
  }
}

function showError(id, msg) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function hideError(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = "";
  el.style.display = "none";
}

function showNotice(msg) {
  const el = document.getElementById("pageNotice");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function hideNotice() {
  const el = document.getElementById("pageNotice");
  if (!el) return;
  el.textContent = "";
  el.style.display = "none";
}

async function compactError(resp) {
  const txt = await resp.text().catch(() => "");
  try {
    const obj = JSON.parse(txt);
    const msg = obj.message || obj.error || ("HTTP " + resp.status);
    return String(msg).slice(0, 320) + (String(msg).length > 320 ? "\n...(cortado)" : "");
  } catch {
    return String(txt).slice(0, 320) + (txt.length > 320 ? "\n...(cortado)" : "");
  }
}

// ===== Polimorfismo (type guard) =====
function isEvento(p) {
  // EventoResponseDTO tem campos que PublicacaoResponseDTO não tem
  return p && (p.dataInicio != null || p.dataFim != null || p.capacidade != null || p.idAlocacao != null);
}

// ===== Datas (LocalDateTime do Java -> Date local) =====
function parseLocalDateTime(dt) {
  if (!dt) return null;
  const s = String(dt).replace("Z", "").split(".")[0];
  const [d, t] = s.split("T");
  if (!d || !t) return null;

  const [y, m, day] = d.split("-").map(Number);
  const [hh, mm, ss] = t.split(":").map(Number);
  return new Date(y, (m || 1) - 1, day || 1, hh || 0, mm || 0, ss || 0, 0);
}

function getEventPhase(ev) {
  const start = parseLocalDateTime(ev?.dataInicio);
  const end = parseLocalDateTime(ev?.dataFim);
  const now = new Date();

  if (end && now > end) return { phase: "ended", start, end };
  if (start && now >= start) return { phase: "running", start, end };
  return { phase: "upcoming", start, end };
}

// participar só se faltar >= 10 minutos (front-only)
function canJoin(ev) {
  const start = parseLocalDateTime(ev?.dataInicio);
  if (!start) return false;
  return (start - new Date()) >= 10 * 60 * 1000;
}

// cancelar permitido até o evento começar
function canCancel(ev) {
  const start = parseLocalDateTime(ev?.dataInicio);
  if (!start) return true;
  return (start - new Date()) > 0;
}

function isParticipando(part) {
  if (!part) return false;
  const st = String(part.status || "").trim().toUpperCase();
  return st !== "CANCELADO" && st !== "CANCELADA" && st !== "INATIVO";
}

// ===== Countdown helpers (YMdhms) =====
function daysInMonth(year, monthIndex0) {
  // monthIndex0: 0..11
  return new Date(year, monthIndex0 + 1, 0).getDate();
}

function addMonthsClamped(date, monthsToAdd) {
  const d = new Date(date.getTime());
  const y = d.getFullYear();
  const m = d.getMonth();
  const day = d.getDate();

  const total = m + monthsToAdd;
  const ny = y + Math.floor(total / 12);
  const nm = ((total % 12) + 12) % 12;

  const maxDay = daysInMonth(ny, nm);
  const nd = Math.min(day, maxDay);

  const out = new Date(d.getTime());
  out.setFullYear(ny, nm, nd);
  return out;
}

function addYearsClamped(date, yearsToAdd) {
  const d = new Date(date.getTime());
  const ny = d.getFullYear() + yearsToAdd;
  const m = d.getMonth();
  const day = d.getDate();

  const maxDay = daysInMonth(ny, m);
  const nd = Math.min(day, maxDay);

  const out = new Date(d.getTime());
  out.setFullYear(ny, m, nd);
  return out;
}

function diffCalendarParts(from, to) {
  // assume to >= from
  let cursor = new Date(from.getTime());

  // anos
  let years = to.getFullYear() - cursor.getFullYear();
  let test = addYearsClamped(cursor, years);
  if (test > to) {
    years--;
    test = addYearsClamped(cursor, years);
  }
  cursor = test;

  // meses
  let months =
    (to.getFullYear() - cursor.getFullYear()) * 12 +
    (to.getMonth() - cursor.getMonth());
  test = addMonthsClamped(cursor, months);
  if (test > to) {
    months--;
    test = addMonthsClamped(cursor, months);
  }
  cursor = test;

  // resto em ms -> dias/horas/min/seg
  let ms = to - cursor;
  ms = Math.max(0, ms);

  const totalSec = Math.floor(ms / 1000);
  const days = Math.floor(totalSec / 86400);
  const hours = Math.floor((totalSec % 86400) / 3600);
  const minutes = Math.floor((totalSec % 3600) / 60);
  const seconds = totalSec % 60;

  return { years, months, days, hours, minutes, seconds };
}

function formatCountdownPT(from, to) {
  if (!from || !to) return "—";
  if (to <= from) return "0s";

  const p = diffCalendarParts(from, to);
  const parts = [];

  if (p.years) parts.push(`${p.years} ano${p.years === 1 ? "" : "s"}`);
  if (p.months) parts.push(`${p.months} mês${p.months === 1 ? "" : "es"}`);
  if (p.days) parts.push(`${p.days} dia${p.days === 1 ? "" : "s"}`);

  parts.push(`${String(p.hours).padStart(2, "0")}h`);
  parts.push(`${String(p.minutes).padStart(2, "0")}m`);
  parts.push(`${String(p.seconds).padStart(2, "0")}s`);

  return parts.join(" ");
}

// ===== Countdown =====
function stopAllCountdowns() {
  for (const id of countdownTimers.values()) clearInterval(id);
  countdownTimers.clear();
}

// ===== Countdown (FUNÇÃO INTEIRA ajustada) =====
function startCountdown(ev, card) {
  const el = card.querySelector("[data-countdown]");
  const btn = card.querySelector("[data-participacao-btn]");
  if (!el) return;

  if (countdownTimers.has(ev.id)) {
    clearInterval(countdownTimers.get(ev.id));
    countdownTimers.delete(ev.id);
  }

  const tick = () => {
    const { phase, start } = getEventPhase(ev);

    if (!start) {
      el.textContent = "Sem data de início.";
      if (btn) {
        btn.disabled = true;
        btn.title = "Evento sem data de início.";
      }
      return;
    }

    const now = new Date();
    const diff = start - now;
    const pretty = formatCountdownPT(now, start);

    if (phase === "ended") {
      el.textContent = "Evento encerrado.";
    } else if (phase === "running") {
      el.textContent = "Evento em andamento.";
    } else {
      if (diff >= 10 * 60 * 1000) {
        el.textContent = `⏳ Começa em ${pretty}.`;
      } else if (diff > 0) {
        el.textContent = `⏳ Começa em ${pretty} • inscrições encerradas (faltam < 10 min).`;
      } else {
        el.textContent = "Evento em andamento.";
      }
    }

    if (btn) applyParticipacaoButtonState(ev, card, btn);
  };

  tick();
  const intervalId = setInterval(tick, 1000);
  countdownTimers.set(ev.id, intervalId);
}

// ===== Nav =====
function goHome() { location.href = "/pages/home.html"; }
function goEntrar() { location.href = "/index.html"; }
function goPerfil() {
  if (!userId) return goEntrar();
  location.href = `./perfil.html?id=${encodeURIComponent(userId)}`;
}

// ===== Menu =====
function toggleUserMenu(force) {
  const bg = document.getElementById("userMenuBg");
  if (!bg) return;

  const isOpen = bg.style.display === "grid";
  const next = (typeof force === "boolean") ? force : !isOpen;
  bg.style.display = next ? "grid" : "none";
}

function logout() {
  toggleUserMenu(false);
  if (!confirm("Realmente deseja sair?")) return;
  sessionStorage.removeItem("linktour_user_id");
  location.href = "/index.html";
}

// ===== Avatar =====
function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;"
  }[c]));
}

function svgAvatarDataUri(initial) {
  const ch = escapeXml((initial || "?").toString().slice(0, 1).toUpperCase());
  const svg =
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="0" y="0" width="100" height="100" rx="50" ry="50" fill="white"/>
  <text x="50" y="52" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="56" font-weight="900"
        fill="black" stroke="black" stroke-width="1.2" paint-order="stroke">${ch}</text>
</svg>`;
  const b64 = btoa(unescape(encodeURIComponent(svg)));
  return "data:image/svg+xml;base64," + b64;
}

function applyHeaderAndMenuAvatar() {
  const hdrBtn = document.getElementById("hdrAvatarBtn");
  const hdrImg = document.getElementById("hdrAvatarImg");
  const umImg = document.getElementById("umAvatarImg");
  const umName = document.getElementById("umName");
  const umCity = document.getElementById("umCity");
  const btnEntrar = document.getElementById("btnEntrar");

  if (!userId) {
    if (hdrBtn) hdrBtn.style.display = "none";
    if (btnEntrar) btnEntrar.style.display = "inline-flex";
    return;
  }

  if (btnEntrar) btnEntrar.style.display = "none";
  if (hdrBtn) hdrBtn.style.display = "inline-flex";

  const nome = (user?.nomeCompleto || "Usuário").trim() || "Usuário";
  const cidade = (user?.cidade || "—").trim() || "—";
  const initial = nome.charAt(0).toUpperCase();
  const foto = (user?.fotoBase64 || "").trim();

  const src = foto ? ("data:image/png;base64," + foto) : svgAvatarDataUri(initial);

  if (hdrImg) hdrImg.src = src;
  if (umImg) umImg.src = src;
  if (umName) umName.textContent = nome;
  if (umCity) umCity.textContent = cidade;
}

// ===== Autor (header do card) =====
async function getAutor(idUsuario) {
  if (!idUsuario) return null;
  if (authorCache.has(idUsuario)) return authorCache.get(idUsuario);

  try {
    const resp = await API.usuario(idUsuario);

    if (isAuthOnly(resp)) {
      redirectToLogin();
      return null;
    }

    if (!resp.ok) return null;

    const u = await resp.json();
    authorCache.set(idUsuario, u);
    return u;
  } catch {
    return null;
  }
}

function setAutorUI(cardEl, autor) {
  const img = cardEl.querySelector("[data-author-img]");
  const name = cardEl.querySelector("[data-author-name]");
  const mini = cardEl.querySelector("[data-author-mini]");

  const nome = (autor?.nomeCompleto || "Usuário").trim() || "Usuário";
  const cidade = (autor?.cidade || "—").trim() || "—";
  const initial = nome.charAt(0).toUpperCase();
  const foto = (autor?.fotoBase64 || "").trim();
  const src = foto ? ("data:image/png;base64," + foto) : svgAvatarDataUri(initial);

  if (img) img.src = src;
  if (name) name.textContent = nome;
  if (mini) mini.textContent = cidade;
}

// ===== Participação (cache) =====
async function ensureParticipacao(eventoId) {
  if (!userId) return null;
  if (participacaoCache.has(eventoId)) return participacaoCache.get(eventoId);

  try {
    const resp = await API.buscarParticipacaoEvento(eventoId, userId);

    if (isAuthOnly(resp)) {
      redirectToLogin();
      return null;
    }

    if (resp.status === 404) {
      participacaoCache.set(eventoId, null);
      return null;
    }
    if (!resp.ok) {
      participacaoCache.set(eventoId, null);
      return null;
    }

    const part = await resp.json();
    participacaoCache.set(eventoId, part);
    return part;
  } catch {
    participacaoCache.set(eventoId, null);
    return null;
  }
}

function applyParticipacaoButtonState(ev, card, btn) {
  if (!btn) return;

  // deslogado: pode clicar, mas manda pro login (mas sua home é ríspida, então aqui é só segurança extra)
  if (!userId) {
    btn.className = "btn primary";
    btn.textContent = "Participar";
    btn.disabled = false;
    btn.title = "";
    btn.onclick = () => {
      showNotice("Você precisa entrar para participar.");
      goEntrar();
    };
    return;
  }

  const part = participacaoCache.get(ev.id);
  const participando = isParticipando(part);

  if (participando) {
    btn.className = "btn";
    btn.textContent = "Cancelar participação";
    btn.disabled = !canCancel(ev);
    btn.title = btn.disabled ? "Não é possível cancelar após o início do evento." : "";
    btn.onclick = () => cancelarParticipacao(ev, btn, card);
  } else {
    btn.className = "btn primary";
    btn.textContent = "Participar";
    btn.disabled = !canJoin(ev);
    btn.title = btn.disabled ? "Disponível somente até 10 minutos antes do início." : "";
    btn.onclick = () => participar(ev, btn, card);
  }
}

// ===== Participar / Cancelar / Mapa =====
async function participar(ev, btnEl, card) {
  hideError("pageError");
  hideNotice();

  if (!userId) {
    showNotice("Você precisa entrar para participar.");
    return goEntrar();
  }

  if (!canJoin(ev)) {
    showNotice("Inscrições encerradas (faltam menos de 10 minutos).");
    applyParticipacaoButtonState(ev, card, btnEl);
    return;
  }

  const payload = { usuarioId: Number(userId), eventoId: Number(ev.id) };

  try {
    btnEl.disabled = true;
    btnEl.textContent = "Enviando...";

    const resp = await API.participarEvento(ev.id, payload);

    if (isAuthOnly(resp)) {
      redirectToLogin();
      return;
    }

    if (!resp.ok) {
      const msg = await compactError(resp);
      showError("pageError", "Falha ao participar.\n" + msg);
      btnEl.disabled = false;
      applyParticipacaoButtonState(ev, card, btnEl);
      return;
    }

    const part = await resp.json().catch(() => ({ status: "ATIVO" }));
    participacaoCache.set(ev.id, part);

    showNotice("Participação registrada!");
    applyParticipacaoButtonState(ev, card, btnEl);
  } catch (e) {
    console.error(e);
    showError("pageError", "Erro de rede/servidor ao participar.");
    btnEl.disabled = false;
    applyParticipacaoButtonState(ev, card, btnEl);
  }
}

async function cancelarParticipacao(ev, btnEl, card) {
  hideError("pageError");
  hideNotice();

  if (!userId) {
    showNotice("Você precisa entrar para cancelar.");
    return goEntrar();
  }

  if (!canCancel(ev)) {
    showNotice("Não é possível cancelar após o início do evento.");
    applyParticipacaoButtonState(ev, card, btnEl);
    return;
  }

  if (!confirm("Cancelar sua participação neste evento?")) {
    applyParticipacaoButtonState(ev, card, btnEl);
    return;
  }

  try {
    btnEl.disabled = true;
    btnEl.textContent = "Cancelando...";

    const resp = await API.cancelarParticipacaoEvento(ev.id, userId);

    if (isAuthOnly(resp)) {
      redirectToLogin();
      return;
    }

    if (!resp.ok) {
      const msg = await compactError(resp);
      showError("pageError", "Falha ao cancelar.\n" + msg);
      btnEl.disabled = false;
      applyParticipacaoButtonState(ev, card, btnEl);
      return;
    }

    participacaoCache.set(ev.id, null);
    showNotice("Participação cancelada.");
    applyParticipacaoButtonState(ev, card, btnEl);
  } catch (e) {
    console.error(e);
    showError("pageError", "Erro de rede/servidor ao cancelar participação.");
    btnEl.disabled = false;
    applyParticipacaoButtonState(ev, card, btnEl);
  }
}

function verNoMapa(eventoId) {
  location.href = `./mapa.html?eventoId=${encodeURIComponent(eventoId)}`;
}

// ===== Render (cards só de EVENTO) =====
function renderFeed(lista) {
  stopAllCountdowns();

  const box = document.getElementById("listaPublicacoes");
  if (!box) return;

  box.innerHTML = "";

  if (!lista || lista.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhuma publicação encontrada.";
    box.appendChild(empty);
    return;
  }

  const eventosOnly = lista.filter(isEvento);

  if (eventosOnly.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhum evento encontrado.";
    box.appendChild(empty);
    return;
  }

  eventosOnly.forEach((ev) => {
    const card = document.createElement("div");
    card.className = "card";

    const header = document.createElement("div");
    header.style.display = "flex";
    header.style.alignItems = "center";
    header.style.justifyContent = "space-between";
    header.style.gap = "10px";
    header.style.marginBottom = "10px";

    header.innerHTML = `
      <div style="display:flex; align-items:center; gap:10px; min-width:0;">
        <img data-author-img style="width:36px;height:36px;border-radius:999px;border:1px solid var(--black);object-fit:cover;background:#fff;" />
        <div style="min-width:0;">
          <div style="font-weight:800; font-size:13px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
            <span data-author-name>Usuário</span>
            <span style="font-weight:700;"> compartilhou um evento</span>
          </div>
          <div style="font-size:11px; color:#333; display:flex; gap:8px; flex-wrap:wrap;">
            <span>${fmtDateTime(ev?.dataCriacao)}</span>
            <span>•</span>
            <span data-author-mini>—</span>
          </div>
        </div>
      </div>
    `;

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = ev?.titulo ?? ("Evento #" + (ev?.id ?? "?"));

    const desc = document.createElement("div");
    desc.className = "card-desc";
    desc.textContent = ev?.descricao ?? "";

    const kv = document.createElement("div");
    kv.className = "kv";
    kv.innerHTML = `
      <span>Capacidade: ${ev?.capacidade ?? "—"}</span>
      <span>Início: ${fmtDateTime(ev?.dataInicio)}</span>
      <span>Fim: ${fmtDateTime(ev?.dataFim)}</span>
    `;

    const countdown = document.createElement("div");
    countdown.className = "mini";
    countdown.style.marginTop = "8px";
    countdown.setAttribute("data-countdown", "");
    countdown.textContent = "Carregando status...";

    const actions = document.createElement("div");
    actions.style.display = "flex";
    actions.style.gap = "10px";
    actions.style.marginTop = "10px";
    actions.style.flexWrap = "wrap";

    const btnParticipar = document.createElement("button");
    btnParticipar.className = "btn primary";
    btnParticipar.type = "button";
    btnParticipar.textContent = "Participar";
    btnParticipar.setAttribute("data-participacao-btn", "1");
    btnParticipar.onclick = () => participar(ev, btnParticipar, card);

    const btnMapa = document.createElement("button");
    btnMapa.className = "btn";
    btnMapa.type = "button";
    btnMapa.textContent = "Ver no mapa";
    btnMapa.onclick = () => verNoMapa(ev.id);

    actions.appendChild(btnParticipar);
    actions.appendChild(btnMapa);

    card.appendChild(header);
    card.appendChild(title);
    if ((ev?.descricao ?? "").trim()) card.appendChild(desc);
    card.appendChild(kv);
    card.appendChild(countdown);
    card.appendChild(actions);

    box.appendChild(card);

    // hidrata autor async
    (async () => {
      const autor = await getAutor(ev?.idUsuario);
      if (autor) setAutorUI(card, autor);
    })();

    // participa/cancela: busca participação e aplica estado
    (async () => {
      if (userId) await ensureParticipacao(ev.id);
      applyParticipacaoButtonState(ev, card, btnParticipar);
    })();

    // countdown sempre
    startCountdown(ev, card);
  });
}

// ===== Filters (client-side) =====
function getFilterState() {
  return {
    q: (document.getElementById("q")?.value || "").trim(),
    cidade: (document.getElementById("cidade")?.value || "").trim(),
    de: document.getElementById("de")?.value || "",
    ate: document.getElementById("ate")?.value || "",
    sort: document.getElementById("sort")?.value || "recentes",
  };
}

function sortList(list, sort) {
  const arr = [...(list || [])];

  if (sort === "titulo") {
    arr.sort((a, b) => String(a?.titulo || "").localeCompare(String(b?.titulo || ""), "pt-BR"));
    return arr;
  }

  if (sort === "proximos") {
    arr.sort((a, b) => {
      const ad = String(a?.dataInicio || a?.dataCriacao || "");
      const bd = String(b?.dataInicio || b?.dataCriacao || "");
      return ad.localeCompare(bd);
    });
    return arr;
  }

  // recentes: dataCriacao desc, senão id desc
  arr.sort((a, b) => {
    const ac = String(a?.dataCriacao || "");
    const bc = String(b?.dataCriacao || "");
    if (ac && bc && ac !== bc) return bc.localeCompare(ac);
    return Number(b?.id || 0) - Number(a?.id || 0);
  });

  return arr;
}

function applyFilters() {
  hideError("pageError");
  hideNotice();

  const f = getFilterState();
  let out = [...(publicacoes || [])];

  // busca texto
  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter(p =>
      String(p?.titulo || "").toLowerCase().includes(q) ||
      String(p?.descricao || "").toLowerCase().includes(q)
    );
  }

  // datas:
  // - evento: usa dataInicio/dataFim
  // - publicação: usa dataCriacao (se existir no futuro)
  if (f.de) {
    const start = f.de + "T00:00:00";
    out = out.filter(p => {
      const key = isEvento(p) ? String(p?.dataInicio || "") : String(p?.dataCriacao || "");
      return key >= start;
    });
  }
  if (f.ate) {
    const end = f.ate + "T23:59:59";
    out = out.filter(p => {
      const key = isEvento(p) ? String(p?.dataFim || "") : String(p?.dataCriacao || "");
      return key <= end;
    });
  }

  // cidade (NOTA): filtra por cidade do AUTOR (cache /usuarios/{id})
  if (f.cidade) {
    const c = f.cidade.toLowerCase();
    out = out.filter(p => {
      const autor = authorCache.get(p?.idUsuario);
      if (!autor) return true; // não exclui se não tiver cache
      return String(autor?.cidade || "").toLowerCase().includes(c);
    });
  }

  out = sortList(out, f.sort);

  renderFeed(out);

  const lu = document.getElementById("lastUpdate");
  if (lu) lu.textContent = "Atualizado: " + fmtDateTime(new Date().toISOString().slice(0, 19));
}

function clearFilters() {
  const q = document.getElementById("q");
  const cidade = document.getElementById("cidade");
  const de = document.getElementById("de");
  const ate = document.getElementById("ate");
  const sort = document.getElementById("sort");

  if (q) q.value = "";
  if (cidade) cidade.value = "";
  if (de) de.value = "";
  if (ate) ate.value = "";
  if (sort) sort.value = "recentes";

  applyFilters();
}

// ===== Fetch =====
async function refreshUser() {
  const resp = await API.usuario(userId);

  if (isAuthProblem(resp)) return redirectToLogin();

  if (!resp.ok) {
    return redirectToLogin();
  }

  user = await resp.json();
  return true;
}

async function refreshFeed() {
  hideError("pageError");

  const resp = await API.publicacoes();

  if (isAuthOnly(resp)) return redirectToLogin();

  if (!resp.ok) {
    const msg = await compactError(resp);
    showError("pageError", "Falha ao carregar publicações.\n" + msg);
    publicacoes = [];
    return;
  }

  publicacoes = await resp.json();

  // pré-carrega autores pra filtro de cidade funcionar melhor
  const ids = [...new Set((publicacoes || []).map(p => p?.idUsuario).filter(Boolean))];
  await Promise.all(ids.map(id => getAutor(id)));

  participacaoCache.clear();
}

// ===== Start =====
(function init() {
  userId = requireLoginOrRedirect();
  if (!userId) return;

  // fechar menu clicando fora
  const bg = document.getElementById("userMenuBg");
  if (bg) bg.addEventListener("click", () => toggleUserMenu(false));

  // enter no search
  const qInput = document.getElementById("q");
  if (qInput) {
    qInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
  }

  (async () => {
    try {
      await refreshUser();           // se falhar, redireciona
      applyHeaderAndMenuAvatar();

      await refreshFeed();           // se falhar por auth, redireciona
      applyFilters();
    } catch (e) {
      console.error(e);
      showError("pageError", "Erro inicial ao carregar a home.");
    }
  })();
})();
