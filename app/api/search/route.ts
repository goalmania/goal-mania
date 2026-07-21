import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";
import Article from "@/lib/models/Article";

function escapeRegex(text: string) {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

// Gruppi di soprannomi/varianti equivalenti: se l'utente scrive uno di questi
// termini, la ricerca considera valido il match su uno qualsiasi degli altri
// dello stesso gruppo (es. "viola" trova "Fiorentina", "italy" trova "Italia").
const ALIAS_GROUPS: string[][] = [
  ["fiorentina", "viola"],
  ["torino", "toro"],
  ["barcellona", "barcelona", "barca", "barça"],
  ["tottenham", "spurs"],
  ["atletico", "atletico madrid", "atleti"],
  ["italia", "italy"],
  ["brasile", "brazil"],
  ["francia", "france"],
  ["germania", "germany"],
  ["spagna", "spain"],
  ["portogallo", "portugal"],
  ["inghilterra", "england"],
  ["olanda", "netherlands", "holland"],
  ["belgio", "belgium"],
  ["croazia", "croatia"],
  ["marocco", "morocco"],
  ["messico", "mexico"],
  ["giappone", "japan"],
];

const ALIAS_LOOKUP = new Map<string, string[]>();
for (const group of ALIAS_GROUPS) {
  for (const term of group) {
    ALIAS_LOOKUP.set(term, group);
  }
}

// Divide la query in singole parole: ogni parola deve comparire da qualche
// parte nei campi indicati, in qualsiasi ordine — così "maglia away juventus
// 26 27" trova "Maglia Juventus Away 2026/27" anche se ordine e formato
// (26 vs 2026) non coincidono esattamente. Ogni parola viene inoltre espansa
// con i suoi eventuali soprannomi/traduzioni (vedi ALIAS_GROUPS).
function tokenize(query: string) {
  return query
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .map((word) => {
      const variants = ALIAS_LOOKUP.get(word.toLowerCase()) ?? [word];
      return variants.map(escapeRegex).join("|");
    });
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
