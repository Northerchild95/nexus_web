import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";

export default function NotFound() {
  const t = useTranslations("NotFound");
  return (
    <main id="main" className="grid min-h-screen place-items-center px-6 text-center">
      <div>
        <h1 className="text-5xl font-bold tracking-tight">{t("title")}</h1>
        <p className="mt-4 text-lg text-muted">{t("text")}</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lift">
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
