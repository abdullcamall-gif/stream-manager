import { ensureAdmin } from "@/app/api/admin/_auth";
import { getMonthlyMetricsAnalytics } from "@/lib/services/admin-analytics.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const monthsRaw = Number(searchParams.get("months") ?? 6);
  const timeZone = searchParams.get("tz") || "Africa/Maputo";
  const months = Number.isFinite(monthsRaw) && monthsRaw > 0 ? Math.min(24, Math.floor(monthsRaw)) : 6;

  return NextResponse.json(await getMonthlyMetricsAnalytics(months, timeZone));
}
