import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import OrderDetails from "@/lib/models/OrderDetails";
import User from "@/lib/models/User";
import { sendEmail } from "@/lib/utils/email";
import { orderStatusUpdateTemplate, shippingNotificationTemplate } from "@/lib/utils/email-templates";
import mongoose from "mongoose";

// Type for order with necessary properties
interface OrderType {
  _id: string;
  userId: string;
  status: string;
  [key: string]: any;
}

interface UserDocument {
  _id: mongoose.Types.ObjectId;
  email: string;
  name?: string;
  language?: string;
}

// GET /api/orders/[id] - Get order by ID
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const orderId = id;

    if (!orderId) {
      return NextResponse.json(
        { error: "Order ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Get the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if user has permission to view this order
    if (order.userId.toString() !== session.user.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    // Get detailed customization data if available
    const orderDetails = await OrderDetails.findOne({
      paymentIntentId: order.paymentIntentId,
    });

    // Combine order with detailed customization data
    const fullOrderData = {
      ...order.toObject(),
      items: orderDetails?.fullItems || order.items,
    };

    return NextResponse.json({
      success: true,
      order: fullOrderData,
    });
  } catch (error) {
    console.error("Error fetching order:", error);
    return NextResponse.json(
      { error: "Failed to fetch order" },
      { status: 500 }
    );
  }
}

// PATCH /api/orders/[id] - Update order status or tracking code
export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);

    // Authentication check - only admin can update orders
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const data = await request.json();

    // Validate MongoDB ID
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid order ID" }, { status: 400 });
    }

    // Prepare update object
    const updateData: { status?: string; trackingCode?: string } = {};

    // Add status if provided
    if (data.status) {
      updateData.status = data.status;
    }

    // Add tracking code if provided
    if (data.trackingCode !== undefined) {
      updateData.trackingCode = data.trackingCode;
    }

    // Check if there's anything to update
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid update fields provided" },
        { status: 400 }
      );
    }

    await connectDB();
    
    // Get the current order to compare status changes
    const currentOrder = await Order.findById(id).lean();
    if (!currentOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Send email notifications for status changes
    if (data.status && data.status !== currentOrder.status) {
      try {
        // Get user information
        const user = (await User.findById(updatedOrder.userId)
          .select("email name language")
          .lean()) as UserDocument;

        if (user && user.email) {
          const userLanguage = user.language || 'it'; // Default to Italian
          
          // Get detailed order items
          const orderDetails = await OrderDetails.findOne({
            paymentIntentId: updatedOrder.paymentIntentId,
          });

          const items = orderDetails?.fullItems || updatedOrder.items;

          // Send status update email
          const { subject, text, html } = await orderStatusUpdateTemplate({
            userName: user.name,
            orderId: updatedOrder._id.toString(),
            status: data.status,
            items: items,
            language: userLanguage as 'it' | 'en',
          });

          await sendEmail({
            to: user.email,
            subject,
            text,
            html,
          });

          console.log(`Status update email sent to ${user.email} for order ${updatedOrder._id}`);
        }
      } catch (emailError) {
        console.error("Error sending status update email:", emailError);
        // Don't fail the request if email fails
      }
    }

    // Send shipping notification if status is "shipped" and tracking code is provided
    if (data.status === "shipped" && data.trackingCode && currentOrder.status !== "shipped") {
      try {
        const user = (await User.findById(updatedOrder.userId)
          .select("email name language")
          .lean()) as UserDocument;

        if (user && user.email) {
          const userLanguage = user.language || 'it';
          
          const orderDetails = await OrderDetails.findOne({
            paymentIntentId: updatedOrder.paymentIntentId,
          });

          const items = orderDetails?.fullItems || updatedOrder.items;

          const { subject, text, html } = await shippingNotificationTemplate({
            userName: user.name,
            orderId: updatedOrder._id.toString(),
            trackingCode: data.trackingCode,
            items: items,
            language: userLanguage as 'it' | 'en',
          });

          await sendEmail({
            to: user.email,
            subject,
            text,
            html,
          });

          console.log(`Shipping notification email sent to ${user.email} for order ${updatedOrder._id}`);
        }
      } catch (emailError) {
        console.error("Error sending shipping notification email:", emailError);
        // Don't fail the request if email fails
      }
    }

    return NextResponse.json(
      {
        message: "Order updated successfully",
        order: JSON.parse(JSON.stringify(updatedOrder)),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating order:", error);
    return NextResponse.json(
      { error: "Failed to update order" },
      { status: 500 }
    );
  }
}
