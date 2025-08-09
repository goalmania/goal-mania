import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { z } from "zod";
import { ProductCache } from "@/lib/cache";
import {
  VALID_ADULT_SIZES,
  VALID_KID_SIZES,
  PRODUCT_CATEGORIES,
} from "@/lib/types/product";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

// Schema for input validation
const productSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.number().min(0, "Base price cannot be negative").default(30),
  retroPrice: z.number().min(0, "Retro price cannot be negative").default(35),
  shippingPrice: z
    .number()
    .min(0, "Shipping price cannot be negative")
    .default(0),
  stockQuantity: z
    .number()
    .min(0, "Stock quantity cannot be negative")
    .default(0),
  images: z.array(z.string()).min(1, "At least one image is required"),
  videos: z.array(z.string()).optional(),
  hasShorts: z.boolean().default(true),
  hasSocks: z.boolean().default(true),
  hasPlayerEdition: z.boolean().default(true),
  isMysteryBox: z.boolean().default(false),
  adultSizes: z
    .array(z.enum(["S", "M", "L", "XL", "XXL", "3XL"]))
    .default(["S", "M", "L", "XL", "XXL"]),
  kidsSizes: z.array(z.enum(["XS", "S", "M", "L", "XL"])).default([]),
  category: z.enum(PRODUCT_CATEGORIES),
  allowsNumberOnShirt: z.boolean().default(true),
  allowsNameOnShirt: z.boolean().default(true),
  isActive: z.boolean().default(true),
  feature: z.boolean().default(true),
  slug: z.string().optional(),
  // Patch relationships
  patchIds: z.array(z.string()).optional().default([]),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const featured = searchParams.get("feature") === "true";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(100, Math.max(1, limit)); // Cap at 100 items per page

    // Create cache key for this specific query
    const cacheKey = ProductCache.createKey(
      category, 
      validatedPage, 
      validatedLimit, 
      `${search}-${featured}-${includeInactive}-${sortBy}-${sortOrder}`
    );
    
    // Check cache first (but skip cache for search queries and admin queries)
    if (!search && !includeInactive) {
      const cachedData = ProductCache.get(cacheKey);
      if (cachedData) {
        return NextResponse.json(cachedData, {
          headers: {
            'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
            'X-Cache': 'HIT'
          }
        });
      }
    }

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
    const query: any = {};

    // Only filter by active status if includeInactive is false
    if (!includeInactive) {
      query.isActive = true;
    }

    // Add category filter if not 'all'
    if (category !== "all") {
      query.category = category;
    }

    // Add search filter if provided - search in title, description, and category
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Add featured filter if requested
    if (featured) {
      query.feature = true;
    }

    // Add mystery box filter if requested
    const type = searchParams.get("type");
    if (type === "mysteryBox") {
      query.isMysteryBox = true;
      console.log("Mystery Box filter applied - query.isMysteryBox = true");
    }

    console.log("Products API Query:", JSON.stringify(query, null, 2));

    // Build sort object
    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

    // Use Promise.all for parallel execution of count and find operations
    const [totalProducts, products] = await Promise.all([
      Product.countDocuments(query),
      Product.find(query)
        .sort(sortObject)
        .skip((validatedPage - 1) * validatedLimit)
        .limit(validatedLimit)
        .lean()
        .select('_id title description basePrice retroPrice shippingPrice stockQuantity images isRetro hasShorts hasSocks category allowsNumberOnShirt allowsNameOnShirt isActive feature slug isMysteryBox createdAt')
    ]);

    console.log(`Found ${products.length} products matching the criteria`);

    // Calculate pagination info
    const totalPages = Math.ceil(totalProducts / validatedLimit);
    const hasNextPage = validatedPage < totalPages;
    const hasPreviousPage = validatedPage > 1;

    // For backward compatibility, return just the products array if not requesting pagination info
    if (req.nextUrl.searchParams.has("noPagination")) {
      return NextResponse.json(products, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
        },
      });
    }

    const response = {
      products,
      pagination: {
        total: totalProducts,
        page: validatedPage,
        limit: validatedLimit,
        totalPages,
        hasNextPage,
        hasPreviousPage,
      },
    };

    // Cache the response for non-search, non-admin queries
    if (!search && !includeInactive) {
      ProductCache.set(cacheKey, response);
    }

    // Add appropriate cache headers based on the request type
    const cacheHeaders = {
      'Cache-Control': search || !includeInactive 
        ? 'no-cache, no-store, must-revalidate' // Don't cache search results or filtered results
        : 'public, s-maxage=600, stale-while-revalidate=1200', // Cache regular product lists for 10 minutes
      'X-Cache': 'MISS'
    };

    return NextResponse.json(response, {
      headers: cacheHeaders,
    });
  } catch (error) {
    console.error("[PRODUCTS_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const role = (session.user as any)?.role as string | undefined;
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();
    const body = await request.json();

    console.log("Received product data:", JSON.stringify(body, null, 2));

    // Ensure basePrice and retroPrice are numeric
    const processedBody = {
      ...body,
      basePrice:
        typeof body.basePrice === "string"
          ? parseFloat(body.basePrice)
          : body.basePrice,
      retroPrice:
        typeof body.retroPrice === "string"
          ? parseFloat(body.retroPrice)
          : body.retroPrice,
      shippingPrice:
        typeof body.shippingPrice === "string"
          ? parseFloat(body.shippingPrice)
          : body.shippingPrice ?? 0,
      stockQuantity:
        typeof body.stockQuantity === "string"
          ? parseInt(body.stockQuantity)
          : body.stockQuantity,
    };

    // Handle migration from old schema to new schema if necessary
    if (
      processedBody.sizes &&
      (!processedBody.adultSizes || processedBody.adultSizes.length === 0)
    ) {
      // Convert all old sizes to upper case and consider them adult sizes
      processedBody.adultSizes = processedBody.sizes
        .map((size: string) => {
          // Handle case variations and normalize
          const normalizedSize = size.trim().toUpperCase();

          // Map common size variations to standard format
          if (normalizedSize === "XXS") return null; // XXS is not in adult sizes
          if (normalizedSize === "S" || normalizedSize === "SMALL") return "S";
          if (normalizedSize === "M" || normalizedSize === "MEDIUM") return "M";
          if (normalizedSize === "L" || normalizedSize === "LARGE") return "L";
          if (
            normalizedSize === "XL" ||
            normalizedSize === "XLARGE" ||
            normalizedSize === "X-LARGE"
          )
            return "XL";
          if (
            normalizedSize === "XXL" ||
            normalizedSize === "XXLARGE" ||
            normalizedSize === "XX-LARGE" ||
            normalizedSize === "2XL"
          )
            return "XXL";
          if (
            normalizedSize === "XXXL" ||
            normalizedSize === "3XL" ||
            normalizedSize === "XXX-LARGE"
          )
            return "3XL";

          // If it's already a valid size, return it
          if (["S", "M", "L", "XL", "XXL", "3XL"].includes(normalizedSize))
            return normalizedSize;

          // If it's not a recognized size format, return null to be filtered out
          return null;
        })
        .filter(Boolean) as string[]; // Filter out null values

      // Initialize kidsSizes if it doesn't exist
      if (!processedBody.kidsSizes) {
        processedBody.kidsSizes = [];

        // Check if any of the original sizes might be kid sizes
        processedBody.sizes.forEach((size: string) => {
          const normalizedSize = size.trim().toUpperCase();
          // Check for kid-specific sizes
          if (
            normalizedSize === "XXS" ||
            normalizedSize === "XS" ||
            normalizedSize.includes("KID") ||
            normalizedSize.includes("CHILD")
          ) {
            // Map to appropriate kid size
            if (normalizedSize === "XXS" || normalizedSize === "XS") {
              processedBody.kidsSizes.push("XS");
            } else if (normalizedSize.includes("S")) {
              processedBody.kidsSizes.push("S");
            } else if (normalizedSize.includes("M")) {
              processedBody.kidsSizes.push("M");
            } else if (normalizedSize.includes("L")) {
              processedBody.kidsSizes.push("L");
            } else if (normalizedSize.includes("XL")) {
              processedBody.kidsSizes.push("XL");
            }
          }
        });
      }

      console.log("Migrated product sizes for POST request:", {
        oldSizes: processedBody.sizes,
        newAdultSizes: processedBody.adultSizes,
        newKidSizes: processedBody.kidsSizes,
      });
    }

    // Validate input
    try {
      const validatedData = productSchema.parse(processedBody);

      // Handle patch relationships
      if (validatedData.patchIds && validatedData.patchIds.length > 0) {
        // Validate that all patchIds exist
        const Patch = require('@/lib/models/Patch').default;
        const existingPatches = await Patch.find({ 
          _id: { $in: validatedData.patchIds },
          isActive: true 
        });
        
        if (existingPatches.length !== validatedData.patchIds.length) {
          return NextResponse.json(
            { error: "One or more patches not found or inactive" },
            { status: 400 }
          );
        }
      }

      // Generate slug from title if not provided
      if (!validatedData.slug) {
        validatedData.slug = validatedData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");
      }

      // Check for duplicate slug
      const existingProduct = await Product.findOne({
        slug: validatedData.slug,
      });
      if (existingProduct) {
        // Add timestamp to make slug unique
        validatedData.slug = `${validatedData.slug}-${Date.now()}`;
      }

      const product = await Product.create(validatedData);
      return NextResponse.json(product);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: validationError.errors },
          { status: 400 }
        );
      }
      throw validationError; // Re-throw if not a Zod error
    }
  } catch (error) {
    console.error("Error creating product:", error);
    // Get detailed error information
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "Failed to create product",
        message: errorMessage,
        ...(process.env.NODE_ENV !== "production" && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}
