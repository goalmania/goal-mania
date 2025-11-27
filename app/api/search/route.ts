import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);

    if (!query || query.trim().length === 0) {
      return NextResponse.json({ 
        products: [], 
        articles: [],
        pagination: {
          page: 1,
          limit,
          total: 0,
          totalPages: 0,
        }
      });
    }

    // Validate and sanitize query
    const sanitizedQuery = query.trim().substring(0, 100); // Limit query length

    // Connect to database with error handling
    try {
      await connectDB();
    } catch (dbError: any) {
      console.error("Database connection error in search API:", dbError);
      return NextResponse.json(
        { 
          error: "Database connection failed. Please try again later.",
          message: process.env.NODE_ENV === 'development' ? dbError.message : undefined,
          products: [],
          articles: [],
          pagination: {
            page: 1,
            limit,
            total: 0,
            totalPages: 0,
          }
        },
        { status: 503 } // Service Unavailable
      );
    }

    // Build search query with relevance scoring
    const searchRegex = { $regex: sanitizedQuery, $options: "i" };
    
    // Search for products - filter out products with missing images
    const productQuery: any = {
      $or: [
        { title: searchRegex },
        { description: searchRegex },
        { category: searchRegex },
      ],
      isActive: true,
      // Ensure products have at least one valid image
      images: { $exists: true, $ne: [], $not: { $size: 0 } },
      // Filter out products where all images are empty strings
      // Using $expr to check that at least one image is a non-empty string
      $expr: {
        $gt: [
          {
            $size: {
              $filter: {
                input: "$images",
                as: "img",
                cond: {
                  $and: [
                    { $ne: ["$$img", null] },
                    { $ne: ["$$img", ""] },
                  ],
                },
              },
            },
          },
          0,
        ],
      },
    };

    // Fetch products with relevance ordering
    // First, get all matching products to calculate proper relevance
    const allProducts = await Product.find(productQuery)
      .lean()
      .select('_id title description basePrice retroPrice shippingPrice stockQuantity images isRetro hasShorts hasSocks category allowsNumberOnShirt allowsNameOnShirt isActive feature slug isMysteryBox createdAt videos');

    // Strict filtering to ensure products have REAL images (not placeholders)
    const validProducts = allProducts.filter((product: any) => {
      // Must have images array
      if (!product.images || !Array.isArray(product.images) || product.images.length === 0) {
        return false;
      }
      
      // Must have at least one REAL image URL (not placeholder)
      // Reject products that only have placeholder images
      const hasRealImage = product.images.some((img: string) => {
        if (!img || typeof img !== 'string') return false;
        const trimmed = img.trim();
        
        // Reject empty strings
        if (trimmed.length === 0) return false;
        
        const lowerTrimmed = trimmed.toLowerCase();
        
        // Reject placeholder images - local paths
        if (lowerTrimmed === '/images/image.png') return false;
        if (lowerTrimmed === '/images/placeholder.png') return false;
        if (lowerTrimmed.includes('/images/image.png')) return false;
        if (lowerTrimmed.includes('/images/placeholder.png')) return false;
        
        // Reject Cloudinary placeholder images
        if (lowerTrimmed.includes('placeholder') || lowerTrimmed.includes('jersey-placeholder') || 
            lowerTrimmed.includes('retro-placeholder') || lowerTrimmed.includes('2025-placeholder')) {
          return false;
        }
        
        // Reject default/fallback images
        if (lowerTrimmed.includes('default') && (lowerTrimmed.includes('image') || lowerTrimmed.includes('placeholder'))) {
          return false;
        }
        
        // Accept any other URL (real image URLs from external sources or other paths)
        // This includes goalmania.shop URLs (they have certificate issues but images exist)
        return true;
      });
      
      return hasRealImage;
    });

    // Calculate relevance score for each product
    const productsWithRelevance = validProducts.map((product: any) => {
      const titleLower = (product.title || '').toLowerCase();
      const descLower = (product.description || '').toLowerCase();
      const categoryLower = (product.category || '').toLowerCase();
      const queryLower = sanitizedQuery.toLowerCase();
      
      let relevance = 0;
      
      // Title exact match gets highest score
      if (titleLower === queryLower) relevance += 100;
      // Title starts with query
      else if (titleLower.startsWith(queryLower)) relevance += 50;
      // Title contains query
      else if (titleLower.includes(queryLower)) relevance += 30;
      
      // Description contains query
      if (descLower.includes(queryLower)) relevance += 10;
      
      // Category matches
      if (categoryLower.includes(queryLower)) relevance += 5;
      
      return { ...product, relevance };
    });

    // Sort by relevance (highest first), then by creation date (newest first)
    productsWithRelevance.sort((a: any, b: any) => {
      if (b.relevance !== a.relevance) {
        return b.relevance - a.relevance;
      }
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Apply pagination
    const totalProducts = productsWithRelevance.length;
    const totalPages = Math.ceil(totalProducts / limit);
    const skip = (page - 1) * limit;
    
    // Remove relevance score and preserve original product data including images
    const products = productsWithRelevance.slice(skip, skip + limit).map(({ relevance, ...product }) => {
      // Return product as-is - don't modify images array
      // The validation already ensured products have valid images
      return product;
    });

    // Search for articles
    const articleQuery = {
      $or: [
        { title: searchRegex },
        { summary: searchRegex },
        { content: searchRegex },
        { category: searchRegex },
      ],
      status: "published",
    };

    const articles = await Article.find(articleQuery)
      .sort({ publishedAt: -1 })
      .limit(limit)
      .lean();

    // Log sample products for debugging (remove in production)
    if (process.env.NODE_ENV === 'development' && products.length > 0) {
      console.log('🔍 Search API - Sample products:', products.slice(0, 3).map((p: any) => ({
        id: p._id?.toString().substring(0, 8),
        title: p.title?.substring(0, 30),
        imageCount: p.images?.length || 0,
        firstImage: p.images?.[0]?.substring(0, 50) || 'none'
      })));
    }

    return NextResponse.json({
      products: JSON.parse(JSON.stringify(products)),
      articles: JSON.parse(JSON.stringify(articles)),
      pagination: {
        page,
        limit,
        total: totalProducts, // This is the count of valid products after filtering
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    });
  } catch (error: any) {
    console.error("Search API error:", error);
    
    // Check if it's a database connection error
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND' || error.code === 'ETIMEDOUT') {
      return NextResponse.json(
        { 
          error: "Database connection failed. Please try again later.",
          message: process.env.NODE_ENV === 'development' ? error.message : undefined,
          products: [],
          articles: [],
          pagination: {
            page: 1,
            limit: 10,
            total: 0,
            totalPages: 0,
          }
        },
        { status: 503 } // Service Unavailable
      );
    }
    
    return NextResponse.json(
      { 
        error: "Failed to perform search",
        message: process.env.NODE_ENV === 'development' ? error.message : undefined,
        products: [],
        articles: [],
        pagination: {
          page: 1,
          limit: 10,
          total: 0,
          totalPages: 0,
        }
      },
      { status: 500 }
    );
  }
}
