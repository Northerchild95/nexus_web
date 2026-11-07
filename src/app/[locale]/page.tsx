import { notFound } from "next/navigation";
import { hasLocale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import About from "@/components/sections/About";
import BotSection from "@/components/sections/BotSection";
import Features from "@/components/sections/Features";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import Milestones from "@/components/sections/Milestones";
import Opinions from "@/components/sections/Opinions";
import WorldSection from "@/components/world/WorldSection";
import { routing } from "@/i18n/routing";

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return (
    <main>
      <Header />
      <Hero />
      <WorldSection />
      <Features />
      <About />
      <Milestones />
      <Opinions />
      <BotSection />
      <Footer />
    </main>
  );
}
