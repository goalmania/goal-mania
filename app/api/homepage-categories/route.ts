import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import HomepageCategory from "@/lib/models/HomepageCategory";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET - Fetch all active homepage categories
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const includeInactive = searchParams.get("includeInactive") === "true";

    const query: any = {};
    if (!includeInactive) {
      query.isActive = true;
    }

    const categories = await HomepageCategory.find(query)
      .sort({ displayOrder: 1, createdAt: -1 })
      .lean();

    return NextResponse.json({
      categories: JSON.parse(JSON.stringify(categories)),
    });
  } catch (error) {
    console.error("Error fetching homepage categories:", error);
    return NextResponse.json(
      { error: "Failed to fetch homepage categories" },
      { status: 500 }
    );
  }
}

// POST - Create a new homepage category
export async function POST(request: NextRequest) {
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

    // Validation
    if (!title || !category) {
      return NextResponse.json(
        { error: "Title and category are required" },
        { status: 400 }
      );
    }

    // Check if category with same title already exists
    const existing = await HomepageCategory.findOne({ title });
    if (existing) {
      return NextResponse.json(
        { error: "A category with this title already exists" },
        { status: 400 }
      );
    }

    const homepageCategory = new HomepageCategory({
      title,
      category,
      displayOrder: displayOrder ?? 0,
      isActive: isActive ?? true,
      limit: limit ?? 8,
    });

    await homepageCategory.save();

    return NextResponse.json(
      { 
        message: "Homepage category created successfully",
        category: JSON.parse(JSON.stringify(homepageCategory)),
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error("Error creating homepage category:", error);
    return NextResponse.json(
      { error: error.message || "Failed to create homepage category" },
      { status: 500 }
    );
  }
}

