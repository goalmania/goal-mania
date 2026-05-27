import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import SerieAClient from "@/app/_components/SerieAClient";

export const revalidate = 300;

interface PageProps {
  params: Promise<{ team: string }>;
}

// Route slug → display label (used for metadata)
const TEAM_DISPLAY: Record<string, string> = {
  italy:       "Italia",
  france:      "Francia",
  germany:     "Germania",
  spain:       "Spagna",
  brazil:      "Brasile",
  argentina:   "Argentina",
  portugal:    "Portogallo",
  england:     "Inghilterra",
  netherlands: "Olanda",
  belgium:     "Belgio",
  croatia:     "Croazia",
  morocco:     "Marocco",
  usa:         "USA",
  mexico:      "Messico",
  senegal:     "Senegal",
  japan:       "Giappone",
};

// Route slug → search terms in DB
const TEAM_SEARCH: Record<string, string[]> = {
  italy:       ["Italy", "Italia", "Italian"],
  france:      ["France", "Francia", "French"],
  germany:     ["Germany", "Germania", "Deutschland"],
  spain:       ["Spain", "Spagna", "España"],
  brazil:      ["Brazil", "Brasil", "Brasile"],
  argentina:   ["Argentina"],
  portugal:    ["Portugal", "Portogallo"],
  england:     ["England", "Inghilterra"],
  netherlands: ["Netherlands", "Holland", "Olanda"],
  belgium:     ["Belgium", "Belgio", "Belgique"],
  croatia:     ["Croatia", "Croazia", "Hrvatska"],
  morocco:     ["Morocco", "Marocco", "Maroc"],
  usa:         ["USA", "United States", "America"],
  mexico:      ["Mexico", "Messico", "México"],
  senegal:     ["Senegal"],
  japan:       ["Japan", "Giappone", "Japon"],
};

const VALID_TEAMS = Object.keys(TEAM_DISPLAY);

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { team } = await params;
  const display = TEAM_DISPLAY[team] ?? (team.charAt(0).toUpperCase() + team.slice(1));
  return {
    title: `Maglia ${display} Mondiali 2026 | Goal Mania`,
    description: `Kit ${display} per i Mondiali 2026. Spedizione rapida in Italia.`,
  };
}

export default async function NationalTeamPage({ params }: PageProps) {
  const { team } = await params;

  if (!VALID_TEAMS.includes(team.toLowerCase())) {
    notFound();
  }

  await connectDB();

  const searchTerms = TEAM_SEARCH[team] ?? [team];

  const raw = await Product.find({
    isActive: true,
    $or: [
      // World Cup specific products
      { isWorldCup: true, $or: searchTerms.map((t) => ({ nationalTeam: { $regex: new RegExp(t, "i") } })) },
      { isWorldCup: true, $or: searchTerms.map((t) => ({ country: { $regex: new RegExp(t, "i") } })) },
      // Also search by title
      ...searchTerms.map((t) => ({ title: { $regex: new RegExp(t, "i") } })),
    ],
  })
    .sort({ feature: -1, createdAt: -1 })
    .lean();

  const serialized = JSON.parse(JSON.stringify(raw));

  const products = serialized.map((p: any) => ({
    id: p._id || "",
    slug: p.slug || "",
    name: p.title || "Untitled Product",
    price: p.basePrice || 0,
    image: p.images?.[0] ?? p.Images?.[0] ?? "/images/image.png",
    category: p.category || "World Cup",
    team: TEAM_DISPLAY[team] || team,
    videos: p.videos || [],
  }));

  return (
    <SerieAClient
      products={products}
      teamSlug={team}
      leagueName="World Cup 2026"
      leagueHref="/shop/worldcup"
    />
  );
}
