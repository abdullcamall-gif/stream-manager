import { ensureAdmin } from "@/app/api/admin/_auth";
import { deleteAccountAdmin, updateAccountAdmin } from "@/lib/services";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = ensureAdmin(request, ["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = (await request.json()) as {
    serviceId?: unknown;
    email?: unknown;
    password?: unknown;
    totalSlots?: unknown;
    availableSlots?: unknown;
    isActive?: unknown;
  };
  const updated = await updateAccountAdmin(id, {
    serviceId: typeof body.serviceId === "string" ? body.serviceId : undefined,
    email: typeof body.email === "string" ? body.email : undefined,
    password: typeof body.password === "string" ? body.password : undefined,
    totalSlots: typeof body.totalSlots === "number" ? body.totalSlots : undefined,
    availableSlots:
      typeof body.availableSlots === "number" ? body.availableSlots : undefined,
    isActive: typeof body.isActive === "boolean" ? body.isActive : undefined,
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
  await deleteAccountAdmin(id);
  return NextResponse.json({ ok: true });
}
