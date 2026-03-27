import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Clock, Plane, AlertTriangle, Plus, X } from "lucide-react";

interface TravelLog {
  id: string;
  departure: string;
  returnDate: string;
  days: number;
}

const NationalityClock = () => {
  const [entryDate] = useState("2025-01-15");
  const [travels, setTravels] = useState<TravelLog[]>([
    { id: "1", departure: "2025-03-10", returnDate: "2025-03-25", days: 15 },
  ]);
  const [showAddTravel, setShowAddTravel] = useState(false);
  const [newDeparture, setNewDeparture] = useState("");
  const [newReturn, setNewReturn] = useState("");

  const totalDaysAway = travels.reduce((sum, t) => sum + t.days, 0);
  const totalRequired = 730;
  const start = new Date(entryDate);
  const now = new Date();
  const daysInSpain = Math.max(
    0,
    Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) - totalDaysAway
  );
  const progress = Math.min(daysInSpain / totalRequired, 1);
  const yearlyLimit = 90;
  const currentYearTravels = travels.filter(
    (t) => new Date(t.departure).getFullYear() === now.getFullYear()
  );
  const daysThisYear = currentYearTravels.reduce((sum, t) => sum + t.days, 0);
  const yearlyWarning = daysThisYear >= yearlyLimit * 0.8;

  const addTravel = () => {
    if (!newDeparture || !newReturn) return;
    const dep = new Date(newDeparture);
    const ret = new Date(newReturn);
    const days = Math.floor((ret.getTime() - dep.getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return;
    setTravels([
      ...travels,
      { id: Date.now().toString(), departure: newDeparture, returnDate: newReturn, days },
    ]);
    setNewDeparture("");
    setNewReturn("");
    setShowAddTravel(false);
    if (navigator.vibrate) navigator.vibrate(10);
  };

  const circumference = 2 * Math.PI * 90;
  const strokeDashoffset = circumference * (1 - progress);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2">Nationality Clock</h1>
        <p className="text-muted-foreground">Contagem para a cidadania</p>
      </motion.div>

      {/* Clock Widget */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass squircle p-8 text-center mb-6"
      >
        <div className="relative inline-flex items-center justify-center mb-6">
          <svg width="200" height="200" className="-rotate-90">
            <circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="6"
            />
            <motion.circle
              cx="100"
              cy="100"
              r="90"
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="6"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: "easeOut", delay: 0.5 }}
            />
          </svg>
          <div className="absolute flex flex-col items-center">
            <span className="text-4xl font-bold text-foreground">{daysInSpain}</span>
            <span className="text-sm text-muted-foreground">de {totalRequired} dias</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 text-left">
          <div className="p-3 rounded-xl bg-secondary/50">
            <div className="text-xs text-muted-foreground mb-1">Dias fora (total)</div>
            <div className="text-lg font-semibold text-foreground">{totalDaysAway}</div>
          </div>
          <div
            className={`p-3 rounded-xl ${
              yearlyWarning ? "bg-destructive/10 border border-destructive/20" : "bg-secondary/50"
            }`}
          >
            <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
              Dias fora ({now.getFullYear()})
              {yearlyWarning && <AlertTriangle className="w-3 h-3 text-destructive" />}
            </div>
            <div className={`text-lg font-semibold ${yearlyWarning ? "text-destructive" : "text-foreground"}`}>
              {daysThisYear}/{yearlyLimit}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Travel Log */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass squircle-sm p-5"
      >
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-foreground flex items-center gap-2">
            <Plane className="w-4 h-4" /> Viagens Registradas
          </h3>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowAddTravel(!showAddTravel)}
            className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center text-primary"
          >
            {showAddTravel ? <X className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          </motion.button>
        </div>

        <AnimatePresence>
          {showAddTravel && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 rounded-xl bg-secondary/50 border border-border/50 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Saída</label>
                    <input
                      type="date"
                      value={newDeparture}
                      onChange={(e) => setNewDeparture(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-muted-foreground mb-1 block">Retorno</label>
                    <input
                      type="date"
                      value={newReturn}
                      onChange={(e) => setNewReturn(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-background border border-border text-foreground text-sm"
                    />
                  </div>
                </div>
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  onClick={addTravel}
                  className="w-full py-2.5 bg-primary text-primary-foreground font-medium rounded-xl text-sm"
                >
                  Registrar Viagem
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="space-y-2">
          {travels.map((t) => (
            <div key={t.id} className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
              <div>
                <p className="text-sm font-medium text-foreground">
                  {new Date(t.departure).toLocaleDateString("pt-BR")} →{" "}
                  {new Date(t.returnDate).toLocaleDateString("pt-BR")}
                </p>
              </div>
              <span className="text-sm font-semibold text-muted-foreground">{t.days}d</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default NationalityClock;
