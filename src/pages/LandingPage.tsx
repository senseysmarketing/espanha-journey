import { useState, useCallback } from "react";
import HeroSection from "@/components/landing/HeroSection";
import ExpertSection from "@/components/landing/ExpertSection";
import BentoEcosystem from "@/components/landing/BentoEcosystem";
import SavingsCalculator from "@/components/landing/SavingsCalculator";
import FAQSection from "@/components/landing/FAQSection";
import StickyCTADock from "@/components/landing/StickyCTADock";
import SVGFilters from "@/components/SVGFilters";

const LandingPage = () => {
  const [glow, setGlow] = useState({ x: 0, y: 0 });

  const handlePointer = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    const { clientX, clientY } = "touches" in e ? e.touches[0] : e;
    setGlow({ x: clientX, y: clientY + window.scrollY });
  }, []);

  return (
    <div
      className="relative min-h-screen bg-[#FAFAF8] overflow-x-hidden"
      onMouseMove={handlePointer}
      onTouchMove={handlePointer}
    >
      <SVGFilters />

      {/* Mesh gradient blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-100"
          style={{
            background: "hsla(32,70%,55%,0.12)",
            animation: "mesh-float-1 20s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute top-[40%] right-[5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-100"
          style={{
            background: "hsla(210,60%,50%,0.08)",
            animation: "mesh-float-2 18s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[450px] h-[450px] rounded-full blur-[120px] opacity-100"
          style={{
            background: "hsla(15,50%,50%,0.06)",
            animation: "mesh-float-3 22s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Aurora cursor glow */}
      <div
        className="absolute pointer-events-none z-[1] w-[300px] h-[300px] rounded-full blur-[80px] transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle, hsla(32,80%,55%,0.15), hsla(210,60%,55%,0.08), transparent 70%)",
          left: glow.x - 150,
          top: glow.y - 150,
          opacity: glow.x === 0 ? 0 : 1,
        }}
      />

      <div className="relative z-10">
        <HeroSection />
        <ExpertSection />
        <BentoEcosystem />
        <SavingsCalculator />
        <FAQSection />
        <StickyCTADock />

        <footer className="py-12 px-6 text-center border-t border-[hsl(220,15%,92%)]">
          <p className="text-sm text-[hsl(220,10%,55%)]">
            © 2025 Espanha Pass. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
