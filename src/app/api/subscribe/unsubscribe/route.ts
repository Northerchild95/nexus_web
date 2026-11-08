import { NextResponse } from "next/server";
import { hasLocale } from "next-intl";
import { routing } from "@/i18n/routing";
import { unsubscribe } from "@/newsletter/application/subscribe";
import { createSubscribeDeps } from "@/newsletter/infrastructure/composition";
import { createLogger } from "@/lib/logger";

export const runtime = "nodejs";
const log = createLogger("subscribe");

/** Enlace del correo: ejecuta la acción y redirige a /{locale}/newsletter/{estado} (página estática). */
export async function GET(req: Request) {
  const url = new URL(req.url);
  const locale = hasLocale(routing.locales, url.searchParams.get("locale")) ? url.searchParams.get("locale") : routing.defaultLocale;
  let status: string = "error";
  try {
    const deps = createSubscribeDeps();
    status = deps ? await unsubscribe(url.searchParams.get("token"), deps) : "error";
  } catch (e) {
    log.error("error en unsubscribe", e);
  }
  return NextResponse.redirect(new URL(`/${locale}/newsletter/${status}`, url.origin), 303);
}
