import { authorizeAdmin } from "@/lib/services";
import { AdminRole } from "@prisma/client";
import { NextResponse } from "next/server";

export function ensureAdmin(request: Request, allowedRoles: AdminRole[] = ["ADMIN", "SUPER_ADMIN"]) {
  const auth = authorizeAdmin(request.headers.get("authorization"), allowedRoles);
  if (!auth.ok) {
    return { ok: false as const, response: NextResponse.json({ error: auth.error }, { status: auth.statusCode }) };
  }

  return { ok: true as const, session: auth.data };
}
