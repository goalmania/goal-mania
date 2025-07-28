import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import mongoose from "mongoose";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    
    if (!id) {
      return NextResponse.json(
        { error: "Product ID is required" },
        { status: 400 }
      );
    }

    await connectDB();

    const Product = mongoose.models.Product;
    if (!Product) {
      return NextResponse.json(
        { error: "Product model not found" },
        { status: 500 }
      );
    }

    // First, get the current product to extract relevant information
    const currentProduct = await Product.findById(id).lean();
    if (!currentProduct) {
      return NextResponse.json(
        { error: "Product not found" },
        { status: 404 }
      );
    }

    // Extract team name from the title (assuming format like "AC Milan Home 2024/25")
    const extractTeamName = (title: string): string => {
      // Common patterns to remove from team names
      const patternsToRemove = [
        /\s+(home|away|third|fourth|goalkeeper|gk)\s*/gi,
        /\s+\d{4}\/\d{2,4}/g, // Remove years like 2024/25
        /\s+\d{4}-\d{2,4}/g, // Remove years like 2024-25
        /\s+(jersey|shirt|kit)\s*/gi,
        /\s+(retro|vintage|classic)\s*/gi,
      ];
      
      let teamName = title;
      patternsToRemove.forEach(pattern => {
        teamName = teamName.replace(pattern, ' ');
      });
      
      return teamName.trim();
    };

    const currentTeam = extractTeamName(currentProduct.title);
    const currentCategory = currentProduct.category;

    // Build query for related products
    const relatedProductsQuery: any = {
      _id: { $ne: id }, // Exclude current product
      isActive: true,
    };

    // Strategy 1: Same team products
    const teamProducts = await Product.find({
      ...relatedProductsQuery,
      title: { $regex: currentTeam, $options: "i" }
    })
    .sort({ feature: -1, createdAt: -1 })
    .limit(4)
    .lean()
    .select('_id title description basePrice retroPrice images category isRetro isMysteryBox feature slug');

    // Strategy 2: Same category products (if we need more)
    let categoryProducts = [];
    if (teamProducts.length < 4) {
      const remainingSlots = 4 - teamProducts.length;
      const excludeIds = [id, ...teamProducts.map(p => p._id.toString())];
      
      categoryProducts = await Product.find({
        ...relatedProductsQuery,
        _id: { $nin: excludeIds },
        category: currentCategory
      })
      .sort({ feature: -1, createdAt: -1 })
      .limit(remainingSlots)
      .lean()
      .select('_id title description basePrice retroPrice images category isRetro isMysteryBox feature slug');
    }

    // Strategy 3: Fill remaining slots with any products from different categories
    let otherProducts = [];
    const totalFoundProducts = teamProducts.length + categoryProducts.length;
    if (totalFoundProducts < 4) {
      const remainingSlots = 4 - totalFoundProducts;
      const excludeIds = [
        id, 
        ...teamProducts.map(p => p._id.toString()),
        ...categoryProducts.map(p => p._id.toString())
      ];
      
      otherProducts = await Product.find({
        ...relatedProductsQuery,
        _id: { $nin: excludeIds }
      })
      .sort({ feature: -1, createdAt: -1 })
      .limit(remainingSlots)
      .lean()
      .select('_id title description basePrice retroPrice images category isRetro isMysteryBox feature slug');
    }

    // Combine all related products
    const relatedProducts = [
      ...teamProducts,
      ...categoryProducts, 
      ...otherProducts
    ];

    // Transform products to match the expected format
    const transformedProducts = relatedProducts.map(product => ({
      id: product._id.toString(),
      name: product.title,
      price: product.isRetro ? (product.retroPrice || product.basePrice) : product.basePrice,
      image: product.images[0] || "/images/placeholder.png",
      category: product.category,
      team: extractTeamName(product.title),
      href: `/products/${product.slug || product._id}`,
      isRetro: product.isRetro,
      isMysteryBox: product.isMysteryBox,
      feature: product.feature,
    }));

    return NextResponse.json(transformedProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
      },
    });

  } catch (error) {
    console.error("[RELATED_PRODUCTS_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
} 