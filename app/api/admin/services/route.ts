import { NextResponse } from "next/server";
import { ensureAdmin } from "../_auth";
import { AdminServicesService } from "@/lib/services/admin-services.service";
import { createServiceWithOffers } from "@/lib/services/admin-management.service";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;

  try {
    const services = await AdminServicesService.getServices();
    return NextResponse.json(services);
  } catch (error) {
    console.error("GET /api/admin/services error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const auth = await ensureAdmin(request, ["ADMIN"]); // Protect with ADMIN role
  if (!auth.ok) return auth.response;

  try {
    const body = await request.json();
    if (!body.name || !body.slug) {
      return NextResponse.json({ error: "Name and slug are required" }, { status: 400 });
    }
    const durations = Array.isArray(body.durations) ? body.durations.map((item: unknown) => Number(item)).filter((item: number) => item > 0) : [];
    const profileNames = Array.isArray(body.profileNames) ? body.profileNames.filter((item: unknown): item is string => typeof item === "string" && item.trim().length > 0) : [];
    const hasInventoryPayload = durations.length > 0 && body.price && body.accountEmail && body.accountPassword && profileNames.length > 0;

    const service = hasInventoryPayload
      ? await createServiceWithOffers({
          name: String(body.name),
          slug: String(body.slug),
          logoUrl: typeof body.logoUrl === "string" ? body.logoUrl : undefined,
          bannerUrl: typeof body.bannerUrl === "string" ? body.bannerUrl : undefined,
          isActive: typeof body.isActive === "boolean" ? body.isActive : true,
          durations,
          price: Number(body.price),
          accountEmail: String(body.accountEmail),
          accountPassword: String(body.accountPassword),
          profileNames,
        })
      : await AdminServicesService.createService({
          name: body.name,
          slug: body.slug,
          logoUrl: body.logoUrl,
          bannerUrl: body.bannerUrl,
          isActive: body.isActive,
        });

    return NextResponse.json(service);
  } catch (error) {
    console.error("POST /api/admin/services error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
