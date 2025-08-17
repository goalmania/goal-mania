import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import DiscountRule from "@/lib/models/DiscountRule";

// Get discount rules by ID (public endpoint)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const ruleIds = searchParams.get('ids');
    
    if (!ruleIds) {
      return NextResponse.json(
        { error: "Rule IDs are required" },
        { status: 400 }
      );
    }

    await connectDB();

    const ids = ruleIds.split(',').filter(id => id.trim());
    
    if (ids.length === 0) {
      return NextResponse.json(
        { error: "At least one valid rule ID is required" },
        { status: 400 }
      );
    }

    const rules = await DiscountRule.find({
      _id: { $in: ids },
      isActive: true
    });

    return NextResponse.json(rules);
  } catch (error) {
    console.error("Error fetching discount rules:", error);
    return NextResponse.json(
      { error: "Failed to fetch discount rules" },
      { status: 500 }
    );
  }
}
