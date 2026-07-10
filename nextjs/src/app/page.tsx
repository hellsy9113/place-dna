import type { Metadata } from "next";

import { FinalCTASection } from "@/components/home/FinalCTASection";
import { CardRevealsSection } from "@/components/home/CardRevealsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { LocationIntelligenceSection } from "@/components/home/LocationIntelligenceSection";
import { RaritySystemSection } from "@/components/home/RaritySystemSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PatternBackground } from "@/components/ui/PatternBackground";

import { siteConfig } from "@/lib/site";

export const metadata: Metadata = {
  title: "PlaceDNA — GIS-Powered Place Cards for India",
  description:
    "Click a location in India and generate a collectible PlaceDNA card with GIS-inspired place context, vegetation, population pressure, nearby landmarks, and livability signals.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: siteConfig.title,
    description: siteConfig.description,
    url: siteConfig.url,
    images: [
      {
        url: siteConfig.ogImage,
        width: 1200,
        height: 630,
        alt: "PlaceDNA preview showing a collectible place card and India map design",
      },
    ],
  },
};

export default function HomePage() {
  return (
    <main id="top" className="relative overflow-x-clip pb-6">
      <PatternBackground />

      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <CardRevealsSection />
      <RaritySystemSection />
      <LocationIntelligenceSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
