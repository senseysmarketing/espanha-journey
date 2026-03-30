import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";

const StickyCTADock = () => {
  const navigate = useNavigate();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <AnimatePresence>
      {visible && (
        <div className="fixed bottom-6 left-0 w-full flex justify-center z-50 pointer-events-none">
          <motion.div
            initial={{ y: 80, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 80, opacity: 0 }}
            transition={{ type: "spring", stiffness: 200, damping: 25 }}
            className="w-[calc(100%-2rem)] max-w-lg pointer-events-auto"
          >
            <div className="flex items-center justify-between gap-4 px-6 py-4 rounded-[22px] border border-[hsla(0,0%,100%,0.5)] bg-white/70 backdrop-blur-2xl shadow-[0_12px_48px_hsla(220,30%,20%,0.12)]">
              <div>
                <p className="text-sm text-[hsl(220,10%,45%)]">A partir de</p>
                <p className="text-2xl font-extrabold text-[hsl(220,25%,12%)]">
                  9,90€<span className="text-sm font-normal text-[hsl(220,10%,50%)]">/mês</span>
                </p>
              </div>
              <button
                onClick={() => navigate("/dashboard")}
                className="group flex items-center gap-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-[hsl(32,90%,50%)] to-[hsl(25,95%,55%)] text-white font-semibold shadow-[0_4px_20px_hsla(32,90%,50%,0.35)] hover:shadow-[0_8px_30px_hsla(32,90%,50%,0.5)] transition-all duration-300 hover:scale-[1.03]"
              >
                Garantir minha vaga
                <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5" />
              </button>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

export default StickyCTADock;
