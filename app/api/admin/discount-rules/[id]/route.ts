import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import DiscountRule from "@/lib/models/DiscountRule";

// Update a discount rule (admin only)
export async function PUT(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = await context;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;
    const data = await req.json();

    await connectDB();

    const updatedRule = await DiscountRule.findByIdAndUpdate(
      id,
      { ...data },
      { new: true, runValidators: true }
    );

    if (!updatedRule) {
      return NextResponse.json(
        { error: "Discount rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Discount rule updated successfully",
      discountRule: updatedRule,
    });
  } catch (error) {
    console.error("Error updating discount rule:", error);
    return NextResponse.json(
      { error: "Failed to update discount rule" },
      { status: 500 }
    );
  }
}

// Delete a discount rule (admin only)
export async function DELETE(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { params } = await context;
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.role || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const { id } = await params;

    await connectDB();

    const deletedRule = await DiscountRule.findByIdAndDelete(id);

    if (!deletedRule) {
      return NextResponse.json(
        { error: "Discount rule not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Discount rule deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting discount rule:", error);
    return NextResponse.json(
      { error: "Failed to delete discount rule" },
      { status: 500 }
    );
  }
}
