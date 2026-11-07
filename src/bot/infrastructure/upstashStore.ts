import type { UserStore } from "../application/ports";
import type { UserData } from "../domain/types";
import { createUpstashCommand } from "./upstashClient";

const empty = (): UserData => ({ expenses: [], tasks: [], habits: [], lastUpdate: 0 });
const key = (chatId: number) => `nexus:user:${chatId}`;

/** Almacén sobre la API REST de Upstash (sin dependencias). */
export function createUpstashStore(url: string, token: string, fetchImpl: typeof fetch = fetch): UserStore {
  const command = createUpstashCommand(url, token, fetchImpl);

  return {
    async load(chatId) {
      const raw = await command(["GET", key(chatId)]);
      if (typeof raw !== "string") return empty();
      try {
        return { ...empty(), ...JSON.parse(raw) };
      } catch {
        return empty();
      }
    },
    async save(chatId, data) {
      // Tope de tamaño para no crecer sin límite.
      const capped: UserData = {
        ...data,
        expenses: data.expenses.slice(-2000),
        habits: data.habits.slice(-3000),
        tasks: data.tasks.slice(-500),
      };
      await command(["SET", key(chatId), JSON.stringify(capped)]);
    },
  };
}
