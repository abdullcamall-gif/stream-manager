import { authorizeAdmin } from "@/lib/services/admin-auth.service";
import { logSecurityEvent } from "@/lib/security/audit";
import { verifyCsrf } from "@/lib/security/csrf";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { AdminRole } from "@prisma/client";
import { NextResponse } from "next/server";

export async function ensureAdmin(request: Request, allowedRoles: AdminRole[] = ["SUPPORT", "ADMIN"]) {
  const ip = getClientIp(request);
  const rate = enforceRateLimit(`admin:${ip}:${request.method}:${new URL(request.url).pathname}`, 120, 60_000);
  if (!rate.ok) {
    return { ok: false as const, response: NextResponse.json({ error: { message: "rate limit exceeded" } }, { status: 429 }) };
  }

  if (!verifyCsrf(request)) {
    void logSecurityEvent({
      eventType: "CSRF_VALIDATION_FAILED",
      severity: "HIGH",
      message: "CSRF token mismatch on admin endpoint",
      request: { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined },
    });
    return { ok: false as const, response: NextResponse.json({ error: { message: "invalid csrf token" } }, { status: 403 }) };
  }

  const auth = await authorizeAdmin(request.headers.get("authorization"), allowedRoles);
  if (!auth.ok) {
    void logSecurityEvent({
      eventType: "ADMIN_AUTH_FAILED",
      severity: "MEDIUM",
      message: auth.error.message,
      metadata: { statusCode: auth.statusCode },
      request: { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined },
    });
    return { ok: false as const, response: NextResponse.json({ error: auth.error }, { status: auth.statusCode }) };
  }

  return { ok: true as const, session: auth.data };
}


