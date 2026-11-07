import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";

type Status = "done" | "now" | "next";
const ITEMS: { id: "base" | "landing" | "bot" | "beta" | "launch"; status: Status }[] = [
  { id: "base", status: "done" },
  { id: "landing", status: "done" },
  { id: "bot", status: "now" },
  { id: "beta", status: "next" },
  { id: "launch", status: "next" },
];
const DOT: Record<Status, string> = {
  done: "bg-success",
  now: "bg-brand-500 ring-4 ring-brand-500/25",
  next: "border-2 border-border bg-surface",
};

export default function Milestones() {
  const t = useTranslations("Milestones");
  return (
    <section id="milestones" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      {/* Es una secuencia real, por eso una lista ordenada con línea de tiempo */}
      <ol className="relative mt-14 max-w-2xl border-l-2 border-border pl-8">
        {ITEMS.map((m) => (
          <li key={m.id} className="relative pb-10 last:pb-0">
            <span aria-hidden className={`absolute -left-[41px] top-1.5 h-4 w-4 rounded-full ${DOT[m.status]}`} />
            <div className="flex flex-wrap items-center gap-3">
              <h3 className="text-xl font-bold">{t(`${m.id}.title`)}</h3>
              <span className="rounded-full bg-surfaceStrong px-3 py-0.5 text-xs font-semibold text-muted">
                {t(`status.${m.status}`)}
              </span>
            </div>
            <p className="mt-1.5 leading-6 text-muted">{t(`${m.id}.text`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
