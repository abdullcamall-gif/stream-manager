import { ensureAdmin } from "@/app/api/admin/_auth";
import { getOperationalMetrics } from "@/lib/services/admin-analytics.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await getOperationalMetrics());
}
