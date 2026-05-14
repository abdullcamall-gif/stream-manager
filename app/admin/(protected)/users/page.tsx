"use client";

import { useEffect, useState } from "react";
import { adminFetch } from "@/app/admin/_lib/admin-api";

type AdminUser = {
  id: string;
  email: string;
  role: "ADMIN" | "SUPPORT";
  createdAt: string;
};

export default function UsersAdminPage() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      const result = await adminFetch<AdminUser[]>("/api/admin/admins");
      if (cancelled) return;
      setLoading(false);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setUsers(result.data);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  async function updateUser(user: AdminUser) {
    const nextEmail = window.prompt("Novo email:", user.email);
    if (nextEmail === null) return;
    const nextRole = window.confirm("Definir como ADMIN? OK=ADMIN, Cancel=SUPPORT")
      ? "ADMIN"
      : "SUPPORT";

    const previous = [...users];
    setUsers((prev) =>
      prev.map((item) =>
        item.id === user.id ? { ...item, email: nextEmail.trim(), role: nextRole } : item,
      ),
    );

    const result = await adminFetch<AdminUser>(`/api/admin/admins/${user.id}`, {
      method: "PATCH",
      body: JSON.stringify({ email: nextEmail, role: nextRole }),
    });
    if (!result.ok) {
      setUsers(previous);
      setError(result.message);
      return;
    }
    setUsers((prev) => prev.map((item) => (item.id === user.id ? result.data : item)));
  }

  async function deleteUser(user: AdminUser) {
    const confirmed = window.confirm(`Excluir admin ${user.email}?`);
    if (!confirmed) return;
    setError("");
    const result = await adminFetch<{ ok: boolean }>(`/api/admin/admins/${user.id}`, {
      method: "DELETE",
    });
    if (!result.ok) {
      setError(result.message);
      return;
    }
    setUsers((prev) => prev.filter((item) => item.id !== user.id));
  }

  return (
    <main className="space-y-6">
      <h1 className="text-3xl font-bold text-white">Usuarios Admin</h1>
      {error ? <p className="text-sm text-rose-400">{error}</p> : null}
      {loading ? <p className="text-slate-300">Carregando...</p> : null}
      <div className="space-y-2">
        {users.map((user) => (
          <div key={user.id} className="flex items-center justify-between rounded-lg border border-slate-700 bg-slate-900 p-3">
            <div>
              <p className="font-semibold text-white">{user.email}</p>
              <p className="text-xs text-slate-400">{user.role}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => void updateUser(user)} className="rounded bg-slate-700 px-3 py-1 text-sm text-white">
                Editar
              </button>
              <button onClick={() => void deleteUser(user)} className="rounded bg-rose-700 px-3 py-1 text-sm text-white">
                Excluir
              </button>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}

