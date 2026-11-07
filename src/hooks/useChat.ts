"use client";
import { useCallback, useRef, useState } from "react";
import { postChat, toHistory } from "@/lib/chatClient";

export type ChatMessage = { id: number; role: "user" | "bot"; text: string; error?: boolean };

/** Estado del chat: mensajes con memoria (se envía el historial reciente), errores traducidos y reinicio. */
export function useChat(locale: string, labels: { error: string; rateLimited: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const current = useRef<ChatMessage[]>([]); // copia síncrona para armar el historial sin depender del render
  const nextId = useRef(1);
  const epoch = useRef(0); // invalida respuestas que llegan después de reiniciar la conversación

  const apply = (fn: (m: ChatMessage[]) => ChatMessage[]) => {
    current.current = fn(current.current);
    setMessages(current.current);
  };

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;
      const mine = epoch.current;
      apply((m) => [...m, { id: nextId.current++, role: "user", text }]);
      setPending(true);
      const result = await postChat(toHistory(current.current), locale);
      if (mine !== epoch.current) return;
      const reply = result.ok ? result.reply : result.reason === "rate_limited" ? labels.rateLimited : labels.error;
      apply((m) => [...m, { id: nextId.current++, role: "bot", text: reply, error: !result.ok }]);
      setPending(false);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [pending, locale, labels.error, labels.rateLimited],
  );

  const reset = useCallback(() => {
    epoch.current++;
    apply(() => []);
    setPending(false);
  }, []);

  return { messages, pending, send, reset };
}
