"use client";

import React from "react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RenewalPage() {
  return (
    <main className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center bg-[#050505]">
      <div className="max-w-md w-full liquid-glass p-10 rounded-3xl text-center space-y-6 border border-white/5">
        <div className="w-20 h-20 bg-rose-500/10 rounded-full flex items-center justify-center mx-auto mb-6 border border-rose-500/20">
          <AlertCircle className="w-12 h-12 text-rose-500" />
        </div>
        <h1 className="font-headline text-3xl font-bold text-white">Renovação Desativada</h1>
        <p className="font-body text-on-surface-variant leading-relaxed">
          O sistema de renovação está temporariamente indisponível. Por favor, realize um novo pedido através da página inicial ou contacte o suporte.
        </p>
        <div className="pt-6 space-y-4">
          <Link 
            href="/historico"
            className="w-full flex items-center justify-center gap-3 py-4 bg-primary text-black font-headline font-bold rounded-2xl hover:brightness-110 transition-all shadow-lg"
          >
            <ArrowLeft className="w-5 h-5" />
            Voltar ao Histórico
          </Link>
          <Link 
            href="/"
            className="block text-sm text-on-surface-variant hover:text-white transition-colors"
          >
            Ir para a Página Inicial
          </Link>
        </div>
      </div>
    </main>
  );
}
