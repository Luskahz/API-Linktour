// API
const API = {
  usuario: (id) => fetch(`/usuarios/${encodeURIComponent(id)}`),
  eventosDoUsuario: (id) => fetch(`/usuarios/${encodeURIComponent(id)}/eventos`),
  alocacoesDoUsuario: (id) => fetch(`/usuarios/${encodeURIComponent(id)}/alocacoes`),

  solicitarParceria: (id) =>
    fetch(`/usuarios/${encodeURIComponent(id)}/solicitar-parceria`, { method: "POST" }),

  atualizarUsuario: (id, payload) =>
    fetch(`/usuarios/${encodeURIComponent(id)}/atualizar`, {
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

  deletarPublicacao: (idPublicacao) =>
    fetch(`/publicacoes/${encodeURIComponent(idPublicacao)}`, { method: "DELETE" }),

  deletarAlocacao: (idAlocacao) =>
    fetch(`/alocacoes/${encodeURIComponent(idAlocacao)}`, { method: "DELETE" }),

  login: (payload) =>
    fetch(`/usuarios/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }),

  deletarConta: (idUsuario) =>
    fetch(`/usuarios/${encodeURIComponent(idUsuario)}`, { method: "DELETE" }),
};

// Auth
function redirectToLogin() {
  sessionStorage.removeItem("linktour_user_id");
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

function isAuthOnly(resp) {
  return resp && (resp.status === 401 || resp.status === 403);
}

// State
let userId = null;
let user = null;

let tab = "eventos";
let eventos = [];
let alocacoes = [];

let pendingDeleteEventoId = null;
let pendingDeleteAlocacaoId = null;

// Utils
function qs(id) {
  return document.getElementById(id);
}

function pad2(n) {
  return String(n).padStart(2, "0");
}

function nowLocalDateTimeString() {
  const d = new Date();
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}T${pad2(
    d.getHours()
  )}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
}

function toLocalDateTimeStringFromDatetimeLocal(inputValue) {
  if (!inputValue) return null;
  return inputValue.length === 16 ? inputValue + ":00" : inputValue;
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

async function readApiError(resp) {
  const txt = await resp.text().catch(() => "");
  if (!txt) return `HTTP ${resp.status}`;
  try {
    const obj = JSON.parse(txt);
    const msg = obj.mensagem || obj.message || obj.error || obj.details || obj.title;
    return (msg ? String(msg) : `HTTP ${resp.status}`).slice(0, 800);
  } catch {
    return String(txt).slice(0, 800);
  }
}

function showError(id, msg) {
  const el = qs(id);
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function hideError(id) {
  const el = qs(id);
  if (!el) return;
  el.textContent = "";
  el.style.display = "none";
}

function showNotice(msg) {
  const el = qs("pageNotice");
  if (!el) return;
  el.textContent = msg;
  el.style.display = "block";
}

function hideNotice() {
  const el = qs("pageNotice");
  if (!el) return;
  el.textContent = "";
  el.style.display = "none";
}

function setBusy(btn, busy, textWhenBusy) {
  if (!btn) return;
  btn.disabled = !!busy;
  if (busy && textWhenBusy) btn.textContent = textWhenBusy;
}

function openModal(id) {
  const el = qs(id);
  if (!el) return;
  el.style.display = "grid";
}

function closeModal(id) {
  const el = qs(id);
  if (!el) return;
  el.style.display = "none";

  if (id === "modalEvento") hideError("eventoError");
  if (id === "modalAlocacao") hideError("alocError");
  if (id === "modalPerfil") hideError("perfilError");

  if (id === "modalDeleteEvento") hideError("delEventoError");
  if (id === "modalDeleteAlocacao") hideError("delAlocError");
  if (id === "modalDeleteAccount") {
    hideError("delAccError");
    const inp = qs("delAccSenha");
    if (inp) inp.value = "";
  }
}

// Tabs
function setTab(next) {
  tab = next;

  qs("tabEventos")?.classList.toggle("active", tab === "eventos");
  qs("tabAlocacoes")?.classList.toggle("active", tab === "alocacoes");

  const le = qs("listaEventos");
  const la = qs("listaAlocacoes");
  if (le) le.style.display = tab === "eventos" ? "flex" : "none";
  if (la) la.style.display = tab === "alocacoes" ? "flex" : "none";

  const btn = qs("btnAdd");
  if (btn) btn.textContent = tab === "eventos" ? "+ Adicionar evento" : "+ Adicionar alocação";
}

// Avatar
function escapeXml(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&apos;",
  }[c]));
}

function svgAvatarDataUri(initial) {
  const ch = escapeXml((initial || "?").toString().slice(0, 1).toUpperCase());
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect x="0" y="0" width="100" height="100" rx="50" ry="50" fill="white"/>
  <text x="50" y="52" text-anchor="middle" dominant-baseline="middle"
        font-family="Arial, sans-serif" font-size="56" font-weight="900"
        fill="black" stroke="black" stroke-width="1.2" paint-order="stroke">${ch}</text>
</svg>`;
  const b64 = btoa(unescape(encodeURIComponent(svg)));
  return "data:image/svg+xml;base64," + b64;
}

function applyHeaderAndMenuAvatar() {
  const hdrImg = qs("hdrAvatarImg");
  const umImg = qs("umAvatarImg");
  const umName = qs("umName");
  if (!hdrImg || !umImg || !umName) return;

  const nome = (user?.nomeCompleto || "Usuário").trim() || "Usuário";
  const initial = nome.charAt(0).toUpperCase();
  const foto = (user?.fotoBase64 || "").trim();

  const src = foto ? "data:image/png;base64," + foto : svgAvatarDataUri(initial);
  hdrImg.src = src;
  umImg.src = src;
  umName.textContent = nome;
}

// Render
function renderUser() {
  const nome = user?.nomeCompleto || "—";
  const cidade = user?.cidade || "—";

  if (qs("nomeCompleto")) qs("nomeCompleto").textContent = nome;
  if (qs("pillCidade")) qs("pillCidade").textContent = cidade;

  const avatarEl = qs("avatar");
  if (avatarEl) {
    const initial = nome && nome !== "—" ? nome.trim().charAt(0).toUpperCase() : "?";
    avatarEl.textContent = initial;
  }

  applyHeaderAndMenuAvatar();

  const area = qs("parceriaArea");
  if (!area) return;
  area.innerHTML = "";

  const btnEditar = document.createElement("button");
  btnEditar.className = "btn";
  btnEditar.type = "button";
  btnEditar.textContent = "Editar perfil";
  btnEditar.onclick = openPerfilModal;
  area.appendChild(btnEditar);

  const p = String(user?.parceiro ?? "").trim().toUpperCase();

  if (p === "" || p === "NULL") {
    const btn = document.createElement("button");
    btn.className = "btn primary";
    btn.type = "button";
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
  if (qs("countEventos")) qs("countEventos").textContent = String(eventos?.length ?? 0);
  if (qs("countAlocacoes")) qs("countAlocacoes").textContent = String(alocacoes?.length ?? 0);
  if (qs("lastUpdate")) qs("lastUpdate").textContent = "Atualizado: " + fmtDateTime(nowLocalDateTimeString());
}

function renderEventos() {
  const box = qs("listaEventos");
  if (!box) return;
  box.innerHTML = "";

  if (!eventos || eventos.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhum evento ainda.";
    box.appendChild(empty);
    return;
  }

  eventos.forEach((ev) => {
    const card = document.createElement("div");
    card.className = "card";

    const title = document.createElement("div");
    title.className = "card-title";
    title.textContent = ev?.titulo ?? `Evento #${ev?.id ?? "?"}`;

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

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const btnAbrir = document.createElement("button");
    btnAbrir.className = "btn";
    btnAbrir.type = "button";
    btnAbrir.textContent = "Abrir";
    btnAbrir.onclick = () => (location.href = `./evento.html?id=${encodeURIComponent(ev?.id ?? "")}`);

    const btnDel = document.createElement("button");
    btnDel.className = "btn danger";
    btnDel.type = "button";
    btnDel.textContent = "Excluir";
    btnDel.onclick = () => openDeleteEventoModal(ev);

    actions.appendChild(btnAbrir);
    actions.appendChild(btnDel);

    card.appendChild(title);
    if ((ev?.descricao ?? "").trim()) card.appendChild(desc);
    card.appendChild(kv);
    card.appendChild(actions);

    box.appendChild(card);
  });
}

function renderAlocacoes() {
  const box = qs("listaAlocacoes");
  if (!box) return;
  box.innerHTML = "";

  if (!alocacoes || alocacoes.length === 0) {
    const empty = document.createElement("div");
    empty.className = "empty";
    empty.textContent = "Nenhuma alocação ainda.";
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
    desc.textContent = a?.descricao ?? "";

    const kv = document.createElement("div");
    kv.className = "kv";
    kv.innerHTML = `
      <span>ID: ${a?.id ?? "—"}</span>
      <span>Lotação: ${a?.lotacao ?? "—"}</span>
      <span>Lat: ${a?.latitude ?? "—"}</span>
      <span>Lng: ${a?.longitude ?? "—"}</span>
    `;

    const actions = document.createElement("div");
    actions.className = "card-actions";

    const btnDel = document.createElement("button");
    btnDel.className = "btn danger";
    btnDel.type = "button";
    btnDel.textContent = "Excluir";
    btnDel.onclick = () => openDeleteAlocacaoModal(a);

    actions.appendChild(btnDel);

    card.appendChild(title);
    if ((a?.descricao ?? "").trim()) card.appendChild(desc);
    card.appendChild(kv);
    card.appendChild(actions);

    box.appendChild(card);
  });
}

// Modal: adicionar
function openAddModal() {
  if (tab === "eventos") {
    fillAlocacoesSelect();

    qs("evTitulo").value = "";
    qs("evDescricao").value = "";
    qs("evCapacidade").value = "";
    qs("evInicio").value = "";
    qs("evFim").value = "";

    hideError("eventoError");
    openModal("modalEvento");
    return;
  }

  qs("aNome").value = "";
  qs("aDescricao").value = "";
  qs("aEndereco").value = "";
  qs("aLotacao").value = "";
  qs("aDoc").value = "";
  qs("aFachada").value = "";

  hideError("alocError");
  openModal("modalAlocacao");
}

function fillAlocacoesSelect() {
  const sel = qs("evIdAlocacao");
  if (!sel) return;
  sel.innerHTML = "";

  if (!alocacoes || alocacoes.length === 0) {
    const opt = document.createElement("option");
    opt.value = "";
    opt.textContent = "Sem alocações (crie uma primeiro)";
    sel.appendChild(opt);
    return;
  }

  alocacoes.forEach((a) => {
    const opt = document.createElement("option");
    opt.value = String(a.id);
    opt.textContent = `${a.nome} (id ${a.id})`;
    sel.appendChild(opt);
  });
}

// Modal: perfil
function openPerfilModal() {
  hideError("perfilError");
  hideNotice();

  qs("pNomeCompleto").value = user?.nomeCompleto ?? "";
  qs("pCidade").value = user?.cidade ?? "";
  qs("pEmail").value = user?.email ?? "";
  qs("pTelefone").value = user?.telefone ?? "";
  qs("pCpf").value = user?.cpf ?? "";
  qs("pNascimento").value = user?.nascimento ?? "";
  qs("pGenero").value = user?.genero ?? "";
  qs("pPreferencias").value = user?.preferencias ?? "";

  openModal("modalPerfil");
}

function isValidEmail(v) {
  const s = String(v || "").trim();
  return !!s && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

function normalizeCpf(v) {
  return String(v || "").replace(/\D+/g, "");
}

function isValidCpfBasic(v) {
  const cpf = normalizeCpf(v);
  if (!cpf) return true;
  if (cpf.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(cpf)) return false;
  return true;
}

// Ações: perfil
async function salvarPerfil() {
  hideError("perfilError");
  hideError("pageError");
  hideNotice();

  const nomeCompleto = qs("pNomeCompleto").value.trim();
  const cidade = qs("pCidade").value.trim();
  const email = qs("pEmail").value.trim();

  if (!nomeCompleto || !cidade || !email) {
    showError("perfilError", "Preencha os campos obrigatórios (*).");
    return;
  }
  if (!isValidEmail(email)) {
    showError("perfilError", "Email inválido.");
    return;
  }

  const cpfRaw = qs("pCpf").value.trim();
  if (!isValidCpfBasic(cpfRaw)) {
    showError("perfilError", "CPF inválido.");
    return;
  }

  const payload = {
    cidade: cidade || null,
    email: email || null,
    telefone: qs("pTelefone").value.trim() || null,
    cpf: cpfRaw ? normalizeCpf(cpfRaw) : null,
    nomeCompleto: nomeCompleto || null,
    preferencias: qs("pPreferencias").value.trim() || null,
    nascimento: qs("pNascimento").value || null,
    genero: qs("pGenero").value.trim() || null,
  };

  try {
    const resp = await API.atualizarUsuario(userId, payload);

    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      showError("perfilError", await readApiError(resp));
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

async function solicitarParceria() {
  hideError("pageError");
  hideNotice();

  try {
    const resp = await API.solicitarParceria(userId);

    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      showError("pageError", await readApiError(resp));
      return;
    }

    user.parceiro = "SOLICITADO";
    renderUser();
    showNotice("Solicitação de parceria enviada.");
  } catch (e) {
    console.error(e);
    showError("pageError", "Erro de rede/servidor ao solicitar parceria.");
  }
}

// Ações: criar
async function criarAlocacao() {
  hideError("alocError");
  hideNotice();

  const payload = {
    idUsuario: Number(userId),
    nome: qs("aNome").value.trim(),
    descricao: qs("aDescricao").value.trim(),
    endereco: qs("aEndereco").value.trim(),
    lotacao: Number(qs("aLotacao").value),
    url_documentacao: qs("aDoc").value.trim() || null,
    url_fachada: qs("aFachada").value.trim() || null,
  };

  const invalid =
    !Number.isFinite(payload.idUsuario) || payload.idUsuario <= 0 ||
    !payload.nome || !payload.descricao || !payload.endereco ||
    !Number.isInteger(payload.lotacao) || payload.lotacao <= 0;

  if (invalid) {
    showError("alocError", "Preencha os campos obrigatórios (*) com valores válidos.");
    return;
  }

  try {
    const resp = await API.criarAlocacao(payload);

    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      showError("alocError", await readApiError(resp));
      return;
    }

    closeModal("modalAlocacao");
    await refreshAlocacoes();
    renderCounts();
    if (tab === "eventos") fillAlocacoesSelect();
    showNotice("Alocação criada.");
  } catch (e) {
    console.error(e);
    showError("alocError", "Erro de rede/servidor ao criar alocação.");
  }
}

async function criarEvento() {
  hideError("eventoError");
  hideNotice();

  if (!alocacoes || alocacoes.length === 0) {
    showError("eventoError", "Você precisa criar uma alocação antes de criar um evento.");
    return;
  }

  const idAlocacao = Number(qs("evIdAlocacao").value);
  const capacidadeRaw = qs("evCapacidade").value;
  const capacidade = capacidadeRaw === "" ? null : Number(capacidadeRaw);

  const dataInicio = toLocalDateTimeStringFromDatetimeLocal(qs("evInicio").value);
  const dataFim = toLocalDateTimeStringFromDatetimeLocal(qs("evFim").value);

  const payload = {
    idUsuario: Number(userId),
    dataCriacao: nowLocalDateTimeString(),
    titulo: qs("evTitulo").value.trim(),
    descricao: qs("evDescricao").value.trim(),
    idAlocacao: Number.isFinite(idAlocacao) ? idAlocacao : null,
    capacidade: capacidade === null ? null : (Number.isFinite(capacidade) ? capacidade : null),
    dataInicio,
    dataFim,
  };

  const invalid =
    !Number.isFinite(payload.idUsuario) || payload.idUsuario <= 0 ||
    !payload.dataCriacao ||
    !payload.titulo || !payload.descricao ||
    !Number.isFinite(payload.idAlocacao) || payload.idAlocacao <= 0 ||
    !payload.dataInicio || !payload.dataFim;

  if (invalid) {
    showError("eventoError", "Preencha os campos obrigatórios (*) com valores válidos.");
    return;
  }

  if (payload.capacidade !== null) {
    if (!Number.isInteger(payload.capacidade) || payload.capacidade < 0) {
      showError("eventoError", "Capacidade inválida.");
      return;
    }
    const a = alocacoes.find((x) => Number(x?.id) === Number(payload.idAlocacao));
    const lot = Number(a?.lotacao);
    if (Number.isFinite(lot) && payload.capacidade > lot) {
      showError("eventoError", "Capacidade do evento excede a lotação da alocação.");
      return;
    }
  }

  if (payload.dataInicio > payload.dataFim) {
    showError("eventoError", "Data fim não pode ser menor que data início.");
    return;
  }

  try {
    const resp = await API.criarEvento(payload);

    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      showError("eventoError", await readApiError(resp));
      return;
    }

    closeModal("modalEvento");
    await refreshEventos();
    renderCounts();
    showNotice("Evento criado.");
  } catch (e) {
    console.error(e);
    showError("eventoError", "Erro de rede/servidor ao criar evento.");
  }
}

// Ações: deletar
function openDeleteEventoModal(ev) {
  pendingDeleteEventoId = ev?.id ?? null;

  hideError("delEventoError");
  const hint = qs("delEventoHint");
  if (hint) hint.textContent = `Excluir: ${ev?.titulo ?? "Evento"} (id ${pendingDeleteEventoId ?? "—"})`;

  const btn = qs("btnConfirmDeleteEvento");
  if (btn) {
    btn.onclick = confirmDeleteEvento;
    btn.textContent = "Excluir";
    btn.disabled = false;
  }

  openModal("modalDeleteEvento");
}

async function confirmDeleteEvento() {
  hideError("delEventoError");
  hideNotice();

  if (!pendingDeleteEventoId) {
    showError("delEventoError", "Evento inválido para exclusão.");
    return;
  }

  const btn = qs("btnConfirmDeleteEvento");
  setBusy(btn, true, "Excluindo...");

  try {
    const resp = await API.deletarPublicacao(pendingDeleteEventoId);

    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      showError("delEventoError", await readApiError(resp));
      setBusy(btn, false, "Excluir");
      return;
    }

    closeModal("modalDeleteEvento");
    pendingDeleteEventoId = null;

    await refreshEventos();
    renderCounts();
    showNotice("Evento excluído.");
  } catch (e) {
    console.error(e);
    showError("delEventoError", "Erro de rede/servidor ao excluir evento.");
    setBusy(btn, false, "Excluir");
  }
}

function openDeleteAlocacaoModal(a) {
  pendingDeleteAlocacaoId = a?.id ?? null;

  hideError("delAlocError");
  const hint = qs("delAlocHint");
  if (hint) hint.textContent = `Excluir: ${a?.nome ?? "Alocação"} (id ${pendingDeleteAlocacaoId ?? "—"}).`;

  const btn = qs("btnConfirmDeleteAlocacao");
  if (btn) {
    btn.onclick = confirmDeleteAlocacao;
    btn.textContent = "Excluir";
    btn.disabled = false;
  }

  openModal("modalDeleteAlocacao");
}

async function confirmDeleteAlocacao() {
  hideError("delAlocError");
  hideNotice();

  if (!pendingDeleteAlocacaoId) {
    showError("delAlocError", "Alocação inválida para exclusão.");
    return;
  }

  const btn = qs("btnConfirmDeleteAlocacao");
  setBusy(btn, true, "Excluindo...");

  try {
    const resp = await API.deletarAlocacao(pendingDeleteAlocacaoId);

    if (isAuthOnly(resp)) return redirectToLogin();

    if (!resp.ok) {
      showError("delAlocError", await readApiError(resp));
      setBusy(btn, false, "Excluir");
      return;
    }

    closeModal("modalDeleteAlocacao");
    pendingDeleteAlocacaoId = null;

    await refreshAlocacoes();
    renderCounts();
    if (tab === "eventos") fillAlocacoesSelect();
    showNotice("Alocação excluída.");
  } catch (e) {
    console.error(e);
    showError("delAlocError", "Erro de rede/servidor ao excluir alocação.");
    setBusy(btn, false, "Excluir");
  }
}

async function confirmDeleteAccount() {
  hideError("delAccError");
  hideError("pageError");
  hideNotice();

  const senha = (qs("delAccSenha")?.value || "").trim();
  if (!senha) {
    showError("delAccError", "Informe sua senha.");
    return;
  }

  const btn = qs("btnConfirmDeleteAccount");
  setBusy(btn, true, "Excluindo...");

  try {
    const email = String(user?.email || "").trim();
    if (!email) {
      showError("delAccError", "Não foi possível validar a conta: email ausente no perfil.");
      setBusy(btn, false, "Excluir conta");
      return;
    }

    const rLogin = await API.login({ email, senha });

    if (isAuthOnly(rLogin)) return redirectToLogin();

    if (!rLogin.ok) {
      showError("delAccError", (await readApiError(rLogin)) || "Senha inválida.");
      setBusy(btn, false, "Excluir conta");
      return;
    }

    const rDel = await API.deletarConta(userId);

    if (isAuthOnly(rDel)) return redirectToLogin();

    if (!rDel.ok) {
      showError("delAccError", await readApiError(rDel));
      setBusy(btn, false, "Excluir conta");
      return;
    }

    sessionStorage.removeItem("linktour_user_id");
    location.replace("/index.html");
  } catch (e) {
    console.error(e);
    showError("delAccError", "Erro de rede/servidor ao excluir conta.");
    setBusy(btn, false, "Excluir conta");
  }
}

// Fetch
async function refreshUser() {
  hideError("pageError");

  const resp = await API.usuario(userId);

  if (isAuthOnly(resp)) return redirectToLogin();
  if (resp.status === 404) return redirectToLogin();

  if (!resp.ok) {
    showError("pageError", await readApiError(resp));
    return false;
  }

  user = await resp.json();
  return true;
}

async function refreshEventos() {
  hideError("pageError");

  const resp = await API.eventosDoUsuario(userId);

  if (isAuthOnly(resp)) return redirectToLogin();

  if (!resp.ok) {
    showError("pageError", await readApiError(resp));
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

  if (isAuthOnly(resp)) return redirectToLogin();

  if (!resp.ok) {
    showError("pageError", await readApiError(resp));
    alocacoes = [];
    renderAlocacoes();
    return false;
  }

  alocacoes = await resp.json();
  renderAlocacoes();
  return true;
}

// Menu
function toggleUserMenu(force) {
  const bg = qs("userMenuBg");
  const menu = qs("userMenu");
  if (!bg || !menu) return;

  const isOpen = bg.style.display === "grid";
  const next = typeof force === "boolean" ? force : !isOpen;

  bg.style.display = next ? "grid" : "none";
}

function logout() {
  toggleUserMenu(false);
  if (!confirm("Realmente deseja sair?")) return;
  redirectToLogin();
}

// Wiring
function wireModalBackdropClose(id) {
  const bg = qs(id);
  if (!bg) return;
  bg.addEventListener("click", (e) => {
    if (e.target === bg) closeModal(id);
  });
}

function wireUserMenuBackdropClose() {
  qs("userMenuBg")?.addEventListener("click", (e) => {
    const menu = qs("userMenu");
    if (!menu) return;
    if (!menu.contains(e.target)) toggleUserMenu(false);
  });
}

function wireDeleteAccountButton() {
  const btn = qs("btnConfirmDeleteAccount");
  if (btn) btn.onclick = confirmDeleteAccount;
}

// Init
(async function init() {
  userId = requireLoginOrRedirect();
  if (!userId) return;

  setTab("eventos");

  wireModalBackdropClose("modalEvento");
  wireModalBackdropClose("modalAlocacao");
  wireModalBackdropClose("modalPerfil");
  wireModalBackdropClose("modalDeleteEvento");
  wireModalBackdropClose("modalDeleteAlocacao");
  wireModalBackdropClose("modalDeleteAccount");

  wireUserMenuBackdropClose();
  wireDeleteAccountButton();

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
