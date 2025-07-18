import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import ProductDetailClient from "@/app/_components/ProductDetailClient";
import { Suspense } from "react";
import mongoose from "mongoose";

// Disable caching for this page
export const dynamic = "force-dynamic";

async function getProduct(id: string) {
  if (!id || typeof id !== "string") {
    return null;
  }

  try {
    await connectDB();

    let product;

    // Check if the ID is a valid MongoDB ObjectId
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);

    if (isValidObjectId) {
      // If it's a valid ObjectId, search by _id
      product = await Product.findById(id);
    } else {
      // If not a valid ObjectId, try looking up by slug
      product = await Product.findOne({ slug: id });
    }

    if (!product) {
      return null;
    }

    return JSON.parse(JSON.stringify(product)); // Serialize the Mongoose document
  } catch (error) {
    console.error("Error fetching product:", error);
    return null;
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const product = await getProduct(id);

  if (!product) {
    notFound();
  }

  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ProductDetailClient product={product} />
    </Suspense>
  );
}
