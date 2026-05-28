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
    const title = `${p.title} | Acquista Online — Goal Mania`;
    const description =
      p.description?.slice(0, 160) ??
      `Acquista ${p.title} su Goal Mania a partire da €${p.basePrice ?? 30}. Spedizione gratuita in Italia.`;
    const image = p.images?.[0];
    const slug = p.slug || id;

    return {
      title,
      description,
      keywords: [p.title, "maglia calcio", "acquista online", "spedizione gratuita"],
      alternates: {
        canonical: `https://goal-mania.it/products/${slug}`,
      },
      openGraph: {
        title,
        description,
        images: image ? [{ url: image, alt: p.title, width: 800, height: 800 }] : [],
        type: "website",
        url: `https://goal-mania.it/products/${slug}`,
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

  const slug = product.slug || id;
  const productUrl = `https://goal-mania.it/products/${slug}`;
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.title,
    description:
      product.description ||
      `Acquista ${product.title} su Goal Mania. Spedizione gratuita in Italia.`,
    image: product.images ?? [],
    url: productUrl,
    sku: product.slug || product._id,
    brand: {
      "@type": "Brand",
      name: "Goal Mania",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: product.basePrice ?? 30,
      availability:
        (product.stockQuantity ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      seller: {
        "@type": "Organization",
        name: "Goal Mania",
        url: "https://goal-mania.it",
      },
    },
    ...(product.reviews?.length > 0 && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue:
          product.reviews.reduce(
            (sum: number, r: { rating: number }) => sum + (r.rating || 0),
            0
          ) / product.reviews.length,
        reviewCount: product.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://goal-mania.it" },
      { "@type": "ListItem", position: 2, name: "Shop", item: "https://goal-mania.it/shop" },
      { "@type": "ListItem", position: 3, name: product.title, item: productUrl },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <Suspense fallback={<div>Loading...</div>}>
        <ProductDetailClient product={product} />
      </Suspense>
    </>
  );
}
