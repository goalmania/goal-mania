import dynamic from "next/dynamic";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import HeroSection from "@/components/home/HeroSection";
import { Product } from "@/lib/types/home";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import { getBaseUrl } from "@/lib/utils/baseUrl";

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
    const baseUrl = getBaseUrl();
    const response = await fetch(`${baseUrl}/api/products?feature=true`, {
      next: { revalidate: 300 }, // Cache for 5 minutes instead of no-store
    });

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
        next: { revalidate: 300 }, // Cache for 5 minutes instead of no-store
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

// Fetch products with videos
async function getVideoProducts(): Promise<Product[]> {
  try {
    const baseUrl = getBaseUrl();
    console.log("🔍 Fetching from:", `${baseUrl}/api/products`);
    
    const response = await fetch(
      `${baseUrl}/api/products?limit=100&noPagination=true`,
      {
        next: { revalidate: 300 }, // Cache for 5 minutes
      }
    );

    if (!response.ok) {
      console.error("❌ API response not ok:", response.status);
      const errorText = await response.text();
      console.error("Error body:", errorText);
      return [];
    }

    const data = await response.json();
    const products = data.products || data || [];
    
    console.log("📦 Total products from API:", products.length);
    
    // Check each product for videos
    products.forEach((p: any, i: number) => {
      console.log(`Product ${i}:`, {
        id: p._id,
        title: p.title,
        hasVideos: !!p.videos,
        videosType: typeof p.videos,
        videosIsArray: Array.isArray(p.videos),
        videosLength: p.videos?.length || 0,
        videosValue: p.videos,
      });
    });

    const productsWithVideos = products
      .filter((product: any) => {
        const hasVideo = product.videos && Array.isArray(product.videos) && product.videos.length > 0;
        console.log(`✓ Filtering ${product.title}:`, hasVideo);
        return hasVideo;
      })
      .slice(-4)
      .map((product: any) => {
        console.log(`✓ Mapping product:`, {
          title: product.title,
          videos: product.videos,
        });
        return {
          id: product._id || "",
          name: product.title || "Video Product",
          price: product.basePrice || 0,
          image: product.images?.[0] || "/images/image.png",
          category: product.category || "Video",
          team: product.title ? product.title.split(" ")[0] : "Unknown",
          availablePatches: product.availablePatches || [],
          isMysteryBox: product.isMysteryBox || false,
          videos: product.videos || [],
        };
      });

    console.log("🎥 Final products with videos:", productsWithVideos.length);
    console.log("🎥 Products data:", productsWithVideos);

    return productsWithVideos;
  } catch (error) {
    console.error("❌ Error fetching video products:", error);
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
