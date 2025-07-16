import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-06-30.basil",
});

interface CartItem {
  productId: string;
  quantity: number;
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { amount, currency = "eur", addressId, items } = body;

    if (!amount || !addressId || !items) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    try {
      // Stringify cart items to store in metadata
      const cartItemsString = JSON.stringify(
        items.map((item: CartItem) => ({
          productId: item.productId,
          quantity: item.quantity,
        }))
      );

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100),
        currency,
        payment_method_types: ["card", "apple_pay", "google_pay"],
        metadata: {
          userId: session.user.id || "",
          addressId,
          cartItems: cartItemsString,
        },
        setup_future_usage: "off_session",
      });

      return NextResponse.json({
        clientSecret: paymentIntent.client_secret,
      });
    } catch (error) {
      console.error("Stripe API error:", error);
      return NextResponse.json(
        {
          error: "Failed to create payment intent",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return NextResponse.json(
      { error: "Failed to create payment intent", details: error },
      { status: 500 }
    );
  }
}
