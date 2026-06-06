import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import ProcessedGraphic from "@/lib/models/ProcessedGraphic";

export const maxDuration = 60;
export const runtime = "nodejs";

const TELEGRAM_API = "https://api.telegram.org/bot";
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://goal-mania.it";

// ─── HTML template — replica 1:1 del design Canva ────────────────────────────
function buildHtml(title: string, imageUrl: string): string {
  const titleUpper = (title.length > 110 ? title.slice(0, 107) + "…" : title).toUpperCase();

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=block" rel="stylesheet">
<style>
  * { margin: 0; padding: 0; box-sizing: border-box; }

  body {
    width: 1080px;
    height: 1920px;
    overflow: hidden;
    background-color: #1e1e1e;
    background-image: radial-gradient(circle, transparent 4px, #262626 4px, #262626 5.5px, transparent 5.5px);
    background-size: 28px 28px;
    position: relative;
    font-family: 'Bebas Neue', sans-serif;
  }

  /* ── Photo ── */
  .photo {
    position: absolute;
    top: 80px;
    left: 68px;
    width: 944px;
    height: 756px;
    border-radius: 40px;
    overflow: hidden;
    object-fit: cover;
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }

  /* ── Box con angoli smussati ── */
  .box {
    position: absolute;
    top: 980px;
    left: 90px;
    width: 900px;
    height: 430px;
    background: linear-gradient(180deg, #3d6200 0%, #1a2e00 100%);
    clip-path: polygon(
      20px 0%, calc(100% - 20px) 0%,
      100% 20px, 100% calc(100% - 20px),
      calc(100% - 20px) 100%, 20px 100%,
      0% calc(100% - 20px), 0% 20px
    );
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px 60px;
  }

  /* ── Testo titolo ── */
  .title {
    color: #D2F937;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 70px;
    line-height: 1.12;
    text-align: center;
    letter-spacing: 2px;
    word-break: break-word;
  }

  /* ── Elemento decorativo ── */
  .deco {
    position: absolute;
    top: 1490px;
    left: 50%;
    transform: translateX(-50%);
    display: flex;
    align-items: center;
    gap: 0;
    width: 340px;
  }
  .deco-line {
    flex: 1;
    height: 3px;
    background: #D2F937;
    border-radius: 2px;
  }
  .deco-circle {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: 3px solid #D2F937;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
  }
  .deco-dot {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #D2F937;
  }
</style>
</head>
<body>
  <div class="photo">
    <img src="${imageUrl}" alt="" crossorigin="anonymous" />
  </div>

  <div class="box">
    <p class="title">${titleUpper}</p>
  </div>

  <div class="deco">
    <div class="deco-line"></div>
    <div class="deco-circle">
      <div class="deco-dot"></div>
    </div>
    <div class="deco-line"></div>
  </div>
</body>
</html>`;
}

// ─── Genera PNG con Puppeteer ─────────────────────────────────────────────────
async function generateGraphicBuffer(title: string, imageUrl: string): Promise<Buffer> {
  // Dynamic import per compatibilità Vercel serverless
  const chromium = (await import("@sparticuz/chromium-min")).default;
  const puppeteer = (await import("puppeteer-core")).default;

  const browser = await puppeteer.launch({
    args: chromium.args,
    defaultViewport: { width: 1080, height: 1920 },
    executablePath: await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    ),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1920, deviceScaleFactor: 1 });

    const html = buildHtml(title, imageUrl);
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });
    // Extra wait for fonts to load
    await new Promise((r) => setTimeout(r, 2500));

    // Aspetta che il font Bebas Neue sia caricato
    await page.evaluateHandle("document.fonts.ready");

    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1080, height: 1920 },
    });

    return Buffer.from(screenshot);
  } finally {
    await browser.close();
  }
}

// ─── Invia su Telegram ────────────────────────────────────────────────────────
async function sendToTelegram(imageBuffer: Buffer, caption: string): Promise<number | undefined> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || "594028829";

  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");

  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", caption);
  formData.append("parse_mode", "HTML");
  formData.append("photo", new Blob([imageBuffer], { type: "image/png" }), "graphic.png");

  const res = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, { method: "POST", body: formData });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram API error: ${JSON.stringify(data)}`);
  return data.result?.message_id;
}

// ─── Handler principale ───────────────────────────────────────────────────────
export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  const isVercelCron = req.headers.get("x-vercel-cron") === "1";
  const isAuthorized = isVercelCron || (cronSecret && authHeader === `Bearer ${cronSecret}`);

  if (!isAuthorized) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const isTest = req.nextUrl.searchParams.get("test") === "1";
  const listPending = req.nextUrl.searchParams.get("list") === "pending";
  const markDone = req.nextUrl.searchParams.get("markDone") === "1";

  try {
    await connectDB();

    // ── Lightweight: mark one article as processed (called by the agent) ──
    if (markDone) {
      const body = await req.json().catch(() => ({}));
      const articleId = body.id as string;
      if (!articleId) return NextResponse.json({ error: "Missing id" }, { status: 400 });
      await ProcessedGraphic.updateOne(
        { articleId },
        { $setOnInsert: { articleId, sentAt: new Date() } },
        { upsert: true }
      );
      return NextResponse.json({ ok: true });
    }

    // ── Lightweight: return unprocessed articles from last 3h (for the agent) ──
    if (listPending) {
      const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
      const recent = await Article.find({ status: "published", publishedAt: { $gte: threeHoursAgo } })
        .sort({ publishedAt: -1 })
        .limit(20)
        .select("_id title image images slug")
        .lean();
      if (!recent.length) return NextResponse.json([]);
      const done = await ProcessedGraphic.find({ articleId: { $in: recent.map((a) => String(a._id)) } })
        .select("articleId").lean();
      const doneSet = new Set(done.map((d) => d.articleId));
      const pending = recent
        .filter((a) => !doneSet.has(String(a._id)))
        .map((a) => {
          const img = (a.images as { url: string; isMain?: boolean }[])?.find((i) => i.isMain)?.url
            || (a.images as { url: string }[])?.[0]?.url
            || (a.image as string) || "";
          return { id: String(a._id), title: a.title, imageUrl: img, slug: a.slug };
        });
      return NextResponse.json(pending);
    }

    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const dateFilter = isTest ? {} : { publishedAt: { $gte: threeHoursAgo } };

    const recentArticles = await Article.find({ status: "published", ...dateFilter })
      .sort({ publishedAt: -1 })
      .limit(isTest ? 1 : 50)
      .select("_id title image images slug publishedAt")
      .lean();

    if (!recentArticles.length) {
      return NextResponse.json({ ok: true, message: "No new articles in the last 3 hours" });
    }

    const processedIds = isTest
      ? []
      : await ProcessedGraphic.find({ articleId: { $in: recentArticles.map((a) => String(a._id)) } })
          .select("articleId")
          .lean();

    const processedSet = new Set(processedIds.map((p) => p.articleId));
    const toProcess = isTest
      ? recentArticles.slice(0, 1)
      : recentArticles.filter((a) => !processedSet.has(String(a._id)));

    if (!toProcess.length) {
      return NextResponse.json({ ok: true, message: "All recent articles already processed" });
    }

    const results: Array<{ slug: string; status: "sent" | "error"; error?: string }> = [];

    for (const article of toProcess) {
      try {
        const rawImageUrl: string =
          (article.images as { url: string; isMain?: boolean }[])?.find((img) => img.isMain)?.url ||
          (article.images as { url: string }[])?.[0]?.url ||
          (article.image as string) ||
          "";

        const imageUrl = rawImageUrl.startsWith("http") ? rawImageUrl : `${SITE_URL}${rawImageUrl}`;
        const imageBuffer = await generateGraphicBuffer(article.title as string, imageUrl);

        const articleUrl = `${SITE_URL}/news/${article.slug}`;
        const caption = `⚽ <b>${article.title}</b>\n\n📖 ${articleUrl}`;
        const messageId = await sendToTelegram(imageBuffer, caption);

        if (!isTest) {
          await ProcessedGraphic.create({
            articleId: String(article._id),
            articleSlug: article.slug,
            sentAt: new Date(),
            telegramMessageId: messageId,
          });
        }

        results.push({ slug: article.slug as string, status: "sent" });
      } catch (err) {
        results.push({ slug: article.slug as string, status: "error", error: String(err) });
      }
    }

    return NextResponse.json({ ok: true, results });
  } catch (err) {
    console.error("[generate-graphics] Fatal error:", err);
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 });
  }
}
