import { cache } from "react";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";

export const getFeaturedSerieAArticles = cache(async () => {
  try {
    await connectDB();
    const articles = await Article.find({
      category: "serieA",
      status: "published",
      featured: true,
    })
      .sort({ publishedAt: -1 })
      .limit(3)
      .lean(); // Use lean() for better performance when we don't need Mongoose documents
    
    return articles || [];
  } catch (error) {
    console.error("Error fetching featured Serie A articles:", error);
    return [];
  }
});

export const getRegularSerieAArticles = cache(async () => {
  try {
    await connectDB();
    const articles = await Article.find({
      category: "serieA",
      status: "published",
      featured: { $ne: true },
    })
      .sort({ publishedAt: -1 })
      .limit(12)
      .lean(); // Use lean() for better performance when we don't need Mongoose documents
    
    return articles || [];
  } catch (error) {
    console.error("Error fetching regular Serie A articles:", error);
    return [];
  }
});
