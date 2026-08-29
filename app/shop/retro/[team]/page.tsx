import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import RetroClient from "@/app/_components/RetroClient";
import Link from "next/link";

export const revalidate = 300;

// Squadre con pagina retro dedicata
const RETRO_TEAMS: Record<string, { display: string; title: string[]; keywords: string[] }> = {
  milan: {
    display: "AC Milan",
    title: ["Milan", "AC Milan", "A.C. Milan"],
    keywords: ["maglia Milan retro", "maglia Milan vintage", "maglia Milan storica", "maglia Milan anni 90", "maglia Milan 1994", "maglia Milan calcio"],
  },
  inter: {
    display: "Inter",
    title: ["Inter", "Internazionale"],
    keywords: ["maglia Inter retro", "maglia Inter vintage", "maglia Inter storica", "maglia Inter anni 90", "maglia Internazionale retro"],
  },
  juventus: {
    display: "Juventus",
    title: ["Juventus"],
    keywords: ["maglia Juventus retro", "maglia Juventus vintage", "maglia Juventus storica", "maglia Juventus anni 90", "maglia Juve retro"],
  },
  napoli: {
    display: "Napoli",
    title: ["Napoli"],
    keywords: ["maglia Napoli retro", "maglia Napoli Maradona", "maglia Napoli vintage", "maglia Napoli storica", "maglia Napoli anni 80"],
  },
  roma: {
    display: "Roma",
    title: ["Roma"],
    keywords: ["maglia Roma retro", "maglia Roma vintage", "maglia Roma storica", "maglia AS Roma retro"],
  },
  lazio: {
    display: "Lazio",
    title: ["Lazio"],
    keywords: ["maglia Lazio retro", "maglia Lazio vintage", "maglia Lazio storica", "maglia Lazio anni 90"],
  },
  fiorentina: {
    display: "Fiorentina",
    title: ["Fiorentina"],
    keywords: ["maglia Fiorentina retro", "maglia Fiorentina vintage", "maglia Fiorentina storica"],
  },
  parma: {
    display: "Parma",
    title: ["Parma"],
    keywords: ["maglia Parma retro", "maglia Parma vintage", "maglia Parma anni 90", "maglia Parma storica"],
  },
  "man-united": {
    display: "Manchester United",
    title: ["Man. United", "Manchester United"],
    keywords: ["maglia Manchester United retro", "maglia Man United vintage", "maglia Manchester United storica", "maglia United retro"],
  },
  liverpool: {
    display: "Liverpool",
    title: ["Liverpool"],
    keywords: ["maglia Liverpool retro", "maglia Liverpool vintage", "maglia Liverpool storica", "maglia Liverpool anni 90"],
  },
  arsenal: {
    display: "Arsenal",
    title: ["Arsenal"],
    keywords: ["maglia Arsenal retro", "maglia Arsenal vintage", "maglia Arsenal storica", "maglia Arsenal Highbury"],
  },
  barcellona: {
    display: "Barcellona",
    title: ["Barcellona", "Barcelona"],
    keywords: ["maglia Barcellona retro", "maglia Barcellona vintage", "maglia Barca retro", "maglia Barcellona storica"],
  },
  "real-madrid": {
    display: "Real Madrid",
    title: ["Real Madrid"],
    keywords: ["maglia Real Madrid retro", "maglia Real Madrid vintage", "maglia Real Madrid storica"],
  },
  celtic: {
    display: "Celtic",
    title: ["Celtic"],
    keywords: ["maglia Celtic retro", "maglia Celtic vintage", "maglia Celtic storica"],
  },
  brasile: {
    display: "Brasile",
    title: ["Brasile", "Brazil"],
    keywords: ["maglia Brasile retro", "maglia Brasile 2002", "maglia Brasile vintage", "maglia Brasile storica", "maglia Brasile mondiali"],
  },
  argentina: {
    display: "Argentina",
    title: ["Argentina"],
    keywords: ["maglia Argentina retro", "maglia Argentina Maradona", "maglia Argentina vintage", "maglia Argentina storica", "maglia Argentina mondiali"],
  },
  italia: {
    display: "Italia",
    title: ["Italia", "Italy"],
    keywords: ["maglia Italia retro", "maglia Italia vintage", "maglia Italia storica", "maglia Azzurri retro", "maglia Italia mondiali"],
  },
  inghilterra: {
    display: "Inghilterra",
    title: ["Inghilterra", "England"],
    keywords: ["maglia Inghilterra retro", "maglia Inghilterra vintage", "maglia Inghilterra storica"],
  },
  francia: {
    display: "Francia",
    title: ["Francia", "France"],
    keywords: ["maglia Francia retro", "maglia Francia 1998", "maglia Francia vintage", "maglia Francia storica"],
  },
  psg: {
    display: "PSG",
    title: ["PSG", "Paris Saint-Germain"],
    keywords: ["maglia PSG retro", "maglia PSG vintage", "maglia Paris Saint-Germain retro"],
  },
};

export async function generateStaticParams() {
  return Object.keys(RETRO_TEAMS).map((team) => ({ team }));
}

async function getTeamRetroProducts(teamSlug: string) {
  const teamData = RETRO_TEAMS[teamSlug];
  if (!teamData) return null;

  await connectDB();

  const orQuery = teamData.title.map((name) => ({
    title: { $regex: new RegExp(`Maglia\\s+${name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}`, "i") },
  }));

  const products = await Product.find({
    isActive: true,
    category: { $in: ["Retro", "retro"] },
    $or: orQuery,
  })
    .sort({ feature: -1, createdAt: -1 })
    .lean();

  return JSON.parse(JSON.stringify(products));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ team: string }>;
}): Promise<Metadata> {
  const { team } = await params;
  const teamData = RETRO_TEAMS[team];
  if (!teamData) return { title: "Maglie Retro | Goal Mania" };

  const { display, keywords } = teamData;

  return {
    title: `Maglie ${display} Retro — Vintage e Storiche | Goal Mania`,
    description: `Acquista le maglie retro del ${display}: jersey storiche, vintage e da collezione. ${display} anni 90, 2000 e oltre. Da €35. Spedizione gratuita in Italia.`,
    keywords,
    alternates: {
      canonical: `https://goal-mania.it/shop/retro/${team}`,
    },
    openGraph: {
      title: `Maglie ${display} Retro | Goal Mania`,
      description: `Jersey storiche e vintage del ${display}. Collezione retro da €35.`,
      url: `https://goal-mania.it/shop/retro/${team}`,
      type: "website",
    },
  };
}

export default async function RetroTeamPage({
  params,
}: {
  params: Promise<{ team: string }>;
}) {
  const { team } = await params;
  const teamData = RETRO_TEAMS[team];
  if (!teamData) notFound();

  const raw = await getTeamRetroProducts(team);
  if (!raw) notFound();

  const products = raw
    .filter((p: any) => p._id && p.title)
    .map((p: any) => ({
      id: String(p._id),
      name: p.title,
      price: p.retroPrice ?? p.basePrice ?? 35,
      image: p.images?.[0] ?? "/images/image.png",
      category: "Retro",
      slug: p.slug ?? "",
      team: p.title,
      isRetro: true,
      feature: !!p.feature,
    }));

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://goal-mania.it" },
      { "@type": "ListItem", position: 2, name: "Maglie Retro", item: "https://goal-mania.it/shop/retro" },
      { "@type": "ListItem", position: 3, name: `${teamData.display} Retro`, item: `https://goal-mania.it/shop/retro/${team}` },
    ],
  };

  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Maglie ${teamData.display} Retro`,
    description: `Collezione maglie retro ${teamData.display} — jersey storiche e vintage da €35`,
    url: `https://goal-mania.it/shop/retro/${team}`,
    breadcrumb: breadcrumbSchema,
    numberOfItems: products.length,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(collectionSchema) }}
      />
      {/* H1 SSR per SEO */}
      <h1 className="sr-only">
        Maglie {teamData.display} Retro — Vintage e Storiche
      </h1>
      <div className="text-xs text-gray-500 px-4 pt-4">
        <Link href="/shop/retro" className="hover:underline">Maglie Retro</Link>
        {" › "}
        <span>{teamData.display}</span>
      </div>
      <RetroClient products={products} />
    </>
  );
}
