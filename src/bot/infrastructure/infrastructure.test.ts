import assert from "node:assert/strict";
import test from "node:test";
import { createDeps } from "./composition";
import { createGroqAgent } from "./groqAgent";
import { createGroqConverser } from "./groqConverser";
import { buildKeyboard, createTelegramSender } from "./telegramApi";
import { createUpstashStore } from "./upstashStore";

const jsonRes = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
const groqReply = (content: string) => jsonRes({ choices: [{ message: { content } }] });

test("agente Groq: extrae y valida la acción", async () => {
  const agent = createGroqAgent({ apiKey: "k", model: "m", fetchImpl: async () => groqReply('Claro: {"action":"add_expense","amount":18000,"category":"food","note":"almuerzo"}') });
  assert.deepEqual(await agent("x", "es", "2026-11-07"), { action: "add_expense", amount: 18000, category: "food", note: "almuerzo", date: undefined });
});
test("agente Groq: error HTTP, basura o acción inválida → null", async () => {
  for (const fetchImpl of [async () => jsonRes({}, 500), async () => groqReply("no es json"), async () => groqReply('{"action":"drop_db"}'), async () => { throw new Error("red"); }]) {
    assert.equal(await createGroqAgent({ apiKey: "k", model: "m", fetchImpl: fetchImpl as typeof fetch })("x", "es", "2026-11-07"), null);
  }
});
test("conversador Groq: envía sistema + historial en orden y devuelve el texto", async () => {
  let body: { messages: { role: string; content: string }[] } = { messages: [] };
  const fetchImpl = (async (_u: unknown, init: RequestInit) => { body = JSON.parse(init.body as string); return groqReply("Hola, claro."); }) as typeof fetch;
  const converse = createGroqConverser({ apiKey: "k", model: "m", fetchImpl });
  const out = await converse([{ role: "user", content: "hola" }, { role: "assistant", content: "¡hola!" }, { role: "user", content: "¿qué haces?" }], "es");
  assert.equal(out, "Hola, claro.");
  assert.deepEqual(body.messages.map((m) => m.role), ["system", "user", "assistant", "user"]);
  assert.match(body.messages[0].content, /SOLO estos datos/);
});
test("conversador Groq: error HTTP → null", async () => {
  const converse = createGroqConverser({ apiKey: "k", model: "m", fetchImpl: (async () => jsonRes({}, 500)) as typeof fetch });
  assert.equal(await converse([{ role: "user", content: "hola" }], "es"), null);
});
test("Upstash: GET/SET por REST y datos corruptos → vacío", async () => {
  const calls: unknown[] = [];
  let stored: string | null = null;
  const store = createUpstashStore("https://u", "tok", (async (_u: unknown, init: RequestInit) => {
    const cmd = JSON.parse(init.body as string); calls.push(cmd);
    if (cmd[0] === "SET") { stored = cmd[2]; return jsonRes({ result: "OK" }); }
    return jsonRes({ result: stored });
  }) as typeof fetch);
  assert.equal((await store.load(1)).expenses.length, 0);
  await store.save(1, { expenses: [{ id: "a", amount: 1, category: "food", note: "", date: "2026-11-07" }], tasks: [], habits: [], lastUpdate: 3 });
  assert.equal((await store.load(1)).lastUpdate, 3);
  stored = "{corrupto";
  assert.equal((await store.load(1)).lastUpdate, 0);
  assert.deepEqual(calls[0], ["GET", "nexus:user:1"]);
});
test("Telegram: teclado en filas de dos y envío", async () => {
  assert.deepEqual(buildKeyboard(["a", "b", "c"]).keyboard, [[{ text: "a" }, { text: "b" }], [{ text: "c" }]]);
  let body: Record<string, unknown> = {};
  await createTelegramSender("T", (async (_u: unknown, init: RequestInit) => { body = JSON.parse(init.body as string); return jsonRes({ ok: true }); }) as typeof fetch)(9, "hola", ["x"]);
  assert.equal(body.chat_id, 9);
  assert.ok(body.reply_markup);
});
test("composición: lee el entorno y deja piezas en null si faltan", () => {
  const empty = createDeps({});
  assert.equal(empty.store, null); assert.equal(empty.agent, null); assert.equal(empty.isAllowed(1), false);
  const full = createDeps({ UPSTASH_REDIS_REST_URL: "u", UPSTASH_REDIS_REST_TOKEN: "t", GROQ_API_KEY: "g", TELEGRAM_ALLOWED_CHAT_IDS: " 1, 2 " });
  assert.ok(full.store && full.agent && full.answerer);
  assert.equal(full.isAllowed(2), true); assert.equal(full.isAllowed(3), false);
});
