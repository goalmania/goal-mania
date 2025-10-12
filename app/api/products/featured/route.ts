import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category") || "all";
    const limit = parseInt(searchParams.get("limit") || "4");

    console.log("🔍 Fetching featured products:", { category, limit });

    // Build query
    const query: any = {
      isActive: true,
      stock: { $gt: 0 },
    };

    if (category !== "all") {
      query.category = category;
    }

    // Fetch products
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    console.log("✅ Found products:", products.length);

    return NextResponse.json(products, { status: 200 });
  } catch (error: any) {
    console.error("❌ Error fetching featured products:", error);
    return NextResponse.json(
      { message: error.message || "Failed to fetch featured products" },
      { status: 500 }
    );
  }
}
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
