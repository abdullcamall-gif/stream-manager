"use client";

import { useEffect, useState, memo } from "react";
import { 
  TrendingUp, 
  Users as UsersIcon, 
  DollarSign, 
  Clock, 
  ExternalLink,
  Search,
  RefreshCcw,
  AlertCircle
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/app/admin/_lib/admin-api";
import Image from "next/image";

type DashboardStats = {
  totalRevenue: number;
  activeUsers: number;
  pendingOrders: number;
};

type AdminOrder = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  paymentMethod: string;
  proofImageUrl: string;
  createdAt: string;
  customer: { name: string; phone: string };
  plan: { name: string; service: { name: string } };
  assignment: null | {
    slotNumber: number;
    expiresAt: string;
    account: { email: string };
  };
};

export default function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const timeFormatter = new Intl.DateTimeFormat("pt-BR", { hour: "2-digit", minute: "2-digit" });
  const dateTimeLongFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
  const dateFormatter = new Intl.DateTimeFormat("pt-BR");

  const fetchData = async () => {
    setLoading(true);
    setError("");
    const [statsRes, ordersRes] = await Promise.all([
      adminFetch<DashboardStats>("/api/admin/stats"),
      adminFetch<AdminOrder[]>("/api/admin/orders")
    ]);

    if (!statsRes.ok) {
      setError(statsRes.message);
      setLoading(false);
      return;
    }

    if (!ordersRes.ok) {
      setError(ordersRes.message);
      setLoading(false);
      return;
    }

    setStats(statsRes.data);
    setOrders(ordersRes.data);
    if (ordersRes.data.length > 0) {
      setSelectedOrder(ordersRes.data[0]);
    }
    setLoading(false);
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void fetchData();
  }, []);

  const handleAction = async (orderId: string, action: "approve" | "reject") => {
    setProcessingId(orderId);
    const endpoint = action === "approve" 
      ? `/api/admin/orders/${orderId}/approve` 
      : `/api/admin/orders/${orderId}/reject`;
    
    const result = await adminFetch<{ ok: boolean }>(endpoint, { method: "PATCH" });
    
    if (result.ok) {
      await fetchData(); // Refresh data
    } else {
      alert(result.message);
    }
    setProcessingId(null);
  };

  if (loading && !stats) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
          <p className="text-on-surface-variant font-headline text-sm animate-pulse">Carregando painel de controle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="liquid-glass p-8 rounded-3xl border border-rose-500/20 text-center space-y-4 max-w-md">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto" />
          <h2 className="text-xl font-bold text-white">Erro ao carregar dados</h2>
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
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Saldo Total" 
          value={`${stats?.totalRevenue.toLocaleString()} MT`} 
          change="+0%" 
          icon={DollarSign} 
          color="text-primary" 
        />
        <MetricCard 
          label="Usuários Ativos" 
          value={stats?.activeUsers.toString() || "0"} 
          change="+0%" 
          icon={UsersIcon} 
          color="text-secondary" 
        />
        <MetricCard 
          label="Pedidos Pendentes" 
          value={stats?.pendingOrders.toString() || "0"} 
          change="Real-time" 
          icon={Clock} 
          color="text-yellow-500" 
        />
      </div>

      {/* Main Inbox Split-View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* Left Side: Orders List */}
        <div className="lg:col-span-4 liquid-glass rounded-3xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-headline text-lg font-bold text-white">Pedidos Recentes</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors text-on-surface-variant"><Search className="w-4 h-4" /></button>
              <button 
                onClick={fetchData}
                disabled={loading}
                className="p-2 hover:bg-white/5 rounded-lg transition-colors text-on-surface-variant disabled:opacity-50"
              >
                <RefreshCcw className={cn("w-4 h-4", loading && "animate-spin")} />
              </button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {orders.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-on-surface-variant space-y-2">
                <Clock className="w-8 h-8 opacity-20" />
                <p className="text-xs">Nenhum pedido recente</p>
              </div>
            ) : orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all border group",
                  selectedOrder?.id === order.id 
                    ? "bg-primary/10 border-primary/30" 
                    : "border-transparent hover:bg-white/5"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-headline text-[10px] font-bold text-on-surface-variant group-hover:text-primary transition-colors uppercase tracking-wider">
                    {order.id.split('-')[0]}
                  </span>
                  <span className="text-[10px] text-on-surface-variant/60">
                    {mounted ? timeFormatter.format(new Date(order.createdAt)) : "--:--"}
                  </span>
                </div>
                <p className="font-headline text-sm font-bold text-white mb-1 truncate">{order.customer.name}</p>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] text-on-surface-variant uppercase tracking-tight">
                    {order.plan.service.name} • {order.plan.name}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Order Details */}
        <div className="lg:col-span-8 liquid-glass rounded-3xl border border-white/5 flex flex-col overflow-hidden">
          {selectedOrder ? (
            <div className="p-8 flex-1 overflow-y-auto space-y-8">
              <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                <div>
                  <h1 className="font-headline text-3xl font-bold text-white mb-2">{selectedOrder.customer.name}</h1>
                  <p className="text-on-surface-variant text-sm">
                    Pedido realizado em {mounted ? dateTimeLongFormatter.format(new Date(selectedOrder.createdAt)) : "..."}
                  </p>
                  <p className="text-primary font-bold text-sm mt-1">{selectedOrder.customer.phone}</p>
                </div>
                
                {selectedOrder.status === "PENDING" && (
                  <div className="flex gap-3">
                    <button 
                      disabled={processingId === selectedOrder.id}
                      onClick={() => handleAction(selectedOrder.id, "reject")}
                      className="px-6 py-3 bg-red-500/10 text-red-500 font-headline font-bold text-xs rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20 disabled:opacity-50"
                    >
                      {processingId === selectedOrder.id ? "Processando..." : "Rejeitar"}
                    </button>
                    <button 
                      disabled={processingId === selectedOrder.id}
                      onClick={() => handleAction(selectedOrder.id, "approve")}
                      className="px-6 py-3 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl hover:scale-105 transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                      {processingId === selectedOrder.id ? "Ativando..." : "Aprovar Pedido"}
                    </button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Proof Image */}
                <div className="space-y-4">
                  <h3 className="font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase">Comprovante de Pagamento</h3>
                  <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group cursor-zoom-in bg-white/5">
                    <Image
                      src={selectedOrder.proofImageUrl}
                      className="w-full h-full object-contain grayscale group-hover:grayscale-0 transition-all duration-500"
                      alt="Comprovante"
                      fill
                      unoptimized
                    />
                    <a 
                      href={selectedOrder.proofImageUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                    >
                      <ExternalLink className="w-8 h-8 text-white" />
                    </a>
                  </div>
                  <div className="flex justify-between items-center text-[10px] text-on-surface-variant uppercase tracking-widest px-1">
                    <span>Método: {selectedOrder.paymentMethod}</span>
                    <span>Status: {selectedOrder.status}</span>
                  </div>
                </div>

                {/* Account Details / Assignment */}
                <div className="space-y-4">
                  <h3 className="font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase">Detalhes da Ativação</h3>
                  {selectedOrder.status === "APPROVED" && selectedOrder.assignment ? (
                    <div className="p-6 rounded-2xl bg-primary/5 border border-primary/20 space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <UsersIcon className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-widest">Conta Designada</p>
                          <p className="text-white font-bold">{selectedOrder.assignment.account.email}</p>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4 pt-2">
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[9px] text-on-surface-variant uppercase font-bold">Slot</p>
                          <p className="text-white font-bold">#{selectedOrder.assignment.slotNumber}</p>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
                          <p className="text-[9px] text-on-surface-variant uppercase font-bold">Expira em</p>
                          <p className="text-white font-bold">{mounted ? dateFormatter.format(new Date(selectedOrder.assignment.expiresAt)) : "..."}</p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-48 border border-white/5 rounded-2xl bg-white/[0.02] text-center p-6">
                      <Clock className="w-8 h-8 text-on-surface-variant/30 mb-4" />
                      <p className="text-sm text-on-surface-variant">
                        {selectedOrder.status === "PENDING" 
                          ? "Aguardando aprovação para designar conta e slot." 
                          : "Este pedido não foi aprovado."}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-on-surface-variant space-y-4 p-8 text-center">
              <div className="w-16 h-16 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
                <Clock className="w-8 h-8 opacity-20" />
              </div>
              <h3 className="font-headline font-bold text-white">Nenhum pedido selecionado</h3>
              <p className="text-sm max-w-xs">Selecione um pedido na lista ao lado para ver os detalhes e realizar ações.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

const MetricCard = memo(function MetricCard({
  label,
  value,
  change,
  icon: Icon,
  color,
}: {
  label: string;
  value: string;
  change: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}) {
  return (
    <div className="liquid-glass p-8 rounded-3xl border border-white/5 space-y-4 group hover:border-primary/20 transition-all">
      <div className="flex justify-between items-center">
        <div className={cn("p-3 rounded-2xl bg-white/5 group-hover:scale-110 transition-transform", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-[10px] font-bold text-primary bg-primary/10 px-2 py-1 rounded-full uppercase tracking-wider">
          <TrendingUp className="w-3 h-3" />
          {change}
        </div>
      </div>
      <div>
        <p className="text-on-surface-variant font-body text-sm mb-1">{label}</p>
        <p className="font-headline text-3xl font-bold text-white tracking-tight">{value}</p>
      </div>
    </div>
  );
});

const StatusBadge = memo(function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, string> = {
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    APPROVED: "bg-primary/10 text-primary border-primary/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-widest uppercase", styles[status])}>
      {status}
    </span>
  );
});
