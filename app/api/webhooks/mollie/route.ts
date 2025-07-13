/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import createMollieClient from "@mollie/api-client";
import connectDB from "@/lib/db";
import OrderDetails from "@/lib/models/OrderDetails";
import Order from "@/models/Order";
import User from "@/lib/models/User";
import Product from "@/lib/models/Product";
import Address from "@/lib/models/Address";

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

export async function POST(req: NextRequest) {
  try {
    const body = await req.formData();
    const paymentId = body.get("id")?.toString();

    if (!paymentId) {
      return NextResponse.json(
        { error: "Missing payment ID" },
        { status: 400 }
      );
    }

    const payment = await mollie.payments.get(paymentId);

    if (payment.status !== "paid") {
      console.log(`Payment not completed: ${payment.status}`);
      return NextResponse.json(
        { message: "Payment not completed yet" },
        { status: 200 }
      );
    }

    await connectDB();

    type MollieMetadata = {
      userId: string;
      addressId: string;
      items: string;
      coupon?: string;
      total: string;
    };

    const {
      userId,
      addressId,
      items: rawItems,
      coupon: rawCoupon,
      total,
    } = payment.metadata as MollieMetadata;

    if (!userId || !addressId || !rawItems) {
      console.error("Missing metadata in payment:", payment.metadata);
      return NextResponse.json(
        { error: "Incomplete payment metadata" },
        { status: 400 }
      );
    }

    const items = JSON.parse(rawItems);
    const coupon = rawCoupon ? JSON.parse(rawCoupon) : null;

    const orderDetails = await OrderDetails.findOne({
      paymentIntentId: payment.id,
    });
    if (!orderDetails) {
      return NextResponse.json(
        { error: "Order details not found" },
        { status: 404 }
      );
    }

    const processedItems = orderDetails.fullItems.map((item: any) => {
      const processed = { ...item };
      if (processed.customization?.selectedPatches) {
        processed.customization.selectedPatches =
          processed.customization.selectedPatches.map((patch: any) => {
            if (typeof patch === "string") {
              return {
                id: patch,
                name: patch,
                image: `/patches/${patch}.png`,
              };
            }
            return patch;
          });
      }
      return processed;
    });

    const user = await User.findById(userId);
    const address = await Address.findOne({ _id: addressId, userId });

    if (!user || !address) {
      return NextResponse.json(
        { error: "User or address not found" },
        { status: 404 }
      );
    }

    for (const item of processedItems) {
      if (item.productId) {
        await Product.findByIdAndUpdate(
          item.productId,
          { $inc: { stockQuantity: -item.quantity } },
          { new: true }
        );
      }
    }

    const newOrder = new Order({
      userId,
      items: processedItems,
      amount: parseFloat(payment.amount.value),
      status: "paid",
      shippingAddress: {
        street: `${address.addressLine1}${
          address.addressLine2 ? ", " + address.addressLine2 : ""
        }`,
        city: address.city,
        state: address.state,
        postalCode: address.postalCode,
        country: address.country,
      },
      paymentIntentId: payment.id,
      coupon,
    });

    await newOrder.save();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Mollie webhook error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
