import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: orderId } = await params;

    await connectDB();

    // Find the order
    const order = await Order.findById(orderId);

    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Check if the order belongs to the user or if the user is an admin
    if (
      order.userId.toString() !== session.user.id &&
      session.user.role !== "admin"
    ) {
      return NextResponse.json(
        { error: "You don't have permission to cancel this order" },
        { status: 403 }
      );
    }

    // Check if the order can be cancelled (only pending or processing orders)
    if (order.status !== "pending" && order.status !== "processing") {
      return NextResponse.json(
        { error: "This order cannot be cancelled" },
        { status: 400 }
      );
    }

    // Update the order status
    order.status = "cancelled";
    order.cancelledAt = new Date();
    order.cancelledBy = session.user.id;
    await order.save();

    return NextResponse.json({
      success: true,
      message: "Order cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling order:", error);
    return NextResponse.json(
      { error: "Failed to cancel order" },
      { status: 500 }
    );
  }
}
