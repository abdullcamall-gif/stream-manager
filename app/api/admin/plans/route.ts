import { ensureAdmin } from "@/app/api/admin/_auth";
import { createPlanAdmin, listPlansAdmin } from "@/lib/services/admin-management.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await listPlansAdmin());
}

export async function POST(request: Request) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as {
    serviceId?: unknown;
    name?: unknown;
    price?: unknown;
    durationInDays?: unknown;
    maxSlots?: unknown;
    isShared?: unknown;
  };

  const payload = {
    serviceId: typeof body.serviceId === "string" ? body.serviceId : "",
    name: typeof body.name === "string" ? body.name : "",
    price: Number(body.price),
    durationInDays: Number(body.durationInDays),
    maxSlots: Number(body.maxSlots),
    isShared: Boolean(body.isShared),
  };
  if (!payload.serviceId || !payload.name || payload.price <= 0 || payload.durationInDays <= 0) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "invalid plan payload" } },
      { status: 400 },
    );
  }

  return NextResponse.json(await createPlanAdmin(payload), { status: 201 });
}


