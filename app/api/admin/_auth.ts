import { authorizeAdmin } from "@/lib/services/admin-auth.service";
import { AdminRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function ensureAdmin(request: Request, allowedRoles: AdminRole[] = ["SUPPORT", "ADMIN"]) {
  const auth = await authorizeAdmin(request.headers.get("authorization"), allowedRoles);
  if (!auth.ok) {
    return { ok: false as const, response: NextResponse.json({ error: auth.error }, { status: auth.statusCode }) };
  }

  return { ok: true as const, session: auth.data };
}


