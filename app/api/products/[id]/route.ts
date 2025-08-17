import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Patch from "@/lib/models/Patch";
import { z } from "zod";
import mongoose from "mongoose";


// More flexible schema for updates - make more fields optional
const productUpdateSchema = z.object({
  title: z.string().min(2, "Title must be at least 2 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  basePrice: z.number().min(0, "Base price cannot be negative").default(30),
  retroPrice: z
    .number()
    .min(0, "Retro price cannot be negative")
    .default(35)
    .optional(),
  shippingPrice: z
    .number()
    .min(0, "Shipping price cannot be negative")
    .default(0)
    .optional(),
  stockQuantity: z
    .number()
    .min(0, "Stock quantity cannot be negative")
    .default(0),
  images: z.array(z.string()).min(1, "At least one image is required"),
  videos: z.array(z.string()).optional(),
  hasShorts: z.boolean().default(true).optional(),
  hasSocks: z.boolean().default(true).optional(),
  hasPlayerEdition: z.boolean().default(true).optional(),
  adultSizes: z.array(z.string()).default(["S", "M", "L", "XL", "XXL"]),
  kidsSizes: z.array(z.string()).default([]),
  category: z.string(), // Accept any category value when updating
  allowsNumberOnShirt: z.boolean().default(true).optional(),
  allowsNameOnShirt: z.boolean().default(true).optional(),
  isActive: z.boolean().default(true).optional(),
  feature: z.boolean().default(true).optional(),
  slug: z.string().optional(),
  // Allow other fields to be passed through
  isRetro: z.boolean().optional(),
  isMysteryBox: z.boolean().optional(),
  // Patch relationships
  patchIds: z.array(z.string()).optional().default([]),
});

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    await connectDB();

    let product;

    // Check if the ID is a valid MongoDB ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      // If it's a valid ObjectId, search by _id
      product = await Product.findById(id).populate('patchIds');
    } else {
      // If not a valid ObjectId, try looking up by slug
      product = await Product.findOne({ slug: id }).populate('patchIds');
    }

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Convert Mongoose document to plain object
    const productObj = product.toObject();

    // Ensure shippingPrice exists with a default value of 0
    if (productObj.shippingPrice === undefined) {
      productObj.shippingPrice = 0;
      console.log("Setting default shipping price to 0");
    }

    // Ensure videos field exists with default empty array
    if (!productObj.videos) {
      productObj.videos = [];
      console.log("Setting default videos array for product:", id);
    }

    // Handle migration from old schema to new schema if necessary
    if (
      productObj.sizes &&
      (!productObj.adultSizes || productObj.adultSizes.length === 0)
    ) {
      // Convert all old sizes to upper case and consider them adult sizes
      productObj.adultSizes = productObj.sizes
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
      if (!productObj.kidsSizes) {
        productObj.kidsSizes = [];

        // Check if any of the original sizes might be kid sizes
        productObj.sizes.forEach((size: string) => {
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
              productObj.kidsSizes.push("XS");
            } else if (normalizedSize.includes("S")) {
              productObj.kidsSizes.push("S");
            } else if (normalizedSize.includes("M")) {
              productObj.kidsSizes.push("M");
            } else if (normalizedSize.includes("L")) {
              productObj.kidsSizes.push("L");
            } else if (normalizedSize.includes("XL")) {
              productObj.kidsSizes.push("XL");
            }
          }
        });
      }

      console.log("Migrated product sizes for GET request:", {
        oldSizes: productObj.sizes,
        newAdultSizes: productObj.adultSizes,
        newKidSizes: productObj.kidsSizes,
      });
    }

    return NextResponse.json(productObj);
  } catch (error) {
    console.error("Error fetching product:", error);
    return NextResponse.json(
      { error: "Failed to fetch product" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Check if session exists
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }
    const role = (session.user as any)?.role as string | undefined;
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Received product update data:", JSON.stringify(body, null, 2));

    // Ensure numeric fields are properly converted
    const processedBody = {
      ...body,
      basePrice:
        typeof body.basePrice === "string"
          ? parseFloat(body.basePrice)
          : body.basePrice,
      retroPrice:
        typeof body.retroPrice === "string"
          ? parseFloat(body.retroPrice)
          : body.retroPrice || 35, // Default to 35 if missing
      shippingPrice:
        typeof body.shippingPrice === "string"
          ? parseFloat(body.shippingPrice)
          : body.shippingPrice ?? 0, // Default to 0 if missing
      stockQuantity:
        typeof body.stockQuantity === "string"
          ? parseInt(body.stockQuantity, 10)
          : body.stockQuantity,
    };

    // Ensure we have adultSizes and kidsSizes (handling migration from old schema)
    if (!processedBody.adultSizes || processedBody.adultSizes.length === 0) {
      // If we have old 'sizes' data, convert those
      if (processedBody.sizes && processedBody.sizes.length > 0) {
        processedBody.adultSizes = processedBody.sizes
          .map((size: string) => {
            // Handle case variations and normalize
            const normalizedSize = size.trim().toUpperCase();

            // Map common size variations to standard format
            if (normalizedSize === "XXS") return null; // XXS is not in adult sizes
            if (normalizedSize === "S" || normalizedSize === "SMALL")
              return "S";
            if (normalizedSize === "M" || normalizedSize === "MEDIUM")
              return "M";
            if (normalizedSize === "L" || normalizedSize === "LARGE")
              return "L";
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
      } else {
        // Default to all adult sizes if no sizes data
        processedBody.adultSizes = ["S", "M", "L", "XL", "XXL"];
      }
    }

    if (!processedBody.kidsSizes) {
      processedBody.kidsSizes = [];

      // Check if any of the original sizes might be kid sizes
      if (processedBody.sizes && processedBody.sizes.length > 0) {
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
    }

    console.log("Migrated product sizes for PUT request:", {
      oldSizes: processedBody.sizes,
      newAdultSizes: processedBody.adultSizes,
      newKidSizes: processedBody.kidsSizes,
    });

    try {
      const validatedData = productUpdateSchema.parse(processedBody);

      // Update slug only if title changed and no custom slug provided
      if (
        validatedData.title &&
        (!validatedData.slug || validatedData.slug === "")
      ) {
        validatedData.slug = validatedData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "-")
          .replace(/(^-|-$)/g, "");

        // Check for duplicate slug excluding the current product
        const existingProduct = await Product.findOne({
          slug: validatedData.slug,
          _id: { $ne: id },
        });

        if (existingProduct) {
          // Add timestamp to make slug unique
          validatedData.slug = `${validatedData.slug}-${Date.now()}`;
        }
      }

      await connectDB();

      // Handle patch relationships
      if (validatedData.patchIds) {
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

      // Use findByIdAndUpdate with { runValidators: false } to skip mongoose validations
      const product = await Product.findByIdAndUpdate(id, validatedData, {
        new: true,
        runValidators: false, // Skip mongoose validators
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(product);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        // Return detailed validation error information
        return NextResponse.json(
          {
            error: "Validation error",
            details: validationError.errors,
            issues: validationError.issues,
            formData: processedBody,
          },
          { status: 400 }
        );
      }
      throw validationError; // Re-throw if not a Zod error
    }
  } catch (error) {
    console.error("Error updating product:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    const errorStack = error instanceof Error ? error.stack : undefined;

    console.error("Error details:", {
      message: errorMessage,
      stack: errorStack,
    });

    return NextResponse.json(
      {
        error: "Failed to update product",
        message: errorMessage,
        ...(process.env.NODE_ENV !== "production" && { stack: errorStack }),
      },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Check if session exists
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }
    const role2 = (session.user as any)?.role as string | undefined;
    if (role2 !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await request.json();
    console.log("Received PATCH request data:", JSON.stringify(body, null, 2));

    // Create a minimal update schema for PATCH requests
    const patchSchema = z.object({
      isActive: z.boolean().optional(),
      feature: z.boolean().optional(),
      stockQuantity: z.number().optional(),
      basePrice: z.number().optional(),
      retroPrice: z.number().optional(),
      shippingPrice: z.number().optional(),
    });

    try {
      const validatedData = patchSchema.parse(body);

      await connectDB();

      const product = await Product.findByIdAndUpdate(id, validatedData, {
        new: true,
        runValidators: false,
      });

      if (!product) {
        return NextResponse.json(
          { error: "Product not found" },
          { status: 404 }
        );
      }

      return NextResponse.json(product);
    } catch (validationError) {
      console.error("Validation error:", validationError);
      if (validationError instanceof z.ZodError) {
        return NextResponse.json(
          {
            error: "Validation error",
            details: validationError.errors,
          },
          { status: 400 }
        );
      }
      throw validationError;
    }
  } catch (error) {
    console.error("Error updating product:", error);
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error occurred";

    return NextResponse.json(
      {
        error: "Failed to update product",
        message: errorMessage,
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: "Invalid product ID format" },
        { status: 400 }
      );
    }

    const session = await getServerSession(authOptions);

    // Check if session exists and user has admin role
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized - Not logged in" },
        { status: 401 }
      );
    }
    const role3 = (session.user as any)?.role as string | undefined;
    if (role3 !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // For debugging
    console.log("Session user:", session.user);

    await connectDB();
    const product = await Product.findByIdAndDelete(id);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Product deleted successfully" });
  } catch (error) {
    console.error("Error deleting product:", error);
    return NextResponse.json(
      { error: "Failed to delete product" },
      { status: 500 }
    );
  }
}
