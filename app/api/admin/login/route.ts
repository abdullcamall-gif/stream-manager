import { loginAdmin } from "@/lib/services";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { email?: unknown; password?: unknown };
    const result = await loginAdmin(
      typeof body.email === "string" ? body.email : "",
      typeof body.password === "string" ? body.password : "",
    );

    if (!result.ok) {
      return NextResponse.json({ error: result.error }, { status: result.statusCode });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("POST /api/admin/login failed:", error);
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "invalid request body" } },
      { status: 400 },
    );
  }
}
