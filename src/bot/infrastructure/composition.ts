import type { Answerer, ChatDeps, Deps, RateLimiter, Sender } from "../application/ports";
import { bogotaToday } from "../domain/dates";
import { createGroqAgent } from "./groqAgent";
import { createGroqAnswerer } from "./groqAnswer";
import { createMemoryLimiter, createUpstashLimiter, withFallback } from "./rateLimiter";
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

// Los limitadores en memoria deben vivir a nivel de módulo: si se crearan por petición, nunca acumularían nada.
const memory = new Map<string, RateLimiter>();
const memoryLimiter = (prefix: string, limit: number, windowSec: number) => {
  if (!memory.has(prefix)) memory.set(prefix, createMemoryLimiter({ limit, windowMs: windowSec * 1000 }));
  return memory.get(prefix)!;
};

/** Límites del chat web: 20 mensajes por visitante cada 10 min y 300 consultas a la IA al día en total. */
export function createChatDeps(env: Env = process.env): ChatDeps {
  const model = env.GROQ_MODEL ?? "openai/gpt-oss-20b";
  const answerer: Answerer | null = env.GROQ_API_KEY ? createGroqAnswerer({ apiKey: env.GROQ_API_KEY, model }) : null;
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = env;

  const limiter = (prefix: string, limit: number, windowSec: number): RateLimiter => {
    const local = memoryLimiter(prefix, limit, windowSec);
    return url && token ? withFallback(createUpstashLimiter(url, token, { limit, windowSec, prefix }), local) : local;
  };
  const perVisitor = limiter("chat:ip:", 20, 600);
  const aiBudget = limiter("chat:ai:", 300, 86400);

  return {
    limiter: perVisitor,
    // El presupuesto diario solo se gasta cuando la FAQ no alcanza y hay que llamar a la IA.
    answerer: answerer && (async (q, l) => ((await aiBudget.allow("global")) ? answerer(q, l) : null)),
  };
}
