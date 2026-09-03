import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import Product from "@/lib/models/Product";
import { notifySearchEngines } from "@/lib/google-indexing";

export const maxDuration = 300;

const ARTICLES_PER_RUN = 2;

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// Recupera prodotti attivi non ancora coperti da un articolo recente
async function pickProducts(count: number, recentSlugs: string[]) {
  // Priorità alla nuova stagione 2026/27 — spinta organica in corso su queste maglie
  const seasonProducts = await Product.find({
    isActive: true,
    isMysteryBox: false,
    $or: [
      { category: "2026/27" },
      { title: { $regex: "2026[-/]27", $options: "i" } },
    ],
  })
    .select("_id slug title description images basePrice isWorldCup country nationalTeam category isRetro")
    .lean();

  const seasonAvailable = (seasonProducts as any[]).filter(
    (p: any) => !recentSlugs.includes(p.slug)
  );

  if (seasonAvailable.length >= count) {
    const shuffled = seasonAvailable.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, count);
  }

  // Non bastano prodotti 2026/27 non ancora coperti: completa con il mix classico (attuali + retro)
  const [current, retro] = await Promise.all([
    Product.find({ isActive: true, isRetro: false, isMysteryBox: false })
      .select("_id slug title description images basePrice isWorldCup country nationalTeam category isRetro")
      .lean(),
    Product.find({ isActive: true, isRetro: true, isMysteryBox: false })
      .select("_id slug title description images retroPrice isWorldCup country nationalTeam category isRetro")
      .lean(),
  ]);

  const seasonSlugs = seasonAvailable.map((p: any) => p.slug);
  const available = [...current, ...retro].filter(
    (p: any) => !recentSlugs.includes(p.slug) && !seasonSlugs.includes(p.slug)
  );
  const shuffled = available.sort(() => Math.random() - 0.5);
  return [...seasonAvailable, ...shuffled].slice(0, count);
}

// Leggi gli slug di prodotti già usati in articoli recenti (48h)
async function getRecentProductSlugs(): Promise<string[]> {
  try {
    const since = new Date(Date.now() - 48 * 60 * 60 * 1000);
    const recent = await Article.find(
      { publishedAt: { $gte: since }, author: "Redazione Goalmania" },
      { slug: 1 }
    ).lean().limit(100);
    return (recent as { slug: string }[]).map((a) => a.slug);
  } catch {
    return [];
  }
}

// ─── Gemini: genera articolo su una maglia ────────────────────────────────────

async function generateJerseyArticle(product: any): Promise<{
  title: string;
  summary: string;
  content: string;
}> {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) throw new Error("GEMINI_API_KEY non configurata");

  const isRetro = product.isRetro;
  const isWorldCup = product.isWorldCup;
  const team = product.country || product.nationalTeam || product.title;
  const price = isRetro ? (product.retroPrice ?? 35) : (product.basePrice ?? 30);
  const productUrl = `https://goal-mania.it/products/${product.slug}`;

  const today = new Date().toLocaleDateString("it-IT", {
    day: "numeric", month: "long", year: "numeric",
  });

  const prompt = `Scrivi una scheda-racconto per la maglia qui sotto, per Goal-Mania.it. Sei un appassionato di maglie che sa di cosa parla: niente linguaggio da brochure, niente lodi generiche.

DATA ODIERNA: ${today}

MAGLIA:
- Nome: ${product.title}
- Squadra/Nazionale: ${team}
- Tipo: ${isRetro ? "RETRO / vintage" : isWorldCup ? "Mondiale 2026" : "stagione attuale"}
- Prezzo: €${price}
- Descrizione a catalogo: ${product.description?.slice(0, 300) ?? ""}
- URL prodotto: ${productUrl}

${isRetro
  ? `ANGOLO (retro): parti da una cosa concreta e vera legata a questa maglia — la stagione precisa, una partita, un giocatore che la indossava, cosa vinse (o perse) la squadra quell'anno, un dettaglio del design di quell'epoca. Il format è "quella volta che…": un fatto specifico, non "una maglia che ha fatto la storia". Se non conosci un episodio verificabile su questa squadra in quegli anni, resta sul concreto del design e dell'epoca senza inventare.`
  : `ANGOLO (attuale): descrivi com'è fatta la maglia di questa stagione — colori, il dettaglio che la distingue da quella dell'anno prima, chi è lo sponsor tecnico se lo sai, quando la squadra la indossa. Un dettaglio preciso vale più di dieci aggettivi.`}

LUNGHEZZA: 220-420 parole. Basta e avanza.

REGOLE:
- Ogni paragrafo dice qualcosa di specifico. Vietato "capolavoro di design", "un mix di stile e passione", "esalta la figura atletica", "vivi la tua passione", "un pezzo di storia", "non è solo una maglia".
- Un solo link al prodotto, dentro una frase naturale (es. "la trovi su Goal-Mania a ${price}€"). Una CTA leggera alla fine, non due.
- Non usare "ufficiale", "replica", "licenziata": scrivi "maglia", "kit", "divisa".
- Usa "è / ha". Frasi di lunghezza varia. Niente domande retoriche come titoli, niente grassetti sparsi, niente sezione "Conclusioni".
- HTML: apri con un <p> (nessuna classe, nessun <strong>). Se serve, 1 solo <h2> in stile frase. Poi <p>. Includi <a href="${productUrl}">…</a> una volta. Solo tag <p>, <h2>, <a>.

Rispondi SOLO con JSON valido:
{
  "title": "Titolo 45-70 caratteri col nome della maglia (es. 'Maglia Argentina Home 2026'). Niente ': Guida Completa' o sottotitoli a effetto.",
  "summary": "Meta description 140-160 caratteri, keyword principale, dice cos'è la maglia",
  "content": "HTML, 220-420 parole"
}`;

  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.85, maxOutputTokens: 2600 },
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
  if (!response) throw new Error("Gemini non ha risposto");

  const rawText: string = response.data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  if (!rawText) throw new Error("Gemini risposta vuota");

  const cleaned = rawText.replace(/```json\n?/gi, "").replace(/```\n?/g, "").trim();
  const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("JSON non trovato");

  let rawJson = jsonMatch[0]
    .replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "")
    .replace(/\n/g, "\\n").replace(/\r/g, "\\r").replace(/\t/g, "\\t");

  let parsed: { title: string; summary: string; content: string };
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    parsed = JSON.parse(jsonMatch[0]);
  }

  if (!parsed.title || !parsed.content || !parsed.summary) {
    throw new Error("Dati incompleti da Gemini");
  }

  return parsed;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET;
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const startTime = Date.now();
  const log: string[] = [];
  const results: { success: boolean; title?: string; slug?: string; error?: string }[] = [];

  try {
    log.push(`🔄 Avvio generazione ${ARTICLES_PER_RUN} articoli maglia...`);
    await connectDB();

    const recentSlugs = await getRecentProductSlugs();
    const products = await pickProducts(ARTICLES_PER_RUN, recentSlugs);

    if (products.length === 0) {
      return NextResponse.json({ success: false, message: "Nessun prodotto disponibile", log });
    }

    log.push(`🛍️  ${products.length} prodotti selezionati`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i] as any;
      log.push(`\n── Maglia ${i + 1}/${products.length}: ${product.title} ──`);

      try {
        const generated = await generateJerseyArticle(product);
        log.push(`✏️  "${generated.title}"`);

        const slug = buildSlug(generated.title);
        if (await slugExists(slug)) {
          log.push("⚠️  Slug duplicato, salto");
          results.push({ success: false, error: "Duplicato" });
          continue;
        }

        const imageUrl = product.images?.[0] ?? "";

        // Categoria: news (visibile in homepage) ma con link al prodotto nell'articolo
        const articleData = {
          title: generated.title,
          summary: generated.summary,
          content: generated.content,
          image: imageUrl,
          images: imageUrl ? [{ id: `jersey-${Date.now()}-${i}`, url: imageUrl, alt: product.title, isMain: true }] : [],
          category: "news" as const,
          author: "Redazione Goalmania",
          status: "published" as const,
          publishedAt: new Date(),
          featured: false,
          slug,
          featuredJerseyId: String(product._id),
        };

        const article = await Article.create(articleData);
        log.push(`✅ Pubblicato — /news/${article.slug || slug}`);

        const publicUrl = `https://goal-mania.it/news/${article.slug || slug}`;
        notifySearchEngines(publicUrl).catch(() => {});

        results.push({ success: true, title: generated.title, slug: article.slug || slug });

        if (i < products.length - 1) await new Promise((r) => setTimeout(r, 3000));
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Errore sconosciuto";
        log.push(`❌ Errore: ${msg}`);
        results.push({ success: false, error: msg });
      }
    }

    const published = results.filter((r) => r.success).length;
    const duration = ((Date.now() - startTime) / 1000).toFixed(1);
    log.push(`\n🎉 ${published}/${products.length} articoli maglia pubblicati in ${duration}s`);

    return NextResponse.json({ success: true, published, total: products.length, duration: `${duration}s`, articles: results, log });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Errore sconosciuto";
    log.push(`❌ Errore fatale: ${message}`);
    console.error("[CRON_JERSEY_ARTICLE]", error);
    return NextResponse.json({ success: false, error: message, log }, { status: 500 });
  }
}
