"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { BarChart3, DollarSign, RefreshCcw, Activity, ShoppingCart } from "lucide-react";
import { adminFetch } from "@/app/admin/_lib/admin-api";
import { cn } from "@/lib/utils";

type RevenueMetrics = {
  totalRevenue: number;
  approvedOrders: number;
  avgTicket: number;
};

type RenewalMetrics = {
  totalAssignments: number;
  renewed: number;
  pending: number;
  expired: number;
  renewalRate: number;
  churnRate: number;
};

type OperationalMetrics = {
  totalProfiles: number;
  activeProfiles: number;
  occupiedProfiles: number;
  pendingOrders: number;
  occupancyRate: number;
};

type TopService = {
  serviceId: string;
  serviceName: string;
  orders: number;
  revenue: number;
};

type MonthlyMetric = {
  month: string;
  revenue: number;
  orders: number;
};

export default function AdminDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [revenue, setRevenue] = useState<RevenueMetrics | null>(null);
  const [operational, setOperational] = useState<OperationalMetrics | null>(null);
  const [topServices, setTopServices] = useState<TopService[]>([]);
  const [monthly, setMonthly] = useState<MonthlyMetric[]>([]);

  const maxMonthlyRevenue = useMemo(() => {
    if (monthly.length === 0) return 1;
    return Math.max(...monthly.map((item) => item.revenue), 1);
  }, [monthly]);

  const maxTopRevenue = useMemo(() => {
    if (topServices.length === 0) return 1;
    return Math.max(...topServices.map((item) => item.revenue), 1);
  }, [topServices]);

  const fetchAnalytics = useCallback(async () => {
    // We remove synchronous setState calls here to avoid "cascading renders" warnings in useEffect.
    // The loading state is already true by default, and for refreshes, we set it in the event handlers.

    const [revenueRes, operationalRes, topServicesRes, monthlyRes] = await Promise.all([
      adminFetch<RevenueMetrics>("/api/admin/analytics/revenue"),
      adminFetch<OperationalMetrics>("/api/admin/analytics/operational"),
      adminFetch<TopService[]>("/api/admin/analytics/top-services"),
      adminFetch<MonthlyMetric[]>("/api/admin/analytics/monthly?months=6&tz=Africa/Maputo"),
    ]);

    const failed = [revenueRes, operationalRes, topServicesRes, monthlyRes].find((item) => !item.ok);
    if (failed && !failed.ok) {
      setError(failed.message);
      setLoading(false);
      return;
    }

    setRevenue((revenueRes as { ok: true; data: RevenueMetrics }).data);
    setOperational((operationalRes as { ok: true; data: OperationalMetrics }).data);
    setTopServices((topServicesRes as { ok: true; data: TopService[] }).data);
    setMonthly((monthlyRes as { ok: true; data: MonthlyMetric[] }).data);
    setError("");
    setLoading(false);
  }, []);

  useEffect(() => {
    // We defer the execution to the next tick to avoid "cascading renders" 
    // warnings during the initial mount phase. This ensures that the 
    // state updates happen after the render cycle is fully committed.
    const timer = setTimeout(() => {
      void fetchAnalytics();
    }, 0);
    return () => clearTimeout(timer);
  }, [fetchAnalytics]);

  if (loading && !revenue) {
    return <div className="p-10 text-slate-300">Carregando analytics...</div>;
  }

  if (error) {
    return (
      <div className="p-10 space-y-4">
        <p className="text-rose-400">Erro ao carregar analytics: {error}</p>
        <button onClick={() => {
          setLoading(true);
          setError("");
          void fetchAnalytics();
        }} className="rounded bg-slate-700 text-white px-3 py-2">Tentar novamente</button>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-in fade-in duration-1000">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className="font-headline text-4xl font-bold text-white tracking-tight">Admin Dashboard</h1>
          <p className="text-on-surface-variant mt-1 flex items-center gap-2 text-sm">
            <Activity className="w-3 h-3 text-primary" />
            Operação estável em Africa/Maputo
          </p>
        </div>
        <button 
          onClick={() => {
            setLoading(true);
            setError("");
            void fetchAnalytics();
          }} 
          className="group flex items-center gap-3 px-6 py-3 bg-white/5 border border-white/10 rounded-2xl text-on-surface hover:text-white hover:bg-white/10 transition-all active:scale-95"
        >
          <RefreshCcw className={cn("w-4 h-4 transition-transform duration-500", loading && "animate-spin")} />
          <span className="font-headline text-xs font-bold uppercase tracking-widest">Sincronizar Dados</span>
        </button>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Receita Total" 
          value={revenue?.totalRevenue ?? 0} 
          unit="MT" 
          icon={<DollarSign className="w-5 h-5" />}
          color="primary"
        />
        <StatCard 
          title="Ticket Médio" 
          value={revenue?.avgTicket ?? 0} 
          unit="MT" 
          icon={<BarChart3 className="w-5 h-5" />}
          color="cyan"
        />
        <StatCard 
          title="Pedidos Aprovados" 
          value={revenue?.approvedOrders ?? 0} 
          unit="" 
          icon={<Activity className="w-5 h-5" />}
          color="emerald"
        />
        <StatCard 
          title="Pedidos Pendentes" 
          value={operational?.pendingOrders ?? 0} 
          unit="" 
          icon={<ShoppingCart className="w-5 h-5" />}
          color="amber"
          isPending={Number(operational?.pendingOrders ?? 0) > 0}
        />
      </div>

      {/* Analytics Charts/Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Performance */}
        <div className="lg:col-span-2 liquid-glass rounded-3xl border border-white/5 p-8 space-y-8">
          <div className="flex items-center justify-between">
            <h2 className="font-headline text-xl font-bold text-white">Desempenho Mensal</h2>
            <div className="px-3 py-1 bg-primary/10 rounded-full text-[10px] font-bold text-primary uppercase tracking-widest border border-primary/20">
              Últimos 6 Meses
            </div>
          </div>
          
          <div className="space-y-6">
            {monthly.map((item) => (
              <div key={item.month} className="space-y-2 group">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-on-surface-variant uppercase tracking-wider group-hover:text-white transition-colors">{item.month}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] text-on-surface-variant">{item.orders} pedidos</span>
                    <span className="text-sm font-bold text-white">MZN {item.revenue.toLocaleString()}</span>
                  </div>
                </div>
                <div className="h-2.5 bg-white/5 rounded-full overflow-hidden border border-white/5">
                  <div 
                    className="h-full bg-gradient-to-r from-primary to-cyan-400 shadow-[0_0_12px_rgba(81,243,227,0.4)] transition-all duration-1000" 
                    style={{ width: `${(item.revenue / maxMonthlyRevenue) * 100}%` }} 
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top Services */}
        <div className="liquid-glass rounded-3xl border border-white/5 p-8 space-y-8">
          <h2 className="font-headline text-xl font-bold text-white">Best Sellers</h2>
          <div className="space-y-8">
            {topServices.map((service, idx) => (
              <div key={service.serviceId} className="flex items-center gap-4 group">
                <div className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center font-headline font-bold text-on-surface-variant group-hover:text-primary group-hover:border-primary/50 transition-all">
                  {idx + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white truncate">{service.serviceName}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase tracking-widest">{service.orders} vendas</p>
                </div>
                <div className="text-right">
                  <p className="text-xs font-bold text-primary">MZN {service.revenue.toLocaleString()}</p>
                  <div className="mt-1 h-1 w-12 bg-white/5 rounded-full overflow-hidden ml-auto">
                    <div className="h-full bg-primary" style={{ width: `${(service.revenue / maxTopRevenue) * 100}%` }} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Operational Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <OperationalTile 
          label="Perfis Totais" 
          value={operational?.totalProfiles ?? 0} 
          subValue={`${operational?.occupiedProfiles ?? 0} em uso`}
        />
        <OperationalTile 
          label="Taxa de Ocupação" 
          value={`${((operational?.occupancyRate ?? 0) * 100).toFixed(1)}%`}
          progress={operational?.occupancyRate ?? 0}
        />
        <OperationalTile 
          label="Status do Sistema" 
          value="ATIVO" 
          status="ONLINE"
        />
      </div>
    </div>
  );
}

function StatCard({ title, value, unit, icon, color, isPending }: { title: string; value: number | string; unit: string; icon: React.ReactNode; color: string; isPending?: boolean }) {
  return (
    <div className={cn(
      "liquid-glass p-6 rounded-3xl border border-white/5 relative overflow-hidden group hover:border-white/20 transition-all duration-500",
      isPending && "border-amber-500/30 shadow-[0_0_20px_rgba(245,158,11,0.05)]"
    )}>
      <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/5 rounded-full blur-3xl group-hover:bg-primary/10 transition-all" />
      
      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.2em]">{title}</span>
        <div className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant group-hover:text-white transition-colors border border-white/5">
          {icon}
        </div>
      </div>
      
      <div className="relative z-10">
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-headline font-bold text-white tracking-tighter">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </span>
          {unit && <span className="text-xs text-on-surface-variant font-bold">{unit}</span>}
        </div>
        {isPending && (
          <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-amber-500/10 rounded-full border border-amber-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-pulse" />
            <span className="text-[8px] font-bold text-amber-500 uppercase tracking-widest">Ação Necessária</span>
          </div>
        )}
      </div>
    </div>
  );
}

function OperationalTile({ label, value, subValue, progress, status }: { label: string; value: string | number; subValue?: string; progress?: number; status?: string }) {
  return (
    <div className="liquid-glass p-6 rounded-2xl border border-white/5 group hover:bg-white/[0.02] transition-all">
      <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest mb-1">{label}</p>
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-2xl font-headline font-bold text-white">{value}</p>
          {subValue && <p className="text-[10px] text-primary font-bold uppercase mt-1 tracking-wider">{subValue}</p>}
          {status && (
             <div className="mt-2 inline-flex items-center gap-1.5 px-2 py-0.5 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
              <span className="text-[8px] font-bold text-emerald-500 uppercase tracking-widest">{status}</span>
            </div>
          )}
        </div>
        {progress !== undefined && (
          <div className="w-10 h-10 rounded-full border-2 border-white/5 flex items-center justify-center text-[10px] font-bold text-white relative">
             <svg className="absolute inset-0 w-full h-full -rotate-90">
                <circle 
                  cx="20" cy="20" r="18" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  className="text-white/5"
                />
                <circle 
                  cx="20" cy="20" r="18" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                  strokeDasharray="113.1"
                  strokeDashoffset={113.1 - (113.1 * progress)}
                  className="text-primary"
                />
             </svg>
             {Math.round(progress * 100)}%
          </div>
        )}
      </div>
    </div>
  );
}
