import { createManualOrder } from "@/lib/services";
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
