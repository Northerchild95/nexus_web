import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";

const STEPS = ["capture", "focus", "review"] as const;

export default function HowItWorks() {
  const t = useTranslations("HowItWorks");
  return (
    <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      {/* Es una secuencia, por eso la lista es ordenada y lleva numeración */}
      <ol className="mt-14 grid gap-10 md:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s} className="border-t-2 border-brand-500 pt-5">
            <span aria-hidden className="text-5xl font-bold text-brand-500/40">{i + 1}</span>
            <h3 className="mt-2 text-2xl font-bold tracking-tight">{t(`${s}.title`)}</h3>
            <p className="mt-2 leading-7 text-muted">{t(`${s}.text`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
