import { motion, AnimatePresence } from "framer-motion";
import { ShieldCheck, AlertTriangle, XOctagon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";

interface Finding {
  title: string;
  description: string;
  law_reference?: string;
}

interface AuditData {
  safe_clauses: Finding[];
  attention_points: Finding[];
  illegal_alerts: Finding[];
}

interface AuditDashboardProps {
  data: AuditData;
}

const AuditDashboard = ({ data }: AuditDashboardProps) => {
  const { toast } = useToast();
  const [alertFocused, setAlertFocused] = useState(false);

  useEffect(() => {
    if (data.illegal_alerts.length > 0) {
      setAlertFocused(true);
      toast({
        title: "⚠️ Cláusulas ilegais detectadas!",
        description: `${data.illegal_alerts.length} cláusula(s) potencialmente nula(s) encontrada(s).`,
        variant: "destructive",
      });
      if ("vibrate" in navigator) {
        navigator.vibrate([50, 100, 50]);
      }
    }
  }, [data]);

  const columns = [
    {
      title: "Cláusulas Seguras",
      icon: ShieldCheck,
      items: data.safe_clauses,
      colorClass: "text-journey-complete",
      glowClass: "glow-complete",
      cardClass: "glass",
    },
    {
      title: "Pontos de Atenção",
      icon: AlertTriangle,
      items: data.attention_points,
      colorClass: "text-primary",
      glowClass: "glow-primary",
      cardClass: "glass",
    },
    {
      title: "Alertas de Ilegalidade",
      icon: XOctagon,
      items: data.illegal_alerts,
      colorClass: "text-coral",
      glowClass: "",
      cardClass: "glass-coral",
    },
  ];

  return (
    <div className="relative px-4">
      {/* Background blur overlay when illegal alerts present */}
      <AnimatePresence>
        {alertFocused && data.illegal_alerts.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 backdrop-blur-xl bg-background/30"
            onClick={() => setAlertFocused(false)}
          />
        )}
      </AnimatePresence>

      <div className={`grid grid-cols-1 md:grid-cols-3 gap-4 ${alertFocused ? "relative z-40" : ""}`}>
        {columns.map((col, colIdx) => (
          <motion.div
            key={col.title}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: colIdx * 0.15 }}
            className="space-y-3"
          >
            <div className="flex items-center gap-2 mb-4">
              <col.icon className={`w-5 h-5 ${col.colorClass}`} />
              <h3 className={`font-semibold ${col.colorClass}`}>{col.title}</h3>
              <span className="text-xs text-muted-foreground">({col.items.length})</span>
            </div>

            {col.items.length === 0 && (
              <p className="text-muted-foreground text-sm glass squircle-xs p-4">
                Nenhuma cláusula nesta categoria.
              </p>
            )}

            {col.items.map((item, idx) => (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: colIdx * 0.15 + idx * 0.08 }}
                className={`${col.cardClass} squircle-sm p-4 ${col.glowClass}`}
              >
                <h4 className={`font-medium text-sm ${col.colorClass} mb-1`}>{item.title}</h4>
                <p className="text-foreground/80 text-xs leading-relaxed">{item.description}</p>
                {item.law_reference && (
                  <p className="text-muted-foreground text-[10px] mt-2 italic">📖 {item.law_reference}</p>
                )}
              </motion.div>
            ))}
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default AuditDashboard;
