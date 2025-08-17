import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Patch from "@/lib/models/Patch";
import { z } from "zod";
import { NextRequest } from "next/server";
import { PATCH_CATEGORIES } from "@/lib/types/patch";
import mongoose from "mongoose";

// Schema for update validation
const updatePatchSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters").optional(),
  description: z.string().min(10, "Description must be at least 10 characters").optional(),
  imageUrl: z.string().url("Image URL must be a valid URL").optional(),
  category: z.enum(PATCH_CATEGORIES).optional(),
  price: z.number().min(0, "Price cannot be negative").optional(),
  isActive: z.boolean().optional(),
  isFeatured: z.boolean().optional(),
  sortOrder: z.number().optional(),
  metadata: z.record(z.string()).optional(),
});

// GET - Public access for reading a specific patch
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid patch ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const patch = await Patch.findById(id).lean();

    if (!patch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    // Only return active patches for public access
    if (!(patch as any).isActive) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ patch });
  } catch (error) {
    console.error("Error fetching patch:", error);
    return NextResponse.json(
      { error: "Failed to fetch patch" },
      { status: 500 }
    );
  }
}

// PUT - Admin only for updating patches
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid patch ID" },
        { status: 400 }
      );
    }

    await connectDB();

    const body = await request.json();

    // Validate input
    const validatedData = updatePatchSchema.parse(body);

    // Find and update patch
    const patch = await Patch.findByIdAndUpdate(
      id,
      {
        ...validatedData,
        updatedBy: session.user.email,
      },
      { new: true, runValidators: true }
    );

    if (!patch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Patch updated successfully",
      patch: patch.toJSON(),
    });
  } catch (error) {
    console.error("Error updating patch:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: "Validation error", details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: "Failed to update patch" },
      { status: 500 }
    );
  }
}

// DELETE - Admin only for deleting patches
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);

    // Check if user is authenticated and is admin
    if (!session?.user?.email) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (session.user.role !== "admin") {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      );
    }

    const { id } = await params;

    // Validate ObjectId
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid patch ID" },
        { status: 400 }
      );
    }

    await connectDB();

    // Find and delete patch
    const patch = await Patch.findByIdAndDelete(id);

    if (!patch) {
      return NextResponse.json(
        { error: "Patch not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      message: "Patch deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting patch:", error);
    return NextResponse.json(
      { error: "Failed to delete patch" },
      { status: 500 }
    );
  }
} 