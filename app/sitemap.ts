import { MetadataRoute } from "next";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it";

export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const staticRoutes: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: new Date(), changeFrequency: "daily", priority: 1.0 },
    { url: `${BASE_URL}/shop`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${BASE_URL}/news`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE_URL}/transfer`, lastModified: new Date(), changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE_URL}/shop/serieA`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/shop/premier-league`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/shop/worldcup`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop/2025/26`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
    { url: `${BASE_URL}/shop/2024/25`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/shop/retro`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/shop/jackets`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/shop/limited-edition`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.6 },
    { url: `${BASE_URL}/shop/mystery-box`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE_URL}/about`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/contact`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE_URL}/shipping`, lastModified: new Date(), changeFrequency: "monthly", priority: 0.3 },
  ];

  try {
    await connectDB();

    const [products, articles] = await Promise.all([
      Product.find({ isActive: true }).select("_id slug updatedAt").lean(),
      Article.find({ status: "published" }).select("slug category updatedAt").lean(),
    ]);

    const productRoutes: MetadataRoute.Sitemap = (products as any[]).map((p) => ({
      url: `${BASE_URL}/products/${p.slug || p._id.toString()}`,
      lastModified: p.updatedAt ?? new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const articleRoutes: MetadataRoute.Sitemap = (articles as any[]).map((a) => {
      const section =
        a.category === "news" ? "news" :
        a.category === "transferMarket" ? "transfer" :
        a.category === "serieA" ? "serieA" : "news";
      return {
        url: `${BASE_URL}/${section}/${a.slug}`,
        lastModified: a.updatedAt ?? new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    });

    return [...staticRoutes, ...productRoutes, ...articleRoutes];
  } catch {
    return staticRoutes;
  }
}
