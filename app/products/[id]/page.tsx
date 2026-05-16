import { notFound } from "next/navigation";
import { Metadata } from "next";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Patch from "@/lib/models/Patch";
import ProductDetailClient from "@/app/_components/ProductDetailClient";
import { Suspense } from "react";
import mongoose from "mongoose";

// Incremental Static Regeneration for product detail
export const revalidate = 600;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    const isValidObjectId = mongoose.Types.ObjectId.isValid(id);
    const product = isValidObjectId
      ? await Product.findById(id).select("title description images basePrice").lean()
      : await Product.findOne({ slug: id }).select("title description images basePrice").lean();

    if (!product) return { title: "Prodotto non trovato" };

    const p = product as any;
    const title = p.title;
    const description = p.description?.slice(0, 160) ?? `Acquista ${p.title} su Goal Mania. Spedizione rapida.`;
    const image = p.images?.[0];

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        images: image ? [{ url: image, alt: p.title }] : [],
        type: "website",
      },
      twitter: {
        card: "summary_large_image",
        title,
        description,
        images: image ? [image] : [],
      },
    };
  } catch {
    return { title: "Goal Mania - Maglie Calcio" };
  }
}

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

    // Serialize the product
    const serializedProduct = JSON.parse(JSON.stringify(product));
    
    // Fetch ALL active patches (global for all products)
    const patches = await Patch.find({ isActive: true }).lean();
    serializedProduct.patches = patches;

    return serializedProduct;
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
