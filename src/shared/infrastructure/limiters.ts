import type { RateLimiter } from "../application/ports";
import { createMemoryLimiter, createUpstashLimiter, withFallback } from "./rateLimiter";

type Env = Record<string, string | undefined>;

// Los limitadores en memoria deben vivir a nivel de módulo: si se crearan por petición, nunca acumularían nada.
const memory = new Map<string, RateLimiter>();

/** Limitador con Upstash si está configurado (compartido entre instancias) y memoria como respaldo. */
export function createLimiter(env: Env, o: { prefix: string; limit: number; windowSec: number }): RateLimiter {
  let local = memory.get(o.prefix);
  if (!local) {
    local = createMemoryLimiter({ limit: o.limit, windowMs: o.windowSec * 1000 });
    memory.set(o.prefix, local);
  }
  const { UPSTASH_REDIS_REST_URL: url, UPSTASH_REDIS_REST_TOKEN: token } = env;
  return url && token ? withFallback(createUpstashLimiter(url, token, o), local) : local;
}
