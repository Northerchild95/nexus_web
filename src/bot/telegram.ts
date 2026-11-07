export async function sendMessage(chatId: number, text: string, menu?: string[]): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  if (!token) throw new Error("Falta TELEGRAM_BOT_TOKEN");
  const res = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // Sin parse_mode: texto plano, evita errores por caracteres especiales.
    body: JSON.stringify({
      chat_id: chatId,
      text: text.slice(0, 4000),
      // Teclado con atajos: el botón envía su texto, que la FAQ ya sabe responder.
      ...(menu && {
        reply_markup: {
          keyboard: menu.reduce<{ text: string }[][]>((rows, label, i) => {
            if (i % 2 === 0) rows.push([]);
            rows[rows.length - 1].push({ text: label });
            return rows;
          }, []),
          resize_keyboard: true,
          is_persistent: true,
        },
      }),
    }),
  });
  if (!res.ok) console.error("[bot] sendMessage", res.status, await res.text());
}
