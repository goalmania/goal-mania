import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Order from "@/models/Order";

export const revalidate = 300; // 5 min cache — real number, no need to be realtime

export async function GET() {
  try {
    await connectDB();
    const totalOrders = await Order.countDocuments({ status: { $ne: "cancelled" } });
    return NextResponse.json({ totalOrders });
  } catch (error) {
    console.error("Error fetching public stats:", error);
    return NextResponse.json({ totalOrders: null }, { status: 500 });
  }
}
