import ShopClient from "./ShopClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

interface ProductType {
  id: string;
  name: string;
  price: number;
  image: string;
  category: string;
  team: string;
  availablePatches?: string[];
  videos?: string[];
}


async function fetchLatestProducts(): Promise<ProductType[]> {
  try {
    await connectDB();
    const products = await Product.find({ isActive: true })
      .sort({ createdAt: -1 })
      .limit(8)
      .lean();

    return products.map((product: any) => ({
      id: product._id?.toString() || "",
      name: product.title || "Unknown Product",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Uncategorized",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
      availablePatches: product.availablePatches || [],
      videos: product.videos || [],
    }));
  } catch (error) {
    console.error("Error fetching latest products:", error);
    return [];
  }
}


async function fetchBestSellingProducts(): Promise<ProductType[]> {
  try {
    await connectDB();
    
    // Specific product titles for Best Sellers - exact match with database
    const bestSellerTitles = [
      "Maglia Away FC Barcelona x Travis Scott - Edizione Speciale",
      "Maglia Napoli Halloween 2025/26",
      "Maglia Juventus 25/26 Casa",
      "Maglia Inter 25/26 Casa",
      "Maglia Juventus 2019/20 Quarta",
      "Maglia Barcellona 2014/15 Home",
      "Maglia Barcellona 2010/11 Home"
    ];
    
    // Query database directly for best sellers
    const products = await Product.find({
      title: { $in: bestSellerTitles },
      isActive: true
    }).lean();

    return products.map((product: any) => ({
      id: product._id?.toString() || "",
      name: product.title || "Best Seller",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Uncategorized",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
      availablePatches: product.availablePatches || [],
      videos: product.videos || [],
    }));
  } catch (error) {
    console.error("Error fetching best selling products:", error);
    return [];
  }
}

async function fetchFeaturedProducts(): Promise<ProductType[]> {
  try {
    await connectDB();
    const products = await Product.find({ 
      feature: true,
      isActive: true 
    }).lean();

    return products.map((product: any) => ({
      id: product._id?.toString() || "",
      name: product.title || "Featured Product",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Uncategorized",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
      availablePatches: product.availablePatches || [],
      videos: product.videos || [],
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function fetchMysteryBoxProducts(): Promise<ProductType[]> {
  try {
    await connectDB();
    const products = await Product.find({ 
      isMysteryBox: true,
      isActive: true 
    }).lean();

    return products.map((product: any) => ({
      id: product._id?.toString() || "",
      name: product.title || "Mystery Box",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Mystery Box",
      team: "Mystery",
      availablePatches: product.availablePatches || [],
      videos: product.videos || [],
    }));
  } catch (error) {
    console.error("Error fetching Mystery Box products:", error);
    return [];
  }
}

async function fetchVideoProducts(): Promise<ProductType[]> {
  try {
    await connectDB();
    // Find products that have videos array with at least one element
    const products = await Product.find({ 
      videos: { $exists: true, $ne: [], $type: "array" },
      isActive: true 
    })
      .limit(100)
      .lean();

    // Filter to ensure videos is actually an array with items
    const productsWithVideos = products
      .filter((product: any) => 
        Array.isArray(product.videos) && product.videos.length > 0
      )
      .map((product: any) => ({
        id: product._id?.toString() || "",
        name: product.title || "Product",
        price: product.basePrice || 0,
        image: product.images?.[0] || "/images/image.png",
        category: product.category || "Uncategorized",
        team: product.title ? product.title.split(" ")[0] : "Unknown",
        availablePatches: product.availablePatches || [],
        videos: product.videos || [],
      }));
    
    return productsWithVideos;
  } catch (error) {
    console.error("Error fetching video products:", error);
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
