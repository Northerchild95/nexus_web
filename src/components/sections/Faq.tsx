import { useTranslations } from "next-intl";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { buildFaqJsonLd } from "@/lib/seo/jsonld";

const IDS = ["what", "available", "price", "platforms", "bot", "languages"] as const;

export default function Faq() {
  const t = useTranslations("Faq");
  const items = IDS.map((id) => ({ q: t(`${id}.q`), a: t(`${id}.a`) }));
  return (
    <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      <JsonLd data={buildFaqJsonLd(items)} />
      {/* <details> nativo: accesible por teclado, sin JavaScript */}
      <div className="mt-10 max-w-3xl divide-y divide-border border-y border-border">
        {items.map((i) => (
          <details key={i.q} className="group py-5">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-lg font-semibold [&::-webkit-details-marker]:hidden">
              {i.q}
              <span aria-hidden className="text-2xl text-muted transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="mt-3 leading-7 text-muted">{i.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}
