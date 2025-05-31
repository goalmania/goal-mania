export interface NewsArticle {
  id: string;
  title: string;
  content: string;
  summary: string;
  image: string;
  category: "news" | "transfer" | "general";
  author: string;
  publishedAt: string;
  slug: string;
  tags: string[];
}

export interface NewsResponse {
  articles: NewsArticle[];
  total: number;
  page: number;
  limit: number;
}
