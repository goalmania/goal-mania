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

function buildProductKeywords(p: {
  title: string;
  isRetro?: boolean;
  isWorldCup?: boolean;
  country?: string;
  nationalTeam?: string;
}): string[] {
  const words = (p.title || "").split(/\s+/);
  // Title pattern: "Maglia [Team] [KitType?] [Season?]"
  const team = words[1] || "";

  // Extract season like "2025/26", "2026/27", "96/97"
  const seasonMatch = p.title.match(/\d{2,4}\/\d{2,4}/);
  const season = seasonMatch ? seasonMatch[0] : null;

  // Detect short season notation for extra variant (e.g. "25/26" from "2025/26")
  const shortSeason = season && season.length > 5 ? season.slice(2) : null;

  // Extract kit type
  const kitTypeMap: Record<string, string> = {
    home: "Home", away: "Away", third: "Third", fourth: "Fourth",
    retro: "Retro", vintage: "Vintage", portiere: "Portiere",
  };
  const kitType = Object.keys(kitTypeMap).find((k) =>
    p.title.toLowerCase().includes(k)
  ) || null;
  const kitLabel = kitType ? kitTypeMap[kitType] : null;

  const nationalName = p.country || p.nationalTeam || "";

  const kw: (string | null)[] = [
    p.title,
    team ? `maglia ${team}` : null,
    team ? `maglie ${team}` : null,
    team ? `acquista maglia ${team}` : null,
    team ? `maglia calcio ${team}` : null,
    // Season variants
    season && team ? `maglia ${team} ${season}` : null,
    shortSeason && team ? `maglia ${team} ${shortSeason}` : null,
    // Kit + team
    kitLabel && team ? `maglia ${team} ${kitLabel.toLowerCase()}` : null,
    // Kit + team + season (the money keyword: "maglia milan home 2025/26")
    kitLabel && team && season ? `maglia ${team} ${kitLabel.toLowerCase()} ${season}` : null,
    shortSeason && kitLabel && team ? `maglia ${team} ${kitLabel.toLowerCase()} ${shortSeason}` : null,
    // Nuova maglia
    team ? `nuova maglia ${team}` : null,
    season && team ? `nuova maglia ${team} ${season}` : null,
    // Retro
    p.isRetro && team ? `maglia ${team} retro` : null,
    p.isRetro && team ? `maglia ${team} vintage` : null,
    p.isRetro && team ? `maglia ${team} storica` : null,
    p.isRetro ? "maglie calcio retro" : null,
    p.isRetro ? "maglie calcio vintage" : null,
    // World Cup / Nazionale
    p.isWorldCup && nationalName ? `maglia ${nationalName}` : null,
    p.isWorldCup && nationalName ? `maglia ${nationalName} mondiali` : null,
    p.isWorldCup && nationalName ? `maglia ${nationalName} 2026` : null,
    // Generic
    "maglia calcio",
    "acquista online",
    "spedizione gratuita Italia",
  ];

  return [...new Set(kw.filter(Boolean) as string[])];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  try {
    await connectDB();
    let product = await Product.findOne({ slug: id }).select("title description images basePrice slug isRetro isWorldCup country nationalTeam category").lean();
    if (!product && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id).select("title description images basePrice slug isRetro isWorldCup country nationalTeam category").lean();
    }

    if (!product) return { title: "Prodotto non trovato" };

    const p = product as any;
    const slug = p.slug || id;
    const productUrl = `https://goal-mania.it/products/${slug}`;

    // Rich title using the real product title (should include season + kit type)
    const title = `${p.title} | Acquista Online a €${p.basePrice ?? 30}`;

    // Use DB description if long enough, otherwise build a rich fallback
    // Strip "ufficiale/i" (legal risk) replacing with "da collezione"
    const sanitizeDesc = (s: string) => s.replace(/\bufficial[ei]\b/gi, "da collezione");
    const hasRichDesc = p.description && p.description.length > 60;
    const description = hasRichDesc
      ? sanitizeDesc(p.description.slice(0, 160))
      : (() => {
          const seasonMatch = (p.title as string).match(/\d{2,4}\/\d{2,4}/);
          const season = seasonMatch ? seasonMatch[0] : "2025/26";
          const retro = p.isRetro ? "Maglia storica vintage. " : "";
          const wc = p.isWorldCup ? "Maglia nazionale per i Mondiali 2026. " : "";
          return `Acquista ${p.title} a €${p.basePrice ?? 30} su Goal Mania. ${retro}${wc}Spedizione gratuita in Italia. Stagione ${season}.`;
        })();

    const image = p.images?.[0];
    const keywords = buildProductKeywords(p);

    return {
      title,
      description,
      keywords,
      alternates: { canonical: productUrl },
      openGraph: {
        title,
        description,
        images: image ? [{ url: image, alt: p.title, width: 800, height: 800 }] : [],
        type: "website",
        url: productUrl,
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

    // Try by slug first (most common case), then fallback to ObjectId
    product = await Product.findOne({ slug: id });
    if (!product && mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
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

  // Derive category label for schema
  const categoryLabel = product.isRetro
    ? "Abbigliamento > Abbigliamento Sportivo > Maglie Calcio Retro"
    : product.isWorldCup
    ? "Abbigliamento > Abbigliamento Sportivo > Maglie Calcio Nazionali"
    : "Abbigliamento > Abbigliamento Sportivo > Maglie Calcio";

  const hasReviews = product.reviews?.length > 0;
  const avgRating = hasReviews
    ? product.reviews.reduce((sum: number, r: { rating: number }) => sum + (r.rating || 0), 0) / product.reviews.length
    : null;

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
    category: categoryLabel,
    brand: {
      "@type": "Brand",
      name: "Goal Mania",
    },
    offers: {
      "@type": "Offer",
      url: productUrl,
      priceCurrency: "EUR",
      price: product.basePrice ?? 30,
      priceValidUntil: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split("T")[0],
      availability:
        (product.stockQuantity ?? 1) > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/NewCondition",
      shippingDetails: {
        "@type": "OfferShippingDetails",
        shippingRate: { "@type": "MonetaryAmount", value: "0", currency: "EUR" },
        shippingDestination: { "@type": "DefinedRegion", addressCountry: "IT" },
        deliveryTime: {
          "@type": "ShippingDeliveryTime",
          handlingTime: { "@type": "QuantitativeValue", minValue: 1, maxValue: 2, unitCode: "DAY" },
          transitTime: { "@type": "QuantitativeValue", minValue: 2, maxValue: 5, unitCode: "DAY" },
        },
      },
      seller: {
        "@type": "Organization",
        name: "Goal Mania",
        url: "https://goal-mania.it",
      },
    },
    ...(hasReviews && avgRating !== null && {
      aggregateRating: {
        "@type": "AggregateRating",
        ratingValue: avgRating,
        reviewCount: product.reviews.length,
        bestRating: 5,
        worstRating: 1,
      },
    }),
  };

  // Breadcrumb with category context
  const categoryName = product.isRetro ? "Maglie Retro" : product.isWorldCup ? "Mondiali" : "Shop";
  const categoryUrl = product.isRetro
    ? "https://goal-mania.it/shop/retro"
    : product.isWorldCup
    ? "https://goal-mania.it/shop/worldcup"
    : "https://goal-mania.it/shop";

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://goal-mania.it" },
      { "@type": "ListItem", position: 2, name: categoryName, item: categoryUrl },
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
      {/* SSR H1 for SEO — the visual H1 is rendered by ProductDetailClient */}
      <h1 className="sr-only">{product.title}</h1>
      <Suspense fallback={<div>Loading...</div>}>
        <ProductDetailClient product={product} />
      </Suspense>
    </>
  );
}
