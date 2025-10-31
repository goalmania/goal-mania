import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { Review } from "@/lib/models/Review";

interface ProductReview {
  id: string;
  userId: string;
  userName: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  productId: string;
  productName: string;
  productImage: string;
  source: "product" | "standalone";
}

export async function GET() {
  try {
    await connectDB();
    const allReviews: ProductReview[] = [];

    // First fetch products with reviews
    const products = await Product.find().lean();

    // Process product reviews
    for (const product of products) {
      if (product.reviews && Array.isArray(product.reviews)) {
        for (const review of product.reviews) {
          // Skip invalid reviews
          if (!review || !review.rating) {
            continue;
          }

          allReviews.push({
            id:
              review._id?.toString() ||
              `product_review_${Math.random().toString(36).substring(2, 15)}`,
            userId: review.userId || "",
            userName: review.userName || "Anonymous",
            rating: review.rating,
            comment: review.comment || "",
            createdAt:
              review.createdAt
                ? (typeof review.createdAt === "string"
                    ? review.createdAt
                    : (review.createdAt as Date).toISOString())
                : new Date().toISOString(),
            updatedAt:
              review.updatedAt
                ? (typeof review.updatedAt === "string"
                    ? review.updatedAt
                    : (review.updatedAt as Date).toISOString())
                : new Date().toISOString(),
            productId: product._id ? product._id.toString() : "",
            productName: product.title || "Unknown Product",
            productImage:
              product.images && product.images.length > 0
                ? product.images[0]
                : "",
            source: "product" as const,
          });
        }
      }
    }

    // Then fetch standalone reviews
    const standaloneReviews = await Review.find().lean();

    // Process standalone reviews
    for (const review of standaloneReviews) {
      if (!review.productId) {
        continue;
      }

      // Find the associated product for additional info
      const product = products.find(
        (p) => p._id && p._id.toString() === review.productId.toString()
      );

      allReviews.push({
        id: review._id
          ? review._id.toString()
          : `standalone_review_${Math.random().toString(36).substring(2, 15)}`,
        userId: "",
        userName: review.name || "Anonymous",
        rating: review.rating,
        comment: review.comment || "",
        createdAt: review.createdAt || new Date().toISOString(),
        updatedAt: review.createdAt || new Date().toISOString(),
        productId: review.productId.toString(),
        productName: product
          ? product.title || "Unknown Product"
          : "Unknown Product",
        productImage:
          product && product.images && product.images.length > 0
            ? product.images[0]
            : "",
        source: "standalone" as const,
      });
    }

    // Sort by date (newest first) and randomize for variety
    const sortedReviews = allReviews
      .filter((review) => !!review.comment && review.comment.length > 0)
      .sort(() => Math.random() - 0.5);

    return NextResponse.json(sortedReviews);
  } catch (error) {
    console.error("[ALL_REVIEWS_GET]", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
