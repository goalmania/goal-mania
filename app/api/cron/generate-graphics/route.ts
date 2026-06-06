import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import ProcessedGraphic from "@/lib/models/ProcessedGraphic";

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

// ─── HTML template — replica 1:1 del design Canva GoalMania ─────────────────
// Design: foto full-bleed, logo GM top-left, gradient overlay bottom, testo
// bianco uppercase con parole-chiave in lime (#c8f000), stile Bebas Neue.
function buildHtml(title: string, imageUrl: string): string {
  const MAX = 100;
  const raw = title.length > MAX ? title.slice(0, MAX - 1) + "…" : title;
  const titleUpper = raw.toUpperCase();

  // Evidenzia le prime 2-3 parole "forti" in lime, resto in bianco
  const words = titleUpper.split(" ");
  // Troviamo lo split: prime parole fino a ~20 char in lime, resto bianco
  let limeCount = 0;
  let charCount = 0;
  for (let i = 0; i < words.length; i++) {
    charCount += words[i].length + 1;
    limeCount = i + 1;
    if (charCount >= 18 || i >= 2) break;
  }
  const limePart = words.slice(0, limeCount).join(" ");
  const whitePart = words.slice(limeCount).join(" ");

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
    height: 1350px;
    overflow: hidden;
    background: #0a0a0a;
    position: relative;
    font-family: 'Bebas Neue', sans-serif;
  }

  /* ── Foto full-bleed ── */
  .photo {
    position: absolute;
    inset: 0;
    width: 100%;
    height: 100%;
  }
  .photo img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    object-position: center top;
    display: block;
  }

  /* ── Gradient overlay bottom ── */
  .overlay {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 620px;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0,0,0,0.55) 25%,
      rgba(0,0,0,0.88) 55%,
      rgba(0,0,0,0.97) 100%
    );
  }

  /* ── Logo GM top-left ── */
  .logo {
    position: absolute;
    top: 40px;
    left: 40px;
    width: 90px;
    height: 90px;
  }
  .logo img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }

  /* ── Contenitore testo bottom ── */
  .text-block {
    position: absolute;
    bottom: 60px;
    left: 50px;
    right: 50px;
  }

  /* ── Label "GOAL-MANIA.IT" ── */
  .label {
    display: inline-block;
    background: #c8f000;
    color: #000;
    font-family: 'Bebas Neue', sans-serif;
    font-size: 22px;
    letter-spacing: 3px;
    padding: 4px 14px 2px;
    margin-bottom: 18px;
    border-radius: 3px;
  }

  /* ── Titolo ── */
  .title {
    font-family: 'Bebas Neue', sans-serif;
    font-size: 82px;
    line-height: 1.05;
    letter-spacing: 2.5px;
    word-break: break-word;
  }
  .title .lime { color: #c8f000; }
  .title .white { color: #ffffff; }

  /* ── Linea decorativa ── */
  .deco-line {
    margin-top: 24px;
    width: 80px;
    height: 4px;
    background: #c8f000;
    border-radius: 2px;
  }
</style>
</head>
<body>
  <div class="photo">
    <img src="${imageUrl}" alt="" crossorigin="anonymous" />
  </div>

  <div class="overlay"></div>

  <div class="logo">
    <img src="https://goal-mania.it/images/recentUpdate/desktop-logo.png" alt="GM" crossorigin="anonymous" />
  </div>

  <div class="text-block">
    <div class="label">GOAL-MANIA.IT</div>
    <div class="title">
      <span class="lime">${limePart}</span>${whitePart ? ' <span class="white">' + whitePart + '</span>' : ''}
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
    defaultViewport: { width: 1080, height: 1350 },
    executablePath: await chromium.executablePath(
      "https://github.com/Sparticuz/chromium/releases/download/v131.0.1/chromium-v131.0.1-pack.tar"
    ),
    headless: true,
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1080, height: 1350, deviceScaleFactor: 1 });

    const html = buildHtml(title, imageUrl);
    await page.setContent(html, { waitUntil: "load", timeout: 30000 });
    // Extra wait for fonts to load
    await new Promise((r) => setTimeout(r, 2500));

    // Aspetta che il font Bebas Neue sia caricato
    await page.evaluateHandle("document.fonts.ready");

    const screenshot = await page.screenshot({
      type: "png",
      clip: { x: 0, y: 0, width: 1080, height: 1350 },
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
        .select("_id title image images slug category")
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

    // ── Il flusso Puppeteer è disabilitato. Le grafiche vengono generate
    // ── esclusivamente tramite Canva MCP dall'agente schedulato.
    // ── Usa ?list=pending per ottenere gli articoli da processare.
    return NextResponse.json({
      ok: false,
      message: "Direct generation disabled. Use ?list=pending to get articles, then generate via Canva MCP.",
    });

    // eslint-disable-next-line no-unreachable
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const dateFilter = isTest ? {} : { publishedAt: { $gte: threeHoursAgo } };

    const recentArticles = await Article.find({ status: "published", ...dateFilter })
      .sort({ publishedAt: -1 })
      .limit(isTest ? 1 : 50)
      .select("_id title image images slug category publishedAt")
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

        const artUrl = articleUrl(article.slug as string, article.category as string);
        const caption = `⚽ <b>${article.title}</b>\n\n📖 ${artUrl}`;
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
