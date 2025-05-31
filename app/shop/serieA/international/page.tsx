import SerieAClient from "@/app/components/SerieAClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";

// Disable caching for this page
export const dynamic = "force-dynamic";

async function getSerieAProducts() {
  await connectDB();
  const products = await Product.find({
    category: "SeriesA/International",
    isActive: true,
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

export default async function SerieAShopPage() {
  const serverProducts = await getSerieAProducts();

  // Map server products to client format
  const products = serverProducts.map((product: IProduct) => ({
    id: product._id,
    name: product.title,
    price: product.basePrice,
    image: product.images[0],
    category: product.category,
    team: product.title.split(" ")[0], // Extract team name from title
  }));

  return <SerieAClient products={products} />;
}
