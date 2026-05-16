import { prisma } from "@/lib/db";
import { createManualOrder } from "@/lib/services/checkout.service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await context.params;
    const form = await request.formData();
    const name = form.get("name");
    const phone = form.get("phone");
    const paymentMethod = form.get("paymentMethod");
    const duration = form.get("duration");
    const proof = form.get("proof");

    if (typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    if (typeof phone !== "string" || phone.trim().length === 0) {
      return NextResponse.json({ error: "phone is required" }, { status: 400 });
    }

    if (typeof paymentMethod !== "string" || paymentMethod.trim().length === 0) {
      return NextResponse.json({ error: "paymentMethod is required" }, { status: 400 });
    }

    if (typeof duration !== "string" || duration.trim().length === 0) {
      return NextResponse.json({ error: "duration is required" }, { status: 400 });
    }

    if (!(proof instanceof File)) {
      return NextResponse.json({ error: "proof is required" }, { status: 400 });
    }

    // 1. Find service by slug
    const service = await prisma.streamingService.findUnique({
      where: { slug: id },
      include: {
        offers: {
          where: { durationInDays: Number(duration) }
        }
      }
    });

    if (!service) {
      return NextResponse.json({ error: "Service not found" }, { status: 404 });
    }

    const offer = service.offers[0];
    if (!offer) {
      return NextResponse.json({ error: "Plan not found for this service" }, { status: 404 });
    }

    // 2. Handle proof (mock upload for now as no storage service is configured)
    // In a real scenario, we would upload 'proof' to S3/Cloudinary and get a URL.
    const proofImageUrl = `https://cdn.elber-streaming.mz/proofs/${Date.now()}-${proof.name}`;

    const result = await createManualOrder({
      name,
      phone,
      planId: offer.id,
      paymentMethod,
      proofImageUrl,
    });

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/v1/orders/[id]/checkout failed:", error);
    return NextResponse.json({ error: "Failed to checkout order." }, { status: 500 });
  }
}
