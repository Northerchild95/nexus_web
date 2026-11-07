import { ImageResponse } from "next/og";
import { hasLocale } from "next-intl";
import { getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";

export const alt = "Nexus Life";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OgImage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const loc = hasLocale(routing.locales, locale) ? locale : routing.defaultLocale;
  const t = await getTranslations({ locale: loc, namespace: "Hero" });
  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column", justifyContent: "center", padding: 80, background: "linear-gradient(135deg, #0b1220 0%, #1e40af 100%)", color: "#fff" }}>
        <div style={{ display: "flex", fontSize: 32, fontWeight: 700, color: "#93bbff" }}>Nexus Life</div>
        <div style={{ display: "flex", marginTop: 24, fontSize: 84, fontWeight: 800, lineHeight: 1.05 }}>{t("title")}</div>
        <div style={{ display: "flex", marginTop: 28, fontSize: 32, color: "#c9d8f5" }}>{t("subtitle")}</div>
      </div>
    ),
    size,
  );
}
