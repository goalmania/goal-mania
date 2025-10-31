import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { z } from "zod";
import { headers } from "next/headers";
import { decode } from "next-auth/jwt";

const reviewSchema = z.object({
  rating: z.number().min(1).max(5),
  comment: z.string().min(1).max(1000),
  media: z.object({
    images: z.array(z.string()).optional(),
    videos: z.array(z.string()).optional(),
  }).optional(),
});

export async function POST(request: Request) {
  try {
    // Get the session using getServerSession
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: "You must be logged in to submit a review",
          code: "NO_SESSION",
        },
        { status: 401 }
      );
    }

    if (!session.user?.id) {
      return NextResponse.json(
        {
          error: "Invalid session. Please log in again.",
          code: "INVALID_SESSION",
        },
        { status: 401 }
      );
    }

    const productId = new URL(request.url).pathname.split("/")[3];
    const { rating, comment, media } = await request.json();

    try {
      reviewSchema.parse({ rating, comment, media });
    } catch (validationError) {
      return NextResponse.json(
        { error: "Invalid review data", details: validationError },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Create a new review object with all required fields
    const newReview = {
      userId: session.user.id.toString(), // Ensure userId is a string
      userName: session.user.name || "Anonymous",
      rating,
      comment,
      media: media || { images: [], videos: [] },
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    // Add the review to the product's reviews array
    if (Array.isArray(product.reviews)) {
      product.reviews.push(newReview);
    }

    // Save the product with the new review
    await product.save();

    return NextResponse.json(newReview);
  } catch (error) {
    console.error("Error submitting review:", error);
    return NextResponse.json(
      {
        error: "Failed to submit review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  try {
    // Get the session using getServerSession
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        {
          error: "You must be logged in to delete a review",
          code: "NO_SESSION",
        },
        { status: 401 }
      );
    }

    if (!session.user?.id) {
      return NextResponse.json(
        {
          error: "Invalid session. Please log in again.",
          code: "INVALID_SESSION",
        },
        { status: 401 }
      );
    }

    const productId = new URL(request.url).pathname.split("/")[3];
    const { searchParams } = new URL(request.url);
    const reviewId = searchParams.get("reviewId");

    if (!reviewId) {
      return NextResponse.json(
        { error: "Review ID is required" },
        { status: 400 }
      );
    }

    await connectDB();
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Find the review in the product's reviews array
    const reviewIndex = product.reviews.findIndex(
      (review: any) => review._id?.toString() === reviewId
    );

    if (reviewIndex === -1) {
      return NextResponse.json({ error: "Review not found" }, { status: 404 });
    }

    const review = product.reviews[reviewIndex];

    // Check if the user is the owner of the review or an admin
    if (review.userId !== session.user.id && session.user.role !== "admin") {
      return NextResponse.json(
        {
          error: "You can only delete your own reviews",
          code: "UNAUTHORIZED",
        },
        { status: 403 }
      );
    }

    // Remove the review from the array
    product.reviews.splice(reviewIndex, 1);

    // Save the product
    await product.save();

    return NextResponse.json({ 
      success: true, 
      message: "Review deleted successfully" 
    });
  } catch (error) {
    console.error("Error deleting review:", error);
    return NextResponse.json(
      {
        error: "Failed to delete review",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const productId = new URL(request.url).pathname.split("/")[3];

    await connectDB();
    const product = await Product.findById(productId);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    // Return the reviews array or empty array if no reviews
    return NextResponse.json(product.reviews || []);
  } catch (error) {
    console.error("Error fetching reviews:", error);
    return NextResponse.json(
      {
        error: "Failed to fetch reviews",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
