import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";

// POST /api/articles/[articleId]/view — increment view count (no auth needed)
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    await connectDB();

    // articleId can be either a MongoDB _id or a slug
    const filter = articleId.match(/^[a-f\d]{24}$/i)
      ? { _id: articleId }
      : { slug: articleId };

    await Article.findOneAndUpdate(filter, { $inc: { views: 1 } });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
