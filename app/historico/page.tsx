"use client";

import { useState } from "react";
import { Search, Smartphone, Eye, EyeOff, Copy, Check, Clock } from "lucide-react";
import Link from "next/link";

type OrderStatus = "PENDING" | "APPROVED" | "REJECTED";

type CustomerOrder = {
  id: string;
  status: OrderStatus;
  service: string;
  plan: string;
  expiresAt: string | null;
  credentials: {
    email: string;
    password: string;
  } | null;
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

  async function handleSearch(event: React.FormEvent) {
    event.preventDefault();
    const sanitizedPhone = sanitizePhone(phone);
    if (!sanitizedPhone) return;

    setIsSearching(true);
    setErrorMessage("");
    setResults(null);

    try {
      const response = await fetch(
        `/api/v1/orders/by-phone?phone=${encodeURIComponent(sanitizedPhone)}`,
      );
      const payload = (await response.json()) as
        | CustomerOrder[]
        | { error?: { message?: string } | string };

      if (!response.ok) {
        const message =
          typeof payload === "object" && payload && "error" in payload
            ? typeof payload.error === "string"
              ? payload.error
              : payload.error?.message ?? "Falha ao buscar pedidos"
            : "Falha ao buscar pedidos";
        setErrorMessage(message);
        setResults([]);
        return;
      }

      setResults(Array.isArray(payload) ? payload : []);
    } catch {
      setErrorMessage("Erro de conexao ao consultar pedidos");
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }

  return (
    <main className="mx-auto min-h-screen w-full max-w-5xl px-6 py-12">
      <header className="mb-8 rounded-3xl bg-slate-950 p-8 text-white">
        <h1 className="text-3xl font-semibold">Consultar pedidos por telefone</h1>
        <p className="mt-2 text-slate-300">
          Veja o status dos seus pedidos e credenciais apenas quando aprovados.
        </p>

        <form onSubmit={handleSearch} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Smartphone className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+258841234567"
              className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-12 pr-4 text-white outline-none ring-cyan-400 focus:ring-2"
            />
          </label>
          <button
            type="submit"
            disabled={isSearching}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-cyan-400 px-5 py-3 font-semibold text-slate-950 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Search className="h-4 w-4" />
            {isSearching ? "Buscando..." : "Consultar"}
          </button>
        </form>
      </header>

      {errorMessage ? (
        <p className="mb-4 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
          {errorMessage}
        </p>
      ) : null}

      {results && results.length === 0 ? (
        <p className="rounded-xl border border-slate-200 bg-white p-4 text-slate-600">
          Nenhum pedido encontrado para este telefone.
        </p>
      ) : null}

      {results && results.length > 0 ? (
        <section className="grid gap-4 md:grid-cols-2">
          {results.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              showPassword={visiblePasswordOrderId === order.id}
              onTogglePassword={() =>
                setVisiblePasswordOrderId((prev) => (prev === order.id ? null : order.id))
              }
            />
          ))}
        </section>
      ) : null}

      <div className="mt-10">
        <Link
          href="https://wa.me/258000000000"
          target="_blank"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Falar no WhatsApp
        </Link>
      </div>
    </main>
  );
}

function OrderCard({
  order,
  showPassword,
  onTogglePassword,
}: {
  order: CustomerOrder;
  showPassword: boolean;
  onTogglePassword: () => void;
}) {
  const [copied, setCopied] = useState<"email" | "password" | null>(null);

  async function copy(text: string, field: "email" | "password") {
    await navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(null), 1200);
  }

  const isApproved = order.status === "APPROVED" && order.credentials !== null;

  return (
    <article className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">{order.service}</h2>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-1 text-sm text-slate-600">{order.plan}</p>

      {isApproved ? (
        <div className="mt-4 space-y-3 rounded-xl bg-slate-50 p-4">
          <p className="text-xs text-slate-500">
            Expira em: {order.expiresAt ? new Date(order.expiresAt).toLocaleDateString() : "-"}
          </p>

          <div className="flex items-center justify-between gap-3">
            <span className="truncate text-sm text-slate-800">{order.credentials.email}</span>
            <button
              type="button"
              onClick={() => void copy(order.credentials.email, "email")}
              className="text-cyan-700"
            >
              {copied === "email" ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </button>
          </div>

          <div className="flex items-center justify-between gap-3">
            <span className="truncate font-mono text-sm text-slate-800">
              {showPassword ? order.credentials.password : "••••••••"}
            </span>
            <div className="flex items-center gap-2">
              <button type="button" onClick={onTogglePassword} className="text-slate-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
              <button
                type="button"
                onClick={() => void copy(order.credentials.password, "password")}
                className="text-cyan-700"
              >
                {copied === "password" ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Copy className="h-4 w-4" />
                )}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div className="mt-4 flex items-center gap-2 rounded-xl bg-slate-50 p-4 text-sm text-slate-600">
          <Clock className="h-4 w-4" />
          {order.status === "PENDING"
            ? "Pedido em analise. Credenciais serao exibidas apos aprovacao."
            : "Pedido rejeitado. Credenciais nao sao exibidas."}
        </div>
      )}
    </article>
  );
}

function StatusBadge({ status }: { status: OrderStatus }) {
  if (status === "APPROVED") {
    return <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs text-emerald-700">APPROVED</span>;
  }
  if (status === "REJECTED") {
    return <span className="rounded-full bg-rose-100 px-2 py-1 text-xs text-rose-700">REJECTED</span>;
  }
  return <span className="rounded-full bg-amber-100 px-2 py-1 text-xs text-amber-700">PENDING</span>;
}
