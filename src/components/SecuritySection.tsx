import { useState } from "react";
import { motion } from "framer-motion";
import { ScanSearch, BarChart3, Users } from "lucide-react";
import ContractScanner from "./ContractScanner";
import AuditDashboard from "./AuditDashboard";
import VerifiedProviders from "./VerifiedProviders";
import MentorTipButton from "./MentorTipButton";

type SubView = "scanner" | "audit" | "providers";

const tabs = [
  { id: "scanner" as SubView, label: "Scanner", icon: ScanSearch },
  { id: "audit" as SubView, label: "Auditoria", icon: BarChart3 },
  { id: "providers" as SubView, label: "Parceiros", icon: Users },
];

const SecuritySection = () => {
  const [activeView, setActiveView] = useState<SubView>("scanner");
  const [auditData, setAuditData] = useState<any>(null);

  const handleAnalysisComplete = (findings: any) => {
    setAuditData(findings);
    setActiveView("audit");
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32 space-y-6">
      {/* Section header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient-primary">Proteção & Segurança</h1>
        <p className="text-muted-foreground text-sm mt-1">Seu anjo da guarda jurídico na Espanha</p>
      </div>

      {/* Glass pill tabs */}
      <div className="flex justify-center">
        <div className="glass squircle-sm inline-flex items-center gap-1 p-1">
          {tabs.map((tab) => {
            const isActive = activeView === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setActiveView(tab.id)}
                className={`relative flex items-center gap-1.5 px-4 py-2 rounded-2xl text-sm font-medium transition-colors ${
                  isActive ? "text-primary" : "text-muted-foreground"
                }`}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                {isActive && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="absolute inset-0 bg-primary/10 rounded-2xl border border-primary/20"
                    transition={{ duration: 0.2 }}
                  />
                )}
                <tab.icon className="w-4 h-4 relative z-10" />
                <span className="relative z-10">{tab.label}</span>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Sub-view content */}
      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeView === "scanner" && (
          <ContractScanner onAnalysisComplete={handleAnalysisComplete} />
        )}
        {activeView === "audit" && auditData && (
          <AuditDashboard data={auditData} />
        )}
        {activeView === "audit" && !auditData && (
          <div className="px-6 text-center py-16">
            <p className="text-muted-foreground">Envie um contrato no Scanner para ver a auditoria.</p>
          </div>
        )}
        {activeView === "providers" && <VerifiedProviders />}
      </motion.div>

      <MentorTipButton />
    </div>
  );
};

export default SecuritySection;
