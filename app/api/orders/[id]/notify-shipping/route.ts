import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order, { IOrder } from "@/models/Order";
import User from "@/lib/models/User";
import mongoose from "mongoose";

interface UserDocument {
  email: string;
  name: string;
  _id: string;
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

    // Get user email
    const user = (await User.findById(order.userId)
      .select("email name")
      .lean()) as unknown as UserDocument;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // In a real application, you would send an actual email here
    // For now, we'll just simulate it

    console.log(`Sending shipping notification email to ${user.email}`);
    console.log(`Order ID: ${order._id}`);
    console.log(`Tracking Number: ${order.trackingCode}`);

    // In a real app, you would use a service like SendGrid, AWS SES, etc.
    // Example:
    // await sendEmail({
    //   to: user.email,
    //   subject: "Your Order Has Been Shipped!",
    //   text: `Your order #${order._id} has been shipped! Track your package with tracking number: ${order.trackingCode}`,
    //   html: `<p>Your order #${order._id} has been shipped!</p><p>Track your package with tracking number: <strong>${order.trackingCode}</strong></p>`
    // });

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
