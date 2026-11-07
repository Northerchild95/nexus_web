import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import About from "@/components/sections/About";
import BotSection from "@/components/sections/BotSection";
import Faq from "@/components/sections/Faq";
import Features from "@/components/sections/Features";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import HowItWorks from "@/components/sections/HowItWorks";
import Milestones from "@/components/sections/Milestones";
import Opinions from "@/components/sections/Opinions";
import JsonLd from "@/components/ui/JsonLd";
import WorldSection from "@/components/world/WorldSection";
import { siteUrl } from "@/config/site";
import { routing } from "@/i18n/routing";
import { buildWebSiteJsonLd } from "@/lib/seo/jsonld";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <main id="main">
      <JsonLd data={buildWebSiteJsonLd("Nexus Life", `${siteUrl}/${locale}`, locale)} />
      <Header />
      <Hero />
      <WorldSection />
      <HowItWorks />
      <Features />
      <About />
      <Milestones />
      <Opinions />
      <Faq />
      <BotSection />
      <Footer />
    </main>
  );
}
