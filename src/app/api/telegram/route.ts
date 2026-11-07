import { NextResponse } from "next/server";
import { buildReply } from "@/bot/reply";
import { sendMessage } from "@/bot/telegram";

export const runtime = "nodejs";

type Update = {
  message?: { text?: string; chat?: { id: number }; from?: { language_code?: string } };
};

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

  const locale = update.message?.from?.language_code?.startsWith("en") ? "en" : "es";
  try {
    await sendMessage(chatId, await buildReply(text, locale));
  } catch (e) {
    console.error("[bot]", e);
  }
  return NextResponse.json({ ok: true }); // siempre 200 para que Telegram no reintente en bucle
}
