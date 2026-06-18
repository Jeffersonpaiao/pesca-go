const test = require("node:test");
const assert = require("node:assert/strict");
const { server } = require("../server");

let baseUrl;

test.before(async () => {
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  baseUrl = `http://127.0.0.1:${server.address().port}`;
});

test.after(() => new Promise(resolve => server.close(resolve)));

test("serves the application", async () => {
  const response = await fetch(baseUrl);
  assert.equal(response.status, 200);
  assert.match(await response.text(), /PESCA <b>GO<\/b>/);
});

test("returns available providers filtered by river", async () => {
  const response = await fetch(`${baseUrl}/api/providers?river=guapore`);
  const providers = await response.json();
  assert.equal(response.status, 200);
  assert.equal(providers.length, 1);
  assert.equal(providers[0].name, "Marcos Tavares");
});

test("validates and creates a service request", async () => {
  const invalid = await fetch(`${baseUrl}/api/requests`, { method: "POST", headers: { "Content-Type": "application/json" }, body: "{}" });
  assert.equal(invalid.status, 400);

  const response = await fetch(`${baseUrl}/api/requests`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ providerId: 2, river: "machado", date: "2026-08-02", people: 2, service: "Guia" })
  });
  const created = await response.json();
  assert.equal(response.status, 201);
  assert.equal(created.status, "solicitada");
});

test("creates and lists chat messages", async () => {
  const response = await fetch(`${baseUrl}/api/messages`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ requestId: "PG-2408", text: "Combinado!" })
  });
  assert.equal(response.status, 201);
  const messages = await (await fetch(`${baseUrl}/api/messages?requestId=PG-2408`)).json();
  assert.ok(messages.some(item => item.text === "Combinado!"));
});
