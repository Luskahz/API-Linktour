const API = {
  evento: (id) => fetch(`/publicacoes/${id}`),
  disponibilidade: (eventoId) => fetch(`/publicacoes/eventos/${eventoId}/disponibilidade`),
  alocacao: (id) => fetch(`/alocacoes/${id}`),
  usuario: (id) => fetch(`/usuarios/${id}`),

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

/* Navegação */
function goHome() { location.href = "/html/home.html"; }
function goEntrar() { location.href = "/index.html"; }
function goPerfil() {
  if (!userId) return goEntrar();
  location.href = `./perfil.html?id=${encodeURIComponent(userId)}`;
}

/* Sessão */
function redirectToLogin() {
  sessionStorage.removeItem("linktour_user_id");
  location.replace("/index.html");
}

function readUserIdOptional() {
  const raw = (sessionStorage.getItem("linktour_user_id") || "").trim();
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) return null;
  return raw;
}

function isAuthOnly(resp) {
  return resp && (resp.status === 401 || resp.status === 403);
}

function qs(k) {
  return new URLSearchParams(location.search).get(k);
}

/* UI */
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

async function readApiError(resp) {
  const txt = await resp.text().catch(() => "");
  if (!txt) return `HTTP ${resp.status}`;
  try {
    const obj = JSON.parse(txt);
    const msg = obj.mensagem || obj.message || obj.error || obj.details || obj.title;
    return (msg ? String(msg) : `HTTP ${resp.status}`).slice(0, 600);
  } catch {
    return String(txt).slice(0, 600);
  }
}

function setText(id, text) {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
}

/* Datas */
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

function isEvento(p) {
  return p && (p.dataInicio != null || p.dataFim != null || p.capacidade != null || p.idAlocacao != null);
}

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

function canJoin(ev) {
  const start = parseLocalDateTime(ev?.dataInicio);
  if (!start) return false;
  return (start - new Date()) >= 10 * 60 * 1000;
}

function canCancel(ev) {
  const start = parseLocalDateTime(ev?.dataInicio);
  if (!start) return true;
  return (start - new Date()) > 0;
}

/* Contagem */
function isParticipando(part) {
  if (!part) return false;
  const st = String(part.status || "").trim().toUpperCase();
  return st !== "CANCELADO" && st !== "CANCELADA" && st !== "INATIVO";
}

function daysInMonth(year, monthIndex0) {
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
  let cursor = new Date(from.getTime());

  let years = to.getFullYear() - cursor.getFullYear();
  let test = addYearsClamped(cursor, years);
  if (test > to) {
    years--;
    test = addYearsClamped(cursor, years);
  }
  cursor = test;

  let months =
    (to.getFullYear() - cursor.getFullYear()) * 12 +
    (to.getMonth() - cursor.getMonth());
  test = addMonthsClamped(cursor, months);
  if (test > to) {
    months--;
    test = addMonthsClamped(cursor, months);
  }
  cursor = test;

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

/* Menu */
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

  if (!userId || !me) {
    if (hdrBtn) hdrBtn.style.display = userId ? "inline-flex" : "none";
    if (btnEntrar) btnEntrar.style.display = userId ? "none" : "inline-flex";
    return;
  }

  if (btnEntrar) btnEntrar.style.display = "none";
  if (hdrBtn) hdrBtn.style.display = "inline-flex";

  const nome = (me?.nomeCompleto || "Usuário").trim() || "Usuário";
  const cidade = (me?.cidade || "—").trim() || "—";
  const initial = nome.charAt(0).toUpperCase();
  const foto = (me?.fotoBase64 || "").trim();
  const src = foto ? ("data:image/png;base64," + foto) : svgAvatarDataUri(initial);

  if (hdrImg) hdrImg.src = src;
  if (umImg) umImg.src = src;
  if (umName) umName.textContent = nome;
  if (umCity) umCity.textContent = cidade;
}

/* Estado */
let userId = null;
let me = null;
let eventoId = null;

let evento = null;
let autor = null;
let alocacao = null;
let participacao = null;
let disponibilidade = null;

let countdownInterval = null;

/* Fetch */
async function fetchMeIfLogged() {
  if (!userId) return;

  const resp = await API.usuario(userId);
  if (isAuthOnly(resp)) return redirectToLogin();

  if (resp.status === 404) {
    sessionStorage.removeItem("linktour_user_id");
    userId = null;
    me = null;
    return;
  }

  if (!resp.ok) return;
  me = await resp.json().catch(() => null);
}

async function fetchEvento() {
  const resp = await API.evento(eventoId);
  if (!resp.ok) throw new Error(await readApiError(resp));

  const obj = await resp.json().catch(() => null);
  if (!isEvento(obj)) throw new Error("Recurso retornado não parece ser um evento.");
  evento = obj;
}

async function fetchAutorEAlocacao() {
  autor = null;
  alocacao = null;

  if (evento?.idUsuario != null) {
    const rU = await API.usuario(evento.idUsuario);
    if (rU.ok) autor = await rU.json().catch(() => null);
  }

  if (evento?.idAlocacao != null) {
    const rA = await API.alocacao(evento.idAlocacao);
    if (rA.ok) alocacao = await rA.json().catch(() => null);
  }
}

async function fetchParticipacaoIfLogged() {
  if (!userId) { participacao = null; return; }

  const resp = await API.buscarParticipacaoEvento(eventoId, userId);
  if (isAuthOnly(resp)) return redirectToLogin();

  if (resp.status === 404) { participacao = null; return; }
  if (!resp.ok) { participacao = null; return; }

  participacao = await resp.json().catch(() => null);
}

async function fetchDisponibilidade() {
  disponibilidade = null;

  const resp = await API.disponibilidade(eventoId);
  if (isAuthOnly(resp)) return redirectToLogin();

  if (resp.status === 404) { disponibilidade = null; return; }
  if (!resp.ok) { disponibilidade = null; return; }

  const ct = (resp.headers.get("content-type") || "").toLowerCase();

  if (ct.includes("application/json")) {
    const data = await resp.json().catch(() => null);

    if (typeof data === "number") {
      disponibilidade = data;
      return;
    }

    const n =
      data?.vagas ??
      data?.disponibilidade ??
      data?.value ??
      data?.total ??
      data?.free ??
      data?.available;

    if (typeof n === "number") {
      disponibilidade = n;
      return;
    }

    const s = String(n ?? "").trim();
    disponibilidade = /^\d+$/.test(s) ? Number(s) : null;
    return;
  }

  const txt = (await resp.text().catch(() => "")).trim();
  disponibilidade = /^\d+$/.test(txt) ? Number(txt) : null;
}

/* Render */
function renderAutor() {
  const nome = (autor?.nomeCompleto || "Usuário").trim() || "Usuário";
  const cidade = (autor?.cidade || "—").trim() || "—";

  setText("autorNome", nome);
  setText("autorCidade", cidade);

  const email = (autor?.email || "").trim();
  const tel = (autor?.telefone || "").trim();
  const contato = [email, tel].filter(Boolean).join(" • ");
  setText("autorContato", contato || "—");

  const av = document.getElementById("autorAvatar");
  if (av) av.textContent = nome.charAt(0).toUpperCase() || "?";

  const link = document.getElementById("autorLink");
  if (link) {
    const id = evento?.idUsuario ?? autor?.id ?? "";
    link.href = `./usuario.html?id=${encodeURIComponent(String(id))}`;
  }
}

function renderAlocacao() {
  setText("alocNome", (alocacao?.nome || "—").trim() || "—");
  setText("alocDesc", (alocacao?.descricao || "—").trim() || "—");

  const kv = document.getElementById("alocKv");
  if (kv) {
    kv.innerHTML = "";
    const parts = [
      ["Lotação", alocacao?.lotacao != null ? String(alocacao.lotacao) : "—"],
      ["Latitude", alocacao?.latitude != null ? String(alocacao.latitude) : "—"],
      ["Longitude", alocacao?.longitude != null ? String(alocacao.longitude) : "—"],
    ];
    for (const [k, v] of parts) {
      const span = document.createElement("span");
      span.textContent = `${k}: ${v}`;
      kv.appendChild(span);
    }
  }

  const media = document.getElementById("alocMedia");
  if (media) {
    media.innerHTML = "";
    const docs = (alocacao?.url_documentacao || "").trim();
    const fachada = (alocacao?.url_fachada || "").trim();

    if (fachada) {
      const img = document.createElement("img");
      img.alt = "Fachada / imagem do local";
      img.src = fachada;
      img.loading = "lazy";
      media.appendChild(img);
    }

    if (docs) {
      const a = document.createElement("a");
      a.href = docs;
      a.target = "_blank";
      a.rel = "noreferrer";
      a.className = "link";
      a.textContent = "Ver documentação do local";
      media.appendChild(a);
    }

    if (!docs && !fachada) {
      const mini = document.createElement("div");
      mini.className = "mini";
      mini.textContent = "Sem mídia/documentação cadastrada.";
      media.appendChild(mini);
    }
  }
}

function renderEvento() {
  setText("eventTitle", evento?.titulo ?? ("Evento #" + (evento?.id ?? "?")));
  setText("eventDesc", (evento?.descricao || "").trim() || "Sem descrição.");
  setText("eventCreated", "Criado: " + fmtDateTime(evento?.dataCriacao));

  const kv = document.getElementById("eventKv");
  if (kv) {
    kv.innerHTML = "";

    const parts = [
      ["Vagas", disponibilidade != null ? String(disponibilidade) : "—"],
      ["Capacidade", evento?.capacidade != null ? String(evento.capacidade) : "—"],
      ["Início", fmtDateTime(evento?.dataInicio)],
      ["Fim", fmtDateTime(evento?.dataFim)],
      ["Alocação", evento?.idAlocacao != null ? ("#" + evento.idAlocacao) : "—"],
    ];

    for (const [k, v] of parts) {
      const span = document.createElement("span");
      span.textContent = `${k}: ${v}`;
      if (k === "Vagas" && disponibilidade != null) span.classList.add("pill-strong");
      kv.appendChild(span);
    }
  }

  const btnMapa = document.getElementById("btnMapa");
  if (btnMapa) {
    btnMapa.onclick = () => {
      if (!evento?.idAlocacao) return showNotice("Evento sem alocação vinculada.");
      toggleMapFocus();
    };
  }
}

function renderBadge() {
  const b = document.getElementById("eventBadge");
  if (!b) return;

  const { phase, start, end } = getEventPhase(evento);

  let txt = "Evento";
  if (phase === "ended") txt = "Encerrado";
  if (phase === "running") txt = "Em andamento";
  if (phase === "upcoming") txt = "Em breve";

  if (userId) txt += isParticipando(participacao) ? " • Participando" : " • Não participante";
  if (!start) txt += " • Sem data início";
  if (!end) txt += " • Sem data fim";

  b.textContent = txt;
}

/* Participação */
function applyParticipacaoButtonState() {
  const btn = document.getElementById("btnParticipacao");
  if (!btn) return;

  if (!userId) {
    btn.className = "btn primary";
    btn.textContent = "Entrar para participar";
    btn.disabled = false;
    btn.title = "";
    btn.onclick = () => goEntrar();
    return;
  }

  const participando = isParticipando(participacao);

  if (participando) {
    btn.className = "btn";
    btn.textContent = "Cancelar participação";
    btn.disabled = !canCancel(evento);
    btn.title = btn.disabled ? "Não é possível cancelar após o início do evento." : "";
    btn.onclick = () => cancelarParticipacao();
  } else {
    btn.className = "btn primary";
    btn.textContent = "Participar";
    btn.disabled = !canJoin(evento);
    btn.title = btn.disabled ? "Disponível somente até 10 minutos antes do início." : "";
    btn.onclick = () => participar();
  }
}

async function participar() {
  hideError("pageError");
  hideNotice();

  if (!userId) return goEntrar();

  if (!canJoin(evento)) {
    showNotice("Inscrições encerradas para este evento.");
    applyParticipacaoButtonState();
    return;
  }

  const btn = document.getElementById("btnParticipacao");
  const payload = { usuarioId: Number(userId) };

  try {
    if (btn) { btn.disabled = true; btn.textContent = "Enviando..."; }

    const resp = await API.participarEvento(eventoId, payload);
    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      showError("pageError", await readApiError(resp));
      await fetchParticipacaoIfLogged();
      if (btn) btn.disabled = false;
      applyParticipacaoButtonState();
      return;
    }

    participacao = await resp.json().catch(() => ({ status: "PENDENTE" }));


    await fetchDisponibilidade();
    renderEvento();

    showNotice("Participação registrada!");
    applyParticipacaoButtonState();
    renderBadge();
  } catch (e) {
    console.error(e);
    showError("pageError", "Erro de rede/servidor ao participar.");
    if (btn) btn.disabled = false;
    applyParticipacaoButtonState();
  }
}


async function cancelarParticipacao() {
  hideError("pageError");
  hideNotice();

  if (!userId) return goEntrar();

  if (!canCancel(evento)) {
    showNotice("Não é possível cancelar após o início do evento.");
    applyParticipacaoButtonState();
    return;
  }

  if (!confirm("Cancelar sua participação neste evento?")) {
    applyParticipacaoButtonState();
    return;
  }

  const btn = document.getElementById("btnParticipacao");

  try {
    if (btn) { btn.disabled = true; btn.textContent = "Cancelando..."; }

    const resp = await API.cancelarParticipacaoEvento(eventoId, userId);
    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      showError("pageError", await readApiError(resp));
      if (btn) btn.disabled = false;
      applyParticipacaoButtonState();
      return;
    }

    participacao = null;

    await fetchDisponibilidade();
    renderEvento();

    showNotice("Participação cancelada.");
    applyParticipacaoButtonState();
    renderBadge();
  } catch (e) {
    console.error(e);
    showError("pageError", "Erro de rede/servidor ao cancelar participação.");
    if (btn) btn.disabled = false;
    applyParticipacaoButtonState();
  }
}

/* Countdown */
function startCountdown() {
  const el = document.getElementById("eventCountdown");
  if (!el) return;

  if (countdownInterval) clearInterval(countdownInterval);

  const tick = () => {
    const { phase, start } = getEventPhase(evento);

    if (!start) {
      el.textContent = "Sem data de início.";
      return;
    }

    const now = new Date();
    const diff = start - now;
    const pretty = formatCountdownPT(now, start);

    if (phase === "ended") el.textContent = "Evento encerrado.";
    else if (phase === "running") el.textContent = "Evento em andamento.";
    else {
      if (diff >= 10 * 60 * 1000) el.textContent = `Começa em ${pretty}.`;
      else if (diff > 0) el.textContent = `Começa em ${pretty} • inscrições encerradas (faltam < 10 min).`;
      else el.textContent = "Evento em andamento.";
    }

    applyParticipacaoButtonState();
    renderBadge();
  };

  tick();
  countdownInterval = setInterval(tick, 1000);
}

/* Mapa */
let map = null;
let marker = null;

function renderMap() {
  const hint = document.getElementById("mapHint");
  const box = document.getElementById("map");

  const lat = Number(alocacao?.latitude);
  const lng = Number(alocacao?.longitude);

  if (!box) return;

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    if (hint) hint.textContent = "Sem coordenadas cadastradas para esta alocação.";
    box.innerHTML = `<div class="map-empty">Mapa indisponível</div>`;
    return;
  }

  if (hint) hint.textContent = `${lat.toFixed(6)}, ${lng.toFixed(6)}`;

  if (!map) {
    map = L.map("map", { zoomControl: true, attributionControl: true }).setView([lat, lng], 15);

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap contributors",
    }).addTo(map);
  } else {
    map.setView([lat, lng], 15);
  }

  if (marker) marker.remove();
  marker = L.marker([lat, lng]).addTo(map);

  const label = (alocacao?.nome || evento?.titulo || "Local do evento").trim();
  marker.bindPopup(label).openPopup();

  setTimeout(() => map.invalidateSize(), 50);
}

function toggleMapFocus() {
  const mapBox = document.getElementById("map");
  if (!mapBox) return;

  mapBox.scrollIntoView({ behavior: "smooth", block: "center" });
  setTimeout(() => map?.invalidateSize?.(), 120);
}

/* Init */
(function init() {
  hideError("pageError");
  hideNotice();

  const rawId = (qs("id") || "").trim();
  if (!/^\d+$/.test(rawId) || Number(rawId) <= 0) {
    showError("pageError", "URL inválida: faltou ?id={eventoId} (numérico).");
    return;
  }
  eventoId = rawId;

  userId = readUserIdOptional();

  const bg = document.getElementById("userMenuBg");
  if (bg) bg.addEventListener("click", () => toggleUserMenu(false));

  (async () => {
    try {
      await fetchMeIfLogged();
      applyHeaderAndMenuAvatar();

      await fetchEvento();
      await Promise.all([
        fetchAutorEAlocacao(),
        fetchParticipacaoIfLogged(),
        fetchDisponibilidade(),
      ]);

      renderEvento();
      renderAutor();
      renderAlocacao();
      renderBadge();

      startCountdown();
      renderMap();
      applyParticipacaoButtonState();
    } catch (e) {
      console.error(e);
      showError("pageError", String(e?.message || "Erro ao carregar evento."));
    }
  })();

  window.addEventListener("beforeunload", () => {
    if (countdownInterval) clearInterval(countdownInterval);
  });
})();
