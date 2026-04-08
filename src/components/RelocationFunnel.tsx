import { motion } from "framer-motion";
import { MessageCircle, Play, Shield, FileCheck, Clock, ArrowRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const WHATSAPP_NUMBER = "34600000000"; // Replace with actual number

const benefits = [
  { icon: Shield, text: "Assessoria completa para visto de residência" },
  { icon: FileCheck, text: "Documentação verificada por especialistas" },
  { icon: Clock, text: "Acompanhamento personalizado do processo" },
];

const RelocationFunnel = () => {
  const { user } = useAuth();

  const handleWhatsAppClick = async () => {
    // Track the click
    if (user) {
      await supabase.from("lead_clicks").insert({
        user_id: user.id,
        funnel: "relocation",
      });
    }

    const userId = user?.id?.slice(0, 8) || "guest";
    const message = encodeURIComponent(
      `Olá, venho pelo Instituto Empuria e tenho interesse no Relocation. O meu ID é #${userId}`
    );
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, "_blank");
    toast.success("Redirecionando para WhatsApp...");
  };

  return (
    <div className="space-y-6">
      {/* Video Section */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass squircle-sm overflow-hidden"
      >
        <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/10 flex items-center justify-center">
          <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent" />
          <motion.div
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="relative z-10 w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer shadow-lg"
          >
            <Play className="w-7 h-7 text-primary-foreground ml-1" />
          </motion.div>
          <p className="absolute bottom-4 left-4 right-4 text-sm text-foreground/80 font-medium z-10">
            🎥 Como funciona o processo de Relocation na Espanha
          </p>
        </div>
      </motion.div>

      {/* Info Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass squircle-sm p-6 space-y-4"
      >
        <h3 className="font-heading text-lg font-semibold text-foreground">
          Relocation Assistido
        </h3>
        <p className="text-foreground/70 text-sm leading-relaxed">
          O nosso serviço de Relocation oferece acompanhamento completo para a sua mudança para a Espanha. 
          Desde a documentação inicial até à instalação na sua nova cidade, cuidamos de cada detalhe 
          para que a sua transição seja tranquila e sem surpresas.
        </p>

        <div className="space-y-3 pt-2">
          {benefits.map((b) => (
            <div key={b.text} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                <b.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-foreground/80">{b.text}</span>
            </div>
          ))}
        </div>
      </motion.div>

      {/* WhatsApp CTA */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass squircle-sm p-6 text-center space-y-4"
      >
        <div className="w-14 h-14 rounded-2xl bg-[#25D366]/15 flex items-center justify-center mx-auto">
          <MessageCircle className="w-7 h-7 text-[#25D366]" />
        </div>
        <div>
          <h3 className="font-heading text-lg font-semibold text-foreground">
            Fale com um especialista
          </h3>
          <p className="text-foreground/60 text-sm mt-1">
            Tire todas as suas dúvidas diretamente com a nossa equipa.
          </p>
        </div>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={handleWhatsAppClick}
          className="w-full py-3.5 rounded-2xl bg-[#25D366] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-[0_4px_20px_hsla(142,70%,45%,0.3)]"
        >
          <MessageCircle className="w-5 h-5" />
          Conversar no WhatsApp
          <ArrowRight className="w-4 h-4" />
        </motion.button>
      </motion.div>
    </div>
  );
};

export default RelocationFunnel;
