import { useState } from "react";
import { motion } from "framer-motion";
import { ScanSearch, BarChart3, Users } from "lucide-react";
import ContractScanner from "./ContractScanner";
import AuditDashboard from "./AuditDashboard";
import VerifiedProviders from "./VerifiedProviders";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

type SubView = "scanner" | "audit" | "providers";

const tabs = [
  { id: "scanner" as SubView, label: "Scanner", icon: ScanSearch },
  { id: "audit" as SubView, label: "Auditoria", icon: BarChart3 },
  { id: "providers" as SubView, label: "Parceiros", icon: Users },
];

const SecuritySection = () => {
  const [activeView, setActiveView] = useState<SubView>("scanner");
  const [auditData, setAuditData] = useState<any>(null);
  const { user } = useAuth();
  const { toast } = useToast();

  const handleAnalysisComplete = async ({ fileName, findings }: { fileName: string; findings: any }) => {
    setAuditData(findings);
    setActiveView("audit");

    if (user) {
      const { error } = await supabase.from("contracts_audit").insert({
        user_id: user.id,
        file_name: fileName,
        findings_json: findings,
        status: "completed",
      });
      if (error) {
        console.error("Failed to save audit:", error);
        toast({ title: "Erro ao salvar auditoria", description: error.message, variant: "destructive" });
      }
    }
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32 space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gradient-primary">Proteção & Segurança</h1>
        <p className="text-muted-foreground text-sm mt-1">Seu anjo da guarda jurídico na Espanha</p>
      </div>

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

      <motion.div
        key={activeView}
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {activeView === "scanner" && (
          <ContractScanner onAnalysisComplete={handleAnalysisComplete} />
        )}
        {activeView === "audit" && (
          <AuditDashboard freshData={auditData} />
        )}
        {activeView === "providers" && <VerifiedProviders />}
      </motion.div>
    </div>
  );
};

export default SecuritySection;
