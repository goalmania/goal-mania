import Season2024Client from "@/app/components/Season2024Client";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";

// Disable caching for this page
export const dynamic = "force-dynamic";

async function get2024Products() {
  await connectDB();
  const products = await Product.find({
    category: "2024/25",
    isActive: true,
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

export default async function Season2024ShopPage() {
  const serverProducts = await get2024Products();

  // Map server products to client format
  const products = serverProducts.map((product: IProduct) => ({
    id: product._id,
    name: product.title,
    price: product.basePrice,
    image: product.images[0],
    category: product.category,
    team: product.title.split(" ")[0], // Extract team name from title
  }));

  return <Season2024Client products={products} />;
}
