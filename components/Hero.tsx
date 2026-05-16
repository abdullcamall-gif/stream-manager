"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";
import Image from "next/image";

const slides = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1593305841991-05c297ba4575?q=80&w=2070&auto=format&fit=crop",
    alt: "Premium Streaming Experience"
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1512444596074-0ae276850824?q=80&w=2070&auto=format&fit=crop",
    alt: "Watching on Mobile"
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1522869635100-9f4c5e86aa37?q=80&w=2070&auto=format&fit=crop",
    alt: "Modern Home Setup"
  }
];

export default function Hero() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const shouldReduceMotion = useReducedMotion();

  useEffect(() => {
    if (shouldReduceMotion) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [shouldReduceMotion]);

  const scrollToPlans = () => {
    const plansSection = document.getElementById("services");
    if (plansSection) {
      plansSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  const openWhatsApp = () => {
    window.open("https://wa.me/258840000000", "_blank");
  };

  return (
    <section className="relative h-[85vh] md:h-[92vh] min-h-[600px] flex items-center bg-black overflow-hidden">
      {/* Background Slideshow */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, scale: 1.1 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.8, ease: "easeOut" }}
            className="relative w-full h-full"
          >
            <Image
              src={slides[currentSlide].image}
              alt={slides[currentSlide].alt}
              fill
              className="object-cover brightness-[0.45]"
              priority
            />
          </motion.div>
        </AnimatePresence>
        
        {/* Cinematic Overlays */}
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/40 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-black/20 z-10" />
      </div>

      <div className="container mx-auto px-6 relative z-20">
        <div className="max-w-4xl">
          <motion.div 
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="text-left"
          >
            <div className="inline-block px-4 py-1.5 mb-8 rounded-full border border-primary/30 bg-primary/10 backdrop-blur-md">
              <span className="text-primary text-[10px] md:text-xs font-bold tracking-widest uppercase">Streaming em Moçambique</span>
            </div>
            
            <h1 className="font-headline text-5xl md:text-8xl font-bold mb-6 text-white leading-[1] tracking-tighter">
              Pague streaming <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary via-secondary to-primary animate-gradient-text">
                facilmente
              </span>
            </h1>
            
            <p className="font-body text-lg md:text-2xl text-on-surface-variant/90 mb-10 max-w-xl leading-relaxed">
              Netflix, Spotify, Disney+, Prime Video e muito mais com pagamentos locais via eMola, M-Pesa e bancos.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-5">
              <button 
                onClick={scrollToPlans}
                className={cn(
                  "bg-primary text-on-primary px-10 py-5 rounded-2xl font-headline font-bold text-lg transition-all duration-300",
                  "hover:scale-[1.02] active:scale-95 shadow-[0_0_25px_rgba(81,243,227,0.4)] hover:shadow-[0_0_35px_rgba(81,243,227,0.6)]"
                )}
              >
                Ver Planos
              </button>
              
              <button 
                onClick={openWhatsApp}
                className={cn(
                  "liquid-glass text-white px-10 py-5 rounded-2xl font-headline font-bold text-lg transition-all duration-300",
                  "hover:bg-white/10 active:scale-95 flex items-center justify-center gap-3 border-white/20"
                )}
              >
                <svg className="w-6 h-6 fill-current" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.72.937 3.659 1.432 5.631 1.433h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                WhatsApp Suporte
              </button>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Progress Dots */}
      <div className="absolute bottom-10 right-6 md:right-12 z-20 flex flex-col gap-3">
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentSlide(idx)}
            aria-label={`Slide ${idx + 1}`}
            className={cn(
              "w-1.5 transition-all duration-700 rounded-full",
              currentSlide === idx ? "h-12 bg-primary shadow-[0_0_15px_rgba(81,243,227,0.8)]" : "h-3 bg-white/20 hover:bg-white/40"
            )}
          />
        ))}
      </div>
    </section>
  );
}
