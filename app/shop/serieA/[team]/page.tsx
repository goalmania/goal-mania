import SerieAClient from "@/app/_components/SerieAClient";
import HomeNewsStrip from "@/components/home/HomeNewsStrip";
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
    description: `Acquista la maglia ${teamName} 2025/26 a partire da 35€. Home, away e third kit. Spedizione gratuita in Italia.`,
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
      description: `Home, away e third kit ${teamName} 2025/26. Da 35€, spedizione gratuita.`,
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
    description: `Acquista la maglia ${teamDisplayName} 2025/26 a partire da 35€. Home, away e third kit. Spedizione gratuita in Italia.`,
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
      <SerieAClient
        products={products}
        teamSlug={team}
        title={`Maglie ${teamDisplayName}`}
        lead={`Home, away e third: tutte le maglie ${teamDisplayName} a partire da 35€. Spedizione gratuita in Italia e reso entro 14 giorni.`}
      >
        {relatedArticles.length > 0 && <HomeNewsStrip articles={relatedArticles} title={`Notizie ${teamDisplayName}`} />}
      </SerieAClient>
    </>
  );
} 