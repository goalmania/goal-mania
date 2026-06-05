import { NextRequest, NextResponse } from "next/server";
import { ImageResponse } from "next/og";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import ProcessedGraphic from "@/lib/models/ProcessedGraphic";

export const maxDuration = 60;
export const runtime = "nodejs";

const TELEGRAM_API = "https://api.telegram.org/bot";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goal-mania.it";

async function generateGraphicBuffer(
  title: string,
  imageUrl: string
): Promise<Buffer> {
  let fontData: ArrayBuffer | undefined;
  try {
    const res = await fetch(
      "https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff"
    );
    if (res.ok) {
      const ct = res.headers.get("content-type") ?? "";
      if (ct.includes("font") || ct.includes("octet-stream")) {
        fontData = await res.arrayBuffer();
      }
    }
  } catch {
    // render without custom font
  }

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          background: "#0a0a0a",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "flex-start",
          fontFamily: "Inter, sans-serif",
          position: "relative",
        }}
      >
        {/* Article image — top 40% */}
        <div
          style={{
            width: 1000,
            height: 740,
            marginTop: 60,
            borderRadius: 32,
            overflow: "hidden",
            display: "flex",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            style={{
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        </div>

        {/* Spacer */}
        <div style={{ flex: 1, display: "flex" }} />

        {/* Green lime box with title */}
        <div
          style={{
            width: 1080,
            background: "#c8f000",
            padding: "60px 80px",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: 480,
          }}
        >
          <p
            style={{
              color: "#0a0a0a",
              fontSize: 68,
              fontWeight: 900,
              lineHeight: 1.15,
              textAlign: "center",
              margin: 0,
              letterSpacing: "-1px",
            }}
          >
            {title.length > 120 ? title.slice(0, 117) + "…" : title}
          </p>

          {/* Logo / branding */}
          <div
            style={{
              marginTop: 48,
              display: "flex",
              alignItems: "center",
              gap: 16,
            }}
          >
            <div
              style={{
                background: "#0a0a0a",
                borderRadius: 12,
                padding: "10px 28px",
                display: "flex",
              }}
            >
              <span
                style={{
                  color: "#c8f000",
                  fontSize: 36,
                  fontWeight: 900,
                  letterSpacing: "-0.5px",
                }}
              >
                GOAL-MANIA.IT
              </span>
            </div>
          </div>
        </div>
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: fontData
        ? [{ name: "Inter", data: fontData, weight: 900 }]
        : undefined,
    }
  );

  const arrayBuffer = await imageResponse.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

async function sendToTelegram(
  imageBuffer: Buffer,
  caption: string
): Promise<number | undefined> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || "8712903787";

  if (!token) {
    throw new Error("TELEGRAM_BOT_TOKEN not set");
  }

  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", caption);
  formData.append("parse_mode", "HTML");
  formData.append(
    "photo",
    new Blob([imageBuffer], { type: "image/png" }),
    "graphic.png"
  );

  const res = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, {
    method: "POST",
    body: formData,
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  }
  return data.result?.message_id;
}

export async function GET(req: NextRequest) {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;

  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isAuthorized =
    isVercelCron ||
    (cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (!isAuthorized) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    await connectDB();

    // Fetch articles published in the last 3 hours not yet processed
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);

    const recentArticles = await Article.find({
      status: "published",
      publishedAt: { $gte: threeHoursAgo },
    })
      .sort({ publishedAt: -1 })
      .select("_id title image images slug publishedAt")
      .lean();

    if (!recentArticles.length) {
      return NextResponse.json({
        ok: true,
        message: "No new articles in the last 3 hours",
      });
    }

    // Filter out already processed articles
    const processedIds = await ProcessedGraphic.find({
      articleId: { $in: recentArticles.map((a) => String(a._id)) },
    })
      .select("articleId")
      .lean();

    const processedSet = new Set(processedIds.map((p) => p.articleId));
    const toProcess = recentArticles.filter(
      (a) => !processedSet.has(String(a._id))
    );

    if (!toProcess.length) {
      return NextResponse.json({
        ok: true,
        message: "All recent articles already processed",
      });
    }

    const results: Array<{
      slug: string;
      status: "sent" | "error";
      error?: string;
    }> = [];

    for (const article of toProcess) {
      try {
        // Resolve best image URL
        const rawImageUrl: string =
          (article.images as { url: string; isMain?: boolean }[])?.find(
            (img) => img.isMain
          )?.url ||
          (article.images as { url: string }[])?.[0]?.url ||
          (article.image as string) ||
          "";

        // Make absolute
        const imageUrl =
          rawImageUrl.startsWith("http")
            ? rawImageUrl
            : `${SITE_URL}${rawImageUrl}`;

        const imageBuffer = await generateGraphicBuffer(
          article.title as string,
          imageUrl
        );

        const articleUrl = `${SITE_URL}/news/${article.slug}`;
        const caption = `⚽ <b>${article.title}</b>\n\n📖 Leggi l'articolo: ${articleUrl}`;

        const messageId = await sendToTelegram(imageBuffer, caption);

        await ProcessedGraphic.create({
          articleId: String(article._id),
          articleSlug: article.slug,
          sentAt: new Date(),
          telegramMessageId: messageId,
        });

        results.push({ slug: article.slug as string, status: "sent" });
      } catch (err) {
        results.push({
          slug: article.slug as string,
          status: "error",
          error: String(err),
        });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("[generate-graphics] Fatal error:", err);
    return NextResponse.json(
      { error: "Internal server error", details: String(err) },
      { status: 500 }
    );
  }
}
