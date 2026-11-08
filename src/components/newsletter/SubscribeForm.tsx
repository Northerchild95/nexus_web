"use client";
import { useState, type SubmitEvent } from "react";
import { useSubscribe } from "@/hooks/useSubscribe";

export type SubscribeLabels = {
  label: string; placeholder: string; submit: string; sending: string; note: string;
  success: string; invalid: string; rateLimited: string; unavailable: string;
};

export default function SubscribeForm({ locale, labels }: { locale: string; labels: SubscribeLabels }) {
  const [email, setEmail] = useState("");
  const [website, setWebsite] = useState(""); // campo trampa: las personas no lo ven ni lo llenan
  const { state, submit } = useSubscribe(locale);
  const message: Partial<Record<typeof state, string>> = {
    success: labels.success, invalid: labels.invalid, rate_limited: labels.rateLimited, unavailable: labels.unavailable,
  };

  const onSubmit = (e: SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    void submit(email, website);
  };

  return (
    <form onSubmit={onSubmit} noValidate className="max-w-xl">
      <label htmlFor="subscribe-email" className="sr-only">{labels.label}</label>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input id="subscribe-email" type="email" inputMode="email" autoComplete="email" required value={email}
          onChange={(e) => setEmail(e.target.value)} placeholder={labels.placeholder} maxLength={254}
          aria-invalid={state === "invalid"} aria-describedby="subscribe-status"
          className="min-w-0 flex-1 rounded-full border border-border bg-card px-5 py-3.5 placeholder:text-muted" />
        <button type="submit" disabled={state === "sending" || state === "success"}
          className="rounded-full bg-brand-600 px-6 py-3.5 font-semibold text-white shadow-lift disabled:opacity-60">
          {state === "sending" ? labels.sending : labels.submit}
        </button>
      </div>
      <div aria-hidden className="absolute -left-[9999px] h-0 w-0 overflow-hidden">
        <input type="text" name="website" tabIndex={-1} autoComplete="off" value={website} onChange={(e) => setWebsite(e.target.value)} />
      </div>
      <p id="subscribe-status" role="status" aria-live="polite"
        className={`mt-3 min-h-6 text-sm font-semibold ${state === "success" ? "text-success" : "text-danger"}`}>
        {message[state] ?? ""}
      </p>
      <p className="mt-1 text-sm text-muted">{labels.note}</p>
    </form>
  );
}
