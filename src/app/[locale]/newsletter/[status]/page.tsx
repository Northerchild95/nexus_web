import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { isNewsletterStatus, NEWSLETTER_STATUSES } from "@/config/subscribe";
import { Link } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

type Props = { params: Promise<{ locale: string; status: string }> };

export const dynamicParams = false;
export const metadata: Metadata = { robots: { index: false, follow: false } }; // páginas de estado: fuera de Google

export function generateStaticParams() {
  return routing.locales.flatMap((locale) => NEWSLETTER_STATUSES.map((status) => ({ locale, status })));
}

export default async function NewsletterStatusPage({ params }: Props) {
  const { locale, status } = await params;
  if (!hasLocale(routing.locales, locale) || !isNewsletterStatus(status)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "Newsletter" });
  return (
    <main id="main" className="grid min-h-screen place-items-center px-6 text-center">
      <div className="max-w-md">
        <h1 className="text-4xl font-bold tracking-tight">{t(`${status}.title`)}</h1>
        <p className="mt-4 text-lg leading-7 text-muted">{t(`${status}.text`)}</p>
        <Link href="/" className="mt-8 inline-block rounded-full bg-brand-600 px-6 py-3 font-semibold text-white shadow-lift">
          {t("home")}
        </Link>
      </div>
    </main>
  );
}
