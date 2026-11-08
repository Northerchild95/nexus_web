import assert from "node:assert/strict";
import test from "node:test";
import { createSubscribeDeps, randomToken } from "./composition";
import { createBrevoMailer, createResendMailer } from "./mailer";
import { createSubscriberStore } from "./subscriberStore";

const msg = { to: "ana@mail.com", subject: "Hola", html: "<p>x</p>", text: "x", unsubscribeUrl: "https://x/u" };
type Captured = { url: string; headers: Record<string, string>; body: Record<string, unknown> };
const capture = (status = 200) => {
  const calls: Captured[] = [];
  const fetchImpl = (async (url: string, init: RequestInit) => {
    calls.push({ url, headers: init.headers as Record<string, string>, body: JSON.parse(init.body as string) });
    return new Response("{}", { status });
  }) as unknown as typeof fetch;
  return { calls, fetchImpl };
};

test("Brevo: endpoint, api-key, remitente y List-Unsubscribe", async () => {
  const { calls, fetchImpl } = capture();
  await createBrevoMailer({ apiKey: "K", fromEmail: "yo@gmail.com", fromName: "Nexus", fetchImpl })(msg);
  assert.equal(calls[0].url, "https://api.brevo.com/v3/smtp/email");
  assert.equal(calls[0].headers["api-key"], "K");
  assert.deepEqual(calls[0].body.sender, { name: "Nexus", email: "yo@gmail.com" });
  assert.deepEqual(calls[0].body.to, [{ email: "ana@mail.com" }]);
  assert.deepEqual(calls[0].body.headers, { "List-Unsubscribe": "<https://x/u>" });
});
test("Resend: endpoint, Bearer y campo from", async () => {
  const { calls, fetchImpl } = capture();
  await createResendMailer({ apiKey: "K", fromEmail: "hola@nexus.app", fromName: "Nexus", fetchImpl })(msg);
  assert.equal(calls[0].url, "https://api.resend.com/emails");
  assert.equal(calls[0].headers.Authorization, "Bearer K");
  assert.equal(calls[0].body.from, "Nexus <hola@nexus.app>");
});
test("los mailers lanzan si el proveedor rechaza el envío", async () => {
  const { fetchImpl } = capture(401);
  await assert.rejects(createBrevoMailer({ apiKey: "K", fromEmail: "a@b.co", fromName: "N", fetchImpl })(msg), /Brevo 401/);
  await assert.rejects(createResendMailer({ apiKey: "K", fromEmail: "a@b.co", fromName: "N", fetchImpl })(msg), /Resend 401/);
});
test("almacén Upstash: guarda por correo y por token, y mantiene el conjunto de confirmados", async () => {
  const kv = new Map<string, string>(); const set = new Set<string>();
  const fetchImpl = (async (_u: unknown, init: RequestInit) => {
    const [cmd, key, val] = JSON.parse(init.body as string) as string[];
    let result: unknown = "OK";
    if (cmd === "GET") result = kv.get(key) ?? null;
    if (cmd === "SET") kv.set(key, val);
    if (cmd === "SADD") set.add(val);
    if (cmd === "SREM") set.delete(val);
    return new Response(JSON.stringify({ result }));
  }) as unknown as typeof fetch;
  const store = createSubscriberStore("https://u", "t", fetchImpl);
  const s = { email: "ana@mail.com", locale: "es" as const, status: "pending" as const, token: "a".repeat(48), createdAt: 1, lastEmailAt: 2 };
  assert.equal(await store.get(s.email), null);
  await store.save(s);
  assert.deepEqual(await store.byToken(s.token), s);
  assert.equal(set.size, 0);
  await store.save({ ...s, status: "confirmed" });
  assert.deepEqual([...set], ["ana@mail.com"]);
  await store.save({ ...s, status: "unsubscribed" });
  assert.equal(set.size, 0);
});
test("composición: null si falta algo; con Brevo o Resend queda activa", () => {
  const base = { UPSTASH_REDIS_REST_URL: "u", UPSTASH_REDIS_REST_TOKEN: "t", EMAIL_FROM: "a@b.co" };
  assert.equal(createSubscribeDeps({}), null);
  assert.equal(createSubscribeDeps(base), null); // sin proveedor de correo
  assert.equal(createSubscribeDeps({ ...base, EMAIL_FROM: undefined, BREVO_API_KEY: "k" }), null); // sin remitente
  assert.ok(createSubscribeDeps({ ...base, BREVO_API_KEY: "k" }));
  assert.ok(createSubscribeDeps({ ...base, RESEND_API_KEY: "k" }));
});
test("token aleatorio: 48 hex y distinto cada vez", () => {
  assert.match(randomToken(), /^[a-f0-9]{48}$/);
  assert.notEqual(randomToken(), randomToken());
});
