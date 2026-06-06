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
  const titleUpper = (title.length > 110 ? title.slice(0, 107) + "…" : title).toUpperCase();

  // Bebas Neue — try multiple sources for reliability
  let fontData: ArrayBuffer | undefined;
  const fontUrls = [
    // GitHub raw (open source, reliable)
    "https://raw.githubusercontent.com/dharmatype/Bebas-Neue/master/fonts/BebasNeue-Regular.woff2",
    // Google gstatic direct
    "https://fonts.gstatic.com/s/bebasnuee/v14/JTUSjIg69CK48gW7PXoo9WthyyTh89ZNpQ.woff2",
  ];
  for (const url of fontUrls) {
    try {
      const res = await fetch(url);
      if (res.ok) { fontData = await res.arrayBuffer(); break; }
    } catch { /* try next */ }
  }

  // ── Exact measurements from Canva PNG (1080×1920) ──────────────────────────
  // Card:     1080 × 1920
  // Photo:    top=80  left=68  w=944  h=756  radius=40
  // Box:      top=980 left=90  w=900  h=430  cut=20  gradient #5a8800→#243800
  // Text:     #D2F937  Bebas Neue  size=66  centered in box
  // Element:  y=1490  cx=540  line-w=320  circle-r=16  dot-r=7
  // ───────────────────────────────────────────────────────────────────────────
  const CUT = 20;
  const BW  = 900;
  const BH  = 430;
  const BL  = 90;   // box left
  const BT  = 980;  // box top

  const imageResponse = new ImageResponse(
    (
      <div
        style={{
          width: 1080,
          height: 1920,
          background: "#1e1e1e",
          backgroundImage:
            "radial-gradient(circle, transparent 4px, #262626 4px, #262626 5.5px, transparent 5.5px)",
          backgroundSize: "28px 28px",
          display: "flex",
          position: "relative",
          overflow: "hidden",
          fontFamily: fontData ? "BebasNeue" : "sans-serif",
        }}
      >
        {/* ── Photo ─────────────────────────────────────────────────────── */}
        <img
          src={imageUrl}
          alt=""
          style={{
            position: "absolute",
            top: 80,
            left: 68,
            width: 944,
            height: 756,
            objectFit: "cover",
            borderRadius: 40,
          }}
        />

        {/* ── Box (SVG chamfered + gradient) ───────────────────────────── */}
        <svg
          style={{ position: "absolute", top: BT, left: BL }}
          width={BW}
          height={BH}
          viewBox={`0 0 ${BW} ${BH}`}
        >
          <defs>
            <linearGradient id="g" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#5a8800" />
              <stop offset="100%" stopColor="#243800" />
            </linearGradient>
          </defs>
          <polygon
            points={[
              `${CUT},0`,
              `${BW - CUT},0`,
              `${BW},${CUT}`,
              `${BW},${BH - CUT}`,
              `${BW - CUT},${BH}`,
              `${CUT},${BH}`,
              `0,${BH - CUT}`,
              `0,${CUT}`,
            ].join(" ")}
            fill="url(#g)"
          />
        </svg>

        {/* ── Text inside box ───────────────────────────────────────────── */}
        <div
          style={{
            position: "absolute",
            top: BT,
            left: BL,
            width: BW,
            height: BH,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 56px",
          }}
        >
          <p
            style={{
              color: "#D2F937",
              fontSize: 66,
              fontWeight: 400,
              lineHeight: 1.13,
              textAlign: "center",
              margin: 0,
              letterSpacing: "1.5px",
            }}
          >
            {titleUpper}
          </p>
        </div>

        {/* ── Bottom element: line + circle ─────────────────────────────── */}
        {/* Left line */}
        <div style={{ position:"absolute", top:1492, left:540-180, width:160, height:3, background:"#D2F937", display:"flex" }} />
        {/* Circle ring + dot */}
        <div style={{ position:"absolute", top:1474, left:540-18, width:36, height:36, borderRadius:"50%", border:"3px solid #D2F937", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ width:14, height:14, borderRadius:"50%", background:"#D2F937", display:"flex" }} />
        </div>
        {/* Right line */}
        <div style={{ position:"absolute", top:1492, left:540+20, width:160, height:3, background:"#D2F937", display:"flex" }} />
      </div>
    ),
    {
      width: 1080,
      height: 1920,
      fonts: fontData
        ? [{ name: "BebasNeue", data: fontData, weight: 400 }]
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

  const isTest = req.nextUrl.searchParams.get("test") === "1";

  try {
    await connectDB();

    // In test mode: pick the most recent published article regardless of time
    const threeHoursAgo = new Date(Date.now() - 3 * 60 * 60 * 1000);
    const dateFilter = isTest ? {} : { publishedAt: { $gte: threeHoursAgo } };

    const recentArticles = await Article.find({
      status: "published",
      ...dateFilter,
    })
      .sort({ publishedAt: -1 })
      .limit(isTest ? 1 : 50)
      .select("_id title image images slug publishedAt")
      .lean();

    if (!recentArticles.length) {
      return NextResponse.json({
        ok: true,
        message: "No new articles in the last 3 hours",
      });
    }

    // Filter out already processed articles (skip in test mode)
    const processedIds = isTest ? [] : await ProcessedGraphic.find({
      articleId: { $in: recentArticles.map((a) => String(a._id)) },
    })
      .select("articleId")
      .lean();

    const processedSet = new Set(processedIds.map((p) => p.articleId));
    const toProcess = isTest
      ? recentArticles.slice(0, 1)
      : recentArticles.filter((a) => !processedSet.has(String(a._id)));

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
