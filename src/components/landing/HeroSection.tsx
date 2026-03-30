import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Shield, Clock, FileSearch } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-24 pb-16 overflow-hidden">
      {/* Ambient light blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-[15%] left-[10%] w-[500px] h-[500px] rounded-full bg-[hsla(32,80%,60%,0.08)] blur-[120px]" />
        <div className="absolute bottom-[20%] right-[10%] w-[400px] h-[400px] rounded-full bg-[hsla(210,70%,50%,0.06)] blur-[100px]" />
      </div>

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
          className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[hsla(32,60%,50%,0.1)] border border-[hsla(32,60%,50%,0.2)] text-[hsl(32,60%,45%)] text-sm font-medium mb-8"
        >
          <Shield className="w-4 h-4" />
          Seu anjo da guarda na Espanha
        </motion.div>

        <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold tracking-tight leading-[1.1] text-[hsl(220,25%,12%)]">
          Imigre com{" "}
          <span className="bg-gradient-to-r from-[hsl(32,90%,50%)] to-[hsl(25,95%,55%)] bg-clip-text text-transparent">
            segurança
          </span>
          <br />e inteligência
        </h1>

        <p className="mt-6 text-lg sm:text-xl text-[hsl(220,10%,45%)] max-w-xl mx-auto leading-relaxed">
          A plataforma que guia brasileiros em cada passo da jornada na Espanha.
          Documentos, prazos e burocracia — tudo resolvido por IA.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate("/dashboard")}
            className="group inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-gradient-to-r from-[hsl(32,90%,50%)] to-[hsl(25,95%,55%)] text-white font-semibold text-lg shadow-[0_8px_30px_hsla(32,90%,50%,0.35)] hover:shadow-[0_12px_40px_hsla(32,90%,50%,0.5)] transition-all duration-300 hover:scale-[1.02]"
          >
            Começar agora
            <ArrowRight className="w-5 h-5 transition-transform group-hover:translate-x-1" />
          </button>
          <button
            onClick={() => {
              document.getElementById("bento")?.scrollIntoView({ behavior: "smooth" });
            }}
            className="inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl border border-[hsl(220,15%,85%)] text-[hsl(220,20%,30%)] font-medium text-lg hover:bg-[hsl(220,20%,96%)] transition-all duration-300"
          >
            Ver funcionalidades
          </button>
        </motion.div>
      </motion.div>

      {/* Product Stage — 3D glass dashboard preview */}
      <motion.div
        initial={{ opacity: 0, y: 60, rotateX: 8 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.6, duration: 1, type: "spring", stiffness: 60, damping: 20 }}
        className="relative z-10 mt-16 w-full max-w-4xl mx-auto"
        style={{ perspective: "1200px" }}
      >
        <div
          className="relative rounded-[32px] border border-[hsla(0,0%,100%,0.5)] bg-white/60 backdrop-blur-xl shadow-[0_20px_80px_hsla(220,30%,20%,0.12),0_0_0_1px_hsla(0,0%,100%,0.6)_inset] p-6 sm:p-10 overflow-hidden"
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Simulated dashboard */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { icon: Shield, label: "NIE", status: "Aprovado", color: "hsl(145,60%,42%)" },
              { icon: Clock, label: "730 dias", status: "Dia 245", color: "hsl(32,90%,50%)" },
              { icon: FileSearch, label: "Contrato", status: "Verificado", color: "hsl(200,70%,50%)" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 + i * 0.15, type: "spring", stiffness: 100 }}
                className="rounded-2xl bg-white/80 border border-[hsla(0,0%,0%,0.06)] p-4 text-center"
              >
                <item.icon className="w-8 h-8 mx-auto mb-2" style={{ color: item.color }} />
                <p className="text-sm font-semibold text-[hsl(220,25%,15%)]">{item.label}</p>
                <p className="text-xs mt-1" style={{ color: item.color }}>{item.status}</p>
              </motion.div>
            ))}
          </div>

          {/* Glass shimmer overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/30 via-transparent to-white/10 pointer-events-none rounded-[32px]" />
        </div>
      </motion.div>
    </section>
  );
};

export default HeroSection;
