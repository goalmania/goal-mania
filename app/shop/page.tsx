import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import ShopClient from "@/app/components/ShopClient";
import { IProduct } from "@/lib/types/product";

// Disable caching for this page
export const dynamic = "force-dynamic";

async function getFeaturedProducts() {
  await connectDB();
  const products = await Product.find({
    feature: true,
    isActive: true,
  }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

export default async function ShopPage() {
  const serverProducts = await getFeaturedProducts();

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
    category: product.category || "Uncategorized", // Ensure category is never undefined
    team: product.title ? product.title.split(" ")[0] : "Unknown", // Ensure team is never undefined
  }));

  // test

  return (
    <div className="pt-[90px] sm:pt-[110px]">
      <ShopClient products={products} />
    </div>
  );
}
