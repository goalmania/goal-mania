import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article, { IArticle } from "@/lib/models/Article";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

// GET /api/articles
export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    const featured = url.searchParams.get("featured");
    const league = url.searchParams.get("league");
    const search = url.searchParams.get("search");
    const limit = url.searchParams.get("limit")
      ? parseInt(url.searchParams.get("limit")!)
      : 10;
    const page = url.searchParams.get("page")
      ? parseInt(url.searchParams.get("page")!)
      : 1;

    await connectDB();

    const query: Record<string, any> = {};

    if (category) query.category = category;
    if (status) query.status = status;
    if (featured === "true") query.featured = true;
    if (league) query.league = league;

    // Add search functionality
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { summary: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } },
        { author: { $regex: search, $options: 'i' } },
      ];
    }

    const articles = await Article.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip((page - 1) * limit);

    const total = await Article.countDocuments(query);

    return NextResponse.json({
      articles,
      pagination: {
        total,
        pages: Math.ceil(total / limit),
        page,
        limit,
      },
    });
  } catch (error) {
    console.error("[ARTICLES_GET]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// POST /api/articles
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role as string | undefined;
    if (role !== "admin" && role !== "journalist") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const data = await req.json();

    await connectDB();

    // Validate required fields
    const requiredFields = [
      "title",
      "content",
      "summary",
      "image",
      "category",
      "author",
    ];
    for (const field of requiredFields) {
      if (!data[field]) {
        return NextResponse.json(
          { error: `Field '${field}' is required` },
          { status: 400 }
        );
      }
    }

    // Create article
    const article = await Article.create({
      ...data,
      publishedAt: data.status === "published" ? new Date() : null,
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    console.error("[ARTICLES_POST]", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
