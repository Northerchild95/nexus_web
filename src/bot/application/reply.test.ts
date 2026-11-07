import assert from "node:assert/strict";
import test from "node:test";
import type { Action, UserData } from "../domain/types";
import type { Deps } from "./ports";
import { buildReply } from "./reply";

function fakeStore(opts: { failLoad?: boolean } = {}) {
  let data: UserData = { expenses: [], tasks: [], habits: [], lastUpdate: 0 };
  const state = { saves: 0 };
  return {
    state,
    get data() { return data; },
    store: {
      load: async () => { if (opts.failLoad) throw new Error("redis caído"); return structuredClone(data); },
      save: async (_: number, d: UserData) => { data = structuredClone(d); state.saves++; },
    },
  };
}
const deps = (over: Partial<Deps> = {}): Deps => ({ store: null, agent: null, answerer: null, isAllowed: () => false, today: () => "2026-11-07", ...over });
const msg = (text: string, updateId = 1) => ({ text, chatId: 7, updateId, locale: "es" as const });

test("público: responde con la FAQ", async () => {
  const r = await buildReply(msg("¿cuánto cuesta?"), deps());
  assert.match(r!.text, /precios/);
});
test("/id muestra el estado sin secretos", async () => {
  const f = fakeStore();
  const r = await buildReply(msg("/id"), deps({ store: f.store, isAllowed: () => true }));
  assert.match(r!.text, /chat id: 7/);
  assert.match(r!.text, /autorizado.*sí/);
  assert.match(r!.text, /Upstash configurado: sí/);
  assert.match(r!.text, /Groq configurado: no/);
});
test("autorizado: guarda un gasto con comando fijo", async () => {
  const f = fakeStore();
  const r = await buildReply(msg("gasto 18000 almuerzo", 5), deps({ store: f.store, isAllowed: () => true }));
  assert.match(r!.text, /Gasto guardado/);
  assert.equal(f.data.expenses.length, 1);
  assert.equal(f.data.lastUpdate, 5);
});
test("reintento del mismo update no duplica", async () => {
  const f = fakeStore();
  const d = deps({ store: f.store, isAllowed: () => true });
  await buildReply(msg("gasto 18000 almuerzo", 5), d);
  assert.equal(await buildReply(msg("gasto 18000 almuerzo", 5), d), null);
  assert.equal(f.data.expenses.length, 1);
});
test("no autorizado: nunca escribe en el almacén", async () => {
  const f = fakeStore();
  await buildReply(msg("gasto 18000 almuerzo"), deps({ store: f.store, isAllowed: () => false }));
  assert.equal(f.state.saves, 0);
});
test("texto libre: usa el agente y valida su acción", async () => {
  const f = fakeStore();
  const agent = async (): Promise<Action> => ({ action: "add_expense", amount: 9000, category: "food", note: "cena" });
  const r = await buildReply(msg("anota que cené por nueve mil"), deps({ store: f.store, agent, isAllowed: () => true }));
  assert.match(r!.text, /Gasto guardado/);
  assert.equal(f.data.expenses[0].amount, 9000);
});
test("agente devuelve unsupported", async () => {
  const f = fakeStore();
  const agent = async (): Promise<Action> => ({ action: "unsupported" });
  const r = await buildReply(msg("recuérdame pagar mañana"), deps({ store: f.store, agent, isAllowed: () => true }));
  assert.match(r!.text, /todavía no lo puedo hacer/);
});
test("agente caído: cae a la FAQ o al mensaje por defecto", async () => {
  const f = fakeStore();
  const d = deps({ store: f.store, agent: async () => null, isAllowed: () => true });
  assert.match((await buildReply(msg("qwerty asdf"), d))!.text, /No tengo esa información/);
});
test("los botones del menú no pasan por el agente", async () => {
  const f = fakeStore();
  let calls = 0;
  const agent = async () => { calls++; return null; };
  const r = await buildReply(msg("Finanzas"), deps({ store: f.store, agent, isAllowed: () => true }));
  assert.equal(calls, 0);
  assert.match(r!.text, /finanzas/i);
});
test("si el almacén falla, degrada al modo público sin lanzar", async () => {
  const f = fakeStore({ failLoad: true });
  const r = await buildReply(msg("¿qué es Nexus Life?"), deps({ store: f.store, isAllowed: () => true }));
  assert.match(r!.text, /app móvil/);
});
