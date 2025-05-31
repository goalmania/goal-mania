import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import Stripe from "stripe";
import connectDB from "@/lib/db";
import OrderDetails from "@/lib/models/OrderDetails";

// Initialize Stripe with the secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
});

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

// This is a placeholder for actual Stripe integration
// In a real application, you would use the Stripe SDK to create a payment intent
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

    try {
      // Create a simplified version of cart items for metadata
      // Only include essential information to stay within the 500 character limit
      const simplifiedItems = items.map((item: CartItem) => ({
        id: item.id,
        qty: item.quantity,
        p: item.price,
      }));

      // Store full cart data in your database or session if needed
      // For Stripe metadata, just use the minimal representation
      const cartItemsString = JSON.stringify(simplifiedItems);

      // Simplified coupon data
      let couponString = "";
      if (coupon) {
        couponString = JSON.stringify({
          code: coupon.code,
          pct: coupon.discountPercentage,
        });
      }

      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(finalAmount * 100), // Convert to cents
        currency: "eur",
        payment_method_types: ["card"],
        metadata: {
          userId: session.user.id || "",
          addressId,
          items: cartItemsString,
          coupon: couponString,
          total: total.toString(),
          final: finalAmount.toString(),
        },
        setup_future_usage: "off_session",
      });

      // Store the full cart data with customizations in the database
      await connectDB();
      await OrderDetails.create({
        paymentIntentId: paymentIntent.id,
        fullItems: items.map((item: CartItem) => ({
          productId: item.id,
          name: item.name,
          price: item.price,
          quantity: item.quantity,
          customization: item.customization || {},
        })),
        userId: session.user.id,
        addressId,
        couponData: coupon
          ? {
              code: coupon.code,
              discountPercentage: coupon.discountPercentage,
              discountAmount: discountAmount,
            }
          : null,
      });

      return NextResponse.json({
        success: true,
        clientSecret: paymentIntent.client_secret,
        orderId: paymentIntent.id,
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
    console.error("Error creating checkout session:", error);
    return NextResponse.json(
      { error: "Failed to create checkout session" },
      { status: 500 }
    );
  }
}
