const state = { rivers: [], providers: [], selectedRiver: "guapore", selectedService: "Pacote completo", selectedProvider: null, date: "2026-07-18", people: 2 };

const $ = selector => document.querySelector(selector);
const $$ = selector => [...document.querySelectorAll(selector)];
const money = value => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value);

const riverImages = {
  guapore: "radial-gradient(circle at 78% 22%,rgba(217,240,111,.32) 0 5%,transparent 6%),linear-gradient(145deg,rgba(5,44,41,.25),rgba(5,44,41,.8)),repeating-linear-gradient(165deg,#4c8876 0 18px,#367362 18px 32px,#1e5a50 32px 56px)",
  machado: "radial-gradient(ellipse at 30% 70%,#79bec0 0 10%,transparent 11%),linear-gradient(145deg,rgba(5,44,41,.12),rgba(5,44,41,.78)),repeating-linear-gradient(28deg,#69a17d 0 14px,#316c58 14px 31px,#1d534a 31px 50px)",
  madeira: "radial-gradient(ellipse at 60% 42%,#83b8b5 0 12%,transparent 13%),linear-gradient(160deg,rgba(6,48,44,.18),rgba(4,37,34,.84)),repeating-linear-gradient(150deg,#567c65 0 20px,#325f4f 20px 37px,#19473f 37px 55px)",
  mamore: "radial-gradient(ellipse at 42% 55%,#78bfc4 0 9%,transparent 10%),linear-gradient(140deg,rgba(8,60,55,.15),rgba(5,49,45,.82)),repeating-linear-gradient(38deg,#6d9e74 0 16px,#3d735c 16px 34px,#23544a 34px 52px)",
  roosevelt: "radial-gradient(ellipse at 70% 40%,#79b8b0 0 11%,transparent 12%),linear-gradient(150deg,rgba(8,60,55,.08),rgba(5,49,45,.84)),repeating-linear-gradient(160deg,#608b6e 0 18px,#396b56 18px 35px,#204d43 35px 54px)"
};

async function api(path, options = {}) {
  return window.PescaGoData.request(path, options);
}

function showView(name) {
  $$(".view").forEach(view => view.classList.toggle("active", view.id === `${name}-view`));
  $$('[data-view]').forEach(button => button.classList.toggle("active", button.dataset.view === name));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function renderRivers(limit = 3) {
  const grid = $("#river-grid");
  grid.innerHTML = state.rivers.slice(0, limit).map((river, index) => `
    <button class="river-card" data-river="${river.id}" style="--river-image:${riverImages[river.id]}">
      <div class="river-card-content">
        <span class="river-tag">${index === 0 ? "MAIS PROCURADO" : river.difficulty.toUpperCase()}</span>
        <div class="river-meta"><div><h3>${river.name}</h3><p>${river.city}, Rondonia</p></div><span class="river-rating">★ ${index === 0 ? "4,9" : "4,8"}</span></div>
        <div class="fish-tags">${river.species.slice(0, 3).map(fish => `<span>${fish}</span>`).join("")}</div>
      </div>
    </button>`).join("");
  $$(".river-card").forEach(card => card.addEventListener("click", () => searchProviders(card.dataset.river)));
}

function renderProviders(items) {
  $("#provider-list").innerHTML = items.length ? items.map(provider => `
    <article class="provider-card">
      <div class="provider-avatar large">${provider.initials}</div>
      <div><h3>${provider.name} <span class="verified">✓ verificado</span></h3><span class="role">${provider.role}</span>
        <div class="provider-stats"><span><b>★ ${String(provider.rating).replace(".", ",")}</b> (${provider.reviews})</span><span><b>${provider.distance} km</b> de distancia</span><span>Responde em <b>${provider.response}</b></span></div>
        <div class="provider-services">${provider.services.map(service => `<span>${service}</span>`).join("")}</div>
      </div>
      <div class="provider-price"><div><small>A PARTIR DE</small><b>${money(provider.price)}</b><small>por diaria</small></div><button class="primary-button booking-button" data-provider="${provider.id}">Solicitar</button></div>
    </article>`).join("") : `<div class="empty-card"><h3>Nenhum parceiro neste filtro</h3><p>Tente outro rio para ver mais opcoes.</p></div>`;
  $("#map-pins").innerHTML = items.map((item, index) => `<div class="map-pin" style="left:${22 + (index * 17) % 58}%;top:${22 + (index * 21) % 56}%"><span>${item.initials}</span></div>`).join("");
  $$(".booking-button").forEach(button => button.addEventListener("click", () => openBooking(Number(button.dataset.provider))));
}

async function searchProviders(riverId = $("#river-select").value || state.selectedRiver) {
  state.selectedRiver = riverId;
  state.date = $("#date-input").value || state.date;
  state.people = Number($("#people-select").value || 2);
  const river = state.rivers.find(item => item.id === riverId);
  $("#results-title").textContent = river ? `Pesca em ${river.name}` : "Parceiros disponiveis";
  $("#results-subtitle").textContent = `${state.date.split("-").reverse().join("/")} · ${state.people} pescadores · ${state.selectedService}`;
  state.providers = await api(`/api/providers${riverId ? `?river=${riverId}` : ""}`);
  if (!state.providers.length) state.providers = await api("/api/providers");
  renderProviders(state.providers);
  showView("results");
}

function openBooking(providerId) {
  state.selectedProvider = state.providers.find(item => item.id === providerId);
  const river = state.rivers.find(item => item.id === state.selectedRiver);
  $("#booking-provider").textContent = `Envie os detalhes para ${state.selectedProvider.name}.`;
  $("#booking-summary").innerHTML = `
    <div class="summary-row"><span>Destino</span><b>${river?.name || "Rondonia"}</b></div>
    <div class="summary-row"><span>Data e grupo</span><b>${state.date.split("-").reverse().join("/")} · ${state.people} pessoas</b></div>
    <div class="summary-row"><span>Servico</span><b>${state.selectedService}</b></div>
    <div class="summary-row"><span>Valor estimado</span><b>${money(state.selectedProvider.price * state.people)}</b></div>`;
  $("#booking-modal").classList.remove("hidden");
}

function toast(title, message) {
  $("#toast-title").textContent = title; $("#toast-message").textContent = message;
  $("#toast").classList.remove("hidden");
  clearTimeout(window.toastTimer); window.toastTimer = setTimeout(() => $("#toast").classList.add("hidden"), 3800);
}

async function loadMessages() {
  const messages = await api("/api/messages?requestId=PG-2408");
  $("#messages").innerHTML = messages.map(message => `<div class="message ${message.from === "client" ? "client" : ""}">${message.text}<small>${message.at}</small></div>`).join("");
  $("#messages").scrollTop = $("#messages").scrollHeight;
}

async function init() {
  state.rivers = await api("/api/rivers");
  $("#river-select").innerHTML += state.rivers.map(river => `<option value="${river.id}">${river.name} · ${river.city}</option>`).join("");
  $("#date-input").value = state.date;
  $("#date-input").min = new Date().toISOString().slice(0, 10);
  renderRivers();

  $$('[data-view]').forEach(button => button.addEventListener("click", () => showView(button.dataset.view)));
  $("#search-form").addEventListener("submit", event => { event.preventDefault(); searchProviders(); });
  $$(".quick-card").forEach(card => card.addEventListener("click", () => { state.selectedService = card.dataset.service; searchProviders(); }));
  $("#all-rivers").addEventListener("click", () => { renderRivers(state.rivers.length); $("#all-rivers").classList.add("hidden"); });
  $$(".modal-close").forEach(button => button.addEventListener("click", () => $("#" + button.dataset.close).classList.add("hidden")));
  $$(".modal-backdrop").forEach(backdrop => backdrop.addEventListener("click", event => { if (event.target === backdrop) backdrop.classList.add("hidden"); }));

  $("#confirm-booking").addEventListener("click", async () => {
    const river = state.rivers.find(item => item.id === state.selectedRiver);
    await api("/api/requests", { method: "POST", body: JSON.stringify({ client: "Lucas Almeida", providerId: state.selectedProvider.id, river: state.selectedRiver, date: state.date, people: state.people, service: state.selectedService, value: state.selectedProvider.price * state.people, message: $("#booking-message").value }) });
    $("#booking-modal").classList.add("hidden"); toast("Solicitacao enviada!", `${state.selectedProvider.name} recebeu seu pedido para ${river.name}.`); showView("trips");
  });
  $("#open-chat").addEventListener("click", async () => { $("#chat-modal").classList.remove("hidden"); await loadMessages(); });
  $("#chat-form").addEventListener("submit", async event => {
    event.preventDefault(); const input = $("#chat-message"); if (!input.value.trim()) return;
    await api("/api/messages", { method: "POST", body: JSON.stringify({ requestId: "PG-2408", text: input.value.trim() }) }); input.value = ""; await loadMessages();
  });
  $("#accept-proposal").addEventListener("click", async () => { await api("/api/requests/PG-2408/status", { method: "PATCH", body: JSON.stringify({ status: "confirmada" }) }); $(".trip-status span").textContent = "RESERVA CONFIRMADA"; $(".trip-status span").style.background = "#daf3ea"; $(".trip-status span").style.color = "#14725e"; toast("Reserva confirmada!", "Marcos foi avisado. Agora e so combinar os detalhes."); });
  $("#decline-proposal").addEventListener("click", () => { $("#trip-card").classList.add("hidden"); $("#trip-empty").classList.remove("hidden"); toast("Proposta recusada", "Nenhuma cobranca foi realizada."); });
  $("#provider-accept").addEventListener("click", event => { event.currentTarget.textContent = "Aceita ✓"; event.currentTarget.disabled = true; toast("Solicitacao aceita!", "Lucas recebeu a confirmacao e ja pode conversar com voce."); });
  $("#approve-provider").addEventListener("click", event => { event.currentTarget.textContent = "Parceiro aprovado ✓"; event.currentTarget.disabled = true; $("#approval-card .request-new").textContent = "APROVADO"; toast("Cadastro aprovado!", "Amazon Fish Turismo ja pode aparecer nas buscas."); });
  $("#notification-button").addEventListener("click", () => toast("1 nova notificacao", "Marcos enviou uma proposta para sua pesca no Guapore."));
}

init().catch(error => toast("Ops, algo deu errado", error.message));

let installPrompt;
const installButton = $("#install-app");
const isStandalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);

if ("serviceWorker" in navigator) window.addEventListener("load", () => navigator.serviceWorker.register("/sw.js"));

window.addEventListener("beforeinstallprompt", event => {
  event.preventDefault();
  installPrompt = event;
  if (!isStandalone) installButton.classList.remove("hidden");
});

if (isIos && !isStandalone) installButton.classList.remove("hidden");

installButton.addEventListener("click", async () => {
  if (installPrompt) {
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installButton.classList.add("hidden");
    return;
  }
  toast("Instalar no iPhone", "No Safari, toque em Compartilhar e depois em Adicionar a Tela de Inicio.");
});

window.addEventListener("appinstalled", () => {
  installButton.classList.add("hidden");
  toast("Pesca GO instalado!", "O aplicativo foi adicionado ao seu celular.");
});
