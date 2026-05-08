import { listOrdersByPhone } from "@/lib/services";
import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const phone = searchParams.get("phone") ?? "";

    const result = await listOrdersByPhone(phone);

    if (!result.ok) {
      return NextResponse.json(
        {
          error: result.error,
        },
        { status: result.statusCode },
      );
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("GET /api/v1/orders/by-phone failed:", error);
    return NextResponse.json(
      { error: "Failed to fetch orders." },
      { status: 500 },
    );
  }
}
