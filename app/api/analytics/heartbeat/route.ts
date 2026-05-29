import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import { ActiveSession } from "@/lib/models/Analytics";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      sessionId,
      page,
      pageTitle,
      referrer,
      cartItemCount,
      cartValue,
      isCheckingOut,
      device,
    } = body;

    if (!sessionId) {
      return NextResponse.json({ error: "sessionId required" }, { status: 400 });
    }

    await connectDB();

    await ActiveSession.findOneAndUpdate(
      { sessionId },
      {
        $set: {
          sessionId,
          page: page || "/",
          pageTitle: pageTitle || "",
          referrer: referrer || "",
          lastSeen: new Date(),
          cartItemCount: cartItemCount ?? 0,
          cartValue: cartValue ?? 0,
          isCheckingOut: isCheckingOut ?? false,
          device: device || "desktop",
          country: "IT",
        },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[analytics/heartbeat]", err);
    return NextResponse.json({ ok: false }, { status: 200 }); // don't break the site
  }
}
