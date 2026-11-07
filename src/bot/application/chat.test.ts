import assert from "node:assert/strict";
import test from "node:test";
import { CHAT_MAX_LENGTH, CHAT_MAX_TURNS, type ChatTurn } from "../../config/chat";
import { handleChat, parseTurns } from "./chat";
import type { ChatDeps, Converser } from "./ports";

const allow = { allow: async () => true };
const deny = { allow: async () => false };
const user = (content: string): ChatTurn => ({ role: "user", content });
const bot = (content: string): ChatTurn => ({ role: "assistant", content });
const input = (messages: unknown, locale: unknown = "es") => ({ messages, locale, ip: "1.1.1.1" });
const deps = (over: Partial<ChatDeps> = {}): ChatDeps => ({ converser: null, limiter: allow, ...over });
const reply = (r: unknown) => (r as { reply: string }).reply;

test("parseTurns: valida roles, textos y que termine en el usuario", () => {
  assert.equal(parseTurns("hola"), null);
  assert.equal(parseTurns([]), null);
  assert.equal(parseTurns([{ role: "system", content: "x" }]), null);
  assert.equal(parseTurns([{ role: "user", content: 5 }]), null);
  assert.equal(parseTurns([user("   ")]), null);
  assert.equal(parseTurns([user("x".repeat(CHAT_MAX_LENGTH + 1))]), null);
  assert.equal(parseTurns([user("hola"), bot("¿en qué te ayudo?")]), null); // debe terminar en usuario
  assert.equal(parseTurns(Array.from({ length: CHAT_MAX_TURNS * 2 + 1 }, () => user("a"))), null);
});
test("parseTurns: recorta al contexto más reciente", () => {
  const long: ChatTurn[] = [];
  for (let i = 0; i < CHAT_MAX_TURNS - 1; i++) long.push(user(`u${i}`), bot(`b${i}`)); // 14 mensajes + el último = 15 (≤ 16)
  long.push(user("último"));
  const turns = parseTurns(long)!;
  assert.equal(turns.length, CHAT_MAX_TURNS);
  assert.equal(turns[turns.length - 1].content, "último");
});
test("mensaje inválido no gasta cupo", async () => {
  let used = 0;
  const limiter = { allow: async () => { used++; return true; } };
  assert.deepEqual(await handleChat(input(undefined), deps({ limiter })), { status: "invalid" });
  assert.equal(used, 0);
});
test("si el visitante excede el límite, no se llama a la IA", async () => {
  let calls = 0;
  const converser: Converser = async () => { calls++; return "x"; };
  assert.deepEqual(await handleChat(input([user("hola")]), deps({ limiter: deny, converser })), { status: "rate_limited" });
  assert.equal(calls, 0);
});
test("conversa con contexto: la IA recibe todo el historial", async () => {
  let received: ChatTurn[] = [];
  const converser: Converser = async (h) => { received = h; return "Respuesta con contexto"; };
  const history = [user("¿qué es Nexus?"), bot("Una app..."), user("¿y eso cuánto cuesta?")];
  const r = await handleChat(input(history), deps({ converser }));
  assert.equal(reply(r), "Respuesta con contexto");
  assert.deepEqual(received, history);
});
test("los botones sugeridos usan la respuesta fija y no gastan IA", async () => {
  let calls = 0;
  const converser: Converser = async () => { calls++; return "ia"; };
  const r = await handleChat(input([user("Precio")]), deps({ converser }));
  assert.match(reply(r), /precios/);
  assert.equal(calls, 0);
});
test("si la IA falla o no existe, cae a la FAQ y luego al texto por defecto", async () => {
  assert.match(reply(await handleChat(input([user("¿cuánto cuesta?")]), deps({ converser: async () => null }))), /precios/);
  assert.match(reply(await handleChat(input([user("xyzzy qwerty")]), deps())), /sugerencia/);
});
test("detecta el idioma del último mensaje", async () => {
  assert.match(reply(await handleChat(input([user("what's the price")], "es"), deps())), /pricing/);
  assert.match(reply(await handleChat(input([user("xyzzy qwerty")], "en"), deps())), /suggestion/);
});
