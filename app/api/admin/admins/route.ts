import { ensureAdmin } from "@/app/api/admin/_auth";
import { createAdminAdmin, listAdminsAdmin } from "@/lib/services/admin-management.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await listAdminsAdmin());
}

export async function POST(request: Request) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;
  const body = (await request.json()) as {
    email?: unknown;
    passwordHash?: unknown;
    role?: unknown;
  };
  const email = typeof body.email === "string" ? body.email : "";
  const passwordHash = typeof body.passwordHash === "string" ? body.passwordHash : "";
  if (!email || !passwordHash) {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "email and passwordHash are required" } },
      { status: 400 },
    );
  }
  return NextResponse.json(
    await createAdminAdmin({
      email,
      passwordHash,
      role:
        body.role === "ADMIN" || body.role === "SUPPORT"
          ? body.role
          : "ADMIN",
    }),
    { status: 201 },
  );
}


