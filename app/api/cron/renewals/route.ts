import { NextResponse } from "next/server";
import { notifyRenewals, releaseExpiredProfiles } from "@/lib/services/renewal.service";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const [releaseResult, notifications] = await Promise.all([
      releaseExpiredProfiles(),
      notifyRenewals(),
    ]);

    return NextResponse.json({
      ok: true,
      releaseResult,
      notificationsSent: notifications.length,
    });
  } catch (error) {
    console.error("POST /api/cron/renewals failed:", error);
    return NextResponse.json({ ok: false, error: "Failed to process renewal cron job" }, { status: 500 });
  }
}
