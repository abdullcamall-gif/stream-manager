import { loginAdmin } from "@/lib/services/admin-auth.service";
import { logAudit, logSecurityEvent } from "@/lib/security/audit";
import { CSRF_COOKIE_NAME, generateCsrfToken } from "@/lib/security/csrf";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = enforceRateLimit(`admin-login:${ip}`, 10, 60_000);
    if (!rate.ok) {
      return NextResponse.json({ error: { code: "RATE_LIMIT", message: "Too many login attempts" } }, { status: 429 });
    }

    const body = await request.json();
    const result = await loginAdmin(
      typeof body.email === "string" ? body.email : "",
      typeof body.password === "string" ? body.password : "",
    );

    if (!result.ok) {
      void logSecurityEvent({
        eventType: "ADMIN_LOGIN_FAILED",
        severity: "MEDIUM",
        message: result.error.message,
        metadata: { email: typeof body.email === "string" ? body.email : "" },
        request: { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined },
      });
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    const csrfToken = generateCsrfToken();
    const response = NextResponse.json({ ...result.data, csrfToken });
    
    response.cookies.set(CSRF_COOKIE_NAME, csrfToken, {
      httpOnly: false,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    response.cookies.set("admin_token", result.data.token, {
      httpOnly: true,
      sameSite: "strict",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 8,
    });

    void logAudit({
      adminUserId: result.data.adminId,
      action: "ADMIN_LOGIN_SUCCESS",
      resource: "AdminSession",
      metadata: { email: result.data.email },
      request: { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined },
    });

    return response;
  } catch (error: unknown) {
    console.error("Login API Error:", error);
    const debugMessage =
      process.env.NODE_ENV === "development"
        ? error instanceof Error
          ? error.stack ?? error.message
          : String(error)
        : "invalid request body";

    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: debugMessage } },
      { status: 500 },
    );
  }
}

