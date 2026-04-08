import { useState, useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import OnboardingFlow from "@/components/OnboardingFlow";
import FloatingDock from "@/components/FloatingDock";
import JourneyMap from "@/components/JourneyMap";
import NationalityClock from "@/components/NationalityClock";
import DocumentVault from "@/components/DocumentVault";
import CitaHunter from "@/components/CitaHunter";
import MentorChat from "@/components/MentorChat";
import ProfileView from "@/components/ProfileView";
import SecuritySection from "@/components/SecuritySection";
import ExploreSection from "@/components/ExploreSection";
import AcademyPass from "@/components/AcademyPass";
import SVGFilters from "@/components/SVGFilters";
import SubscriptionPaywall from "@/components/SubscriptionPaywall";
import { useSubscription } from "@/hooks/useSubscription";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const tabComponents: Record<string, React.FC<any>> = {
  journey: JourneyMap,
  vault: DocumentVault,
  cita: CitaHunter,
  security: SecuritySection,
  explore: ExploreSection,
  academy: AcademyPass,
  ai: MentorChat,
  profile: ProfileView,
};

const Index = () => {
  const [onboarded, setOnboarded] = useState<boolean | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState("journey");
  const [showClock, setShowClock] = useState(false);
  const { subscribed, loading: subLoading } = useSubscription();
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      const { data } = await supabase
        .from("profiles")
        .select("selected_profile")
        .eq("user_id", user.id)
        .single();
      if (data?.selected_profile) {
        setSelectedProfile(data.selected_profile);
        setOnboarded(true);
      } else {
        setOnboarded(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleOnboardingComplete = async (profile: string) => {
    if (user) {
      await supabase
        .from("profiles")
        .update({ selected_profile: profile })
        .eq("user_id", user.id);
    }
    setSelectedProfile(profile);
    setOnboarded(true);
  };

  const handleChangeProfile = async (profile: string) => {
    if (user) {
      await supabase
        .from("profiles")
        .update({ selected_profile: profile })
        .eq("user_id", user.id);
    }
    setSelectedProfile(profile);
  };

  if (onboarded === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="min-h-screen bg-background bg-mesh relative overflow-x-hidden">
      <SVGFilters />
      {!subLoading && !subscribed && <SubscriptionPaywall />}

      <AnimatePresence>
        {!onboarded && (
          <OnboardingFlow onComplete={handleOnboardingComplete} />
        )}
      </AnimatePresence>

      {onboarded && (
        <>
          <motion.header
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="fixed top-0 left-0 right-0 z-40 px-6 py-4 flex items-center justify-between"
          >
            <div>
              <h2 className="text-lg font-bold font-heading text-gradient-primary">Instituto Empuria</h2>
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
                  {activeTab === "profile" ? (
                    <ProfileView onChangeProfile={handleChangeProfile} selectedProfile={selectedProfile} />
                  ) : (
                    <ActiveComponent />
                  )}
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
