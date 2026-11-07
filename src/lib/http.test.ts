import assert from "node:assert/strict";
import test from "node:test";
import { clientIp, isSameOrigin } from "./http";
import { postChat, toHistory } from "./chatClient";

test("origen: solo el mismo host", () => {
  assert.equal(isSameOrigin("https://nexus.app", "nexus.app"), true);
  assert.equal(isSameOrigin("https://evil.com", "nexus.app"), false);
  assert.equal(isSameOrigin(null, "nexus.app"), false);
  assert.equal(isSameOrigin("no-es-url", "nexus.app"), false);
});
test("IP: primer valor de x-forwarded-for, luego x-real-ip, luego unknown", () => {
  const h = (o: Record<string, string>) => ({ get: (k: string) => o[k] ?? null });
  assert.equal(clientIp(h({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" })), "1.2.3.4");
  assert.equal(clientIp(h({ "x-real-ip": "9.9.9.9" })), "9.9.9.9");
  assert.equal(clientIp(h({})), "unknown");
});
test("toHistory: omite errores, mapea roles y recorta", () => {
  const h = toHistory([
    { role: "user", text: "hola" },
    { role: "bot", text: "falló", error: true },
    { role: "bot", text: "¡hola!" },
    { role: "user", text: "¿precio?" },
  ]);
  assert.deepEqual(h, [{ role: "user", content: "hola" }, { role: "assistant", content: "¡hola!" }, { role: "user", content: "¿precio?" }]);
  const [{ content }] = toHistory([{ role: "bot", text: "x".repeat(2000) }]);
  assert.equal(content.length, 500); // el contexto reenviado se acota
  assert.equal(toHistory(Array.from({ length: 30 }, () => ({ role: "user" as const, text: "a" }))).length, 8);
});
test("cliente del chat: éxito, 429, error HTTP y red caída", async () => {
  const res = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
  let sent: unknown;
  await postChat([{ role: "user", content: "hola" }], "es", (async (_u: unknown, init: RequestInit) => { sent = JSON.parse(init.body as string); return new Response(JSON.stringify({ reply: "x" })); }) as typeof fetch);
  assert.deepEqual(sent, { messages: [{ role: "user", content: "hola" }], locale: "es" });
  assert.deepEqual(await postChat([{ role: "user", content: "hola" }], "es", res({ reply: "ok" })), { ok: true, reply: "ok" });
  assert.deepEqual(await postChat([{ role: "user", content: "hola" }], "es", res({}, 429)), { ok: false, reason: "rate_limited" });
  assert.deepEqual(await postChat([{ role: "user", content: "hola" }], "es", res({}, 500)), { ok: false, reason: "error" });
  assert.deepEqual(await postChat([{ role: "user", content: "hola" }], "es", res({ nada: 1 })), { ok: false, reason: "error" });
  assert.deepEqual(await postChat([{ role: "user", content: "hola" }], "es", (async () => { throw new Error("red"); }) as typeof fetch), { ok: false, reason: "error" });
});
