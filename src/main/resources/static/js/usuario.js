// api
const API = {
  usuario: (id) => fetch(`/usuarios/${id}`),
  eventosDoUsuario: (id) => fetch(`/usuarios/${id}/eventos`),
  alocacoesDoUsuario: (id) => fetch(`/usuarios/${id}/alocacoes`),
};

// state
let meId = null;
let me = null;

let targetId = null;
let target = null;

let tab = "eventos";
let eventos = [];
let alocacoes = [];

// utils
function qs(k) { return new URLSearchParams(location.search).get(k); }

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

function isAuthOnly(resp) {
  return resp && (resp.status === 401 || resp.status === 403);
}

function readMeIdOptional() {
  const raw = (sessionStorage.getItem("linktour_user_id") || "").trim();
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) return null;
  return raw;
}

function redirectToLogin() {
  sessionStorage.removeItem("linktour_user_id");
  location.replace("/index.html");
}

async function readApiError(resp) {
  const txt = await resp.text().catch(() => "");
  if (!txt) return `HTTP ${resp.status}`;
  try {
    const obj = JSON.parse(txt);
    const msg = obj.mensagem || obj.message || obj.error || obj.details || obj.title;
    return (msg ? String(msg) : `HTTP ${resp.status}`).slice(0, 520);
  } catch {
    return String(txt).slice(0, 520);
  }
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

function safeName(u, fallbackId) {
  const nome = (u?.nomeCompleto || "").trim();
  if (nome) return nome;
  const email = (u?.email || "").trim();
  if (email) return email;
  return `Usuário #${fallbackId ?? "?"}`;
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

// nav
function goHome() { location.href = "/html/home.html"; }
function goEntrar() { location.href = "/index.html"; }
function goBack() { history.length > 1 ? history.back() : goHome(); }

function goPerfil() {
  if (!meId) return goEntrar();
  location.href = `./perfil.html?id=${encodeURIComponent(meId)}`;
}

function toggleUserMenu(force) {
  const bg = document.getElementById("userMenuBg");
  const menu = document.getElementById("userMenu");
  if (!bg || !menu) return;

  const isOpen = bg.style.display === "grid";
  const next = (typeof force === "boolean") ? force : !isOpen;
  bg.style.display = next ? "grid" : "none";
}

function logout() {
  toggleUserMenu(false);
  if (!confirm("Realmente deseja sair?")) return;
  redirectToLogin();
}

// header menu (logado)
function applyHeaderAndMenuAvatar() {
  const hdrBtn = document.getElementById("hdrAvatarBtn");
  const hdrImg = document.getElementById("hdrAvatarImg");
  const umImg = document.getElementById("umAvatarImg");
  const umName = document.getElementById("umName");
  const umCity = document.getElementById("umCity");
  const btnEntrar = document.getElementById("btnEntrar");

  if (!meId) {
    if (hdrBtn) hdrBtn.style.display = "none";
    if (btnEntrar) btnEntrar.style.display = "inline-flex";
    return;
  }

  if (btnEntrar) btnEntrar.style.display = "none";
  if (hdrBtn) hdrBtn.style.display = "inline-flex";

  const nome = safeName(me, meId);
  const cidade = (me?.cidade || "—").trim() || "—";
  const initial = nome.charAt(0).toUpperCase();
  const foto = (me?.fotoBase64 || "").trim();
  const src = foto ? ("data:image/png;base64," + foto) : svgAvatarDataUri(initial);

  if (hdrImg) hdrImg.src = src;
  if (umImg) umImg.src = src;
  if (umName) umName.textContent = nome;
  if (umCity) umCity.textContent = cidade;
}

// tabs
function setTab(next) {
  tab = next;

  document.getElementById("tabEventos")?.classList.toggle("active", tab === "eventos");
  document.getElementById("tabAlocacoes")?.classList.toggle("active", tab === "alocacoes");

  const le = document.getElementById("listaEventos");
  const la = document.getElementById("listaAlocacoes");
  if (le) le.style.display = (tab === "eventos") ? "flex" : "none";
  if (la) la.style.display = (tab === "alocacoes") ? "flex" : "none";
}

function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" });
}

// render
function renderHeaderUser() {
  const nome = safeName(target, targetId);
  const cidade = (target?.cidade || "—").trim() || "—";

  const nomeEl = document.getElementById("nomeCompleto");
  const pillEl = document.getElementById("pillCidade");
  if (nomeEl) nomeEl.textContent = nome;
  if (pillEl) pillEl.textContent = cidade;

  const foto = (target?.fotoBase64 || "").trim();
  const initial = nome.trim().charAt(0).toUpperCase() || "?";

  const av = document.getElementById("avatar");
  if (av) {
    if (foto) {
      av.textContent = "";
      av.style.backgroundImage = `url("${"data:image/png;base64," + foto}")`;
      av.style.backgroundSize = "cover";
      av.style.backgroundPosition = "center";
      av.style.backgroundRepeat = "no-repeat";
    } else {
      av.style.backgroundImage = "";
      av.textContent = initial;
    }
  }

  const lu = document.getElementById("lastUpdate");
  if (lu) lu.textContent = "Atualizado: " + fmtDateTime(new Date().toISOString().slice(0, 19));
}

function renderCounts() {
  const ce = document.getElementById("countEventos");
  const ca = document.getElementById("countAlocacoes");
  if (ce) ce.textContent = String(eventos?.length ?? 0);
  if (ca) ca.textContent = String(alocacoes?.length ?? 0);
}

function renderEventos() {
  const box = document.getElementById("listaEventos");
  if (!box) return;
  box.innerHTML = "";

  if (!eventos || eventos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhum evento publicado por este usuário.";
    box.appendChild(empty);
    return;
  }

  eventos.forEach((ev) => {
    const card = document.createElement("div");
    card.className = "card card-clickable";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");

    const open = () => {
      const id = ev?.id;
      if (!id) return;
      location.href = `./evento.html?id=${encodeURIComponent(id)}`;
    };

    card.addEventListener("click", open);
    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") { e.preventDefault(); open(); }
    });

    const title = document.createElement("div");
    title.className = "card-title card-title-link";
    title.textContent = ev?.titulo ?? `Evento #${ev?.id ?? "?"}`;

    const desc = document.createElement("div");
    desc.className = "card-desc";
    desc.textContent = (ev?.descricao || "").trim();

    const kv = document.createElement("div");
    kv.className = "kv";
    kv.innerHTML = `
      <span>ID: ${ev?.id ?? "—"}</span>
      <span>Alocação: ${ev?.idAlocacao ?? "—"}</span>
      <span>Cap.: ${ev?.capacidade ?? "—"}</span>
      <span>Início: ${fmtDateTime(ev?.dataInicio)}</span>
      <span>Fim: ${fmtDateTime(ev?.dataFim)}</span>
    `;

    card.appendChild(title);
    if ((ev?.descricao || "").trim()) card.appendChild(desc);
    card.appendChild(kv);
    box.appendChild(card);
  });
}

function renderAlocacoes() {
  const box = document.getElementById("listaAlocacoes");
  if (!box) return;
  box.innerHTML = "";

  if (!alocacoes || alocacoes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhuma alocação cadastrada por este usuário.";
    box.appendChild(empty);
    return;
  }

  alocacoes.forEach((a) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = a?.nome ?? `Alocação #${a?.id ?? "?"}`;

    const desc = document.createElement("div");
    desc.className = "card-desc";
    desc.textContent = (a?.descricao || "").trim();

    const kv = document.createElement("div");
    kv.className = "kv";
    kv.innerHTML = `
      <span>ID: ${a?.id ?? "—"}</span>
      <span>Lotação: ${a?.lotacao ?? "—"}</span>
      <span>Lat: ${a?.latitude ?? "—"}</span>
      <span>Lng: ${a?.longitude ?? "—"}</span>
    `;

    card.appendChild(title);
    if ((a?.descricao || "").trim()) card.appendChild(desc);
    card.appendChild(kv);
    box.appendChild(card);
  });
}

function wireActions() {
  const btnSeguir = document.getElementById("btnSeguir");
  const btnMensagem = document.getElementById("btnMensagem");
  const btnAbrirPerfil = document.getElementById("btnAbrirPerfil");

  const isMe = meId && targetId && String(meId) === String(targetId);

  if (btnAbrirPerfil) btnAbrirPerfil.style.display = isMe ? "inline-flex" : "none";

  if (btnSeguir) {
    if (!meId) {
      btnSeguir.disabled = true;
      btnSeguir.title = "Entre para seguir usuários.";
    } else if (isMe) {
      btnSeguir.disabled = true;
      btnSeguir.title = "Você não pode seguir você mesmo.";
    } else {
      btnSeguir.disabled = false;
      btnSeguir.title = "";
      btnSeguir.onclick = () => {
        hideError("pageError");
        hideNotice();
        showNotice("Seguir: em breve.");
      };
    }
  }

  if (btnMensagem) {
    const email = (target?.email || "").trim();
    const tel = (target?.telefone || "").trim();

    if (!email && !tel) {
      btnMensagem.disabled = true;
      btnMensagem.title = "Sem contato cadastrado.";
    } else {
      btnMensagem.disabled = false;
      btnMensagem.title = "";
      btnMensagem.onclick = () => {
        hideError("pageError");
        hideNotice();
        if (email) return window.open(`mailto:${encodeURIComponent(email)}`, "_self");
        window.open(`tel:${encodeURIComponent(tel)}`, "_self");
      };
    }
  }
}

function openFullProfile() {
  if (!meId) return goEntrar();
  if (String(meId) === String(targetId)) return goPerfil();
  showNotice("Perfil completo: por enquanto você já está vendo a página do usuário.");
}

// fetch
async function fetchMeIfLogged() {
  if (!meId) return;
  const resp = await API.usuario(meId);
  if (isAuthOnly(resp)) return redirectToLogin();
  if (!resp.ok) return;
  me = await resp.json().catch(() => null);
}

async function fetchTarget() {
  const resp = await API.usuario(targetId);

  if (isAuthOnly(resp)) return redirectToLogin();

  if (resp.status === 404) {
    showError("pageError", "Usuário não encontrado (404).");
    return false;
  }

  if (!resp.ok) {
    const msg = await readApiError(resp);
    showError("pageError", "Falha ao carregar usuário.\n" + msg);
    return false;
  }

  target = await resp.json().catch(() => null);
  if (!target) {
    showError("pageError", "Falha ao interpretar resposta do usuário (JSON inválido).");
    return false;
  }
  return true;
}

async function fetchEventos() {
  const resp = await API.eventosDoUsuario(targetId);

  if (isAuthOnly(resp)) return redirectToLogin();

  if (!resp.ok) {
    const msg = await readApiError(resp);
    showError("pageError", "Falha ao carregar eventos.\n" + msg);
    eventos = [];
    renderEventos();
    renderCounts();
    return false;
  }

  eventos = await resp.json().catch(() => []);
  renderEventos();
  renderCounts();
  return true;
}

async function fetchAlocacoes() {
  const resp = await API.alocacoesDoUsuario(targetId);

  if (isAuthOnly(resp)) return redirectToLogin();

  if (!resp.ok) {
    const msg = await readApiError(resp);
    showError("pageError", "Falha ao carregar alocações.\n" + msg);
    alocacoes = [];
    renderAlocacoes();
    renderCounts();
    return false;
  }

  alocacoes = await resp.json().catch(() => []);
  renderAlocacoes();
  renderCounts();
  return true;
}

// start
(function init() {
  hideError("pageError");
  hideNotice();

  const raw = (qs("id") || "").trim();
  if (!/^\d+$/.test(raw) || Number(raw) <= 0) {
    showError("pageError", "URL inválida: faltou ?id={usuarioId} (numérico).");
    return;
  }
  targetId = raw;

  meId = readMeIdOptional();

  document.getElementById("tabEventos")?.classList.add("active");
  setTab("eventos");

  document.getElementById("userMenuBg")?.addEventListener("click", (e) => {
    const menu = document.getElementById("userMenu");
    if (!menu) return;
    if (!menu.contains(e.target)) toggleUserMenu(false);
  });

  (async () => {
    try {
      await fetchMeIfLogged();
      applyHeaderAndMenuAvatar();

      const ok = await fetchTarget();
      if (!ok) return;

      const isMe = meId && String(meId) === String(targetId);
      if (isMe) {
        showNotice("Você abriu seu próprio usuário. Indo para o seu perfil...");
        return goPerfil();
      }

      renderHeaderUser();
      wireActions();

      await Promise.all([fetchEventos(), fetchAlocacoes()]);
    } catch (e) {
      console.error(e);
      showError("pageError", String(e?.message || "Erro inicial ao carregar usuário."));
    }
  })();
})();
