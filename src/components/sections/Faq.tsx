import { useTranslations } from "next-intl";
import FaqItem from "./FaqItem";
import JsonLd from "@/components/ui/JsonLd";
import SectionHeader from "@/components/ui/SectionHeader";
import { buildFaqJsonLd } from "@/lib/seo/jsonld";

const IDS = ["what", "available", "price", "platforms", "bot", "languages"] as const;

export default function Faq() {
  const t = useTranslations("Faq");
  const items = IDS.map((id) => ({ id, q: t(`${id}.q`), a: t(`${id}.a`) }));
  return (
    <section id="faq" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      <JsonLd data={buildFaqJsonLd(items.map(({ q, a }) => ({ q, a })))} />
      <div className="mt-10 max-w-3xl divide-y divide-border border-y border-border">
        {items.map((i) => (
          <FaqItem key={i.id} id={`faq-${i.id}`} question={i.q} answer={i.a} />
        ))}
      </div>
    </section>
  );
}
