import { NextResponse } from "next/server";
import { getLowStockServices } from "@/lib/services/inventory.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const threshold = parseInt(searchParams.get("threshold") || "3", 10);

  try {
    const lowStock = await getLowStockServices(threshold);
    return NextResponse.json(lowStock);
  } catch (error) {
    console.error("Failed to fetch low stock services:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
