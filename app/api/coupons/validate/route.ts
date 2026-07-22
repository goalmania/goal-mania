import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Coupon from "@/lib/models/Coupon";

// I coupon sono utilizzabili da chiunque nel checkout (ospiti compresi) — il
// campo "Hai un coupon?" e' mostrato a tutti i clienti, senza distinzione di
// ruolo o autenticazione.
export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json();

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find the coupon and validate it
    const coupon = await Coupon.findOne({
      code: code.toUpperCase(),
      isActive: true,
      expiresAt: { $gt: new Date() },
    });

    if (!coupon) {
      return NextResponse.json(
        { error: "Invalid or expired coupon code" },
        { status: 404 }
      );
    }

    // Check if coupon has reached max uses
    if (coupon.maxUses && coupon.currentUses >= coupon.maxUses) {
      return NextResponse.json(
        { error: "Coupon has reached maximum usage limit" },
        { status: 400 }
      );
    }

    // Return coupon details
    return NextResponse.json({
      valid: true,
      discountPercentage: coupon.discountPercentage,
      couponId: coupon._id.toString(),
      message: `Coupon applied: ${coupon.discountPercentage}% discount`,
    });
  } catch (error) {
    console.error("Error validating coupon:", error);
    return NextResponse.json(
      { error: "Failed to validate coupon" },
      { status: 500 }
    );
  }
}
