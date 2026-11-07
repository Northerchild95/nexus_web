import { useTranslations } from "next-intl";

const PRINCIPLES = ["clarity", "calm", "consistency"] as const;

export default function About() {
  const t = useTranslations("About");
  return (
    <section id="about" className="mx-auto grid max-w-6xl scroll-mt-24 gap-12 px-6 py-24 md:grid-cols-5">
      <div className="md:col-span-2">
        <h2 className="text-4xl font-bold leading-[1.1] tracking-tight md:text-5xl">{t("title")}</h2>
      </div>
      <div className="md:col-span-3">
        <p className="text-2xl font-semibold leading-9 tracking-tight">{t("lead")}</p>
        <p className="mt-5 text-lg leading-7 text-muted">{t("body")}</p>
        <dl className="mt-10 divide-y divide-border border-y border-border">
          {PRINCIPLES.map((p) => (
            <div key={p} className="grid gap-1 py-5 sm:grid-cols-3 sm:gap-6">
              <dt className="font-bold">{t(`${p}.title`)}</dt>
              <dd className="text-muted sm:col-span-2">{t(`${p}.text`)}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
