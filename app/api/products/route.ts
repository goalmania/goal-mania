import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { z } from "zod";
import {
  VALID_PATCHES,
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
  hasShorts: z.boolean().default(true),
  hasSocks: z.boolean().default(true),
  hasPlayerEdition: z.boolean().default(true),
  isMysteryBox: z.boolean().default(false),
  adultSizes: z
    .array(z.enum(["S", "M", "L", "XL", "XXL", "3XL"]))
    .default(["S", "M", "L", "XL", "XXL"]),
  kidsSizes: z.array(z.enum(["XS", "S", "M", "L", "XL"])).default([]),
  category: z.enum(PRODUCT_CATEGORIES),
  availablePatches: z
    .array(z.enum(["champions-league", "serie-a", "coppa-italia"]))
    .default([]),
  allowsNumberOnShirt: z.boolean().default(true),
  allowsNameOnShirt: z.boolean().default(true),
  isActive: z.boolean().default(true),
  feature: z.boolean().default(true),
  slug: z.string().optional(),
});

export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category") || "all";
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "10", 10);
    const search = searchParams.get("search") || "";
    const featured = searchParams.get("feature") === "true";
    const includeInactive = searchParams.get("includeInactive") === "true";

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

    // Add search filter if provided
    if (search) {
      query.title = { $regex: search, $options: "i" };
    }

    // Add featured filter if requested
    if (featured) {
      query.feature = true;
    }

    console.log("Products API Query:", JSON.stringify(query, null, 2));

    // Count total documents for pagination
    const totalProducts = await Product.countDocuments(query);

    // Fetch products with pagination
    const products = await Product.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean();

    console.log(`Found ${products.length} products matching the criteria`);

    // For backward compatibility, return just the products array if not requesting pagination info
    if (req.nextUrl.searchParams.has("noPagination")) {
      return NextResponse.json(products);
    }

    return NextResponse.json({
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages: Math.ceil(totalProducts / limit),
      },
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
