"use client";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

export default function LocaleSwitcher() {
  const t = useTranslations("LocaleSwitcher");
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <nav aria-label={t("label")} className="flex rounded-full bg-card p-1 shadow-card">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          lang={l}
          aria-current={l === locale ? "true" : undefined}
          onClick={() => router.replace(pathname, { locale: l })}
          className="rounded-full px-3 py-1 text-sm font-semibold text-muted aria-[current=true]:bg-brand-600 aria-[current=true]:text-white"
        >
          {t(l)}
        </button>
      ))}
    </nav>
  );
}
