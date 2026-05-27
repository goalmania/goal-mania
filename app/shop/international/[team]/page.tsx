import SerieAClient from "@/app/_components/SerieAClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { IProduct } from "@/lib/types/product";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const revalidate = 300;

const validTeams = ["real-madrid", "barcelona", "psg", "atletico", "bayern", "dortmund"];

const teamNameMap: Record<string, string[]> = {
  "real-madrid": ["Real Madrid"],
  barcelona:     ["Barcelona", "FC Barcelona", "Barcellona"],
  psg:           ["PSG", "Paris Saint-Germain", "Paris SG"],
  atletico:      ["Atletico", "Atlético", "Atletico Madrid", "Atlético de Madrid"],
  bayern:        ["Bayern", "Bayern Munich", "Bayern München", "FC Bayern"],
  dortmund:      ["Dortmund", "Borussia Dortmund", "BVB"],
};

const displayNames: Record<string, string> = {
  "real-madrid": "Real Madrid",
  barcelona:     "FC Barcelona",
  psg:           "Paris Saint-Germain",
  atletico:      "Atlético de Madrid",
  bayern:        "FC Bayern München",
  dortmund:      "Borussia Dortmund",
};

async function getTeamProducts(teamSlug: string) {
  await connectDB();
  const names = teamNameMap[teamSlug] ?? [teamSlug];
  const products = await Product.find({
    isActive: true,
    $or: names.map((n) => ({
      title: { $regex: new RegExp(n, "i") },
    })),
  }).sort({ feature: -1, createdAt: -1 });
  return JSON.parse(JSON.stringify(products));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ team: string }>;
}): Promise<Metadata> {
  const { team } = await params;
  const name = displayNames[team] ?? team;
  return {
    title: `Maglie ${name} | Goal Mania`,
    description: `Acquista le maglie ${name}. Spedizione gratuita in Italia.`,
  };
}

export default async function InternationalTeamPage({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team } = await params;

  if (!validTeams.includes(team.toLowerCase())) {
    notFound();
  }

  const serverProducts = await getTeamProducts(team);

  const validProducts = serverProducts.filter(
    (p: IProduct) => p._id && p.title
  );

  const products = validProducts.map((p: IProduct) => ({
    id: p._id || "",
    slug: (p as any).slug || "",
    name: p.title || "Untitled Product",
    price: p.basePrice || 0,
    image: p.images?.[0] || "/images/image.png",
    category: p.category || "International",
    team: displayNames[team] || team,
    videos: p.videos || [],
  }));

  return (
    <SerieAClient
      products={products}
      teamSlug={team}
      leagueName="Internazionali"
      leagueHref="/shop/international"
    />
  );
}
