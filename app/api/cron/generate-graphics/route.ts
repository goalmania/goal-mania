import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import ProcessedGraphic from "@/lib/models/ProcessedGraphic";

export const maxDuration = 60;
export const runtime = "nodejs";

const CANVA_API = "https://api.canva.com/rest/v1";
const CANVA_TEMPLATE_ID = process.env.CANVA_BRAND_TEMPLATE_ID || "EAHL-NtrmqE";
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

// ─── Canva OAuth: ottieni access token dal refresh token ──────────────────────
async function getCanvaAccessToken(): Promise<string> {
  const clientId = process.env.CANVA_CLIENT_ID;
  const clientSecret = process.env.CANVA_CLIENT_SECRET;
  const refreshToken = process.env.CANVA_REFRESH_TOKEN;

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error("Canva credentials missing: CANVA_CLIENT_ID, CANVA_CLIENT_SECRET, CANVA_REFRESH_TOKEN");
  }

  const res = await fetch(`${CANVA_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
    }),
  });

  const data = await res.json();
  if (!data.access_token) throw new Error(`Canva token error: ${JSON.stringify(data)}`);
  return data.access_token;
}

// ─── Canva: carica immagine come asset da URL pubblico ───────────────────────
async function uploadImageToCanva(imageUrl: string, token: string): Promise<string> {
  const fileName = imageUrl.split("/").pop()?.split("?")[0]?.slice(0, 50) || "article-photo.jpg";

  const res = await fetch(`${CANVA_API}/url-asset-uploads`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ name: fileName, url: imageUrl }),
  });

  const data = await res.json();
  if (!data.job?.id) throw new Error(`Canva upload error: ${JSON.stringify(data)}`);

  return await pollCanvaAssetJob(data.job.id, token);
}

async function pollCanvaAssetJob(jobId: string, token: string): Promise<string> {
  for (let i = 0; i < 20; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${CANVA_API}/url-asset-uploads/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.job?.status === "success" && data.job?.asset?.id) return data.job.asset.id;
    if (data.job?.status === "failed") throw new Error(`Canva asset upload failed: ${JSON.stringify(data)}`);
  }
  throw new Error("Canva asset upload timed out");
}

// ─── Canva: crea design via autofill dal brand template ───────────────────────
async function createAutofillJob(
  title: string,
  assetId: string,
  token: string
): Promise<string> {
  const res = await fetch(`${CANVA_API}/autofills`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      brand_template_id: CANVA_TEMPLATE_ID,
      title: `GoalMania - ${title.slice(0, 50)}`,
      data: {
        // I nomi "title" e "photo" devono corrispondere alle etichette
        // "Connected Data" configurate nel template Canva
        title: { type: "text", text: title.toUpperCase() },
        photo: { type: "image", asset_id: assetId },
      },
    }),
  });

  const data = await res.json();
  if (!data.job?.id) throw new Error(`Canva autofill error: ${JSON.stringify(data)}`);
  return data.job.id;
}

async function pollAutofillJob(jobId: string, token: string): Promise<string> {
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const res = await fetch(`${CANVA_API}/autofills/${jobId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.job?.status === "success" && data.job?.result?.design?.id) {
      return data.job.result.design.id;
    }
    if (data.job?.status === "failed") throw new Error(`Canva autofill job failed: ${JSON.stringify(data)}`);
  }
  throw new Error("Canva autofill job timed out");
}

// ─── Canva: esporta design come PNG ──────────────────────────────────────────
async function exportDesign(designId: string, token: string): Promise<string> {
  const res = await fetch(`${CANVA_API}/exports`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      design_id: designId,
      format: {
        type: "png",
        export_quality: "regular",
        pages: [1],
      },
    }),
  });

  const data = await res.json();
  if (!data.job?.id) throw new Error(`Canva export error: ${JSON.stringify(data)}`);

  // Polling export
  for (let i = 0; i < 30; i++) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(`${CANVA_API}/exports/${data.job.id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const pollData = await poll.json();
    if (pollData.job?.status === "success") {
      const url = pollData.job?.result?.urls?.[0];
      if (url) return url;
    }
    if (pollData.job?.status === "failed") throw new Error("Canva export failed");
  }
  throw new Error("Canva export timed out");
}

// ─── Telegram: scarica PNG e invia ───────────────────────────────────────────
async function sendToTelegram(pngUrl: string, caption: string): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID || "594028829";
  if (!token) throw new Error("TELEGRAM_BOT_TOKEN not set");

  // Scarica il PNG da Canva
  const imgRes = await fetch(pngUrl);
  const imgBuffer = await imgRes.arrayBuffer();

  const formData = new FormData();
  formData.append("chat_id", chatId);
  formData.append("caption", caption);
  formData.append("parse_mode", "HTML");
  formData.append("photo", new Blob([imgBuffer], { type: "image/png" }), "graphic.png");

  const res = await fetch(`${TELEGRAM_API}${token}/sendPhoto`, { method: "POST", body: formData });
  const data = await res.json();
  if (!data.ok) throw new Error(`Telegram error: ${JSON.stringify(data)}`);
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

    // ── Mark article as processed ──
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

    // ── Lista articoli pendenti ──
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

    // ── Generazione grafica via Canva REST API ──
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const dateFilter = isTest ? {} : { publishedAt: { $gte: threeHoursAgo } };

    const recentArticles = await Article.find({ status: "published", ...dateFilter })
      .sort({ publishedAt: -1 })
      .limit(isTest ? 1 : 50)
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
    const toProcess = isTest
      ? recentArticles.slice(0, 1)
      : recentArticles.filter((a) => !processedSet.has(String(a._id)));

    if (!toProcess.length) {
      return NextResponse.json({ ok: true, message: "All recent articles already processed" });
    }

    const token = await getCanvaAccessToken();
    const results: Array<{ slug: string; status: "sent" | "error"; error?: string }> = [];

    for (const article of toProcess) {
      try {
        const rawImage: string =
          (article.images as { url: string; isMain?: boolean }[])?.find((img) => img.isMain)?.url ||
          (article.images as { url: string }[])?.[0]?.url ||
          (article.image as string) || "";
        const imageUrl = rawImage.startsWith("http") ? rawImage : `${SITE_URL}${rawImage}`;

        // 1. Upload immagine su Canva
        const assetId = await uploadImageToCanva(imageUrl, token);

        // 2. Crea design via autofill
        const autofillJobId = await createAutofillJob(article.title as string, assetId, token);
        const designId = await pollAutofillJob(autofillJobId, token);

        // 3. Esporta PNG
        const pngUrl = await exportDesign(designId, token);

        // 4. Invia su Telegram
        const artUrl = articleUrl(article.slug as string, article.category as string);
        await sendToTelegram(pngUrl, `⚽ <b>${article.title}</b>\n\n📖 ${artUrl}`);

        // 5. Segna come processato
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
    console.error("[generate-graphics] Fatal error:", err);
    return NextResponse.json({ error: "Internal server error", details: String(err) }, { status: 500 });
  }
}
