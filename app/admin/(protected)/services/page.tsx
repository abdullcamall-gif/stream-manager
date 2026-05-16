"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { adminFetch } from "@/app/admin/_lib/admin-api";

type ServiceItem = {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
};

type AccountProfile = {
  id: string;
  profileName: string;
  isAvailable: boolean;
};

type AccountItem = {
  id: string;
  email: string;
  isActive: boolean;
  service: {
    id: string;
    name: string;
  };
  profiles: AccountProfile[];
};

type ProfileDraft = {
  id: string;
  name: string;
  password: string;
};

const FIXED_SERVICES = [
  "Netflix",
  "Spotify",
  "Prime Video",
  "Apple Music",
  "HBO Max",
  "Crunchyroll",
  "IPTV",
  "Disney+",
] as const;

function makeProfileDraft(): ProfileDraft {
  return {
    id: crypto.randomUUID(),
    name: "",
    password: "",
  };
}

export default function AdminServicesPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [accounts, setAccounts] = useState<AccountItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    serviceId: "",
    accountEmail: "",
    accountPassword: "",
    isActive: true,
  });
  const [profiles, setProfiles] = useState<ProfileDraft[]>([makeProfileDraft()]);

  const allowedServices = useMemo(() => {
    const allowed = new Set(FIXED_SERVICES);
    return services.filter((service) => allowed.has(service.name as (typeof FIXED_SERVICES)[number]));
  }, [services]);

  const hasUnconfiguredFixedServices = allowedServices.length < FIXED_SERVICES.length;

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");

    const [servicesResult, accountsResult] = await Promise.all([
      adminFetch<ServiceItem[]>("/api/admin/services"),
      adminFetch<AccountItem[]>("/api/admin/accounts"),
    ]);

    setLoading(false);

    if (!servicesResult.ok) {
      setError(servicesResult.message);
      return;
    }
    if (!accountsResult.ok) {
      setError(accountsResult.message);
      return;
    }

    setServices(servicesResult.data);
    setAccounts(accountsResult.data);

    if (!form.serviceId) {
      const firstServiceId = servicesResult.data.find((service) =>
        FIXED_SERVICES.includes(service.name as (typeof FIXED_SERVICES)[number]),
      )?.id;
      if (firstServiceId) {
        setForm((prev) => ({ ...prev, serviceId: firstServiceId }));
      }
    }
  }, [form.serviceId]);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setError("");

      const [servicesResult, accountsResult] = await Promise.all([
        adminFetch<ServiceItem[]>("/api/admin/services"),
        adminFetch<AccountItem[]>("/api/admin/accounts"),
      ]);

      if (cancelled) return;

      setLoading(false);

      if (!servicesResult.ok) {
        setError(servicesResult.message);
        return;
      }
      if (!accountsResult.ok) {
        setError(accountsResult.message);
        return;
      }

      setServices(servicesResult.data);
      setAccounts(accountsResult.data);

      if (!form.serviceId) {
        const firstServiceId = servicesResult.data.find((service) =>
          FIXED_SERVICES.includes(service.name as (typeof FIXED_SERVICES)[number]),
        )?.id;
        if (firstServiceId) {
          setForm((prev) => ({ ...prev, serviceId: firstServiceId }));
        }
      }
    }

    void load();

    return () => {
      cancelled = true;
    };
  }, [form.serviceId]);

  function resetForm() {
    setForm((prev) => ({
      serviceId: prev.serviceId,
      accountEmail: "",
      accountPassword: "",
      isActive: true,
    }));
    setProfiles([makeProfileDraft()]);
  }

  function addProfile() {
    setProfiles((prev) => [...prev, makeProfileDraft()]);
  }

  function updateProfile(id: string, patch: Partial<ProfileDraft>) {
    setProfiles((prev) => prev.map((profile) => (profile.id === id ? { ...profile, ...patch } : profile)));
  }

  function removeProfile(id: string) {
    setProfiles((prev) => {
      if (prev.length === 1) return prev;
      return prev.filter((profile) => profile.id !== id);
    });
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");

    const profileNames = profiles
      .map((profile) => profile.name.trim())
      .filter(Boolean);

    if (!form.serviceId || !form.accountEmail.trim() || !form.accountPassword.trim() || profileNames.length === 0) {
      setSaving(false);
      setError("Selecione um servico, informe email/senha e pelo menos um perfil.");
      return;
    }

    const result = await adminFetch<AccountItem>("/api/admin/accounts", {
      method: "POST",
      body: JSON.stringify({
        serviceId: form.serviceId,
        email: form.accountEmail,
        password: form.accountPassword,
        profileNames,
        isActive: form.isActive,
      }),
    });

    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }

    await fetchData();
    resetForm();
  }

  return (
    <main className="mx-auto max-w-6xl space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-bold text-white">Streaming Inventory</h1>
        <p className="text-sm text-slate-300">Selecione um servico fixo, adicione credenciais da conta e perfis disponiveis.</p>
      </header>

      <form
        onSubmit={handleSubmit}
        className="rounded-2xl border border-cyan-500/20 bg-gradient-to-b from-slate-900/90 to-slate-950/90 p-5 shadow-[0_0_50px_rgba(6,182,212,0.08)] backdrop-blur"
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="md:col-span-2 space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">Servico</label>
            <select
              value={form.serviceId}
              onChange={(event) => setForm((prev) => ({ ...prev, serviceId: event.target.value }))}
              className="w-full rounded-xl border border-cyan-400/30 bg-slate-900/80 px-3 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/30"
              required
            >
              <option value="" disabled>
                Selecione um servico
              </option>
              {FIXED_SERVICES.map((serviceName) => {
                const service = allowedServices.find((item) => item.name === serviceName);
                return (
                  <option key={serviceName} value={service?.id ?? ""} disabled={!service}>
                    {serviceName}
                    {!service ? " (nao configurado)" : ""}
                  </option>
                );
              })}
            </select>
            {hasUnconfiguredFixedServices ? (
              <p className="text-xs text-amber-300">Alguns servicos fixos ainda nao existem no banco e nao podem receber inventario.</p>
            ) : null}
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">Account Email</label>
            <input
              value={form.accountEmail}
              onChange={(event) => setForm((prev) => ({ ...prev, accountEmail: event.target.value }))}
              type="email"
              placeholder="conta@provedor.com"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/30"
              required
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium uppercase tracking-[0.16em] text-cyan-300">Account Password</label>
            <input
              value={form.accountPassword}
              onChange={(event) => setForm((prev) => ({ ...prev, accountPassword: event.target.value }))}
              type="text"
              placeholder="Senha da conta"
              className="w-full rounded-xl border border-slate-700 bg-slate-900/70 px-3 py-3 text-white outline-none transition focus:border-cyan-300 focus:ring-2 focus:ring-cyan-500/30"
              required
            />
          </div>
        </div>

        <section className="mt-5 space-y-3 rounded-xl border border-slate-700/70 bg-slate-900/40 p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-white">Profiles</h2>
            <button
              type="button"
              onClick={addProfile}
              className="rounded-lg border border-cyan-400/40 bg-cyan-500/10 px-3 py-1.5 text-xs font-semibold text-cyan-300 transition hover:bg-cyan-500/20"
            >
              + Add profile
            </button>
          </div>

          <div className="space-y-3">
            {profiles.map((profile, index) => (
              <div key={profile.id} className="rounded-lg border border-slate-700 bg-slate-950/60 p-3">
                <div className="mb-2 flex items-center justify-between">
                  <p className="text-xs text-slate-300">Profile {index + 1}</p>
                  {profiles.length > 1 ? (
                    <button
                      type="button"
                      onClick={() => removeProfile(profile.id)}
                      className="text-xs text-rose-300 transition hover:text-rose-200"
                    >
                      Remove
                    </button>
                  ) : null}
                </div>

                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                  <input
                    value={profile.name}
                    onChange={(event) => updateProfile(profile.id, { name: event.target.value })}
                    placeholder="Profile name"
                    className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
                    required
                  />
                  <input
                    value={profile.password}
                    onChange={(event) => updateProfile(profile.id, { password: event.target.value })}
                    placeholder="Profile password (optional)"
                    className="rounded-md border border-slate-700 bg-slate-900 px-3 py-2 text-sm text-white outline-none transition focus:border-cyan-300"
                  />
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="mt-4 flex items-center justify-between gap-3">
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((prev) => ({ ...prev, isActive: event.target.checked }))}
            />
            Active account
          </label>
          <button
            disabled={saving}
            className="rounded-xl bg-cyan-400 px-4 py-2 font-semibold text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {saving ? "Saving..." : "Save Inventory"}
          </button>
        </div>
      </form>

      {error ? <p className="text-sm text-red-400">{error}</p> : null}

      <section className="space-y-3">
        <h2 className="text-lg font-semibold text-white">Available Accounts</h2>
        {loading ? <p className="text-slate-400">Carregando...</p> : null}

        {!loading && accounts.length === 0 ? (
          <div className="rounded-xl border border-slate-700 bg-slate-900 p-4 text-sm text-slate-300">Nenhuma conta cadastrada ainda.</div>
        ) : null}

        {accounts.map((account) => {
          const availableProfiles = account.profiles.filter((profile) => profile.isAvailable);
          return (
            <article
              key={account.id}
              className="rounded-xl border border-slate-700 bg-slate-900/80 p-4 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="text-base font-semibold text-white">{account.service.name}</p>
                  <p className="text-sm text-slate-300">{account.email}</p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-semibold ${
                    account.isActive ? "bg-emerald-500/15 text-emerald-300" : "bg-slate-700 text-slate-300"
                  }`}
                >
                  {account.isActive ? "active" : "inactive"}
                </span>
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-slate-300 md:grid-cols-3">
                <p>Total profiles: <span className="font-semibold text-white">{account.profiles.length}</span></p>
                <p>Available profiles: <span className="font-semibold text-cyan-300">{availableProfiles.length}</span></p>
                <p>
                  Available names: <span className="font-semibold text-white">{availableProfiles.map((profile) => profile.profileName).join(", ") || "-"}</span>
                </p>
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}
