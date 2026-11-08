import { createUpstashCommand } from "../../shared/infrastructure/upstashClient";
import type { SubscriberStore } from "../application/ports";
import type { Subscriber } from "../domain/types";

const recordKey = (email: string) => `nexus:sub:${email}`;
const tokenKey = (token: string) => `nexus:subtoken:${token}`;
const CONFIRMED_SET = "nexus:subs:confirmed"; // lista de correos confirmados (SMEMBERS para exportarla)

export function createSubscriberStore(url: string, token: string, fetchImpl: typeof fetch = fetch): SubscriberStore {
  const command = createUpstashCommand(url, token, fetchImpl);
  const parse = (raw: unknown): Subscriber | null => {
    if (typeof raw !== "string") return null;
    try { return JSON.parse(raw) as Subscriber; } catch { return null; }
  };
  const store: SubscriberStore = {
    get: async (email) => parse(await command(["GET", recordKey(email)])),
    byToken: async (t) => {
      const email = await command(["GET", tokenKey(t)]);
      return typeof email === "string" ? store.get(email) : null;
    },
    async save(s) {
      await command(["SET", recordKey(s.email), JSON.stringify(s)]);
      await command(["SET", tokenKey(s.token), s.email]);
      await command([s.status === "confirmed" ? "SADD" : "SREM", CONFIRMED_SET, s.email]);
    },
  };
  return store;
}
