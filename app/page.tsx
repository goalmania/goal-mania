import dynamic from "next/dynamic";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import ProductModel from "@/lib/models/Product";
import HeroSection from "@/components/home/HeroSection";
import { Product } from "@/lib/types/home";
import FeaturedProducts from "@/components/home/FeaturedProducts";

// Dynamic imports for below-the-fold components (better performance)
const NewsSection = dynamic(() => import("@/components/home/NewsSection"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const GuaranteesSection = dynamic(() => import("@/components/home/GuaranteesSection"), {
  loading: () => <div className="h-64 bg-gray-50 animate-pulse" />,
});

const BannerBlock = dynamic(() => import("@/components/home/BannerBlock"));

const TeamCarousel = dynamic(() => import("@/components/home/TeamCarousel").then(mod => mod.TeamCarousel));

const ClientSlider = dynamic(() => import("@/components/home/ClientSlider"));

const FeaturedVideoProducts = dynamic(() => import("@/components/home/FeaturedVideoProducts"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const CallToAction = dynamic(() => import("@/components/home/CallToAction"));

const VideoComp = dynamic(() => import("@/components/home/VideoComp"), {
  loading: () => <div className="h-96 bg-gray-900 animate-pulse" />,
});

const LandingCategorySection = dynamic(() => import("@/app/_components/LandingCategorySection"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const PremierLeagueClient = dynamic(() => import("@/app/_components/PremierLeagueClient"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const SerieATeamsClient = dynamic(() => import("@/app/_components/SerieATeamsClient"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const RestOfWorldClient = dynamic(() => import("@/app/_components/RestOfWorldClient"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

const LimitedEditionClient = dynamic(() => import("@/app/_components/LimitedEditionClient"), {
  loading: () => <div className="h-96 bg-gray-50 animate-pulse" />,
});

// Enable caching for better performance
export const revalidate = 300; // Revalidate every 5 minutes

// Fetch featured products
async function getFeaturedProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await ProductModel.find({ 
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
    await connectDB();
    const products = await ProductModel.find({ 
      isMysteryBox: true,
      isActive: true 
    })
      .limit(3)
      .lean();

    return products.map((product: any) => ({
      id: product._id?.toString() || "",
      name: product.title || "Scatola Misteriosa",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/image.png",
      category: product.category || "Mystery Box",
      team: "Mystery Box",
      isMysteryBox: product.isMysteryBox || false,
    }));
  } catch (error) {
    console.error("Error fetching mystery box products:", error);
    return [];
  }
}

// Fetch products with videos
async function getVideoProducts(): Promise<Product[]> {
  try {
    await connectDB();
    // Find products that have videos array with at least one element
    const products = await ProductModel.find({ 
      videos: { $exists: true, $ne: [], $type: "array" },
      isActive: true 
    })
      .limit(100)
      .lean();

    // Filter and map to ensure videos is actually an array with items
    const productsWithVideos = products
      .filter((product: any) => 
        Array.isArray(product.videos) && product.videos.length > 0
      )
      .slice(-4)
      .map((product: any) => ({
        id: product._id?.toString() || "",
        name: product.title || "Video Product",
        price: product.basePrice || 0,
        image: product.images?.[0] || "/images/image.png",
        category: product.category || "Video",
        team: product.title ? product.title.split(" ")[0] : "Unknown",
        availablePatches: product.availablePatches || [],
        isMysteryBox: product.isMysteryBox || false,
        videos: product.videos || [],
      }));

    return productsWithVideos;
  } catch (error) {
    console.error("Error fetching video products:", error);
    return [];
  }
}

export default async function Home() {
  // Fetch articles only
  const featuredArticles = await (async () => {
    try {
      await connectDB();
      const articles = await Article.find({
        status: "published",
        featured: true,
      })
        .sort({ publishedAt: -1 })
        .limit(20)
        .lean(); // This returns plain objects

      // Convert to plain JSON to remove any Mongoose-specific properties
      return JSON.parse(JSON.stringify(articles));
    } catch (error) {
      console.error("Error fetching articles:", error);
      return [];
    }
  })();

  const featuredProducts = await getFeaturedProducts();
  const videoProducts = await getVideoProducts();

  return (
    <div className="bg-white min-h-screen relative font-munish">
      <HeroSection />
      <ClientSlider />
      <PremierLeagueClient />
      <SerieATeamsClient />
      <FeaturedProducts products={featuredProducts} />
      <NewsSection articles={featuredArticles} />
      <FeaturedVideoProducts products={featuredProducts} />
      <VideoComp products={videoProducts} />
      <LandingCategorySection title="Serie A" category="Serie A" />
      <RestOfWorldClient />
      <LimitedEditionClient />
      <LandingCategorySection title="Jackets" category="Jackets" />
      <LandingCategorySection title="Maglie Retro" category="Retro" />
    </div>
  );
}
