import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import HeroSection from "@/components/home/HeroSection";
import NewsSection from "@/components/home/NewsSection";
import { Product } from "@/lib/types/home";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import GuaranteesSection from "@/components/home/GuaranteesSection";
import BannerBlock from "@/components/home/BannerBlock";
import { getBaseUrl } from "@/lib/utils/baseUrl";
import { TeamCarousel } from "@/components/home/TeamCarousel";
import ClientSlider from "@/components/home/ClientSlider";
import FeaturedVideoProducts from "@/components/home/FeaturedVideoProducts";
import CallToAction from "@/components/home/CallToAction";
import VideoComp from "@/components/home/VideoComp";

// Enable caching for better performance
export const revalidate = 300; // Revalidate every 5 minutes

// Fetch featured products
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/products?feature=true&limit=4`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    const products = data.products || data || [];

    return products.map((product: any) => ({
      id: product._id || "",
      name: product.title || "Featured Product",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Uncategorized",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
      availablePatches: product.availablePatches || [],
      isMysteryBox: product.isMysteryBox || false,
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

// Fetch mystery box products
async function getMysteryBoxProducts(): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    const response = await fetch(
      `${baseUrl}/api/products?type=mysteryBox&limit=3&noPagination=true`,
      {
        cache: "no-store",
      }
    );

    if (!response.ok) {
      console.error("Mystery Box API response not ok:", response.status);
      return [];
    }

    const data = await response.json();
    const products = data.products || data || [];

    console.log("Mystery Box API Response:", {
      totalProducts: products.length,
      products: products.map((p: any) => ({
        id: p._id,
        title: p.title,
        isMysteryBox: p.isMysteryBox,
        category: p.category,
      })),
    });

    // Only return actual mystery box products
    const mysteryBoxProducts = products.filter(
      (product: any) => product.isMysteryBox === true
    );

    console.log("Filtered Mystery Box Products:", {
      count: mysteryBoxProducts.length,
      products: mysteryBoxProducts.map((p: any) => ({
        id: p._id,
        title: p.title,
        isMysteryBox: p.isMysteryBox,
        category: p.category,
      })),
    });

    return mysteryBoxProducts.slice(0, 3).map((product: any) => ({
      id: product._id || "",
      name: product.title || "Scatola Misteriosa",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Mystery Box",
      team: "Mystery Box", // Mystery boxes don't have specific teams
      isMysteryBox: product.isMysteryBox || false,
    }));
  } catch (error) {
    console.error("Error fetching mystery box products:", error);
    return [];
  }
}

export default async function Home() {
  // Fetch articles only
  const featuredArticles = await (async () => {
    try {
      await connectDB();
      return await Article.find({
        status: "published",
        featured: true,
      })
        .sort({ publishedAt: -1 })
        .limit(5)
        .lean();
    } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
    }
  })();

  const featuredProducts = await getFeaturedProducts();

  return (
    <div className="bg-white min-h-screen relative font-munish">
      <HeroSection />
      <ClientSlider />
      <FeaturedProducts products={featuredProducts} />
      {/*
      <GuaranteesSection />
       */}
      <NewsSection articles={featuredArticles} />
      <FeaturedVideoProducts products={featuredProducts} />
      <VideoComp />
    </div>
  );
}
