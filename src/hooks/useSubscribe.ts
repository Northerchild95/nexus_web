"use client";
import { useCallback, useState } from "react";
import { postSubscribe } from "@/lib/subscribeClient";

export type SubscribeState = "idle" | "sending" | "success" | "invalid" | "rate_limited" | "unavailable";

/** Máquina de estados del formulario; la red vive en lib/subscribeClient. */
export function useSubscribe(locale: string) {
  const [state, setState] = useState<SubscribeState>("idle");
  const submit = useCallback(
    async (email: string, website: string) => {
      setState("sending");
      const r = await postSubscribe(email, locale, website);
      setState(r.ok ? "success" : r.reason);
    },
    [locale],
  );
  return { state, submit };
}
