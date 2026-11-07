import type { MetadataRoute } from "next";
import { siteUrl } from "@/config/site";
import { routing } from "@/i18n/routing";

export default function sitemap(): MetadataRoute.Sitemap {
  const languages = Object.fromEntries(routing.locales.map((l) => [l, `${siteUrl}/${l}`]));
  return routing.locales.map((l) => ({
    url: `${siteUrl}/${l}`,
    lastModified: new Date(),
    alternates: { languages },
  }));
}
