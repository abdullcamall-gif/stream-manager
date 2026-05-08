import { ensureAdmin } from "@/app/api/admin/_auth";
import { deleteServiceAdmin, updateServiceAdmin } from "@/lib/services";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = ensureAdmin(request, ["SUPER_ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = (await request.json()) as { name?: unknown; isActive?: unknown };
  const updated = await updateServiceAdmin(id, {
    name: typeof body.name === "string" ? body.name.trim() : undefined,
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
  await deleteServiceAdmin(id);
  return NextResponse.json({ ok: true });
}
