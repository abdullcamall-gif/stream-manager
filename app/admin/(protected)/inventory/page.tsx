"use client";

import { useEffect, useState, memo } from "react";
import { 
  Box, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  RefreshCcw,
  Search,
  Package,
  Layers,
  Clock,
  ExternalLink,
  BellRing
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/app/admin/_lib/admin-api";
import Image from "next/image";

type InventoryStats = {
  summary: {
    totalProfiles: number;
    availableProfiles: number;
    occupiedProfiles: number;
    expiredProfiles: number;
    totalServices: number;
    lowStockServices: number;
  };
  serviceBreakdown: {
    id: string;
    name: string;
    slug: string;
    accountCount: number;
    totalProfiles: number;
    available: number;
    occupied: number;
    expired: number;
  }[];
};

export default function InventoryDashboard() {
  const [stats, setStats] = useState<InventoryStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const res = await adminFetch<InventoryStats>("/api/admin/inventory");

    if (res.ok) {
      setStats(res.data);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  const handleSendReminders = async () => {
    if (!confirm("Deseja disparar lembretes de expiração para todos os perfis vencendo em 48h?")) return;
    
    const res = await adminFetch("/api/v1/customers/reminders", { method: "POST" });
    if (res.ok) {
      alert("Lembretes disparados com sucesso!");
    } else {
      alert("Erro ao disparar lembretes: " + res.message);
    }
  };

  useEffect(() => {
    void fetchData();
  }, []);

  if (loading && !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-headline text-sm animate-pulse">Carregando estoque...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="liquid-glass p-8 rounded-3xl border border-rose-500/20 text-center space-y-4 max-w-md">
          <AlertTriangle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Erro ao carregar estoque</h2>
          <p className="text-on-surface-variant">{error}</p>
          <button 
            onClick={fetchData}
            className="px-6 py-2 bg-white/5 border border-white/10 rounded-xl text-white hover:bg-white/10 transition-all flex items-center gap-2 mx-auto"
          >
            <RefreshCcw className="w-4 h-4" /> Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white">Gestão de Estoque</h1>
          <p className="text-on-surface-variant text-sm">Monitoramento em tempo real de perfis e contas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSendReminders}
            className="px-4 py-2 bg-secondary/10 text-secondary border border-secondary/20 rounded-2xl font-headline font-bold text-xs hover:bg-secondary/20 transition-all flex items-center gap-2"
          >
            <BellRing className="w-4 h-4" />
            Lembretes
          </button>
          <button 
            onClick={fetchData}
            disabled={loading}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white transition-all disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <InventoryCard 
          label="Total de Perfis" 
          value={stats?.summary.totalProfiles.toString() || "0"} 
          icon={Package} 
          color="text-blue-400"
          bg="bg-blue-400/10"
        />
        <InventoryCard 
          label="Disponíveis" 
          value={stats?.summary.availableProfiles.toString() || "0"} 
          icon={CheckCircle} 
          color="text-primary"
          bg="bg-primary/10"
        />
        <InventoryCard 
          label="Ocupados" 
          value={stats?.summary.occupiedProfiles.toString() || "0"} 
          icon={Layers} 
          color="text-yellow-400"
          bg="bg-yellow-400/10"
        />
        <InventoryCard 
          label="Estoque Baixo" 
          value={stats?.summary.lowStockServices.toString() || "0"} 
          icon={AlertTriangle} 
          color="text-rose-400"
          bg="bg-rose-400/10"
        />
      </div>

      {/* Services Breakdown */}
      <div className="liquid-glass rounded-3xl border border-white/5 overflow-hidden">
        <div className="p-6 border-b border-white/5">
          <h2 className="font-headline text-lg font-bold text-white">Disponibilidade por Serviço</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-white/[0.02]">
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Serviço</th>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Contas</th>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Total Perfis</th>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Disponível</th>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Ocupado</th>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {stats?.serviceBreakdown.map((service) => (
                <tr key={service.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:border-primary/30 transition-all">
                        <Box className="w-5 h-5 text-on-surface-variant group-hover:text-primary" />
                      </div>
                      <div>
                        <p className="font-headline font-bold text-white">{service.name}</p>
                        <p className="text-[10px] text-on-surface-variant uppercase tracking-tighter">ID: {service.slug}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-6 text-center text-white font-mono">{service.accountCount}</td>
                  <td className="p-6 text-center text-white font-mono">{service.totalProfiles}</td>
                  <td className="p-6 text-center">
                    <span className={cn(
                      "px-3 py-1 rounded-full text-xs font-bold",
                      service.available > 3 ? "text-primary bg-primary/10" : 
                      service.available > 0 ? "text-yellow-400 bg-yellow-400/10" : 
                      "text-rose-400 bg-rose-400/10"
                    )}>
                      {service.available}
                    </span>
                  </td>
                  <td className="p-6 text-center text-on-surface-variant font-mono">{service.occupied}</td>
                  <td className="p-6 text-center">
                    <StockBadge available={service.available} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

const InventoryCard = memo(function InventoryCard({
  label,
  value,
  icon: Icon,
  color,
  bg
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bg: string;
}) {
  return (
    <div className="liquid-glass p-6 rounded-3xl border border-white/5 space-y-4 hover:border-white/10 transition-all">
      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center", bg, color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-on-surface-variant text-sm mb-1">{label}</p>
        <p className="font-headline text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
});

const StockBadge = memo(function StockBadge({ available }: { available: number }) {
  if (available === 0) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold uppercase tracking-widest">
        <XCircle className="w-3 h-3" /> Esgotado
      </span>
    );
  }
  if (available <= 3) {
    return (
      <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 text-[10px] font-bold uppercase tracking-widest">
        <AlertTriangle className="w-3 h-3" /> Baixo Estoque
      </span>
    );
  }
  return (
    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary border border-primary/20 text-[10px] font-bold uppercase tracking-widest">
      <CheckCircle className="w-3 h-3" /> Saudável
    </span>
  );
});
