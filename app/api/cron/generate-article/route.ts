import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import Product from "@/lib/models/Product";

// ─── Config ───────────────────────────────────────────────────────────────────

// Quanti articoli generare per ogni chiamata del cron
const ARTICLES_PER_RUN = 4;

// Feed RSS gratuiti delle principali testate sportive italiane
const RSS_FEEDS = [
  { url: "https://www.gazzetta.it/rss/home.xml", source: "Gazzetta dello Sport" },
  { url: "https://www.corrieredellosport.it/rss", source: "Corriere dello Sport" },
  { url: "https://www.tuttosport.com/rss/calcio", source: "Tuttosport" },
  { url: "https://www.calciomercato.com/rss", source: "CalcioMercato" },
  { url: "https://www.goal.com/feeds/it/news", source: "Goal.com" },
];

// Immagini di fallback per calcio generico (Unsplash, CC0)
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80",
  "https://images.unsplash.com/photo-1508098682722-e99c43a406b2?w=1200&q=80",
  "https://images.unsplash.com/photo-1431324155629-1a6dae1434d5?w=1200&q=80",
  "https://images.unsplash.com/photo-1551958219-acbc630e2914?w=1200&q=80",
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface NewsItem {
  title: string;
  description: string;
  source: string;
}

interface GeneratedArticle {
  title: string;
  summary: string;
  content: string;
  category: "news" | "transferMarket" | "serieA" | "internationalTeams";
  league?: string;
  mainTeam: string;       // squadra principale dell'articolo (per jersey + immagine)
  secondaryTeams: string[]; // altre squadre citate (fallback jersey)
}

interface RunResult {
  success: boolean;
  title?: string;
  slug?: string;
  jerseyFound?: boolean;
  error?: string;
}

// ─── Helper: parse RSS ────────────────────────────────────────────────────────

function extractTag(xml: string, tag: string): string {
  const match = xml.match(
    new RegExp(
      `<${tag}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tag}>|<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`,
      "i"
    )
  );
  return (match?.[1] ?? match?.[2] ?? "").trim();
}

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parseRssItems(xml: string, source: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const item of (xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [])) {
    const title = decodeHtmlEntities(extractTag(item, "title"));
    const description = decodeHtmlEntities(
      extractTag(item, "description").replace(/<[^>]+>/g, "").slice(0, 300)
    );
    if (title.length > 5) items.push({ title, description, source });
  }
  return items.slice(0, 6);
}

async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, source }) => {
      const res = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GoalMania/1.0)" },
        responseType: "text",
      });
      return parseRssItems(res.data as string, source);
    })
  );

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  return all.sort(() => Math.random() - 0.5);
}

// ─── Helper: genera articolo con Google Gemini ────────────────────────────────

async function generateArticleWithGemini(
  news: NewsItem[],
  usedTitles: string[]
): Promise<GeneratedArticle> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY non configurata");

  const freshNews = news
    .filter((n) => !usedTitles.some((t) => n.title.slice(0, 30) === t.slice(0, 30)))
    .slice(0, 5);

  if (freshNews.length === 0) throw new Error("Nessuna notizia disponibile");

  const newsDigest = freshNews
    .map((n, i) => `[Notizia ${i + 1} — ${n.source}]\n${n.title}\n${n.description}`)
    .join("\n\n");

  const prompt = `Sei un giornalista sportivo esperto di calcio per Goal-Mania.it, portale italiano di news calcistiche.

Notizie fresche dalle principali testate italiane:

${newsDigest}

Scrivi UN articolo giornalistico originale in italiano. Rispondi SOLO con JSON valido, senza markdown né testo aggiuntivo:
{
  "title": "Titolo originale accattivante (max 80 caratteri, NON copiare i titoli delle fonti)",
  "summary": "Occhiello che cattura l'attenzione (max 200 caratteri)",
  "content": "Corpo in HTML con <h2>, <p>, <strong>, <ul>, <li>. Minimo 700 parole. Struttura: apertura ad effetto → fatti con contesto → analisi tecnica/tattica → impatto sul campionato → prospettive. Cita esperti in modo credibile.",
  "category": "news | transferMarket | serieA | internationalTeams",
  "league": "SOLO se category=internationalTeams: LaLiga | Premier League | Bundesliga | Ligue 1 | Champions League | Europa League",
  "mainTeam": "Nome ESATTO della squadra principale dell'articolo (es: Juventus, Real Madrid, Napoli, Inter, Arsenal...). Se parla di più squadre ugualmente, scegli la più prominente. OBBLIGATORIO.",
  "secondaryTeams": ["Altre squadre citate nell'articolo, massimo 3"]
}

Regole:
- mainTeam deve essere il nome esatto come appare nelle maglie (es. 'Milan' non 'AC Milan', 'Inter' non 'F.C. Internazionale')
- Il titolo deve essere originale e diverso da quelli delle fonti
- Scrivi come un vero giornalista, non come aggregatore
- Minimo 3 sezioni con <h2>`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.85, maxOutputTokens: 2500 },
    },
    { headers: { "content-type": "application/json" }, timeout: 60000 }
  );

  const rawText: string = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!rawText) throw new Error("Gemini risposta vuota");

  const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON non trovato nella risposta Gemini");

  return JSON.parse(jsonMatch[0]) as GeneratedArticle;
}

// ─── Helper: trova la maglia giusta nel DB ────────────────────────────────────

async function findJerseyForTeam(
  mainTeam: string,
  secondaryTeams: string[]
): Promise<{ id: string; imageUrl: string } | null> {
  const teamsToTry = [mainTeam, ...secondaryTeams].filter(Boolean);

  for (const team of teamsToTry) {
    if (!team || team.length < 2) continue;

    const product = await Product.findOne({
      isActive: true,
      $or: [
        { title: { $regex: team, $options: "i" } },
        { nationalTeam: { $regex: team, $options: "i" } },
        { country: { $regex: team, $options: "i" } },
      ],
    })
      .select("_id images title")
      .lean();

    if (product) {
      const prod = product as { _id: unknown; images?: string[]; title: string };
      const imageUrl = prod.images?.[0] ?? null;
      return {
        id: String(prod._id),
        imageUrl: imageUrl ?? "",
      };
    }
  }

  return null;
}

// ─── Helper: immagine Unsplash (con ricerca per squadra) ─────────────────────

async function fetchUnsplashImage(
  mainTeam: string,
  category: string
): Promise<string> {
  const fallback = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;

  // Query specifica per la squadra, con fallback su categoria
  const queries = [
    `${mainTeam} football`, // es. "Juventus football"
    `${mainTeam} soccer`,
    category === "serieA" ? "Serie A football Italy" : "football stadium",
  ];

  if (!accessKey) return fallback;

  for (const query of queries) {
    try {
      const res = await axios.get("https://api.unsplash.com/search/photos", {
        params: { query, per_page: 8, orientation: "landscape", content_filter: "high" },
        headers: { Authorization: `Client-ID ${accessKey}` },
        timeout: 6000,
      });
      const photos = res.data.results ?? [];
      if (photos.length > 0) {
        const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 8))];
        return `${photo.urls.regular}&w=1200&q=80`;
      }
    } catch {
      continue;
    }
  }

  return fallback;
}

// ─── Helper: slug univoco ─────────────────────────────────────────────────────

function buildSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[ñ]/g, "n")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

async function slugExists(slug: string): Promise<boolean> {
  return !!(await Article.findOne({ slug }));
}

// ─── Main handler ─────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const log: string[] = [];
  const results: RunResult[] = [];

  try {
    log.push(`🔄 Avvio generazione ${ARTICLES_PER_RUN} articoli...`);
    await connectDB();
    log.push("✅ DB connesso");

    log.push("📰 Lettura feed RSS (Gazzetta, Corriere, Tuttosport, CalcioMercato, Goal.com)...");
    const allNews = await fetchAllNews();
    log.push(`✅ ${allNews.length} notizie recuperate dai feed`);

    if (allNews.length < 2) {
      return NextResponse.json(
        { success: false, message: "Feed RSS non raggiungibili", log },
        { status: 200 }
      );
    }

    const usedTitles: string[] = [];

    for (let i = 0; i < ARTICLES_PER_RUN; i++) {
      log.push(`\n── Articolo ${i + 1}/${ARTICLES_PER_RUN} ──`);
      try {
        // 1. Genera con Gemini
        const generated = await generateArticleWithGemini(allNews, usedTitles);
        log.push(`✏️  "${generated.title}"`);
        log.push(`🏆 Squadra principale: ${generated.mainTeam}`);

        // 2. Controlla slug duplicato
        const slug = buildSlug(generated.title);
        if (await slugExists(slug)) {
          log.push("⚠️  Slug duplicato, salto");
          results.push({ success: false, error: "Duplicato" });
          continue;
        }

        // 3. Trova la maglia nel DB per questa squadra
        log.push(`🔍 Cerco maglia per "${generated.mainTeam}"...`);
        const jersey = await findJerseyForTeam(
          generated.mainTeam,
          generated.secondaryTeams ?? []
        );

        let imageUrl: string;
        let featuredJerseyId: string | undefined;

        if (jersey) {
          featuredJerseyId = jersey.id;
          log.push(`✅ Maglia trovata! ID: ${jersey.id}`);

          // Usa immagine prodotto se disponibile, altrimenti Unsplash
          imageUrl = jersey.imageUrl
            ? jersey.imageUrl
            : await fetchUnsplashImage(generated.mainTeam, generated.category);
          log.push(`🖼️  Immagine: ${jersey.imageUrl ? "dal prodotto" : "da Unsplash"}`);
        } else {
          log.push(`⚠️  Nessuna maglia trovata per "${generated.mainTeam}", uso Unsplash`);
          imageUrl = await fetchUnsplashImage(generated.mainTeam, generated.category);
          log.push(`🖼️  Immagine Unsplash: ${imageUrl.slice(0, 60)}...`);
        }

        // 4. Salva articolo su MongoDB
        const articleData: Record<string, unknown> = {
          title: generated.title,
          summary: generated.summary,
          content: generated.content,
          image: imageUrl,
          images: [{ id: `auto-${Date.now()}-${i}`, url: imageUrl, alt: generated.title, isMain: true }],
          category: generated.category,
          author: "Goal Mania AI",
          status: "published",
          publishedAt: new Date(),
          featured: false,
        };
        if (generated.league) articleData.league = generated.league;
        if (featuredJerseyId) articleData.featuredJerseyId = featuredJerseyId;

        const article = await Article.create(articleData);
        usedTitles.push(generated.title);

        log.push(`✅ Pubblicato — slug: ${article.slug}`);
        results.push({
          success: true,
          title: generated.title,
          slug: article.slug,
          jerseyFound: !!featuredJerseyId,
        });

        // Pausa tra articoli per non stressare Gemini
        if (i < ARTICLES_PER_RUN - 1) await new Promise((r) => setTimeout(r, 2500));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Errore";
        log.push(`❌ Errore: ${msg}`);
        results.push({ success: false, error: msg });
      }
    }

    const published = results.filter((r) => r.success).length;
    const withJersey = results.filter((r) => r.jerseyFound).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log.push(`\n🎉 ${published}/${ARTICLES_PER_RUN} pubblicati (${withJersey} con maglia abbinata) in ${duration}s`);

    return NextResponse.json({
      success: true,
      published,
      withJersey,
      total: ARTICLES_PER_RUN,
      duration: `${duration}s`,
      articles: results,
      log,
    });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    log.push(`❌ Errore fatale: ${message}`);
    console.error("[CRON_GENERATE_ARTICLE]", error);
    return NextResponse.json({ success: false, error: message, log }, { status: 500 });
  }
}
