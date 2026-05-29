import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";

// Endpoint temporaneo per pulizia articoli stale/non-calcio
// DELETE dopo l'uso

const BAD_KEYWORDS = [
  "goggia",
  "brignone",
  "superg",
  "pugilato",
  "ring alla vita",
  "massimo pericolo",
  "razzisti e sciarpe",
  "esultanze che raccontano",
  "anima storica dell'inter: esultanze",
  "goal mania ai",  // vecchio autore
];

export async function GET(req: NextRequest) {
  const secret = req.headers.get("authorization");
  if (secret !== "Bearer goalmania2026") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await connectDB();

  // Trova tutti gli articoli con autore vecchio
  const oldAuthorArticles = await Article.find({ author: "Goal Mania AI" })
    .select("title slug publishedAt")
    .lean();

  // Trova articoli non-calcio per keyword nel titolo
  const badKeywordArticles = await Article.find({
    $or: BAD_KEYWORDS.map(kw => ({ title: { $regex: kw, $options: "i" } }))
  }).select("title slug publishedAt").lean();

  // Combina e deduplica
  const allBad = [...oldAuthorArticles, ...badKeywordArticles];
  const uniqueIds = [...new Set(allBad.map(a => String((a as any)._id)))];

  // Dry run: mostra cosa verrebbe eliminato
  const dryRun = req.nextUrl.searchParams.get("confirm") !== "yes";

  if (dryRun) {
    return NextResponse.json({
      dryRun: true,
      message: "Aggiungi ?confirm=yes per procedere",
      toDelete: allBad.map(a => ({ title: (a as any).title, slug: (a as any).slug })),
      count: uniqueIds.length,
    });
  }

  // Elimina
  const result = await Article.deleteMany({
    _id: { $in: uniqueIds },
  });

  return NextResponse.json({
    deleted: result.deletedCount,
    message: `Eliminati ${result.deletedCount} articoli.`,
  });
}
