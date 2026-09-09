import { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it";

// Data stabile per le pagine evergreen (categorie / team): cambiarla a mano
// quando quelle pagine vengono ristrutturate. Evita che ogni rigenerazione
// oraria della sitemap sposti in avanti il lastmod di centinaia di URL statici
// (segnale rumoroso/manipolativo per Google). Le schede prodotto e gli articoli
// continuano a usare il loro updatedAt reale.
const EVERGREEN_LASTMOD = new Date("2026-09-09T00:00:00.000Z");

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const serieATeams = [
    "inter", "milan", "juventus", "napoli", "roma", "lazio",
    "atalanta", "fiorentina", "torino", "bologna", "como",
    "udinese", "monza", "lecce", "cagliari", "genoa", "empoli", "verona",
  ];

  const premierLeagueTeams = [
    "manchester-united", "manchester-city", "liverpool",
    "arsenal", "chelsea", "newcastle", "tottenham", "aston-villa",
  ];

  const worldCupTeams = [
    "italy", "france", "germany", "spain", "brazil", "argentina",
    "portugal", "england", "netherlands", "belgium",
    "croatia", "morocco", "usa", "mexico",
  ];

  const internationalTeams = [
    "real-madrid", "barcelona", "psg", "atletico", "bayern", "dortmund",
  ];

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/transfer`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/shop/serieA`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/shop/premier-league`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/shop/worldcup`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/shop/international`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/shop/2026/27`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.9 },
    { url: `${BASE_URL}/shop/2025/26`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/shop/2024/25`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/shop/retro`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.9 },
    // Retro team pages — high commercial intent ("maglia Milan retro", "maglia Napoli Maradona")
    ...["milan","inter","juventus","napoli","roma","lazio","fiorentina","parma",
        "man-united","liverpool","arsenal","barcellona","real-madrid","celtic",
        "brasile","argentina","italia","inghilterra","francia","psg"].map((team) => ({
      url: `${BASE_URL}/shop/retro/${team}`,
      lastModified: EVERGREEN_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    { url: `${BASE_URL}/shop/jackets`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/shop/limited-edition`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/shop/mystery-box`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/shipping`, lastModified: EVERGREEN_LASTMOD, changeFrequency: "monthly", priority: 0.3 },
    // Serie A team pages — high-value keyword targets
    ...serieATeams.map((team) => ({
      url: `${BASE_URL}/shop/serieA/${team}`,
      lastModified: EVERGREEN_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    // Premier League team pages
    ...premierLeagueTeams.map((team) => ({
      url: `${BASE_URL}/shop/premier-league/${team}`,
      lastModified: EVERGREEN_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.85,
    })),
    // World Cup national team pages
    ...worldCupTeams.map((team) => ({
      url: `${BASE_URL}/shop/worldcup/${team}`,
      lastModified: EVERGREEN_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.75,
    })),
    // Top European club pages — evergreen, high-volume, not World-Cup-dependent
    ...internationalTeams.map((team) => ({
      url: `${BASE_URL}/shop/international/${team}`,
      lastModified: EVERGREEN_LASTMOD,
      changeFrequency: "weekly" as const,
      priority: 0.9,
    })),
  ];

  try {
    await connectDB();

    const [products, articles] = await Promise.all([
      Product.find({ isActive: true }).select("_id slug updatedAt").lean(),
      Article.find({ status: "published" }).select("slug category updatedAt").lean(),
    ]);

    const MAX_URL_LENGTH = 200;

    const productRoutes: MetadataRoute.Sitemap = (products as any[])
      .filter((p) => {
        const slug = p.slug || p._id.toString();
        return `${BASE_URL}/products/${slug}`.length <= MAX_URL_LENGTH;
      })
      .map((p) => ({
        url: `${BASE_URL}/products/${p.slug || p._id.toString()}`,
        lastModified: p.updatedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      }));

    const categoryToSection = (cat: string) => {
      if (cat === "news") return "news";
      if (cat === "transferMarket") return "transfer";
      if (cat === "serieA") return "serieA";
      if (cat === "internationalTeams") return "international";
      return "news";
    };

    const now = Date.now();
    const oneDayMs = 24 * 60 * 60 * 1000;

    const articleRoutes: MetadataRoute.Sitemap = (articles as any[])
      .filter((a) => {
        const section = categoryToSection(a.category);
        return `${BASE_URL}/${section}/${a.slug}`.length <= MAX_URL_LENGTH;
      })
      .map((a) => {
        const section = categoryToSection(a.category);
        const publishedAt = a.updatedAt ?? a.publishedAt ?? new Date();
        const ageMs = now - new Date(publishedAt).getTime();
        // Articoli delle ultime 48h → alta priorità e changeFrequency daily
        const isRecent = ageMs < 2 * oneDayMs;
        return {
          url: `${BASE_URL}/${section}/${a.slug}`,
          lastModified: publishedAt,
          changeFrequency: isRecent ? ("daily" as const) : ("weekly" as const),
          priority: isRecent ? 0.85 : 0.65,
        };
      });

    return [...staticRoutes, ...productRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
