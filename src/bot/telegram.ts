type ReplyMarkup =
  | { keyboard: { text: string }[][]; resize_keyboard?: boolean; is_persistent?: boolean }
  | { remove_keyboard: true };

export async function sendMessage(
  chatId: number,
  text: string,
  replyMarkup?: ReplyMarkup,
): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Falta TELEGRAM_BOT_TOKEN");
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Sin parse_mode: texto plano, evita errores por caracteres especiales.
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4000),
      ...(replyMarkup ? { reply_markup: replyMarkup } : {}),
    }),
  });
  if (!res.ok) console.error("[bot] sendMessage", res.status, await res.text());
}
