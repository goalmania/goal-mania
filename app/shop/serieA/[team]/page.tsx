import SerieAClient from "@/app/_components/SerieAClient";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";
import { IProduct } from "@/lib/types/product";
import { notFound } from "next/navigation";
import { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

// Enable ISR for team-specific pages
export const revalidate = 300;

// Define valid teams
const validTeams = [
  "inter", "milan", "juventus", "napoli", "roma", "lazio",
  "atalanta", "fiorentina", "como", "torino", "bologna", "sassuolo",
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

const TEAM_DISPLAY_NAMES: Record<string, string> = {
  inter: "Inter",
  milan: "AC Milan",
  juventus: "Juventus",
  napoli: "Napoli",
  roma: "Roma",
  lazio: "Lazio",
  atalanta: "Atalanta",
  fiorentina: "Fiorentina",
  torino: "Torino",
  bologna: "Bologna",
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ team: string }>;
}): Promise<Metadata> {
  const { team } = await params;
  const teamName =
    TEAM_DISPLAY_NAMES[team.toLowerCase()] ||
    team.charAt(0).toUpperCase() + team.slice(1);
  return {
    title: `Maglia ${teamName} 2025/26 | Acquista Online`,
    description: `Acquista la maglia ${teamName} 2025/26 a partire da 30€. Home, away e third kit. Spedizione gratuita in Italia.`,
    keywords: [
      `maglia ${teamName}`,
      `maglie ${teamName}`,
      `maglia ${teamName} 2025`,
      `acquista maglia ${teamName}`,
      `maglia calcio ${teamName}`,
    ],
    alternates: {
      canonical: `https://goal-mania.it/shop/serieA/${team.toLowerCase()}`,
    },
    openGraph: {
      title: `Maglia ${teamName} 2025/26 | Goal Mania`,
      description: `Home, away e third kit ${teamName} 2025/26. Da 30€, spedizione gratuita.`,
      url: `https://goal-mania.it/shop/serieA/${team.toLowerCase()}`,
      type: "website",
    },
  };
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

  const [serverProducts, relatedArticles] = await Promise.all([
    getTeamProducts(team),
    (async () => {
      try {
        await connectDB();
        const teamName = TEAM_DISPLAY_NAMES[team.toLowerCase()] || team.charAt(0).toUpperCase() + team.slice(1);
        return JSON.parse(JSON.stringify(
          await Article.find({
            status: "published",
            $or: [
              { title: { $regex: teamName, $options: "i" } },
              { tags: { $regex: teamName, $options: "i" } },
              { content: { $regex: teamName, $options: "i" } },
            ],
          }).sort({ publishedAt: -1 }).limit(3).lean()
        ));
      } catch { return []; }
    })(),
  ]);
  const serverProductsResolved = serverProducts;

  // Log products that might cause issues
  serverProductsResolved.forEach((product: IProduct, index: number) => {
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
  const validProducts = serverProductsResolved.filter(
    (product: IProduct) => product._id && product.title
  );

  // Map server products to client format
  const products = validProducts.map((product: IProduct) => ({
    id: product._id || "",
    slug: (product as any).slug || "",
    name: product.title || "Untitled Product",
    price: product.basePrice || 0,
    image: product.images?.[0] || "/images/image.png",
    category: product.category || "SerieA",
    team: product.title ? product.title.split(" ")[1] : "Unknown",
    videos: product.videos || [],
  }));

  const teamDisplayName = TEAM_DISPLAY_NAMES[team.toLowerCase()] || team.charAt(0).toUpperCase() + team.slice(1);

  const teamCollectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Maglie ${teamDisplayName} 2025/26`,
    url: `https://goal-mania.it/shop/serieA/${team.toLowerCase()}`,
    description: `Acquista la maglia ${teamDisplayName} 2025/26 a partire da 30€. Home, away e third kit. Spedizione gratuita in Italia.`,
    hasPart: products.slice(0, 6).map((p: any) => ({
      "@type": "Product",
      name: p.name,
      url: `https://goal-mania.it/products/${p.slug || p.id}`,
      offers: { "@type": "Offer", price: p.price ?? 30, priceCurrency: "EUR" },
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(teamCollectionSchema) }}
      />
      <section className="pt-24 pb-4 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-black uppercase mb-2" style={{ fontFamily: "var(--font-barlow-condensed, sans-serif)", color: "#fff" }}>
          Maglia {teamDisplayName} 2025/26
        </h1>
        <p className="text-gray-400 text-sm max-w-2xl">
          Acquista la maglia {teamDisplayName} 2025/26 a partire da 30€.
          Home, away e third kit disponibili. Spedizione gratuita in Italia.
        </p>
      </section>
      <SerieAClient products={products} teamSlug={team} />

      {relatedArticles.length > 0 && (
        <section className="py-16 bg-[#0a0a0a]">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
            <div className="flex items-center gap-3 mb-8">
              <span className="w-6 h-[1.5px] rounded-full" style={{ background: "#c8f000" }} />
              <span
                className="text-[10px] uppercase tracking-[4px] font-bold"
                style={{ fontFamily: "var(--font-mono, monospace)", color: "rgba(200,240,0,0.7)" }}
              >
                // Notizie {teamDisplayName}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedArticles.map((article: any) => {
                const cat = article.category === "transferMarket" ? "transfer" : article.category;
                return (
                  <Link
                    key={article._id}
                    href={`/${cat}/${article.slug}`}
                    className="group gm-card flex flex-col overflow-hidden rounded-2xl"
                    style={{ background: "#111", border: "1px solid rgba(255,255,255,0.06)" }}
                  >
                    <div className="relative w-full overflow-hidden" style={{ aspectRatio: "16/9" }}>
                      <Image src={article.image} alt={article.title} fill className="object-cover transition-transform duration-500 group-hover:scale-105" sizes="(max-width: 768px) 100vw, 33vw" />
                    </div>
                    <div className="p-5 flex flex-col gap-2">
                      <h3
                        className="font-black uppercase text-white leading-tight line-clamp-2"
                        style={{ fontFamily: "var(--font-display, 'Barlow Condensed', sans-serif)", fontSize: "1.1rem" }}
                      >
                        {article.title}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1" style={{ color: "#c8f000", fontFamily: "var(--font-mono, monospace)", fontSize: "0.7rem", letterSpacing: "2px", textTransform: "uppercase" }}>
                        Leggi <ArrowRight size={12} className="group-hover:translate-x-1 transition-transform duration-200" />
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
} 