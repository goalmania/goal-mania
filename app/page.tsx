import { Metadata } from "next";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import HeroSection from "@/components/home/HeroSection";
import TeamLogoTicker from "@/components/home/TeamLogoTicker";
import FeaturedProducts from "@/components/home/FeaturedProducts";
import SocialProofSection from "@/components/home/SocialProofSection";
import FlashSaleSection from "@/components/home/FlashSaleSection";
import EditorialCommerceSection from "@/components/home/EditorialCommerceSection";
import HomeCategoryCards from "@/app/_components/HomeCategoryCards";
import ReviewsStrip from "@/components/home/ReviewsStrip";
import HomeNewsStrip from "@/components/home/HomeNewsStrip";
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
        text: "Su Goal Mania le maglie da calcio partono da 30€. Trovi maglie di Serie A (Inter, Milan, Juventus, Napoli), Premier League (Liverpool, Arsenal, Manchester City), Mondiali 2026 e maglie retro storiche. Spedizione gratuita in Italia.",
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
        text: "Goal Mania è il negozio online italiano specializzato in maglie da calcio a prezzi bassi. Con prezzi a partire da 30€ trovi maglie di Serie A, Premier League, Mondiali 2026 e maglie retro vintage.",
      },
    },
  ],
};

export const metadata: Metadata = {
  title: "Maglie da Calcio a 30€ | Goal Mania — Serie A, Premier League, Mondiali",
  description:
    "Acquista maglie da calcio a partire da 30€. Inter, Milan, Juventus, Napoli, Liverpool, Manchester City e le nazionali per i Mondiali 2026. Spedizione gratuita in Italia.",
  keywords: [
    "maglie da calcio",
    "maglie calcio a prezzi bassi",
    "maglie calcio 30 euro",
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
    title: "Maglie da Calcio a 30€ | Goal Mania",
    description:
      "Inter, Milan, Juventus, Napoli, Liverpool, Manchester City e le nazionali per i Mondiali 2026. Spedizione gratuita in Italia.",
    url: "https://goal-mania.it",
    type: "website",
  },
  alternates: {
    canonical: "https://goal-mania.it",
  },
};

function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function mapProduct(p: any) {
  return {
    id: p._id.toString(),
    name: p.title || "Featured Product",
    price: p.basePrice || 0,
    image: p.images?.[0] || "/images/placeholder.png",
    category: p.category || "Uncategorized",
    slug: p.slug || "",
    team: p.title ? p.title.split(" ")[0] : "Unknown",
    availablePatches: p.availablePatches || [],
    isMysteryBox: p.isMysteryBox || false,
  };
}

async function getFeaturedProducts() {
  try {
    await connectDB();
    const products = await ProductModel.find({ isActive: true, feature: true })
      .limit(10)
      .lean();
    return JSON.parse(JSON.stringify(products)).map(mapProduct);
  } catch (error) {
    console.error("Error fetching featured products:", error);
    return [];
  }
}

async function getRandomProducts(count: number): Promise<ReturnType<typeof mapProduct>[]> {
  try {
    await connectDB();
    const total = await ProductModel.countDocuments({ isActive: true });
    const skip = Math.max(0, Math.floor(Math.random() * Math.max(1, total - count)));
    const products = await ProductModel.find({ isActive: true })
      .skip(skip)
      .limit(count * 3)
      .lean();
    return shuffleArray(JSON.parse(JSON.stringify(products)).map(mapProduct)).slice(0, count);
  } catch {
    return [];
  }
}

export default async function Home() {
  const [featuredProducts, featuredArticles, latestArticles, editorialProducts] = await Promise.all([
    getFeaturedProducts(),
    (async () => {
      try {
        await connectDB();
        const articles = await Article.find({ status: "published", featured: true })
          .sort({ publishedAt: -1 })
          .limit(20)
          .lean();
        return JSON.parse(JSON.stringify(articles));
      } catch {
        return [];
      }
    })(),
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
    getRandomProducts(3),
  ]);

  return (
    <div className="bg-[#070707] min-h-screen relative font-munish">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <h1 className="sr-only">
        Maglie da Calcio a 30€ — Goal Mania: Serie A, Premier League, Mondiali 2026
      </h1>

      {/* 1. HERO — "MAGLIE DA CALCIO A 30€" + maglie reali rotanti */}
      <HeroSection products={featuredProducts} />

      {/* 2. CATEGORIE — navigazione per campionato */}
      <HomeCategoryCards />

      {/* 2b. LOGHI SQUADRE — ticker cliccabile tra categorie e offerta */}
      <TeamLogoTicker />

      {/* 2c. RECENSIONI TICKER — espanso dal bottone "Leggi tutte" in SocialProofSection */}
      <div data-reviews-strip>
        <ReviewsStrip />
      </div>

      {/* 3. OFFERTA LAMPO — urgency + prodotti reali in rotazione */}
      <FlashSaleSection products={featuredProducts.slice(0, 6)} />

      {/* 4. MAGLIE IN EVIDENZA — grid prodotti featured */}
      <FeaturedProducts products={featuredProducts} />

      {/* 5. NOTIZIE + MAGLIE — editoriale ibrido */}
      <EditorialCommerceSection
        articles={featuredArticles.slice(0, 3)}
        products={editorialProducts}
      />

      {/* 6. RECENSIONI */}
      <SocialProofSection />

      {/* 7. ULTIME NOTIZIE — link agli articoli del blog (dopo il funnel acquisto) */}
      <HomeNewsStrip articles={latestArticles} />
    </div>
  );
}
