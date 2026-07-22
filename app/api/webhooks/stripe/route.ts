export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextRequest, NextResponse } from "next/server";
import Stripe from "stripe";
import { getStripe } from "@/lib/stripe";
import Order from "@/models/Order";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Address from "@/lib/models/Address";
import OrderDetails from "@/lib/models/OrderDetails";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/utils/email";
import { orderConfirmationTemplate, invoiceTemplate } from "@/lib/utils/email-templates";

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
      const stripe = getStripe();
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
    await connectDB();

    const { userId, addressId, guestEmail } = paymentIntent.metadata || {};

    if (!userId || !addressId) {
      console.error("Missing required metadata in payment intent", paymentIntent.metadata);
      return;
    }

    const isGuest = userId === "guest" || addressId === "guest";

    const orderDetails = await OrderDetails.findOne({ paymentIntentId: paymentIntent.id });
    if (!orderDetails) {
      console.error("Order details not found for payment intent:", paymentIntent.id);
      return;
    }

    const items = orderDetails.fullItems;

    const processedItems = items.map((item: OrderItem) => {
      const processedItem = JSON.parse(JSON.stringify(item));
      if (processedItem.customization?.selectedPatches) {
        processedItem.customization.selectedPatches =
          processedItem.customization.selectedPatches.map(
            (patch: string | { id: string; name: string; image: string; price?: number }) => {
              if (typeof patch === "string") {
                return { id: patch, name: patch, image: `/patches/${patch}.png` };
              }
              return patch;
            }
          );
      }
      return processedItem;
    });

    const coupon = orderDetails.couponData;

    // Resolve user/address differently for guest vs registered
    let userEmail: string | null = null;
    let userName: string | undefined;
    let userLanguage = "it";
    let shippingAddress: Record<string, string>;

    if (isGuest) {
      const guestAddr = orderDetails.guestAddress;
      userEmail = orderDetails.guestEmail || guestEmail || null;
      userName = guestAddr?.fullName;
      shippingAddress = guestAddr
        ? {
            street: guestAddr.addressLine1 + (guestAddr.addressLine2 ? `, ${guestAddr.addressLine2}` : ""),
            city: guestAddr.city || "",
            state: guestAddr.state || "",
            postalCode: guestAddr.postalCode || "",
            country: guestAddr.country || "",
            fullName: guestAddr.fullName || "",
            phone: guestAddr.phone || "",
          }
        : { street: "", city: "", state: "", postalCode: "", country: "", fullName: "", phone: "" };
      if (!guestAddr) {
        console.error("Guest address not found in order details — creating order anyway with empty shipping info:", paymentIntent.id);
      }
    } else {
      const userDoc = await User.findById(userId).select("email name language");
      const user = userDoc ? (userDoc.toObject() as unknown as UserDocument) : null;
      userEmail = user?.email ?? null;
      userName = user?.name;
      userLanguage = user?.language || "it";
      if (!user) {
        console.error("User not found — creating order anyway:", userId);
      }

      // Preferisce lo snapshot salvato al momento del checkout: l'indirizzo
      // live puo' essere stato modificato o eliminato nel frattempo.
      const snapshot = orderDetails.addressSnapshot;
      const address = snapshot || (await Address.findOne({ _id: addressId, userId }).lean() as AddressType | null);
      if (!address) {
        console.error("Address not found for user — creating order anyway with empty shipping info:", addressId);
      }
      shippingAddress = address
        ? {
            street: address.addressLine1 + (address.addressLine2 ? `, ${address.addressLine2}` : ""),
            city: address.city,
            state: address.state,
            postalCode: address.postalCode,
            country: address.country,
          }
        : { street: "", city: "", state: "", postalCode: "", country: "" };
    }

    const newOrder = new Order({
      userId: isGuest ? null : userId,
      guestEmail: isGuest ? userEmail : null,
      items: processedItems,
      amount: paymentIntent.amount / 100,
      status: "pending",
      shippingAddress,
      paymentIntentId: paymentIntent.id,
      coupon,
    });

    await newOrder.save();
    console.log("Order created successfully:", newOrder._id, isGuest ? "(guest)" : "(user)");

    // Aggiorna lo stock DOPO aver salvato l'ordine: un pagamento riuscito non
    // deve mai andare perso per un errore di decremento scorte. item.productId
    // e' l'id del carrello (productId_hashPersonalizzazione per gli articoli
    // personalizzati) — va ripulito dell'eventuale suffisso prima di usarlo
    // come ObjectId, altrimenti Mongoose lancia un CastError.
    for (const item of processedItems) {
      if (item.productId) {
        try {
          const cleanProductId = item.productId.split("_")[0];
          await Product.findByIdAndUpdate(
            cleanProductId,
            { $inc: { stockQuantity: -item.quantity } },
            { new: true }
          );
        } catch (stockError) {
          console.error("Errore aggiornamento stock per", item.productId, stockError);
        }
      }
    }

    if (userEmail) {
      try {
        const { subject, text, html } = await orderConfirmationTemplate({
          userName,
          orderId: newOrder._id.toString(),
          amount: newOrder.amount,
          items: processedItems,
          language: userLanguage as "it" | "en",
        });
        await sendEmail({ to: userEmail, subject, text, html });
        console.log(`Order confirmation email sent to ${userEmail}`);
      } catch (emailError) {
        console.error("Error sending confirmation email:", emailError);
      }

      try {
        const invoiceNumber = `INV-${newOrder._id.toString().slice(-8).toUpperCase()}`;
        const invoiceDate = new Date().toLocaleDateString("en-GB");
        const { subject, text, html } = await invoiceTemplate({
          userName,
          orderId: newOrder._id.toString(),
          amount: newOrder.amount,
          items: processedItems,
          invoiceNumber,
          invoiceDate,
          paymentMethod: "Credit Card",
          language: userLanguage as "it" | "en",
        });
        await sendEmail({ to: userEmail, subject, text, html });
        console.log(`Invoice email sent to ${userEmail}`);
      } catch (invoiceError) {
        console.error("Error sending invoice email:", invoiceError);
      }
    }
  } catch (error) {
    console.error("Error handling successful payment:", error);
    console.error("Failed payment intent ID:", paymentIntent.id);
  }
}
