export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

const SCALAPAY_API_URL = process.env.SCALAPAY_MODE === "production"
  ? "https://api.scalapay.com"
  : "https://staging.api.scalapay.com";

const SCALAPAY_API_KEY = process.env.SCALAPAY_API_KEY || "";

export async function POST(req: NextRequest) {
  try {
    if (!SCALAPAY_API_KEY) {
      return NextResponse.json({ error: "Scalapay non configurato" }, { status: 503 });
    }

    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { items, totalAmount, guestEmail, shippingAddress } = body;

    const origin = req.headers.get("origin") || "https://goal-mania.it";

    const scalapayPayload = {
      totalAmount: {
        amount: totalAmount.toFixed(2),
        currency: "EUR",
      },
      consumer: {
        email: guestEmail || session?.user?.email || "",
        givenNames: shippingAddress?.fullName?.split(" ")[0] || "",
        surname: shippingAddress?.fullName?.split(" ").slice(1).join(" ") || "",
        phoneNumber: shippingAddress?.phone || "",
      },
      billing: {
        name: shippingAddress?.fullName || "",
        line1: shippingAddress?.addressLine1 || "",
        line2: shippingAddress?.addressLine2 || "",
        suburb: shippingAddress?.city || "",
        postcode: shippingAddress?.postalCode || "",
        countryCode: "IT",
        phoneNumber: shippingAddress?.phone || "",
      },
      shipping: {
        name: shippingAddress?.fullName || "",
        line1: shippingAddress?.addressLine1 || "",
        line2: shippingAddress?.addressLine2 || "",
        suburb: shippingAddress?.city || "",
        postcode: shippingAddress?.postalCode || "",
        countryCode: "IT",
        phoneNumber: shippingAddress?.phone || "",
      },
      items: items.map((item: any) => ({
        name: item.name,
        category: "Abbigliamento",
        subcategory: ["Maglie da calcio"],
        brand: "Goal Mania",
        gtin: item.id,
        sku: item.id,
        quantity: item.quantity,
        price: {
          amount: item.price.toFixed(2),
          currency: "EUR",
        },
      })),
      merchant: {
        redirectConfirmUrl: `${origin}/checkout/scalapay-confirm?status=success`,
        redirectCancelUrl: `${origin}/checkout/scalapay-confirm?status=cancel`,
        name: "Goal Mania",
      },
      merchantReference: `GM-${Date.now()}`,
    };

    const response = await fetch(`${SCALAPAY_API_URL}/v2/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
        Authorization: `Bearer ${SCALAPAY_API_KEY}`,
      },
      body: JSON.stringify(scalapayPayload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Scalapay error:", data);
      return NextResponse.json(
        { error: data.message || "Errore Scalapay" },
        { status: response.status }
      );
    }

    return NextResponse.json({
      token: data.token,
      checkoutUrl: data.checkoutUrl,
      expires: data.expires,
    });
  } catch (error) {
    console.error("Scalapay create-order error:", error);
    return NextResponse.json({ error: "Errore interno" }, { status: 500 });
  }
}
