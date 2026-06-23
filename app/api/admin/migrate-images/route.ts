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

// ── Mappa team-name → slug Footy Headlines ──────────────────────────────
const TEAM_SLUG: Record<string, string> = {
  "inter":             "Inter%20Milan",
  "milan":             "AC%20Milan",
  "juventus":          "Juventus",
  "napoli":            "Napoli",
  "roma":              "AS%20Roma",
  "lazio":             "Lazio",
  "atalanta":          "Atalanta",
  "fiorentina":        "Fiorentina",
  "como":              "Como",
  "real madrid":       "Real%20Madrid",
  "barcelona":         "FC%20Barcelona",
  "atletico madrid":   "Atletico%20Madrid",
  "manchester city":   "Manchester%20City",
  "manchester united": "Manchester%20United",
  "liverpool":         "Liverpool",
  "arsenal":           "Arsenal",
  "chelsea":           "Chelsea",
  "tottenham":         "Tottenham%20Hotspur",
  "newcastle":         "Newcastle%20United",
  "aston villa":       "Aston%20Villa",
  "psg":               "Paris%20Saint-Germain",
  "paris saint-germain": "Paris%20Saint-Germain",
  "bayern monaco":     "Bayern%20Munich",
  "borussia dortmund": "Borussia%20Dortmund",
};

const KIT_KEYWORDS: Record<string, string[]> = {
  home:  ["home", "casa"],
  away:  ["away", "trasferta", "fuori"],
  third: ["third", "terza"],
};

function parseProduct(title: string): { team: string; kit: string } | null {
  const clean = title.replace(/^Maglia\s+/i, "").trim().toLowerCase();

  let kit = "home";
  for (const [k, keywords] of Object.entries(KIT_KEYWORDS)) {
    if (keywords.some((kw) => clean.includes(kw))) { kit = k; break; }
  }

  // rimuovi kit type e stagione
  const teamName = clean
    .replace(/(home|away|third|casa|trasferta|terza)/gi, "")
    .replace(/\d{4}\/\d{2,4}/g, "")
    .replace(/\s+/g, " ")
    .trim();

  return { team: teamName, kit };
}

async function getFootyHeadlinesImage(team: string, kit: string): Promise<string | null> {
  const slug = TEAM_SLUG[team];
  if (!slug) return null;

  // Cerca articoli per il kit specifico
  const kitWord = kit === "home" ? "home" : kit === "away" ? "away" : "third";
  const searchUrl = `https://www.footyheadlines.com/team/${slug}`;

  try {
    const res = await fetch(searchUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
      signal: AbortSignal.timeout(10000),
    });
    const html = await res.text();

    // Cerca link agli articoli del kit specifico 26-27
    const articleRegex = new RegExp(
      `href="(https://www\\.footyheadlines\\.com/[^"]*26[-–]?27[^"]*${kitWord}[^"]*)"`,
      "gi"
    );
    const matches = [...html.matchAll(articleRegex)];
    if (!matches.length) return null;

    const articleUrl = matches[0][1];
    const articleRes = await fetch(articleUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; bot)" },
      signal: AbortSignal.timeout(10000),
    });
    const articleHtml = await articleRes.text();

    // Estrai prima immagine grande (s1600)
    const imgMatch = articleHtml.match(
      /(https:\/\/blogger\.googleusercontent\.com\/img\/[^"'\s]+s1600[^"'\s]+\.jpg)/i
    );
    return imgMatch ? imgMatch[1] : null;
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
    form.append("public_id", publicId.slice(0, 80));

    const res = await fetch(UPLOAD_URL, {
      method: "POST",
      body: form,
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const data = await res.json();
    return data.secure_url || null;
  } catch {
    return null;
  }
}

function isBadImage(url: string) {
  return !url || url === PLACEHOLDER || !url.includes("res.cloudinary.com");
}

// GET → mostra quanti prodotti hanno immagine mancante
export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("secret");
  if (token !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const all = await Product.find({}).select("_id title images").lean() as any[];
  const bad = all.filter((p) => !(p.images || []).some((i: string) => !isBadImage(i)));

  return NextResponse.json({
    total: all.length,
    bad: bad.length,
    products: bad.map((p) => ({ id: p._id, title: p.title, images: p.images })),
  });
}

// POST → migra tutte le immagini mancanti
export async function POST(req: NextRequest) {
  const token = req.headers.get("x-secret") || req.nextUrl.searchParams.get("secret");
  if (token !== SECRET) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  await connectDB();
  const all = await Product.find({}).select("_id title images").lean() as any[];
  const bad = all.filter((p) => !(p.images || []).some((i: string) => !isBadImage(i)));

  const results: { title: string; status: string; url?: string }[] = [];

  for (const product of bad) {
    const title = product.title as string;
    const parsed = parseProduct(title);

    if (!parsed) {
      results.push({ title, status: "parse_failed" });
      continue;
    }

    const { team, kit } = parsed;
    const imgUrl = await getFootyHeadlinesImage(team, kit);

    if (!imgUrl) {
      results.push({ title, status: "image_not_found", url: undefined });
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
    not_found: results.filter((r) => r.status === "image_not_found").length,
    results,
  });
}
