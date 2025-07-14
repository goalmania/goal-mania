import Season2025Client from "@/app/components/Season2025Client";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";

// Disable caching for this page
export const dynamic = "force-dynamic";

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

  // Map server products to client format
  const products = serverProducts.map((product: IProduct) => ({
    id: product._id,
    name: product.title,
    price: product.basePrice,
    image: product.images[0],
    category: product.category,
    team: product.title.split(" ")[0], // Extract team name from title
  }));

  return <Season2025Client products={products} />;
}
