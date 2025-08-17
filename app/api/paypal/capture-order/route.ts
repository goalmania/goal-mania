import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { orderID } = body;

    if (!orderID) {
      return NextResponse.json(
        { error: "Missing order ID" },
        { status: 400 }
      );
    }

    // PayPal API configuration
    const paypalMode = process.env.PAYPAL_MODE || "sandbox";
    const paypalBaseUrl = paypalMode === "live" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";

    // Debug logging
    console.log("PayPal capture API configuration:", {
      mode: paypalMode,
      baseUrl: paypalBaseUrl,
      clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID ? "✅ Set" : "❌ Missing",
      clientSecret: process.env.PAYPAL_CLIENT_SECRET ? "✅ Set" : "❌ Missing"
    });

    // Get access token
    const authResponse = await fetch(`${paypalBaseUrl}/v1/oauth2/token`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Basic ${Buffer.from(
          `${process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID}:${process.env.PAYPAL_CLIENT_SECRET}`
        ).toString("base64")}`,
      },
      body: "grant_type=client_credentials",
    });

    if (!authResponse.ok) {
      const errorText = await authResponse.text();
      console.error("PayPal capture auth error:", errorText);
      console.error("PayPal capture auth response status:", authResponse.status);
      console.error("PayPal capture auth response headers:", Object.fromEntries(authResponse.headers.entries()));
      return NextResponse.json(
        { error: "Failed to authenticate with PayPal", details: errorText },
        { status: 500 }
      );
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Capture the order
    const captureResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders/${orderID}/capture`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
    });

    if (!captureResponse.ok) {
      console.error("PayPal capture error:", await captureResponse.text());
      return NextResponse.json(
        { error: "Failed to capture PayPal payment" },
        { status: 500 }
      );
    }

    const captureResult = await captureResponse.json();

    // Check if payment was successful
    if (captureResult.status === "COMPLETED") {
      return NextResponse.json({
        success: true,
        transactionId: captureResult.purchase_units[0]?.payments?.captures?.[0]?.id,
        status: captureResult.status,
        captureData: captureResult,
      });
    } else {
      return NextResponse.json(
        { error: "Payment not completed", status: captureResult.status },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error("Error capturing PayPal order:", error);
    return NextResponse.json(
      { error: "Failed to capture PayPal order" },
      { status: 500 }
    );
  }
}
