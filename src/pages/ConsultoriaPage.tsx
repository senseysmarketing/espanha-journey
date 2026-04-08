import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Video, Star, Calendar, Shield, CheckCircle2, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import SVGFilters from "@/components/SVGFilters";
import { toast } from "sonner";

type Currency = "eur" | "brl";

const testimonials = [
  { name: "Lucas M.", text: "A consultoria mudou completamente minha visão do processo. Em 2 semanas resolvi tudo.", stars: 5 },
  { name: "Ana C.", text: "Profissionalismo incrível. O mentor sabia exatamente o que fazer em cada etapa.", stars: 5 },
  { name: "Pedro S.", text: "Vale cada centavo. Economizei meses de burocracia com uma única sessão.", stars: 5 },
];

const benefits = [
  "Sessão individual de 60 minutos",
  "Análise completa do seu caso",
  "Plano de ação personalizado",
  "Acesso ao link de agendamento exclusivo",
  "Suporte pós-consultoria via email",
];

const ConsultoriaPage = () => {
  const [currency, setCurrency] = useState<Currency>("eur");
  const [loading, setLoading] = useState(false);
  const { session, user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [hasPurchase, setHasPurchase] = useState(false);
  const [schedulingUrl, setSchedulingUrl] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      supabase
        .from("consultoria_purchases")
        .select("scheduling_url, status")
        .eq("user_id", user.id)
        .eq("status", "paid")
        .order("created_at", { ascending: false })
        .limit(1)
        .then(({ data }) => {
          if (data && data.length > 0) {
            setHasPurchase(true);
            setSchedulingUrl(data[0].scheduling_url);
          }
        });
    }
  }, [user]);

  useEffect(() => {
    if (searchParams.get("cancelled")) {
      toast.error("Pagamento cancelado");
    }
  }, [searchParams]);

  const handleCheckout = async () => {
    if (!session) {
      navigate("/auth");
      return;
    }
    setLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-consultoria-checkout", {
        body: { currency },
      });
      if (error) throw error;
      if (data?.url) window.open(data.url, "_blank");
    } catch (err: any) {
      toast.error(err.message || "Erro ao processar pagamento");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      <SVGFilters />

      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-primary/8 blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-accent/6 blur-[100px]" />
      </div>

      <div className="relative z-10 max-w-4xl mx-auto px-4 py-8">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-foreground/70 hover:text-foreground transition-colors mb-8 text-sm font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          Voltar
        </button>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Left — Content */}
          <div className="space-y-6">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <span className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-semibold mb-4">
                <Shield className="w-3.5 h-3.5" />
                Mentor Certificado
              </span>
              <h1 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                Consultoria Individual de Imigração
              </h1>
              <p className="mt-4 text-foreground/70 leading-relaxed">
                Uma sessão exclusiva com o nosso mentor principal para analisar o seu caso específico 
                e criar um plano de ação personalizado para a sua imigração.
              </p>
            </motion.div>

            {/* Video placeholder */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="landing-glass rounded-[28px] overflow-hidden"
            >
              <div className="relative aspect-video bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center">
                <div className="absolute inset-0 bg-gradient-to-t from-background/40 to-transparent" />
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative z-10 w-16 h-16 rounded-full bg-primary/90 flex items-center justify-center cursor-pointer shadow-lg"
                >
                  <Video className="w-7 h-7 text-primary-foreground" />
                </motion.div>
              </div>
            </motion.div>

            {/* Testimonials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="space-y-3"
            >
              <h3 className="font-heading text-lg font-semibold text-foreground">O que dizem os clientes</h3>
              {testimonials.map((t, i) => (
                <div key={i} className="landing-glass rounded-2xl p-4 space-y-2">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: t.stars }).map((_, s) => (
                      <Star key={s} className="w-4 h-4 fill-warm text-warm" />
                    ))}
                  </div>
                  <p className="text-sm text-foreground/80 italic">"{t.text}"</p>
                  <p className="text-xs text-foreground/50 font-semibold">— {t.name}</p>
                </div>
              ))}
            </motion.div>
          </div>

          {/* Right — Checkout card */}
          <div className="md:sticky md:top-8 self-start">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="landing-glass rounded-[28px] p-8 space-y-6"
            >
              {hasPurchase ? (
                /* Already purchased — show scheduling link */
                <div className="text-center space-y-5">
                  <div className="w-16 h-16 rounded-2xl bg-journey-complete/15 flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-journey-complete" />
                  </div>
                  <div>
                    <h3 className="font-heading text-xl font-bold text-foreground">Consultoria adquirida!</h3>
                    <p className="text-foreground/60 text-sm mt-2">
                      Clique abaixo para agendar a sua sessão.
                    </p>
                  </div>
                  <motion.a
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    href={schedulingUrl || "#"}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-3.5 rounded-2xl bg-journey-complete text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-lg"
                  >
                    <Calendar className="w-5 h-5" />
                    Agendar Sessão
                  </motion.a>
                </div>
              ) : (
                <>
                  <div className="text-center">
                    <div className="font-heading text-4xl font-bold text-foreground">
                      {currency === "eur" ? "€100" : "R$600"}
                    </div>
                    <p className="text-foreground/50 text-sm mt-1">Pagamento único</p>
                  </div>

                  {/* Currency toggle */}
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
                        className={`relative z-10 flex-1 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                          currency === c ? "text-primary" : "text-muted-foreground"
                        }`}
                      >
                        {c === "eur" ? "🇪🇺 Euro" : "🇧🇷 Real"}
                      </button>
                    ))}
                  </div>

                  {/* Benefits */}
                  <ul className="space-y-2.5">
                    {benefits.map((b, i) => (
                      <li key={i} className="flex items-center gap-2.5 text-sm text-foreground/80">
                        <CheckCircle2 className="w-4 h-4 text-primary flex-shrink-0" />
                        {b}
                      </li>
                    ))}
                  </ul>

                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleCheckout}
                    disabled={loading}
                    className="w-full py-3.5 rounded-2xl bg-primary text-primary-foreground font-semibold text-base transition-all disabled:opacity-50"
                  >
                    {loading ? "Redirecionando..." : `Comprar por ${currency === "eur" ? "€100" : "R$600"}`}
                  </motion.button>

                  <p className="text-xs text-foreground/40 text-center">
                    Pagamento seguro via Stripe. O link de agendamento será liberado após a compra.
                  </p>
                </>
              )}
            </motion.div>

            {/* WhatsApp help */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="mt-4 text-center"
            >
              <a
                href="https://wa.me/34600000000?text=Ol%C3%A1%2C%20tenho%20d%C3%BAvidas%20sobre%20a%20consultoria%20do%20Instituto%20Empuria"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 text-sm text-foreground/50 hover:text-foreground/70 transition-colors"
              >
                <MessageCircle className="w-4 h-4" />
                Dúvidas? Fale connosco no WhatsApp
              </a>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConsultoriaPage;
