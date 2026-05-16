import { NextResponse } from "next/server";
import { getInventoryStats } from "@/lib/services/inventory.service";

export async function GET() {
  try {
    const stats = await getInventoryStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("Failed to fetch inventory stats:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
