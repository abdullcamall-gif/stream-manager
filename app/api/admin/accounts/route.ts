import { ensureAdmin } from "@/app/api/admin/_auth";
import { createAccountAdmin, listAccountsAdmin } from "@/lib/services/admin-management.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await listAccountsAdmin());
}

export async function POST(request: Request) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as {
    serviceId?: unknown;
    email?: unknown;
    password?: unknown;
    totalSlots?: unknown;
    availableSlots?: unknown;
    isActive?: unknown;
  };

  const payload = {
    serviceId: typeof body.serviceId === "string" ? body.serviceId : "",
    email: typeof body.email === "string" ? body.email : "",
    password: typeof body.password === "string" ? body.password : "",
    totalSlots: Number(body.totalSlots),
    availableSlots: Number(body.availableSlots),
    isActive: typeof body.isActive === "boolean" ? body.isActive : true,
  };
  if (!payload.serviceId || !payload.email || !payload.password || payload.totalSlots <= 0) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "invalid account payload" } },
      { status: 400 },
    );
  }

  return NextResponse.json(await createAccountAdmin(payload), { status: 201 });
}


