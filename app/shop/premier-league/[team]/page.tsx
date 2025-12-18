import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import { notFound } from "next/navigation";
import PremierLeagueTeamClient from "../../../_components/PremierLeagueTeamClient";

// Enable ISR for team-specific pages
export const revalidate = 300;

// Define valid Premier League teams
const validTeams = [
  "manchester-united",
  "manchester-city",
  "liverpool",
  "arsenal",
  "chelsea",
  "newcastle",
  "tottenham",
];

// Map slugs to team names in product titles
const teamNameMap: { [key: string]: string } = {
  "manchester-united": "Manchester United",
  "manchester-city": "Manchester City",
  "liverpool": "Liverpool",
  "arsenal": "Arsenal",
  "chelsea": "Chelsea",
  "newcastle": "Newcastle",
  "tottenham": "Tottenham",
};

async function getTeamProducts(teamSlug: string) {
  await connectDB();

  const teamName = teamNameMap[teamSlug];

  // Search for team name in title
  const products = await Product.find({
    isActive: true,
    title: { $regex: new RegExp(teamName, "i") }, // Match team name in title
  }).sort({ feature: -1, createdAt: -1 });

  return JSON.parse(JSON.stringify(products)); // Serialize the Mongoose documents
}

interface TeamPageProps {
  params: Promise<{
    team: string;
  }>;
}

export default async function PremierLeagueTeamPage({
  params,
}: TeamPageProps) {
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
    category: product.category || "Premier League", // Ensure category is never undefined
    team: teamNameMap[team] || "Unknown", // Use the team name from map
    videos: product.videos || [], // Include videos for showcase
  }));

  return (
    <PremierLeagueTeamClient
      products={products}
      teamSlug={team}
      teamName={teamNameMap[team]}
    />
  );
}
