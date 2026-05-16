import { ensureAdmin } from "@/app/api/admin/_auth";
import { listAdminOrders } from "@/lib/services/admin-management.service";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const orders = await listAdminOrders();
  return NextResponse.json(orders);
}

