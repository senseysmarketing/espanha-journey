import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, AlertTriangle, CheckCircle, Shield, Eye } from "lucide-react";

interface Document {
  id: string;
  type: string;
  name: string;
  expiryDate: string;
  status: "valid" | "expiring" | "expired";
  uploadedAt: string;
}

const mockDocuments: Document[] = [
  {
    id: "1",
    type: "passport",
    name: "Passaporte Brasileiro",
    expiryDate: "2028-06-15",
    status: "valid",
    uploadedAt: "2025-01-20",
  },
  {
    id: "2",
    type: "tie",
    name: "TIE - Tarjeta de Identidad",
    expiryDate: "2025-12-01",
    status: "expiring",
    uploadedAt: "2025-02-10",
  },
];

const statusConfig = {
  valid: { color: "text-journey-complete", bg: "bg-journey-complete/10", icon: CheckCircle, label: "Válido" },
  expiring: { color: "text-primary", bg: "bg-primary/10", icon: AlertTriangle, label: "Expirando" },
  expired: { color: "text-destructive", bg: "bg-destructive/10", icon: AlertTriangle, label: "Expirado" },
};

const DocumentVault = () => {
  const [documents, setDocuments] = useState(mockDocuments);
  const [dragActive, setDragActive] = useState(false);

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (!file) return;
    // Simulated OCR - add document
    const newDoc: Document = {
      id: Date.now().toString(),
      type: "other",
      name: file.name.replace(/\.[^/.]+$/, ""),
      expiryDate: "2026-01-01",
      status: "valid",
      uploadedAt: new Date().toISOString().split("T")[0],
    };
    setDocuments([...documents, newDoc]);
    if (navigator.vibrate) navigator.vibrate([10, 30, 10]);
  };

  const daysUntilExpiry = (date: string) => {
    const diff = new Date(date).getTime() - new Date().getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  return (
    <div className="w-full max-w-lg mx-auto px-4 py-8 pb-32">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h1 className="text-3xl font-bold mb-2 flex items-center justify-center gap-2">
          <Shield className="w-7 h-7 text-primary" /> Cofre de Documentos
        </h1>
        <p className="text-muted-foreground">Seus documentos protegidos e organizados</p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`mb-6 p-8 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/30"
        }`}
      >
        <Upload className={`w-10 h-10 mx-auto mb-3 ${dragActive ? "text-primary" : "text-muted-foreground"}`} />
        <p className="font-medium text-foreground mb-1">Arraste seu documento aqui</p>
        <p className="text-sm text-muted-foreground">
          Passaporte, TIE, NIE ou comprovantes
        </p>
        <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/20 transition-colors">
          <Upload className="w-4 h-4" /> Selecionar arquivo
          <input type="file" className="hidden" onChange={(e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            const newDoc: Document = {
              id: Date.now().toString(),
              type: "other",
              name: file.name.replace(/\.[^/.]+$/, ""),
              expiryDate: "2026-06-01",
              status: "valid",
              uploadedAt: new Date().toISOString().split("T")[0],
            };
            setDocuments([...documents, newDoc]);
          }} />
        </label>
      </motion.div>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc, i) => {
          const config = statusConfig[doc.status];
          const days = daysUntilExpiry(doc.expiryDate);
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 * i }}
              className="glass squircle-sm p-4"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
                  <FileText className="w-6 h-6 text-foreground" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-foreground truncate">{doc.name}</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Vence: {new Date(doc.expiryDate).toLocaleDateString("pt-BR")}
                    {days > 0 && ` (${days} dias)`}
                  </p>
                  <div className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}>
                    <config.icon className="w-3 h-3" />
                    {config.label}
                  </div>
                </div>
                <button className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                  <Eye className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default DocumentVault;
