"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight } from "lucide-react";
import { adminFetch, setAdminCsrfToken, setAdminToken } from "@/app/admin/_lib/admin-api";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const router = useRouter();

  async function handleLogin(event: React.FormEvent) {
    event.preventDefault();
    setErrorMessage("");
    setIsLoading(true);

    const result = await adminFetch<{ token: string; csrfToken: string }>("/api/v1/admin/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });

    setIsLoading(false);
    if (!result.ok) {
      setErrorMessage(result.message);
      return;
    }

    setAdminToken(result.data.token);
    setAdminCsrfToken(result.data.csrfToken);
    router.push("/admin/dashboard");
  }

  return (
    <main className="min-h-screen bg-[#050505] flex items-center justify-center p-6">
      <div className="w-full max-w-md rounded-3xl border border-white/10 bg-white/5 p-8">
        <h1 className="text-2xl font-bold text-white">Admin Login</h1>
        <p className="mt-2 text-sm text-slate-300">Entre com suas credenciais.</p>

        <form onSubmit={handleLogin} className="mt-6 space-y-4">
          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Email</span>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-9 pr-3 text-white"
              />
            </div>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs text-slate-300">Senha</span>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
              <input
                type="password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-xl border border-slate-700 bg-slate-900 py-3 pl-9 pr-3 text-white"
              />
            </div>
          </label>

          {errorMessage ? (
            <p className="rounded-lg border border-rose-300 bg-rose-50 p-2 text-sm text-rose-700">
              {errorMessage}
            </p>
          ) : null}

          <button
            disabled={isLoading}
            type="submit"
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-cyan-400 px-4 py-3 font-semibold text-slate-950 disabled:opacity-60"
          >
            {isLoading ? "Entrando..." : "Entrar"}
            {!isLoading ? <ArrowRight size={16} /> : null}
          </button>
        </form>
      </div>
    </main>
  );
}
