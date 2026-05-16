import { NextResponse } from "next/server";
import { sendExpirationReminders } from "@/lib/services/cx.service";

export async function POST() {
  try {
    const result = await sendExpirationReminders();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to send expiration reminders:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
