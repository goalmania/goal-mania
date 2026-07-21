import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Divide la query in singole parole: ogni parola deve comparire da qualche
// parte nei campi indicati, in qualsiasi ordine — così "maglia away juventus
// 26 27" trova "Maglia Juventus Away 2026/27" anche se ordine e formato
// (26 vs 2026) non coincidono esattamente.
function tokenize(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map(escapeRegex);
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("q");

    if (!query) {
      return NextResponse.json({ products: [], articles: [] });
    }

    await connectDB();

    const tokens = tokenize(query);

    const productFields = ["title", "description", "category", "country", "nationalTeam", "slug"];
    const articleFields = ["title", "summary", "content", "category"];

    const productQuery = {
      $and: tokens.map((t) => ({
        $or: productFields.map((field) => ({ [field]: { $regex: t, $options: "i" } })),
      })),
      isActive: true,
    };

    const articleQuery = {
      $and: tokens.map((t) => ({
        $or: articleFields.map((field) => ({ [field]: { $regex: t, $options: "i" } })),
      })),
      status: "published",
    };

    // Search for products
    const products = await Product.find(productQuery).limit(10);

    // Search for articles
    const articles = await Article.find(articleQuery).limit(10);

    return NextResponse.json({
      products: JSON.parse(JSON.stringify(products)),
      articles: JSON.parse(JSON.stringify(articles)),
    });
  } catch (error) {
    console.error("Search API error:", error);
    return NextResponse.json(
      { error: "Failed to perform search" },
      { status: 500 }
    );
  }
}
