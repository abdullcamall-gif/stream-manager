"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { History, User } from "lucide-react";
import { motion, useScroll, useTransform } from "framer-motion";
import { cn } from "@/lib/utils";

const navLinks = [
  { name: "Serviços", href: "#services" },
  { name: "Sobre Nós", href: "#about" },
  { name: "Dúvidas", href: "#faq" }
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const { scrollY } = useScroll();
  
  const backgroundColor = useTransform(
    scrollY,
    [0, 50],
    ["rgba(0, 0, 0, 0)", "rgba(0, 0, 0, 0.85)"]
  );

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      style={{ backgroundColor }}
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-500",
        isScrolled ? "border-b border-white/10 backdrop-blur-2xl py-3" : "border-transparent py-5"
      )}
    >
      <div className="flex justify-between items-center px-6 md:px-12 w-full max-w-7xl mx-auto">
        {/* Brand */}
        <Link 
          href="/" 
          className="font-headline text-2xl md:text-3xl font-bold text-white tracking-tighter hover:text-primary transition-colors duration-300"
        >
          Elber<span className="text-primary">Streaming</span>
        </Link>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-10">
          {navLinks.map((link) => (
            <Link 
              key={link.name}
              href={link.href} 
              className="group relative py-1 font-headline text-sm font-medium text-on-surface-variant hover:text-white transition-colors duration-300"
            >
              {link.name}
              {/* Animated Glow Underline */}
              <span className="absolute -bottom-1 left-0 w-0 h-[2px] bg-primary group-hover:w-full transition-all duration-300 shadow-[0_0_10px_#51f3e3]" />
              
              {/* Animated Mini Arrow */}
              <motion.span
                initial={{ opacity: 0, y: -4 }}
                whileHover={{ opacity: 1, y: 0 }}
                className="absolute -bottom-4 left-1/2 -translate-x-1/2 text-primary text-[8px]"
              >
                ▲
              </motion.span>
            </Link>
          ))}
        </nav>

        {/* Actions */}
        <div className="flex items-center gap-6">
          <Link 
            href="/historico" 
            className="text-on-surface-variant hover:text-primary transition-all duration-300 hover:scale-110"
          >
            <History className="w-6 h-6" />
          </Link>
          
          <div className="group relative">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-white/10 group-hover:border-primary transition-all duration-500 cursor-pointer p-[2px]">
              <div className="w-full h-full bg-surface-container rounded-full flex items-center justify-center text-on-surface-variant group-hover:text-primary transition-colors">
                <User className="w-5 h-5" />
              </div>
            </div>
            
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-primary/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500 -z-10" />
          </div>
        </div>
      </div>
    </motion.header>
  );
}
