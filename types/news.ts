export interface NewsArticle {
  _id?: string;
  id?: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  category: "news" | "transferMarket" | "serieA" | "internationalTeams" | "transfer" | "general";
  author: string;
  publishedAt: string;
  slug: string;
  tags: string[];
  featured?: boolean;
}

export interface NewsResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}
