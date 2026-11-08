import { useLocale, useTranslations } from "next-intl";
import SubscribeForm from "@/components/newsletter/SubscribeForm";
import SectionHeader from "@/components/ui/SectionHeader";
import { subscribeEnabled } from "@/config/subscribe";

export default function Subscribe() {
  const t = useTranslations("Subscribe");
  const locale = useLocale();
  if (!subscribeEnabled) return null; // sin almacén o proveedor de correo, no se muestra un formulario roto
  return (
    <section id="subscribe" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-24">
      <SectionHeader title={t("title")} lead={t("lead")} />
      <div className="relative mt-10">
        <SubscribeForm
          locale={locale}
          labels={{
            label: t("label"), placeholder: t("placeholder"), submit: t("submit"), sending: t("sending"), note: t("note"),
            success: t("success"), invalid: t("invalid"), rateLimited: t("rateLimited"), unavailable: t("unavailable"),
          }}
        />
      </div>
    </section>
  );
}
