import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SVGFilters from "@/components/SVGFilters";

const SpainFlag = () => (
  <svg width="36" height="27" viewBox="0 0 36 27" className="inline-block mr-2 rounded-[4px] shadow-sm align-middle" style={{ verticalAlign: 'middle' }}>
    <rect width="36" height="27" fill="#AA151B" />
    <rect y="6.75" width="36" height="13.5" fill="#F1BF00" />
  </svg>
);

type Currency = "brl" | "eur";

const CheckoutPage = () => {
  const [currency, setCurrency] = useState<Currency>("eur");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const { session } = useAuth();
  const navigate = useNavigate();

  const handleCheckout = async () => {
    if (!session) return;
    setLoading(true);
    setError("");

    try {
      const { data, error: fnError } = await supabase.functions.invoke("create-checkout", {
        body: { currency },
      });

      if (fnError) throw fnError;
      if (data?.url) {
        window.open(data.url, "_blank");
      }
    } catch (err: any) {
      setError(err.message || "Erro ao criar sessão de pagamento");
      if (navigator.vibrate) navigator.vibrate(200);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden flex items-center justify-center px-4">
      <SVGFilters />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/3 left-1/3 w-[500px] h-[500px] rounded-full bg-primary/10 blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/3 w-[400px] h-[400px] rounded-full bg-accent/10 blur-[100px] animate-pulse" style={{ animationDelay: "1s" }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">🇪🇸 Espanha Pass</h1>
          <p className="text-muted-foreground mt-2">Escolha sua moeda e assine</p>
        </div>

        <div className="landing-glass rounded-3xl p-8 space-y-6">
          {/* Segmented Control */}
          <div className="relative flex rounded-2xl bg-secondary/50 p-1">
            <motion.div
              className="absolute top-1 bottom-1 rounded-xl bg-primary/20 border border-primary/30"
              animate={{ left: currency === "eur" ? "4px" : "50%", width: "calc(50% - 8px)" }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            />
            {(["eur", "brl"] as Currency[]).map((c) => (
              <button
                key={c}
                onClick={() => setCurrency(c)}
                className={`relative z-10 flex-1 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  currency === c ? "text-primary" : "text-muted-foreground"
                }`}
              >
                {c === "eur" ? "€ 9,90/mês" : "R$ 59,90/mês"}
              </button>
            ))}
          </div>

          {/* Features */}
          <ul className="space-y-3 text-sm text-foreground/80">
            {[
              "Jornada completa NIE → Nacionalidade",
              "Scanner de contratos com IA",
              "Caçador de citas automatizado",
              "Mapa interativo de bairros",
              "Academy com videoaulas",
              "Mentor IA 24/7",
            ].map((f, i) => (
              <li key={i} className="flex items-center gap-2">
                <span className="text-primary">✓</span> {f}
              </li>
            ))}
          </ul>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-sm rounded-xl p-3"
              style={{ color: "hsl(var(--coral))", backgroundColor: "hsl(var(--coral) / 0.1)" }}
            >
              {error}
            </motion.p>
          )}

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleCheckout}
            disabled={loading}
            className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base transition-all disabled:opacity-50"
          >
            {loading ? "Redirecionando..." : `Assinar por ${currency === "eur" ? "€ 9,90" : "R$ 59,90"}/mês`}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
};

export default CheckoutPage;
