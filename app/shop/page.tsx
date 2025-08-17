/* eslint-disable @typescript-eslint/no-unused-vars */
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import ShopClientWrapper from "@/app/_components/ShopClientWrapper";
// Cache shop page and revalidate periodically
export const revalidate = 300;

async function getFeaturedProducts() {
  await connectDB();
  const products = await Product.find({
    feature: true,
    isActive: true,
  }).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

export default async function ShopPage() {
  return (
    <div className="">
      
      <ShopClientWrapper />
    </div>
  );
}
