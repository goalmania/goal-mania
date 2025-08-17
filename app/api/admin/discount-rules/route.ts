import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import DiscountRule from "@/lib/models/DiscountRule";

// Get all discount rules (admin only)
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    await connectDB();

    const discountRules = await DiscountRule.find().sort({ priority: -1, createdAt: -1 });

    return NextResponse.json(discountRules);
  } catch (error) {
    console.error("Error fetching discount rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount rules" },
      { status: 500 }
    );
  }
}

// Create a new discount rule (admin only)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const data = await req.json();
    const {
      name,
      description,
      type,
      isActive,
      expiresAt,
      maxUses,
      priority,
      minQuantity,
      maxQuantity,
      discountPercentage,
      discountAmount,
      buyQuantity,
      getFreeQuantity,
      freeProductIds,
      applicableCategories,
      applicableProductIds,
      excludedProductIds,
      eligibilityConditions
    } = data;

    if (!name || !description || !type) {
      return NextResponse.json(
        { error: "Name, description, and type are required" },
        { status: 400 }
      );
    }

    await connectDB();

    // Create new discount rule
    const newDiscountRule = new DiscountRule({
      name,
      description,
      type,
      isActive: isActive !== undefined ? isActive : true,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      maxUses: maxUses || null,
      priority: priority || 1,
      minQuantity: minQuantity || null,
      maxQuantity: maxQuantity || null,
      discountPercentage: discountPercentage || null,
      discountAmount: discountAmount || null,
      buyQuantity: buyQuantity || null,
      getFreeQuantity: getFreeQuantity || null,
      freeProductIds: freeProductIds || [],
      applicableCategories: applicableCategories || [],
      applicableProductIds: applicableProductIds || [],
      excludedProductIds: excludedProductIds || [],
      eligibilityConditions: eligibilityConditions || null,
      currentUses: 0,
    });

    await newDiscountRule.save();

    return NextResponse.json(
      {
        message: "Discount rule created successfully",
        discountRule: newDiscountRule,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating discount rule:", error);
    return NextResponse.json(
      { error: "Failed to create discount rule" },
      { status: 500 }
    );
  }
}
