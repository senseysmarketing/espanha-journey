import HeroSection from "@/components/landing/HeroSection";
import ExpertSection from "@/components/landing/ExpertSection";
import BentoEcosystem from "@/components/landing/BentoEcosystem";
import SavingsCalculator from "@/components/landing/SavingsCalculator";
import FAQSection from "@/components/landing/FAQSection";
import StickyCTADock from "@/components/landing/StickyCTADock";

const LandingPage = () => (
  <div className="min-h-screen bg-[#FAFAF8] overflow-x-hidden">
    <HeroSection />
    <ExpertSection />
    <BentoEcosystem />
    <SavingsCalculator />
    <FAQSection />
    <StickyCTADock />

    {/* Footer */}
    <footer className="py-12 px-6 text-center border-t border-[hsl(220,15%,92%)]">
      <p className="text-sm text-[hsl(220,10%,55%)]">
        © 2025 Espanha Pass. Todos os direitos reservados.
      </p>
    </footer>
  </div>
);

export default LandingPage;
