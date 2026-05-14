import { ensureAdmin } from "@/app/api/admin/_auth";
import { deletePlanAdmin, updatePlanAdmin } from "@/lib/services/admin-management.service";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  const body = (await request.json()) as {
    serviceId?: unknown;
    name?: unknown;
    price?: unknown;
    durationInDays?: unknown;
    maxSlots?: unknown;
    isShared?: unknown;
  };
  const updated = await updatePlanAdmin(id, {
    serviceId: typeof body.serviceId === "string" ? body.serviceId : undefined,
    name: typeof body.name === "string" ? body.name : undefined,
    price: typeof body.price === "number" ? body.price : undefined,
    durationInDays:
      typeof body.durationInDays === "number" ? body.durationInDays : undefined,
    maxSlots: typeof body.maxSlots === "number" ? body.maxSlots : undefined,
    isShared: typeof body.isShared === "boolean" ? body.isShared : undefined,
  });
  return NextResponse.json(updated);
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const { id } = await context.params;
  await deletePlanAdmin(id);
  return NextResponse.json({ ok: true });
}


