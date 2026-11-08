import type { CSSProperties } from "react";
import { useTranslations } from "next-intl";
import { subscribeEnabled } from "@/config/subscribe";

const rot = (deg: number) => ({ "--r": `${deg}deg` }) as CSSProperties;

export default function Hero() {
  const t = useTranslations("Hero");
  return (
    <section id="top" className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden px-6 text-center">
      <div aria-hidden className="float absolute -left-10 top-24 h-40 w-40 rounded-4xl bg-accent-aqua" style={rot(-12)} />
      <div aria-hidden className="float absolute -right-8 bottom-28 h-52 w-52 rounded-full bg-accent-rose" />
      <div aria-hidden className="float absolute bottom-20 left-[18%] h-20 w-20 rounded-3xl bg-accent-mint" style={rot(16)} />
      <p className="relative mb-6 rounded-full bg-card px-4 py-1.5 text-sm font-semibold text-brand-700 shadow-card">
        {t("badge")}
      </p>
      <h1 className="relative max-w-3xl text-5xl font-bold leading-[1.02] tracking-tight md:text-7xl">
        {t("title")}
      </h1>
      <p className="relative mt-6 max-w-xl text-lg leading-7 text-muted">{t("subtitle")}</p>
      {subscribeEnabled && (
        <a href="#subscribe" className="relative mt-8 rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lift">
          {t("notify")}
        </a>
      )}
    </section>
  );
}
