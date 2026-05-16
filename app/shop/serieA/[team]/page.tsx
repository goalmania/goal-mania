import SerieAClient from "@/app/_components/SerieAClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import { notFound } from "next/navigation";

// Enable ISR for team-specific pages
export const revalidate = 300;

// Define valid teams
const validTeams = [
  "inter", "milan", "juventus", "napoli", "roma", "lazio", 
  "atalanta", "fiorentina", "torino", "bologna", "sassuolo",
  "udinese", "monza", "lecce", "frosinone", "cagliari",
  "genoa", "empoli", "verona", "salernitana"
];

const TEAM_NAME_OVERRIDES: Record<string, string[]> = {
  'inter': ['Inter', 'Internazionale', 'F.C. Inter', 'FC Inter'],
  'milan': ['Milan', 'AC Milan', 'A.C. Milan'],
  'roma': ['Roma', 'AS Roma', 'A.S. Roma'],
};

async function getTeamProducts(teamSlug: string) {
  await connectDB();

  const slug = teamSlug.toLowerCase();
  console.log('Searching for team:', slug, 'in products');

  let query: Record<string, unknown>;

  if (TEAM_NAME_OVERRIDES[slug]) {
    const names = TEAM_NAME_OVERRIDES[slug];
    query = {
      isActive: true,
      $or: names.map((name) => ({
        title: { $regex: new RegExp(`^Maglia\\s+${name}`, 'i') },
      })),
    };
  } else {
    const teamName = slug.charAt(0).toUpperCase() + slug.slice(1);
    query = {
      isActive: true,
      title: { $regex: new RegExp(`^Maglia\\s+${teamName}`, 'i') },
    };
  }

  const products = await Product.find(query).sort({ feature: -1, createdAt: -1 });
  
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
    category: product.category || "SerieA", // Ensure category is never undefined
    team: product.title ? product.title.split(" ")[1] : "Unknown", // Extract team name (second word)
    videos: product.videos || [], // Include videos for showcase
  }));

  return <SerieAClient products={products} teamSlug={team} />;
} 