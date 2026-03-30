import { motion } from "framer-motion";
import { ShieldCheck, AlertTriangle, XOctagon, ArrowLeft, FileText, Loader2, Quote, Lightbulb, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { format } from "date-fns";

interface Finding {
  title: string;
  description?: string;
  law_reference?: string;
  extracted_text?: string;
  legal_analysis?: string;
  recommendation?: string;
}

interface AuditData {
  safe_clauses: Finding[];
  attention_points: Finding[];
  illegal_alerts: Finding[];
}

interface AuditRecord {
  id: string;
  file_name: string | null;
  findings_json: AuditData;
  created_at: string | null;
  status: string | null;
}

interface AuditDashboardProps {
  freshData?: AuditData | null;
}

const FindingCard = ({ item, colorClass, cardClass, glowClass, delay }: {
  item: Finding;
  colorClass: string;
  cardClass: string;
  glowClass: string;
  delay: number;
}) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ delay }}
    className={`${cardClass} squircle-sm p-4 ${glowClass}`}
  >
    <h4 className={`font-medium text-sm ${colorClass} mb-1`}>{item.title}</h4>

    {/* Extracted text as blockquote */}
    {item.extracted_text && (
      <div className="flex gap-2 my-2 p-2.5 rounded-lg bg-foreground/5 border-l-2 border-muted-foreground/30">
        <Quote className="w-3.5 h-3.5 text-muted-foreground shrink-0 mt-0.5" />
        <p className="text-foreground/60 text-[11px] italic leading-relaxed">
          "{item.extracted_text}"
        </p>
      </div>
    )}

    {/* Legal analysis or fallback to description */}
    <p className="text-foreground/80 text-xs leading-relaxed">
      {item.legal_analysis || item.description}
    </p>

    {/* Law reference (legacy) */}
    {item.law_reference && !item.legal_analysis && (
      <p className="text-muted-foreground text-[10px] mt-2 italic">📖 {item.law_reference}</p>
    )}

    {/* Recommendation */}
    {item.recommendation && (
      <div className="flex gap-1.5 mt-2.5 p-2 rounded-lg bg-primary/5 border border-primary/10">
        <Lightbulb className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
        <p className="text-foreground/70 text-[11px] leading-relaxed">
          {item.recommendation}
        </p>
      </div>
    )}
  </motion.div>
);

const AuditDashboard = ({ freshData }: AuditDashboardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [audits, setAudits] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAudit, setSelectedAudit] = useState<AuditData | null>(freshData ?? null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    if (freshData) setSelectedAudit(freshData);
  }, [freshData]);

  useEffect(() => {
    if (!user) return;
    const fetchAudits = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("contracts_audit")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });
      if (!error && data) setAudits(data as unknown as AuditRecord[]);
      setLoading(false);
    };
    fetchAudits();
  }, [user]);

  useEffect(() => {
    if (selectedAudit && selectedAudit.illegal_alerts?.length > 0) {
      toast({
        title: "⚠️ Cláusulas ilegais detectadas!",
        description: `${selectedAudit.illegal_alerts.length} cláusula(s) potencialmente nula(s) encontrada(s).`,
        variant: "destructive",
      });
      if ("vibrate" in navigator) navigator.vibrate([50, 100, 50]);
    }
  }, [selectedAudit]);

  const handleDelete = async () => {
    if (!deletingId) return;
    const { error } = await supabase
      .from("contracts_audit")
      .delete()
      .eq("id", deletingId);
    if (!error) {
      setAudits((prev) => prev.filter((a) => a.id !== deletingId));
      toast({ title: "Auditoria excluída com sucesso." });
    } else {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
    setDeletingId(null);
  };

  // Detail view
  if (selectedAudit) {
    const columns = [
      { title: "Cláusulas Seguras", icon: ShieldCheck, items: selectedAudit.safe_clauses || [], colorClass: "text-journey-complete", glowClass: "glow-complete", cardClass: "glass" },
      { title: "Pontos de Atenção", icon: AlertTriangle, items: selectedAudit.attention_points || [], colorClass: "text-primary", glowClass: "glow-primary", cardClass: "glass" },
      { title: "Alertas de Ilegalidade", icon: XOctagon, items: selectedAudit.illegal_alerts || [], colorClass: "text-coral", glowClass: "", cardClass: "glass-coral" },
    ];

    return (
      <div className="relative">
        <button
          onClick={() => setSelectedAudit(null)}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-4 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar à lista
        </button>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                <FindingCard
                  key={idx}
                  item={item}
                  colorClass={col.colorClass}
                  cardClass={col.cardClass}
                  glowClass={col.glowClass}
                  delay={colIdx * 0.15 + idx * 0.08}
                />
              ))}
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  // List view
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  if (audits.length === 0) {
    return (
      <div className="text-center py-16">
        <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
        <p className="text-muted-foreground">Nenhuma auditoria ainda.</p>
        <p className="text-muted-foreground text-sm mt-1">Envie um contrato no Scanner para começar.</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {audits.map((audit, i) => {
        const findings = audit.findings_json;
        const alertCount = findings?.illegal_alerts?.length ?? 0;
        const attentionCount = findings?.attention_points?.length ?? 0;
        const safeCount = findings?.safe_clauses?.length ?? 0;

        return (
          <motion.button
            key={audit.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            onClick={() => setSelectedAudit(findings)}
            className="w-full glass squircle-sm p-4 text-left hover:bg-foreground/5 transition-colors"
          >
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-primary/10">
                <FileText className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-sm text-foreground truncate">
                  {audit.file_name || "Contrato sem nome"}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {audit.created_at ? format(new Date(audit.created_at), "dd/MM/yyyy 'às' HH:mm") : ""}
                </p>
                <div className="flex items-center gap-3 mt-2 text-xs">
                  {alertCount > 0 && (
                    <span className="flex items-center gap-1 text-coral">
                      <XOctagon className="w-3 h-3" /> {alertCount}
                    </span>
                  )}
                  {attentionCount > 0 && (
                    <span className="flex items-center gap-1 text-primary">
                      <AlertTriangle className="w-3 h-3" /> {attentionCount}
                    </span>
                  )}
                  {safeCount > 0 && (
                    <span className="flex items-center gap-1 text-journey-complete">
                      <ShieldCheck className="w-3 h-3" /> {safeCount}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </motion.button>
        );
      })}
    </div>
  );
};

export default AuditDashboard;
