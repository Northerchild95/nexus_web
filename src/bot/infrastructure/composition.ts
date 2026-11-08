import type { ChatDeps, Converser, Deps, Sender } from "../application/ports";
import { bogotaToday } from "../domain/dates";
import { createGroqAgent } from "./groqAgent";
import { createGroqAnswerer } from "./groqAnswer";
import { createGroqConverser } from "./groqConverser";
import { createLimiter } from "../../shared/infrastructure/limiters";
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

/** Límites del chat web: 20 mensajes por visitante cada 10 min y 600 consultas a la IA al día en total. */
export function createChatDeps(env: Env = process.env): ChatDeps {
  const model = env.GROQ_MODEL ?? "openai/gpt-oss-20b";
  const converser: Converser | null = env.GROQ_API_KEY ? createGroqConverser({ apiKey: env.GROQ_API_KEY, model }) : null;
  const perVisitor = createLimiter(env, { prefix: "chat:ip:", limit: 20, windowSec: 600 });
  const aiBudget = createLimiter(env, { prefix: "chat:ai:", limit: 600, windowSec: 86400 });

  return {
    limiter: perVisitor,
    // Cada respuesta de IA gasta del presupuesto diario; al agotarse, el chat cae a la FAQ.
    converser: converser && (async (h, l) => ((await aiBudget.allow("global")) ? converser(h, l) : null)),
  };
}
