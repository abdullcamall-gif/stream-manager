"use client";

import { motion } from "framer-motion";
import { 
  Plus, 
  Search, 
  Edit3, 
  Key,
  Mail,
  UserCheck,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";

const accounts = [
  { id: 1, email: "premium1@netflix.com", service: "Netflix", slotsUsed: 3, slotsTotal: 4, status: "Healthy" },
  { id: 2, email: "family@spotify.com", service: "Spotify", slotsUsed: 6, slotsTotal: 6, status: "Full" },
  { id: 3, email: "admin@disney.com", service: "Disney+", slotsUsed: 1, slotsTotal: 4, status: "Healthy" },
  { id: 4, email: "access@hbomax.com", service: "HBO Max", slotsUsed: 4, slotsTotal: 4, status: "Full" },
];

export default function AdminAccountsPage() {
  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white">Gestão de Contas</h1>
          <p className="text-on-surface-variant">Gerencie credenciais e ocupação de slots.</p>
        </div>
        <button className="flex items-center gap-2 bg-primary text-on-primary px-6 py-3 rounded-xl font-headline font-bold text-sm hover:scale-105 transition-all shadow-lg shadow-primary/20">
          <Plus className="w-5 h-5" />
          Vincular Conta
        </button>
      </div>

      <div className="liquid-glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5 flex gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Buscar contas por e-mail..." 
              className="w-full bg-white/5 border border-white/10 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50"
            />
          </div>
        </div>

        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/5 bg-white/[0.02]">
              <th className="px-6 py-5 font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase">E-mail da Conta</th>
              <th className="px-6 py-5 font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase">Serviço</th>
              <th className="px-6 py-5 font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase">Slots (Ocupados/Total)</th>
              <th className="px-6 py-5 font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase">Status</th>
              <th className="px-6 py-5 font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase text-right">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {accounts.map((acc) => (
              <tr key={acc.id} className="hover:bg-white/[0.02] transition-colors group">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-on-surface-variant" />
                    <span className="font-body text-sm text-white">{acc.email}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-headline text-xs font-bold text-primary">{acc.service}</span>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden max-w-[100px]">
                      <div 
                        className={cn("h-full rounded-full", acc.status === "Full" ? "bg-yellow-500" : "bg-primary")} 
                        style={{ width: `${(acc.slotsUsed / acc.slotsTotal) * 100}%` }}
                      />
                    </div>
                    <span className="text-xs font-bold text-white">{acc.slotsUsed}/{acc.slotsTotal}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-2">
                    {acc.status === "Healthy" ? (
                      <UserCheck className="w-4 h-4 text-primary" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-yellow-500" />
                    )}
                    <span className={cn(
                      "text-[10px] font-bold tracking-widest uppercase",
                      acc.status === "Healthy" ? "text-primary" : "text-yellow-500"
                    )}>
                      {acc.status}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 text-right">
                  <div className="flex justify-end gap-2">
                    <button className="p-2 hover:bg-white/5 rounded-lg text-on-surface-variant hover:text-primary transition-all">
                      <Key className="w-4 h-4" />
                    </button>
                    <button className="p-2 hover:bg-white/5 rounded-lg text-on-surface-variant hover:text-white transition-all">
                      <Edit3 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
