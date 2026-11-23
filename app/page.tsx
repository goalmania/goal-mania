import { Metadata } from "next";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import HomeHero from "@/components/home/HomeHero";
import LeagueRail from "@/components/home/LeagueRail";
import ProductRail from "@/components/home/ProductRail";
import OfferTicket from "@/components/home/OfferTicket";
import ReasonsList from "@/components/home/ReasonsList";
import HomeNewsStrip from "@/components/home/HomeNewsStrip";
import RealOrdersGallery from "@/components/shared/RealOrdersGallery";
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

export default async function Home() {
  const [featured, season, retro, worldcup, latestArticles] = await Promise.all([
    getFeatured(),
    getByCategory("2026/27"),
    getByCategory("Retro"),
    getByCategory("World Cup 2026"),
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
  const hero = featured.length >= 3 ? featured : season;

  return (
    <div className="min-h-screen bg-[#0a0a0a]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <HomeHero products={hero} />
      <LeagueRail />
      <ProductRail title="Scelte per te" href="/shop" products={featured.length ? featured : season} priorityFirst />
      <OfferTicket />
      <ProductRail title="Nuovi arrivi 26/27" href="/shop/2026/27" products={season} />
      <ProductRail title="Maglie retro" href="/shop/retro" products={retro} />
      <ProductRail title="Mondiali 2026" href="/shop/worldcup" products={worldcup} />
      <ReasonsList />
      <RealOrdersGallery />
      <HomeNewsStrip articles={latestArticles} />
    </div>
  );
}
