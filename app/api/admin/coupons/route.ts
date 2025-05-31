import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Coupon from "@/lib/models/Coupon";

// Get all coupons (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    console.log("Admin coupons API: Session user role", session?.user?.role);

    if (!session?.user?.role || session.user.role !== "admin") {
      console.log("Admin coupons API: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const coupons = await Coupon.find().sort({ createdAt: -1 });
    console.log("Admin coupons API: Found", coupons.length, "coupons");

    return NextResponse.json(coupons);
  } catch (error) {
    console.error("Error fetching coupons:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupons" },
      { status: 500 }
    );
  }
}

// Create a new coupon (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const { code, discountPercentage, expiresAt, maxUses, description } = data;

    if (!code || !discountPercentage || !expiresAt) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if coupon code already exists
    const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
    if (existingCoupon) {
      return NextResponse.json(
        { error: "Coupon code already exists" },
        { status: 400 }
      );
    }

    // Create new coupon
    const newCoupon = new Coupon({
      code: code.toUpperCase(),
      discountPercentage,
      expiresAt: new Date(expiresAt),
      maxUses: maxUses || null,
      description: description || "",
      isActive: true,
      currentUses: 0,
    });

    await newCoupon.save();

    return NextResponse.json(
      {
        message: "Coupon created successfully",
        coupon: newCoupon,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating coupon:", error);
    return NextResponse.json(
      { error: "Failed to create coupon" },
      { status: 500 }
    );
  }
}
