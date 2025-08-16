import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Address from "@/lib/models/Address";

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: {
    name?: string;
    number?: string;
    selectedPatches?: Array<{
      id: string;
      name: string;
      image: string;
      price?: number;
    }>;
    includeShorts?: boolean;
    includeSocks?: boolean;
    isPlayerEdition?: boolean;
    size?: string;
    isKidSize?: boolean;
    hasCustomization?: boolean;
  };
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { items, addressId, coupon } = body;

    if (!items || !items.length || !addressId) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // Calculate total amount
    const total = items.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );

    // Apply coupon discount if available
    let finalAmount = total;
    let discountAmount = 0;

    if (coupon && coupon.discountPercentage) {
      discountAmount = (total * coupon.discountPercentage) / 100;
      finalAmount = total - discountAmount;
    }

    // Fetch address details
    await connectDB();
    const address = await Address.findById(addressId);
    
    if (!address) {
      return NextResponse.json(
        { error: "Address not found" },
        { status: 400 }
      );
    }

    console.log("Address found:", {
      fullName: address.fullName,
      city: address.city,
      country: address.country,
      postalCode: address.postalCode
    });

    // PayPal API configuration
    const paypalMode = process.env.PAYPAL_MODE || "sandbox";
    const paypalBaseUrl = paypalMode === "live" 
      ? "https://api-m.paypal.com" 
      : "https://api-m.sandbox.paypal.com";

    // Debug logging
    console.log("PayPal API configuration:", {
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
      console.error("PayPal auth error:", errorText);
      console.error("PayPal auth response status:", authResponse.status);
      console.error("PayPal auth response headers:", Object.fromEntries(authResponse.headers.entries()));
      return NextResponse.json(
        { error: "Failed to authenticate with PayPal", details: errorText },
        { status: 500 }
      );
    }

    const authData = await authResponse.json();
    const accessToken = authData.access_token;

    // Create PayPal order
    const orderData = {
      intent: "CAPTURE",
      purchase_units: [
        {
          reference_id: `order_${Date.now()}_${session.user.id}`,
          description: `Goal Mania Order - ${items.length} item(s)`,
          custom_id: JSON.stringify({
            userId: session.user.id,
            addressId,
            items: items.map((item: CartItem) => ({
              id: item.id,
              qty: item.quantity,
              price: item.price,
            })),
            coupon: coupon ? {
              code: coupon.code,
              discountPercentage: coupon.discountPercentage,
              discountAmount: discountAmount,
            } : null,
            total: total,
            final: finalAmount,
          }),
          amount: {
            currency_code: "EUR",
            value: finalAmount.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "EUR",
                value: finalAmount.toFixed(2),
              },
            },
          },
          items: items.map((item: CartItem) => ({
            name: item.name,
            unit_amount: {
              currency_code: "EUR",
              value: item.price.toFixed(2),
            },
            quantity: item.quantity.toString(),
            category: "PHYSICAL_GOODS",
          })),
        },
      ],
      application_context: {
        return_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success?payment_method=paypal`,
        cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/checkout?canceled=true`,
        brand_name: "Goal Mania",
        landing_page: "BILLING",
        user_action: "PAY_NOW",
        shipping_preference: "NO_SHIPPING", // Changed from SET_PROVIDED_ADDRESS
      },
    };

    const orderResponse = await fetch(`${paypalBaseUrl}/v2/checkout/orders`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${accessToken}`,
      },
      body: JSON.stringify(orderData),
    });

    if (!orderResponse.ok) {
      const errorText = await orderResponse.text();
      console.error("PayPal order creation error:", errorText);
      console.error("PayPal order creation response status:", orderResponse.status);
      console.error("PayPal order creation response headers:", Object.fromEntries(orderResponse.headers.entries()));
      console.error("PayPal order data sent:", JSON.stringify(orderData, null, 2));
      return NextResponse.json(
        { error: "Failed to create PayPal order", details: errorText },
        { status: 500 }
      );
    }

    const orderResult = await orderResponse.json();

    return NextResponse.json({
      success: true,
      orderID: orderResult.id,
      approvalUrl: orderResult.links.find((link: any) => link.rel === "approve")?.href,
    });

  } catch (error) {
    console.error("Error creating PayPal order:", error);
    return NextResponse.json(
      { error: "Failed to create PayPal order" },
      { status: 500 }
    );
  }
}
