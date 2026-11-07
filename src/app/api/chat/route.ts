import { NextResponse } from "next/server";
import { CHAT_MAX_BODY } from "@/config/chat";
import { handleChat } from "@/bot/application/chat";
import { createChatDeps } from "@/bot/infrastructure/composition";
import { clientIp, isSameOrigin } from "@/lib/http";
import { createLogger } from "@/lib/logger";

export const runtime = "nodejs";
const log = createLogger("chat");

/** Capa delgada: protege la entrada (origen, tamaño, JSON) y delega en el caso de uso `handleChat`. */
export async function POST(req: Request) {
  if (!isSameOrigin(req.headers.get("origin"), req.headers.get("host"))) {
    return NextResponse.json({ error: "forbidden" }, { status: 403 });
  }
  const raw = await req.text();
  if (raw.length > CHAT_MAX_BODY) return NextResponse.json({ error: "too_large" }, { status: 413 });

  let body: { messages?: unknown; locale?: unknown };
  try {
    body = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "invalid" }, { status: 400 });
  }

  try {
    const result = await handleChat({ messages: body?.messages, locale: body?.locale, ip: clientIp(req.headers) }, createChatDeps());
    if (result.status === "invalid") return NextResponse.json({ error: "invalid" }, { status: 400 });
    if (result.status === "rate_limited") return NextResponse.json({ error: "rate_limited" }, { status: 429 });
    return NextResponse.json({ reply: result.reply });
  } catch (e) {
    log.error("error procesando el chat", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
