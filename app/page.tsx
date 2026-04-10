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
// components\home\WorldCupShowCase.tsx
const WorldCupShowcase = dynamic(() => import("@/components/home/WorldCupShowCase"), {
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

import ProductModel from "@/lib/models/Product"; // Adjust path to your actual model file

async function getFeaturedProducts(): Promise<Product[]> {
  try {
    await connectDB(); // Ensure connection is active
    
    // Query MongoDB directly
    const products = await ProductModel.find({ isActive: true, feature: true })
      .limit(10)
      .lean();

    // Use JSON.parse/stringify to strip Mongoose-specific metadata
    return JSON.parse(JSON.stringify(products)).map((product: any) => ({
      id: product._id.toString(),
      name: product.title || "Featured Product",
      price: product.basePrice || 0,
      image: product.images?.[0] || "/images/placeholder.png",
      category: product.category || "Uncategorized",
      team: product.title ? product.title.split(" ")[0] : "Unknown",
      availablePatches: product.availablePatches || [],
      isMysteryBox: product.isMysteryBox || false,
    }));
  } catch (error) {
    console.error("Error fetching products directly:", error);
    return [];
  }
}

// Fetch mystery box products
async function getMysteryBoxProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await ProductModel.find({ isMysteryBox: true })
      .limit(3)
      .lean();

    return JSON.parse(JSON.stringify(products)).map((product: any) => ({
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

import { getFlagUrl } from "@/lib/utils/flags";

// Fetch World Cup teams (Priority: DB teams, then API rankings)
async function getWorldCupTeams() {
  const API_KEY = process.env.FOOTBALL_API;
  try {
    await connectDB();
    
    // 1. Get countries that have jerseys in the database
    const dbCountries = (await ProductModel.distinct("nationalTeam", { 
      isWorldCup: true, 
      isActive: true 
    })) as string[];
    
    const availableInDb = new Set(
      dbCountries.filter(Boolean).map((c: string) => c.toLowerCase())
    );

    // 2. Fetch live data from Football API
    const response = await fetch("https://api.football-data.org/v4/competitions/WC/standings", {
      headers: { "X-Auth-Token": API_KEY || "" },
      next: { revalidate: 86400 }, // Cache for 24 hours
    });

    let apiTeams: any[] = [];
    if (response.ok) {
      const data = await response.json();
      data.standings?.forEach((group: any) => {
        group.table.forEach((entry: any) => {
          apiTeams.push({
            id: entry.team.name.toLowerCase(),
            name: entry.team.name,
            flag: entry.team.crest
          });
        });
      });
    }

    // Merge logic: Ensure DB teams are present and have flags
    const teamsMap = new Map();
    
    // DB teams first (reliable manual mapping)
    dbCountries.forEach((c: any) => {
      const id = String(c).toLowerCase();
      teamsMap.set(id, {
        id,
        name: String(c),
        flag: getFlagUrl(id)
      });
    });

    // Merge API teams (enhancing with API data like crests only if necessary)
    apiTeams.forEach(team => {
      if (teamsMap.has(team.id)) {
        const existing = teamsMap.get(team.id);
        teamsMap.set(team.id, {
          ...existing,
          // Prioritize our reliable mapping, use API as fallback if mapping is placeholder
          flag: existing.flag && !existing.flag.includes('placeholder') 
            ? existing.flag 
            : (team.flag || existing.flag)
        });
      } else {
        teamsMap.set(team.id, {
          ...team,
          // Prioritize our reliable mapping for the flag
          flag: getFlagUrl(team.name, team.flag)
        });
      }
    });

    return Array.from(teamsMap.values()).slice(0, 30);
  } catch (error) {
    console.error("❌ Error fetching World Cup teams:", error);
    return [];
  }
}

// Fetch products with videos
async function getVideoProducts(): Promise<Product[]> {
  try {
    await connectDB();
    const products = await ProductModel.find()
      .sort({ createdAt: -1 })
      .limit(100)
      .lean();

    const productsWithVideos = JSON.parse(JSON.stringify(products))
      .filter((product: any) => product.videos && Array.isArray(product.videos) && product.videos.length > 0)
      .slice(0, 4)
      .map((product: any) => ({
        id: product._id || "",
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
  const worldCupTeams = await getWorldCupTeams();

  return (
    <div className="bg-white min-h-screen relative font-munish">
      <HeroSection />
      <ClientSlider />
      <WorldCupShowcase teams={worldCupTeams} />
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
