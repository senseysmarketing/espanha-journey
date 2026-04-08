import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Clock, FileSearch } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, y: 30, filter: "blur(20px)" }}
        animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
        className="relative z-10 text-center max-w-3xl mx-auto"
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-8"
        >
          <Shield className="w-4 h-4" />
          Seu instituto de imigração na Espanha
        </motion.div>

        <h1 className="font-heading text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-foreground">
          Imigre com{" "}
          <span className="text-gradient-primary">
            segurança
          </span>
          <br />e inteligência
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          O Instituto Empuria guia brasileiros em cada passo da jornada na Espanha.
          Documentos, prazos e burocracia — tudo resolvido.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <motion.button
            onClick={() => navigate("/dashboard")}
            animate={{
              boxShadow: [
                "0 8px 30px hsla(17,100%,30%,0.3)",
                "0 12px 50px hsla(17,100%,30%,0.5)",
                "0 8px 30px hsla(17,100%,30%,0.3)",
              ],
            }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            className="group relative inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-primary-foreground font-semibold text-lg transition-all duration-300 hover:scale-[1.02] overflow-hidden"
            style={{
              background: "linear-gradient(135deg, hsl(17,100%,30%), hsl(21,100%,41%), hsl(17,100%,30%))",
              backgroundSize: "200% 100%",
              animation: "shimmer 3s linear infinite",
            }}
          >
            <span className="relative z-10 flex items-center gap-2">
              Começar agora
              <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
            </span>
          </motion.button>
          <button
            onClick={() => {
              document.getElementById("bento")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-border text-foreground font-medium text-lg hover:bg-secondary/50 transition-all duration-300"
          >
            Ver funcionalidades
          </button>
        </motion.div>
      </motion.div>

      {/* Product Stage — glass dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.6, duration: 1, type: "spring", stiffness: 60, damping: 20 }}
        className="relative z-10 mt-16 w-full max-w-4xl mx-auto"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative rounded-[32px] landing-glass p-6 sm:p-10 overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: "NIE", status: "Aprovado", color: "hsl(145,60%,42%)" },
              { icon: Clock, label: "730 dias", status: "Dia 245", color: "hsl(21,100%,41%)" },
              { icon: FileSearch, label: "Contrato", status: "Verificado", color: "hsl(17,100%,30%)" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.15, type: "spring", stiffness: 100 }}
                className="rounded-2xl landing-glass p-4 text-center"
              >
                <item.icon className="w-8 h-8 mx-auto mb-2" style={{ color: item.color }} />
                <p className="text-sm font-semibold text-foreground">{item.label}</p>
                <p className="text-xs mt-1" style={{ color: item.color }}>{item.status}</p>
              </motion.div>
            ))}
          </div>

          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none rounded-[32px]" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
