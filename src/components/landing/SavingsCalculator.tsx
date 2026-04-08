import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Check } from "lucide-react";

const services = [
  { id: "nie", label: "NIE / TIE", cost: 300 },
  { id: "visto", label: "Visto de Residência", cost: 800 },
  { id: "contrato", label: "Revisão de Contrato", cost: 400 },
  { id: "empadronamiento", label: "Empadronamiento", cost: 150 },
  { id: "seguridad", label: "Seguridad Social", cost: 200 },
];

const MONTHLY_PRICE = 9.9;

const SavingsCalculator = () => {
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const totalTraditional = services
    .filter((s) => selected.has(s.id))
    .reduce((sum, s) => sum + s.cost, 0);
  const annualCost = MONTHLY_PRICE * 12;
  const savings = totalTraditional - annualCost;

  return (
    <section className="px-6 py-24 max-w-3xl mx-auto">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(14px)" }}
        whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        viewport={{ once: true, margin: "-60px" }}
        transition={{ duration: 0.7 }}
        className="text-center mb-12"
      >
        <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
          Calculadora de Economia
        </h2>
        <p className="mt-4 text-muted-foreground text-lg">
          Selecione os serviços que você precisaria contratar com advogados.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ delay: 0.2, duration: 0.5 }}
        className="rounded-[28px] landing-glass p-8"
      >
        <div className="space-y-3">
          {services.map((s) => {
            const isActive = selected.has(s.id);
            return (
              <button
                key={s.id}
                onClick={() => toggle(s.id)}
                className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl border transition-all duration-200 text-left ${
                  isActive
                    ? "border-primary bg-primary/8"
                    : "border-border bg-background/60 hover:bg-background/80"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-lg flex items-center justify-center transition-colors ${
                      isActive
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary"
                    }`}
                  >
                    {isActive && <Check className="w-4 h-4" />}
                  </div>
                  <span className="font-medium text-foreground">{s.label}</span>
                </div>
                <span className="text-muted-foreground font-medium">€{s.cost}</span>
              </button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="overflow-hidden"
            >
              <div className="mt-8 pt-6 border-t border-border">
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground">Com advogados tradicionais</span>
                  <span className="text-xl font-bold text-destructive line-through">
                    €{totalTraditional}
                  </span>
                </div>
                <div className="flex justify-between items-center mb-3">
                  <span className="text-muted-foreground">Com Instituto Empuria (anual)</span>
                  <span className="text-xl font-bold text-journey-complete">
                    €{annualCost.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between items-center pt-4 border-t border-border">
                  <span className="text-lg font-semibold text-foreground">
                    Você economiza
                  </span>
                  <motion.span
                    key={savings}
                    initial={{ scale: 1.2, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="text-2xl font-extrabold text-journey-complete"
                  >
                    €{savings > 0 ? savings.toFixed(2) : "0.00"}
                  </motion.span>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </section>
  );
};

export default SavingsCalculator;
