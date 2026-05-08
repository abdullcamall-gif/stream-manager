import { ensureAdmin } from "@/app/api/admin/_auth";
import { listAdminOrders } from "@/lib/services";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = ensureAdmin(request);
  if (!auth.ok) {
    return auth.response;
  }

  const orders = await listAdminOrders();
  return NextResponse.json(orders);
}
