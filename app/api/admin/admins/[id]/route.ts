import { ensureAdmin } from "@/app/api/admin/_auth";
import { deleteAdminAdmin, updateAdminAdmin } from "@/lib/services";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = ensureAdmin(request, ["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = (await request.json()) as {
    email?: unknown;
    passwordHash?: unknown;
    role?: unknown;
  };
  const updated = await updateAdminAdmin(id, {
    email: typeof body.email === "string" ? body.email : undefined,
    passwordHash:
      typeof body.passwordHash === "string" ? body.passwordHash : undefined,
    role:
      body.role === "SUPER_ADMIN" || body.role === "ADMIN"
        ? body.role
        : undefined,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = ensureAdmin(request, ["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  await deleteAdminAdmin(id);
  return NextResponse.json({ ok: true });
}
