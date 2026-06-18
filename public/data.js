window.PescaGoData = (() => {
  const rivers = [
    { id: "guapore", name: "Rio Guapore", city: "Costa Marques", species: ["tucunaré", "pirarara", "cachara"], season: "Junho a outubro", difficulty: "Moderada" },
    { id: "machado", name: "Rio Machado", city: "Ji-Parana", species: ["tucunaré", "jatuarana", "pintado"], season: "Maio a setembro", difficulty: "Facil" },
    { id: "madeira", name: "Rio Madeira", city: "Porto Velho", species: ["dourada", "piramutaba", "tambaqui"], season: "Julho a novembro", difficulty: "Avancada" },
    { id: "mamore", name: "Rio Mamore", city: "Guajara-Mirim", species: ["tucunaré", "pacu", "surubim"], season: "Junho a outubro", difficulty: "Moderada" },
    { id: "roosevelt", name: "Rio Roosevelt", city: "Alta Floresta d'Oeste", species: ["tucunaré", "trairao", "pirarara"], season: "Agosto a novembro", difficulty: "Avancada" }
  ];

  const providers = [
    { id: 1, name: "Marcos Tavares", role: "Guia especialista", river: "guapore", rating: 4.9, reviews: 127, distance: 3.2, price: 680, response: "~ 4 min", verified: true, initials: "MT", services: ["Guia", "Barco com motor", "Iscas"], available: true },
    { id: 2, name: "Ana Ribeiro", role: "Piloteira profissional", river: "machado", rating: 4.8, reviews: 89, distance: 6.4, price: 520, response: "~ 8 min", verified: true, initials: "AR", services: ["Piloteiro", "Barco com motor"], available: true },
    { id: 3, name: "Expedicao Madeira", role: "Operadora de pesca", river: "madeira", rating: 4.7, reviews: 64, distance: 12.1, price: 1190, response: "~ 12 min", verified: true, initials: "EM", services: ["Pacote completo", "Transporte", "Alimentacao"], available: true },
    { id: 4, name: "Paulo Nunes", role: "Guia e piloteiro", river: "mamore", rating: 4.9, reviews: 102, distance: 4.8, price: 740, response: "~ 5 min", verified: true, initials: "PN", services: ["Guia", "Piloteiro", "Equipamentos"], available: true }
  ];

  const initialRequests = [
    { id: "PG-2408", client: "Lucas Almeida", providerId: 1, river: "guapore", date: "2026-07-18", people: 2, service: "Pacote completo", value: 1360, status: "proposta" }
  ];
  const initialMessages = [
    { id: 1, requestId: "PG-2408", from: "provider", text: "Ola, Lucas! O barco e os coletes estao incluidos. Podemos sair as 6h?", at: "14:12" }
  ];

  function read(key, fallback) {
    try { return JSON.parse(localStorage.getItem(key)) || fallback; } catch { return fallback; }
  }

  function write(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
    return value;
  }

  async function request(path, options = {}) {
    const url = new URL(path, location.origin);
    const method = options.method || "GET";
    const body = options.body ? JSON.parse(options.body) : {};
    let requests = read("pesca-go-requests", initialRequests);
    let messages = read("pesca-go-messages", initialMessages);

    if (method === "GET" && url.pathname === "/api/rivers") return rivers;
    if (method === "GET" && url.pathname === "/api/providers") {
      const river = url.searchParams.get("river");
      return providers.filter(item => item.available && (!river || item.river === river));
    }
    if (method === "GET" && url.pathname === "/api/requests") return requests;
    if (method === "POST" && url.pathname === "/api/requests") {
      const created = { id: `PG-${2408 + requests.length}`, status: "solicitada", createdAt: new Date().toISOString(), ...body };
      write("pesca-go-requests", [...requests, created]);
      return created;
    }
    const statusMatch = url.pathname.match(/^\/api\/requests\/([^/]+)\/status$/);
    if (method === "PATCH" && statusMatch) {
      requests = requests.map(item => item.id === statusMatch[1] ? { ...item, status: body.status || item.status } : item);
      write("pesca-go-requests", requests);
      return requests.find(item => item.id === statusMatch[1]);
    }
    if (method === "GET" && url.pathname === "/api/messages") {
      const requestId = url.searchParams.get("requestId");
      return messages.filter(item => !requestId || item.requestId === requestId);
    }
    if (method === "POST" && url.pathname === "/api/messages") {
      const created = { id: messages.length + 1, from: "client", at: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), ...body };
      write("pesca-go-messages", [...messages, created]);
      return created;
    }
    throw new Error("Recurso nao encontrado.");
  }

  return { request };
})();
