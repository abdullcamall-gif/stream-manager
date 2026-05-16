"use client";

import { useState, useEffect } from "react";
import { 
  Search, 
  Eye,
  ShoppingCart,
  RefreshCcw,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/app/admin/_lib/admin-api";

type AdminOrder = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  createdAt: string;
  customer: { name: string; phone: string };
  plan: { name: string; price: number | string; service: { name: string } };
  proofImageUrl?: string;
};

type ApproveOrderResponse = {
  whatsappDelivery?: {
    status: "PENDING" | "SENT" | "FAILED";
    error?: string | null;
  };
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchOrders = async () => {
    const result = await adminFetch<AdminOrder[]>("/api/admin/orders");
    if (result.ok) {
      setOrders(result.data);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      void fetchOrders();
    }, 0);

    return () => clearTimeout(timeoutId);
  }, []);

  const handleApprove = async (id: string) => {
    if (!confirm("Tem certeza que deseja APROVAR este pedido?")) return;
    setActionLoading(id);
    const res = await adminFetch<ApproveOrderResponse>(`/api/admin/orders/${id}/approve`, { method: "PATCH" });
    if (res.ok) {
      if (res.data.whatsappDelivery?.status === "FAILED") {
        alert(res.data.whatsappDelivery.error || "Pedido aprovado, mas falhou o envio do WhatsApp.");
      }
      void fetchOrders();
    } else {
      alert(res.message || "Erro ao aprovar pedido");
    }
    setActionLoading(null);
  };

  const handleReject = async (id: string) => {
    if (!confirm("Tem certeza que deseja REJEITAR este pedido?")) return;
    setActionLoading(id);
    const res = await adminFetch(`/api/admin/orders/${id}/reject`, { method: "PATCH" });
    if (res.ok) {
      void fetchOrders();
    } else {
      alert(res.message || "Erro ao rejeitar pedido");
    }
    setActionLoading(null);
  };

  const filteredOrders = orders.filter(o => filter === "ALL" || o.status === filter);
  const dateTimeFormatter = new Intl.DateTimeFormat("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <h1 className="font-headline text-4xl font-bold text-white tracking-tight">Gestão de Pedidos</h1>
          <p className="text-on-surface-variant mt-1">Controle total sobre transações e ativações.</p>
        </div>
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Buscar pedido..."
              className="bg-white/5 border border-white/10 rounded-2xl py-3 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-primary/50 w-full sm:w-64 transition-all"
            />
          </div>
          <div className="flex bg-white/5 p-1 rounded-2xl border border-white/10 overflow-x-auto">
            {["ALL", "PENDING", "APPROVED", "REJECTED"].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  "px-4 py-2 rounded-xl text-[10px] font-bold tracking-widest uppercase transition-all whitespace-nowrap",
                  filter === f ? "bg-primary text-on-primary shadow-lg shadow-primary/20" : "text-on-surface-variant hover:text-white"
                )}
              >
                {f}
              </button>
            ))}
          </div>
          <button 
            onClick={() => {
              setIsLoading(true);
              void fetchOrders();
            }}
            className="p-3 bg-white/5 border border-white/10 rounded-2xl text-on-surface-variant hover:text-white transition-all"
          >
            <RefreshCcw className={cn("w-4 h-4", isLoading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="liquid-glass rounded-3xl border border-white/5 overflow-hidden shadow-2xl shadow-black/50">
        {isLoading && orders.length === 0 ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-variant font-headline text-sm animate-pulse">Sincronizando banco de dados...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[900px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">ID & Data</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Cliente</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Serviço</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-center">Valor</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-center">Status</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {filteredOrders.map((order) => (
                    <tr key={order.id} className="hover:bg-white/[0.02] transition-colors group">
                      <td className="px-8 py-5">
                        <div className="font-headline font-bold text-white text-sm uppercase">{order.id.split('-')[0]}</div>
                        <div className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider">
                          {dateTimeFormatter.format(new Date(order.createdAt))}
                        </div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-body text-sm text-white">{order.customer.name}</div>
                        <div className="text-[10px] text-primary font-bold mt-0.5">{order.customer.phone}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">
                            {order.plan.service.name} • {order.plan.name}
                          </span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="font-headline font-bold text-white">
                          {order.plan.price ? Number(order.plan.price).toLocaleString() : '0'} 
                          <span className="text-primary/70 text-[10px] ml-1">MT</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border",
                          order.status === "APPROVED" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" : 
                          order.status === "PENDING" ? "bg-amber-500/10 text-amber-400 border-amber-500/20 animate-pulse" : 
                          "bg-rose-500/10 text-rose-400 border-rose-500/20"
                        )}>
                          {order.status}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end items-center gap-3">
                          {order.proofImageUrl && (
                             <a 
                              href={order.proofImageUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="p-2 hover:bg-white/5 rounded-xl text-on-surface-variant hover:text-white transition-all group/action"
                              title="Ver Comprovante"
                            >
                              <Eye className="w-4 h-4 group-hover/action:scale-110 transition-transform" />
                            </a>
                          )}
                          
                          {order.status === "PENDING" && (
                            <>
                              <button 
                                onClick={() => void handleApprove(order.id)}
                                disabled={actionLoading !== null}
                                className="px-4 py-2 bg-emerald-500 text-black font-headline text-[10px] font-bold uppercase rounded-xl hover:bg-emerald-400 transition-all shadow-lg shadow-emerald-500/20 disabled:opacity-50"
                              >
                                {actionLoading === order.id ? <Loader2 className="w-3 h-3 animate-spin" /> : "Aprovar"}
                              </button>
                              <button 
                                onClick={() => void handleReject(order.id)}
                                disabled={actionLoading !== null}
                                className="px-4 py-2 bg-white/5 border border-white/10 text-rose-400 font-headline text-[10px] font-bold uppercase rounded-xl hover:bg-rose-500 hover:text-white transition-all disabled:opacity-50"
                              >
                                Rejeitar
                              </button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-24 flex flex-col items-center justify-center text-center space-y-6 animate-in zoom-in duration-500">
            <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <ShoppingCart className="w-10 h-10 text-white/20" />
            </div>
            <div className="space-y-2">
              <h3 className="font-headline text-2xl font-bold text-white">Nenhum pedido encontrado</h3>
              <p className="text-on-surface-variant max-w-sm">
                Os pedidos realizados pelos clientes aparecerão aqui assim que forem processados.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
