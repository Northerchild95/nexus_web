"use client";
import { useState } from "react";
import { FAQ_ANIMATION_MS, FAQ_EASING } from "@/config/ui";

/**
 * Acordeón animado: la altura transiciona con grid-template-rows (0fr → 1fr), que funciona en todos los
 * navegadores y no necesita medir el contenido. El texto sigue en el HTML (SEO) pero queda inerte al cerrarse.
 */
export default function FaqItem({ id, question, answer }: { id: string; question: string; answer: string }) {
  const [open, setOpen] = useState(false);
  const timing = { transitionDuration: `${FAQ_ANIMATION_MS}ms`, transitionTimingFunction: FAQ_EASING };
  return (
    <div className="py-5">
      <h3>
        <button
          type="button"
          id={`${id}-button`}
          aria-expanded={open}
          aria-controls={`${id}-panel`}
          onClick={() => setOpen((o) => !o)}
          className="flex w-full items-center justify-between gap-4 text-left text-lg font-semibold"
        >
          {question}
          <span aria-hidden style={timing} className={`text-2xl text-muted transition-transform motion-reduce:transition-none ${open ? "rotate-45" : ""}`}>+</span>
        </button>
      </h3>
      <div
        id={`${id}-panel`}
        role="region"
        aria-labelledby={`${id}-button`}
        inert={!open}
        style={{ ...timing, gridTemplateRows: open ? "1fr" : "0fr" }}
        className={`grid transition-[grid-template-rows,opacity] motion-reduce:transition-none ${open ? "opacity-100" : "opacity-0"}`}
      >
        <div className="overflow-hidden">
          <p className="pt-3 leading-7 text-muted">{answer}</p>
        </div>
      </div>
    </div>
  );
}
