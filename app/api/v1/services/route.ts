import { listCatalogServices } from "@/lib/services";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const services = await listCatalogServices();
    return NextResponse.json(services);
  } catch (error) {
    console.error("GET /api/v1/services failed:", error);
    return NextResponse.json(
      { error: "Failed to load services." },
      { status: 500 },
    );
  }
}
