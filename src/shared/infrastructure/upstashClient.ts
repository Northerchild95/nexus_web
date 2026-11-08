export type UpstashCommand = (args: (string | number)[]) => Promise<unknown>;

/** Ejecuta un comando Redis por la API REST de Upstash. */
export function createUpstashCommand(url: string, token: string, fetchImpl: typeof fetch = fetch): UpstashCommand {
  return async (args) => {
    const res = await fetchImpl(url, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify(args),
      signal: AbortSignal.timeout(5000),
    });
    if (!res.ok) throw new Error(`Upstash ${res.status}: ${(await res.text()).slice(0, 200)}`);
    return (await res.json()).result;
  };
}
