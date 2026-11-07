import { NextResponse } from "next/server";
import { createLogger } from "@/lib/logger";
import { buildReply } from "@/bot/application/reply";
import { pickLocale } from "@/bot/domain/detect";
import { createDeps, createSender } from "@/bot/infrastructure/composition";

export const runtime = "nodejs";

const log = createLogger("webhook");

type Update = {
  update_id?: number;
  message?: { text?: string; chat?: { id: number }; from?: { language_code?: string } };
};

/** Capa delgada: valida el secreto, extrae datos y delega en el caso de uso `buildReply`. */
export async function POST(req: Request) {
  // Telegram envía este encabezado (lo definimos en setWebhook). Sin él, cualquiera podría llamar la ruta.
  const secret = process.env.TELEGRAM_WEBHOOK_SECRET;
  if (!secret || req.headers.get("x-telegram-bot-api-secret-token") !== secret) {
    return new NextResponse("Unauthorized", { status: 401 });
  }

  const update: Update = await req.json().catch(() => ({}));
  const text = update.message?.text;
  const chatId = update.message?.chat?.id;
  if (!text || !chatId) return NextResponse.json({ ok: true });

  try {
    const locale = pickLocale(text, update.message?.from?.language_code);
    const reply = await buildReply({ text, chatId, updateId: update.update_id ?? 0, locale }, createDeps());
    if (reply) await createSender()(chatId, reply.text, reply.menu);
  } catch (e) {
    log.error("error procesando el mensaje", e);
  }
  return NextResponse.json({ ok: true }); // siempre 200 para que Telegram no reintente en bucle
}
