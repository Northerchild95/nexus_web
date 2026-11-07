import type { Deps, Sender } from "../application/ports";
import { bogotaToday } from "../domain/dates";
import { createGroqAgent } from "./groqAgent";
import { createGroqAnswerer } from "./groqAnswer";
import { createTelegramSender } from "./telegramApi";
import { createUpstashStore } from "./upstashStore";

type Env = Record<string, string | undefined>;

/** Único lugar que lee variables de entorno y arma las dependencias reales. */
export function createDeps(env: Env = process.env): Deps {
  const allowed = (env.TELEGRAM_ALLOWED_CHAT_IDS ?? "").split(",").map((s) => s.trim()).filter(Boolean);
  const model = env.GROQ_MODEL ?? "openai/gpt-oss-20b";
  const groq = env.GROQ_API_KEY ? { apiKey: env.GROQ_API_KEY, model } : null;
  return {
    store: env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN
      ? createUpstashStore(env.UPSTASH_REDIS_REST_URL, env.UPSTASH_REDIS_REST_TOKEN)
      : null,
    agent: groq ? createGroqAgent(groq) : null,
    answerer: groq ? createGroqAnswerer(groq) : null,
    isAllowed: (chatId) => allowed.includes(String(chatId)),
    today: () => bogotaToday(),
  };
}

export function createSender(env: Env = process.env): Sender {
  if (!env.TELEGRAM_BOT_TOKEN) throw new Error("Falta TELEGRAM_BOT_TOKEN");
  return createTelegramSender(env.TELEGRAM_BOT_TOKEN);
}
