import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const limit = parseInt(searchParams.get("limit") || "3", 10);

    await connectDB();

    // Get the Product model
    const Product = mongoose.models.Product;

    if (!Product) {
      return NextResponse.json(
        { error: "Product model not found" },
        { status: 500 }
      );
    }

    // Build query
    const query: any = { isActive: true };

    // Add category filter if provided and not 'all'
    if (category && category !== "all") {
      query.category = category;
    }

    // Get featured products first, then other products if needed to fill the limit
    const featuredProducts = await Product.find({
      ...query,
      feature: true,
    })
      .sort({ createdAt: -1 })
      .limit(limit);

    // If we have enough featured products, return them
    if (featuredProducts.length >= limit) {
      return NextResponse.json(featuredProducts);
    }

    // Otherwise, get additional non-featured products to fill the limit
    const nonFeaturedLimit = limit - featuredProducts.length;
    const nonFeaturedProducts = await Product.find({
      ...query,
      feature: false,
      _id: { $nin: featuredProducts.map((p: any) => p._id) },
    })
      .sort({ createdAt: -1 })
      .limit(nonFeaturedLimit);

    // Combine and return
    const products = [...featuredProducts, ...nonFeaturedProducts];
    return NextResponse.json(products);
  } catch (error) {
    console.error("[FEATURED_PRODUCTS_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
