import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Map, BarChart3, Plane } from "lucide-react";
import ExploreMap from "./ExploreMap";
import NeighborhoodCompare from "./NeighborhoodCompare";
import FlightSearch from "./FlightSearch";

const tabs = [
  { id: "mapa", label: "Mapa", icon: Map },
  { id: "bairros", label: "Bairros", icon: BarChart3 },
  { id: "passagens", label: "Passagens", icon: Plane },
];

const tabContent: Record<string, React.FC> = {
  mapa: ExploreMap,
  bairros: NeighborhoodCompare,
  passagens: FlightSearch,
};

const ExploreSection = () => {
  const [activeTab, setActiveTab] = useState("mapa");

  const ActiveContent = tabContent[activeTab];

  return (
    <div className="max-w-lg mx-auto px-4 py-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-6"
      >
        <h1 className="text-2xl font-bold text-foreground mb-1">Explorar Espanha</h1>
        <p className="text-sm text-muted-foreground">Descubra sua cidade ideal para viver</p>
      </motion.div>

      {/* Pill tabs */}
      <div className="flex gap-1 p-1 glass squircle-xs mb-6 overflow-x-auto">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id);
                if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
              }}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex-1 justify-center ${
                isActive
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {isActive && (
                <motion.div
                  className="absolute inset-0 bg-primary/15 rounded-xl border border-primary/30"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <tab.icon className="relative z-10 w-3.5 h-3.5" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.25 }}
        >
          <ActiveContent />
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default ExploreSection;
