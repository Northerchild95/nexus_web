import { useTranslations } from "next-intl";
import FinanceUi from "@/components/scenes/FinanceUi";
import FocusUi from "@/components/scenes/FocusUi";
import HabitsUi from "@/components/scenes/HabitsUi";
import InsightsUi from "@/components/scenes/InsightsUi";
import TasksUi from "@/components/scenes/TasksUi";
import SectionHeader from "@/components/ui/SectionHeader";

const FEATURES = [
  { id: "focus", ui: <FocusUi />, tint: "bg-brand-100" },
  { id: "tasks", ui: <TasksUi />, tint: "bg-accent-aqua" },
  { id: "habits", ui: <HabitsUi />, tint: "bg-accent-mint" },
  { id: "finance", ui: <FinanceUi />, tint: "bg-accent-amber" },
  { id: "insights", ui: <InsightsUi />, tint: "bg-accent-rose" },
] as const;
const POINTS = ["p1", "p2", "p3"] as const;

export default function Features() {
  const t = useTranslations("Features");
  return (
    <section id="features" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      <div className="mt-16 space-y-20 md:space-y-28">
        {FEATURES.map((f, i) => (
          <article key={f.id} className="grid items-center gap-10 md:grid-cols-2 md:gap-16">
            <div className={`flex justify-center rounded-4xl py-12 shadow-card ${f.tint} ${i % 2 ? "md:order-2" : ""}`}>
              {f.ui}
            </div>
            <div>
              <h3 className="text-3xl font-bold tracking-tight">{t(`${f.id}.title`)}</h3>
              <p className="mt-3 text-lg leading-7 text-muted">{t(`${f.id}.lead`)}</p>
              <ul className="mt-6 divide-y divide-border border-y border-border">
                {POINTS.map((p) => (
                  <li key={p} className="py-3.5 leading-6">{t(`${f.id}.${p}`)}</li>
                ))}
              </ul>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
