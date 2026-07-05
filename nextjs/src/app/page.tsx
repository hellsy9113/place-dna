import { FinalCTASection } from "@/components/home/FinalCTASection";
import { CardRevealsSection } from "@/components/home/CardRevealsSection";
import { HeroSection } from "@/components/home/HeroSection";
import { HowItWorksSection } from "@/components/home/HowItWorksSection";
import { RaritySystemSection } from "@/components/home/RaritySystemSection";
import { Footer } from "@/components/layout/Footer";
import { Navbar } from "@/components/layout/Navbar";
import { PatternBackground } from "@/components/ui/PatternBackground";

export default function HomePage() {
  return (
    <main id="top" className="relative overflow-x-clip pb-6">
      <PatternBackground />

      <Navbar />
      <HeroSection />
      <HowItWorksSection />
      <CardRevealsSection />
      <RaritySystemSection />
      <FinalCTASection />
      <Footer />
    </main>
  );
}
