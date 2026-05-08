"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { 
  TrendingUp, 
  Users as UsersIcon, 
  DollarSign, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  ExternalLink,
  Search,
  Filter
} from "lucide-react";
import { cn } from "@/lib/utils";

const orders = [
  { id: "ORD-9281", customer: "António M.", service: "Netflix", plan: "1 Mês", price: "500 MT", status: "PENDING", time: "5 min ago" },
  { id: "ORD-9280", customer: "Sara L.", service: "Spotify", plan: "2 Meses", price: "300 MT", status: "PENDING", time: "12 min ago" },
  { id: "ORD-9279", customer: "Jonas B.", service: "Disney+", plan: "15 Dias", price: "200 MT", status: "APPROVED", time: "1h ago" },
  { id: "ORD-9278", customer: "Maria K.", service: "HBO Max", plan: "1 Mês", price: "450 MT", status: "REJECTED", time: "3h ago" },
];

export default function AdminDashboard() {
  const [selectedOrder, setSelectedOrder] = useState(orders[0]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard 
          label="Saldo Total" 
          value="124.500 MT" 
          change="+12.5%" 
          icon={DollarSign} 
          color="text-primary" 
        />
        <MetricCard 
          label="Usuários Ativos" 
          value="1.240" 
          change="+5.2%" 
          icon={UsersIcon} 
          color="text-secondary" 
        />
        <MetricCard 
          label="Pedidos Pendentes" 
          value="12" 
          change="-2" 
          icon={Clock} 
          color="text-yellow-500" 
        />
      </div>

      {/* Main Inbox Split-View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-[calc(100vh-280px)]">
        {/* Left Side: Orders List */}
        <div className="lg:col-span-4 liquid-glass rounded-3xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-6 border-b border-white/5 flex justify-between items-center">
            <h2 className="font-headline text-lg font-bold">Pedidos Recentes</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Search className="w-4 h-4" /></button>
              <button className="p-2 hover:bg-white/5 rounded-lg transition-colors"><Filter className="w-4 h-4" /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar">
            {orders.map((order) => (
              <button
                key={order.id}
                onClick={() => setSelectedOrder(order)}
                className={cn(
                  "w-full text-left p-4 rounded-2xl transition-all border group",
                  selectedOrder.id === order.id 
                    ? "bg-primary/10 border-primary/30" 
                    : "border-transparent hover:bg-white/5"
                )}
              >
                <div className="flex justify-between items-start mb-2">
                  <span className="font-headline text-xs font-bold text-on-surface-variant group-hover:text-primary transition-colors">{order.id}</span>
                  <span className="text-[10px] text-on-surface-variant/60">{order.time}</span>
                </div>
                <p className="font-headline text-sm font-bold text-white mb-1">{order.customer}</p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-on-surface-variant">{order.service} • {order.plan}</span>
                  <StatusBadge status={order.status} />
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Right Side: Order Details */}
        <div className="lg:col-span-8 liquid-glass rounded-3xl border border-white/5 flex flex-col overflow-hidden">
          <div className="p-8 flex-1 overflow-y-auto space-y-8">
            <div className="flex justify-between items-start">
              <div>
                <h1 className="font-headline text-3xl font-bold text-white mb-2">{selectedOrder.customer}</h1>
                <p className="text-on-surface-variant">Pedido realizado em 24 de Outubro, 2026 às 14:30</p>
              </div>
              <div className="flex gap-3">
                <button className="px-6 py-3 bg-red-500/10 text-red-500 font-headline font-bold text-xs rounded-xl hover:bg-red-500/20 transition-all border border-red-500/20">
                  Rejeitar
                </button>
                <button className="px-6 py-3 bg-primary text-on-primary font-headline font-bold text-xs rounded-xl hover:scale-105 transition-all">
                  Aprovar Pedido
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Proof Image */}
              <div className="space-y-4">
                <h3 className="font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase">Comprovante</h3>
                <div className="relative aspect-video rounded-2xl overflow-hidden border border-white/10 group cursor-zoom-in">
                  <img 
                    src="https://images.unsplash.com/photo-1554224155-169641357599?q=80&w=1770&auto=format&fit=crop" 
                    className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                    alt="Proof"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <ExternalLink className="w-8 h-8 text-white" />
                  </div>
                </div>
              </div>

              {/* Account Slots */}
              <div className="space-y-4">
                <h3 className="font-headline text-xs font-bold tracking-widest text-on-surface-variant uppercase">Slots da Conta (Netflix Premium)</h3>
                <div className="grid grid-cols-2 gap-4">
                  {[1, 2, 3, 4].map((slot) => (
                    <div key={slot} className="p-4 rounded-xl bg-white/5 border border-white/10 flex items-center gap-4">
                      <div className={cn(
                        "w-4 h-4 rounded-full",
                        slot === 1 ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.5)]" : "bg-primary shadow-[0_0_8px_rgba(81,243,227,0.5)]"
                      )} />
                      <div className="flex-1">
                        <p className="font-headline text-xs font-bold text-white">Slot {slot}</p>
                        <p className="text-[10px] text-on-surface-variant">{slot === 1 ? "Ocupado: João S." : "Disponível"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ label, value, change, icon: Icon, color }: any) {
  return (
    <div className="liquid-glass p-8 rounded-3xl border border-white/5 space-y-4">
      <div className="flex justify-between items-center">
        <div className={cn("p-3 rounded-2xl bg-white/5", color)}>
          <Icon className="w-6 h-6" />
        </div>
        <div className="flex items-center gap-1 text-xs font-bold text-green-500 bg-green-500/10 px-2 py-1 rounded-full">
          <TrendingUp className="w-3 h-3" />
          {change}
        </div>
      </div>
      <div>
        <p className="text-on-surface-variant font-body text-sm mb-1">{label}</p>
        <p className="font-headline text-3xl font-bold text-white">{value}</p>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles: any = {
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    APPROVED: "bg-primary/10 text-primary border-primary/20",
    REJECTED: "bg-red-500/10 text-red-500 border-red-500/20",
  };
  return (
    <span className={cn("px-2 py-1 rounded-full border text-[10px] font-bold tracking-wider", styles[status])}>
      {status}
    </span>
  );
}
