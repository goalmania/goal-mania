import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") || "10");
    const page = parseInt(searchParams.get("page") || "1");
    const featured = searchParams.get("featured") === "true";

    // Build query
    const query = {
      category: "serieA",
      status: "published",
      ...(featured && { featured: true }),
    };

    // Execute query with pagination
    const articles = await Article.find(query)
      .sort({ publishedAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .select("title summary image publishedAt slug featured");

    // Get total count for pagination
    const total = await Article.countDocuments(query);

    return NextResponse.json(
      {
        articles,
        pagination: {
          total,
          page,
          limit,
          pages: Math.ceil(total / limit),
        },
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching Serie A news:", error);
    return NextResponse.json(
      { error: "Failed to fetch Serie A news" },
      { status: 500 }
    );
  }
}
