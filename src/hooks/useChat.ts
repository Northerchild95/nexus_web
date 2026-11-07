"use client";
import { useCallback, useRef, useState } from "react";
import { postChat } from "@/lib/chatClient";

export type ChatMessage = { id: number; role: "user" | "bot"; text: string };

/** Estado del chat: mensajes, envío y errores traducidos. La red vive en lib/chatClient (fácil de probar). */
export function useChat(locale: string, labels: { error: string; rateLimited: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [pending, setPending] = useState(false);
  const nextId = useRef(1);

  const send = useCallback(
    async (raw: string) => {
      const text = raw.trim();
      if (!text || pending) return;
      setMessages((m) => [...m, { id: nextId.current++, role: "user", text }]);
      setPending(true);
      const result = await postChat(text, locale);
      const reply = result.ok ? result.reply : result.reason === "rate_limited" ? labels.rateLimited : labels.error;
      setMessages((m) => [...m, { id: nextId.current++, role: "bot", text: reply }]);
      setPending(false);
    },
    [pending, locale, labels.error, labels.rateLimited],
  );

  return { messages, pending, send };
}
