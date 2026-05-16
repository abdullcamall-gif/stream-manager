import { ensureAdmin } from "@/app/api/admin/_auth";
import { prisma } from "@/lib/db";
import { createAccountAdmin, listAccountsAdmin } from "@/lib/services/admin-management.service";
import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const auth = await ensureAdmin(request);
  if (!auth.ok) return auth.response;
  return NextResponse.json(await listAccountsAdmin());
}

export async function POST(request: Request) {
  const auth = await ensureAdmin(request, ["ADMIN"]);
  if (!auth.ok) return auth.response;

  try {
    const body = (await request.json()) as {
      serviceId?: unknown;
      email?: unknown;
      password?: unknown;
      profileNames?: unknown;
      isActive?: unknown;
    };

    const payload = {
      serviceId: typeof body.serviceId === "string" ? body.serviceId.trim() : "",
      email: typeof body.email === "string" ? body.email : "",
      password: typeof body.password === "string" ? body.password : "",
      profileNames: Array.isArray(body.profileNames)
        ? body.profileNames.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
        : [],
      isActive: typeof body.isActive === "boolean" ? body.isActive : true,
    };

    if (!payload.serviceId || !payload.email || !payload.password || payload.profileNames.length === 0) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "invalid account payload" } },
        { status: 400 },
      );
    }

    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(payload.serviceId);
    const service = await prisma.streamingService.findFirst({
      where: {
        OR: [
          ...(isUuid ? [{ id: payload.serviceId }] : []),
          { slug: payload.serviceId.toLowerCase() },
          { name: payload.serviceId },
        ],
      },
      select: { id: true },
    });

    if (!service) {
      return NextResponse.json(
        { error: { code: "INVALID_INPUT", message: "service not found" } },
        { status: 400 },
      );
    }

    const created = await createAccountAdmin({
      ...payload,
      serviceId: service.id,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error) {
    console.error("POST /api/admin/accounts failed:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return NextResponse.json(
          { error: { code: "CONFLICT", message: "account already exists for this service" } },
          { status: 409 },
        );
      }
      if (error.code === "P2003") {
        return NextResponse.json(
          { error: { code: "INVALID_INPUT", message: "invalid service reference" } },
          { status: 400 },
        );
      }
    }

    const message = error instanceof Error ? error.message : "failed to save inventory account";
    return NextResponse.json(
      { error: { code: "INTERNAL_ERROR", message } },
      { status: 500 },
    );
  }
}


