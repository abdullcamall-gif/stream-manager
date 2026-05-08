"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/app/admin/_lib/admin-api";

type ServiceItem = { id: string; name: string };
type PlanItem = {
  id: string;
  serviceId: string;
  name: string;
  price: number | string;
  durationInDays: number;
  maxSlots: number;
  isShared: boolean;
};

export default function AdminPlansPage() {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [plans, setPlans] = useState<PlanItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    serviceId: "",
    name: "",
    price: "0",
    durationInDays: "30",
    maxSlots: "1",
    isShared: true,
  });

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const [servicesRes, plansRes] = await Promise.all([
        adminFetch<ServiceItem[]>("/api/admin/services"),
        adminFetch<PlanItem[]>("/api/admin/plans"),
      ]);
      if (cancelled) return;
      setLoading(false);
      if (!servicesRes.ok) {
        setError(servicesRes.message);
        return;
      }
      if (!plansRes.ok) {
        setError(plansRes.message);
        return;
      }
      setServices(servicesRes.data);
      setPlans(plansRes.data);
      setForm((prev) =>
        prev.serviceId || !servicesRes.data[0]
          ? prev
          : { ...prev, serviceId: servicesRes.data[0].id },
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createPlan(event: React.FormEvent) {
    event.preventDefault();
    setSaving(true);
    setError("");
    const result = await adminFetch<PlanItem>("/api/admin/plans", {
      method: "POST",
      body: JSON.stringify({
        serviceId: form.serviceId,
        name: form.name,
        price: Number(form.price),
        durationInDays: Number(form.durationInDays),
        maxSlots: Number(form.maxSlots),
        isShared: form.isShared,
      }),
    });
    setSaving(false);
    if (!result.ok) return setError(result.message);
    setPlans((prev) => [result.data, ...prev]);
    setForm((prev) => ({ ...prev, name: "" }));
  }

  async function updatePlan(plan: PlanItem) {
    const nextName = window.prompt("Nome do plano:", plan.name);
    if (nextName === null) return;
    const previous = [...plans];
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? { ...p, name: nextName } : p)));

    const result = await adminFetch<PlanItem>(`/api/admin/plans/${plan.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: nextName }),
    });
    if (!result.ok) {
      setPlans(previous);
      setError(result.message);
      return;
    }
    setPlans((prev) => prev.map((p) => (p.id === plan.id ? result.data : p)));
  }

  async function deletePlan(plan: PlanItem) {
    if (!window.confirm(`Excluir plano "${plan.name}"?`)) return;
    const previous = [...plans];
    setPlans((prev) => prev.filter((p) => p.id !== plan.id));
    const result = await adminFetch<{ ok: boolean }>(`/api/admin/plans/${plan.id}`, {
      method: "DELETE",
    });
    if (!result.ok) {
      setPlans(previous);
      setError(result.message);
    }
  }

  const serviceNameById = new Map(services.map((service) => [service.id, service.name]));

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Planos</h1>
      <form onSubmit={createPlan} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="grid gap-3 md:grid-cols-3">
          <select
            value={form.serviceId}
            onChange={(event) => setForm((prev) => ({ ...prev, serviceId: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          >
            {services.map((service) => (
              <option key={service.id} value={service.id}>
                {service.name}
              </option>
            ))}
          </select>
          <input
            placeholder="Nome"
            value={form.name}
            required
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            placeholder="Preco"
            value={form.price}
            type="number"
            min="1"
            onChange={(event) => setForm((prev) => ({ ...prev, price: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            placeholder="Duracao (dias)"
            value={form.durationInDays}
            type="number"
            min="1"
            onChange={(event) => setForm((prev) => ({ ...prev, durationInDays: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <input
            placeholder="Slots"
            value={form.maxSlots}
            type="number"
            min="1"
            onChange={(event) => setForm((prev) => ({ ...prev, maxSlots: event.target.value }))}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <label className="flex items-center gap-2 text-slate-200">
            <input
              type="checkbox"
              checked={form.isShared}
              onChange={(event) => setForm((prev) => ({ ...prev, isShared: event.target.checked }))}
            />
            Compartilhado
          </label>
        </div>
        <button
          disabled={saving}
          className="mt-3 rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950"
        >
          {saving ? "Criando..." : "Criar plano"}
        </button>
      </form>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-slate-300">Carregando...</p> : null}
      <div className="space-y-2">
        {plans.map((plan) => (
          <div key={plan.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3">
            <div>
              <p className="font-semibold text-white">{plan.name}</p>
              <p className="text-xs text-slate-400">
                {serviceNameById.get(plan.serviceId) ?? plan.serviceId} • MZN {Number(plan.price)} • {plan.durationInDays} dias
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void updatePlan(plan)} className="rounded bg-slate-700 px-3 py-1 text-sm text-white">
                Editar
              </button>
              <button onClick={() => void deletePlan(plan)} className="rounded bg-rose-700 px-3 py-1 text-sm text-white">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
