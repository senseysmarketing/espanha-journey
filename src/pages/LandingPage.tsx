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
      className="relative min-h-screen bg-background overflow-x-hidden"
      onMouseMove={handlePointer}
      onTouchMove={handlePointer}
    >
      <SVGFilters />

      {/* Mesh gradient blobs — warm tones */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div
          className="absolute top-[10%] left-[5%] w-[600px] h-[600px] rounded-full blur-[120px] opacity-100"
          style={{
            background: "hsla(17,80%,30%,0.1)",
            animation: "mesh-float-1 20s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute top-[40%] right-[5%] w-[500px] h-[500px] rounded-full blur-[120px] opacity-100"
          style={{
            background: "hsla(21,80%,41%,0.07)",
            animation: "mesh-float-2 18s ease-in-out infinite alternate",
          }}
        />
        <div
          className="absolute bottom-[10%] left-[30%] w-[450px] h-[450px] rounded-full blur-[120px] opacity-100"
          style={{
            background: "hsla(33,73%,62%,0.06)",
            animation: "mesh-float-3 22s ease-in-out infinite alternate",
          }}
        />
      </div>

      {/* Aurora cursor glow */}
      <div
        className="absolute pointer-events-none z-[1] w-[300px] h-[300px] rounded-full blur-[80px] transition-opacity duration-300"
        style={{
          background: "radial-gradient(circle, hsla(17,80%,30%,0.12), hsla(21,80%,41%,0.06), transparent 70%)",
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

        <footer className="py-12 px-6 text-center border-t border-border">
          <p className="text-sm text-muted-foreground">
            © 2025 Instituto Empuria. Todos os direitos reservados.
          </p>
        </footer>
      </div>
    </div>
  );
};

export default LandingPage;
