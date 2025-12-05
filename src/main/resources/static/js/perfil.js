// perfil.js
// ===== API (rotas relativas: evita CORS) =====
const API = {
  usuario: (id) => fetch(`/usuarios/${id}`),
  eventosDoUsuario: (id) => fetch(`/usuarios/${id}/eventos`),
  alocacoesDoUsuario: (id) => fetch(`/usuarios/${id}/alocacoes`),

  solicitarParceria: (id) => fetch(`/usuarios/${id}/solicitar-parceria`, { method: "POST" }),

  atualizarUsuario: (id, payload) =>
    fetch(`/usuarios/${id}/atualizar`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  criarEvento: (payload) =>
    fetch(`/publicacoes/evento`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  criarAlocacao: (payload) =>
    fetch(`/alocacoes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),
};

// ===== Auth (front-only / "ríspido") =====
function redirectToLogin() {
  sessionStorage.removeItem("linktour_user_id");
  // replace: não volta com "voltar" do navegador
  location.replace("/index.html");
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
  // 404 aqui pode significar "id inválido" para /usuarios/{id}
  return resp && (resp.status === 401 || resp.status === 403 || resp.status === 404);
}

// ===== State =====
let userId = null;
let user = null; // ComumResponseDTO
let tab = "eventos";

let eventos = [];
let alocacoes = [];

// ===== Utils =====
function qs(k) { return new URLSearchParams(location.search).get(k); }

function toLocalDateTimeStringFromNow() {
  return new Date().toISOString().slice(0, 19);
}

function toLocalDateTimeStringFromDatetimeLocal(inputValue) {
  if (!inputValue) return null;
  return inputValue.length === 16 ? (inputValue + ":00") : inputValue;
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
  } catch { return String(dt); }
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

function openModal(id) { document.getElementById(id).style.display = "grid"; }
function closeModal(id) {
  document.getElementById(id).style.display = "none";
  if (id === "modalEvento") hideError("eventoError");
  if (id === "modalAlocacao") hideError("alocError");
  if (id === "modalPerfil") hideError("perfilError");
}

// ===== UI =====
function setTab(next) {
  tab = next;

  document.getElementById("tabEventos")?.classList.toggle("active", tab === "eventos");
  document.getElementById("tabAlocacoes")?.classList.toggle("active", tab === "alocacoes");

  const le = document.getElementById("listaEventos");
  const la = document.getElementById("listaAlocacoes");
  if (le) le.style.display = (tab === "eventos") ? "flex" : "none";
  if (la) la.style.display = (tab === "alocacoes") ? "flex" : "none";

  const btn = document.getElementById("btnAdd");
  if (btn) btn.textContent = tab === "eventos" ? "+ Adicionar evento" : "+ Adicionar alocação";
}

function renderUser() {
  const nome = (user?.nomeCompleto || "—");
  const cidade = (user?.cidade || "—");

  document.getElementById("nomeCompleto").textContent = nome;
  document.getElementById("pillCidade").textContent = cidade;

  const initial = (nome && nome !== "—") ? nome.trim().charAt(0).toUpperCase() : "?";
  document.getElementById("avatar").textContent = initial;

  applyHeaderAndMenuAvatar();

  // ===== ações/parceria =====
  const p = (user?.parceiro ?? "").toString().trim().toUpperCase();
  const area = document.getElementById("parceriaArea");
  area.innerHTML = "";

  const btnEditar = document.createElement("button");
  btnEditar.className = "btn";
  btnEditar.textContent = "Editar perfil";
  btnEditar.onclick = openPerfilModal;
  area.appendChild(btnEditar);

  if (p === "" || p === "NULL") {
    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.textContent = "Solicitar parceria";
    btn.onclick = solicitarParceria;
    area.appendChild(btn);

    const info = document.createElement("span");
    info.className = "pill";
    info.textContent = "Parceiro: NÃO";
    area.appendChild(info);
    return;
  }

  if (p === "PENDENTE" || p === "SOLICITADO") {
    const warn = document.createElement("span");
    warn.className = "pill";
    warn.textContent = "Parceria pendente";
    area.appendChild(warn);
    return;
  }

  if (p === "SIM") {
    const ok = document.createElement("span");
    ok.className = "pill";
    ok.textContent = "Parceiro: SIM";
    area.appendChild(ok);
    return;
  }

  const raw = document.createElement("span");
  raw.className = "pill";
  raw.textContent = "Parceiro: " + p;
  area.appendChild(raw);
}

function renderCounts() {
  document.getElementById("countEventos").textContent = String(eventos?.length ?? 0);
  document.getElementById("countAlocacoes").textContent = String(alocacoes?.length ?? 0);
  document.getElementById("lastUpdate").textContent =
    "Atualizado: " + fmtDateTime(new Date().toISOString().slice(0, 19));
}

function renderEventos() {
  const box = document.getElementById("listaEventos");
  box.innerHTML = "";

  if (!eventos || eventos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhum evento ainda.";
    box.appendChild(empty);
    return;
  }

  eventos.forEach(ev => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = ev?.titulo ?? ("Evento #" + (ev?.id ?? "?"));

    const desc = document.createElement("div");
    desc.className = "card-desc";
    desc.textContent = ev?.descricao ?? "";

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
    if ((ev?.descricao ?? "").trim()) card.appendChild(desc);
    card.appendChild(kv);

    box.appendChild(card);
  });
}

function renderAlocacoes() {
  const box = document.getElementById("listaAlocacoes");
  box.innerHTML = "";

  if (!alocacoes || alocacoes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhuma alocação ainda.";
    box.appendChild(empty);
    return;
  }

  alocacoes.forEach(a => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = a?.nome ?? ("Alocação #" + (a?.id ?? "?"));

    const desc = document.createElement("div");
    desc.className = "card-desc";
    desc.textContent = a?.descricao ?? "";

    const kv = document.createElement("div");
    kv.className = "kv";
    kv.innerHTML = `
      <span>ID: ${a?.id ?? "—"}</span>
      <span>Lotação: ${a?.lotacao ?? "—"}</span>
      <span>Lat: ${a?.latitude ?? "—"}</span>
      <span>Lng: ${a?.longitude ?? "—"}</span>
    `;

    card.appendChild(title);
    if ((a?.descricao ?? "").trim()) card.appendChild(desc);
    card.appendChild(kv);

    box.appendChild(card);
  });
}

function openAddModal() {
  if (tab === "eventos") {
    fillAlocacoesSelect();
    document.getElementById("evTitulo").value = "";
    document.getElementById("evDescricao").value = "";
    document.getElementById("evCapacidade").value = "";
    document.getElementById("evInicio").value = "";
    document.getElementById("evFim").value = "";
    hideError("eventoError");
    openModal("modalEvento");
    return;
  }

  document.getElementById("aNome").value = "";
  document.getElementById("aDescricao").value = "";
  document.getElementById("aLotacao").value = "";
  document.getElementById("aDoc").value = "";
  document.getElementById("aFachada").value = "";
  hideError("alocError");
  openModal("modalAlocacao");
}

function fillAlocacoesSelect() {
  const sel = document.getElementById("evIdAlocacao");
  sel.innerHTML = "";

  if (!alocacoes || alocacoes.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Sem alocações (crie uma primeiro)";
    sel.appendChild(opt);
    return;
  }

  alocacoes.forEach(a => {
    const opt = document.createElement("option");
    opt.value = a.id;
    opt.textContent = `${a.nome} (id ${a.id})`;
    sel.appendChild(opt);
  });
}

// ===== Perfil (Editar) =====
function openPerfilModal() {
  hideError("perfilError");
  hideNotice();

  document.getElementById("pNomeCompleto").value = user?.nomeCompleto ?? "";
  document.getElementById("pCidade").value = user?.cidade ?? "";
  document.getElementById("pEmail").value = user?.email ?? "";
  document.getElementById("pTelefone").value = user?.telefone ?? "";
  document.getElementById("pCpf").value = user?.cpf ?? "";
  document.getElementById("pNascimento").value = user?.nascimento ?? "";
  document.getElementById("pGenero").value = user?.genero ?? "";
  document.getElementById("pPreferencias").value = user?.preferencias ?? "";

  openModal("modalPerfil");
}

function isValidEmail(v) {
  const s = String(v || "").trim();
  if (!s) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

async function salvarPerfil() {
  hideError("perfilError");
  hideError("pageError");
  hideNotice();

  const nomeCompleto = document.getElementById("pNomeCompleto").value.trim();
  const cidade = document.getElementById("pCidade").value.trim();
  const email = document.getElementById("pEmail").value.trim();

  if (!nomeCompleto || !cidade || !email) {
    showError("perfilError", "Preencha os campos obrigatórios (*).");
    return;
  }
  if (!isValidEmail(email)) {
    showError("perfilError", "Email inválido (formato).");
    return;
  }

  const nascimentoRaw = document.getElementById("pNascimento").value;

  const payload = {
    cidade: cidade || null,
    email: email || null,
    telefone: document.getElementById("pTelefone").value.trim() || null,
    cpf: document.getElementById("pCpf").value.trim() || null,
    nomeCompleto: nomeCompleto || null,
    preferencias: document.getElementById("pPreferencias").value.trim() || null,
    nascimento: nascimentoRaw || null,
    genero: document.getElementById("pGenero").value.trim() || null,
  };

  try {
    const resp = await API.atualizarUsuario(userId, payload);

    if (isAuthProblem(resp)) return redirectToLogin();

    if (!resp.ok) {
      const msg = await compactError(resp);
      showError("perfilError", "Falha ao atualizar perfil.\n" + msg);
      return;
    }

    user = await resp.json();
    closeModal("modalPerfil");
    renderUser();
    showNotice("Perfil atualizado.");
  } catch (e) {
    console.error(e);
    showError("perfilError", "Erro de rede/servidor ao atualizar perfil.");
  }
}

// ===== Actions =====
async function solicitarParceria() {
  hideError("pageError");
  hideNotice();
  try {
    const resp = await API.solicitarParceria(userId);

    if (isAuthProblem(resp)) return redirectToLogin();

    if (!resp.ok) {
      const msg = await compactError(resp);
      showError("pageError", "Falha ao solicitar parceria.\n" + msg);
      return;
    }

    user.parceiro = "PENDENTE";
    renderUser();
    showNotice("Solicitação de parceria enviada.");
  } catch (e) {
    console.error(e);
    showError("pageError", "Erro de rede/servidor ao solicitar parceria.");
  }
}

async function criarAlocacao() {
  hideError("alocError");
  hideNotice();

  const payload = {
    idUsuario: Number(userId),
    nome: document.getElementById("aNome").value.trim(),
    descricao: document.getElementById("aDescricao").value.trim(),
    endereco: document.getElementById("aEndereco").value.trim(),
    lotacao: Number(document.getElementById("aLotacao").value),
    url_documentacao: document.getElementById("aDoc").value.trim() || null,
    url_fachada: document.getElementById("aFachada").value.trim() || null,
  };

  const missing =
    !payload.idUsuario ||
    !payload.nome ||
    !payload.descricao ||
    !payload.endereco ||
    !Number.isFinite(payload.lotacao);

  if (missing) {
    showError("alocError", "Preencha os campos obrigatórios (*).");
    return;
  }

  try {
    const resp = await API.criarAlocacao(payload);

    if (isAuthProblem(resp)) return redirectToLogin();

    if (!resp.ok) {
      const msg = await compactError(resp);
      showError("alocError", "Falha ao criar alocação.\n" + msg);
      return;
    }

    closeModal("modalAlocacao");
    await refreshAlocacoes();
    renderCounts();
    if (tab === "eventos") fillAlocacoesSelect();
  } catch (e) {
    console.error(e);
    showError("alocError", "Erro de rede/servidor ao criar alocação.");
  }
}

async function criarEvento() {
  hideError("eventoError");
  hideNotice();

  if (!alocacoes || alocacoes.length === 0) {
    showError("eventoError", "Você precisa criar/ter uma alocação antes de criar um evento.");
    return;
  }

  const idAlocacao = Number(document.getElementById("evIdAlocacao").value);
  const capacidadeRaw = document.getElementById("evCapacidade").value;
  const capacidade = capacidadeRaw === "" ? null : Number(capacidadeRaw);

  const inicio = toLocalDateTimeStringFromDatetimeLocal(document.getElementById("evInicio").value);
  const fim = toLocalDateTimeStringFromDatetimeLocal(document.getElementById("evFim").value);

  const payload = {
    idUsuario: Number(userId),
    dataCriacao: toLocalDateTimeStringFromNow(),
    titulo: document.getElementById("evTitulo").value.trim(),
    descricao: document.getElementById("evDescricao").value.trim(),
    idAlocacao: Number.isFinite(idAlocacao) ? idAlocacao : null,
    capacidade: (capacidade !== null && Number.isFinite(capacidade)) ? capacidade : null,
    dataInicio: inicio,
    dataFim: fim,
  };

  const missing =
    !payload.idUsuario ||
    !payload.dataCriacao ||
    !payload.titulo || !payload.descricao ||
    !payload.idAlocacao ||
    !payload.dataInicio || !payload.dataFim;

  if (missing) {
    showError("eventoError", "Preencha os campos obrigatórios (*).");
    return;
  }

  if (payload.dataInicio > payload.dataFim) {
    showError("eventoError", "Data fim não pode ser menor que data início.");
    return;
  }

  try {
    const resp = await API.criarEvento(payload);

    if (isAuthProblem(resp)) return redirectToLogin();

    if (!resp.ok) {
      const msg = await compactError(resp);
      showError("eventoError", "Falha ao criar evento.\n" + msg);
      return;
    }

    closeModal("modalEvento");
    await refreshEventos();
    renderCounts();
  } catch (e) {
    console.error(e);
    showError("eventoError", "Erro de rede/servidor ao criar evento.");
  }
}

// ===== Data fetchers =====
async function refreshUser() {
  hideError("pageError");
  const resp = await API.usuario(userId);

  if (isAuthProblem(resp)) return redirectToLogin();

  if (!resp.ok) {
    const msg = await compactError(resp);
    showError("pageError", "Falha ao carregar usuário.\n" + msg);
    return false;
  }

  user = await resp.json();
  return true;
}

async function refreshEventos() {
  hideError("pageError");
  const resp = await API.eventosDoUsuario(userId);

  if (resp.status === 401 || resp.status === 403) return redirectToLogin();

  if (!resp.ok) {
    const msg = await compactError(resp);
    showError("pageError", "Falha ao carregar eventos.\n" + msg);
    eventos = [];
    renderEventos();
    return false;
  }

  eventos = await resp.json();
  renderEventos();
  return true;
}

async function refreshAlocacoes() {
  hideError("pageError");
  const resp = await API.alocacoesDoUsuario(userId);

  if (resp.status === 401 || resp.status === 403) return redirectToLogin();

  if (!resp.ok) {
    const msg = await compactError(resp);
    showError("pageError", "Falha ao carregar alocações.\n" + msg);
    alocacoes = [];
    renderAlocacoes();
    return false;
  }

  alocacoes = await resp.json();
  renderAlocacoes();
  return true;
}

// ===== Menu =====
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

// ===== Avatar (header + menu) =====
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
  const hdrImg = document.getElementById("hdrAvatarImg");
  const umImg = document.getElementById("umAvatarImg");
  const umName = document.getElementById("umName");
  if (!hdrImg || !umImg || !umName) return;

  const nome = (user?.nomeCompleto || "Usuário").trim() || "Usuário";
  const initial = nome.charAt(0).toUpperCase();
  const foto = (user?.fotoBase64 || "").trim();

  const src = foto ? ("data:image/png;base64," + foto) : svgAvatarDataUri(initial);
  hdrImg.src = src;
  umImg.src = src;
  umName.textContent = nome;
}

// ===== Fechar modais ao clicar no fundo =====
["modalEvento", "modalAlocacao", "modalPerfil"].forEach(id => {
  const bg = document.getElementById(id);
  if (!bg) return;
  bg.addEventListener("click", (e) => {
    if (e.target === bg) closeModal(id);
  });
});

// ===== Fechar menu clicando fora =====
document.getElementById("userMenuBg")?.addEventListener("click", (e) => {
  const menu = document.getElementById("userMenu");
  if (!menu) return;
  if (!menu.contains(e.target)) toggleUserMenu(false);
});

// ===== Start =====
(async function init() {
  userId = requireLoginOrRedirect();
  if (!userId) return;


  document.getElementById("tabEventos")?.classList.add("active");
  setTab("eventos");

  try {
    const okUser = await refreshUser();
    if (okUser) renderUser();

    await Promise.all([refreshEventos(), refreshAlocacoes()]);
    renderCounts();
  } catch (e) {
    console.error(e);
    showError("pageError", "Erro inicial ao carregar dados.");
  }
})();
