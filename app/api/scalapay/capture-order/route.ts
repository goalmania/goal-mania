export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const SCALAPAY_API_URL = process.env.SCALAPAY_MODE === "production"
  ? "https://api.scalapay.com"
  : "https://staging.api.scalapay.com";

const SCALAPAY_API_KEY = process.env.SCALAPAY_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json({ error: "Token mancante" }, { status: 400 });
    }

    const response = await fetch(`${SCALAPAY_API_URL}/v2/payments/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${SCALAPAY_API_KEY}`,
      },
      body: JSON.stringify({ token }),
    });

    const data = await response.json();

    if (!response.ok) {
      return NextResponse.json(
        { error: data.message || "Errore capture Scalapay" },
        { status: response.status }
      );
    }

    return NextResponse.json({ success: true, status: data.status, reference: data.merchantReference });
  } catch (error) {
    console.error("Scalapay capture error:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
