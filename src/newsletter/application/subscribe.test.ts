import assert from "node:assert/strict";
import test from "node:test";
import type { Subscriber } from "../domain/types";
import type { MailMessage, SubscribeDeps, SubscriberStore } from "./ports";
import { CONFIRM_TTL_MS, RESEND_COOLDOWN_MS, confirmSubscription, subscribe, unsubscribe } from "./subscribe";

const TOKEN = "a".repeat(48);
function setup(over: Partial<SubscribeDeps> = {}, clock = { t: 1_000_000 }) {
  const db = new Map<string, Subscriber>();
  const sent: MailMessage[] = [];
  const store: SubscriberStore = {
    get: async (e) => db.get(e) ?? null,
    byToken: async (t) => [...db.values()].find((s) => s.token === t) ?? null,
    save: async (s) => { db.set(s.email, { ...s }); },
  };
  const allow = { allow: async () => true };
  const deps: SubscribeDeps = { store, mailer: async (m) => { sent.push(m); }, limiter: allow, emailBudget: allow, token: () => TOKEN, now: () => clock.t, ...over };
  return { db, sent, deps, clock };
}
const input = (over: Record<string, unknown> = {}) => ({ email: "Ana@Mail.com", locale: "es", honeypot: "", baseUrl: "https://nexus.app", ip: "1.1.1.1", ...over });

test("suscribir: guarda pendiente y envía el correo con enlaces absolutos", async () => {
  const { db, sent, deps } = setup();
  assert.deepEqual(await subscribe(input(), deps), { status: "ok" });
  assert.equal(db.get("ana@mail.com")?.status, "pending");
  assert.equal(sent.length, 1);
  assert.equal(sent[0].to, "ana@mail.com");
  assert.ok(sent[0].text.includes(`https://nexus.app/api/subscribe/confirm?token=${TOKEN}&locale=es`));
  assert.equal(sent[0].unsubscribeUrl, `https://nexus.app/api/subscribe/unsubscribe?token=${TOKEN}&locale=es`);
});
test("correo inválido: no consume cupo ni envía", async () => {
  let used = 0;
  const { sent, deps } = setup({ limiter: { allow: async () => { used++; return true; } } });
  assert.deepEqual(await subscribe(input({ email: "nope" }), deps), { status: "invalid" });
  assert.equal(used, 0); assert.equal(sent.length, 0);
});
test("honeypot: finge éxito y no hace nada", async () => {
  const { db, sent, deps } = setup();
  assert.deepEqual(await subscribe(input({ honeypot: "http://spam" }), deps), { status: "ok" });
  assert.equal(db.size, 0); assert.equal(sent.length, 0);
});
test("límite por visitante", async () => {
  const { sent, deps } = setup({ limiter: { allow: async () => false } });
  assert.deepEqual(await subscribe(input(), deps), { status: "rate_limited" });
  assert.equal(sent.length, 0);
});
test("no revela si ya está suscrito y no reenvía a confirmados", async () => {
  const { db, sent, deps } = setup();
  db.set("ana@mail.com", { email: "ana@mail.com", locale: "es", status: "confirmed", token: TOKEN, createdAt: 1, lastEmailAt: 1 });
  assert.deepEqual(await subscribe(input(), deps), { status: "ok" });
  assert.equal(sent.length, 0);
});
test("pendiente: respeta el enfriamiento y luego reenvía con el mismo token", async () => {
  const { sent, deps, clock } = setup({ token: () => "b".repeat(48) });
  await subscribe(input(), deps);
  clock.t += RESEND_COOLDOWN_MS - 1;
  await subscribe(input(), deps);
  assert.equal(sent.length, 1);
  clock.t += 2;
  await subscribe(input(), deps);
  assert.equal(sent.length, 2);
});
test("tope diario de correos: unavailable", async () => {
  const { sent, deps } = setup({ emailBudget: { allow: async () => false } });
  assert.deepEqual(await subscribe(input(), deps), { status: "unavailable" });
  assert.equal(sent.length, 0);
});
test("si el proveedor falla: unavailable y se puede reintentar enseguida", async () => {
  let fail = true;
  const { db, sent, deps } = setup({ mailer: async (m) => { if (fail) throw new Error("brevo caído"); sent.push(m); } });
  assert.deepEqual(await subscribe(input(), deps), { status: "unavailable" });
  assert.equal(db.get("ana@mail.com")?.lastEmailAt, 0);
  fail = false;
  assert.deepEqual(await subscribe(input(), deps), { status: "ok" });
});
test("confirmar: activa, es idempotente y rechaza tokens inválidos o vencidos", async () => {
  const { db, deps, clock } = setup();
  await subscribe(input(), deps);
  assert.equal(await confirmSubscription("zz", deps), "invalid");
  assert.equal(await confirmSubscription("c".repeat(48), deps), "invalid");
  assert.equal(await confirmSubscription(TOKEN, deps), "confirmed");
  assert.equal(db.get("ana@mail.com")?.status, "confirmed");
  assert.equal(await confirmSubscription(TOKEN, deps), "confirmed");

  const old = setup();
  await subscribe(input(), old.deps);
  old.clock.t += CONFIRM_TTL_MS + 1;
  assert.equal(await confirmSubscription(TOKEN, old.deps), "invalid");
  void clock;
});
test("darse de baja funciona desde cualquier estado y luego no se puede confirmar", async () => {
  const { db, deps } = setup();
  await subscribe(input(), deps);
  await confirmSubscription(TOKEN, deps);
  assert.equal(await unsubscribe(TOKEN, deps), "unsubscribed");
  assert.equal(db.get("ana@mail.com")?.status, "unsubscribed");
  assert.equal(await unsubscribe(TOKEN, deps), "unsubscribed");
  assert.equal(await confirmSubscription(TOKEN, deps), "invalid");
  assert.equal(await unsubscribe("x", deps), "invalid");
});
test("volver a suscribirse tras la baja exige confirmar otra vez", async () => {
  const { db, sent, deps } = setup();
  await subscribe(input(), deps);
  await confirmSubscription(TOKEN, deps);
  await unsubscribe(TOKEN, deps);
  await subscribe(input(), deps);
  assert.equal(db.get("ana@mail.com")?.status, "pending");
  assert.equal(sent.length, 2);
});
