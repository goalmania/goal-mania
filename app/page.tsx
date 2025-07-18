import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import HeroSection from "@/components/home/HeroSection";
import TeamCarousel from "@/components/home/TeamCarousel";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import MysteryBoxSection from "@/components/home/MysteryBoxSection";
import GuaranteesSection from "@/components/home/GuaranteesSection";
import NewsSection from "@/components/home/NewsSection";
import { Product } from "@/lib/types/home";

// Enable caching for better performance
export const revalidate = 300; // Revalidate every 5 minutes



// Fetch featured products
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products?feature=true&limit=4`, {
      next: { revalidate: 300 }
    });

    if (!response.ok) return [];

    const data = await response.json();
    const products = data.products || data || [];
    
    return products.slice(0, 4).map((product: any) => ({
      id: product._id || "",
      name: product.title || "Featured Product",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Uncategorized",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

// Fetch mystery box products
async function getMysteryBoxProducts(): Promise<Product[]> {
  try {
    const baseUrl = process.env.NEXTAUTH_URL || process.env.VERCEL_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/products?type=mysteryBox&limit=3`, {
      next: { revalidate: 300 }
    });

    if (!response.ok) return [];

    const data = await response.json();
    const products = data.products || data || [];
    
    return products.slice(0, 3).map((product: any) => ({
      id: product._id || "",
      name: product.title || "Mystery Box",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Mystery Box",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
    }));
  } catch (error) {
    console.error("Error fetching mystery box products:", error);
    return [];
  }
}

export default async function Home() {
  // Fetch all data in parallel for better performance
  const [featuredArticles, featuredProducts, mysteryBoxProducts] = await Promise.all([
    // Fetch articles
    (async () => {
      try {
        await connectDB();
        return await Article.find({
          status: "published",
          featured: true,
        })
          .sort({ publishedAt: -1 })
          .limit(3)
          .lean();
      } catch (error) {
        console.error("Error fetching articles:", error);
        return [];
      }
    })(),
    getFeaturedProducts(),
    getMysteryBoxProducts()
  ]);

    return (
      <div className="bg-white min-h-screen">
        <HeroSection />
        <TeamCarousel />
        <FeaturedProducts products={featuredProducts} />
        <MysteryBoxSection products={mysteryBoxProducts} />
        <GuaranteesSection />
        <NewsSection articles={featuredArticles} />
      </div>
    );
}
