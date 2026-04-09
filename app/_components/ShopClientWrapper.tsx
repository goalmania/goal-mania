import ShopClient from "./ShopClient";
import connectDB from "@/lib/db";
import ProductModel from "@/lib/models/Product";

interface Product {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  availablePatches?: string[];
  videos?: string[];
}

function mapProduct(product: any): Product {
  return {
    id: product._id?.toString() || "",
    name: product.title || "Unknown Product",
    price: product.basePrice || 0,
    image: product.images?.[0] || "/images/image.png",
    category: product.category || "Uncategorized",
    team: product.title ? product.title.split(" ")[0] : "Unknown",
    availablePatches: product.availablePatches || [],
    videos: product.videos || [],
  };
}

async function fetchLatestProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();
    return JSON.parse(JSON.stringify(products)).map(mapProduct);
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return [];
  }
}

async function fetchBestSellingProducts(): Promise<Product[]> {
  try {
    const bestSellerTitles = [
      "Maglia Away FC Barcelona x Travis Scott - Edizione Speciale",
      "Maglia Napoli Halloween 2025/26",
      "Maglia Juventus 25/26 Casa",
      "Maglia Inter 25/26 Casa",
      "Maglia Juventus 2019/20 Quarta",
      "Maglia Barcellona 2014/15 Home",
      "Maglia Barcellona 2010/11 Home"
    ];
    await connectDB();
    const bestSellers = await ProductModel.find({ title: { $in: bestSellerTitles } }).lean();
    return JSON.parse(JSON.stringify(bestSellers)).map(mapProduct);
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    return [];
  }
}

async function fetchFeaturedProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const featured = await ProductModel.find({ feature: true }).lean();
    return JSON.parse(JSON.stringify(featured)).map(mapProduct);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function fetchMysteryBoxProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const mysteryBoxes = await ProductModel.find({ isMysteryBox: true }).lean();
    return JSON.parse(JSON.stringify(mysteryBoxes)).map((p: any) => ({
      ...mapProduct(p),
      name: p.title || "Mystery Box",
      category: p.category || "Mystery Box",
      team: "Mystery",
    }));
  } catch (error) {
    console.error("Error fetching Mystery Box products:", error);
    return [];
  }
}

async function fetchVideoProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();
    return JSON.parse(JSON.stringify(products))
      .filter((p: any) => p.videos && Array.isArray(p.videos) && p.videos.length > 0)
      .map(mapProduct);
  } catch (error) {
    return [];
  }
}

export default async function ShopClientWrapper() {
  const [latestProducts, bestSellingProducts, featuredProducts, mysteryBoxProducts, videoProducts] =
    await Promise.all([
      fetchLatestProducts(),
      fetchBestSellingProducts(),
      fetchFeaturedProducts(),
      fetchMysteryBoxProducts(),
      fetchVideoProducts(),
    ]);
  return (
    <ShopClient
      latestProducts={latestProducts}
      bestSellingProducts={bestSellingProducts}
      featuredProducts={featuredProducts}
      mysteryBoxProducts={mysteryBoxProducts}
      videoProducts={videoProducts}
    />
  );
}
