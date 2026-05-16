import { ensureAdmin } from "@/app/api/admin/_auth";
import { getTopServicesAnalytics } from "@/lib/services/admin-analytics.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const limitRaw = Number(searchParams.get("limit") ?? 5);
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.min(20, Math.floor(limitRaw)) : 5;

  return NextResponse.json(await getTopServicesAnalytics(limit));
}
