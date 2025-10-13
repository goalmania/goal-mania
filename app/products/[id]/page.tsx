import { notFound } from "next/navigation";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Patch from "@/lib/models/Patch";
import ProductDetailClient from "@/app/_components/ProductDetailClient";
import { Suspense } from "react";
import mongoose from "mongoose";

// Incremental Static Regeneration for product detail
export const revalidate = 600;

async function getProduct(id: string) {
  try {
    await connectDB();
    
    const product = await Product.findById(id)
      .populate("patchIds")
      .lean();

    if (!product) {
      notFound();
    }

    // ✅ Serialize the product and patches to plain objects
    const serializedProduct = JSON.parse(JSON.stringify(product));

    return {
      ...serializedProduct,
      patches: serializedProduct.patchIds || [],
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    notFound();
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
