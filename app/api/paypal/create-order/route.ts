export const dynamic = "force-dynamic";

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Address from "@/lib/models/Address";
import { priceOrder, PricingError } from "@/lib/serverPricing";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
}

const PAYPAL_BASE_URL =
  process.env.PAYPAL_MODE === "live"
    ? "https://api-m.paypal.com"
    : "https://api-m.sandbox.paypal.com";

const APP_URL = process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it";

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
    let session = null;
    try { session = await getServerSession(authOptions); } catch {}
    const body = await req.json();
    const { items, addressId, coupon, discountRules, guestEmail, guestAddress } = body;

    if (!items?.length) {
      return NextResponse.json({ error: "Nessun articolo nel carrello" }, { status: 400 });
    }

    const isGuest = !session?.user;

    // Recupera indirizzo
    let shippingName = "";
    if (guestAddress) {
      shippingName = guestAddress.fullName || "";
    } else if (addressId) {
      await connectDB();
      const address = await Address.findById(addressId);
      shippingName = address?.fullName || "";
    }

    // Importi dal server: prezzi, coupon e sconti non arrivano mai dal browser
    let priced;
    try {
      priced = await priceOrder({ items, coupon, discountRules });
    } catch (e) {
      if (e instanceof PricingError) return NextResponse.json({ error: e.message }, { status: 400 });
      throw e;
    }
    const subtotal = priced.subtotal;
    const discountAmount = priced.couponDiscount + priced.rulesDiscount;
    const finalAmount = priced.total;
    const pricedItems = priced.items as CartItem[];

    // Ref ordine
    const reference = `GM-${Date.now()}`;

    console.log("[PayPal] mode:", process.env.PAYPAL_MODE, "url:", PAYPAL_BASE_URL, "clientId set:", !!process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID, "secret set:", !!process.env.PAYPAL_CLIENT_SECRET);
    const accessToken = await getPayPalAccessToken();

    const orderPayload = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: reference,
          description: `Goal Mania — ${items.length} articolo/i`,
          custom_id: reference,
          amount: {
            currency_code: "EUR",
            value: finalAmount.toFixed(2),
            breakdown: {
              item_total: { currency_code: "EUR", value: subtotal.toFixed(2) },
              discount: { currency_code: "EUR", value: discountAmount.toFixed(2) },
            },
          },
          items: pricedItems.map((item: CartItem) => ({
            name: item.name.substring(0, 127),
            unit_amount: { currency_code: "EUR", value: item.price.toFixed(2) },
            quantity: item.quantity.toString(),
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
      application_context: {
        brand_name: "Goal Mania",
        landing_page: "LOGIN",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING",
        return_url: `${APP_URL}/checkout/success?payment_method=paypal`,
        cancel_url: `${APP_URL}/checkout?canceled=true`,
      },
    };

    const orderRes = await fetch(`${PAYPAL_BASE_URL}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderPayload),
    });

    if (!orderRes.ok) {
      const errText = await orderRes.text();
      console.error("PayPal create-order error:", errText);
      return NextResponse.json({ error: "Errore creazione ordine PayPal", details: errText }, { status: 500 });
    }

    const result = await orderRes.json();
    return NextResponse.json({ success: true, orderID: result.id });
  } catch (error) {
    console.error("PayPal create-order:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Errore PayPal" },
      { status: 500 }
    );
  }
}
