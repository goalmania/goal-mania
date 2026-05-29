import { NextRequest, NextResponse } from "next/server";
import axios from "axios";
import connectDB from "@/lib/db";
import Article from "@/lib/models/Article";
import Product from "@/lib/models/Product";
import { notifySearchEngines } from "@/lib/google-indexing";

export const maxDuration = 300;

const ARTICLES_PER_RUN = 3;

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
  // Mescola: metà attuali, metà retro
  const [current, retro] = await Promise.all([
    Product.find({ isActive: true, isRetro: false, isMysteryBox: false })
      .select("_id slug title description images basePrice isWorldCup country nationalTeam category isRetro")
      .lean(),
    Product.find({ isActive: true, isRetro: true, isMysteryBox: false })
      .select("_id slug title description images retroPrice isWorldCup country nationalTeam category isRetro")
      .lean(),
  ]);

  // Filtra prodotti già coperti di recente
  const available = [...current, ...retro].filter(
    (p: any) => !recentSlugs.includes(p.slug)
  );

  // Shuffle e prendi i primi N
  const shuffled = available.sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
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

  const prompt = `Sei un esperto di maglie da calcio che scrive per Goal-Mania.it, un e-commerce italiano di maglie calcistiche.

DATA ODIERNA: ${today}

PRODOTTO DA DESCRIVERE:
- Nome: ${product.title}
- Squadra/Nazionale: ${team}
- Tipo: ${isRetro ? "Maglia RETRO/vintage" : isWorldCup ? "Maglia Mondiale 2026" : "Maglia attuale 2025/26 o 2026/27"}
- Prezzo: €${price}
- Descrizione prodotto: ${product.description?.slice(0, 300) ?? ""}
- URL prodotto: ${productUrl}

OBIETTIVO: Articolo SEO di almeno 700 parole che:
1. Targettizza keyword come "${product.title}" e varianti long-tail
2. Descrive la maglia in modo appassionato (colori, design, storia, quando si indossa)
3. ${isRetro ? "Racconta la storia di questa maglia vintage, che stagione rappresenta, perché è iconica" : "Descrive il kit attuale della squadra, il design 2025/26 o 2026/27, le caratteristiche"}
4. Include naturalmente il link al prodotto con testo ancora come "acquista la ${product.title}" o "disponibile su Goal-Mania"
5. Parla di abbinamenti, taglie, personalizzazioni (nome+numero)
6. Conclude con CTA verso Goal-Mania.it

Struttura HTML:
<p class="lead"><strong>Intro</strong> (2-3 frasi che aganciano il lettore)</p>
<h2>Design e caratteristiche</h2><p>...</p>
<h2>${isRetro ? "Storia e iconicità" : "Il kit " + (isWorldCup ? "Mondiali 2026" : "stagione 2025/26")}</h2><p>...</p>
<h2>Come acquistarla</h2><p>...includi <a href="${productUrl}">link al prodotto</a>...</p>
<h2>Personalizzazione e taglie</h2><p>...</p>
<h2>Conclusioni</h2><p>...</p>

REGOLA: NON usare le parole "ufficiale", "replica", "licenziata". Usa solo "maglia", "kit", "divisa".

Rispondi SOLO con JSON valido:
{
  "title": "Titolo SEO 60-75 caratteri (includi nome squadra + anno/tipo es: 'Maglia Argentina Home 2026: Guida Completa')",
  "summary": "Meta description 140-160 caratteri con keyword principale",
  "content": "HTML completo minimo 700 parole"
}`;

  let response;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.75, maxOutputTokens: 6000 },
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
