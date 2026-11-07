import assert from "node:assert/strict";
import test from "node:test";
import { CHAT_MAX_LENGTH, handleChat } from "./chat";
import type { Answerer, ChatDeps } from "./ports";

const allow = { allow: async () => true };
const deny = { allow: async () => false };
const input = (message: unknown, locale: unknown = "es") => ({ message, locale, ip: "1.1.1.1" });
const deps = (over: Partial<ChatDeps> = {}): ChatDeps => ({ answerer: null, limiter: allow, ...over });

test("rechaza mensajes inválidos sin gastar cupo", async () => {
  let used = 0;
  const limiter = { allow: async () => { used++; return true; } };
  for (const bad of [undefined, 42, "", "   ", "x".repeat(CHAT_MAX_LENGTH + 1)]) {
    assert.deepEqual(await handleChat(input(bad), deps({ limiter })), { status: "invalid" });
  }
  assert.equal(used, 0);
});
test("si el visitante excede el límite, no se llama a la IA", async () => {
  let calls = 0;
  const answerer: Answerer = async () => { calls++; return "x"; };
  assert.deepEqual(await handleChat(input("hola mundo raro"), deps({ limiter: deny, answerer })), { status: "rate_limited" });
  assert.equal(calls, 0);
});
test("la FAQ responde sin consultar la IA", async () => {
  let calls = 0;
  const answerer: Answerer = async () => { calls++; return "ia"; };
  const r = await handleChat(input("¿cuánto cuesta?"), deps({ answerer }));
  assert.equal(r.status, "ok");
  assert.match((r as { reply: string }).reply, /precios/);
  assert.equal(calls, 0);
});
test("si la FAQ no alcanza usa la IA; sin IA, el texto por defecto de la web", async () => {
  const withAi = await handleChat(input("explícame algo raro"), deps({ answerer: async () => "respuesta IA" }));
  assert.deepEqual(withAi, { status: "ok", reply: "respuesta IA" });
  const without = (await handleChat(input("xyzzy qwerty"), deps())) as { reply: string };
  assert.match(without.reply, /sugerencia/);
});
test("responde en inglés cuando el texto o la página lo indican", async () => {
  assert.match(((await handleChat(input("what's the price", "es"), deps())) as { reply: string }).reply, /pricing/);
  assert.match(((await handleChat(input("xyzzy qwerty", "en"), deps())) as { reply: string }).reply, /suggestion/);
});
