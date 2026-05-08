"use client";

import { 
  Settings as SettingsIcon, 
  Shield, 
  CreditCard, 
  Bell, 
  Globe, 
  Database,
  Save,
  Key
} from "lucide-react";
import { cn } from "@/lib/utils";

const sections = [
  { id: "general", label: "Geral", icon: Globe },
  { id: "security", label: "Segurança", icon: Shield },
  { id: "payments", label: "Pagamentos", icon: CreditCard },
  { id: "notifications", label: "Notificações", icon: Bell },
  { id: "system", label: "Sistema", icon: Database },
];

export default function AdminSettingsPage() {
  return (
    <div className="max-w-4xl animate-in fade-in duration-700">
      <div className="flex justify-between items-end mb-12">
        <div>
          <h1 className="font-headline text-4xl font-bold text-white tracking-tight">Configurações</h1>
          <p className="text-on-surface-variant mt-1">Gerencie parâmetros globais e segurança do sistema.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-8 py-3 rounded-2xl font-headline font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20">
          <Save className="w-5 h-5" />
          Salvar Alterações
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-[240px_1fr] gap-8">
        {/* Sidebar Nav */}
        <aside className="space-y-2">
          {sections.map((s) => (
            <button
              key={s.id}
              className={cn(
                "w-full flex items-center gap-4 p-4 rounded-2xl transition-all font-headline text-sm font-bold",
                s.id === "general" ? "bg-primary/10 text-primary border border-primary/20" : "text-on-surface-variant hover:bg-white/5 hover:text-white"
              )}
            >
              <s.icon className="w-5 h-5" />
              {s.label}
            </button>
          ))}
        </aside>

        {/* Form Content */}
        <div className="space-y-6">
          <div className="liquid-glass p-8 rounded-3xl border border-white/5 space-y-8">
            <section className="space-y-6">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <SettingsIcon className="w-5 h-5 text-primary" />
                Informações da Plataforma
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Nome da Marca</label>
                  <input type="text" defaultValue="ElberStreaming" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Email de Suporte</label>
                  <input type="email" defaultValue="suporte@elberstreaming.com" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Mensagem do WhatsApp (Template)</label>
                <textarea rows={3} defaultValue="Olá, realizei o pagamento do plano [PLANO] via [METODO]. Segue o comprovante em anexo." className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all" />
              </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <Key className="w-5 h-5 text-primary" />
                Segurança & API
              </h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-sm font-bold text-white">Autenticação de Dois Fatores (2FA)</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Recomendado para todos os administradores</p>
                  </div>
                  <div className="w-12 h-6 bg-primary/20 rounded-full relative flex items-center px-1">
                    <div className="w-4 h-4 bg-primary rounded-full shadow-[0_0_8px_rgba(81,243,227,0.8)] ml-auto" />
                  </div>
                </div>
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div>
                    <p className="text-sm font-bold text-white">Backup Automático do Banco</p>
                    <p className="text-[10px] text-on-surface-variant uppercase tracking-widest mt-1">Executado diariamente às 03:00</p>
                  </div>
                  <div className="w-12 h-6 bg-white/10 rounded-full relative flex items-center px-1">
                    <div className="w-4 h-4 bg-on-surface-variant rounded-full" />
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6 pt-8 border-t border-white/5">
              <h3 className="font-headline text-lg font-bold text-white flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-primary" />
                Taxas & Moeda
              </h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Símbolo da Moeda</label>
                  <input type="text" defaultValue="MT" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest ml-1">Taxa de Serviço (%)</label>
                  <input type="number" defaultValue="0" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-white focus:outline-none focus:border-primary/50 transition-all" />
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
