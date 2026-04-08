import { motion } from "framer-motion";
import { BadgeCheck, Users, Award } from "lucide-react";

const badges = [
  { icon: BadgeCheck, text: "Certificado por Gestores Oficiais" },
  { icon: Users, text: "+2.000 brasileiros assessorados" },
  { icon: Award, text: "Especialista em imigração desde 2019" },
];

const ExpertSection = () => (
  <section className="px-6 py-24 max-w-5xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 40, filter: "blur(16px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7 }}
      className="relative rounded-[32px] landing-glass-refract p-8 sm:p-14 overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row items-center gap-10">
        <div className="flex-shrink-0">
          <div className="w-32 h-32 rounded-[28px] bg-gradient-to-br from-primary to-accent flex items-center justify-center shadow-[0_8px_30px_hsla(17,100%,30%,0.3)]">
            <span className="text-5xl">🧑‍💼</span>
          </div>
        </div>

        <div className="text-center md:text-left flex-1">
          <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground tracking-tight">
            Seu mentor pessoal de imigração
          </h2>
          <p className="mt-4 text-muted-foreground text-lg leading-relaxed max-w-lg">
            Assistente com inteligência artificial treinado por especialistas em imigração espanhola.
            Tire dúvidas, receba orientações e tenha um guia 24/7 durante todo o processo.
          </p>

          <div className="mt-8 flex flex-wrap gap-3 justify-center md:justify-start">
            {badges.map((b) => (
              <div
                key={b.text}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/8 border border-primary/15 text-primary text-sm font-medium"
              >
                <b.icon className="w-4 h-4" />
                {b.text}
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  </section>
);

export default ExpertSection;
