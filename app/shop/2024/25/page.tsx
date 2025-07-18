import Season2024Client from "@/app/_components/Season2024Client";
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
    category: product.category || "2024/25", // Ensure category is never undefined
    team: product.title ? product.title.split(" ")[0] : "Unknown", // Ensure team is never undefined
  }));

  return <Season2024Client products={products} />;
}
