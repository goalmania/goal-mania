import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import Product from "@/lib/models/Product";

// ─── Config ───────────────────────────────────────────────────────────────────

const ARTICLES_PER_RUN = 4;

const RSS_FEEDS = [
  { url: "https://www.gazzetta.it/rss/home.xml",          source: "Gazzetta dello Sport", category: "serieA" },
  { url: "https://www.corrieredellosport.it/rss",          source: "Corriere dello Sport", category: "news" },
  { url: "https://www.tuttosport.com/rss/calcio",          source: "Tuttosport",           category: "serieA" },
  { url: "https://www.calciomercato.com/rss",              source: "CalcioMercato",        category: "transferMarket" },
  { url: "https://www.goal.com/feeds/it/news",             source: "Goal.com",             category: "news" },
];

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
  hintCategory: string;
}

interface GeneratedArticle {
  title: string;
  summary: string;           // usato anche come meta description SEO (max 160 char)
  content: string;           // HTML ottimizzato SEO/GEO
  category: "news" | "transferMarket" | "serieA" | "internationalTeams";
  league?: string;
  mainTeam: string;
  secondaryTeams: string[];
  mainPerson: string;        // persona principale (es. "Flavio Briatore") — per la foto
  seoKeywords: string[];     // 5-7 keyword SEO
  imageSearchQuery: string;  // query ottimale per trovare foto reale
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
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&nbsp;/g, " ");
}

function parseRssItems(xml: string, source: string, hintCategory: string): NewsItem[] {
  const items: NewsItem[] = [];
  for (const item of (xml.match(/<item>([\s\S]*?)<\/item>/g) ?? [])) {
    const title = decodeHtmlEntities(extractTag(item, "title"));
    const description = decodeHtmlEntities(
      extractTag(item, "description").replace(/<[^>]+>/g, "").slice(0, 400)
    );
    if (title.length > 5) items.push({ title, description, source, hintCategory });
  }
  return items.slice(0, 8);
}

async function fetchAllNews(): Promise<NewsItem[]> {
  const results = await Promise.allSettled(
    RSS_FEEDS.map(async ({ url, source, category }) => {
      const res = await axios.get(url, {
        timeout: 8000,
        headers: { "User-Agent": "Mozilla/5.0 (compatible; GoalMania/1.0)" },
        responseType: "text",
      });
      return parseRssItems(res.data as string, source, category);
    })
  );

  const all: NewsItem[] = [];
  for (const r of results) {
    if (r.status === "fulfilled") all.push(...r.value);
  }
  // Shuffle per varietà ma mantieni notizie recenti
  return all.sort(() => Math.random() - 0.5);
}

// ─── Helper: Wikipedia image ──────────────────────────────────────────────────

async function fetchWikipediaImage(entity: string): Promise<string | null> {
  if (!entity || entity.trim().length < 2) return null;

  for (const lang of ["it", "en"]) {
    try {
      // Step 1: cerca il titolo esatto della pagina
      const searchRes = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
        params: {
          action: "query",
          list: "search",
          srsearch: entity,
          srlimit: 1,
          format: "json",
          origin: "*",
        },
        timeout: 6000,
      });
      const pages = searchRes.data?.query?.search;
      if (!pages || pages.length === 0) continue;

      const pageTitle = pages[0].title as string;

      // Step 2: recupera l'immagine principale della pagina
      const imgRes = await axios.get(`https://${lang}.wikipedia.org/w/api.php`, {
        params: {
          action: "query",
          titles: pageTitle,
          prop: "pageimages",
          pithumbsize: 1200,
          format: "json",
          origin: "*",
        },
        timeout: 6000,
      });

      const pagesData = imgRes.data?.query?.pages ?? {};
      const page = Object.values(pagesData)[0] as { thumbnail?: { source: string } };
      if (page?.thumbnail?.source) {
        return page.thumbnail.source;
      }
    } catch {
      continue;
    }
  }
  return null;
}

// ─── Helper: Unsplash (fallback) ──────────────────────────────────────────────

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

// ─── Helper: smart image (Wikipedia first, then Unsplash) ────────────────────

async function fetchSmartImage(
  mainPerson: string,
  mainTeam: string,
  imageSearchQuery: string,
  log: string[]
): Promise<{ url: string; source: string }> {
  // 1. Persona reale → Wikipedia
  if (mainPerson && mainPerson.trim().length > 2) {
    const wikiUrl = await fetchWikipediaImage(mainPerson);
    if (wikiUrl) {
      log.push(`🖼️  Foto Wikipedia per "${mainPerson}": OK`);
      return { url: wikiUrl, source: "wikipedia-person" };
    }
    log.push(`⚠️  Wikipedia: nessuna foto per "${mainPerson}"`);
  }

  // 2. Squadra → Wikipedia
  if (mainTeam && mainTeam.trim().length > 2) {
    const wikiUrl = await fetchWikipediaImage(mainTeam + " football club");
    if (wikiUrl) {
      log.push(`🖼️  Foto Wikipedia per "${mainTeam}": OK`);
      return { url: wikiUrl, source: "wikipedia-team" };
    }
  }

  // 3. Unsplash con la query suggerita da Gemini
  const query = imageSearchQuery || mainTeam || "football";
  const unsplashUrl = await fetchUnsplashImage(query);
  log.push(`🖼️  Immagine Unsplash: "${query}"`);
  return { url: unsplashUrl, source: "unsplash" };
}

// ─── Helper: genera articolo con Google Gemini (SEO + GEO ottimizzato) ────────

async function generateArticleWithGemini(
  news: NewsItem[],
  usedTitles: string[],
  articleIndex: number
): Promise<GeneratedArticle> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY non configurata");

  const freshNews = news
    .filter((n) => !usedTitles.some((t) => n.title.slice(0, 30) === t.slice(0, 30)))
    .slice(0, 5);

  if (freshNews.length === 0) throw new Error("Nessuna notizia disponibile");

  // Scegli la notizia in base all'indice per varietà
  const targetNews = freshNews[articleIndex % freshNews.length];
  const contextNews = freshNews.filter((n) => n !== targetNews).slice(0, 3);

  const newsDigest = [targetNews, ...contextNews]
    .map((n, i) => `[${i === 0 ? "NOTIZIA PRINCIPALE" : `Notizia ${i + 1}`} — ${n.source}]\n${n.title}\n${n.description}`)
    .join("\n\n");

  const prompt = `Sei un giornalista sportivo senior per Goal-Mania.it, uno dei principali portali calcistici italiani.

NOTIZIE REALI dalle principali testate sportive italiane (16 Maggio 2026):

${newsDigest}

**OBIETTIVO**: Scrivi un articolo giornalistico approfondito basato sulla NOTIZIA PRINCIPALE.
L'articolo deve essere:
1. **SEO-ottimizzato**: usa keyword naturali, titolo H1 chiaro, sottotitoli H2/H3, lista puntata dove utile
2. **GEO-ottimizzato** (AI search): rispondi direttamente alle domande, usa frasi complete e fattuali, cita nomi e cifre reali
3. **Originale**: non copiare il testo delle fonti, rielaboralo con valore aggiunto
4. **Lungo e approfondito**: minimo 800 parole

Struttura HTML richiesta:
- <p class="lead"><strong>Occhiello di apertura</strong> (2-3 frasi che riassumono il fatto principale)</p>
- <h2>Titolo sezione 1</h2><p>...</p>
- <h2>Titolo sezione 2</h2><p>...</p>
- <h2>Analisi e Prospettive</h2><p>...</p>
- <h2>Conclusioni</h2><p>...</p>

Rispondi SOLO con JSON valido, senza markdown né testo extra:
{
  "title": "Titolo accattivante originale (60-80 caratteri, include nome persona/squadra principale)",
  "summary": "Meta description SEO: riassunto in 140-160 caratteri, include keyword principale, risponde alla domanda principale dell'articolo",
  "content": "HTML completo dell'articolo (minimo 800 parole) con struttura <p class=lead>, <h2>, <p>, <strong>, <ul>, <li>",
  "category": "serieA | transferMarket | news | internationalTeams",
  "league": "Solo se category=internationalTeams: LaLiga | Premier League | Bundesliga | Ligue 1 | Champions League | Europa League",
  "mainTeam": "Nome esatto squadra principale (es: Juventus, Real Madrid, Napoli, Inter, Milan, Roma, Lazio, Arsenal, Barcelona)",
  "secondaryTeams": ["Max 3 squadre secondarie citate"],
  "mainPerson": "Nome e cognome della persona principale dell'articolo (es: Flavio Briatore, Claudio Lotito, Aurelio De Laurentiis). Stringa vuota se l'articolo riguarda solo una squadra senza protagonista umano specifico.",
  "seoKeywords": ["5-7 keyword rilevanti per SEO, dalla più importante alla meno importante"],
  "imageSearchQuery": "Query ottimale in italiano per trovare una foto giornalistica rilevante (es: 'Flavio Briatore Milan 2026' oppure 'Juventus allenamento 2026')"
}

Regole rigide:
- mainTeam: usa nome breve della maglia (Milan NON AC Milan, Inter NON Internazionale, ecc.)
- mainPerson: se c'è un presidente, allenatore, giocatore o dirigente protagonista, inseriscilo qui — questa info viene usata per trovare la sua foto reale
- seoKeywords: prima keyword = keyword principale dell'articolo (es. "Briatore Milan" o "Juventus calciomercato")
- content: MINIMO 800 parole, struttura giornalistica professionale
- Non inventare fatti non presenti nelle notizie fornite`;

  const response = await axios.post(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: { temperature: 0.75, maxOutputTokens: 3000 },
    },
    { headers: { "content-type": "application/json" }, timeout: 60000 }
  );

  const rawText: string = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!rawText) throw new Error("Gemini risposta vuota");

  const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON non trovato nella risposta Gemini");

  const parsed = JSON.parse(jsonMatch[0]) as GeneratedArticle;

  // Validazione campi
  if (!parsed.title || !parsed.content || !parsed.summary) {
    throw new Error("Gemini ha restituito dati incompleti");
  }

  // Assicurati che mainPerson e seoKeywords esistano
  parsed.mainPerson = parsed.mainPerson ?? "";
  parsed.seoKeywords = Array.isArray(parsed.seoKeywords) ? parsed.seoKeywords : [];
  parsed.imageSearchQuery = parsed.imageSearchQuery ?? parsed.mainTeam ?? "calcio italiano";

  return parsed;
}

// ─── Helper: trova maglia nel DB ─────────────────────────────────────────────

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
      return { id: String(prod._id), imageUrl: prod.images?.[0] ?? "" };
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
    log.push(`🔄 Avvio generazione ${ARTICLES_PER_RUN} articoli (SEO+GEO ottimizzati)...`);
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
        // 1. Genera con Gemini (SEO+GEO ottimizzato)
        const generated = await generateArticleWithGemini(allNews, usedTitles, i);
        log.push(`✏️  "${generated.title}" [${generated.category}]`);
        if (generated.mainPerson) log.push(`👤 Persona principale: ${generated.mainPerson}`);
        log.push(`🏆 Squadra principale: ${generated.mainTeam}`);
        log.push(`🔑 Keywords SEO: ${generated.seoKeywords.slice(0, 3).join(", ")}`);

        // 2. Controlla slug duplicato
        const slug = buildSlug(generated.title);
        if (await slugExists(slug)) {
          log.push("⚠️  Slug duplicato, salto");
          results.push({ success: false, error: "Duplicato" });
          continue;
        }

        // 3. Trova maglia nel DB
        const jersey = await findJerseyForTeam(generated.mainTeam, generated.secondaryTeams ?? []);
        let featuredJerseyId: string | undefined;
        if (jersey) {
          featuredJerseyId = jersey.id;
          log.push(`✅ Maglia trovata! ID: ${jersey.id}`);
        } else {
          log.push(`ℹ️  Nessuna maglia per "${generated.mainTeam}"`);
        }

        // 4. Immagine smart: Wikipedia (persona/squadra) → Unsplash
        const { url: imageUrl, source: imgSource } = await fetchSmartImage(
          generated.mainPerson,
          generated.mainTeam,
          generated.imageSearchQuery,
          log
        );

        // 5. Salva articolo su MongoDB
        // I primi 2 articoli del run sono "featured" → appaiono in homepage e In Primo Piano
        const isFeatured = i < 2;

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
          author: "Goal Mania AI",
          status: "published",
          publishedAt: new Date(),
          featured: isFeatured,
        };

        if (generated.league) articleData.league = generated.league;
        if (featuredJerseyId) articleData.featuredJerseyId = featuredJerseyId;

        const article = await Article.create(articleData);
        usedTitles.push(generated.title);

        const routePath = generated.category === "serieA" ? "/serieA"
          : generated.category === "transferMarket" ? "/transfer"
          : generated.category === "internationalTeams" ? "/international"
          : "/news";

        log.push(`✅ Pubblicato — ${routePath}/${article.slug} (featured=${isFeatured}, img=${imgSource})`);
        results.push({
          success: true,
          title: generated.title,
          slug: article.slug,
          category: generated.category,
          jerseyFound: !!featuredJerseyId,
          imageSource: imgSource,
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
    const featured = results.filter((r) => r.success).slice(0, 2).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);

    log.push(`\n🎉 ${published}/${ARTICLES_PER_RUN} pubblicati (${featured} featured, ${withJersey} con maglia) in ${duration}s`);

    return NextResponse.json({
      success: true,
      published,
      featured,
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
