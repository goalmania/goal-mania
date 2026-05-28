import { Metadata } from "next";
import Season2025Client from "@/app/_components/Season2025Client";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";

export const revalidate = 300;

export const metadata: Metadata = {
  title: "Maglie Calcio 2025/26 | Nuova Stagione — Goal Mania",
  description:
    "Tutte le maglie da calcio della stagione 2025/26. Home e away kit delle migliori squadre europee a partire da 30€. Spedizione gratuita in Italia.",
  alternates: {
    canonical: "https://goal-mania.it/shop/2025/26",
  },
  openGraph: {
    title: "Maglie Calcio 2025/26 | Goal Mania",
    description: "Home e away kit stagione 2025/26 a partire da 30€.",
    url: "https://goal-mania.it/shop/2025/26",
    type: "website",
  },
};

async function get2025Products() {
  await connectDB();
  const products = await Product.find({
    category: "2025/26",
    isActive: true,
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

export default async function Season2025ShopPage() {
  const serverProducts = await get2025Products();

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
    category: product.category || "2025/26", // Ensure category is never undefined
    team: product.title ? product.title.split(" ")[1] : "Unknown", // Extract team name (second word)
    videos: product.videos || [], // Include videos for showcase
  }));

  return <Season2025Client products={products} />;
}
