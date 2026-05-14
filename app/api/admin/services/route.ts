import { ensureAdmin } from "@/app/api/admin/_auth";
import { createServiceAdmin, listServicesAdmin } from "@/lib/services/admin-management.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await listServicesAdmin());
}

export async function POST(request: Request) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  const body = (await request.json()) as { name?: unknown; isActive?: unknown };
  const name = typeof body.name === "string" ? body.name : "";
  if (!name.trim()) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "name is required" } },
      { status: 400 },
    );
  }

  const created = await createServiceAdmin({
    name,
    isActive: typeof body.isActive === "boolean" ? body.isActive : true,
  });
  return NextResponse.json(created, { status: 201 });
}


