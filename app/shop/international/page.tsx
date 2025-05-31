import SerieAClient from "@/app/components/SerieAClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";

// Disable caching for this page
export const dynamic = "force-dynamic";

async function getInternationalProducts() {
  await connectDB();
  const products = await Product.find({
    $or: [{ category: "International" }, { category: "SeriesA/International" }],
    isActive: true,
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

export default async function InternationalShopPage() {
  const serverProducts = await getInternationalProducts();

  // Map server products to client format
  const products = serverProducts.map((product: IProduct) => ({
    id: product._id || "",
    name: product.title || "Unknown Product",
    price: product.basePrice || 0,
    image: product.images?.[0] || "/images/image.png",
    category: product.category || "International",
    team: product.title ? product.title.split(" ")[0] : "Unknown",
  }));

  return <SerieAClient products={products} />;
}
