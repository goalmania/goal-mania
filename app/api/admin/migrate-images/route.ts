export const dynamic = "force-dynamic";
export const maxDuration = 300;

import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/db";
import Product from "@/lib/models/Product";

const CLOUD = "do04e87p5";
const UPLOAD_PRESET = "ml_default";
const UPLOAD_URL = `https://api.cloudinary.com/v1_1/${CLOUD}/image/upload`;
const SECRET = process.env.CRON_SECRET || "goalmania-migrate-2026";
const PLACEHOLDER = "/images/image.png";

// ── Mappa titolo prodotto → URL articolo Footy Headlines ─────────────────
// Usare titolo lowercase esatto come chiave. Si usa per match parziale.
const ARTICLE_MAP: [string, string][] = [
  // ── INTER ─────────────────────────────────────────────────────────────
  ["inter home 2026",    "https://www.footyheadlines.com/2025/08/inter-milan-26-27-home-kit.html"],
  ["inter away 2026",    "https://www.footyheadlines.com/2025/11/inter-milan-2627-away-kit.html"],
  ["inter third 2026",   "https://www.footyheadlines.com/2025/11/new-inter-milan-26-27-third-kit.html"],
  // fallback 25/26 (senza anno nel titolo)
  ["inter home",         "https://www.footyheadlines.com/2025/08/inter-milan-26-27-home-kit.html"],
  ["inter away",         "https://www.footyheadlines.com/2025/11/inter-milan-2627-away-kit.html"],
  ["inter third",        "https://www.footyheadlines.com/2025/11/new-inter-milan-26-27-third-kit.html"],

  // ── AC MILAN ──────────────────────────────────────────────────────────
  ["milan home 2026",    "https://www.footyheadlines.com/2025/11/milan-26-27-home-kit.html"],
  ["milan away 2026",    "https://www.footyheadlines.com/2025/12/milan-26-27-away-kit.html"],
  ["milan third 2026",   "https://www.footyheadlines.com/2025/12/milan-26-27-third-kit.html"],
  ["ac milan away 2026", "https://www.footyheadlines.com/2025/12/milan-26-27-away-kit.html"],
  ["milan home",         "https://www.footyheadlines.com/2025/03/milan-25-26-home-kit.html"],
  ["ac milan away",      "https://www.footyheadlines.com/2025/03/ac-milan-25-26-away-kit-.html"],
  ["milan away",         "https://www.footyheadlines.com/2025/03/ac-milan-25-26-away-kit-.html"],
  ["milan third",        "https://www.footyheadlines.com/2024/12/milan-25-26-third-kit.html"],
  ["milan 2004",         "https://www.footyheadlines.com/2025/11/milan-26-27-home-kit.html"],

  // ── JUVENTUS ──────────────────────────────────────────────────────────
  ["juventus home 2026", "https://www.footyheadlines.com/2025/08/juventus-26-27-home-kit.html"],
  ["juventus away 2026", "https://www.footyheadlines.com/2025/08/juventus-26-27-away-kit.html"],
  ["juventus third 2026","https://www.footyheadlines.com/1345761138/juventus-26-27-third-kit-leaked-2-new-pictures.html"],
  ["juventus home",      "https://www.footyheadlines.com/2025/08/juventus-26-27-home-kit.html"],
  ["juventus away",      "https://www.footyheadlines.com/2025/08/juventus-26-27-away-kit.html"],
  ["juventus third",     "https://www.footyheadlines.com/1345761138/juventus-26-27-third-kit-leaked-2-new-pictures.html"],

  // ── NAPOLI ────────────────────────────────────────────────────────────
  ["napoli home 2026",   "https://www.footyheadlines.com/2025/07/new-napoli-25-26-home-away-kits.html"],
  ["napoli away 2026",   "https://www.footyheadlines.com/2025/07/new-napoli-25-26-home-away-kits.html"],
  ["napoli third 2026",  "https://www.footyheadlines.com/2025/09/new-napoli-25-26-euro-home-euro-away-euro-third-kits.html"],
  ["napoli home",        "https://www.footyheadlines.com/2025/07/new-napoli-25-26-home-away-kits.html"],
  ["napoli away",        "https://www.footyheadlines.com/2025/07/new-napoli-25-26-home-away-kits.html"],
  ["napoli third",       "https://www.footyheadlines.com/2025/09/new-napoli-25-26-euro-home-euro-away-euro-third-kits.html"],
  ["napoli partenope",   "https://www.footyheadlines.com/2025/07/new-napoli-25-26-home-away-kits.html"],

  // ── AS ROMA ───────────────────────────────────────────────────────────
  ["roma home 2026",     "https://www.footyheadlines.com/2025/11/as-roma-26-27-kits.html"],
  ["roma away 2026",     "https://www.footyheadlines.com/2025/11/as-roma-26-27-kits.html"],
  ["roma third 2026",    "https://www.footyheadlines.com/2025/11/roma-26-27-third-kit.html"],
  ["roma home",          "https://www.footyheadlines.com/2025/11/as-roma-26-27-kits.html"],
  ["roma away",          "https://www.footyheadlines.com/2025/11/as-roma-26-27-kits.html"],
  ["roma third",         "https://www.footyheadlines.com/2025/11/roma-26-27-third-kit.html"],

  // ── LAZIO ─────────────────────────────────────────────────────────────
  ["lazio home 2026",    "https://www.footyheadlines.com/2025/07/new-lazio-25-26-home-away-kits.html"],
  ["lazio away 2026",    "https://www.footyheadlines.com/2025/07/new-lazio-25-26-home-away-kits.html"],
  ["lazio third 2026",   "https://www.footyheadlines.com/2025/07/new-lazio-25-26-home-away-kits.html"],
  ["lazio home",         "https://www.footyheadlines.com/2025/07/new-lazio-25-26-home-away-kits.html"],
  ["lazio away",         "https://www.footyheadlines.com/2025/07/new-lazio-25-26-home-away-kits.html"],
  ["lazio third",        "https://www.footyheadlines.com/2025/07/new-lazio-25-26-home-away-kits.html"],

  // ── ATALANTA ──────────────────────────────────────────────────────────
  ["atalanta home 2026", "https://www.footyheadlines.com/2026/06/atalanta-26-27-home-away-kits.html"],
  ["atalanta away 2026", "https://www.footyheadlines.com/2026/06/atalanta-26-27-home-away-kits.html"],
  ["atalanta third 2026","https://www.footyheadlines.com/2025/08/atalanta-25-26-third-kit.html"],
  ["atalanta home",      "https://www.footyheadlines.com/2025/05/atalanta-25-26-home-kit.html"],
  ["atalanta away",      "https://www.footyheadlines.com/2025/07/atalanta-25-26-away-kit.html"],
  ["atalanta third",     "https://www.footyheadlines.com/2025/08/atalanta-25-26-third-kit.html"],

  // ── FIORENTINA ────────────────────────────────────────────────────────
  ["fiorentina home 2026","https://www.footyheadlines.com/3745976621/joma-fiorentina-26-27-home-away-third-kits-colors-leaked-centenary-kit-coming-no-more-kappa.html"],
  ["fiorentina away 2026","https://www.footyheadlines.com/3745976621/joma-fiorentina-26-27-home-away-third-kits-colors-leaked-centenary-kit-coming-no-more-kappa.html"],
  ["fiorentina third 2026","https://www.footyheadlines.com/3745976621/joma-fiorentina-26-27-home-away-third-kits-colors-leaked-centenary-kit-coming-no-more-kappa.html"],
  ["fiorentina home",    "https://www.footyheadlines.com/2025/05/fiorentina-25-26-home-kit.html"],
  ["fiorentina away",    "https://www.footyheadlines.com/2025/05/fiorentina-25-26-home-kit.html"],
  ["fiorentina third",   "https://www.footyheadlines.com/2025/05/fiorentina-25-26-home-kit.html"],

  // ── MANCHESTER CITY ───────────────────────────────────────────────────
  ["manchester city home 2026", "https://www.footyheadlines.com/2025/12/mc-26-27-home-kit.html"],
  ["manchester city away 2026", "https://www.footyheadlines.com/2025/11/manchester-city-26-27-away-kit.html"],
  ["manchester city third 2026","https://www.footyheadlines.com/2024/12/manchester-city-26-27-third-kit.html"],
  ["manchester city home",      "https://www.footyheadlines.com/2025/12/mc-26-27-home-kit.html"],
  ["manchester city away",      "https://www.footyheadlines.com/2025/11/manchester-city-26-27-away-kit.html"],
  ["manchester city third",     "https://www.footyheadlines.com/2024/12/manchester-city-26-27-third-kit.html"],

  // ── MANCHESTER UNITED ─────────────────────────────────────────────────
  ["manchester united home 2026", "https://www.footyheadlines.com/2025/10/man-united-26-27-home-kit.html"],
  ["manchester united away 2026", "https://www.footyheadlines.com/2025/10/man-united-26-27-away-kit.html"],
  ["manchester united third 2026","https://www.footyheadlines.com/2026/01/adidas-manchester-united-26-27-home-away-third-kits.html"],
  ["manchester united home",      "https://www.footyheadlines.com/2025/10/man-united-26-27-home-kit.html"],
  ["manchester united away",      "https://www.footyheadlines.com/2025/10/man-united-26-27-away-kit.html"],
  ["manchester united third",     "https://www.footyheadlines.com/2026/01/adidas-manchester-united-26-27-home-away-third-kits.html"],

  // ── LIVERPOOL ─────────────────────────────────────────────────────────
  ["liverpool home 2026",  "https://www.footyheadlines.com/2025/09/liverpool-26-27-home-kit.html"],
  ["liverpool away 2026",  "https://www.footyheadlines.com/2025/09/liverpool-26-27-away-kit.html"],
  ["liverpool third 2026", "https://www.footyheadlines.com/2025/09/liverpool-26-27-third-kit-to-be-black.html"],
  ["liverpool home",       "https://www.footyheadlines.com/2025/09/liverpool-26-27-home-kit.html"],
  ["liverpool away",       "https://www.footyheadlines.com/2025/09/liverpool-26-27-away-kit.html"],
  ["liverpool third",      "https://www.footyheadlines.com/2025/09/liverpool-26-27-third-kit-to-be-black.html"],
  ["liverpool 2004",       "https://www.footyheadlines.com/2025/09/liverpool-26-27-home-kit.html"],

  // ── ARSENAL ───────────────────────────────────────────────────────────
  ["arsenal home 2026",    "https://www.footyheadlines.com/2025/08/arsenal-26-27-home-kit.html"],
  ["arsenal away 2026",    "https://www.footyheadlines.com/2025/08/arsenal-26-27-away-kit.html"],
  ["arsenal third 2026",   "https://www.footyheadlines.com/2025/08/arrsenal-26-27-third-kit.html"],
  ["arsenal home",         "https://www.footyheadlines.com/2025/08/arsenal-26-27-home-kit.html"],
  ["arsenal away",         "https://www.footyheadlines.com/2025/08/arsenal-26-27-away-kit.html"],
  ["arsenal third",        "https://www.footyheadlines.com/2025/08/arrsenal-26-27-third-kit.html"],

  // ── CHELSEA ───────────────────────────────────────────────────────────
  ["chelsea home 2026",    "https://www.footyheadlines.com/2025/07/nike-chelsea-26-27-home-kit.html"],
  ["chelsea away 2026",    "https://www.footyheadlines.com/2025/11/chelsea-26-27-away-kit.html"],
  ["chelsea third 2026",   "https://www.footyheadlines.com/2025/11/chelsea-26-27-third-kit.html"],
  ["chelsea home",         "https://www.footyheadlines.com/2024/08/chelsea-25-26-home-kit.html"],
  ["chelsea away",         "https://www.footyheadlines.com/2025/11/chelsea-26-27-away-kit.html"],
  ["chelsea third",        "https://www.footyheadlines.com/2025/11/chelsea-26-27-third-kit.html"],

  // ── TOTTENHAM ─────────────────────────────────────────────────────────
  ["tottenham home 2026",  "https://www.footyheadlines.com/2025/08/tottenham-26-27-home-kit.html"],
  ["tottenham away 2026",  "https://www.footyheadlines.com/2025/08/tottenham-26-27-away-kit.html"],
  ["tottenham third 2026", "https://www.footyheadlines.com/2025/11/new-tottenham-26-27-third-kit.html"],
  ["tottenham home",       "https://www.footyheadlines.com/2024/09/tottenham-25-26-home-kit.html"],
  ["tottenham away",       "https://www.footyheadlines.com/2025/08/tottenham-26-27-away-kit.html"],
  ["tottenham third",      "https://www.footyheadlines.com/2024/12/tottenham-25-26-third-kit.html"],

  // ── NEWCASTLE ─────────────────────────────────────────────────────────
  ["newcastle home 2026",  "https://www.footyheadlines.com/2025/09/nufc-26-27-home-kit.html"],
  ["newcastle away 2026",  "https://www.footyheadlines.com/2025/11/nufc-26-27-away-kit.html"],
  ["newcastle third 2026", "https://www.footyheadlines.com/2025/11/nufc-26-27-third-kit.html"],
  ["newcastle home",       "https://www.footyheadlines.com/2025/09/nufc-26-27-home-kit.html"],
  ["newcastle away",       "https://www.footyheadlines.com/2025/11/nufc-26-27-away-kit.html"],
  ["newcastle third",      "https://www.footyheadlines.com/2025/11/nufc-26-27-third-kit.html"],

  // ── ASTON VILLA ───────────────────────────────────────────────────────
  ["aston villa home 2026", "https://www.footyheadlines.com/2025/11/aston-villa-26-27-home-kit.html"],
  ["aston villa away 2026", "https://www.footyheadlines.com/2025/11/aston-villa-26-27-away-kit.html"],
  ["aston villa third 2026","https://www.footyheadlines.com/2025/11/villa-26-27-third-kit.html"],
  ["aston villa home",      "https://www.footyheadlines.com/2025/11/aston-villa-26-27-home-kit.html"],
  ["aston villa away",      "https://www.footyheadlines.com/2025/11/aston-villa-26-27-away-kit.html"],
  ["aston villa third",     "https://www.footyheadlines.com/2025/11/villa-26-27-third-kit.html"],

  // ── REAL MADRID ───────────────────────────────────────────────────────
  ["real madrid home 2026", "https://www.footyheadlines.com/2025/08/new-real-madrid-26-27-home-kit.html"],
  ["real madrid away 2026", "https://www.footyheadlines.com/2025/08/adidas-real-madrid-26-27-away-kit.html"],
  ["real madrid third 2026","https://www.footyheadlines.com/2025/09/real-madrid-26-27-third-kit.html"],
  ["real madrid home",      "https://www.footyheadlines.com/2025/08/new-real-madrid-26-27-home-kit.html"],
  ["real madrid away",      "https://www.footyheadlines.com/2025/08/adidas-real-madrid-26-27-away-kit.html"],
  ["real madrid third",     "https://www.footyheadlines.com/2025/09/real-madrid-26-27-third-kit.html"],

  // ── FC BARCELONA ──────────────────────────────────────────────────────
  ["barcelona home 2026",   "https://www.footyheadlines.com/2025/08/barcelona-26-27-home-kit.html"],
  ["barcelona away 2026",   "https://www.footyheadlines.com/2025/08/new-fc-barcelona-26-27-away-kit.html"],
  ["barcelona third 2026",  "https://www.footyheadlines.com/2025/10/barcelona-26-27-third-kit.html"],
  ["barcelona home",        "https://www.footyheadlines.com/2025/08/barcelona-26-27-home-kit.html"],
  ["barcelona away",        "https://www.footyheadlines.com/2025/08/new-fc-barcelona-26-27-away-kit.html"],
  ["barcelona third",       "https://www.footyheadlines.com/2025/10/barcelona-26-27-third-kit.html"],

  // ── ATLETICO MADRID ───────────────────────────────────────────────────
  ["atletico madrid home 2026",  "https://www.footyheadlines.com/2026/02/new-atletico-madrid-26-27-home-kit.html"],
  ["atletico madrid away 2026",  "https://www.footyheadlines.com/2025/08/atm-26-27-away-kit.html"],
  ["atletico madrid third 2026", "https://www.footyheadlines.com/2025/11/new-atletico-madrid-26-27-third-kit.html"],
  ["atletico madrid home",       "https://www.footyheadlines.com/2026/02/new-atletico-madrid-26-27-home-kit.html"],
  ["atletico madrid away",       "https://www.footyheadlines.com/2025/08/atm-26-27-away-kit.html"],
  ["atletico madrid third",      "https://www.footyheadlines.com/2025/11/new-atletico-madrid-26-27-third-kit.html"],

  // ── BAYERN MONACO ─────────────────────────────────────────────────────
  ["bayern monaco home 2026",  "https://www.footyheadlines.com/2025/07/new-bayern-munchen-26-27-home-kit.html"],
  ["bayern monaco away 2026",  "https://www.footyheadlines.com/2025/08/bayern-26-27-away-kit.html"],
  ["bayern monaco third 2026", "https://www.footyheadlines.com/2025/08/bayern-26-27-third-kit.html"],
  ["bayern monaco home",       "https://www.footyheadlines.com/2025/07/new-bayern-munchen-26-27-home-kit.html"],
  ["bayern monaco away",       "https://www.footyheadlines.com/2025/08/bayern-26-27-away-kit.html"],
  ["bayern monaco third",      "https://www.footyheadlines.com/2025/08/bayern-26-27-third-kit.html"],

  // ── PSG ───────────────────────────────────────────────────────────────
  ["psg home 2026",   "https://www.footyheadlines.com/2025/08/psg-26-27-home-kit.html"],
  ["psg away 2026",   "https://www.footyheadlines.com/2025/08/psg-26-27-away-kit.html"],
  ["psg third 2026",  "https://www.footyheadlines.com/2026/02/psg-26-27-third-kit.html"],
  ["psg home",        "https://www.footyheadlines.com/2025/08/psg-26-27-home-kit.html"],
  ["psg away",        "https://www.footyheadlines.com/2025/08/psg-26-27-away-kit.html"],
  ["psg third",       "https://www.footyheadlines.com/2026/02/psg-26-27-third-kit.html"],

  // ── BORUSSIA DORTMUND ─────────────────────────────────────────────────
  ["borussia dortmund home 2026", "https://www.footyheadlines.com/2025/11/bvb-26-27-home-kit.html"],
  ["borussia dortmund away 2026", "https://www.footyheadlines.com/2026/03/bvb-26-27-away-kit.html"],
  ["borussia dortmund third 2026","https://www.footyheadlines.com/2026/03/bvb-26-27-away-kit.html"],
  ["borussia dortmund home",      "https://www.footyheadlines.com/2025/11/bvb-26-27-home-kit.html"],
  ["borussia dortmund away",      "https://www.footyheadlines.com/2026/03/bvb-26-27-away-kit.html"],
  ["borussia dortmund third",     "https://www.footyheadlines.com/2026/03/bvb-26-27-away-kit.html"],

  // ── COMO ──────────────────────────────────────────────────────────────
  ["como home 2026",  "https://www.footyheadlines.com/team/Como"],
  ["como away 2026",  "https://www.footyheadlines.com/team/Como"],
  ["como third 2026", "https://www.footyheadlines.com/team/Como"],
  ["como home",       "https://www.footyheadlines.com/team/Como"],
  ["como away",       "https://www.footyheadlines.com/team/Como"],
  ["como third",      "https://www.footyheadlines.com/team/Como"],

  // ── BOLOGNA ───────────────────────────────────────────────────────────
  ["bologna home",    "https://www.footyheadlines.com/team/Bologna"],
  ["bologna away",    "https://www.footyheadlines.com/team/Bologna"],
  ["bologna third",   "https://www.footyheadlines.com/team/Bologna"],

  // ── BAYER LEVERKUSEN ──────────────────────────────────────────────────
  ["bayer leverkusen home", "https://www.footyheadlines.com/team/Bayer-Leverkusen"],
];

function findArticleUrl(title: string): string | null {
  const t = title.toLowerCase()
    .replace(/^maglia\s+/i, "")
    .replace(/2026\/27/g, "2026")
    .replace(/2025\/26/g, "2025")
    .replace(/[–—]/g, "-")
    .trim();

  // Cerca match dal più specifico (più lungo) al meno specifico
  const sorted = [...ARTICLE_MAP].sort((a, b) => b[0].length - a[0].length);
  for (const [key, url] of sorted) {
    if (t.includes(key)) return url;
  }
  return null;
}

async function getImageFromArticle(articleUrl: string): Promise<string | null> {
  try {
    const res = await fetch(articleUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; Googlebot)" },
      signal: AbortSignal.timeout(12000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // Cerca immagini s1600 blogger (jpg o png)
    const m = html.match(
      /(https:\/\/blogger\.googleusercontent\.com\/img\/[^"'\s]+s1600[^"'\s]+\.(jpg|jpeg|png))/i
    );
    if (m) return m[1];

    // Fallback: cerca s800
    const m2 = html.match(
      /(https:\/\/blogger\.googleusercontent\.com\/img\/[^"'\s]+s800[^"'\s]+\.(jpg|jpeg|png))/i
    );
    return m2 ? m2[1] : null;
  } catch {
    return null;
  }
}

async function uploadToCloudinary(imageUrl: string, publicId: string): Promise<string | null> {
  try {
    const form = new FormData();
    form.append("file", imageUrl);
    form.append("upload_preset", UPLOAD_PRESET);
    form.append("folder", "goal-mania/products");
    form.append("public_id", publicId.replace(/[^a-z0-9-]/g, "-").slice(0, 80));

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(30000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.secure_url || null;
  } catch {
    return null;
  }
}

function isBadImage(url: string) {
  return !url || url.includes("/images/image.png") || url.trim() === "";
}

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("secret");
  if (token !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const all = await Product.find({}).select("_id title images").lean() as any[];
  const bad = all.filter((p) => !(p.images || []).some((i: string) => !isBadImage(i)));

  return NextResponse.json({
    total: all.length,
    bad: bad.length,
    products: bad.map((p) => ({
      id: p._id,
      title: p.title,
      article: findArticleUrl(p.title),
    })),
  });
}

export async function POST(req: NextRequest) {
  const token = req.headers.get("x-secret") || req.nextUrl.searchParams.get("secret");
  if (token !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const all = await Product.find({}).select("_id title images").lean() as any[];
  const bad = all.filter((p) => !(p.images || []).some((i: string) => !isBadImage(i)));

  const results: { title: string; status: string; url?: string }[] = [];

  for (const product of bad) {
    const title = product.title as string;
    const articleUrl = findArticleUrl(title);

    if (!articleUrl) {
      results.push({ title, status: "no_article" });
      continue;
    }

    const imgUrl = await getImageFromArticle(articleUrl);
    if (!imgUrl) {
      results.push({ title, status: "image_not_found" });
      continue;
    }

    const publicId = title.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 60);
    const cloudUrl = await uploadToCloudinary(imgUrl, publicId);

    if (!cloudUrl) {
      results.push({ title, status: "upload_failed" });
      continue;
    }

    await Product.findByIdAndUpdate(product._id, { $set: { images: [cloudUrl] } });
    results.push({ title, status: "fixed", url: cloudUrl });
  }

  const fixed = results.filter((r) => r.status === "fixed").length;
  return NextResponse.json({
    total: bad.length,
    fixed,
    failed: bad.length - fixed,
    results,
  });
}
