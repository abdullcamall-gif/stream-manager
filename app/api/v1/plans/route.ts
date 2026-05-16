import { listCatalogPlans } from "@/lib/services/catalog.service";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const plans = await listCatalogPlans();
    return NextResponse.json(
      plans.map((plan) => ({
        id: plan.id,
        serviceId: plan.serviceId,
        name: plan.name,
        price: plan.price,
        durationInDays: plan.durationInDays,
        maxSlots: plan.maxSlots,
        isShared: plan.isShared,
      })),
    );
  } catch (error) {
    console.error("GET /api/v1/plans failed:", error);
    return NextResponse.json(
      { error: "Failed to load plans." },
      { status: 500 },
    );
  }
}

