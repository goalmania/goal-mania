# SEO Audit Report — goal-mania.it
**Data audit:** 23 giugno 2026  
**Sito:** https://goal-mania.it  
**Piattaforma:** Next.js su Vercel + Cloudflare CDN  
**Tipo di business:** E-commerce (maglie da calcio) con blog editoriale

---

## SEO Health Score: **62 / 100**

| Categoria | Peso | Score | Contributo |
|-----------|------|-------|-----------|
| Technical SEO | 22% | 55 | 12.1 |
| Content Quality | 23% | 65 | 14.9 |
| On-Page SEO | 20% | 60 | 12.0 |
| Schema / Structured Data | 10% | 55 | 5.5 |
| Performance (CWV) | 10% | 65 | 6.5 |
| AI Search Readiness | 10% | 70 | 7.0 |
| Images | 5% | 75 | 3.75 |
| **TOTALE** | | | **61.75** |

---

## Top 5 Critical Issues

1. **"ufficiale" nelle meta description dei prodotti** — 18 occorrenze su ogni pagina prodotto. Viola la regola brand/legale (rischio IP claim).
2. **"| Goal Mania" duplicato in tutti i title tag** — ogni pagina finisce con "— Goal Mania | Goal Mania". Penalizzazione di 11+ caratteri su ogni title.
3. **H1 mancante su tutte le pagine prodotto** — `/products/*` non ha H1. Segnale on-page critico per e-commerce.
4. **Canonical mancante su 6+ pagine importanti** — /news, /about, /contact, /transfer, /shop/worldcup, /shipping.
5. **Conflitto robots.txt GPTBot** — la sezione Cloudflare (posizione 1) blocca GPTBot con `Disallow: /`, mentre la sezione manuale lo consente. Vince la prima regola: GPTBot è bloccato.

## Top 5 Quick Wins

1. Rimuovere `| Goal Mania` duplicato dal suffix dei title (fix in `layout.tsx` o `metadata.ts`)
2. Aggiungere `<h1>` alle pagine prodotto
3. Sostituire "ufficiale" → "da collezione" / "stagione 2026/27" nelle meta description prodotto
4. Aggiungere canonical tag alle pagine mancanti
5. Aggiungere `og:image` alla homepage

---

## 1. Technical SEO

### Crawlabilità e Indicizzazione

| Segnale | Status |
|---------|--------|
| robots.txt presente | ✅ |
| Sitemap XML presente | ✅ |
| HTTPS | ✅ |
| HSTS | ✅ (max-age=63072000) |
| Redirect www → apex | ⚠️ 307 Temporary (dovrebbe essere 301/308) |
| Canonical tag — homepage | ✅ https://goal-mania.it |
| Canonical tag — /shop | ✅ |
| Canonical tag — /shop/serieA/inter | ✅ |
| Canonical tag — /news | ❌ MANCANTE |
| Canonical tag — /about | ❌ MANCANTE |
| Canonical tag — /contact | ❌ MANCANTE |
| Canonical tag — /transfer | ❌ MANCANTE |
| Canonical tag — /shop/worldcup | ❌ MANCANTE |
| Canonical tag — /shipping | ❌ MANCANTE |
| Pagine articoli (news/transfer) | ✅ canonical presenti |

### robots.txt — Analisi

Il file ha un conflitto critico tra le regole generate da Cloudflare (inizio file) e le regole manuali (fine file).

**Sezione Cloudflare Managed (prima nel file — vince):**
```
User-agent: GPTBot
Disallow: /          ← blocca tutto
```

**Sezione manuale (dopo — ignorata per GPTBot):**
```
User-Agent: GPTBot
Allow: /             ← mai raggiunta
```

**Bot bloccati da Cloudflare:** Amazonbot, Applebot-Extended, Bytespider, CCBot, ClaudeBot, CloudflareBrowserRenderingCrawler, Google-Extended, GPTBot, meta-externalagent

**Bot consentiti manualmente (ma alcuni bloccati dalla sezione CF):** GPTBot (conflitto), PerplexityBot, anthropic-ai, Claude-Web, Applebot

**Impatto:** GPTBot (ChatGPT browsing) è di fatto bloccato sul sito intero nonostante l'intenzione del webmaster di consentirlo.

### Header di Sicurezza

| Header | Status |
|--------|--------|
| Strict-Transport-Security | ✅ |
| Content-Security-Policy | ❌ MANCANTE |
| X-Frame-Options | ❌ MANCANTE |
| X-Content-Type-Options | ❌ MANCANTE |
| Permissions-Policy | ❌ MANCANTE |
| Referrer-Policy | ❌ MANCANTE |

---

## 2. On-Page SEO

### Title Tag

**Problema critico: tutti i title terminano con `| Goal Mania` duplicato.**

Esempi reali:
- `/shop` → `Negozio Maglie da Calcio | Goal Mania — Tutte le Squadre | **Goal Mania**`
- `/news` → `News Calcio | Goal Mania — Serie A, Champions, Calciomercato | **Goal Mania**`
- `/products/maglia-real-madrid-home-2026-27` → `...— Goal Mania | **Goal Mania**`

**Homepage title length: 71 caratteri** (ideale: 50-60). Verrà troncato da Google.

Titolo attuale: `Maglie da Calcio a 30€ | Goal Mania — Serie A, Premier League, Mondiali 2026`
Suggerito: `Maglie da Calcio a 30€ | Serie A, Premier League, Mondiali — Goal Mania`

### Meta Description

| Pagina | Lunghezza | Status |
|--------|-----------|--------|
| Homepage | 169 chars | ⚠️ Troppo lunga (ideale 120-160) |
| /shop | ~100 chars | ✅ |
| /shop/serieA/inter | ~105 chars | ✅ |
| /transfer | 65 chars | ⚠️ Troppo corta |
| /contact | ✅ | ✅ |

### Struttura Heading

**Homepage — doppio H1 (problema critico):**
- H1: `Maglie da Calcio a 30€ — Goal Mania: Serie A, Premier League, Mondiali 2026`
- H1 (secondo): `MAGLIE DA CALCIO A 30€` ← probabilmente componente decorativo (HeroSection)

Il secondo H1 è quasi certamente il testo hero visivo. Va convertito in `<p>` o `<span>` con stile equivalente.

**Pagine prodotto — H1 assente:**
La pagina `/products/maglia-real-madrid-home-2026-27` non ha nessun `<h1>`. Il titolo del prodotto è presente nel `<title>` ma non nell'heading della pagina.

**Pagine categoria — H1 con testo spezzato:**
- `/shop` → H1: `Le MiglioriMaglieda Calcio` (parole concatenate — probabilmente un CSS `::before/::after` che non si combina bene nel DOM testuale)
- `/shop/worldcup` → H1: `WORLD CUP2026`

### Open Graph

| Tag | Homepage | Prodotti | News |
|-----|----------|----------|------|
| og:title | ✅ | ✅ | ✅ |
| og:description | ✅ | ✅ | ✅ |
| og:image | ❌ MANCANTE | ✅ (Cloudinary) | ✅ |

La homepage manca completamente di `og:image`. Ogni condivisione social della homepage mostrerà un'anteprima senza immagine.

---

## 3. Schema / Structured Data

### Homepage
| Schema | Status |
|--------|--------|
| Organization | ✅ |
| WebSite + SearchAction | ✅ |
| FAQPage (4 Q&A) | ✅ |

### Pagine Prodotto (`/products/*`)
| Schema | Status |
|--------|--------|
| Organization | ✅ |
| WebSite | ✅ |
| BreadcrumbList | ✅ |
| **Product** | ❌ **MANCANTE** |

Le pagine prodotto **non hanno Product schema**. Questo è il gap più grave per un e-commerce: senza `Product` con `offers.price`, `offers.availability` e `aggregateRating`, i prodotti non ottengono i rich results di Google Shopping / price snippets.

### Pagine News
| Schema | Status |
|--------|--------|
| NewsArticle | ✅ |
| BreadcrumbList | ✅ |
| Author (Person) | ❌ MANCANTE |

I NewsArticle non hanno `author`. Google richiede almeno `author.name` per considerare l'articolo bylined content (E-E-A-T).

### Pagine Categoria (`/shop/*`)
Solo Organization + WebSite. Manca `ItemList` schema per le categorie prodotto (opzionale ma utile per rich results).

---

## 4. Sitemap

- **765 URL totali** in sitemap.xml
  - 274 pagine prodotto (`/products/*`)
  - 50 categorie shop (`/shop/*`)
  - ~441 altre (news, transfer, international, serieA articles)
- Sitemap dichiarata in robots.txt ✅
- `lastmod` presente su tutti gli URL ✅
- `changefreq` e `priority` valorizzati ✅

**Problemi:**
- Alcune URL in sitemap non hanno canonical (es. `/shop/worldcup`, `/about`, `/contact`) — rischio di indicizzazione senza canonical
- Le URL `/serieA/*` (tipo `/serieA/mancini-...`) sembrano articoli ma non stanno sotto `/news/` — URL structure incoerente

---

## 5. Performance

### Header Analysis (CDN/Cache)
- `x-vercel-cache: HIT` → ISR funzionante ✅
- `x-nextjs-stale-time: 300` → revalidation ogni 5 min ✅
- Cloudflare CDN attivo ✅

### Segnali di Performance

| Segnale | Valore | Impatto |
|---------|--------|---------|
| Font preloads in `<head>` | **17 file** | Alto — LCP |
| Script in `<head>` | **20 script** | Alto — TBT/TTI |
| Google Ads (pagead2) | presente | Medio — CLS/LCP |
| Immagini lazy loaded | 129/131 | ✅ Buono |
| Immagini eager loaded | 0 | ⚠️ LCP hero potenzialmente non preloadato |
| Cloudinary CDN per immagini | ✅ | ✅ Buono |

**17 font preloads** è eccessivo. Il browser tenta di scaricarli tutti in parallelo prima del render. Ridurre a 3-4 font critici + `font-display: swap` per gli altri.

---

## 6. Content Quality

### E-E-A-T Signals

| Segnale | Status |
|---------|--------|
| Chi siamo page | ✅ presente (/about) |
| Contatti con email | ✅ (/contact) |
| Privacy Policy | ✅ in sitemap |
| Shipping info | ✅ (/shipping) |
| Autore articoli visibile | ❌ nessun byline |
| Trust signals (recensioni) | non rilevato |

### Copy Legale — CRITICO

**La meta description di ogni pagina prodotto contiene "ufficiale":**

Esempio `/products/maglia-real-madrid-home-2026-27`:
> "La divisa **ufficiale** da casa del Real Madrid per la stagione La Liga 2026/27."

Con 18 occorrenze del termine su una singola pagina prodotto, e 274 pagine prodotto nel sito, questo è un rischio legale sistematico. Sostituire con:
- "da collezione"
- "della stagione 2026/27"
- "stile home 2026/27"

Verificare anche le descrizioni prodotto nel CMS/database, non solo il metadata.

---

## 7. AI Search Readiness

| Segnale | Status |
|---------|--------|
| llms.txt | ✅ presente e ben strutturato |
| robots.txt: ai-train=no | ✅ (Cloudflare managed) |
| robots.txt: search=yes | ✅ |
| anthropic-ai Allow | ✅ |
| Claude-Web Allow | ✅ |
| PerplexityBot Allow | ✅ |
| GPTBot | ⚠️ Bloccato da regola CF (conflitto con sezione manuale) |
| Google-Extended (AI Overviews) | ❌ Bloccato da Cloudflare |
| ClaudeBot | ❌ Bloccato da Cloudflare |
| FAQ schema (AI friendly) | ✅ |

**Google-Extended bloccato** = il sito non appare negli AI Overviews di Google Search. Considerare se questa è una scelta intenzionale (i Cloudflare presets sono spesso troppo aggressivi per default).

---

## 8. Images

| Segnale | Status |
|---------|--------|
| Alt text presente | ✅ 131/131 immagini hanno alt |
| Formato WebP | ✅ (Cloudinary) |
| Lazy loading | ✅ 129/131 |
| og:image homepage | ❌ MANCANTE |
| CDN immagini | ✅ Cloudinary |

---

## ACTION PLAN

### 🔴 CRITICO — Fix immediato

| # | Issue | File / Area | Effort |
|---|-------|-------------|--------|
| C1 | Rimuovere `| Goal Mania` duplicato dal suffix di tutti i title | `app/layout.tsx` o template metadata | 1h |
| C2 | Sostituire "ufficiale" nelle meta description prodotto | CMS/database + `app/products/[slug]/page.tsx` | 2h |
| C3 | Aggiungere `<h1>` alle pagine prodotto | `app/products/[slug]/page.tsx` | 30min |
| C4 | Correggere conflitto GPTBot in robots.txt | `app/robots.ts` — rimuovere la sezione manuale GPTBot (già gestita da Cloudflare) | 15min |
| C5 | Aggiungere `og:image` alla homepage | `app/page.tsx` metadata | 30min |

### 🟠 ALTA — Fix entro 1 settimana

| # | Issue | File / Area | Effort |
|---|-------|-------------|--------|
| H1 | Aggiungere canonical alle 6 pagine mancanti | `app/news/page.tsx`, `app/about/page.tsx`, `app/contact/page.tsx`, `app/transfer/page.tsx`, `app/shop/worldcup/page.tsx`, `app/shipping/page.tsx` | 2h |
| H2 | Aggiungere Product schema alle pagine prodotto | `app/products/[slug]/page.tsx` | 3h |
| H3 | Correggere doppio H1 homepage (secondo H1 → `<p>` o `<span>`) | `components/home/HeroSection.tsx` | 30min |
| H4 | Aggiungere `author` al NewsArticle schema | `app/news/[slug]/page.tsx` | 1h |
| H5 | Cambiare redirect www da 307 → 301 | `vercel.json` o Vercel dashboard | 15min |
| H6 | Ridurre font preloads da 17 a 4 critici | `app/layout.tsx` | 2h |

### 🟡 MEDIA — Fix entro 1 mese

| # | Issue | File / Area | Effort |
|---|-------|-------------|--------|
| M1 | Accorciare title homepage a <60 caratteri | metadata homepage | 15min |
| M2 | Allungare meta desc /transfer (ora 65 chars) | `app/transfer/page.tsx` | 15min |
| M3 | Aggiungere header sicurezza: X-Frame-Options, X-Content-Type-Options, Referrer-Policy | `next.config.js` headers | 1h |
| M4 | Correggere H1 testo spezzato su /shop e /shop/worldcup | HeroSection dei componenti shop | 1h |
| M5 | Decidere strategia Google-Extended (ora bloccato = no AI Overviews) | Cloudflare Bot Management | 15min |
| M6 | Aggiungere byline (autore) visibile agli articoli news | componenti news | 2h |
| M7 | Verificare word count articoli news (min 500 parole) | CMS | ongoing |

### 🟢 BASSA — Backlog

| # | Issue | Effort |
|---|-------|--------|
| L1 | Aggiungere `ItemList` schema alle pagine categoria | 2h |
| L2 | Aggiungere `rel=next/prev` per paginazione categorie | 1h |
| L3 | Aggiungere `aggregateRating` a Product schema quando si raccolgono recensioni | — |
| L4 | Implementare Content-Security-Policy header | 4h |
| L5 | Uniformare URL struttura articoli (ora mix /news/, /transfer/, /serieA/, /international/) | refactor routes | 4h |

---

## Note Tecniche

- **Sitemap:** 765 URL. Verificare che tutte le URL siano effettivamente indicizzabili prima di inviarla a Google Search Console.
- **Performance:** Senza dati CrUX reali non è possibile misurare LCP/INP/CLS. Verificare in Google Search Console → Core Web Vitals.
- **Google Ads (`pagead2.googlesyndication.com`):** lo script è caricato su ogni pagina e può impattare CLS (annunci che spostano layout). Usare `strategy="lazyOnload"` con Next.js Script.
- **20 script in `<head>`:** verificare che GA, GTM e Ads usino `strategy="afterInteractive"` in Next.js per non bloccare il render.

---

*Report generato con Claude Code SEO Audit — goal-mania.it — 23 giugno 2026*
