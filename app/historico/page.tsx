"use client";

import { useState } from "react";
import { 
  Search, 
  Smartphone, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Calendar,
  History,
  AlertCircle,
  ChevronRight,
  TrendingUp,
  MessageCircle,
  BellRing,
  RefreshCcw
} from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

type TimelineEvent = {
  date: string;
  title: string;
  description: string;
  status: "COMPLETED" | "PENDING" | "FAILED";
};

type Notification = {
  id: string;
  content: string;
  createdAt: string;
  isRead: boolean;
};

type CustomerOrder = {
  id: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  service: string;
  plan: string;
  expiresAt: string | null;
  expiresSoon?: boolean;
  renewalStatus?: string | null;
  canRenew?: boolean;
  credentials: {
    email: string;
    password: string;
  } | null;
  timeline: TimelineEvent[];
};

function sanitizePhone(value: string): string {
  return value.replace(/[\s\-().]/g, "");
}

export default function HistoryPage() {
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<CustomerOrder[] | null>(null);
  const [errorMessage, setErrorMessage] = useState("");
  const [visiblePasswordOrderId, setVisiblePasswordOrderId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"ORDERS" | "NOTIFICATIONS">("ORDERS");
  const [notifications, setNotifications] = useState<Notification[]>([]);

  async function searchByPhone(rawPhone: string) {
    const sanitizedPhone = sanitizePhone(rawPhone);
    if (!sanitizedPhone) return;

    setIsSearching(true);
    setErrorMessage("");
    setResults(null);

    try {
      const response = await fetch(
        `/api/v1/orders/by-phone?phone=${encodeURIComponent(sanitizedPhone)}`,
      );
      const payload = await response.json();

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Falha ao buscar pedidos");
        setResults([]);
        return;
      }

      setResults(payload);

      // Also fetch notifications
      const notifRes = await fetch(`/api/v1/customers/notifications?phone=${encodeURIComponent(sanitizedPhone)}`);
      if (notifRes.ok) {
        const notifData = await notifRes.json();
        setNotifications(notifData);
      }
    } catch {
      setErrorMessage("Erro de conexão ao consultar pedidos");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    await searchByPhone(phone);
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white selection:bg-primary/30">
      {/* Background Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-secondary/5 blur-[120px]" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-5xl px-6 py-20">
        <header className="mb-16 space-y-6 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-primary text-xs font-bold uppercase tracking-widest animate-in fade-in slide-in-from-bottom-4 duration-700">
            <History className="w-4 h-4" />
            Portal do Cliente
          </div>
          <h1 className="text-4xl md:text-6xl font-headline font-bold tracking-tighter animate-in fade-in slide-in-from-bottom-6 duration-1000">
            Seu Histórico de <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Streaming</span>
          </h1>
          <p className="max-w-2xl mx-auto text-on-surface-variant text-lg animate-in fade-in slide-in-from-bottom-8 duration-1000">
            Acompanhe seus acessos, visualize credenciais e gerencie seus serviços de streaming.
          </p>

          <form onSubmit={handleSearch} className="mt-12 max-w-xl mx-auto flex flex-col sm:flex-row gap-4 p-2 rounded-3xl bg-white/5 border border-white/10 liquid-glass transition-all focus-within:border-primary/30">
            <div className="relative flex-1">
              <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant w-5 h-5" />
              <input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+258 84 123 4567"
                className="w-full bg-transparent py-4 pl-12 pr-4 text-white outline-none placeholder:text-white/20"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-4 bg-primary text-on-primary font-headline font-bold rounded-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:scale-100 flex items-center justify-center gap-2 shadow-lg shadow-primary/20"
            >
              {isSearching ? <RefreshCcw className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
              {isSearching ? "Buscando..." : "Consultar"}
            </button>
          </form>
        </header>

        {results && (
          <div className="flex justify-center gap-4 mb-12">
            <button 
              onClick={() => setActiveTab("ORDERS")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all border",
                activeTab === "ORDERS" ? "bg-primary text-on-primary border-primary" : "bg-white/5 text-on-surface-variant border-white/10"
              )}
            >
              Meus Pedidos
            </button>
            <button 
              onClick={() => setActiveTab("NOTIFICATIONS")}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all border flex items-center gap-2",
                activeTab === "NOTIFICATIONS" ? "bg-primary text-on-primary border-primary" : "bg-white/5 text-on-surface-variant border-white/10"
              )}
            >
              Notificações
              {notifications.filter(n => !n.isRead).length > 0 && (
                <span className="w-2 h-2 bg-rose-500 rounded-full animate-pulse" />
              )}
            </button>
          </div>
        )}

        {errorMessage && (
          <div className="mb-8 p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-400 flex items-center gap-4 animate-in zoom-in-95 duration-500">
            <AlertCircle className="w-6 h-6 shrink-0" />
            <p className="font-bold">{errorMessage}</p>
          </div>
        )}

        {results && results.length === 0 && (
          <div className="text-center py-20 space-y-4 animate-in fade-in duration-700">
            <div className="w-20 h-20 mx-auto bg-white/5 rounded-full flex items-center justify-center border border-white/10">
              <Search className="w-10 h-10 text-on-surface-variant opacity-20" />
            </div>
            <h3 className="text-xl font-bold">Nenhum pedido encontrado</h3>
            <p className="text-on-surface-variant max-w-xs mx-auto">
              Verifique o número de telefone ou realize um novo pedido para começar.
            </p>
          </div>
        )}

        {results && results.length > 0 && activeTab === "ORDERS" && (
          <div className="grid gap-8 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {results.map((order) => (
              <OrderCard
                key={order.id}
                order={order}
                showPassword={visiblePasswordOrderId === order.id}
                onTogglePassword={() => setVisiblePasswordOrderId(prev => prev === order.id ? null : order.id)}
              />
            ))}
          </div>
        )}

        {results && activeTab === "NOTIFICATIONS" && (
          <div className="max-w-2xl mx-auto space-y-4 animate-in fade-in slide-in-from-bottom-10 duration-1000">
            {notifications.length === 0 ? (
              <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/10">
                <BellRing className="w-12 h-12 mx-auto mb-4 opacity-10" />
                <p className="text-on-surface-variant">Nenhuma notificação por enquanto.</p>
              </div>
            ) : notifications.map((n) => (
              <div key={n.id} className="p-6 rounded-2xl bg-white/5 border border-white/10 liquid-glass flex gap-4">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                  <Zap className="w-5 h-5 text-primary" />
                </div>
                <div className="space-y-1">
                  <p className="text-white text-sm font-medium">{n.content}</p>
                  <p className="text-[10px] text-on-surface-variant uppercase font-bold">
                    {new Date(n.createdAt).toLocaleDateString("pt-BR", { day: "numeric", month: "long" })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        <footer className="mt-20 pt-10 border-t border-white/5 text-center space-y-6">
          <p className="text-on-surface-variant text-sm uppercase tracking-widest font-bold">Precisa de ajuda?</p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="https://wa.me/258000000000"
              target="_blank"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-[#25D366]/10 text-[#25D366] border border-[#25D366]/20 hover:bg-[#25D366]/20 transition-all font-bold"
            >
              <MessageCircle className="w-5 h-5" />
              Suporte via WhatsApp
            </Link>
            <Link
              href="/"
              className="flex items-center gap-3 px-8 py-4 rounded-2xl bg-white/5 text-white border border-white/10 hover:bg-white/10 transition-all font-bold"
            >
              Realizar Novo Pedido
              <ChevronRight className="w-5 h-5" />
            </Link>
          </div>
        </footer>
      </main>
    </div>
  );
}

interface OrderCardProps {
  order: CustomerOrder;
  showPassword: boolean;
  onTogglePassword: () => void;
}

function OrderCard({ order, showPassword, onTogglePassword }: OrderCardProps) {
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="liquid-glass rounded-[2rem] border border-white/5 overflow-hidden group hover:border-primary/20 transition-all duration-500">
      <div className="p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div className="space-y-1">
            <div className="flex items-center gap-3">
              <h2 className="text-2xl font-headline font-bold text-white">{order.service}</h2>
              <span className={cn(
                "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border",
                order.status === "APPROVED" ? "bg-primary/10 text-primary border-primary/20" : 
                order.status === "REJECTED" ? "bg-rose-500/10 text-rose-400 border-rose-500/20" : 
                "bg-yellow-500/10 text-yellow-400 border-yellow-500/20"
              )}>
                {order.status === "APPROVED" ? "Aprovado" : order.status === "REJECTED" ? "Rejeitado" : "Pendente"}
              </span>
            </div>
            <p className="text-on-surface-variant font-medium">{order.plan}</p>
          </div>
          
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Credentials Column */}
          <div className="lg:col-span-7 space-y-6">
            {order.status === "APPROVED" && order.credentials ? (
              <div className="space-y-4">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">Acesso à Conta</h3>
                  <div className="flex items-center gap-2 text-xs text-primary font-bold">
                    <Calendar className="w-3.5 h-3.5" />
                    Expira em {order.expiresAt ? new Date(order.expiresAt).toLocaleDateString() : "N/A"}
                  </div>
                </div>

                {/* Email Field */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group/field hover:border-primary/20 transition-all">
                  <div className="space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Email</p>
                    <p className="text-white font-mono">{order.credentials.email}</p>
                  </div>
                  <button onClick={() => order.credentials && copy(order.credentials.email, "Email")} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-primary">
                    {copied === "Email" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Password Field */}
                <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 group/field hover:border-primary/20 transition-all">
                  <div className="space-y-1">
                    <p className="text-[10px] text-on-surface-variant uppercase font-bold tracking-tighter">Senha</p>
                    <p className="text-white font-mono tracking-widest">
                      {showPassword ? order.credentials.password : "••••••••••••"}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button onClick={onTogglePassword} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-on-surface-variant">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button onClick={() => order.credentials && copy(order.credentials.password, "Senha")} className="p-2 hover:bg-white/10 rounded-lg transition-colors text-primary">
                      {copied === "Senha" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-primary/10 border border-primary/20 flex gap-4">
                  <ShieldCheck className="w-6 h-6 text-primary shrink-0" />
                  <p className="text-sm text-white/80 leading-relaxed">
                    Utilize o seu perfil designado. Alterar a senha ou dados da conta resultará em bloqueio imediato sem reembolso.
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-full p-10 border border-white/5 rounded-3xl bg-white/[0.02] text-center space-y-4">
                {order.status === "PENDING" ? (
                  <>
                    <div className="w-16 h-16 bg-yellow-500/10 rounded-full flex items-center justify-center border border-yellow-500/20">
                      <Clock className="w-8 h-8 text-yellow-500" />
                    </div>
                    <h3 className="font-bold text-lg">Aguardando Pagamento</h3>
                    <p className="text-on-surface-variant text-sm max-w-xs">
                      Seu pedido foi recebido. Assim que nosso suporte validar o comprovante, suas credenciais aparecerão aqui.
                    </p>
                  </>
                ) : (
                  <>
                    <div className="w-16 h-16 bg-rose-500/10 rounded-full flex items-center justify-center border border-rose-500/20">
                      <AlertCircle className="w-8 h-8 text-rose-500" />
                    </div>
                    <h3 className="font-bold text-lg">Pagamento Rejeitado</h3>
                    <p className="text-on-surface-variant text-sm max-w-xs">
                      Houve um problema ao validar seu comprovante. Verifique o arquivo enviado ou fale com o suporte.
                    </p>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Timeline Column */}
          <div className="lg:col-span-5 flex flex-col">
            <h3 className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-6 flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Timeline do Pedido
            </h3>
            <div className="relative space-y-8 flex-1">
              {/* Vertical Line */}
              <div className="absolute left-[11px] top-2 bottom-2 w-px bg-white/10" />
              
              {order.timeline.map((step: TimelineEvent, idx: number) => (
                <div key={idx} className="relative flex gap-6">
                  <div className={cn(
                    "w-6 h-6 rounded-full border-2 flex items-center justify-center z-10 shrink-0",
                    step.status === "COMPLETED" ? "bg-primary border-primary text-on-primary" : 
                    step.status === "PENDING" ? "bg-[#050505] border-yellow-500 text-yellow-500 animate-pulse" : 
                    "bg-rose-500 border-rose-500 text-on-primary"
                  )}>
                    {step.status === "COMPLETED" ? <Check className="w-3.5 h-3.5" /> : 
                     step.status === "PENDING" ? <Clock className="w-3.5 h-3.5" /> : 
                     <AlertCircle className="w-3.5 h-3.5" />}
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-sm text-white">{step.title}</p>
                    <p className="text-xs text-on-surface-variant leading-relaxed">{step.description}</p>
                    <p className="text-[10px] text-on-surface-variant/50 font-mono">
                      {new Date(step.date).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
