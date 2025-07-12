/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import OrderDetails from "@/lib/models/OrderDetails";
import createMollieClient from "@mollie/api-client";

const mollie = createMollieClient({ apiKey: process.env.MOLLIE_API_KEY! });

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  customization?: any;
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

    // Calculate total and discount
    const total = items.reduce(
      (sum: number, item: CartItem) => sum + item.price * item.quantity,
      0
    );

    let finalAmount = total;
    let discountAmount = 0;

    if (coupon && coupon.discountPercentage) {
      discountAmount = (total * coupon.discountPercentage) / 100;
      finalAmount = total - discountAmount;
    }

    const simplifiedItems = items.map((item: CartItem) => ({
      id: item.id,
      qty: item.quantity,
      p: item.price,
    }));

    const cartItemsString = JSON.stringify(simplifiedItems);

    let couponString = "";
    if (coupon) {
      couponString = JSON.stringify({
        code: coupon.code,
        pct: coupon.discountPercentage,
      });
    }

    // Create Mollie payment
    const payment = await mollie.payments.create({
      amount: {
        value: finalAmount.toFixed(2),
        currency: "EUR",
      },
      description: "Your Order Checkout",
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/checkout/success`,
      webhookUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/mollie`,
      metadata: {
        userId: session.user.id,
        addressId,
        items: cartItemsString,
        coupon: couponString,
        total: total.toString(),
        final: finalAmount.toString(),
      },
    });

    // Store the order
    await connectDB();
    await OrderDetails.create({
      paymentIntentId: payment.id,
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

    console.log("payment: ", payment);

    return NextResponse.json({
      success: true,
      checkoutUrl: payment.getCheckoutUrl(),
      orderId: payment.id,
    });
  } catch (error) {
    console.error("Mollie API error:", error);
    return NextResponse.json(
      { error: "Failed to create Mollie payment" },
      { status: 500 }
    );
  }
}
