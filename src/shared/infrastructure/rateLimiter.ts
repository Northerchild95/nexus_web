import { createLogger } from "../../lib/logger";
import type { RateLimiter } from "../application/ports";
import { createUpstashCommand } from "./upstashClient";

const log = createLogger("ratelimit");

/** En memoria: sirve en desarrollo y como respaldo (cada instancia serverless cuenta por separado). */
export function createMemoryLimiter(o: { limit: number; windowMs: number; now?: () => number }): RateLimiter {
  const hits = new Map<string, { count: number; resetAt: number }>();
  const now = o.now ?? Date.now;
  return {
    async allow(key) {
      const t = now();
      if (hits.size > 5000) for (const [k, v] of hits) if (t >= v.resetAt) hits.delete(k);
      const cur = hits.get(key);
      if (!cur || t >= cur.resetAt) {
        hits.set(key, { count: 1, resetAt: t + o.windowMs });
        return true;
      }
      if (cur.count >= o.limit) return false;
      cur.count++;
      return true;
    },
  };
}

/** Compartido entre instancias, sobre Upstash: INCR + EXPIRE NX (la ventana arranca en la primera petición). */
export function createUpstashLimiter(
  url: string, token: string,
  o: { limit: number; windowSec: number; prefix: string; fetchImpl?: typeof fetch },
): RateLimiter {
  const command = createUpstashCommand(url, token, o.fetchImpl);
  return {
    async allow(key) {
      const k = `nexus:rl:${o.prefix}${key}`;
      const count = Number(await command(["INCR", k]));
      await command(["EXPIRE", k, o.windowSec, "NX"]); // NX: nunca queda una clave sin caducidad
      return count <= o.limit;
    },
  };
}

/** Si Upstash falla, usa el limitador de respaldo en vez de dejar el endpoint sin protección. */
export function withFallback(primary: RateLimiter, fallback: RateLimiter): RateLimiter {
  return {
    async allow(key) {
      try {
        return await primary.allow(key);
      } catch (e) {
        log.warn("limitador principal falló, usando respaldo", e);
        return fallback.allow(key);
      }
    },
  };
}
