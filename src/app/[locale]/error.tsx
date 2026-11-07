"use client";
import { useEffect } from "react";
import { useTranslations } from "next-intl";

export default function ErrorBoundary({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  const t = useTranslations("Errors");
  useEffect(() => {
    console.error(JSON.stringify({ level: "error", scope: "ui", msg: error.message, digest: error.digest }));
  }, [error]);
  return (
    <main id="main" className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-5xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted">{t("text")}</p>
        <button type="button" onClick={reset} className="mt-8 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lift">
          {t("retry")}
        </button>
      </div>
    </main>
  );
}
