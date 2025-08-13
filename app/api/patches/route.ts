import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Patch from "@/lib/models/Patch";
import { z } from "zod";
import { NextRequest } from "next/server";
import { PATCH_CATEGORIES } from "@/lib/types/patch";
import { createPatchSchema } from "@/lib/schemas/patch";


// GET - Public access for reading patches
export async function GET(req: NextRequest) {
  try {
    const searchParams = req.nextUrl.searchParams;
    const category = searchParams.get("category");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);
    const search = searchParams.get("search") || "";
    const featured = searchParams.get("featured") === "true";
    const includeInactive = searchParams.get("includeInactive") === "true";
    const sortBy = searchParams.get("sortBy") || "sortOrder";
    const sortOrder = searchParams.get("sortOrder") || "asc";

    // Validate pagination parameters
    const validatedPage = Math.max(1, page);
    const validatedLimit = Math.min(100, Math.max(1, limit)); // Cap at 100 items per page

    await connectDB();

    // Build query
    const query: any = {};

    // Only show active patches for public access unless explicitly requested
    if (!includeInactive) {
      query.isActive = true;
    }

    // Add category filter if provided
    if (category && PATCH_CATEGORIES.includes(category as any)) {
      query.category = category;
    }

    // Add featured filter if provided
    if (featured) {
      query.isFeatured = true;
    }

    // Add search filter if provided
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { category: { $regex: search, $options: "i" } },
      ];
    }

    // Calculate skip value for pagination
    const skip = (validatedPage - 1) * validatedLimit;

    // Build sort object
    const sort: any = {};
    sort[sortBy] = sortOrder === "desc" ? -1 : 1;

    // Execute query
    const patches = await Patch.find(query)
      .sort(sort)
      .skip(skip)
      .limit(validatedLimit)
      .lean();

    // Get total count for pagination
    const total = await Patch.countDocuments(query);

    // Calculate pagination info
    const totalPages = Math.ceil(total / validatedLimit);
    const hasNextPage = validatedPage < totalPages;
    const hasPrevPage = validatedPage > 1;

    return NextResponse.json({
      patches,
      pagination: {
        page: validatedPage,
        limit: validatedLimit,
        total,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error("Error fetching patches:", error);
    return NextResponse.json(
      { error: "Failed to fetch patches" },
      { status: 500 }
    );
  }
}

// POST - Admin only for creating patches
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin (you may need to adjust this based on your admin check logic)
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    const validatedData = createPatchSchema.parse(body);

    // Create new patch
    const patch = new Patch({
      ...validatedData,
      createdBy: session.user.email,
      updatedBy: session.user.email,
    });

    await patch.save();

    return NextResponse.json(
      { 
        message: "Patch created successfully", 
        patch: patch.toJSON() 
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating patch:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to create patch" },
      { status: 500 }
    );
  }
} 