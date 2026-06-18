const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { URL } = require("node:url");

const PORT = Number(process.env.PORT || 4173);
const PUBLIC_DIR = path.join(__dirname, "public");

const rivers = [
  { id: "guapore", name: "Rio Guapore", city: "Costa Marques", species: ["tucunaré", "pirarara", "cachara"], season: "Junho a outubro", difficulty: "Moderada", lat: -12.436, lng: -64.227, image: "guapore" },
  { id: "machado", name: "Rio Machado", city: "Ji-Parana", species: ["tucunaré", "jatuarana", "pintado"], season: "Maio a setembro", difficulty: "Facil", lat: -10.878, lng: -61.942, image: "machado" },
  { id: "madeira", name: "Rio Madeira", city: "Porto Velho", species: ["dourada", "piramutaba", "tambaqui"], season: "Julho a novembro", difficulty: "Avancada", lat: -8.761, lng: -63.906, image: "madeira" },
  { id: "mamore", name: "Rio Mamore", city: "Guajara-Mirim", species: ["tucunaré", "pacu", "surubim"], season: "Junho a outubro", difficulty: "Moderada", lat: -10.782, lng: -65.339, image: "mamore" },
  { id: "roosevelt", name: "Rio Roosevelt", city: "Alta Floresta d'Oeste", species: ["tucunaré", "trairao", "pirarara"], season: "Agosto a novembro", difficulty: "Avancada", lat: -11.202, lng: -61.835, image: "roosevelt" }
];

const providers = [
  { id: 1, name: "Marcos Tavares", role: "Guia especialista", river: "guapore", rating: 4.9, reviews: 127, distance: 3.2, price: 680, response: "~ 4 min", verified: true, initials: "MT", services: ["Guia", "Barco com motor", "Iscas"], available: true },
  { id: 2, name: "Ana Ribeiro", role: "Piloteira profissional", river: "machado", rating: 4.8, reviews: 89, distance: 6.4, price: 520, response: "~ 8 min", verified: true, initials: "AR", services: ["Piloteiro", "Barco com motor"], available: true },
  { id: 3, name: "Expedicao Madeira", role: "Operadora de pesca", river: "madeira", rating: 4.7, reviews: 64, distance: 12.1, price: 1190, response: "~ 12 min", verified: true, initials: "EM", services: ["Pacote completo", "Transporte", "Alimentacao"], available: true },
  { id: 4, name: "Paulo Nunes", role: "Guia e piloteiro", river: "mamore", rating: 4.9, reviews: 102, distance: 4.8, price: 740, response: "~ 5 min", verified: true, initials: "PN", services: ["Guia", "Piloteiro", "Equipamentos"], available: true }
];

let requests = [
  { id: "PG-2408", client: "Lucas Almeida", providerId: 1, river: "guapore", date: "2026-07-18", people: 2, service: "Pacote completo", value: 1360, status: "proposta", createdAt: "2026-06-18T14:00:00Z" }
];
let messages = [
  { id: 1, requestId: "PG-2408", from: "provider", text: "Ola, Lucas! O barco e os coletes estao incluidos. Podemos sair as 6h?", at: "14:12" }
];

function json(res, status, body) {
  res.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let body = "";
    req.on("data", chunk => {
      body += chunk;
      if (body.length > 1e6) req.destroy();
    });
    req.on("end", () => {
      try { resolve(body ? JSON.parse(body) : {}); } catch (error) { reject(error); }
    });
    req.on("error", reject);
  });
}

async function api(req, res, url) {
  if (req.method === "GET" && url.pathname === "/api/rivers") return json(res, 200, rivers);
  if (req.method === "GET" && url.pathname === "/api/providers") {
    const river = url.searchParams.get("river");
    return json(res, 200, providers.filter(item => item.available && (!river || item.river === river)));
  }
  if (req.method === "GET" && url.pathname === "/api/requests") return json(res, 200, requests);
  if (req.method === "POST" && url.pathname === "/api/requests") {
    const body = await readBody(req);
    if (!body.providerId || !body.river || !body.date) return json(res, 400, { error: "Prestador, rio e data sao obrigatorios." });
    const created = { id: `PG-${2408 + requests.length}`, status: "solicitada", createdAt: new Date().toISOString(), ...body };
    requests.push(created);
    return json(res, 201, created);
  }
  const statusMatch = url.pathname.match(/^\/api\/requests\/([^/]+)\/status$/);
  if (req.method === "PATCH" && statusMatch) {
    const body = await readBody(req);
    const item = requests.find(request => request.id === statusMatch[1]);
    if (!item) return json(res, 404, { error: "Solicitacao nao encontrada." });
    item.status = body.status || item.status;
    return json(res, 200, item);
  }
  if (req.method === "GET" && url.pathname === "/api/messages") {
    const requestId = url.searchParams.get("requestId");
    return json(res, 200, messages.filter(item => !requestId || item.requestId === requestId));
  }
  if (req.method === "POST" && url.pathname === "/api/messages") {
    const body = await readBody(req);
    if (!body.requestId || !String(body.text || "").trim()) return json(res, 400, { error: "Mensagem invalida." });
    const created = { id: messages.length + 1, from: "client", at: new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }), ...body };
    messages.push(created);
    return json(res, 201, created);
  }
  return json(res, 404, { error: "Rota nao encontrada." });
}

const mime = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".svg": "image/svg+xml", ".json": "application/json" };

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://${req.headers.host}`);
    if (url.pathname.startsWith("/api/")) return await api(req, res, url);
    const requested = url.pathname === "/" ? "index.html" : url.pathname.slice(1);
    const file = path.normalize(path.join(PUBLIC_DIR, requested));
    if (!file.startsWith(PUBLIC_DIR)) return json(res, 403, { error: "Acesso negado." });
    fs.readFile(file, (error, data) => {
      if (error) {
        fs.readFile(path.join(PUBLIC_DIR, "index.html"), (fallbackError, fallback) => {
          if (fallbackError) return json(res, 404, { error: "Arquivo nao encontrado." });
          res.writeHead(200, { "Content-Type": mime[".html"] }); res.end(fallback);
        });
        return;
      }
      res.writeHead(200, { "Content-Type": mime[path.extname(file)] || "application/octet-stream" }); res.end(data);
    });
  } catch (error) {
    json(res, 500, { error: "Erro interno.", detail: error.message });
  }
});

if (require.main === module) server.listen(PORT, "0.0.0.0", () => console.log(`Pesca GO em http://0.0.0.0:${PORT}`));

module.exports = { server, rivers, providers };
