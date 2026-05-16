import { listOrdersByPhone } from "@/lib/services/checkout.service";
import { logAccess, logSecurityEvent } from "@/lib/security/audit";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = enforceRateLimit(`orders-by-phone:${ip}`, 30, 60_000);
    if (!rate.ok) {
      void logSecurityEvent({
        eventType: "RATE_LIMIT_HIT",
        severity: "MEDIUM",
        message: "Rate limit exceeded on orders by phone lookup",
        request: { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined },
      });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    void logAccess({
      path: "/api/v1/orders/by-phone",
      method: "GET",
      request: { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined },
    });

    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") ?? "";

    const result = await listOrdersByPhone(phone);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
        },
        { status: result.statusCode },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("GET /api/v1/orders/by-phone failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 },
    );
  }
}

