import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import SerieAClient from "@/app/_components/SerieAClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edizioni Limitate | Goal Mania",
  description: "Scopri le nostre maglie in edizione limitata",
};

// Enable ISR
export const revalidate = 300;

async function getLimitedEditionProducts() {
  await connectDB();
  const products = await Product.find({
    category: "Edizioni Limitate",
    isActive: true,
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products));
}

export default async function LimitedEditionPage() {
  const serverProducts = await getLimitedEditionProducts();

  // Filter and map products
  const validProducts = serverProducts.filter(
    (product: IProduct) => product._id && product.title
  );

  const products = validProducts.map((product: IProduct) => ({
    id: product._id || "",
    name: product.title || "Untitled Product",
    price: product.basePrice || 0,
    image: product.images?.[0] || "/images/image.png",
    category: product.category || "Edizioni Limitate",
    team: product.title ? product.title.split(" ")[1] : "Unknown",
    videos: product.videos || [],
  }));

  return <SerieAClient products={products} />;
}
