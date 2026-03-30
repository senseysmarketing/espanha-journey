import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const SubscriptionPaywall = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleManage = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("customer-portal");
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch {
      navigate("/checkout");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-2xl bg-background/60"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="landing-glass rounded-3xl p-10 max-w-md text-center space-y-6"
      >
        <div className="text-5xl">🔒</div>
        <h2 className="text-2xl font-bold text-foreground">Assinatura necessária</h2>
        <p className="text-foreground/70 text-sm">
          Para acessar o dashboard, você precisa de uma assinatura ativa do Espanha Pass.
        </p>

        <div className="flex flex-col gap-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/checkout")}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold"
          >
            Assinar agora
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleManage}
            disabled={loading}
            className="w-full py-3 rounded-2xl border border-border text-foreground/70 text-sm font-medium hover:bg-secondary/50 transition-colors disabled:opacity-50"
          >
            {loading ? "Carregando..." : "Regularizar assinatura"}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default SubscriptionPaywall;
