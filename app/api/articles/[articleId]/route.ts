import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notifySearchEngines } from "@/lib/google-indexing";

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

    // Revalidate listing pages and the article's own page immediately
    if (data.status === "published" || article.status === "published") {
      const categoryToPath: Record<string, string> = {
        news: "/news",
        transferMarket: "/transfer",
        serieA: "/serieA",
        internationalTeams: "/international",
      };
      const category = data.category ?? article.category;
      const listPath = categoryToPath[category] ?? "/news";
      const slug = updatedArticle?.slug ?? article.slug;
      revalidatePath(listPath);
      revalidatePath(`${listPath}/${slug}`);
      revalidatePath("/news"); // homepage news section
      revalidatePath("/");

      // Notifica Google + Bing/IndexNow quando un articolo viene pubblicato/modificato
      if (data.status === "published") {
        const publicUrl = `https://goal-mania.it${listPath}/${slug}`;
        notifySearchEngines(publicUrl).catch(() => {});
      }
    }

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
