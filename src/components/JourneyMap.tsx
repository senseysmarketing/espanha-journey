import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check, ChevronRight, FileText } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import MilestoneVideoPlayer from "@/components/MilestoneVideoPlayer";
import SuccessParticles from "@/components/SuccessParticles";

interface Milestone {
  id: string;
  title: string;
  subtitle: string;
  month: string;
  status: "complete" | "active" | "pending";
  checklist: string[];
  mentorTip: string;
  videoUrl: string;
}

const milestones: Milestone[] = [
  {
    id: "empadronamiento",
    title: "Empadronamiento",
    subtitle: "Registro de residência no Ayuntamiento",
    month: "Mês 1",
    status: "complete",
    checklist: ["Passaporte original", "Contrato de aluguel", "Formulário de alta"],
    mentorTip: "Chegue cedo! Algumas cidades aceitam sem cita previa.",
    videoUrl: "",
  },
  {
    id: "nie",
    title: "NIE / TIE",
    subtitle: "Número de Identidade de Estrangeiro",
    month: "Mês 1-2",
    status: "active",
    checklist: ["Formulário EX-15", "Taxa 790 código 012", "Foto 3x4", "Empadronamiento"],
    mentorTip: "O NIE é diferente do TIE. O NIE é o número, o TIE é o cartão físico.",
    videoUrl: "",
  },
  {
    id: "seguridad-social",
    title: "Seguridad Social",
    subtitle: "Alta na Segurança Social espanhola",
    month: "Mês 2",
    status: "pending",
    checklist: ["NIE", "Contrato de trabalho ou alta de autônomo", "Formulário TA.1"],
    mentorTip: "Autônomos precisam do alta de autônomo antes.",
    videoUrl: "",
  },
  {
    id: "cuenta-bancaria",
    title: "Conta Bancária",
    subtitle: "Abertura de conta em banco espanhol",
    month: "Mês 2-3",
    status: "pending",
    checklist: ["NIE", "Empadronamiento", "Comprovante de renda"],
    mentorTip: "Bancos digitais como N26 ou Revolut aceitam com NIE provisório.",
    videoUrl: "",
  },
  {
    id: "tarjeta-sanitaria",
    title: "Tarjeta Sanitaria",
    subtitle: "Cartão de saúde pública",
    month: "Mês 3",
    status: "pending",
    checklist: ["Empadronamiento", "Alta Seguridad Social", "NIE"],
    mentorTip: "Vá ao Centro de Salud do seu bairro com todos os documentos.",
    videoUrl: "",
  },
  {
    id: "residencia",
    title: "Renovação de Residência",
    subtitle: "Renovar permissão antes do vencimento",
    month: "Mês 11",
    status: "pending",
    checklist: ["TIE vigente", "Empadronamiento atualizado", "Comprovante de renda", "Seguro médico"],
    mentorTip: "Comece 60 dias antes do vencimento para evitar problemas.",
    videoUrl: "",
  },
];

interface JourneyMapProps {
  onSelectMilestone?: (id: string) => void;
}

const JourneyMap = ({ onSelectMilestone }: JourneyMapProps) => {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [checkedItems, setCheckedItems] = useState<Record<string, boolean>>({});
  const [particleTrigger, setParticleTrigger] = useState<string | null>(null);

  const handleNodeClick = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
    if (navigator.vibrate) navigator.vibrate(5);
  };

  const handleCheck = useCallback((milestoneId: string, itemIdx: number) => {
    const key = `${milestoneId}-${itemIdx}`;
    setCheckedItems((prev) => {
      const next = { ...prev, [key]: !prev[key] };
      if (next[key]) {
        setParticleTrigger(key);
      }
      return next;
    });
  }, []);

  const statusColor = (status: string) => {
    switch (status) {
      case "complete": return "bg-journey-complete";
      case "active": return "bg-journey-active";
      default: return "bg-journey-pending";
    }
  };

  const statusGlow = (status: string) => {
    switch (status) {
      case "complete": return "glow-complete";
      case "active": return "glow-primary";
      default: return "";
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-3xl font-bold mb-2">Sua Jornada</h1>
        <p className="text-muted-foreground">24 meses para a cidadania</p>
      </motion.div>

      <div className="relative">
        <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-journey-complete via-journey-active to-border" />

        <div className="space-y-4">
          {milestones.map((m, i) => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.08 * i, duration: 0.4 }}
            >
              <motion.button
                onClick={() => handleNodeClick(m.id)}
                className="w-full flex items-center gap-4 p-4 pl-0 text-left group"
                whileTap={{ scale: 0.98 }}
              >
                <div className="relative z-10 flex-shrink-0 w-12 flex justify-center">
                  <motion.div
                    className={`w-4 h-4 rounded-full ${statusColor(m.status)} ${statusGlow(m.status)}`}
                    animate={m.status === "active" ? { scale: [1, 1.3, 1] } : {}}
                    transition={m.status === "active" ? { repeat: Infinity, duration: 2 } : {}}
                  />
                </div>

                <div
                  className={`flex-1 p-4 rounded-2xl transition-all ${
                    expandedId === m.id ? "glass-active" : "glass hover:border-muted-foreground/20"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-medium text-muted-foreground">{m.month}</span>
                      <h3 className="font-semibold text-foreground">{m.title}</h3>
                      <p className="text-sm text-muted-foreground">{m.subtitle}</p>
                    </div>
                    <div className="flex-shrink-0">
                      {m.status === "complete" ? (
                        <div className="w-8 h-8 rounded-full bg-journey-complete/20 flex items-center justify-center">
                          <Check className="w-4 h-4 text-journey-complete" />
                        </div>
                      ) : (
                        <ChevronRight
                          className={`w-5 h-5 text-muted-foreground transition-transform ${
                            expandedId === m.id ? "rotate-90" : ""
                          }`}
                        />
                      )}
                    </div>
                  </div>
                </div>
              </motion.button>

              <AnimatePresence>
                {expandedId === m.id && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                    className="ml-12 overflow-hidden"
                  >
                    <div className="glass-active squircle-sm p-5 space-y-4 mb-2">
                      {/* Video Player */}
                      <MilestoneVideoPlayer videoUrl={m.videoUrl} title={m.title} />

                      {/* Mentor tip */}
                      <div className="rounded-xl bg-primary/5 border border-primary/10 p-3">
                        <p className="text-sm text-foreground/80">💡 {m.mentorTip}</p>
                      </div>

                      {/* Checklist */}
                      <div>
                        <h4 className="text-sm font-semibold text-foreground mb-2 flex items-center gap-2">
                          <FileText className="w-4 h-4" /> O que levar
                        </h4>
                        <div className="space-y-2">
                          {m.checklist.map((item, idx) => {
                            const key = `${m.id}-${idx}`;
                            const isChecked = !!checkedItems[key];
                            return (
                              <div key={idx} className="relative">
                                <label className="flex items-center gap-3 text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer">
                                  <Checkbox
                                    checked={isChecked}
                                    onCheckedChange={() => handleCheck(m.id, idx)}
                                  />
                                  <span className={isChecked ? "line-through opacity-60" : ""}>{item}</span>
                                </label>
                                <SuccessParticles
                                  trigger={particleTrigger === key}
                                  onComplete={() => setParticleTrigger(null)}
                                />
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default JourneyMap;
