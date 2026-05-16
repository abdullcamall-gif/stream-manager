import { ensureAdmin } from "@/app/api/admin/_auth";
import { renewAssignment } from "@/lib/services/renewal.service";
import { NextResponse } from "next/server";

export async function PATCH(request: Request, context: { params: Promise<{ id: string }> }) {
  const auth = await ensureAdmin(request, ["ADMIN", "SUPPORT"]);
  if (!auth.ok) return auth.response;

  const { id } = await context.params;
  const result = await renewAssignment(id, "ADMIN");
  if (!result.ok) {
    return NextResponse.json({ error: { message: result.error } }, { status: result.statusCode });
  }

  return NextResponse.json(result.data);
}
