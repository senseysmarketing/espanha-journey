import { motion } from "framer-motion";
import { FileSearch, CalendarSearch, Clock, Map, GraduationCap } from "lucide-react";

const features = [
  {
    icon: FileSearch,
    title: "Scanner de Contratos IA",
    desc: "Analisa contratos de aluguel em segundos e detecta cláusulas abusivas automaticamente.",
    span: "col-span-1",
    color: "hsl(200,70%,50%)",
  },
  {
    icon: CalendarSearch,
    title: "Cita Hunter",
    desc: "Monitora vagas em consulados e escritórios de imigração 24/7. Notificação instantânea.",
    span: "col-span-1",
    color: "hsl(32,90%,50%)",
  },
  {
    icon: Clock,
    title: "Nationality Clock",
    desc: "Contagem regressiva inteligente dos seus 730 dias de residência para cidadania espanhola.",
    span: "col-span-1 sm:col-span-2",
    color: "hsl(145,60%,42%)",
  },
  {
    icon: Map,
    title: "Explorar Cidades",
    desc: "Compare bairros, custo de vida e segurança das principais cidades espanholas.",
    span: "col-span-1",
    color: "hsl(210,70%,55%)",
  },
  {
    icon: GraduationCap,
    title: "Academy Pass",
    desc: "Curso completo de imigração com aulas em vídeo, materiais e certificado.",
    span: "col-span-1",
    color: "hsl(270,60%,55%)",
  },
];

const cardVariant = {
  hidden: { opacity: 0, y: 30, filter: "blur(12px)" },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { delay: i * 0.1, duration: 0.6 },
  }),
};

const BentoEcosystem = () => (
  <section id="bento" className="px-6 py-24 max-w-5xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-14"
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(220,25%,12%)] tracking-tight">
        Tudo o que você precisa, em um só lugar
      </h2>
      <p className="mt-4 text-[hsl(220,10%,45%)] text-lg max-w-xl mx-auto">
        Um ecossistema completo para sua jornada na Espanha.
      </p>
    </motion.div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
      {features.map((f, i) => (
        <motion.div
          key={f.title}
          custom={i}
          variants={cardVariant}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, margin: "-60px" }}
          className={`${f.span} group rounded-[28px] border border-[hsla(0,0%,100%,0.5)] bg-white/50 backdrop-blur-xl p-7 shadow-[0_4px_24px_hsla(220,20%,20%,0.06)] hover:shadow-[0_8px_40px_hsla(220,20%,20%,0.1)] transition-shadow duration-300 cursor-default`}
        >
          <div
            className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5"
            style={{ backgroundColor: `${f.color}15` }}
          >
            <f.icon className="w-6 h-6" style={{ color: f.color }} />
          </div>
          <h3 className="text-xl font-semibold text-[hsl(220,25%,12%)]">{f.title}</h3>
          <p className="mt-2 text-[hsl(220,10%,50%)] leading-relaxed">{f.desc}</p>
        </motion.div>
      ))}
    </div>
  </section>
);

export default BentoEcosystem;
