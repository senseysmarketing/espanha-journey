import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Upload,
  FileText,
  AlertTriangle,
  CheckCircle,
  Shield,
  Eye,
  Trash2,
  Loader2,
  XCircle,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
} from "@/components/ui/dialog";
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

interface Document {
  id: string;
  type: string | null;
  name: string | null;
  expiry_date: string | null;
  status: string | null;
  file_url: string | null;
  created_at: string | null;
  user_id: string;
}

const computeStatus = (expiryDate: string | null): "valid" | "expiring" | "expired" => {
  if (!expiryDate) return "valid";
  const days = Math.floor(
    (new Date(expiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (days < 0) return "expired";
  if (days <= 90) return "expiring";
  return "valid";
};

const statusConfig = {
  valid: {
    color: "text-journey-complete",
    bg: "bg-journey-complete/10",
    icon: CheckCircle,
    label: "Válido",
  },
  expiring: {
    color: "text-primary",
    bg: "bg-primary/10",
    icon: AlertTriangle,
    label: "Expirando",
  },
  expired: {
    color: "text-destructive",
    bg: "bg-destructive/10",
    icon: XCircle,
    label: "Vencido",
  },
};

const DocumentVault = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [previewName, setPreviewName] = useState<string>("");
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchDocuments = useCallback(async () => {
    if (!user) return;
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (error) {
      console.error("Error fetching documents:", error);
    } else {
      setDocuments(data || []);
    }
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  const uploadFile = async (file: File) => {
    if (!user) {
      toast({ title: "Faça login para enviar documentos", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${user.id}/${crypto.randomUUID()}.${fileExt}`;

      // Upload to vault bucket
      const { error: uploadError } = await supabase.storage
        .from("vault")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Call analyze-document edge function
      let docMeta = {
        type: "other",
        name: file.name.replace(/\.[^/.]+$/, ""),
        expiry_date: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      };

      try {
        const { data: fnData, error: fnError } = await supabase.functions.invoke(
          "analyze-document",
          { body: { fileName: file.name } }
        );
        if (!fnError && fnData?.type) {
          docMeta = fnData;
        }
      } catch (e) {
        console.warn("OCR analysis failed, using defaults:", e);
      }

      // Insert into documents table
      const { data: insertedDoc, error: insertError } = await supabase
        .from("documents")
        .insert({
          user_id: user.id,
          name: docMeta.name,
          type: docMeta.type,
          expiry_date: docMeta.expiry_date,
          file_url: filePath,
          status: computeStatus(docMeta.expiry_date),
        })
        .select()
        .single();

      if (insertError) throw insertError;

      setDocuments((prev) => [insertedDoc, ...prev]);

      // Haptic feedback
      if (navigator.vibrate) navigator.vibrate([10, 30, 10]);

      toast({ title: "Documento enviado com sucesso!" });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Erro ao enviar documento",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
    e.target.value = "";
  };

  const handlePreview = async (doc: Document) => {
    if (!doc.file_url) return;
    const { data, error } = await supabase.storage
      .from("vault")
      .createSignedUrl(doc.file_url, 60);
    if (error) {
      toast({ title: "Erro ao abrir preview", description: error.message, variant: "destructive" });
      return;
    }
    setPreviewName(doc.name || "Documento");
    setPreviewUrl(data.signedUrl);
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    const doc = documents.find((d) => d.id === deletingId);
    if (!doc) return;

    // Delete from storage
    if (doc.file_url) {
      await supabase.storage.from("vault").remove([doc.file_url]);
    }

    // Delete from database
    const { error } = await supabase.from("documents").delete().eq("id", deletingId);
    if (!error) {
      setDocuments((prev) => prev.filter((d) => d.id !== deletingId));
      toast({ title: "Documento excluído com sucesso." });
    } else {
      toast({ title: "Erro ao excluir", description: error.message, variant: "destructive" });
    }
    setDeletingId(null);
  };

  const daysUntilExpiry = (date: string | null) => {
    if (!date) return null;
    return Math.floor((new Date(date).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
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
        <p className="text-muted-foreground">
          Seus documentos protegidos e organizados
        </p>
      </motion.div>

      {/* Upload Zone */}
      <motion.div
        layoutId="upload-zone"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
        onDragOver={(e) => {
          e.preventDefault();
          setDragActive(true);
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={handleDrop}
        className={`mb-6 p-8 rounded-3xl border-2 border-dashed transition-all text-center cursor-pointer ${
          dragActive
            ? "border-primary bg-primary/5"
            : "border-border hover:border-muted-foreground/30"
        }`}
      >
        {uploading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="w-10 h-10 animate-spin text-primary" />
            <p className="font-medium text-foreground">Enviando e analisando...</p>
          </div>
        ) : (
          <>
            <Upload
              className={`w-10 h-10 mx-auto mb-3 ${
                dragActive ? "text-primary" : "text-muted-foreground"
              }`}
            />
            <p className="font-medium text-foreground mb-1">
              Arraste seu documento aqui
            </p>
            <p className="text-sm text-muted-foreground">
              Passaporte, TIE, NIE ou comprovantes
            </p>
            <label className="mt-4 inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/20 transition-colors">
              <Upload className="w-4 h-4" /> Selecionar arquivo
              <input
                type="file"
                className="hidden"
                onChange={handleFileSelect}
                accept="image/*,.pdf,.doc,.docx"
              />
            </label>
          </>
        )}
      </motion.div>

      {/* Documents List */}
      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : documents.length === 0 ? (
        <div className="text-center py-16">
          <FileText className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-muted-foreground">Nenhum documento ainda.</p>
          <p className="text-muted-foreground text-sm mt-1">
            Envie seu primeiro documento para começar.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {documents.map((doc, i) => {
              const realStatus = computeStatus(doc.expiry_date);
              const config = statusConfig[realStatus];
              const days = daysUntilExpiry(doc.expiry_date);
              return (
                <motion.div
                  key={doc.id}
                  layoutId={`doc-${doc.id}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ delay: 0.05 * i }}
                  className="glass squircle-sm p-4"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-secondary/50 flex items-center justify-center flex-shrink-0">
                      <FileText className="w-6 h-6 text-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-foreground truncate">
                        {doc.name || "Documento"}
                      </h3>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {doc.expiry_date
                          ? `Vence: ${new Date(doc.expiry_date).toLocaleDateString("pt-BR")}`
                          : "Sem data de validade"}
                        {days !== null && days > 0 && ` (${days} dias)`}
                        {days !== null && days < 0 && ` (vencido há ${Math.abs(days)} dias)`}
                      </p>
                      <div
                        className={`inline-flex items-center gap-1 mt-2 px-2.5 py-1 rounded-lg text-xs font-medium ${config.bg} ${config.color}`}
                      >
                        <config.icon className="w-3 h-3" />
                        {config.label}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <button
                        onClick={() => handlePreview(doc)}
                        className="w-8 h-8 rounded-xl bg-secondary/50 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setDeletingId(doc.id)}
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-muted-foreground hover:text-coral hover:bg-coral/10 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!previewUrl} onOpenChange={(open) => !open && setPreviewUrl(null)}>
        <DialogContent className="max-w-4xl w-[95vw] h-[85vh] p-0 overflow-hidden">
          <div className="p-4 border-b border-border">
            <h3 className="font-semibold text-foreground">{previewName}</h3>
          </div>
          {previewUrl && (
            <div className="flex-1 w-full h-full min-h-0">
              <iframe
                src={previewUrl}
                className="w-full h-full border-0"
                title={previewName}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog
        open={!!deletingId}
        onOpenChange={(open) => !open && setDeletingId(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir documento</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este documento? Esta ação não pode
              ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default DocumentVault;
