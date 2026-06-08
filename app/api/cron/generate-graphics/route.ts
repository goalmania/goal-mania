import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import ProcessedGraphic from "@/lib/models/ProcessedGraphic";
import { generateGraphic } from "@/lib/utils/generateGraphic";

export const maxDuration = 60;
export const runtime = "nodejs";

const TELEGRAM_API = "https://api.telegram.org/bot";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goal-mania.it";

const CATEGORY_PATH: Record<string, string> = {
  news: "news",
  transferMarket: "transfer",
  serieA: "serieA",
  internationalTeams: "international",
};

function articleUrl(slug: string, category: string): string {
  const path = CATEGORY_PATH[category] ?? "news";
  return `${SITE_URL}/${path}/${slug}`;
}

async function sendToTelegram(pngBuffer: Buffer, caption: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || "594028829";
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");

  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", caption);
  formData.append("parse_mode", "HTML");
  formData.append("photo", new Blob([pngBuffer], { type: "image/png" }), "graphic.png");

  const res = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, { method: "POST", body: formData });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram error: ${JSON.stringify(data)}`);
}

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (!isAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isTest = req.nextUrl.searchParams.get("test") === "1";
  const listPending = req.nextUrl.searchParams.get("list") === "pending";

  try {
    await connectDB();

    if (listPending) {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const recent = await Article.find({ status: "published", publishedAt: { $gte: threeHoursAgo } })
        .sort({ publishedAt: -1 })
        .limit(20)
        .select("_id title image images slug category")
        .lean();
      if (!recent.length) return NextResponse.json([]);
      const done = await ProcessedGraphic.find({ articleId: { $in: recent.map((a) => String(a._id)) } })
        .select("articleId").lean();
      const doneSet = new Set(done.map((d) => d.articleId));
      const pending = recent
        .filter((a) => !doneSet.has(String(a._id)))
        .map((a) => {
          const img =
            (a.images as { url: string; isMain?: boolean }[])?.find((i) => i.isMain)?.url ||
            (a.images as { url: string }[])?.[0]?.url ||
            (a.image as string) || "";
          return {
            id: String(a._id),
            title: a.title,
            imageUrl: img,
            slug: a.slug,
            url: articleUrl(a.slug as string, a.category as string),
          };
        });
      return NextResponse.json(pending);
    }

    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);
    const dateFilter = isTest ? {} : { publishedAt: { $gte: oneHourAgo } };

    const recentArticles = await Article.find({ status: "published", ...dateFilter })
      .sort({ publishedAt: -1 })
      .limit(isTest ? 5 : 50)
      .select("_id title image images slug category publishedAt")
      .lean();

    if (!recentArticles.length) {
      return NextResponse.json({ ok: true, message: "No new articles" });
    }

    const processedIds = isTest
      ? []
      : await ProcessedGraphic.find({ articleId: { $in: recentArticles.map((a) => String(a._id)) } })
          .select("articleId").lean();

    const processedSet = new Set(processedIds.map((p) => p.articleId));

    // In test mode trova primo articolo con immagine http valida
    const toProcess = recentArticles
      .filter((a) => {
        if (!isTest && processedSet.has(String(a._id))) return false;
        const rawImg =
          (a.images as { url: string; isMain?: boolean }[])?.find((i) => i.isMain)?.url ||
          (a.images as { url: string }[])?.[0]?.url ||
          (a.image as string) || "";
        const imgUrl = rawImg.startsWith("http") ? rawImg : `${SITE_URL}${rawImg}`;
        return imgUrl.startsWith("http") && !imgUrl.endsWith("/images/image.png");
      })
      .slice(0, 1);

    if (!toProcess.length) {
      return NextResponse.json({ ok: true, message: "No processable articles (missing valid image)" });
    }

    const results: Array<{ slug: string; status: "sent" | "error"; error?: string }> = [];

    for (const article of toProcess) {
      try {
        const rawImage: string =
          (article.images as { url: string; isMain?: boolean }[])?.find((img) => img.isMain)?.url ||
          (article.images as { url: string }[])?.[0]?.url ||
          (article.image as string) || "";
        const imageUrl = rawImage.startsWith("http") ? rawImage : `${SITE_URL}${rawImage}`;

        // Genera grafica replica template Canva con Sharp + Satori
        const pngBuffer = await generateGraphic(article.title as string, imageUrl);

        // Invia su Telegram
        const artUrl = articleUrl(article.slug as string, article.category as string);
        await sendToTelegram(pngBuffer, `⚽ <b>${article.title}</b>\n\n📖 ${artUrl}`);

        if (!isTest) {
          await ProcessedGraphic.create({
            articleId: String(article._id),
            articleSlug: article.slug,
            sentAt: new Date(),
          });
        }

        results.push({ slug: article.slug as string, status: "sent" });
      } catch (err) {
        results.push({ slug: article.slug as string, status: "error", error: String(err) });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    const errMsg = err instanceof Error ? err.message : String(err);
    console.error("[generate-graphics] Fatal error:", errMsg);
    return NextResponse.json({ error: "Internal server error", details: errMsg }, { status: 500 });
  }
}
