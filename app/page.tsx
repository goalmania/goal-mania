import { Metadata } from "next";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import HomeHero from "@/components/home/HomeHero";
import TrustBar from "@/components/home/TrustBar";
import CategoryTiles, { type Tile } from "@/components/home/CategoryTiles";
import EraPanels, { type EraPanelData } from "@/components/era/EraPanels";
import { eraInfo, pickForEra } from "@/lib/eraPick";
import { ERA_ORDER, WORLD_CUPS } from "@/lib/eraTheme";
import { worldCupItems, hasPhoto } from "@/lib/archive";
import ProductRail from "@/components/home/ProductRail";
import ThreeForTwo from "@/components/home/ThreeForTwo";
import BrandBand from "@/components/home/BrandBand";
import WorldCupBand, { type CupCard } from "@/components/home/WorldCupBand";
import HomeNewsStrip from "@/components/home/HomeNewsStrip";
import RealOrdersGallery from "@/components/shared/RealOrdersGallery";
import { getArchiveItems, worldCupYearsWithJerseys } from "@/lib/archiveData";
import ProductModel from "@/lib/models/Product";

export const revalidate = 300;

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quanto costano le maglie da calcio su Goal Mania?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Su Goal Mania le maglie da calcio partono da 35€. Trovi maglie di Serie A (Inter, Milan, Juventus, Napoli), Premier League (Liverpool, Arsenal, Manchester City), Mondiali 2026 e maglie retro storiche. Spedizione gratuita in Italia.",
      },
    },
    {
      "@type": "Question",
      name: "Goal Mania spedisce in Italia gratuitamente?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sì, Goal Mania offre spedizione gratuita su tutti gli ordini in Italia.",
      },
    },
    {
      "@type": "Question",
      name: "Goal Mania vende maglie di quale squadra?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Goal Mania vende maglie di tutte le principali squadre: Inter, Milan, Juventus, Napoli, Roma, Lazio per la Serie A; Liverpool, Manchester City, Arsenal, Chelsea, Manchester United per la Premier League; più le nazionali per i Mondiali 2026.",
      },
    },
    {
      "@type": "Question",
      name: "Dove posso comprare maglie da calcio a prezzi bassi in Italia?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Goal Mania è il negozio online italiano specializzato in maglie da calcio a prezzi bassi. Con prezzi a partire da 35€ trovi maglie di Serie A, Premier League, Mondiali 2026 e maglie retro vintage.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Maglie da Calcio a 35€ — Serie A, Premier League, Mondiali 2026",
  description:
    "Acquista maglie da calcio a partire da 35€. Inter, Milan, Juventus, Napoli, Liverpool, Manchester City e le nazionali per i Mondiali 2026. Spedizione gratuita in Italia.",
  keywords: [
    "maglie da calcio",
    "maglie calcio a prezzi bassi",
    "maglie Serie A",
    "maglie Premier League",
    "maglie Mondiali 2026",
    "maglia Inter",
    "maglia Juventus",
    "maglia Napoli",
    "maglia Milan",
    "negozio maglie calcio Italia",
  ],
  openGraph: {
    title: "Maglie da Calcio a 35€ | Goal Mania",
    description:
      "Inter, Milan, Juventus, Napoli, Liverpool, Manchester City e le nazionali per i Mondiali 2026. Spedizione gratuita in Italia.",
    url: "https://goal-mania.it",
    type: "website",
    images: [
      {
        url: "https://goal-mania.it/hero-home.jpg",
        width: 1200,
        height: 630,
        alt: "Goal Mania — Maglie da Calcio a 35€",
      },
    ],
  },
  alternates: {
    canonical: "https://goal-mania.it",
  },
};

const LABELS: Record<string, string> = { "2026/27": "Stagione 26/27", "2025/26": "Stagione 25/26", Retro: "Retro", "World Cup 2026": "Mondiali 2026" };

// Una sola forma per tutte le schede della home: prezzo vero dal listino, foto, etichetta breve
function mapCard(p: any) {
  return {
    id: p._id.toString(),
    slug: p.slug || "",
    name: p.title || "Maglia",
    price: Number(p.isRetro ? p.retroPrice : p.basePrice) || Number(p.basePrice) || 0,
    image: p.images?.[0] || "/images/image.png",
    category: p.category || "",
    team: LABELS[p.category] || p.category || "",
  };
}

async function getByCategory(category: string, limit = 12) {
  try {
    await connectDB();
    const products = await ProductModel.find({ category, isActive: true })
      .sort({ feature: -1, createdAt: -1 })
      .limit(limit)
      .lean();
    return JSON.parse(JSON.stringify(products)).map(mapCard);
  } catch {
    return [];
  }
}

async function getFeatured() {
  try {
    await connectDB();
    const products = await ProductModel.find({ isActive: true, feature: true }).sort({ updatedAt: -1 }).limit(12).lean();
    return JSON.parse(JSON.stringify(products)).map(mapCard);
  } catch {
    return [];
  }
}

async function getArchiveEras(): Promise<{ eras: EraPanelData[]; total: number; cups: CupCard[] }> {
  const items = await getArchiveItems();
  const eras = ERA_ORDER.map((slug) => {
    const info = eraInfo(items, slug);
    const pick = pickForEra(items, slug, 1)[0];
    return { slug, count: info.count, image: pick?.image || "", alt: pick?.name || slug, teams: info.teams, cupYears: info.cups.map((c) => c.year) };
  }).filter((e) => e.count > 0);
  const cups: CupCard[] = worldCupYearsWithJerseys(items).map((y) => {
    const list = worldCupItems(items, y).filter((j) => hasPhoto(j.image));
    return { year: y, host: WORLD_CUPS[y].host, winner: WORLD_CUPS[y].winner, count: worldCupItems(items, y).length, jerseys: list.slice(0, 3).map((j) => ({ id: j.id, image: j.image, name: j.name })) };
  }).filter((c) => c.jerseys.length > 0);
  return { eras, total: items.length || 730, cups };
}

// Quante maglie attive ci sono per categoria, in una sola lettura
async function getCounts(): Promise<Record<string, number>> {
  try {
    await connectDB();
    const rows = await ProductModel.aggregate([{ $match: { isActive: true } }, { $group: { _id: "$category", n: { $sum: 1 } } }]);
    return Object.fromEntries(rows.map((r: { _id: string; n: number }) => [r._id, r.n]));
  } catch {
    return {};
  }
}

export default async function Home() {
  const [featured, season, worldcup, archive, counts, latestArticles] = await Promise.all([
    getFeatured(),
    getByCategory("2026/27"),
    getByCategory("World Cup 2026"),
    getArchiveEras(),
    getCounts(),
    (async () => {
      try {
        await connectDB();
        const articles = await Article.find({ status: "published" })
          .sort({ publishedAt: -1 })
          .limit(6)
          .select("_id slug title summary image category publishedAt")
          .lean();
        return JSON.parse(JSON.stringify(articles));
      } catch {
        return [];
      }
    })(),
  ]);
  const hero = featured.length >= 9 ? featured : [...featured, ...season].slice(0, 12);
  const retroPick = archive.eras.find((e) => e.slug === "anni-90")?.image || archive.eras[0]?.image || "";
  const tiles: Tile[] = ([
    { title: "Nuova stagione 26/27", sub: "Le divise di quest'anno, tutte a 35€.", href: "/shop/2026/27", image: season[0]?.image || "", count: counts["2026/27"] || season.length, from: 35, tone: "lime", big: true },
    { title: "Mondiali 2026", sub: "Le nazionali che vedrai in campo.", href: "/shop/worldcup", image: worldcup[0]?.image || "", count: counts["World Cup 2026"] || worldcup.length, from: 35, tone: "wall" },
    { title: "Maglie retro", sub: "Dal 1970 a oggi, scegli il decennio.", href: "/archivio", image: retroPick, count: counts["Retro"] || archive.total, from: 40, tone: "paper" },
    { title: "Stagione 25/26", sub: "Quelle appena finite, ancora a 35€.", href: "/shop/2025/26", image: season[3]?.image || "", count: counts["2025/26"] || 0, from: 35, tone: "wall2" },
  ] as Tile[]).filter((t) => t.count > 0 && t.image);
  const trio = [season[0], season[1], season[2]].filter(Boolean);

  return (
    <div className="min-h-screen">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HomeHero products={hero} />
      <TrustBar />
      <CategoryTiles tiles={tiles} />
      <section id="retro" aria-labelledby="eras-h" className="pt-6 md:pt-10">
        <div className="mx-auto mb-6 flex w-full max-w-[1760px] flex-wrap items-end justify-between gap-4 px-5 md:px-10 lg:px-16">
          <div>
            <p className="text-[14px] font-bold text-[var(--lime)]">Maglie retro · 40€ l&apos;una</p>
            <h2 id="eras-h" className="disp mt-1 text-[clamp(2.8rem,8vw,7.4rem)] leading-[0.86] text-white">
              In che anni <span className="mark"><span>sei cresciuto?</span></span>
            </h2>
          </div>
          <p className="max-w-[36ch] text-[18px] italic leading-snug text-[var(--text-2)]">Scegli il decennio e trovi le maglie di quegli anni: squadre, nazionali e Mondiali.</p>
        </div>
        <EraPanels panels={archive.eras} />
      </section>
      <ThreeForTwo products={trio} />
      <ProductRail eyebrow="Appena arrivate" title="Novità 26/27" href="/shop/2026/27" lead="La nuova stagione, tutta a 35€." products={season} priorityFirst />
      <BrandBand retroCount={Math.floor(archive.total / 10) * 10} />
      <WorldCupBand cups={archive.cups} />
      <ProductRail eyebrow="Si gioca quest'estate" title="Mondiali 2026" href="/shop/worldcup" products={worldcup} />
      <RealOrdersGallery />
      <HomeNewsStrip articles={latestArticles} />
    </div>
  );
}
