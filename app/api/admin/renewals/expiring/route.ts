import { ensureAdmin } from "@/app/api/admin/_auth";
import { NextResponse } from "next/server";
import { listExpiringAssignments } from "@/lib/services/renewal.service";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;

  const { searchParams } = new URL(request.url);
  const days = Number(searchParams.get("days") ?? 3);
  const result = await listExpiringAssignments(Number.isFinite(days) && days > 0 ? days : 3);
  return NextResponse.json(result);
}
