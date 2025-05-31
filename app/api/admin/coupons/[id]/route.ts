import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Coupon from "@/lib/models/Coupon";

// Get a single coupon by ID (admin only)
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    return NextResponse.json(coupon);
  } catch (error) {
    console.error("Error fetching coupon:", error);
    return NextResponse.json(
      { error: "Failed to fetch coupon" },
      { status: 500 }
    );
  }
}

// Update a coupon (admin only)
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Update coupon API: Session user role", session?.user?.role);

    if (!session?.user?.role || session.user.role !== "admin") {
      console.log("Update coupon API: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    await connectDB();

    const coupon = await Coupon.findById(id);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    // Update coupon fields
    if (data.isActive !== undefined) {
      coupon.isActive = data.isActive;
    }

    if (data.code) {
      coupon.code = data.code.toUpperCase();
    }

    if (data.discountPercentage) {
      coupon.discountPercentage = data.discountPercentage;
    }

    if (data.expiresAt) {
      coupon.expiresAt = new Date(data.expiresAt);
    }

    if (data.maxUses !== undefined) {
      coupon.maxUses = data.maxUses;
    }

    if (data.description !== undefined) {
      coupon.description = data.description;
    }

    await coupon.save();
    console.log("Update coupon API: Coupon updated successfully", id);

    return NextResponse.json({
      message: "Coupon updated successfully",
      coupon,
    });
  } catch (error) {
    console.error("Error updating coupon:", error);
    return NextResponse.json(
      { error: "Failed to update coupon" },
      { status: 500 }
    );
  }
}

// Delete a coupon (admin only)
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    console.log("Delete coupon API: Session user role", session?.user?.role);

    if (!session?.user?.role || session.user.role !== "admin") {
      console.log("Delete coupon API: Unauthorized access attempt");
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();

    const result = await Coupon.findByIdAndDelete(id);

    if (!result) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    console.log("Delete coupon API: Coupon deleted successfully", id);

    return NextResponse.json({
      message: "Coupon deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting coupon:", error);
    return NextResponse.json(
      { error: "Failed to delete coupon" },
      { status: 500 }
    );
  }
}
