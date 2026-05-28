import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import { notFound } from "next/navigation";
import { Metadata } from "next";
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
  "aston-villa",
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
  "aston-villa": "Aston Villa",
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

export async function generateMetadata({
  params,
}: {
  params: Promise<{ team: string }>;
}): Promise<Metadata> {
  const { team } = await params;
  const teamName = teamNameMap[team.toLowerCase()] || team;
  return {
    title: `Maglia ${teamName} 2025/26 | Acquista Online — Goal Mania`,
    description: `Acquista la maglia ${teamName} 2025/26 a partire da 30€. Home, away e third kit. Spedizione gratuita in Italia.`,
    keywords: [
      `maglia ${teamName}`,
      `maglie ${teamName}`,
      `maglia ${teamName} 2025`,
      `acquista maglia ${teamName}`,
    ],
    alternates: {
      canonical: `https://goal-mania.it/shop/premier-league/${team.toLowerCase()}`,
    },
    openGraph: {
      title: `Maglia ${teamName} 2025/26 | Goal Mania`,
      description: `Home, away e third kit ${teamName} 2025/26. Da 30€, spedizione gratuita.`,
      url: `https://goal-mania.it/shop/premier-league/${team.toLowerCase()}`,
      type: "website",
    },
  };
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
    id: product._id || "",
    slug: (product as any).slug || "",
    name: product.title || "Untitled Product",
    price: product.basePrice || 0,
    image: product.images?.[0] || "/images/image.png",
    category: product.category || "Premier League",
    team: teamNameMap[team] || "Unknown",
    videos: product.videos || [],
  }));

  return (
    <PremierLeagueTeamClient
      products={products}
      teamSlug={team}
      teamName={teamNameMap[team]}
    />
  );
}
