import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import SerieAClient from "@/app/_components/SerieAClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Resto del Mondo | Goal Mania",
  description: "Scopri le maglie dei migliori club dal resto del mondo",
};

// Enable ISR
export const revalidate = 300;

async function getRestOfWorldProducts() {
  await connectDB();
  const products = await Product.find({
    category: "Resto del Mondo",
    isActive: true,
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products));
}

export default async function RestOfWorldPage() {
  const serverProducts = await getRestOfWorldProducts();

  // Filter and map products
  const validProducts = serverProducts.filter(
    (product: IProduct) => product._id && product.title
  );

  const products = validProducts.map((product: IProduct) => ({
    id: product._id || "",
    name: product.title || "Untitled Product",
    price: product.basePrice || 0,
    image: product.images?.[0] || "/images/image.png",
    category: product.category || "Resto del Mondo",
    team: product.title ? product.title.split(" ")[1] : "Unknown",
    videos: product.videos || [],
  }));

  return <SerieAClient products={products} />;
}
