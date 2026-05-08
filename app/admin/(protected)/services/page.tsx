"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/app/admin/_lib/admin-api";

type ServiceItem = {
  id: string;
  name: string;
  isActive: boolean;
};

export default function AdminServicesPage() {
  const [items, setItems] = useState<ServiceItem[]>([]);
  const [name, setName] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await adminFetch<ServiceItem[]>("/api/admin/services");
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setItems(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function createService(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    setSaving(true);
    const result = await adminFetch<ServiceItem>("/api/admin/services", {
      method: "POST",
      body: JSON.stringify({ name, isActive }),
    });
    setSaving(false);
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setItems((prev) => [result.data, ...prev]);
    setName("");
    setIsActive(true);
  }

  async function updateService(service: ServiceItem) {
    const nextName = window.prompt("Novo nome do servico:", service.name);
    if (nextName === null) return;
    const nextActive = window.confirm("Servico ativo? OK = ativo, Cancelar = inativo");

    const previous = [...items];
    setItems((prev) =>
      prev.map((item) =>
        item.id === service.id ? { ...item, name: nextName.trim(), isActive: nextActive } : item,
      ),
    );

    const result = await adminFetch<ServiceItem>(`/api/admin/services/${service.id}`, {
      method: "PATCH",
      body: JSON.stringify({ name: nextName, isActive: nextActive }),
    });

    if (!result.ok) {
      setItems(previous);
      setError(result.message);
      return;
    }
    setItems((prev) => prev.map((item) => (item.id === service.id ? result.data : item)));
  }

  async function deleteService(service: ServiceItem) {
    const confirmed = window.confirm(`Excluir servico "${service.name}"?`);
    if (!confirmed) return;

    const previous = [...items];
    setItems((prev) => prev.filter((item) => item.id !== service.id));
    const result = await adminFetch<{ ok: boolean }>(`/api/admin/services/${service.id}`, {
      method: "DELETE",
    });
    if (!result.ok) {
      setItems(previous);
      setError(result.message);
    }
  }

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Servicos</h1>

      <form onSubmit={createService} className="rounded-xl border border-slate-700 bg-slate-900 p-4">
        <div className="flex flex-col gap-3 md:flex-row">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            required
            placeholder="Nome do servico"
            className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
          />
          <label className="flex items-center gap-2 text-sm text-slate-200">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) => setIsActive(event.target.checked)}
            />
            Ativo
          </label>
          <button disabled={saving} className="rounded-lg bg-cyan-400 px-4 py-2 font-semibold text-slate-950">
            {saving ? "Criando..." : "Criar"}
          </button>
        </div>
      </form>

      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-slate-300">Carregando...</p> : null}

      <div className="space-y-2">
        {items.map((service) => (
          <div key={service.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3">
            <div>
              <p className="font-semibold text-white">{service.name}</p>
              <p className="text-xs text-slate-400">{service.isActive ? "Ativo" : "Inativo"}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void updateService(service)} className="rounded bg-slate-700 px-3 py-1 text-sm text-white">
                Editar
              </button>
              <button onClick={() => void deleteService(service)} className="rounded bg-rose-700 px-3 py-1 text-sm text-white">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
