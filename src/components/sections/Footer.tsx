import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("Footer");
  return (
    <footer className="border-t border-border px-6 py-20 text-center">
      <p className="text-3xl font-bold tracking-tight">{t("title")}</p>
      <p className="mt-3 text-muted">{t("note")}</p>
    </footer>
  );
}
