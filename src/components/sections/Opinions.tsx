import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { OPINIONS, OPINIONS_ARE_SAMPLES } from "@/config/opinions";

export default function Opinions() {
  const t = useTranslations("Opinions");
  return (
    <section id="opinions" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      {OPINIONS_ARE_SAMPLES && (
        <p className="mt-4 inline-block rounded-full bg-accent-amber px-3 py-1 text-xs font-semibold">{t("sample")}</p>
      )}
      <div className="mt-12 grid gap-x-12 gap-y-14 md:grid-cols-2">
        {OPINIONS.map((o, i) => (
          <figure key={o} className={i === 0 ? "md:col-span-2" : ""}>
            <blockquote className={`font-semibold leading-snug tracking-tight ${i === 0 ? "text-3xl md:text-4xl" : "text-xl"}`}>
              “{t(`${o}.quote`)}”
            </blockquote>
            <figcaption className="mt-4 text-muted">
              <span className="font-semibold text-ink">{t(`${o}.name`)}</span> · {t(`${o}.role`)}
            </figcaption>
          </figure>
        ))}
      </div>
    </section>
  );
}
