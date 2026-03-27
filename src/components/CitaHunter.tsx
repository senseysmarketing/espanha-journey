import { useState } from "react";
import { motion } from "framer-motion";
import { Bell, BellRing, MapPin, Clock, CheckCircle } from "lucide-react";

interface CitaAlert {
  id: string;
  office: string;
  city: string;
  type: string;
  date: string;
  status: "available" | "monitoring";
}

const mockAlerts: CitaAlert[] = [
  { id: "1", office: "Oficina de Extranjería", city: "Madrid", type: "NIE / TIE", date: "2025-04-02", status: "available" },
  { id: "2", office: "Comisaría de Policía", city: "Barcelona", type: "Huellas", date: "", status: "monitoring" },
  { id: "3", office: "Seguridad Social", city: "Valencia", type: "Alta Autónomo", date: "2025-04-10", status: "available" },
];

const CitaHunter = () => {
  const [alerts] = useState(mockAlerts);

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <BellRing className="w-7 h-7 text-primary" /> Cita Hunter
        </h1>
        <p className="text-muted-foreground">Monitoramento de agendamentos</p>
      </motion.div>

      {/* Active alerts banner */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        className="glass-active squircle-sm p-5 mb-6 glow-primary"
      >
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-primary/15 flex items-center justify-center animate-pulse-glow">
            <Bell className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">
              {alerts.filter((a) => a.status === "available").length} citas disponíveis!
            </h3>
            <p className="text-sm text-muted-foreground">Novas vagas detectadas agora</p>
          </div>
        </div>
      </motion.div>

      {/* Alerts list */}
      <div className="space-y-3">
        {alerts.map((alert, i) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * i + 0.3 }}
            className={`glass squircle-sm p-4 ${
              alert.status === "available" ? "border-primary/20" : ""
            }`}
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">{alert.city}</span>
                </div>
                <h3 className="font-semibold text-foreground">{alert.type}</h3>
                <p className="text-sm text-muted-foreground">{alert.office}</p>
              </div>
              {alert.status === "available" ? (
                <div className="text-right">
                  <div className="flex items-center gap-1 text-xs text-journey-complete mb-2">
                    <CheckCircle className="w-3.5 h-3.5" /> Disponível
                  </div>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(alert.date).toLocaleDateString("pt-BR")}
                  </p>
                  <motion.button
                    whileTap={{ scale: 0.95 }}
                    className="mt-2 px-4 py-1.5 bg-primary text-primary-foreground text-xs font-medium rounded-xl"
                  >
                    Agendar
                  </motion.button>
                </div>
              ) : (
                <div className="px-3 py-1.5 rounded-xl bg-secondary/50 text-xs font-medium text-muted-foreground flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-primary animate-pulse-glow" />
                  Monitorando
                </div>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default CitaHunter;
