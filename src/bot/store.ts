import type { UserData } from "./types";

const url = process.env.UPSTASH_REDIS_REST_URL;
const token = process.env.UPSTASH_REDIS_REST_TOKEN;

export const storeConfigured = () => Boolean(url && token);

async function command(args: (string | number)[]): Promise<unknown> {
  const res = await fetch(url!, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(args),
    signal: AbortSignal.timeout(5000),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
}

const empty = (): UserData => ({ expenses: [], tasks: [], habits: [], lastUpdate: 0 });
const key = (chatId: number) => `nexus:user:${chatId}`;

export async function loadData(chatId: number): Promise<UserData> {
  const raw = await command(["GET", key(chatId)]);
  if (typeof raw !== "string") return empty();
  try {
    return { ...empty(), ...JSON.parse(raw) };
  } catch {
    return empty();
  }
}

export async function saveData(chatId: number, data: UserData): Promise<void> {
  // Tope de tamaño para no crecer sin límite.
  data.expenses = data.expenses.slice(-2000);
  data.habits = data.habits.slice(-3000);
  data.tasks = data.tasks.slice(-500);
  await command(["SET", key(chatId), JSON.stringify(data)]);
}
