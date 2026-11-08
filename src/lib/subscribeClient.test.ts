import assert from "node:assert/strict";
import test from "node:test";
import { postSubscribe } from "./subscribeClient";

const res = (status: number) => (async () => new Response("{}", { status })) as unknown as typeof fetch;

test("traduce cada respuesta del servidor", async () => {
  assert.deepEqual(await postSubscribe("a@b.co", "es", "", res(200)), { ok: true });
  assert.deepEqual(await postSubscribe("a@b.co", "es", "", res(400)), { ok: false, reason: "invalid" });
  assert.deepEqual(await postSubscribe("a@b.co", "es", "", res(429)), { ok: false, reason: "rate_limited" });
  assert.deepEqual(await postSubscribe("a@b.co", "es", "", res(503)), { ok: false, reason: "unavailable" });
  assert.deepEqual(await postSubscribe("a@b.co", "es", "", (async () => { throw new Error("red"); }) as typeof fetch), { ok: false, reason: "unavailable" });
});
test("envía correo, idioma y campo trampa", async () => {
  let sent: unknown;
  await postSubscribe("a@b.co", "en", "", (async (_u: unknown, init: RequestInit) => { sent = JSON.parse(init.body as string); return new Response("{}"); }) as typeof fetch);
  assert.deepEqual(sent, { email: "a@b.co", locale: "en", website: "" });
});
