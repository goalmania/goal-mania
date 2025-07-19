/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import Order from "@/models/Order";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Address from "@/lib/models/Address";
import OrderDetails from "@/lib/models/OrderDetails";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/utils/email";
import { orderConfirmationTemplate } from "@/lib/utils/email-templates";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: "2025-06-30.basil",
});

const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET!;

interface AddressType {
  _id: mongoose.Types.ObjectId;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  language?: string;
}

// Define an interface for the item structure
interface OrderItem {
  productId?: string;
  name: string;
  price: number;
  quantity: number;
  customization?: {
    selectedPatches?: Array<
      string | { id: string; name: string; image: string; price?: number }
    >;
    [key: string]: any;
  };
  [key: string]: any;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const signature = req.headers.get("stripe-signature")!;

    let event: Stripe.Event;

    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error";
      console.error(`Webhook signature verification failed: ${errorMessage}`);
      return new NextResponse(`Webhook Error: ${errorMessage}`, {
        status: 400,
      });
    }

    // Handle the event based on its type
    if (event.type === "payment_intent.succeeded") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await handleSuccessfulPayment(paymentIntent);
    } else if (event.type === "payment_intent.payment_failed") {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      console.log(`Payment failed: ${paymentIntent.id}`);
      // Could implement additional handling for failed payments
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Webhook error:", error);
    return NextResponse.json(
      { message: "Internal server error" },
      { status: 500 }
    );
  }
}

// Helper function to handle successful payments
async function handleSuccessfulPayment(paymentIntent: Stripe.PaymentIntent) {
  try {
    // Connect to the database
    await connectDB();

    // Extract metadata from the payment intent
    const { userId, addressId } = paymentIntent.metadata || {};

    if (!userId || !addressId) {
      console.error(
        "Missing required metadata in payment intent",
        paymentIntent.metadata
      );
      return;
    }

    // Get the full order details from our database
    const orderDetails = await OrderDetails.findOne({
      paymentIntentId: paymentIntent.id,
    });

    if (!orderDetails) {
      console.error(
        "Order details not found for payment intent:",
        paymentIntent.id
      );
      return;
    }

    // Get items with full customization details
    const items = orderDetails.fullItems;

    // Process items to ensure proper format for selectedPatches
    const processedItems = items.map((item: OrderItem) => {
      // Deep clone the item to avoid mutations
      const processedItem = JSON.parse(JSON.stringify(item));

      // If customization exists and has selectedPatches
      if (
        processedItem.customization &&
        processedItem.customization.selectedPatches
      ) {
        // If selectedPatches is an array of strings, convert to proper objects
        processedItem.customization.selectedPatches =
          processedItem.customization.selectedPatches.map(
            (
              patch:
                | string
                | { id: string; name: string; image: string; price?: number }
            ) => {
              if (typeof patch === "string") {
                return {
                  id: patch,
                  name: patch,
                  image: `/patches/${patch}.png`,
                };
              }
              return patch;
            }
          );
      }

      return processedItem;
    });

    // Get coupon data
    const coupon = orderDetails.couponData;

    // Get user information
    const user = (await User.findById(userId)) as UserDocument;
    if (!user) {
      console.error("User not found:", userId);
      return;
    }

    // Get address directly from Address model
    const address = await Address.findOne({ _id: addressId, userId });
    if (!address) {
      console.error("Address not found for user:", addressId);
      return;
    }

    // Update product stock quantities
    for (const item of processedItems) {
      if (item.productId) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity } },
          { new: true }
        );
      }
    }

    // Create new order
    const newOrder = new Order({
      userId,
      items: processedItems,
      amount: paymentIntent.amount / 100, // Convert from cents to dollars/euros
      status: "pending", // Default status is pending
      shippingAddress: {
        street:
          address.addressLine1 +
          (address.addressLine2 ? `, ${address.addressLine2}` : ""),
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      paymentIntentId: paymentIntent.id,
      coupon: coupon,
    });

    await newOrder.save();
    console.log("Order created successfully:", newOrder._id);

    // Send order confirmation email
    if (user && user.email) {
      // Get user's preferred language (you can add this to user model later)
      const userLanguage = user.language || 'it'; // Default to Italian
      
      const { subject, text, html } = await orderConfirmationTemplate({
        userName: user.name,
        orderId: newOrder._id.toString(),
        amount: newOrder.amount,
        items: processedItems,
        language: userLanguage as 'it' | 'en',
      });
      await sendEmail({
        to: user.email,
        subject,
        text,
        html,
      });
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
    // Log the payment intent ID for debugging
    console.error("Failed payment intent ID:", paymentIntent.id);
  }
}
