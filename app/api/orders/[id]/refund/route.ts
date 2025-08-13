import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import Stripe from "stripe";
import mongoose from "mongoose";

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-06-30.basil",
});

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Authentication check - only admins can process refunds
    if (!session || !session.user || session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized access" },
        { status: 401 }
      );
    }

    const { id } = await params;
    const orderId = id;

    if (!orderId || !mongoose.Types.ObjectId.isValid(orderId)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    await connectDB();

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order is already refunded
    if (order.refunded) {
      return NextResponse.json(
        { error: "Order has already been refunded" },
        { status: 400 }
      );
    }

    const { paymentIntentId } = await req.json();

    if (!paymentIntentId) {
      return NextResponse.json(
        { error: "Payment intent ID is required" },
        { status: 400 }
      );
    }

    // Process the refund via Stripe
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
      });

      // Update order with refund information
      order.refunded = true;
      order.refundedAt = new Date();
      order.refundReference = refund.id;

      await order.save();

      return NextResponse.json(
        {
          message: "Refund processed successfully",
          order: JSON.parse(JSON.stringify(order)),
        },
        { status: 200 }
      );
    } catch (stripeError) {
      console.error("Stripe refund error:", stripeError);
      return NextResponse.json(
        {
          error: "Failed to process refund with payment provider",
          details:
            stripeError instanceof Error
              ? stripeError.message
              : "Unknown error",
        },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error processing refund:", error);
    return NextResponse.json(
      { error: "Failed to process refund" },
      { status: 500 }
    );
  }
}
