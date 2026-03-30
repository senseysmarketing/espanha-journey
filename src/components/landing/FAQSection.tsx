import { motion } from "framer-motion";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const faqs = [
  {
    q: "O Espanha Pass substitui um advogado de imigração?",
    a: "O Espanha Pass é uma ferramenta de orientação inteligente que automatiza tarefas burocráticas e fornece informações atualizadas. Para casos legais complexos, recomendamos consultar um profissional — e nosso Mentor IA pode indicar gestores verificados.",
  },
  {
    q: "Como funciona o Scanner de Contratos IA?",
    a: "Você faz upload do PDF do seu contrato de aluguel e nossa IA analisa cada cláusula, identificando termos abusivos, valores fora do mercado e condições ilegais segundo a legislação espanhola.",
  },
  {
    q: "O que é o Cita Hunter?",
    a: "É um monitor automático que verifica disponibilidade de agendamentos em consulados, comisarías e oficinas de extranjería. Quando uma vaga abre, você recebe uma notificação instantânea.",
  },
  {
    q: "Como funciona a contagem dos 730 dias?",
    a: "O Nationality Clock calcula automaticamente os dias de residência necessários para a cidadania espanhola, descontando viagens ao exterior e mostrando uma projeção de data estimada.",
  },
  {
    q: "Posso cancelar a qualquer momento?",
    a: "Sim! Não há fidelidade. Você pode cancelar sua assinatura a qualquer momento diretamente na área de perfil, sem taxas ou burocracia.",
  },
  {
    q: "Os meus documentos ficam seguros?",
    a: "Todos os documentos são criptografados e armazenados em servidores seguros na Europa, em conformidade com o RGPD (GDPR europeu).",
  },
];

const FAQSection = () => (
  <section className="px-6 py-24 max-w-3xl mx-auto">
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className="text-center mb-12"
    >
      <h2 className="text-3xl sm:text-4xl font-bold text-[hsl(220,25%,12%)] tracking-tight">
        Perguntas Frequentes
      </h2>
    </motion.div>

    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(10px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true }}
      transition={{ delay: 0.1, duration: 0.6 }}
      className="rounded-[28px] landing-glass overflow-hidden"
    >
      <Accordion type="single" collapsible className="divide-y divide-[hsl(220,15%,92%)]">
        {faqs.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-b-0">
            <AccordionTrigger className="px-7 py-5 text-left text-[hsl(220,25%,15%)] font-medium hover:no-underline hover:text-[hsl(32,80%,50%)] transition-colors [&[data-state=open]]:text-[hsl(32,80%,50%)]">
              {faq.q}
            </AccordionTrigger>
            <AccordionContent className="px-7 pb-5 text-[hsl(220,10%,45%)] leading-relaxed">
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </motion.div>
  </section>
);

export default FAQSection;
