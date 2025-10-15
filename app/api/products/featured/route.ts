import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get("limit") || "8");

    // First, try to get featured products
    const featuredProducts = await Product.find({
      isFeatured: true,
      isActive: true,
    })
      .limit(limit)
      .lean();

    // If we have enough featured products, return them
    if (featuredProducts.length >= limit) {
      return NextResponse.json(
        {
          success: true,
          products: featuredProducts,
          count: featuredProducts.length,
        },
        { status: 200 }
      );
    }

    // Otherwise, get additional non-featured products to fill the limit
    const nonFeaturedLimit = limit - featuredProducts.length;
    const nonFeaturedProducts = await Product.find({
      isFeatured: { $ne: true },
      isActive: true,
    })
      .limit(nonFeaturedLimit)
      .lean();

    // Combine featured and non-featured products
    const allProducts = [...featuredProducts, ...nonFeaturedProducts];

    return NextResponse.json(
      {
        success: true,
        products: allProducts,
        count: allProducts.length,
        featuredCount: featuredProducts.length,
        nonFeaturedCount: nonFeaturedProducts.length,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error("Error fetching featured products:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch featured products",
        error: error.message,
      },
      { status: 500 }
    );
  }
}
