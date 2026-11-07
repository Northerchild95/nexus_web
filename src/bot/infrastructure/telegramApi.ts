import { createLogger } from "../../lib/logger";
import type { Sender } from "../application/ports";

const log = createLogger("telegram");

/** Teclado de atajos en filas de dos: el botón envía su propio texto. */
export function buildKeyboard(menu: string[]) {
  const rows: { text: string }[][] = [];
  menu.forEach((label, i) => {
    if (i % 2 === 0) rows.push([]);
    rows[rows.length - 1].push({ text: label });
  });
  return { keyboard: rows, resize_keyboard: true, is_persistent: true };
}

export function createTelegramSender(token: string, fetchImpl: typeof fetch = fetch): Sender {
  return async (chatId, text, menu) => {
    const res = await fetchImpl(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      // Sin parse_mode: texto plano, evita errores por caracteres especiales.
      body: JSON.stringify({ chat_id: chatId, text: text.slice(0, 4000), ...(menu && { reply_markup: buildKeyboard(menu) }) }),
    });
    if (!res.ok) log.error("sendMessage falló", { status: res.status, body: (await res.text()).slice(0, 300) });
  };
}
