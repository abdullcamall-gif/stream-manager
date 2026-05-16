import { createManualOrder } from "@/lib/services/checkout.service";
import { logAccess, logSecurityEvent } from "@/lib/security/audit";
import { enforceRateLimit, getClientIp } from "@/lib/security/rate-limit";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

type OrderPayload = {
  name?: unknown;
  phone?: unknown;
  planId?: unknown;
  paymentMethod?: unknown;
  proofImageUrl?: unknown;
};

export async function POST(request: Request) {
  try {
    const ip = getClientIp(request);
    const rate = enforceRateLimit(`orders-create:${ip}`, 20, 60_000);
    if (!rate.ok) {
      void logSecurityEvent({
        eventType: "RATE_LIMIT_HIT",
        severity: "MEDIUM",
        message: "Rate limit exceeded on order creation",
        request: { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined },
      });
      return NextResponse.json({ error: "Too many requests" }, { status: 429 });
    }

    void logAccess({
      path: "/api/v1/orders",
      method: "POST",
      request: { ipAddress: ip, userAgent: request.headers.get("user-agent") ?? undefined },
    });

    const body = (await request.json()) as OrderPayload;

    const result = await createManualOrder({
      name: typeof body.name === "string" ? body.name : "",
      phone: typeof body.phone === "string" ? body.phone : "",
      planId: typeof body.planId === "string" ? body.planId : "",
      paymentMethod:
        typeof body.paymentMethod === "string" ? body.paymentMethod : "",
      proofImageUrl:
        typeof body.proofImageUrl === "string" ? body.proofImageUrl : "",
    });

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
        },
        { status: result.statusCode },
      );
    }

    return NextResponse.json(result.data, { status: 201 });
  } catch (error) {
    console.error("POST /api/v1/orders failed:", error);
    return NextResponse.json(
      { error: "Failed to create order." },
      { status: 500 },
    );
  }
}

