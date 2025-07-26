import SerieAClient from "@/app/_components/SerieAClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import { notFound } from "next/navigation";

// Disable caching for this page
export const dynamic = "force-dynamic";

// Define valid teams
const validTeams = [
  "inter", "milan", "juventus", "napoli", "roma", "lazio", 
  "atalanta", "fiorentina", "torino", "bologna", "sassuolo",
  "udinese", "monza", "lecce", "frosinone", "cagliari",
  "genoa", "empoli", "verona", "salernitana"
];

async function getTeamProducts(teamSlug: string) {
  await connectDB();
  
  // Convert team slug to proper case for matching
  const teamName = teamSlug.charAt(0).toUpperCase() + teamSlug.slice(1).toLowerCase();
  
  // Search for team name as the second word in the title (after "Maglia")
  const products = await Product.find({
    category: "SeriesA",
    isActive: true,
    title: { $regex: new RegExp(`^Maglia\\s+${teamName}`, 'i') } // Match "Maglia [TeamName]" at start of title
  }).sort({ feature: -1, createdAt: -1 });
  
  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

interface TeamPageProps {
  params: Promise<{
    team: string;
  }>;
}

export default async function TeamShopPage({ params }: TeamPageProps) {
  const { team } = await params;
  
  // Validate team parameter
  if (!validTeams.includes(team.toLowerCase())) {
    notFound();
  }

  const serverProducts = await getTeamProducts(team);

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
    category: product.category || "SeriesA", // Ensure category is never undefined
    team: product.title ? product.title.split(" ")[1] : "Unknown", // Extract team name (second word)
  }));

  return <SerieAClient products={products} teamSlug={team} />;
} 