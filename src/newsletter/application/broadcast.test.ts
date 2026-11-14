import assert from "node:assert/strict";
import test from "node:test";
import type { Subscriber } from "../domain/types";
import { planBroadcast, runBroadcast, type BroadcastOptions } from "./broadcast";
import type { CampaignLedger, MailMessage } from "./ports";

const sub = (n: number, over: Partial<Subscriber> = {}): Subscriber => ({
  email: `p${n}@mail.com`, locale: n % 2 ? "es" : "en", status: "confirmed", token: String(n).padStart(48, "0"), createdAt: 1, lastEmailAt: 1, ...over,
});
function fakeLedger(initial: string[] = []) {
  const sent = new Set(initial);
  const ledger: CampaignLedger = { sentTo: async () => new Set(sent), markSent: async (_c, e) => { sent.add(e); } };
  return { ledger, sent };
}
const opts: BroadcastOptions = { campaign: "launch", site: "https://nexus.app", ctaUrl: "https://nexus.app", delayMs: 0, maxConsecutiveFailures: 3 };
const noSleep = async () => {};

test("plan: excluye a quienes ya recibieron y respeta el límite", async () => {
  const store = { listConfirmed: async () => [1, 2, 3, 4, 5].map((n) => sub(n)) };
  const { ledger } = fakeLedger(["p1@mail.com", "p2@mail.com"]);
  const plan = await planBroadcast({ campaign: "launch", limit: 2 }, { store, ledger });
  assert.deepEqual(plan.recipients.map((s) => s.email), ["p3@mail.com", "p4@mail.com"]);
  assert.deepEqual([plan.totalConfirmed, plan.alreadySent, plan.remainingAfter], [5, 2, 1]);
});
test("plan: nunca incluye a quien no esté confirmado, aunque el almacén lo devuelva", async () => {
  const store = { listConfirmed: async () => [sub(1), sub(2, { status: "unsubscribed" }), sub(3, { status: "pending" })] };
  const plan = await planBroadcast({ campaign: "launch", limit: 10 }, { store, ledger: fakeLedger().ledger });
  assert.deepEqual(plan.recipients.map((s) => s.email), ["p1@mail.com"]);
});
test("el registro es por campaña: haber recibido 'update' no bloquea 'launch'", async () => {
  const store = { listConfirmed: async () => [sub(1)] };
  const ledger: CampaignLedger = { sentTo: async (c) => new Set(c === "update" ? ["p1@mail.com"] : []), markSent: async () => {} };
  assert.equal((await planBroadcast({ campaign: "launch", limit: 5 }, { store, ledger })).recipients.length, 1);
  assert.equal((await planBroadcast({ campaign: "update", limit: 5 }, { store, ledger })).recipients.length, 0);
});
test("envío: usa el idioma y el enlace de baja personal de cada persona y los registra", async () => {
  const mails: MailMessage[] = [];
  const { ledger, sent } = fakeLedger();
  const report = await runBroadcast([sub(1), sub(2)], opts, { mailer: async (m) => { mails.push(m); }, ledger, sleep: noSleep });
  assert.deepEqual([report.sent, report.failed, report.aborted], [2, 0, false]);
  assert.match(mails[0].subject, /ya está disponible/); // p1 → es
  assert.match(mails[1].subject, /now available/); // p2 → en
  assert.equal(mails[0].unsubscribeUrl, `https://nexus.app/api/subscribe/unsubscribe?token=${"1".padStart(48, "0")}&locale=es`);
  assert.ok(mails[0].text.includes(mails[0].unsubscribeUrl!));
  assert.deepEqual([...sent].sort(), ["p1@mail.com", "p2@mail.com"]);
});
test("un fallo aislado no detiene el envío y esa persona no queda registrada", async () => {
  const { ledger, sent } = fakeLedger();
  const mailer = async (m: MailMessage) => { if (m.to === "p2@mail.com") throw new Error("rebotó"); };
  const r = await runBroadcast([sub(1), sub(2), sub(3)], opts, { mailer, ledger, sleep: noSleep });
  assert.deepEqual([r.sent, r.failed, r.aborted], [2, 1, false]);
  assert.deepEqual(r.failures, [{ email: "p2@mail.com", error: "rebotó" }]);
  assert.ok(!sent.has("p2@mail.com"));
});
test("se detiene tras fallos seguidos (proveedor caído o límite diario)", async () => {
  let calls = 0;
  const mailer = async () => { calls++; throw new Error("429 límite diario"); };
  const r = await runBroadcast([1, 2, 3, 4, 5, 6].map((n) => sub(n)), opts, { mailer, ledger: fakeLedger().ledger, sleep: noSleep });
  assert.equal(r.aborted, true);
  assert.equal(calls, 3); // no sigue golpeando al proveedor
  assert.equal(r.attempted, 3);
});
test("un éxito reinicia el contador de fallos seguidos", async () => {
  const fails = new Set(["p1@mail.com", "p2@mail.com", "p4@mail.com", "p5@mail.com"]);
  const mailer = async (m: MailMessage) => { if (fails.has(m.to)) throw new Error("x"); };
  const r = await runBroadcast([1, 2, 3, 4, 5].map((n) => sub(n)), opts, { mailer, ledger: fakeLedger().ledger, sleep: noSleep });
  assert.equal(r.aborted, false);
  assert.deepEqual([r.sent, r.failed], [1, 4]);
});
test("respeta la pausa entre envíos", async () => {
  const waits: number[] = [];
  await runBroadcast([sub(1), sub(2)], { ...opts, delayMs: 300 }, { mailer: async () => {}, ledger: fakeLedger().ledger, sleep: async (ms) => { waits.push(ms); } });
  assert.deepEqual(waits, [300, 300]);
});
