// /js/home.js

const API = {
  usuario: (id) => fetch(`/usuarios/${id}`),
  publicacoes: () => fetch(`/publicacoes`),
  alocacao: (id) => fetch(`/alocacoes/${id}`),

  disponibilidade: (eventoId) => fetch(`/publicacoes/eventos/${eventoId}/disponibilidade`),

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

/* navegação */
function goHome() { location.href = "./home.html"; }
function goEntrar() { location.href = "/index.html"; }
function goPerfil() {
  if (!userId) return goEntrar();
  location.href = `./perfil.html?id=${encodeURIComponent(userId)}`;
}
function goEvento(eventoId) {
  location.href = `./evento.html?id=${encodeURIComponent(eventoId)}`;
}
function goUsuario(idUsuario) {
  location.href = `./usuario.html?id=${encodeURIComponent(idUsuario)}`;
}

/* sessão */
function getSessionUserId() {
  const raw = (sessionStorage.getItem("linktour_user_id") || "").trim();
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
    sessionStorage.removeItem("linktour_user_id");
    return null;
  }
  return raw;
}
function redirectToLogin() {
  sessionStorage.removeItem("linktour_user_id");
  location.replace("/index.html");
}
function isAuthOnly(resp) {
  return resp && (resp.status === 401 || resp.status === 403);
}

/* estado */
let userId = null;
let user = null;
let publicacoes = [];

const authorCache = new Map();           // idUsuario -> usuario
const alocacaoCache = new Map();         // idAlocacao -> alocacao | null
const participacaoCache = new Map();     // eventoId -> participacao | null
const disponibilidadeCache = new Map();  // eventoId -> number | null

/* ui */
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
    return (msg ? String(msg) : `HTTP ${resp.status}`).slice(0, 500);
  } catch {
    return String(txt).slice(0, 500);
  }
}

/* datas */
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

/* countdown */
const countdownTimers = new Map();
function stopAllCountdowns() {
  for (const id of countdownTimers.values()) clearInterval(id);
  countdownTimers.clear();
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

    if (phase === "ended") el.textContent = "Evento encerrado.";
    else if (phase === "running") el.textContent = "Evento em andamento.";
    else {
      if (diff >= 10 * 60 * 1000) el.textContent = `Começa em ${pretty}.`;
      else if (diff > 0) el.textContent = `Começa em ${pretty}. Inscrições encerradas (faltam < 10 min).`;
      else el.textContent = "Evento em andamento.";
    }

    if (btn) applyParticipacaoButtonState(ev, card, btn);
  };

  tick();
  const intervalId = setInterval(tick, 1000);
  countdownTimers.set(ev.id, intervalId);
}

/* avatar */
function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;",
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
function getUserAvatarSrc(u) {
  const nome = (u?.nomeCompleto || "Usuário").trim() || "Usuário";
  const initial = nome.charAt(0).toUpperCase();
  const foto = (u?.fotoBase64 || "").trim();
  return foto ? ("data:image/png;base64," + foto) : svgAvatarDataUri(initial);
}
function applyHeaderAndMenuAvatar() {
  const hdrBtn = document.getElementById("hdrAvatarBtn");
  const hdrImg = document.getElementById("hdrAvatarImg");
  const umImg = document.getElementById("umAvatarImg");
  const umName = document.getElementById("umName");
  const umCity = document.getElementById("umCity");
  const btnEntrar = document.getElementById("btnEntrar");

  if (!userId || !user) {
    if (hdrBtn) hdrBtn.style.display = "none";
    if (btnEntrar) btnEntrar.style.display = "inline-flex";
    return;
  }

  if (btnEntrar) btnEntrar.style.display = "none";
  if (hdrBtn) hdrBtn.style.display = "inline-flex";

  const nome = (user?.nomeCompleto || "Usuário").trim() || "Usuário";
  const cidade = (user?.cidade || "—").trim() || "—";
  const src = getUserAvatarSrc(user);

  if (hdrImg) hdrImg.src = src;
  if (umImg) umImg.src = src;
  if (umName) umName.textContent = nome;
  if (umCity) umCity.textContent = cidade;
}

/* menu */
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

/* dados */
function isEvento(p) {
  return p && (p.dataInicio != null || p.dataFim != null || p.capacidade != null || p.idAlocacao != null);
}

async function getAutor(idUsuario) {
  if (!idUsuario) return null;
  if (authorCache.has(idUsuario)) return authorCache.get(idUsuario);
  try {
    const resp = await API.usuario(idUsuario);
    if (!resp.ok) return null;
    const u = await resp.json();
    authorCache.set(idUsuario, u);
    return u;
  } catch {
    return null;
  }
}

async function getAlocacao(idAlocacao) {
  if (!idAlocacao) return null;
  if (alocacaoCache.has(idAlocacao)) return alocacaoCache.get(idAlocacao);
  try {
    const resp = await API.alocacao(idAlocacao);
    if (resp.status === 404) {
      alocacaoCache.set(idAlocacao, null);
      return null;
    }
    if (!resp.ok) {
      alocacaoCache.set(idAlocacao, null);
      return null;
    }
    const a = await resp.json();
    alocacaoCache.set(idAlocacao, a);
    return a;
  } catch {
    alocacaoCache.set(idAlocacao, null);
    return null;
  }
}

async function getDisponibilidade(eventoId) {
  if (!eventoId) return null;
  if (disponibilidadeCache.has(eventoId)) return disponibilidadeCache.get(eventoId);

  try {
    const resp = await API.disponibilidade(eventoId);

    if (resp.status === 404) {
      disponibilidadeCache.set(eventoId, null);
      return null;
    }
    if (!resp.ok) {
      disponibilidadeCache.set(eventoId, null);
      return null;
    }

    const ct = (resp.headers.get("content-type") || "").toLowerCase();
    let val = null;

    if (ct.includes("application/json")) {
      const data = await resp.json().catch(() => null);
      if (typeof data === "number") val = data;
      else if (data && typeof data === "object") {
        const n = data.vagas ?? data.disponibilidade ?? data.value ?? data.total;
        if (typeof n === "number") val = n;
        else if (typeof n === "string" && /^\d+$/.test(n.trim())) val = Number(n.trim());
      }
    } else {
      const txt = (await resp.text().catch(() => "")).trim();
      if (/^\d+$/.test(txt)) val = Number(txt);
    }

    disponibilidadeCache.set(eventoId, val);
    return val;
  } catch {
    disponibilidadeCache.set(eventoId, null);
    return null;
  }
}

/* participação */
function isParticipando(part) {
  if (!part) return false;
  const st = String(part.status || "").trim().toUpperCase();
  return st !== "CANCELADO" && st !== "CANCELADA" && st !== "INATIVO";
}

async function ensureParticipacao(eventoId) {
  if (!userId) return null;
  if (participacaoCache.has(eventoId)) return participacaoCache.get(eventoId);

  try {
    const resp = await API.buscarParticipacaoEvento(eventoId, userId);

    if (isAuthOnly(resp)) {
      sessionStorage.removeItem("linktour_user_id");
      userId = null;
      user = null;
      applyHeaderAndMenuAvatar();
      participacaoCache.set(eventoId, null);
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

  if (!userId) {
    btn.className = "btn primary";
    btn.textContent = "Participar";
    btn.disabled = false;
    btn.title = "";
    btn.onclick = (e) => {
      e?.stopPropagation?.();
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
    btn.onclick = (e) => {
      e?.stopPropagation?.();
      cancelarParticipacao(ev, btn, card);
    };
  } else {
    btn.className = "btn primary";
    btn.textContent = "Participar";
    btn.disabled = !canJoin(ev);
    btn.title = btn.disabled ? "Disponível somente até 10 minutos antes do início." : "";
    btn.onclick = (e) => {
      e?.stopPropagation?.();
      participar(ev, btn, card);
    };
  }
}

async function participar(ev, btnEl, card) {
  hideError("pageError");
  hideNotice();

  if (!userId) {
    showNotice("Você precisa entrar para participar.");
    return goEntrar();
  }
  if (!canJoin(ev)) {
    showNotice("Inscrições encerradas para este evento.");
    applyParticipacaoButtonState(ev, card, btnEl);
    return;
  }

  const payload = { usuarioId: Number(userId) };

  try {
    btnEl.disabled = true;
    btnEl.textContent = "Enviando...";

    const resp = await API.participarEvento(ev.id, payload);

    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      const msg = await readApiError(resp);
      showError("pageError", msg);
      await ensureParticipacao(ev.id);
      btnEl.disabled = false;
      applyParticipacaoButtonState(ev, card, btnEl);
      return;
    }

    const part = await resp.json().catch(() => ({ status: "PENDENTE" }));
    participacaoCache.set(ev.id, part);

    showNotice("Participação registrada.");
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

    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      const msg = await readApiError(resp);
      showError("pageError", msg);
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

/* mapa (Leaflet via CDN) */
let map = null;
let markersLayer = null;
const markerByEventId = new Map();

function loadLeaflet() {
  if (window.L) return Promise.resolve(window.L);

  return new Promise((resolve, reject) => {
    const s = document.createElement("script");
    s.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
    s.async = true;
    s.onload = () => resolve(window.L);
    s.onerror = () => reject(new Error("Falha ao carregar Leaflet."));
    document.head.appendChild(s);
  });
}

async function geocodeCity(city) {
  const q = String(city || "").trim();
  if (!q) return null;

  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), 3500);

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&limit=1&q=${encodeURIComponent(q)}`;
    const resp = await fetch(url, { signal: ctrl.signal, headers: { "Accept": "application/json" } });
    if (!resp.ok) return null;
    const arr = await resp.json().catch(() => null);
    const first = Array.isArray(arr) ? arr[0] : null;
    const lat = first ? Number(first.lat) : NaN;
    const lon = first ? Number(first.lon) : NaN;
    if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
    return { lat, lng: lon };
  } catch {
    return null;
  } finally {
    clearTimeout(t);
  }
}

async function initMap() {
  const el = document.getElementById("map");
  if (!el) return;

  try {
    const L = await loadLeaflet();

    map = L.map("map", { zoomControl: true });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: "&copy; OpenStreetMap",
    }).addTo(map);

    markersLayer = L.layerGroup().addTo(map);

    const fallback = { lat: -23.6200, lng: -45.4130, zoom: 12 };
    map.setView([fallback.lat, fallback.lng], fallback.zoom);

    if (user?.cidade) {
      const geo = await geocodeCity(`${user.cidade}, Brasil`);
      if (geo) map.setView([geo.lat, geo.lng], 12);
    }

    const collapse = document.getElementById("mapCollapse");
    if (collapse) {
      collapse.addEventListener("change", () => {
        setTimeout(() => { try { map?.invalidateSize?.(); } catch {} }, 250);
      });
    }
  } catch (e) {
    console.error(e);
    showNotice("Mapa indisponível no momento.");
  }
}

function clearMarkers() {
  markerByEventId.clear();
  try { markersLayer?.clearLayers?.(); } catch {}
}

function cardElByEventId(eventoId) {
  return document.querySelector(`.card[data-event-id="${CSS.escape(String(eventoId))}"]`);
}

function highlightCard(card) {
  if (!card) return;
  const prev = card.style.outline;
  const prevOff = card.style.outlineOffset;
  card.style.outline = "2px solid var(--black)";
  card.style.outlineOffset = "2px";
  setTimeout(() => {
    card.style.outline = prev;
    card.style.outlineOffset = prevOff;
  }, 900);
}

function focusEventoOnMap(eventoId) {
  if (!map || !markerByEventId.has(eventoId)) return;
  const m = markerByEventId.get(eventoId);
  try {
    map.setView(m.getLatLng(), Math.max(map.getZoom(), 14), { animate: true });
    m.openPopup();
  } catch {}
}

function focusEvento(eventoId) {
  const card = cardElByEventId(eventoId);
  highlightCard(card);
  focusEventoOnMap(eventoId);
  card?.scrollIntoView?.({ behavior: "smooth", block: "center" });
}

async function updateMarkersFromList(eventsList) {
  if (!map || !markersLayer) return;

  clearMarkers();

  const L = window.L;
  const items = (eventsList || []).filter(isEvento);

  const points = [];

  await Promise.all(items.map(async (ev) => {
    const a = await getAlocacao(ev?.idAlocacao);
    const lat = Number(a?.latitude);
    const lng = Number(a?.longitude);

    if (!Number.isFinite(lat) || !Number.isFinite(lng)) return;

    const autor = authorCache.get(ev?.idUsuario) || null;
    const nomeAutor = (autor?.nomeCompleto || "Usuário").trim() || "Usuário";

    const popupHtml = `
      <div style="font-family:Arial,sans-serif;line-height:1.25;">
        <div style="font-weight:900;font-size:13px;margin-bottom:4px;">${escapeXml(ev?.titulo || `Evento #${ev?.id ?? "—"}`)}</div>
        <div style="font-size:12px;color:#222;margin-bottom:6px;">por ${escapeXml(nomeAutor)}</div>
        <div style="font-size:11px;color:#333;">${escapeXml(a?.nome || "Local")}</div>
      </div>
    `;

    const marker = L.marker([lat, lng]).addTo(markersLayer).bindPopup(popupHtml);

    marker.on("click", () => focusEvento(ev.id));

    markerByEventId.set(ev.id, marker);
    points.push([lat, lng]);
  }));

  if (points.length >= 2) {
    try {
      map.fitBounds(points, { padding: [18, 18] });
    } catch {}
  } else if (points.length === 1) {
    try {
      map.setView(points[0], 14, { animate: true });
    } catch {}
  }
}

/* filtros */
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

  if (f.q) {
    const q = f.q.toLowerCase();
    out = out.filter((p) =>
      String(p?.titulo || "").toLowerCase().includes(q) ||
      String(p?.descricao || "").toLowerCase().includes(q)
    );
  }

  if (f.de) {
    const start = f.de + "T00:00:00";
    out = out.filter((p) => {
      const key = isEvento(p) ? String(p?.dataInicio || "") : String(p?.dataCriacao || "");
      return key >= start;
    });
  }

  if (f.ate) {
    const end = f.ate + "T23:59:59";
    out = out.filter((p) => {
      const key = isEvento(p) ? String(p?.dataFim || "") : String(p?.dataCriacao || "");
      return key <= end;
    });
  }

  if (f.cidade) {
    const c = f.cidade.toLowerCase();
    out = out.filter((p) => {
      const autor = authorCache.get(p?.idUsuario);
      if (!autor) return true;
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

/* render */
function isInteractiveTarget(target) {
  if (!target) return false;
  return !!target.closest("button, a, input, select, textarea, label, [role='button']");
}

function makeCardFocusable(cardEl, eventoId) {
  cardEl.setAttribute("role", "button");
  cardEl.setAttribute("tabindex", "0");
  cardEl.classList.add("card-clickable");
  cardEl.setAttribute("data-event-id", String(eventoId));

  cardEl.addEventListener("click", (e) => {
    if (isInteractiveTarget(e.target)) return;
    focusEvento(eventoId);
  });

  cardEl.addEventListener("keydown", (e) => {
    if (isInteractiveTarget(e.target)) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      focusEvento(eventoId);
    }
  });
}

function buildAuthorHeader(ev) {
  const wrap = document.createElement("div");
  wrap.style.display = "flex";
  wrap.style.alignItems = "center";
  wrap.style.justifyContent = "space-between";
  wrap.style.gap = "10px";
  wrap.style.marginBottom = "10px";

  const left = document.createElement("div");
  left.style.display = "flex";
  left.style.alignItems = "center";
  left.style.gap = "10px";
  left.style.minWidth = "0";

  const aLink = document.createElement("a");
  aLink.href = `./usuario.html?id=${encodeURIComponent(ev?.idUsuario ?? "")}`;
  aLink.style.display = "inline-flex";
  aLink.style.alignItems = "center";
  aLink.style.gap = "10px";
  aLink.style.textDecoration = "none";
  aLink.style.color = "inherit";
  aLink.addEventListener("click", (e) => e.stopPropagation());

  const img = document.createElement("img");
  img.setAttribute("data-author-img", "1");
  img.alt = "Autor";
  img.style.width = "36px";
  img.style.height = "36px";
  img.style.borderRadius = "999px";
  img.style.border = "1px solid var(--black)";
  img.style.objectFit = "cover";
  img.style.background = "#fff";
  img.src = svgAvatarDataUri("U");

  const meta = document.createElement("div");
  meta.style.minWidth = "0";

  const line1 = document.createElement("div");
  line1.style.fontWeight = "800";
  line1.style.fontSize = "13px";
  line1.style.whiteSpace = "nowrap";
  line1.style.overflow = "hidden";
  line1.style.textOverflow = "ellipsis";

  const nm = document.createElement("span");
  nm.setAttribute("data-author-name", "1");
  nm.textContent = "Usuário";

  const suffix = document.createElement("span");
  suffix.style.fontWeight = "700";
  suffix.textContent = " compartilhou um evento";

  line1.appendChild(nm);
  line1.appendChild(suffix);

  const line2 = document.createElement("div");
  line2.style.fontSize = "11px";
  line2.style.color = "#333";
  line2.style.display = "flex";
  line2.style.gap = "8px";
  line2.style.flexWrap = "wrap";

  const dt = document.createElement("span");
  dt.textContent = fmtDateTime(ev?.dataCriacao);

  const dot = document.createElement("span");
  dot.textContent = "•";

  const mini = document.createElement("span");
  mini.setAttribute("data-author-mini", "1");
  mini.textContent = "—";

  line2.appendChild(dt);
  line2.appendChild(dot);
  line2.appendChild(mini);

  meta.appendChild(line1);
  meta.appendChild(line2);

  aLink.appendChild(img);
  aLink.appendChild(meta);

  left.appendChild(aLink);
  wrap.appendChild(left);

  return wrap;
}

function setAutorUI(cardEl, autor) {
  const img = cardEl.querySelector("[data-author-img]");
  const name = cardEl.querySelector("[data-author-name]");
  const mini = cardEl.querySelector("[data-author-mini]");

  const nome = (autor?.nomeCompleto || "Usuário").trim() || "Usuário";
  const cidade = (autor?.cidade || "—").trim() || "—";

  if (img) img.src = getUserAvatarSrc(autor);
  if (name) name.textContent = nome;
  if (mini) mini.textContent = cidade;
}

async function setVagasUI(spanEl, eventoId) {
  if (!spanEl) return;
  const val = await getDisponibilidade(eventoId);
  if (val === null || !Number.isFinite(val)) {
    spanEl.textContent = "Vagas: —";
    return;
  }
  spanEl.textContent = `Vagas: ${val}`;
  spanEl.classList.add("pill-strong");
}

function renderFeed(lista) {
  stopAllCountdowns();

  const box = document.getElementById("listaPublicacoes");
  if (!box) return;

  box.innerHTML = "";

  const eventosOnly = (lista || []).filter(isEvento);

  if (!eventosOnly.length) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhum evento encontrado.";
    box.appendChild(empty);
    clearMarkers();
    return;
  }

  eventosOnly.forEach((ev) => {
    const card = document.createElement("div");
    card.className = "card";
    makeCardFocusable(card, ev.id);

    const header = buildAuthorHeader(ev);

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = ev?.titulo ?? ("Evento #" + (ev?.id ?? "?"));

    const desc = document.createElement("div");
    desc.className = "card-desc";
    desc.textContent = ev?.descricao ?? "";

    const kv = document.createElement("div");
    kv.className = "kv";

    const sVagas = document.createElement("span");
    sVagas.setAttribute("data-vagas", "1");
    sVagas.textContent = "Vagas: —";

    const sCap = document.createElement("span");
    sCap.textContent = `Capacidade: ${ev?.capacidade ?? "—"}`;

    const sIni = document.createElement("span");
    sIni.textContent = `Início: ${fmtDateTime(ev?.dataInicio)}`;

    const sFim = document.createElement("span");
    sFim.textContent = `Fim: ${fmtDateTime(ev?.dataFim)}`;

    kv.appendChild(sVagas);
    kv.appendChild(sCap);
    kv.appendChild(sIni);
    kv.appendChild(sFim);

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
    btnParticipar.addEventListener("click", (e) => {
      e.stopPropagation();
      participar(ev, btnParticipar, card);
    });

    const btnMais = document.createElement("button");
    btnMais.className = "btn";
    btnMais.type = "button";
    btnMais.textContent = "Ver mais";
    btnMais.addEventListener("click", (e) => {
      e.stopPropagation();
      goEvento(ev.id);
    });

    actions.appendChild(btnParticipar);
    actions.appendChild(btnMais);

    card.appendChild(header);
    card.appendChild(title);
    if ((ev?.descricao ?? "").trim()) card.appendChild(desc);
    card.appendChild(kv);
    card.appendChild(countdown);
    card.appendChild(actions);

    box.appendChild(card);

    (async () => {
      const autor = await getAutor(ev?.idUsuario);
      if (autor) setAutorUI(card, autor);
    })();

    (async () => {
      await setVagasUI(sVagas, ev.id);
    })();

    (async () => {
      if (userId) await ensureParticipacao(ev.id);
      applyParticipacaoButtonState(ev, card, btnParticipar);
    })();

    startCountdown(ev, card);
  });

  updateMarkersFromList(eventosOnly).catch(() => {});
}

/* carga */
async function refreshUser() {
  if (!userId) return false;

  const resp = await API.usuario(userId);

  if (isAuthOnly(resp) || resp.status === 404) {
    sessionStorage.removeItem("linktour_user_id");
    userId = null;
    user = null;
    applyHeaderAndMenuAvatar();
    return false;
  }

  if (!resp.ok) return false;

  user = await resp.json();
  return true;
}

async function refreshFeed() {
  hideError("pageError");

  const resp = await API.publicacoes();

  if (!resp.ok) {
    const msg = await readApiError(resp);
    showError("pageError", msg);
    publicacoes = [];
    return;
  }

  publicacoes = await resp.json();

  const ids = [...new Set((publicacoes || []).map((p) => p?.idUsuario).filter(Boolean))];
  await Promise.all(ids.map((id) => getAutor(id)));

  participacaoCache.clear();
  disponibilidadeCache.clear();
}

/* init */
(function init() {
  userId = getSessionUserId();

  const bg = document.getElementById("userMenuBg");
  if (bg) bg.addEventListener("click", () => toggleUserMenu(false));

  const qInput = document.getElementById("q");
  if (qInput) {
    qInput.addEventListener("keydown", (e) => {
      if (e.key === "Enter") applyFilters();
    });
  }

  (async () => {
    try {
      if (userId) await refreshUser();
      applyHeaderAndMenuAvatar();

      const hint = document.getElementById("hintCidade");
      const cidadeInput = document.getElementById("cidade");
      if (user?.cidade && cidadeInput && !String(cidadeInput.value || "").trim()) {
        cidadeInput.value = user.cidade;
      }
      if (hint) hint.textContent = user?.cidade ? `Sugerido: ${user.cidade}` : "";

      await initMap();

      await refreshFeed();
      applyFilters();
    } catch (e) {
      console.error(e);
      showError("pageError", "Erro inicial ao carregar a home.");
    }
  })();
})();
