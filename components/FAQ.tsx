"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

const faqs = [
  {
    question: "Como recebo minha conta?",
    answer: "Após a confirmação do pagamento, você receberá os dados de acesso diretamente no seu e-mail cadastrado e também poderá visualizar em sua área de cliente no site."
  },
  {
    question: "Qual o prazo de entrega?",
    answer: "Para pagamentos via PIX ou Cartão de Crédito, o envio é instantâneo. Para boletos ou transferências manuais, o prazo é de 1 a 2 dias úteis após a compensação bancária."
  },
  {
    question: "As contas têm garantia?",
    answer: "Sim! Todas as nossas assinaturas possuem garantia total durante todo o período contratado. Se houver qualquer problema, nossa equipe resolve ou substitui o acesso rapidamente."
  },
  {
    question: "Posso renovar meu plano?",
    answer: "Sim, você pode renovar o mesmo perfil sempre que desejar. Avisaremos você por e-mail antes do seu período expirar para que não perca o acesso."
  }
];

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  return (
    <section id="faq" className="py-24 px-6 md:px-12 max-w-3xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-headline text-3xl md:text-4xl text-white mb-4"
        >
          Perguntas Frequentes
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-body text-on-surface-variant"
        >
          Tire suas dúvidas rápidas sobre nosso funcionamento.
        </motion.p>
      </div>

      <div className="flex flex-col gap-4">
        {faqs.map((faq, idx) => (
          <div 
            key={idx}
            className="liquid-glass rounded-2xl overflow-hidden border border-white/5"
          >
            <button
              onClick={() => setActiveIndex(activeIndex === idx ? null : idx)}
              className="w-full flex items-center justify-between p-6 text-left hover:bg-white/5 transition-colors"
            >
              <span className="font-headline text-lg text-white">{faq.question}</span>
              <ChevronDown 
                className={cn(
                  "w-5 h-5 text-primary transition-transform duration-300",
                  activeIndex === idx ? "rotate-180" : ""
                )} 
              />
            </button>
            
            <AnimatePresence>
              {activeIndex === idx && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  <div className="px-6 pb-6 text-on-surface-variant font-body leading-relaxed border-t border-white/5 pt-4">
                    {faq.answer}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
}
