import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/articles/[articleId]
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    await connectDB();

    const article = await Article.findById(articleId);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    return NextResponse.json(article);
  } catch (error) {
    console.error("[ARTICLE_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PUT /api/articles/[articleId]
export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role as string | undefined;
    if (role !== "admin" && role !== "journalist") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const article = await Article.findById(articleId);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    const data = await req.json();

    // Update article
    // If status is changing from draft to published, set publishedAt
    const isPublishing =
      article.status === "draft" && data.status === "published";
    if (isPublishing) {
      data.publishedAt = new Date();
    }

    const updatedArticle = await Article.findByIdAndUpdate(articleId, data, {
      new: true,
    });

    return NextResponse.json(updatedArticle);
  } catch (error) {
    console.error("[ARTICLE_PUT]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// DELETE /api/articles/[articleId]
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ articleId: string }> }
) {
  try {
    const { articleId } = await params;
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role as string | undefined;
    if (role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await connectDB();

    const article = await Article.findById(articleId);

    if (!article) {
      return NextResponse.json({ error: "Article not found" }, { status: 404 });
    }

    await Article.findByIdAndDelete(articleId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("[ARTICLE_DELETE]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
