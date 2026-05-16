"use client";

import { motion } from "framer-motion";
import { Shield, Zap, Headphones } from "lucide-react";

const features = [
  {
    icon: Shield,
    title: "Segurança Total",
    description: "Protocolos de criptografia de ponta a ponta garantindo que sua conta e dados estejam sempre protegidos."
  },
  {
    icon: Zap,
    title: "Entrega Instantânea",
    description: "Sem esperas. Assim que o pagamento é confirmado, seu acesso é liberado automaticamente via e-mail e painel."
  },
  {
    icon: Headphones,
    title: "Suporte 24/7",
    description: "Nossa equipe de especialistas está pronta para ajudar você em qualquer horário, todos os dias da semana."
  }
];

export default function About() {
  return (
    <section id="about" className="py-24 px-6 md:px-12 max-w-7xl mx-auto">
      <div className="text-center mb-16">
        <motion.h2 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-headline text-3xl md:text-4xl text-white mb-4"
        >
          Por que nos escolher?
        </motion.h2>
        <motion.p 
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ delay: 0.1 }}
          className="font-body text-lg text-on-surface-variant max-w-2xl mx-auto"
        >
          Excelência técnica e compromisso com a sua diversão digital.
        </motion.p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: idx * 0.2 }}
            whileHover={{ y: -10 }}
            className="liquid-glass p-10 rounded-3xl text-center group transition-all duration-500"
          >
            <div className="w-20 h-20 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:bg-primary/20 transition-all duration-500">
              <feature.icon className="w-10 h-10 text-primary" />
            </div>
            <h3 className="font-headline text-xl text-white mb-4">{feature.title}</h3>
            <p className="font-body text-on-surface-variant leading-relaxed">
              {feature.description}
            </p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
