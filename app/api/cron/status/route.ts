import { NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";

// GET /api/cron/status
// Mostra gli ultimi articoli generati automaticamente dall'AI
export async function GET() {
  try {
    await connectDB();

    const aiArticles = await Article.find({ author: "Redazione Goalmania" })
      .sort({ createdAt: -1 })
      .limit(10)
      .select("title category status publishedAt createdAt slug");

    const total = await Article.countDocuments({ author: "Redazione Goalmania" });

    return NextResponse.json({
      ok: true,
      totalAiArticles: total,
      lastGenerated: aiArticles[0]?.createdAt ?? null,
      recentArticles: aiArticles.map((a) => ({
        title: a.title,
        category: a.category,
        status: a.status,
        publishedAt: a.publishedAt,
        slug: a.slug,
        url: `/news/${a.slug}`,
      })),
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
