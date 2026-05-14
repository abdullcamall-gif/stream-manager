import { ensureAdmin } from "@/app/api/admin/_auth";
import { rejectOrder } from "@/lib/services/admin-management.service";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) {
    return auth.response;
  }

  const { id } = await context.params;
  const result = await rejectOrder(id);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: result.statusCode });
  }

  return NextResponse.json(result.data);
}


