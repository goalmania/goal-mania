import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { z } from "zod";
import { ProductCache } from "@/lib/cache";
import mongoose from "mongoose";
import { NextRequest } from "next/server";

// Enable ISR caching for this route handler
export const revalidate = 600;

// Input validation schema
const productSchema = z.object({
  title: z.string().min(2),
  description: z.string().min(10),
  basePrice: z.number().min(0).default(30),
  retroPrice: z.number().min(0).default(35),
  shippingPrice: z.number().min(0).default(0),
  stockQuantity: z.number().min(0).default(0),
  images: z.array(z.string()).min(1),
  videos: z.array(z.string()).optional(),
  hasShorts: z.boolean().default(true),
  hasSocks: z.boolean().default(true),
  hasPlayerEdition: z.boolean().default(true),
  hasLongSleeve: z.boolean().default(false),
  isRetro: z.boolean().default(false),
  isWorldCup: z.boolean().default(false),
  isMysteryBox: z.boolean().default(false),
  country: z.string().optional().default(""),
  nationalTeam: z.string().optional().default(""),
  adultSizes: z.array(z.enum(["S", "M", "L", "XL", "XXL", "3XL"])).default(["S","M","L","XL","XXL"]),
  kidsSizes: z.array(z.enum(["XS","S","M","L","XL"])).default([]),
  category: z.string().min(1),
  allowsNumberOnShirt: z.boolean().default(true),
  allowsNameOnShirt: z.boolean().default(true),
  isActive: z.boolean().default(true),
  feature: z.boolean().default(false),
  slug: z.string().optional(),
  patchIds: z.array(z.string()).optional().default([]),
});

// === GET handler ===
export async function GET(req: NextRequest) {
  try {
    await connectDB();

    const ProductModel = mongoose.models.Product || Product;

    // Test DB route
    if (req.nextUrl.searchParams.get("testDb") === "true") {
      return NextResponse.json({
        message: "MongoDB connection successful!",
        readyState: mongoose.connection.readyState,
      });
    }

    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category") || "all";
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(100, Math.max(1, parseInt(searchParams.get("limit") || "20", 10)));
    const search = searchParams.get("search") || "";
    const feature = searchParams.get("feature") === "true";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const sortBy = searchParams.get("sortBy") || "createdAt";
    const sortOrder = searchParams.get("sortOrder") || "desc";

    // Caching
    const cacheKey = ProductCache.createKey(
      category, page, limit,
      `${search}-${feature}-${includeInactive}-${sortBy}-${sortOrder}`
    );
    if (!search && !includeInactive) {
      const cached = ProductCache.get(cacheKey);
      if (cached) {
        return NextResponse.json(cached, { headers: { "X-Cache": "HIT" } });
      }
    }

    // Build query
    const query: any = {};
    if (!includeInactive) query.isActive = true;
    if (category !== "all") query.category = category;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }
    if (feature) query.feature = true;
    if (searchParams.get("type") === "mysteryBox") query.isMysteryBox = true;

    const sortObject: any = {};
    sortObject[sortBy] = sortOrder === "asc" ? 1 : -1;

    const [totalProducts, products] = await Promise.all([
      ProductModel.countDocuments(query),
      ProductModel.find(query)
        .sort(sortObject)
        .skip((page - 1) * limit)
        .limit(limit)
        .lean(),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    const response = {
      products,
      pagination: {
        total: totalProducts,
        page,
        limit,
        totalPages,
        hasNextPage: page < totalPages,
        hasPreviousPage: page > 1,
      },
    };

    if (!search && !includeInactive) ProductCache.set(cacheKey, response);

    return NextResponse.json(response, { headers: { "X-Cache": "MISS" } });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[PRODUCTS_GET]", err);
    return NextResponse.json({ error: "Internal Server Error", details: message }, { status: 500 });
  }
}

// === POST handler ===
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    await connectDB();

    const body = await request.json();
    const processedBody = {
      ...body,
      basePrice: Number(body.basePrice || 0),
      retroPrice: Number(body.retroPrice || 0),
      shippingPrice: Number(body.shippingPrice || 0),
      stockQuantity: Number(body.stockQuantity || 0),
      isWorldCup: body.category === "World Cup 2026" ? true : body.isWorldCup,
    };

    // Size migration
    if (processedBody.sizes && (!processedBody.adultSizes || processedBody.adultSizes.length === 0)) {
      processedBody.adultSizes = processedBody.sizes.map((size: string) => {
        const s = size.trim().toUpperCase();
        if (["S", "SMALL"].includes(s)) return "S";
        if (["M", "MEDIUM"].includes(s)) return "M";
        if (["L", "LARGE"].includes(s)) return "L";
        if (["XL", "XLARGE", "X-LARGE"].includes(s)) return "XL";
        if (["XXL", "XXLARGE", "XX-LARGE", "2XL"].includes(s)) return "XXL";
        if (["XXXL", "3XL", "XXX-LARGE"].includes(s)) return "3XL";
        return null;
      }).filter(Boolean);
      if (!processedBody.kidsSizes) processedBody.kidsSizes = [];
    }

    const validatedData = productSchema.parse(processedBody);

    // Handle patchIds
    if (validatedData.patchIds.length > 0) {
      const Patch = require("@/lib/models/Patch").default;
      const existingPatches = await Patch.find({ _id: { $in: validatedData.patchIds }, isActive: true });
      if (existingPatches.length !== validatedData.patchIds.length) {
        return NextResponse.json({ error: "One or more patches not found or inactive" }, { status: 400 });
      }
    }

    // Generate slug if missing
    if (!validatedData.slug) {
      validatedData.slug = validatedData.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    }

    const existingProduct = await Product.findOne({ slug: validatedData.slug });
    if (existingProduct) validatedData.slug += `-${Date.now()}`;

    const product = await Product.create(validatedData);
    return NextResponse.json(product);
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("[PRODUCTS_POST]", err);
    return NextResponse.json({ error: "Failed to create product", details: message }, { status: 500 });
  }
}
