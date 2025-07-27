import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import MysteryBoxPageClient from "@/app/_components/MysteryBoxPageClient";

// Disable caching for this page
export const dynamic = "force-dynamic";

async function getMysteryBoxProducts() {
  await connectDB();
  const products = await Product.find({
    isMysteryBox: true,
    isActive: true,
  }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

export default async function MysteryBoxPage() {
  const serverProducts = await getMysteryBoxProducts();

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
    id: product._id || "",
    name: product.title || "Scatola Misteriosa",
    price: product.basePrice || 0,
    image: product.images?.[0] || "/images/image.png",
    category: product.category || "Mystery Box",
    team: "Mystery Box",
    isMysteryBox: product.isMysteryBox || false,
    videos: product.videos || [], // Include videos for showcase
  }));

  return (
    <div className="">
      <MysteryBoxPageClient products={products} />
    </div>
  );
} 