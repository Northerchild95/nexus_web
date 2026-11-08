import { useTranslations } from "next-intl";
import SectionHeader from "@/components/ui/SectionHeader";
import { subscribeEnabled } from "@/config/subscribe";

const ITEMS = ["web", "bot", "app"] as const;
const WITH_NEWSLETTER = [...ITEMS, "newsletter"] as const;
type PrivacyItem = (typeof WITH_NEWSLETTER)[number];

export default function Privacy() {
  const t = useTranslations("Privacy");
  const items: readonly PrivacyItem[] = subscribeEnabled ? WITH_NEWSLETTER : ITEMS;
  return (
    <section id="privacy" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      <dl className="mt-12 max-w-3xl divide-y divide-border border-y border-border">
        {items.map((i) => (
          <div key={i} className="grid gap-2 py-6 sm:grid-cols-3 sm:gap-8">
            <dt className="font-bold">{t(`${i}.title`)}</dt>
            <dd className="leading-7 text-muted sm:col-span-2">{t(`${i}.text`)}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
