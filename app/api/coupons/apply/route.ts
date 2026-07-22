import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/lib/models/Coupon";

// I coupon sono utilizzabili da chiunque nel checkout (ospiti compresi) — il
// campo "Hai un coupon?" e' mostrato a tutti i clienti, senza distinzione di
// ruolo o autenticazione.
export async function POST(req: NextRequest) {
  try {
    const { couponId } = await req.json();

    if (!couponId) {
      return NextResponse.json(
        { error: "Coupon ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the coupon and increment usage
    const coupon = await Coupon.findById(couponId);

    if (!coupon) {
      return NextResponse.json({ error: "Coupon not found" }, { status: 404 });
    }

    if (!coupon.isActive || coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "Coupon is no longer valid" },
        { status: 400 }
      );
    }

    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json(
        { error: "Coupon has reached maximum usage limit" },
        { status: 400 }
      );
    }

    // Increment usage count
    coupon.currentUses += 1;
    await coupon.save();

    return NextResponse.json({
      success: true,
      message: "Coupon applied successfully",
      discountPercentage: coupon.discountPercentage,
    });
  } catch (error) {
    console.error("Error applying coupon:", error);
    return NextResponse.json(
      { error: "Failed to apply coupon" },
      { status: 500 }
    );
  }
}
