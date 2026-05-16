import { ensureAdmin } from "@/app/api/admin/_auth";
import { getAdminStats } from "@/lib/services/admin-management.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  try {
    const stats = await getAdminStats();
    return NextResponse.json(stats);
  } catch (error) {
    console.error("GET /api/admin/stats failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}

