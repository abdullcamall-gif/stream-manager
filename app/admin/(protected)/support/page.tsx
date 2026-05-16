"use client";

import { useState } from "react";
import {
  MessageSquare,
  Search,
  MoreHorizontal,
  Send,
  User,
  CheckCircle2,
  Inbox,
} from "lucide-react";
import { cn } from "@/lib/utils";

type SupportTicket = {
  id: string;
  user: string;
  time: string;
  lastMsg: string;
  status: "OPEN" | "CLOSED";
};

export default function AdminSupportPage() {
  const [tickets] = useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = useState<SupportTicket | null>(null);

  return (
    <div className="h-[calc(100vh-140px)] flex gap-6 animate-in fade-in duration-700">
      <div className="hidden md:flex w-80 flex-col liquid-glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-headline text-xl font-bold text-white mb-4">Tickets Suporte</h2>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input
              type="text"
              placeholder="Buscar tickets..."
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-9 pr-4 text-xs text-white focus:outline-none"
            />
          </div>
        </div>
        <div className="flex-1 overflow-y-auto">
          {tickets.length > 0 ? tickets.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedTicket(t)}
              className={cn(
                "w-full p-6 text-left border-b border-white/5 transition-all hover:bg-white/[0.02]",
                selectedTicket?.id === t.id ? "bg-primary/5 border-l-4 border-l-primary" : "",
              )}
            >
              <div className="flex justify-between items-start mb-2">
                <span className="font-headline text-sm font-bold text-white">{t.user}</span>
                <span className="text-[10px] text-on-surface-variant font-bold">{t.time}</span>
              </div>
              <p className="text-xs text-on-surface-variant line-clamp-1 mb-3">{t.lastMsg}</p>
              <div className="flex gap-2">
                <span
                  className={cn(
                    "px-2 py-0.5 rounded-full text-[8px] font-bold tracking-widest uppercase border",
                    t.status === "OPEN"
                      ? "bg-primary/10 text-primary border-primary/20"
                      : "bg-white/5 text-on-surface-variant border-white/10",
                  )}
                >
                  {t.status}
                </span>
              </div>
            </button>
          )) : (
            <div className="p-12 text-center space-y-2 opacity-50">
              <Inbox className="w-8 h-8 mx-auto text-white/20" />
              <p className="text-[10px] font-bold uppercase tracking-widest">Nenhum ticket</p>
            </div>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col liquid-glass rounded-3xl border border-white/5 overflow-hidden min-h-[500px]">
        {selectedTicket ? (
          <>
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center border border-white/10">
                  <User className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="font-headline font-bold text-white">{selectedTicket.user}</h3>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                    <span className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Ativo agora • Ticket #{selectedTicket.id}</span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <button className="p-2 hover:bg-white/5 rounded-xl text-on-surface-variant hover:text-white transition-all border border-white/10">
                  <CheckCircle2 className="w-5 h-5" />
                </button>
                <button className="p-2 hover:bg-white/5 rounded-xl text-on-surface-variant hover:text-white transition-all border border-white/10">
                  <MoreHorizontal className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 p-8 overflow-y-auto space-y-6">
              <div className="flex justify-center">
                <span className="px-4 py-1 bg-white/5 rounded-full text-[10px] text-on-surface-variant font-bold uppercase tracking-widest">
                  Hoje, 14:20
                </span>
              </div>
              <div className="flex gap-4 max-w-[80%]">
                <div className="w-8 h-8 bg-white/5 rounded-lg flex items-center justify-center shrink-0 border border-white/10">
                  <User className="w-4 h-4 text-on-surface-variant" />
                </div>
                <div className="bg-white/5 p-4 rounded-2xl rounded-tl-none border border-white/5">
                  <p className="text-sm text-white leading-relaxed">{selectedTicket.lastMsg}</p>
                </div>
              </div>
              <div className="flex flex-row-reverse gap-4 max-w-[80%] ml-auto">
                <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center shrink-0 border border-primary/20">
                  <User className="w-4 h-4 text-primary" />
                </div>
                <div className="bg-primary/10 p-4 rounded-2xl rounded-tr-none border border-primary/10">
                  <p className="text-sm text-white leading-relaxed">Olá João, verificamos sua conta e realizamos o reset da senha. Poderia testar novamente com as novas credenciais enviadas por e-mail?</p>
                </div>
              </div>
            </div>

            <div className="p-6 bg-white/[0.01] border-t border-white/5">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Escreva sua resposta..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-24 text-sm text-white focus:outline-none focus:border-primary/50 transition-all"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-2">
                  <button className="bg-primary text-on-primary p-2 px-4 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-all">
                    <Send className="w-4 h-4" />
                    <span className="text-xs">Enviar</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
            <MessageSquare className="w-16 h-16 text-white/10 mb-6" />
            <h3 className="font-headline text-2xl font-bold text-white">Selecione um Ticket</h3>
            <p className="text-on-surface-variant mt-2">Escolha uma conversa ao lado para iniciar o atendimento.</p>
          </div>
        )}
      </div>
    </div>
  );
}
