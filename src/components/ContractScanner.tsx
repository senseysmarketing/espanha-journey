import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Upload, FileText, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ContractScannerProps {
  onAnalysisComplete: (findings: any) => void;
}

const ContractScanner = ({ onAnalysisComplete }: ContractScannerProps) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const { toast } = useToast();

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragIn = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragOut = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const processFile = async (file: File) => {
    setFileName(file.name);
    setIsScanning(true);

    try {
      const text = await file.text();
      
      if (text.trim().length < 20) {
        toast({ title: "Arquivo inválido", description: "O arquivo parece estar vazio ou não contém texto legível.", variant: "destructive" });
        setIsScanning(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-contract", {
        body: { text },
      });

      if (error) {
        toast({ title: "Erro na análise", description: error.message || "Não foi possível analisar o contrato.", variant: "destructive" });
        setIsScanning(false);
        return;
      }

      if (data?.error) {
        toast({ title: "Erro", description: data.error, variant: "destructive" });
        setIsScanning(false);
        return;
      }

      onAnalysisComplete(data);
    } catch (err) {
      toast({ title: "Erro", description: "Falha ao processar o arquivo.", variant: "destructive" });
    } finally {
      setIsScanning(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div>
      <AnimatePresence mode="wait">
        {isScanning ? (
          <motion.div
            key="scanning"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="glass squircle relative overflow-hidden p-10 flex flex-col items-center gap-4"
          >
            {/* Scan line animation */}
            <div className="absolute inset-0 animate-scan-line pointer-events-none" />
            
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="relative z-10"
            >
              <FileText className="w-16 h-16 text-primary" />
            </motion.div>
            <p className="text-foreground font-medium relative z-10">{fileName}</p>
            <div className="flex items-center gap-2 relative z-10">
              <Loader2 className="w-4 h-4 animate-spin text-primary" />
              <span className="text-muted-foreground text-sm">Analisando cláusulas com IA...</span>
            </div>
          </motion.div>
        ) : (
          <motion.label
            key="upload"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            onDragEnter={handleDragIn}
            onDragLeave={handleDragOut}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`rounded-3xl cursor-pointer p-8 flex flex-col items-center gap-4 border-2 border-dashed transition-all text-center ${
              isDragging
                ? "border-primary bg-primary/5"
                : "border-border hover:border-muted-foreground/30"
            }`}
          >
            <input
              type="file"
              accept=".pdf,.txt,.doc,.docx"
              onChange={handleFileInput}
              className="hidden"
            />
            <motion.div
              animate={isDragging ? { scale: 1.1, y: -5 } : { scale: 1, y: 0 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Upload className={`w-10 h-10 transition-colors ${isDragging ? "text-primary" : "text-muted-foreground"}`} />
            </motion.div>
            <div className="text-center">
              <p className="text-foreground font-medium mb-1">Arraste seu contrato aqui</p>
              <p className="text-muted-foreground text-sm">PDF, TXT ou DOC — análise em segundos</p>
            </div>
            <span className="mt-2 inline-flex items-center gap-2 px-5 py-2.5 bg-primary/10 text-primary rounded-xl text-sm font-medium cursor-pointer hover:bg-primary/20 transition-colors">
              <Upload className="w-4 h-4" /> Selecionar arquivo
            </span>
          </motion.label>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ContractScanner;
