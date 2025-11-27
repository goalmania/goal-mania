import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import HomepageCategory from "@/lib/models/HomepageCategory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch a single homepage category
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await connectDB();

    const category = await HomepageCategory.findById(params.id).lean();

    if (!category) {
      return NextResponse.json(
        { error: "Homepage category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      category: JSON.parse(JSON.stringify(category)),
    });
  } catch (error) {
    console.error("Error fetching homepage category:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage category" },
      { status: 500 }
    );
  }
}

// PUT - Update a homepage category
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { title, category, displayOrder, isActive, limit } = body;

    const homepageCategory = await HomepageCategory.findById(params.id);

    if (!homepageCategory) {
      return NextResponse.json(
        { error: "Homepage category not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (title !== undefined) homepageCategory.title = title;
    if (category !== undefined) homepageCategory.category = category;
    if (displayOrder !== undefined) homepageCategory.displayOrder = displayOrder;
    if (isActive !== undefined) homepageCategory.isActive = isActive;
    if (limit !== undefined) homepageCategory.limit = limit;

    await homepageCategory.save();

    return NextResponse.json({
      message: "Homepage category updated successfully",
      category: JSON.parse(JSON.stringify(homepageCategory)),
    });
  } catch (error: any) {
    console.error("Error updating homepage category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update homepage category" },
      { status: 500 }
    );
  }
}

// DELETE - Delete a homepage category
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || session.user?.role !== "admin") {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    await connectDB();

    const homepageCategory = await HomepageCategory.findByIdAndDelete(params.id);

    if (!homepageCategory) {
      return NextResponse.json(
        { error: "Homepage category not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Homepage category deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting homepage category:", error);
    return NextResponse.json(
      { error: "Failed to delete homepage category" },
      { status: 500 }
    );
  }
}

