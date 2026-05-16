import { renewAssignment } from "@/lib/services/renewal.service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function PATCH(_request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const result = await renewAssignment(id, "CUSTOMER");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("PATCH /api/v1/orders/[id]/renew failed:", error);
    return NextResponse.json({ error: "Failed to renew assignment." }, { status: 500 });
  }
}

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const form = await request.formData();
    const paymentMethod = form.get("paymentMethod");
    const proof = form.get("proof");

    if (typeof paymentMethod !== "string" || paymentMethod.trim().length === 0) {
      return NextResponse.json({ error: "paymentMethod is required" }, { status: 400 });
    }

    if (!(proof instanceof File)) {
      return NextResponse.json({ error: "proof is required" }, { status: 400 });
    }

    const result = await renewAssignment(id, "CUSTOMER");
    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }
    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/v1/orders/[id]/renew failed:", error);
    return NextResponse.json({ error: "Failed to renew assignment." }, { status: 500 });
  }
}
