"use client";
import { useEffect, useRef, useState, type SubmitEvent } from "react";
import { useChat } from "@/hooks/useChat";
import { CHAT_MAX_LENGTH } from "@/config/chat";

export type ChatLabels = {
  open: string; close: string; title: string; greeting: string; suggestions: string;
  placeholder: string; send: string; reset: string; thinking: string; error: string; rateLimited: string;
};

const bubble = "max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-5";

export default function ChatWidget({ locale, labels, suggestions }: { locale: string; labels: ChatLabels; suggestions: string[] }) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const { messages, pending, send, reset } = useChat(locale, { error: labels.error, rateLimited: labels.rateLimited });
  const input = useRef<HTMLInputElement>(null);
  const list = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);

  useEffect(() => { if (open) input.current?.focus(); }, [open]);
  useEffect(() => { if (list.current) list.current.scrollTop = list.current.scrollHeight; }, [messages, pending, open]);
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setOpen(false); launcher.current?.focus(); }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const submit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = draft;
    setDraft("");
    void send(text);
  };

  return (
    <>
      {open && (
        <div role="dialog" aria-label={labels.title}
          className="fixed inset-x-4 bottom-24 z-40 flex max-h-[min(70vh,540px)] flex-col overflow-hidden rounded-4xl border border-border bg-card shadow-lift motion-safe:animate-[chat-in_0.2s_ease-out] sm:inset-x-auto sm:right-5 sm:w-[380px]">
          <div className="flex items-center justify-between gap-3 border-b border-border px-5 py-3">
            <p className="font-bold">{labels.title}</p>
            {messages.length > 0 && (
              <button type="button" onClick={reset} className="rounded-full px-3 py-1 text-sm font-semibold text-brand-700 hover:bg-surfaceStrong">
                {labels.reset}
              </button>
            )}
          </div>

          <div ref={list} role="log" aria-live="polite" className="flex-1 space-y-3 overflow-y-auto px-5 py-4">
            <p className={`${bubble} bg-surfaceStrong`}>{labels.greeting}</p>
            {messages.length === 0 && (
              <div role="group" aria-label={labels.suggestions} className="flex flex-wrap gap-2 pt-1">
                {suggestions.map((s) => (
                  <button key={s} type="button" onClick={() => void send(s)}
                    className="rounded-full border border-border px-3 py-1.5 text-sm font-semibold text-brand-700 hover:bg-surfaceStrong">
                    {s}
                  </button>
                ))}
              </div>
            )}
            {messages.map((m) => (
              <p key={m.id} className={`${bubble} ${m.role === "user" ? "ml-auto bg-brand-600 text-white" : "bg-surfaceStrong"}`}>{m.text}</p>
            ))}
            {pending && <p className={`${bubble} bg-surfaceStrong text-muted`}>{labels.thinking}</p>}
          </div>

          <form onSubmit={submit} className="flex gap-2 border-t border-border p-3">
            <input ref={input} value={draft} onChange={(e) => setDraft(e.target.value)} maxLength={CHAT_MAX_LENGTH}
              placeholder={labels.placeholder} aria-label={labels.placeholder}
              className="min-w-0 flex-1 rounded-full bg-surfaceStrong px-4 py-2.5 text-sm placeholder:text-muted" />
            <button type="submit" disabled={pending || !draft.trim()}
              className="rounded-full bg-brand-600 px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
              {labels.send}
            </button>
          </form>
        </div>
      )}

      <button ref={launcher} type="button" aria-expanded={open} aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((o) => !o)}
        className="fixed bottom-5 right-5 z-40 grid h-14 w-14 place-items-center rounded-full bg-brand-600 text-white shadow-lift">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z" />}
        </svg>
      </button>
    </>
  );
}
