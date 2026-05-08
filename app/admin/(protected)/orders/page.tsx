"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Search, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Eye,
  ShoppingCart
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState("ALL");

  useEffect(() => {
    async function fetchOrders() {
      try {
        const res = await fetch("/api/v1/orders");
        if (res.ok) {
          const data = await res.json();
          setOrders(data);
        }
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchOrders();
  }, []);

  const filteredOrders = orders.filter(o => filter === "ALL" || o.status === filter);

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
        </div>
      </div>

      <div className="liquid-glass rounded-3xl border border-white/5 overflow-hidden">
        {isLoading ? (
          <div className="p-20 flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
            <p className="text-on-surface-variant font-headline text-sm animate-pulse">Sincronizando banco de dados...</p>
          </div>
        ) : filteredOrders.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left min-w-[800px]">
              <thead>
                <tr className="border-b border-white/5 bg-white/[0.02]">
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">ID & Data</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Cliente</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Serviço</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-center">Valor</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase">Status</th>
                  <th className="px-8 py-6 font-headline text-[10px] font-bold tracking-widest text-on-surface-variant uppercase text-right">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                <AnimatePresence mode="popLayout">
                  {filteredOrders.map((order) => (
                    <motion.tr 
                      layout
                      key={order.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="hover:bg-white/[0.02] transition-colors group"
                    >
                      <td className="px-8 py-5">
                        <div className="font-headline font-bold text-white text-sm">{order.id}</div>
                        <div className="text-[10px] text-on-surface-variant mt-1 uppercase tracking-wider">{order.createdAt}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-body text-sm text-white">{order.customerName}</div>
                      </td>
                      <td className="px-8 py-5">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-xs font-bold text-on-surface-variant uppercase tracking-widest">{order.serviceName}</span>
                        </div>
                      </td>
                      <td className="px-8 py-5 text-center">
                        <div className="font-headline font-bold text-white">{order.amount} <span className="text-primary/70 text-[10px]">MT</span></div>
                      </td>
                      <td className="px-8 py-5">
                        <div className={cn(
                          "inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border",
                          order.status === "APPROVED" ? "bg-primary/10 text-primary border-primary/20" : 
                          order.status === "PENDING" ? "bg-yellow-500/10 text-yellow-500 border-yellow-500/20" : 
                          "bg-red-500/10 text-red-500 border-red-500/20"
                        )}>
                          {order.status}
                        </div>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <div className="flex justify-end gap-2">
                          <button className="p-2 hover:bg-white/5 rounded-xl text-on-surface-variant hover:text-white transition-all">
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
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
