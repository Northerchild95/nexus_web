import assert from "node:assert/strict";
import test from "node:test";
import { clientIp, isSameOrigin } from "./http";
import { postChat } from "./chatClient";

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
test("cliente del chat: éxito, 429, error HTTP y red caída", async () => {
  const res = (body: unknown, status = 200) => (async () => new Response(JSON.stringify(body), { status })) as unknown as typeof fetch;
  assert.deepEqual(await postChat("hola", "es", res({ reply: "ok" })), { ok: true, reply: "ok" });
  assert.deepEqual(await postChat("hola", "es", res({}, 429)), { ok: false, reason: "rate_limited" });
  assert.deepEqual(await postChat("hola", "es", res({}, 500)), { ok: false, reason: "error" });
  assert.deepEqual(await postChat("hola", "es", res({ nada: 1 })), { ok: false, reason: "error" });
  assert.deepEqual(await postChat("hola", "es", (async () => { throw new Error("red"); }) as typeof fetch), { ok: false, reason: "error" });
});
