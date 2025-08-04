import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import OrderDetails from "@/lib/models/OrderDetails";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/utils/email";
import { invoiceTemplate } from "@/lib/utils/email-templates";
import mongoose from "mongoose";

interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  language?: string;
}

// POST /api/orders/[id]/send-invoice - Send invoice email to customer
export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await context.params;
    const session = await getServerSession(authOptions);

    // Authentication check - only admin can send invoices
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

    // Find the order
    const order = await Order.findById(id).lean();

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Get user information
    const user = (await User.findById(order.userId)
      .select("email name language")
      .lean()) as UserDocument;

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    if (!user.email) {
      return NextResponse.json(
        { error: "User email not found" },
        { status: 400 }
      );
    }

    // Get detailed order items
    const orderDetails = await OrderDetails.findOne({
      paymentIntentId: order.paymentIntentId,
    });

    const items = orderDetails?.fullItems || order.items;

    // Generate invoice number (you can implement your own logic)
    const invoiceNumber = `INV-${order._id.toString().slice(-8).toUpperCase()}`;
    const invoiceDate = new Date().toLocaleDateString('en-GB');

    // Use template for invoice email
    const userLanguage = user.language || 'it'; // Default to Italian
    
    const { subject, text, html } = await invoiceTemplate({
      userName: user.name,
      orderId: order._id.toString(),
      amount: order.amount,
      items: items,
      invoiceNumber,
      invoiceDate,
      paymentMethod: "Credit Card", // You can make this dynamic based on payment method
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
        success: true,
        message: "Invoice sent successfully",
        invoiceNumber,
        sentTo: user.email,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error sending invoice:", error);
    return NextResponse.json(
      { error: "Failed to send invoice" },
      { status: 500 }
    );
  }
} 