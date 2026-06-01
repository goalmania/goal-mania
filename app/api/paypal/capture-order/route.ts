export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

async function getPayPalAccessToken(): Promise<string> {
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!;
  const secret = process.env.PAYPAL_CLIENT_SECRET!;

  const res = await fetch(`${PAYPAL_BASE_URL}/v1/oauth2/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${clientId}:${secret}`).toString("base64")}`,
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`PayPal auth failed: ${err}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function POST(req: NextRequest) {
  try {
    const { orderID } = await req.json();

    if (!orderID) {
      return NextResponse.json({ error: "orderID mancante" }, { status: 400 });
    }

    const accessToken = await getPayPalAccessToken();

    const captureRes = await fetch(
      `${PAYPAL_BASE_URL}/v2/checkout/orders/${orderID}/capture`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!captureRes.ok) {
      const errText = await captureRes.text();
      console.error("PayPal capture error:", errText);
      return NextResponse.json({ error: "Errore conferma PayPal", details: errText }, { status: 500 });
    }

    const result = await captureRes.json();

    if (result.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        transactionId: result.purchase_units?.[0]?.payments?.captures?.[0]?.id,
        status: result.status,
      });
    }

    return NextResponse.json({ error: "Pagamento non completato", status: result.status }, { status: 400 });
  } catch (error) {
    console.error("PayPal capture:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore PayPal" },
      { status: 500 }
    );
  }
}
