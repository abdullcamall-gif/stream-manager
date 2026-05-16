import { NextResponse } from "next/server";
import { getWhatsAppLogs, retryFailedMessages } from "@/lib/services/whatsapp.service";

export async function GET() {
  try {
    const logs = await getWhatsAppLogs();
    return NextResponse.json(logs);
  } catch (error) {
    console.error("Failed to fetch WhatsApp logs:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const result = await retryFailedMessages();
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to retry WhatsApp messages:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
