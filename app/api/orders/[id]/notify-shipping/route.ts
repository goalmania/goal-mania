import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order, { IOrder } from "@/models/Order";
import User from "@/lib/models/User";
import mongoose from "mongoose";
import { sendEmail } from "@/lib/utils/email";
import { shippingNotificationTemplate } from "@/lib/utils/email-templates";

interface UserDocument {
  email: string;
  name: string;
  _id: string;
  language?: string;
}

// POST /api/orders/[id]/notify-shipping - Send shipping notification to user
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    // Authentication check - only admin can send notifications
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    await connectDB();

    // Find the order and cast to the correct type
    const order = (await Order.findById(id).lean()) as unknown as IOrder;

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if order has tracking code and is shipped
    if (!order.trackingCode || order.status !== "shipped") {
      return NextResponse.json(
        { error: "Order must be shipped and have a tracking code" },
        { status: 400 }
      );
    }

    // Get user email and language preference (convert safely)
    const userDoc = await User.findById(order.userId).select(
      "email name language"
    );
    const user = userDoc ? (userDoc.toObject() as unknown as UserDocument) : null;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Use template for shipping notification email
    const userLanguage = user.language || 'it'; // Default to Italian
    
    const { subject, text, html } = await shippingNotificationTemplate({
      userName: user.name,
      orderId: String(order._id),
      trackingCode: order.trackingCode,
      items: order.items,
      language: userLanguage as 'it' | 'en',
    });
    await sendEmail({
      to: user.email,
      subject,
      text,
      html,
    });

    return NextResponse.json(
      {
        message: "Shipping notification sent successfully",
        sentTo: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending shipping notification:", error);
    return NextResponse.json(
      { error: "Failed to send shipping notification" },
      { status: 500 }
    );
  }
}
