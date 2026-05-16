import { NextResponse } from "next/server";
import { ensureAdmin } from "../../_auth";
import { AdminServicesService } from "@/lib/services/admin-services.service";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    const body = await request.json();

    const service = await AdminServicesService.updateService(id, {
      name: body.name,
      slug: body.slug,
      logoUrl: body.logoUrl,
      bannerUrl: body.bannerUrl,
      isActive: body.isActive,
    });

    return NextResponse.json(service);
  } catch (error) {
    console.error("PATCH /api/admin/services/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  try {
    const { id } = await params;
    await AdminServicesService.deleteService(id);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("DELETE /api/admin/services/[id] error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
