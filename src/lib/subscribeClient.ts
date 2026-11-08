export type SubscribeOutcome = { ok: true } | { ok: false; reason: "invalid" | "rate_limited" | "unavailable" };

/** Llamada del navegador a /api/subscribe. Nunca lanza. `website` es el campo trampa anti-bots. */
export async function postSubscribe(email: string, locale: string, website: string, fetchImpl: typeof fetch = fetch): Promise<SubscribeOutcome> {
  try {
    const res = await fetchImpl("/api/subscribe", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, locale, website }),
    });
    if (res.ok) return { ok: true };
    if (res.status === 400) return { ok: false, reason: "invalid" };
    if (res.status === 429) return { ok: false, reason: "rate_limited" };
    return { ok: false, reason: "unavailable" };
  } catch {
    return { ok: false, reason: "unavailable" };
  }
}
