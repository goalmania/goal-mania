import { Metadata } from "next";
import SerieAClient from "@/app/_components/SerieAClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Serie A 2025/26 | Inter, Milan, Juventus, Napoli — Goal Mania",
  description:
    "Acquista le maglie della Serie A 2025/26 a partire da 30€. Inter, Milan, Juventus, Napoli, Roma, Lazio, Atalanta, Fiorentina e altre. Spedizione gratuita in Italia.",
  keywords: [
    "maglie Serie A",
    "maglia Inter",
    "maglia Milan",
    "maglia Juventus",
    "maglia Napoli",
    "maglia Roma",
    "maglia Lazio",
    "maglie calcio Serie A 2025",
  ],
  alternates: {
    canonical: "https://goal-mania.it/shop/serieA",
  },
  openGraph: {
    title: "Maglie Serie A 2025/26 | Goal Mania",
    description:
      "Inter, Milan, Juventus, Napoli, Roma, Lazio e tutte le squadre di Serie A. Da 30€.",
    url: "https://goal-mania.it/shop/serieA",
    type: "website",
  },
};

async function getSerieAProducts() {
  await connectDB();
  // Get Serie A team products across all categories since "SerieA" category doesn't exist
  // Look for products with team names in title
  const serieATeams = ["Inter", "Milan", "Juventus", "Napoli", "Roma", "Lazio", 
    "Atalanta", "Fiorentina", "Torino", "Bologna", "Sassuolo",
    "Udinese", "Monza", "Lecce", "Frosinone", "Cagliari",
    "Genoa", "Empoli", "Verona", "Salernitana"];
  
  const teamRegex = serieATeams.join("|");
  const products = await Product.find({
    isActive: true,
    title: { $regex: new RegExp(`^Maglia\\s+(${teamRegex})`, 'i') }
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

function buildCollectionSchema(products: any[]) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Maglie Serie A 2025/26",
    url: "https://goal-mania.it/shop/serieA",
    description: "Acquista le maglie delle squadre di Serie A 2025/26 a partire da 30€. Inter, Milan, Juventus, Napoli, Roma, Lazio, Atalanta, Fiorentina e altre.",
    hasPart: products.slice(0, 10).map((p: any) => ({
      "@type": "Product",
      name: p.title,
      url: `https://goal-mania.it/products/${p.slug || p._id}`,
      offers: { "@type": "Offer", price: p.basePrice ?? 30, priceCurrency: "EUR" },
    })),
  };
}

export default async function SerieAShopPage() {
  const serverProducts = await getSerieAProducts();

  // Log products that might cause issues
  serverProducts.forEach((product: IProduct, index: number) => {
    if (!product._id) {
      console.warn(`Product at index ${index} is missing _id:`, product);
    }
    if (!product.images || !product.images.length) {
      console.warn(
        `Product with ID ${product._id || "unknown"} is missing images:`,
        product
      );
    }
  });

  // Filter out products with missing essential data
  const validProducts = serverProducts.filter(
    (product: IProduct) => product._id && product.title
  );

  // Map server products to client format
  const products = validProducts.map((product: IProduct) => ({
    id: product._id || "", // Ensure id is never undefined
    name: product.title || "Untitled Product", // Ensure name is never undefined
    price: product.basePrice || 0, // Ensure price is never undefined
    image: product.images?.[0] || "/images/image.png", // Ensure image is never undefined with a fallback
    category: product.category || "SerieA", // Ensure category is never undefined
    team: product.title ? product.title.split(" ")[1] : "Unknown", // Extract team name (second word)
    videos: product.videos || [], // Include videos for showcase
  }));

  const collectionSchema = buildCollectionSchema(serverProducts);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      <section className="pt-24 pb-4 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-black uppercase mb-2" style={{ fontFamily: "var(--font-barlow-condensed, sans-serif)", color: "#fff" }}>
          Maglie Serie A 2025/26
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Acquista le maglie delle squadre di Serie A 2025/26 a partire da 30€.
          Inter, Milan, Juventus, Napoli, Roma, Lazio, Atalanta, Fiorentina e altre.
          Spedizione gratuita in Italia.
        </p>
      </section>
      <SerieAClient products={products} />
    </>
  );
}
