"use client";

import { useEffect, useState, memo } from "react";
import { 
  MessageSquare, 
  Send, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  RefreshCcw,
  Search,
  Filter,
  MoreVertical,
  ChevronRight
} from "lucide-react";
import { cn } from "@/lib/utils";
import { adminFetch } from "@/app/admin/_lib/admin-api";

type WhatsappLog = {
  id: string;
  to: string;
  content: string;
  status: "PENDING" | "SENT" | "FAILED";
  deliveryStatus: string | null;
  retryCount: number;
  lastAttemptAt: string | null;
  error: string | null;
  createdAt: string;
};

export default function WhatsAppLogsPage() {
  const [logs, setLogs] = useState<WhatsappLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [retrying, setRetrying] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<"ALL" | "SENT" | "FAILED" | "PENDING">("ALL");

  const fetchData = async () => {
    setLoading(true);
    const res = await adminFetch<WhatsappLog[]>("/api/admin/whatsapp/logs");
    if (res.ok) {
      setLogs(res.data);
    } else {
      setError(res.message);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRetryAll = async () => {
    setRetrying(true);
    const res = await adminFetch("/api/admin/whatsapp/logs", { method: "POST" });
    if (res.ok) {
      fetchData();
    } else {
      alert("Erro ao reenviar mensagens: " + res.message);
    }
    setRetrying(false);
  };

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.to.includes(searchTerm) || log.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "ALL" || log.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading && logs.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-headline text-3xl font-bold text-white">Logs de WhatsApp</h1>
          <p className="text-on-surface-variant text-sm">Monitoramento de comunicações automatizadas.</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleRetryAll}
            disabled={retrying}
            className="px-6 py-3 bg-primary/10 text-primary font-headline font-bold text-xs rounded-xl hover:bg-primary/20 transition-all border border-primary/20 flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCcw className={cn("w-4 h-4", retrying && "animate-spin")} />
            Reprocessar Falhas
          </button>
          <button 
            onClick={fetchData}
            className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-white transition-all"
          >
            <RefreshCcw className={cn("w-5 h-5", loading && "animate-spin")} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatusCard 
          label="Mensagens Enviadas" 
          count={logs.filter(l => l.status === "SENT").length} 
          icon={CheckCircle2} 
          color="text-primary"
        />
        <StatusCard 
          label="Falhas de Entrega" 
          count={logs.filter(l => l.status === "FAILED").length} 
          icon={AlertCircle} 
          color="text-rose-500"
        />
        <StatusCard 
          label="Aguardando Envio" 
          count={logs.filter(l => l.status === "PENDING").length} 
          icon={Clock} 
          color="text-yellow-500"
        />
      </div>

      <div className="liquid-glass rounded-3xl border border-white/5 overflow-hidden flex flex-col h-[calc(100vh-420px)]">
        <div className="p-6 border-b border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-on-surface-variant" />
            <input 
              type="text" 
              placeholder="Buscar por número ou conteúdo..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded-xl py-2 pl-10 pr-4 text-white text-sm focus:border-primary/50 transition-all outline-none"
            />
          </div>
          <div className="flex gap-2 w-full md:w-auto">
            {["ALL", "SENT", "FAILED", "PENDING"].map((f) => (
              <button
                key={f}
                onClick={() => setStatusFilter(f as any)}
                className={cn(
                  "flex-1 md:flex-none px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all border",
                  statusFilter === f 
                    ? "bg-primary/10 border-primary/30 text-primary" 
                    : "bg-white/5 border-white/10 text-on-surface-variant hover:bg-white/10"
                )}
              >
                {f === "ALL" ? "Todos" : f}
              </button>
            ))}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 bg-[#0A0A0A] z-10">
              <tr>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Destinatário</th>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Mensagem</th>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant">Status</th>
                <th className="p-6 font-headline text-xs font-bold uppercase tracking-widest text-on-surface-variant text-right">Data/Tentativa</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredLogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="p-12 text-center text-on-surface-variant">
                    <MessageSquare className="w-12 h-12 mx-auto mb-4 opacity-10" />
                    <p>Nenhum registro encontrado</p>
                  </td>
                </tr>
              ) : filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-white/[0.02] transition-colors group">
                  <td className="p-6">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-primary">
                        <Send className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-white font-mono text-sm">{log.to}</span>
                    </div>
                  </td>
                  <td className="p-6 max-w-md">
                    <p className="text-xs text-on-surface-variant line-clamp-2 italic">"{log.content}"</p>
                  </td>
                  <td className="p-6">
                    <LogStatusBadge status={log.status} error={log.error} />
                  </td>
                  <td className="p-6 text-right">
                    <div className="space-y-1">
                      <p className="text-xs text-white">
                        {new Date(log.createdAt).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="text-[10px] text-on-surface-variant">
                        Tentativas: {log.retryCount}
                      </p>
                    </div>
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

const StatusCard = memo(function StatusCard({ label, count, icon: Icon, color }: any) {
  return (
    <div className="liquid-glass p-6 rounded-3xl border border-white/5 flex items-center gap-4">
      <div className={cn("p-3 rounded-2xl bg-white/5", color)}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <p className="text-on-surface-variant text-xs mb-1 uppercase font-bold tracking-widest">{label}</p>
        <p className="text-2xl font-bold text-white">{count}</p>
      </div>
    </div>
  );
});

const LogStatusBadge = memo(function LogStatusBadge({ status, error }: { status: string, error: string | null }) {
  const styles: any = {
    SENT: "bg-primary/10 text-primary border-primary/20",
    FAILED: "bg-rose-500/10 text-rose-500 border-rose-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
  };

  return (
    <div className="flex flex-col gap-1">
      <span className={cn("inline-flex px-2 py-0.5 rounded-full border text-[9px] font-bold tracking-widest uppercase w-fit", styles[status])}>
        {status}
      </span>
      {status === "FAILED" && error && (
        <span className="text-[8px] text-rose-500/70 max-w-[150px] truncate" title={error}>
          {error}
        </span>
      )}
    </div>
  );
});
