import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plane, Briefcase, Heart, Globe, ArrowRight, Sparkles } from "lucide-react";
import spainBg from "@/assets/spain-mesh-bg.jpg";

const profiles = [
  {
    id: "nomade",
    icon: Globe,
    title: "Nômade Digital",
    desc: "Trabalho remoto com visto de nômade digital ou autônomo.",
    color: "from-blue-500/20 to-cyan-500/20",
    borderColor: "border-blue-400/30",
  },
  {
    id: "arraigo",
    icon: Heart,
    title: "Arraigo Social",
    desc: "Regularização após 3 anos de residência contínua.",
    color: "from-rose-500/20 to-pink-500/20",
    borderColor: "border-rose-400/30",
  },
  {
    id: "nacionalidade",
    icon: Briefcase,
    title: "Nacionalidade",
    desc: "Cidadania espanhola por descendência ou residência.",
    color: "from-amber-500/20 to-orange-500/20",
    borderColor: "border-amber-400/30",
  },
];

interface OnboardingFlowProps {
  onComplete: (profile: string) => void;
}

const Particle = ({ delay }: { delay: number }) => {
  const tx = (Math.random() - 0.5) * 400;
  const ty = (Math.random() - 0.5) * 400;
  return (
    <motion.div
      className="absolute w-2 h-2 rounded-full bg-primary"
      style={{ "--tx": `${tx}px`, "--ty": `${ty}px` } as React.CSSProperties}
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: [0, 1, 0], scale: [0, 1, 0], x: tx, y: ty }}
      transition={{ duration: 1.2, delay, ease: "easeOut" }}
    />
  );
};

const OnboardingFlow = ({ onComplete }: OnboardingFlowProps) => {
  const [step, setStep] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const handleSelect = (id: string) => {
    setSelected(id);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const handleContinue = () => {
    if (!selected) return;
    setIsTransitioning(true);
    if (navigator.vibrate) navigator.vibrate([10, 50, 10]);
    setTimeout(() => onComplete(selected), 1500);
  };

  return (
    <div className="fixed inset-0 bg-background flex items-center justify-center z-50 overflow-hidden">
      <img src={spainBg} alt="" className="absolute inset-0 w-full h-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-background/80 to-background/40" />
      <AnimatePresence mode="wait">
        {!isTransitioning ? (
          <motion.div
            key={`step-${step}`}
            initial={{ opacity: 0, y: 40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -40, scale: 0.95 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            className="w-full max-w-lg px-6"
          >
            {step === 0 && (
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", delay: 0.2 }}
                  className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-primary/10 border border-primary/20 mb-8"
                >
                  <Plane className="w-10 h-10 text-primary" />
                </motion.div>
                <motion.h1
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-4xl font-bold tracking-tight mb-3"
                >
                  <span className="text-gradient-primary">Espanha Pass</span>
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="text-muted-foreground text-lg mb-10 leading-relaxed"
                >
                  Sua jornada de imigração,
                  <br />
                  guiada passo a passo.
                </motion.p>
                <motion.button
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.7 }}
                  onClick={() => setStep(1)}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl glow-primary"
                >
                  Começar <ArrowRight className="w-5 h-5" />
                </motion.button>
              </div>
            )}

            {step === 1 && (
              <div>
                <h2 className="text-2xl font-bold text-center mb-2">Qual é o seu caminho?</h2>
                <p className="text-muted-foreground text-center mb-8">
                  Escolha o perfil que melhor descreve sua situação.
                </p>
                <div className="space-y-3">
                  {profiles.map((p, i) => (
                    <motion.button
                      key={p.id}
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 * i }}
                      onClick={() => handleSelect(p.id)}
                      className={`w-full flex items-center gap-4 p-5 rounded-3xl border transition-all text-left ${
                        selected === p.id
                          ? `glass-active ${p.borderColor} glow-primary`
                          : "glass border-border/50 hover:border-muted-foreground/30"
                      }`}
                    >
                      <div
                        className={`flex-shrink-0 w-12 h-12 rounded-2xl flex items-center justify-center bg-gradient-to-br ${p.color}`}
                      >
                        <p.icon className="w-6 h-6 text-foreground" />
                      </div>
                      <div>
                        <div className="font-semibold text-foreground">{p.title}</div>
                        <div className="text-sm text-muted-foreground">{p.desc}</div>
                      </div>
                    </motion.button>
                  ))}
                </div>
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: selected ? 1 : 0.3 }}
                  onClick={handleContinue}
                  disabled={!selected}
                  whileHover={selected ? { scale: 1.03 } : {}}
                  whileTap={selected ? { scale: 0.97 } : {}}
                  className="w-full mt-6 flex items-center justify-center gap-2 px-8 py-4 bg-primary text-primary-foreground font-semibold rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed glow-primary"
                >
                  <Sparkles className="w-5 h-5" /> Iniciar minha jornada
                </motion.button>
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div
            key="particles"
            initial={{ opacity: 1 }}
            animate={{ opacity: 0 }}
            transition={{ duration: 1.5, delay: 0.5 }}
            className="relative flex items-center justify-center"
          >
            {Array.from({ length: 30 }).map((_, i) => (
              <Particle key={i} delay={i * 0.03} />
            ))}
            <motion.div
              initial={{ scale: 1, opacity: 1 }}
              animate={{ scale: 3, opacity: 0 }}
              transition={{ duration: 1.2 }}
              className="w-20 h-20 rounded-3xl bg-primary/20 border border-primary/30"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OnboardingFlow;
