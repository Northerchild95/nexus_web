import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { TECH_GROUPS } from "@/config/tech";

export default function Tech() {
  const t = useTranslations("Tech");
  return (
    <section id="tech" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      <div className="mt-14 grid gap-12 md:grid-cols-3">
        {TECH_GROUPS.map((g) => (
          <article key={g.id}>
            <h3 className="text-2xl font-bold tracking-tight">{t(`${g.id}.title`)}</h3>
            <p className="mt-3 leading-7 text-muted">{t(`${g.id}.text`)}</p>
            <ul className="mt-5 flex flex-wrap gap-2">
              {g.items.map((item) => (
                <li key={item} className="rounded-full bg-surfaceStrong px-3 py-1 text-sm font-semibold">{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </div>
    </section>
  );
}
