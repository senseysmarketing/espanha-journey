import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OnboardingFlow from "@/components/OnboardingFlow";
import FloatingDock from "@/components/FloatingDock";
import JourneyMap from "@/components/JourneyMap";
import NationalityClock from "@/components/NationalityClock";
import DocumentVault from "@/components/DocumentVault";
import CitaHunter from "@/components/CitaHunter";
import AIConsierge from "@/components/AIConsierge";
import ProfileView from "@/components/ProfileView";
import SecuritySection from "@/components/SecuritySection";
import SVGFilters from "@/components/SVGFilters";

const tabComponents: Record<string, React.FC> = {
  journey: JourneyMap,
  vault: DocumentVault,
  cita: CitaHunter,
  security: SecuritySection,
  ai: AIConsierge,
  profile: ProfileView,
};

const Index = () => {
  const [onboarded, setOnboarded] = useState(false);
  const [activeTab, setActiveTab] = useState("journey");
  const [showClock, setShowClock] = useState(false);

  const handleOnboardingComplete = (profile: string) => {
    setOnboarded(true);
  };

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="min-h-screen bg-background bg-mesh relative overflow-x-hidden">
      <SVGFilters />

      <AnimatePresence>
        {!onboarded && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {onboarded && (
        <>
          {/* Top bar with clock toggle */}
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-bold text-gradient-primary">Espanha Pass</h2>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setShowClock(!showClock)}
              className="glass squircle-xs px-4 py-2 text-sm font-medium text-foreground flex items-center gap-2"
            >
              🇪🇸 {showClock ? "Mapa" : "730 dias"}
            </motion.button>
          </motion.header>

          {/* Main content */}
          <main className="pt-20">
            <AnimatePresence mode="wait">
              {showClock ? (
                <motion.div
                  key="clock"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.3 }}
                >
                  <NationalityClock />
                </motion.div>
              ) : (
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <ActiveComponent />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          <FloatingDock activeTab={activeTab} onTabChange={(tab) => { setActiveTab(tab); setShowClock(false); }} />
        </>
      )}
    </div>
  );
};

export default Index;
