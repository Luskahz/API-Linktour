// ============================
// CONFIG DAS ROTAS
// ============================

const API_BASE = "http://localhost:8080";

const API_EVENTOS = `${API_BASE}/eventos`;
const API_USUARIOS = `${API_BASE}/usuarios`;

// cache em memória para o feed central
let eventosCache = [];

// ============================
// INICIALIZAÇÃO
// ============================

document.addEventListener("DOMContentLoaded", () => {
    inicializarHeader();
    carregarEventos();
    carregarTopEventosRecentes();
    carregarTopUsuarios();
});

// ============================
// HEADER: BOTÃO +EVENTO E BUSCA
// ============================

function inicializarHeader() {
    // Botão + Evento
    const btnAddEvento = document.getElementById("btnAddEvento");
    if (btnAddEvento) {
        btnAddEvento.addEventListener("click", () => {
            // redireciona para a tela de CRUD de eventos
            window.location.href = "eventos.html";
        });
    }

    // Barra de busca
    const searchForm = document.getElementById("searchForm");
    const searchInput = document.getElementById("searchInput");

    if (searchForm && searchInput) {
        searchForm.addEventListener("submit", (ev) => {
            ev.preventDefault();
            const termo = searchInput.value.trim().toLowerCase();
            filtrarEventos(termo);
        });
    }
}

// ============================
// FEED CENTRAL DE EVENTOS
// ============================

async function carregarEventos() {
    const feed = document.getElementById("eventsFeed");
    if (!feed) return;

    feed.innerHTML = `<p class="lt-placeholder">Carregando eventos...</p>`;

    try {
        const resp = await fetch(API_EVENTOS);
        if (!resp.ok) {
            throw new Error(`Erro ao buscar eventos: ${resp.status}`);
        }

        const eventos = await resp.json();
        eventosCache = Array.isArray(eventos) ? eventos : [];

        const ordenados = ordenarEventosPorDataMaisRecente(eventosCache);
        renderizarFeed(ordenados);
    } catch (err) {
        console.error(err);
        feed.innerHTML = `<p class="lt-placeholder">Falha ao carregar eventos.</p>`;
    }
}

/**
 * Filtra eventos no cache pelo termo de busca (título/descrição).
 */
function filtrarEventos(termo) {
    const feed = document.getElementById("eventsFeed");
    if (!feed) return;

    if (!eventosCache.length) {
        feed.innerHTML = `<p class="lt-placeholder">Nenhum evento carregado.</p>`;
        return;
    }

    if (!termo) {
        // sem termo = lista completa novamente
        const ordenados = ordenarEventosPorDataMaisRecente(eventosCache);
        renderizarFeed(ordenados);
        return;
    }

    const filtrados = eventosCache.filter((e) => {
        const t = (e.titulo ?? "").toLowerCase();
        const d = (e.descricao ?? "").toLowerCase();
        return t.includes(termo) || d.includes(termo);
    });

    if (!filtrados.length) {
        feed.innerHTML = `<p class="lt-placeholder">Nenhum evento encontrado para essa busca.</p>`;
        return;
    }

    const ordenados = ordenarEventosPorDataMaisRecente(filtrados);
    renderizarFeed(ordenados);
}

/**
 * Renderiza uma lista de eventos no feed central.
 */
function renderizarFeed(listaEventos) {
    const feed = document.getElementById("eventsFeed");
    if (!feed) return;

    if (!Array.isArray(listaEventos) || !listaEventos.length) {
        feed.innerHTML = `<p class="lt-placeholder">Nenhum evento encontrado.</p>`;
        return;
    }

    feed.innerHTML = "";
    listaEventos.forEach((evento) => {
        const card = criarCardEvento(evento);
        feed.appendChild(card);
    });
}

/**
 * Ordena eventos por dataInicio (mais recente primeiro).
 * Usa Date no JS, mas aceita "YYYY-MM-DD" e "YYYY-MM-DDTHH:mm:ss".
 */
function ordenarEventosPorDataMaisRecente(eventos) {
    if (!Array.isArray(eventos)) return [];

    return eventos
        .slice()
        .sort((a, b) => {
            const da = parseDataIso(a.dataInicio);
            const db = parseDataIso(b.dataInicio);

            if (!da && !db) return 0;
            if (!da) return 1; // sem data vai pro fim
            if (!db) return -1;

            // mais recente primeiro
            return db - da;
        });
}

/**
 * Tenta transformar string ISO em Date.
 */
function parseDataIso(valor) {
    if (!valor || typeof valor !== "string") return null;

    const d = new Date(valor);
    return isNaN(d.getTime()) ? null : d;
}

/**
 * Cria o card visual de um evento no feed central.
 * Campos do EventoResponseDTO:
 * id, titulo, descricao, dataInicio, dataFim, capacidade, alocacaoId
 */
function criarCardEvento(e) {
    const card = document.createElement("article");
    card.className = "lt-event-card";

    const titulo = document.createElement("h3");
    titulo.textContent = e.titulo ?? "Evento sem título";

    const meta = document.createElement("div");
    meta.className = "lt-event-meta";

    const dataInicio = normalizarData(e.dataInicio);
    const dataFim = normalizarData(e.dataFim);
    const capacidade = e.capacidade ?? "N/D";

    meta.textContent = `${dataInicio} – ${dataFim} • Capacidade: ${capacidade}`;

    const desc = document.createElement("p");
    desc.className = "lt-event-desc";
    desc.textContent = e.descricao ?? "";

    card.appendChild(titulo);
    card.appendChild(meta);
    card.appendChild(desc);

    return card;
}

/**
 * Formata data "YYYY-MM-DD" ou "YYYY-MM-DDTHH:mm:ss" para "dd/MM/aaaa".
 */
function normalizarData(valor) {
    if (!valor) return "Data não informada";

    if (typeof valor === "string") {
        const apenasData = valor.split("T")[0];
        const partes = apenasData.split("-");
        if (partes.length === 3) {
            const [ano, mes, dia] = partes;
            return `${dia}/${mes}/${ano}`;
        }
        return valor;
    }

    return String(valor);
}

// ============================
// TOP 5 EVENTOS MAIS RECENTES (SIDEBAR DIREITA)
// ============================

async function carregarTopEventosRecentes() {
    const ul = document.getElementById("topEventos");
    if (!ul) return;

    ul.innerHTML = `<li class="lt-placeholder">Carregando...</li>`;

    try {
        const resp = await fetch(API_EVENTOS);
        if (!resp.ok) {
            throw new Error(`Erro ao buscar eventos (top 5): ${resp.status}`);
        }

        const eventos = await resp.json();
        const ordenados = ordenarEventosPorDataMaisRecente(eventos);
        const top5 = (Array.isArray(ordenados) ? ordenados : []).slice(0, 5);

        if (!top5.length) {
            ul.innerHTML = `<li class="lt-placeholder">Nenhum evento disponível.</li>`;
            return;
        }

        ul.innerHTML = "";
        top5.forEach((e, idx) => {
            const li = document.createElement("li");

            const titulo = e.titulo ?? "Evento sem título";
            const data = normalizarData(e.dataInicio);

            li.textContent = `${idx + 1}. ${titulo} – ${data}`;

            ul.appendChild(li);
        });
    } catch (err) {
        console.error(err);
        ul.innerHTML = `<li class="lt-placeholder">Erro ao carregar top eventos.</li>`;
    }
}

// ============================
// TOP 5 USUÁRIOS (SIDEBAR DIREITA)
// ============================

async function carregarTopUsuarios() {
    const ul = document.getElementById("topUsuarios");
    if (!ul) return;

    ul.innerHTML = `<li class="lt-placeholder">Carregando...</li>`;

    try {
        const resp = await fetch(API_USUARIOS);
        if (!resp.ok) {
            throw new Error(`Erro ao buscar usuários: ${resp.status}`);
        }

        const usuarios = await resp.json();
        const lista = (Array.isArray(usuarios) ? usuarios : []).slice(0, 5);

        if (!lista.length) {
            ul.innerHTML = `<li class="lt-placeholder">Nenhum usuário disponível.</li>`;
            return;
        }

        ul.innerHTML = "";
        lista.forEach((u, idx) => {
            const li = document.createElement("li");

            const nome =
                u.nomeCompleto ??
                u.nome ??
                u.username ??
                u.email ??
                "Usuário";

            li.textContent = `${idx + 1}. ${nome}`;

            ul.appendChild(li);
        });
    } catch (err) {
        console.error(err);
        ul.innerHTML = `<li class="lt-placeholder">Erro ao carregar top usuários.</li>`;
    }
}
