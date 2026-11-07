import type { Locale } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import About from "@/components/sections/About";
import BotSection from "@/components/sections/BotSection";
import Features from "@/components/sections/Features";
import Milestones from "@/components/sections/Milestones";
import Opinions from "@/components/sections/Opinions";
import Footer from "@/components/sections/Footer";
import Header from "@/components/sections/Header";
import Hero from "@/components/sections/Hero";
import WorldSection from "@/components/world/WorldSection";

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params;
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
