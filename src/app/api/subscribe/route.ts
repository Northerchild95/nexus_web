import { NextResponse } from "next/server";
import { subscribe } from "@/newsletter/application/subscribe";
import { createSubscribeDeps } from "@/newsletter/infrastructure/composition";
import { clientIp, isSameOrigin } from "@/lib/http";
import { createLogger } from "@/lib/logger";

export const runtime = "nodejs";
const log = createLogger("subscribe");

/** Capa delgada: protege la entrada y delega en el caso de uso `subscribe`. */
export async function POST(req: Request) {
  const origin = req.headers.get("origin");
  if (!isSameOrigin(origin, req.headers.get("host"))) return NextResponse.json({ error: "forbidden" }, { status: 403 });
  const raw = await req.text();
  if (raw.length > 2000) return NextResponse.json({ error: "too_large" }, { status: 413 });

  let body: { email?: unknown; locale?: unknown; website?: unknown };
  try { body = JSON.parse(raw); } catch { return NextResponse.json({ error: "invalid" }, { status: 400 }); }

  const deps = createSubscribeDeps();
  if (!deps) return NextResponse.json({ error: "unavailable" }, { status: 503 });
  try {
    // baseUrl sale del origen ya validado: los enlaces del correo apuntan al sitio real sin depender de variables.
    const { status } = await subscribe(
      { email: body?.email, locale: body?.locale, honeypot: body?.website, baseUrl: origin!, ip: clientIp(req.headers) },
      deps,
    );
    if (status === "ok") return NextResponse.json({ ok: true });
    if (status === "invalid") return NextResponse.json({ error: "invalid" }, { status: 400 });
    if (status === "rate_limited") return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  } catch (e) {
    log.error("error procesando la suscripción", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
