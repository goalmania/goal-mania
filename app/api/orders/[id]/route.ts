import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";
import OrderDetails from "@/lib/models/OrderDetails";
import mongoose from "mongoose";

// Type for order with necessary properties
interface OrderType {
  _id: string;
  userId: string;
  status: string;
  [key: string]: any;
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
    const updatedOrder = await Order.findByIdAndUpdate(id, updateData, {
      new: true,
    }).lean();

    if (!updatedOrder) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
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
