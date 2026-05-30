import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import Product from "@/lib/models/Product";
import { notifySearchEngines } from "@/lib/google-indexing";

// Vercel max duration (seconds) — 300s on Hobby/Pro serverless
export const maxDuration = 300;

// ─── Config ───────────────────────────────────────────────────────────────────

// 4 cron giornalieri × 5 articoli = 20 articoli/giorno
// Orari: 06:00, 10:00, 14:00, 18:00 (UTC)
const ARTICLES_PER_RUN = 5;

// Feed verificati al 29/05/2026: freschi + includono immagini proprie
const RSS_FEEDS = [
  {
    url: "https://www.tuttosport.com/rss/calcio",
    source: "Tuttosport",
    category: "serieA",
  },
  {
    url: "https://www.calciomercato.it/feed/",
    source: "CalcioMercato.it",
    category: "transferMarket",
  },
  {
    url: "https://www.calcionews24.com/feed/",
    source: "CalcioNews24",
    category: "news",
  },
  {
    url: "https://www.calcioefinanza.it/feed/",
    source: "Calcio e Finanza",
    category: "news",
  },
];

// Fallback solo se tutto il resto fallisce (immagine generica calcio)
const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1522778119026-d647f0596c20?w=1200&q=80",
  "https://images.unsplash.com/photo-1579952363873-27f3bade9f55?w=1200&q=80",
  "https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=1200&q=80",
  "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=1200&q=80",
];

// ─── Types ───────────────────────────────────────────────────────────────────

interface NewsItem {
  title: string;
  description: string;
  source: string;
  hintCategory: string;
  pubDate?: Date;
  rssImage?: string; // immagine estratta direttamente dall'RSS
}

interface GeneratedArticle {
  title: string;
  summary: string;
  content: string;
  category: "news" | "transferMarket" | "serieA" | "internationalTeams";
  league?: string;
  mainTeam: string;
  secondaryTeams: string[];
  mainPerson: string;
  seoKeywords: string[];
  imageSearchQuery: string;
}

interface RunResult {
  success: boolean;
  title?: string;
  slug?: string;
  category?: string;
  jerseyFound?: boolean;
  imageSource?: string;
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
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/&#\d+;/g, "");
}

/**
 * Estrae l'URL immagine da un item RSS.
 * Cerca in ordine: media:content, enclosure, img nel description/content.
 * Restituisce la prima URL valida trovata.
 */
function extractRssImage(itemXml: string): string | undefined {
  // 1. <media:content url="...">
  const mediaMatch = itemXml.match(/<media:content[^>]+url=["']([^"']+)["']/i);
  if (mediaMatch?.[1] && mediaMatch[1].match(/\.(jpe?g|png|webp)/i)) {
    return mediaMatch[1];
  }

  // 2. <enclosure url="..." type="image/...">
  const enclosureMatch = itemXml.match(/<enclosure[^>]+url=["']([^"']+)["'][^>]+type=["']image/i);
  if (enclosureMatch?.[1]) return enclosureMatch[1];

  // 3. <img src="..."> nel description/content (WordPress feed, CalcioNews24, ecc.)
  const imgMatch = itemXml.match(/<img[^>]+src=["']([^"']+\.(?:jpe?g|png|webp)(?:\?[^"']*)?)["']/i);
  if (imgMatch?.[1] && !imgMatch[1].includes("logo") && !imgMatch[1].includes("icon")) {
    return imgMatch[1];
  }

  return undefined;
}

// Parole chiave che indicano CALCIO — almeno una deve essere presente
const FOOTBALL_KEYWORDS = [
  "calcio", "serie a", "champions", "europa league", "conference league",
  "premier league", "liga", "bundesliga", "ligue 1", "calciomercato", "mercato",
  "maglia", "allenatore", "gol", "partita", "match", "stadio", "tifosi",
  "milan", "inter", "juventus", "juve", "napoli", "roma", "lazio", "atalanta",
  "fiorentina", "torino", "bologna", "real madrid", "barcelona", "manchester",
  "arsenal", "chelsea", "liverpool", "psg", "bayern", "porto", "ajax",
  "nazionale", "ct", "spalletti", "conte", "mourinho", "ancelotti",
  "fantacalcio", "serie b", "coppa italia", "supercoppa",
];

// Parole chiave che indicano sport NON-calcio — se presenti senza calcio, scarta
const NON_FOOTBALL_KEYWORDS = [
  "sci ", "sciatore", "sciatrice", "slalom", "superg", "discesa libera",
  "formula 1", "f1", "motogp", "moto gp", "tennis", "wimbledon", "roland garros",
  "basket", "nba", "volley", "nuoto", "atletica", "ciclismo", "giro d'italia",
  "tour de france", "boxe", "pugilato", "mma", "ufc", "golf",
  "hockey", "rugby", "baseball", "softball", "polo", "equitazione",
  "goggia", "brignone", "federica pellegrini", "marcell jacobs",
];

function isFootballNews(title: string, description: string): boolean {
  const text = (title + " " + description).toLowerCase();
  const hasFootball = FOOTBALL_KEYWORDS.some((kw) => text.includes(kw));
  if (hasFootball) return true;
  // Se non c'è calcio ma c'è altro sport → scarta
  const hasOtherSport = NON_FOOTBALL_KEYWORDS.some((kw) => text.includes(kw));
  return !hasOtherSport;
}

function parseRssItems(
  xml: string,
  source: string,
  hintCategory: string
): NewsItem[] {
  const items: NewsItem[] = [];
  const now = Date.now();
  const maxAgeMs = 12 * 60 * 60 * 1000; // 12 ore — evita notizie di mercato già superate

  for (const item of xml.match(/<item>([\s\S]*?)<\/item>/g) ?? []) {
    const title = decodeHtmlEntities(extractTag(item, "title"));
    if (title.length < 10) continue;

    const description = decodeHtmlEntities(
      extractTag(item, "description")
        .replace(/<[^>]+>/g, "")
        .trim()
        .slice(0, 400)
    );

    // Filtra: solo notizie di calcio
    if (!isFootballNews(title, description)) continue;

    // Filtra per data: solo notizie delle ultime 36h
    const pubDateRaw = extractTag(item, "pubDate");
    let pubDate: Date | undefined;
    if (pubDateRaw) {
      const parsed = new Date(pubDateRaw);
      if (!isNaN(parsed.getTime())) {
        pubDate = parsed;
        if (now - pubDate.getTime() > maxAgeMs) continue; // troppo vecchio
      }
    }

    // Estrai immagine dall'RSS item
    const rssImage = extractRssImage(item);

    items.push({ title, description, source, hintCategory, pubDate, rssImage });
  }

  // Ordina per data decrescente (più recenti prima)
  items.sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));
  return items.slice(0, 12);
}

async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, source, category }) => {
      const res = await axios.get(url, {
        timeout: 10000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GoalMania/2.0; +https://goal-mania.it)" },
        responseType: "text",
      });
      // Controlla che sia XML e non HTML
      const body = res.data as string;
      if (body.trim().startsWith("<!DOCTYPE") || body.trim().startsWith("<html")) {
        console.warn(`[RSS] ${source}: risposta HTML, feed non valido`);
        return [];
      }
      return parseRssItems(body, source, category);
    })
  );

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }

  // Ordina per data, poi mescola leggermente le prime 30 per varietà di fonti
  all.sort((a, b) => (b.pubDate?.getTime() ?? 0) - (a.pubDate?.getTime() ?? 0));
  const top = all.slice(0, 30).sort(() => Math.random() - 0.5);
  return [...top, ...all.slice(30)];
}

// ─── Helper: leggi titoli degli articoli già pubblicati nelle ultime 48h ──────
// Serve per evitare che Gemini generi articoli sullo stesso argomento

async function getRecentArticleTitles(): Promise<string[]> {
  try {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recent = await Article.find(
      { publishedAt: { $gte: since }, author: "Redazione Goalmania" },
      { title: 1 }
    )
      .lean()
      .limit(50);
    return (recent as { title: string }[]).map((a) => a.title);
  } catch {
    return [];
  }
}

// ─── Helper: Unsplash (fallback sport generico) ───────────────────────────────

async function fetchUnsplashImage(query: string): Promise<string> {
  const fallback = FALLBACK_IMAGES[Math.floor(Math.random() * FALLBACK_IMAGES.length)];
  const accessKey = process.env.UNSPLASH_ACCESS_KEY;
  if (!accessKey) return fallback;

  try {
    const res = await axios.get("https://api.unsplash.com/search/photos", {
      params: { query, per_page: 8, orientation: "landscape", content_filter: "high" },
      headers: { Authorization: `Client-ID ${accessKey}` },
      timeout: 6000,
    });
    const photos = res.data.results ?? [];
    if (photos.length > 0) {
      const photo = photos[Math.floor(Math.random() * Math.min(photos.length, 5))];
      return `${photo.urls.regular}&w=1200&q=80`;
    }
  } catch {
    // ignore
  }
  return fallback;
}

// ─── Helper: Wikipedia (fallback persona) ────────────────────────────────────

async function fetchWikipediaImage(entity: string): Promise<string | null> {
  if (!entity || entity.trim().length < 2) return null;

  for (const lang of ["it", "en"]) {
    try {
      const searchRes = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
        params: { action: "query", list: "search", srsearch: entity, srlimit: 1, format: "json", origin: "*" },
        timeout: 5000,
      });
      const pages = searchRes.data?.query?.search;
      if (!pages?.length) continue;

      const imgRes = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
        params: { action: "query", titles: pages[0].title, prop: "pageimages", pithumbsize: 1200, format: "json", origin: "*" },
        timeout: 5000,
      });
      const pagesData = imgRes.data?.query?.pages ?? {};
      const page = Object.values(pagesData)[0] as { thumbnail?: { source: string } };
      if (page?.thumbnail?.source) return page.thumbnail.source;
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Helper: Bing Image Search (immagini giornalistiche recenti) ──────────────
// Richiede BING_IMAGE_SEARCH_KEY nelle env Vercel (piano gratuito: 1000 req/mese)

async function fetchBingImage(query: string): Promise<string | null> {
  const apiKey = process.env.BING_IMAGE_SEARCH_KEY;
  if (!apiKey) return null;

  try {
    const res = await axios.get("https://api.bing.microsoft.com/v7.0/images/search", {
      params: { q: query, count: 10, imageType: "Photo", size: "Large", freshness: "Month", safeSearch: "Strict" },
      headers: { "Ocp-Apim-Subscription-Key": apiKey },
      timeout: 6000,
    });
    const items = res.data?.value ?? [];
    if (items.length > 0) {
      const pick = items[Math.floor(Math.random() * Math.min(items.length, 5))];
      return pick.contentUrl as string;
    }
  } catch {
    // ignore
  }
  return null;
}

// ─── Helper: smart image ─────────────────────────────────────────────────────
// Priorità:
//   1. Immagine estratta direttamente dall'RSS → sempre attinente alla notizia ✅
//   2. Bing Image Search recente (se BING_IMAGE_SEARCH_KEY disponibile)
//   3. Wikipedia per persona (foto profilo)
//   4. Unsplash con query specifica (nome persona / squadra)
//   5. Fallback generico calcio

async function fetchSmartImage(
  rssImage: string | undefined,
  mainPerson: string,
  mainTeam: string,
  imageSearchQuery: string,
  log: string[]
): Promise<{ url: string; source: string }> {

  // 1. Immagine RSS — la più rilevante perché è quella della notizia originale
  if (rssImage && rssImage.startsWith("http")) {
    log.push(`🖼️  Immagine RSS (dalla fonte originale): ${rssImage.slice(0, 80)}...`);
    return { url: rssImage, source: "rss-original" };
  }

  // 2. Bing recente (persona/squadra + anno)
  const bingQuery = mainPerson
    ? `${mainPerson} calcio 2026`
    : `${mainTeam} calcio 2026`;
  const bingUrl = await fetchBingImage(bingQuery);
  if (bingUrl) {
    log.push(`🖼️  Bing recente: "${bingQuery}"`);
    return { url: bingUrl, source: "bing-recent" };
  }

  // 3. Wikipedia per persona
  if (mainPerson && mainPerson.trim().length > 2) {
    const wikiUrl = await fetchWikipediaImage(mainPerson);
    if (wikiUrl) {
      log.push(`🖼️  Wikipedia persona: "${mainPerson}"`);
      return { url: wikiUrl, source: "wikipedia-person" };
    }
    log.push(`⚠️  Wikipedia: nessuna foto per "${mainPerson}"`);
  }

  // 4. Unsplash con query specifica
  const unsplashQuery = imageSearchQuery || mainPerson || mainTeam || "football";
  const unsplashUrl = await fetchUnsplashImage(unsplashQuery);
  log.push(`🖼️  Unsplash: "${unsplashQuery}"`);
  return { url: unsplashUrl, source: "unsplash" };
}

// ─── Helper: genera articolo con Google Gemini ────────────────────────────────

async function generateArticleWithGemini(
  news: NewsItem[],
  usedTitles: string[],
  recentDbTitles: string[],
  articleIndex: number
): Promise<{ article: GeneratedArticle; sourceNews: NewsItem }> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY non configurata");

  // Combina titoli già usati in questo run + articoli recenti del DB
  const allUsedTitles = [...usedTitles, ...recentDbTitles];

  // Filtra notizie non ancora coperte
  const freshNews = news.filter(
    (n) => !allUsedTitles.some((t) => {
      const a = n.title.toLowerCase().slice(0, 40);
      const b = t.toLowerCase().slice(0, 40);
      return a === b || (a.length > 20 && b.includes(a.slice(0, 20)));
    })
  );

  if (freshNews.length === 0) throw new Error("Nessuna notizia nuova disponibile");

  const targetNews = freshNews[articleIndex % freshNews.length];
  const contextNews = freshNews.filter((n) => n !== targetNews).slice(0, 3);

  const today = new Date();
  const dateLabel = today.toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });

  const newsDigest = [targetNews, ...contextNews]
    .map((n, i) => {
      const dateStr = n.pubDate
        ? n.pubDate.toLocaleString("it-IT", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })
        : "oggi";
      const label = i === 0 ? "NOTIZIA PRINCIPALE" : `Contesto ${i}`;
      return `[${label} — ${n.source}, ${dateStr}]\nTitolo: ${n.title}\nDescrizione: ${n.description}`;
    })
    .join("\n\n");

  // Lista argomenti già coperti di recente (per evitare ripetizioni)
  const recentTopics = recentDbTitles.slice(0, 20).join("\n- ");

  const prompt = `Sei un giornalista sportivo senior per Goal-Mania.it, portale calcistico italiano.

DATA ODIERNA: ${dateLabel}

NOTIZIE REALI DELLE ULTIME ORE:
${newsDigest}

${recentDbTitles.length > 0 ? `ARGOMENTI GIÀ TRATTATI NELLE ULTIME 48H (NON RIPETERE):
- ${recentTopics}

` : ""}**REGOLA ASSOLUTA #1 — FACT-CHECK OBBLIGATORIO**: Prima di scrivere, valida ogni notizia con le tue conoscenze aggiornate. Se la notizia RSS parla di un trasferimento o di un'offerta per un giocatore che TU SAI essere già in quella squadra da mesi, quella notizia è OBSOLETA — NON scriverla, segnalala come "OBSOLETA" nel JSON con {"skip": true, "reason": "..."}. I feed RSS pubblicano spesso notizie riciclate o vecchie indiscrezioni come se fossero nuove.
**REGOLA ASSOLUTA #2**: Non trattare argomenti già coperti di recente — scegli un angolo diverso.
**REGOLA ASSOLUTA #3**: L'articolo deve riguardare la NOTIZIA PRINCIPALE. Le altre notizie servono solo per contesto.
**REGOLA ASSOLUTA #4 — MERCATO**: Per voci di mercato non ancora confermate usa il condizionale: "secondo le indiscrezioni", "sarebbe in corso una trattativa". Se invece il trasferimento è già avvenuto (lo sai dalle tue conoscenze), NON scrivere come se fosse ancora in trattativa.
**REGOLA ASSOLUTA #5 — NESSUNA FONTE**: NON citare mai la fonte della notizia nell'articolo. Non scrivere mai "secondo Tuttosport", "come riporta Calciomercato.it", "stando a La Gazzetta", "secondo Sky Sport" o qualsiasi altro media. Goal-Mania.it è la voce narrante: scrivi in prima persona editoriale, come se la notizia fosse di proprietà della redazione.

**OBIETTIVO**: Articolo giornalistico approfondito, minimo 800 parole.
1. SEO-ottimizzato: keyword naturali, H2/H3, liste puntate
2. GEO-ottimizzato: risposte dirette, fatti concreti, nomi e cifre reali
3. Originale: rielabora, non copiare
4. Tone of voice: appassionato, professionale, italiano

Struttura HTML richiesta:
<p class="lead"><strong>Occhiello</strong> (2-3 frasi che riassumono il fatto)</p>
<h2>Sezione 1</h2><p>...</p>
<h2>Sezione 2</h2><p>...</p>
<h2>Analisi e Prospettive</h2><p>...</p>
<h2>Conclusioni</h2><p>...</p>

Rispondi SOLO con JSON valido, zero markdown, zero testo extra:
{
  "title": "Titolo accattivante (60-80 caratteri, include nome persona/squadra principale)",
  "summary": "Meta description SEO: 140-160 caratteri, keyword principale, risponde alla domanda principale",
  "content": "HTML completo minimo 800 parole con struttura indicata",
  "category": "serieA | transferMarket | news | internationalTeams",
  "league": "Solo se internationalTeams: LaLiga | Premier League | Bundesliga | Ligue 1 | Champions League | Europa League",
  "mainTeam": "Nome breve squadra (Milan NON AC Milan, Inter NON Internazionale, Juve o Juventus, ecc.)",
  "secondaryTeams": ["Max 3 squadre secondarie"],
  "mainPerson": "Nome e cognome protagonista (allenatore, presidente, giocatore, dirigente). Stringa vuota se non c'è un protagonista umano specifico citato.",
  "seoKeywords": ["5-7 keyword dalla più importante"],
  "imageSearchQuery": "Query per trovare foto recente del protagonista (es: 'Luciano Spalletti conferenza stampa 2026' o 'Maurizio Sarri Lazio 2026')"
}`;

  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 8000 },
        },
        { headers: { "content-type": "application/json" }, timeout: 90000 }
      );
      break;
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 429 && attempt < 3) {
        await new Promise((r) => setTimeout(r, attempt * 20000));
        continue;
      }
      throw err;
    }
  }
  if (!response) throw new Error("Gemini non ha risposto dopo 3 tentativi");

  const rawText: string = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!rawText) throw new Error("Gemini risposta vuota");

  let cleaned = rawText.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON non trovato nella risposta Gemini");

  let rawJson = jsonMatch[0]
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t");

  let parsed: GeneratedArticle;
  try {
    parsed = JSON.parse(rawJson) as GeneratedArticle;
  } catch {
    try {
      parsed = JSON.parse(jsonMatch[0]) as GeneratedArticle;
    } catch (e2) {
      throw new Error(`JSON non valido da Gemini: ${(e2 as Error).message}`);
    }
  }

  // Gemini ha riconosciuto la notizia come obsoleta
  if ((parsed as unknown as { skip?: boolean }).skip) {
    const reason = (parsed as unknown as { reason?: string }).reason ?? "notizia obsoleta";
    throw new Error(`SKIP: ${reason}`);
  }

  if (!parsed.title || !parsed.content || !parsed.summary) {
    throw new Error("Gemini ha restituito dati incompleti");
  }

  parsed.mainPerson = parsed.mainPerson ?? "";
  parsed.seoKeywords = Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [];
  parsed.imageSearchQuery = parsed.imageSearchQuery ?? (parsed.mainPerson || parsed.mainTeam || "calcio italiano");

  return { article: parsed, sourceNews: targetNews };
}

// ─── Helper: trova maglia nel DB ─────────────────────────────────────────────

async function findJerseyForTeam(
  mainTeam: string,
  secondaryTeams: string[]
): Promise<{ id: string; imageUrl: string } | null> {
  for (const team of [mainTeam, ...secondaryTeams].filter(Boolean)) {
    if (team.length < 2) continue;
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
      const p = product as { _id: unknown; images?: string[] };
      return { id: String(p._id), imageUrl: p.images?.[0] ?? "" };
    }
  }
  return null;
}

// ─── Helper: slug ──────────────────────────────────────────────────────────────

function buildSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[àáâãäå]/g, "a").replace(/[èéêë]/g, "e")
    .replace(/[ìíîï]/g, "i").replace(/[òóôõö]/g, "o")
    .replace(/[ùúûü]/g, "u").replace(/[ñ]/g, "n").replace(/[ç]/g, "c")
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "")
    .slice(0, 100);
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
    log.push(`🔄 Avvio generazione ${ARTICLES_PER_RUN} articolo/i...`);
    await connectDB();
    log.push("✅ DB connesso");

    // Leggi notizie RSS fresche
    log.push("📰 Lettura feed RSS (ultimi 36h, feeds verificati)...");
    const allNews = await fetchAllNews();
    const withImage = allNews.filter((n) => n.rssImage).length;
    log.push(`✅ ${allNews.length} notizie recenti (${withImage} con immagine RSS)`);

    if (allNews.length < 2) {
      return NextResponse.json(
        { success: false, message: "Nessuna notizia recente disponibile", log },
        { status: 200 }
      );
    }

    // Leggi articoli già pubblicati di recente per evitare ripetizioni
    const recentDbTitles = await getRecentArticleTitles();
    log.push(`📋 ${recentDbTitles.length} articoli già pubblicati nelle ultime 48h (da escludere)`);

    const usedTitles: string[] = [];

    for (let i = 0; i < ARTICLES_PER_RUN; i++) {
      log.push(`\n── Articolo ${i + 1}/${ARTICLES_PER_RUN} ──`);
      try {
        // 1. Genera con Gemini
        const { article: generated, sourceNews } = await generateArticleWithGemini(
          allNews,
          usedTitles,
          recentDbTitles,
          i
        );
        log.push(`✏️  "${generated.title}" [${generated.category}]`);
        if (generated.mainPerson) log.push(`👤 Protagonista: ${generated.mainPerson}`);
        log.push(`🏆 Squadra: ${generated.mainTeam}`);
        log.push(`📰 Fonte notizia: ${sourceNews.source}`);
        log.push(`🔍 Image query: ${generated.imageSearchQuery}`);

        // 2. Controlla slug duplicato
        const slug = buildSlug(generated.title);
        if (await slugExists(slug)) {
          log.push("⚠️  Slug duplicato, salto");
          results.push({ success: false, error: "Duplicato" });
          continue;
        }

        // 3. Trova maglia collegata
        const jersey = await findJerseyForTeam(generated.mainTeam, generated.secondaryTeams ?? []);
        if (jersey) log.push(`✅ Maglia trovata: ${jersey.id}`);

        // 4. Immagine smart — priorità: RSS > Bing > Wikipedia > Unsplash
        const { url: imageUrl, source: imgSource } = await fetchSmartImage(
          sourceNews.rssImage,        // immagine estratta dal feed della notizia
          generated.mainPerson,
          generated.mainTeam,
          generated.imageSearchQuery,
          log
        );

        // 5. Salva su MongoDB
        const articleData: Record<string, unknown> = {
          title: generated.title,
          summary: generated.summary,
          content: generated.content,
          image: imageUrl,
          images: [{
            id: `auto-${Date.now()}-${i}`,
            url: imageUrl,
            alt: generated.mainPerson
              ? `${generated.mainPerson} - ${generated.title}`
              : `${generated.mainTeam} - ${generated.title}`,
            isMain: true,
          }],
          category: generated.category,
          author: "Redazione Goalmania",
          status: "published",
          publishedAt: new Date(),
          featured: i < 2,
          slug,
        };

        if (generated.league) articleData.league = generated.league;
        if (jersey?.id) articleData.featuredJerseyId = jersey.id;

        const article = await Article.create(articleData);
        usedTitles.push(generated.title);
        recentDbTitles.push(generated.title); // aggiorna per il prossimo ciclo

        const routePath =
          generated.category === "serieA" ? "/serieA"
          : generated.category === "transferMarket" ? "/transfer"
          : generated.category === "internationalTeams" ? "/international"
          : "/news";

        // Notifica Google + Bing/IndexNow (fire-and-forget, non blocca)
        const publicUrl = `https://goal-mania.it${routePath}/${article.slug || slug}`;
        notifySearchEngines(publicUrl).catch(() => {});

        log.push(`✅ Pubblicato — ${routePath}/${article.slug || slug} (img=${imgSource})`);
        results.push({
          success: true,
          title: generated.title,
          slug: article.slug || slug,
          category: generated.category,
          jerseyFound: !!jersey,
          imageSource: imgSource,
        });

        if (i < ARTICLES_PER_RUN - 1) await new Promise((r) => setTimeout(r, 3000));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Errore sconosciuto";
        log.push(`❌ Errore articolo ${i + 1}: ${msg}`);
        results.push({ success: false, error: msg });
      }
    }

    const published = results.filter((r) => r.success).length;
    const withJersey = results.filter((r) => r.jerseyFound).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    log.push(`\n🎉 ${published}/${ARTICLES_PER_RUN} pubblicati (${withJersey} con maglia) in ${duration}s`);

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
