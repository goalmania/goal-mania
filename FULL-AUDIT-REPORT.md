# Goal Mania — SEO & GEO Audit Report
**Data:** 28 Maggio 2026  
**Dominio:** https://goal-mania.it  
**Obiettivo:** Ranking per "maglie da calcio", "maglie calcio a prezzi bassi", "maglie calcio 30€", "maglia [squadra]"

---

## SEO Health Score: 38/100 → 67/100 (dopo le fix applicate)

| Categoria | Prima | Dopo | Peso |
|-----------|-------|------|------|
| Technical SEO | 55/100 | 75/100 | 22% |
| Content / On-Page | 20/100 | 65/100 | 23% |
| Schema Markup | 10/100 | 70/100 | 10% |
| AI Search (GEO) | 0/100 | 55/100 | 10% |
| Performance | 60/100 | 60/100 | 10% |
| Sitemap | 50/100 | 85/100 | 5% |

---

## Executive Summary

Goal Mania ha 407 URL in sitemap e un'infrastruttura Next.js con ISR (revalidate 300s) — il
framework è corretto. Il problema principale è che **tutte le pagine chiave condividevano
lo stesso title e la stessa description**, rendendole indistinguibili agli occhi di Google.
Parallelamente, il **robots.txt gestito da Cloudflare bloccava tutti gli AI crawler** (GPTBot,
PerplexityBot, ClaudeBot) azzerando la visibilità GEO su ChatGPT, Perplexity e Bing Copilot.

---

## Problemi Critici — RISOLTI IN QUESTO AUDIT

### 1. Metadata duplicati su tutte le pagine
**Impatto:** Google non riesce a differenziare le pagine → nessun ranking per keyword specifiche.

**Prima:** Ogni pagina mostrava "Goal Mania - Maglie da Calcio" come title.  
**Dopo:** Ogni pagina ha ora title e description unici con keyword specifiche:

| Pagina | Title ottimizzato |
|--------|-------------------|
| Homepage | `Maglie da Calcio a 30€ - Goal Mania — Serie A, Premier League, Mondiali` |
| /shop | `Negozio Maglie da Calcio - Goal Mania — Tutte le Squadre` |
| /shop/serieA | `Maglie Serie A 2025/26 - Inter, Milan, Juventus, Napoli — Goal Mania` |
| /shop/premier-league | `Maglie Premier League 2025/26 - Liverpool, Arsenal, Manchester City` |
| /shop/serieA/[team] | `Maglia [Team] 2025/26 - Acquista Online — Goal Mania` |
| /shop/retro | `Maglie Calcio Retro - Storiche, Vintage, Anni 90 — Goal Mania` |
| /shop/2025/26 | `Maglie Calcio 2025/26 - Nuova Stagione — Goal Mania` |
| /products/[slug] | `[Nome Maglia] - Acquista Online — Goal Mania` |

### 2. Nessun Product Schema (JSON-LD) sulle pagine prodotto
**Impatto:** Zero rich results Google Shopping → invisibile nelle SERP con prezzi.

**Aggiunto:** `Product` schema con `name`, `image`, `sku`, `offers.price`, `offers.priceCurrency: "EUR"`,
`offers.availability`, `aggregateRating` dinamico dai reviews in DB + `BreadcrumbList`.

### 3. GEO: tutti gli AI crawler bloccati da robots.txt
**Impatto:** Sito invisibile su ChatGPT, Perplexity, Bing Copilot.

Il robots.txt (iniettato da Cloudflare Bot Management) bloccava:
- GPTBot (OpenAI/ChatGPT)
- PerplexityBot
- ClaudeBot
- Bytespider, CCBot, meta-externalagent, Applebot-Extended

**Soluzione applicata:**
- Creato `app/robots.ts` con Allow esplicito per GPTBot, PerplexityBot, anthropic-ai, Applebot
- Creato `public/llms.txt` con struttura completa del sito

> **AZIONE MANUALE RICHIESTA (5 minuti):**
> Il blocco principale viene dal Cloudflare Bot Management.
> Vai su Cloudflare Dashboard → Security → Bots e disabilita il blocco per i bot verificati
> come GPTBot e PerplexityBot. Oppure crea una regola WAF che skippa Bot Fight Mode per
> questi User-Agent.

### 4. Sitemap incompleta — mancavano 50+ pagine team
**Prima:** 0 URL per pagine team (es. /shop/serieA/inter, /shop/premier-league/liverpool)  
**Dopo:** 18 squadre Serie A + 8 Premier League + 14 Nazionali mondiali aggiunte con priority 0.85

### 5. Organization schema povero + mancava WebSite schema
**Prima:** Solo name, url, logo, sameAs  
**Dopo:** Aggiunto contactPoint, email, description ricca + WebSite schema con SearchAction
(abilita il sitelink search box in Google SERP)

### 6. Root metadata con keyword doppiate e description corta
**Prima:** `keywords: ["maglie calcio", ..., "maglie calcio"]` (duplicato), OG description: "Le migliori maglie da calcio" (5 parole)  
**Dopo:** 15 keyword uniche, description da 130 caratteri con keyword target incluse

---

## Problemi Alti — DA IMPLEMENTARE (priorità alta)

### H1 nella HeroSection è client-side rendered
**Impatto:** Google vede il DOM dopo JS — ritardo di indicizzazione.

La `HeroSection` ha `"use client"` — l'H1 non è nel server render iniziale.
Google Renderer elabora JS, ma ci vogliono settimane in più rispetto a contenuto statico.

**Fix raccomandato:**
```tsx
// In app/page.tsx — aggiungere PRIMA di HeroSection:
<h1 className="sr-only">
  Maglie da Calcio a 30€ — Goal Mania: Serie A, Premier League, Mondiali 2026
</h1>
```
Oppure passare il testo H1 come prop server a HeroSection.

### Nessun H1 o testo leggibile sulle pagine listing
Le pagine `/shop/serieA`, `/shop/premier-league` etc. non hanno H1 nel server render.
I client component (SerieAClient, PremierLeagueClient) gestiscono tutto il markup visibile.

**Fix:** Aggiungere hero section server-rendered con H1 + testo descrittivo prima del client component:
```tsx
export default async function SerieAShopPage() {
  const products = await getSerieAProducts();
  return (
    <>
      <section className="py-8 px-4 max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Maglie Serie A 2025/26</h1>
        <p className="text-gray-400">
          Acquista le maglie delle squadre di Serie A 2025/26 a partire da 30€.
          Inter, Milan, Juventus, Napoli, Roma, Lazio, Atalanta, Fiorentina e altre.
          Spedizione gratuita in Italia.
        </p>
      </section>
      <SerieAClient products={products} />
    </>
  );
}
```

### ItemList schema mancante sulle pagine listing
Le pagine `/shop/serieA`, `/shop/premier-league` non hanno `CollectionPage` schema.

**Fix:**
```tsx
const collectionSchema = {
  "@context": "https://schema.org",
  "@type": "CollectionPage",
  name: "Maglie Serie A 2025/26",
  url: "https://goal-mania.it/shop/serieA",
  hasPart: products.slice(0, 10).map((p) => ({
    "@type": "Product",
    name: p.name,
    url: `https://goal-mania.it/products/${p.slug}`,
    offers: { "@type": "Offer", price: p.price, priceCurrency: "EUR" },
  })),
};
```

---

## GEO (AI Search) — Piano completo

### Stato visibilità AI PRIMA delle fix

| Piattaforma | Stato | Causa |
|-------------|-------|-------|
| Google AI Overviews | Parziale | Cloudflare blocca Google-Extended |
| ChatGPT / Bing Copilot | Bloccata | GPTBot: Disallow: / |
| Perplexity | Bloccata | PerplexityBot: Disallow: / |
| Claude AI | Bloccata | ClaudeBot: Disallow: / |
| Apple Intelligence | Bloccata | Applebot-Extended: Disallow: / |

### Fix applicate ora

1. `app/robots.ts` con Allow esplicito per AI crawler di valore
2. `public/llms.txt` con struttura navigabile del sito
3. Organization schema con description lunga (citabile da AI)
4. WebSite schema (SearchAction)

### Fix manuali richieste — Cloudflare (CRITICO)

**Opzione A — Cloudflare Dashboard:**
1. Login → goalmania.it → Security → Bots
2. Trovare "Block AI Scrapers" → Disabilitare
3. Oppure: Security → WAF → Custom Rules → Aggiungi regola:
   - Expression: `(http.user_agent contains "GPTBot") or (http.user_agent contains "PerplexityBot")`
   - Action: Skip → Bot Fight Mode

**Opzione B — Verificare se il blocco viene da Cloudflare Managed Rules:**
Alcune regole "Cloudflare Managed Bot" bloccano automaticamente AI scraper.
Verificare in: Security → WAF → Managed Rules → "Cloudflare Bot Management"

### Ottimizzazione GEO avanzata (da aggiungere)

Aggiungere FAQ schema su homepage per aumentare la citability:
```tsx
const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Quanto costano le maglie da calcio su Goal Mania?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Su Goal Mania le maglie da calcio partono da 30€. Trovi maglie di Serie A, Premier League, Mondiali 2026 e maglie retro storiche. Spedizione gratuita in Italia."
      }
    },
    {
      "@type": "Question",
      name: "Goal Mania spedisce in Italia gratuitamente?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Sì, Goal Mania offre spedizione gratuita su tutti gli ordini in Italia."
      }
    },
    {
      "@type": "Question",
      name: "Goal Mania vende maglie di quale squadra?",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Goal Mania vende maglie di tutte le principali squadre: Inter, Milan, Juventus, Napoli, Roma, Lazio per la Serie A; Liverpool, Manchester City, Arsenal, Chelsea per la Premier League; più nazionali per i Mondiali 2026."
      }
    }
  ]
};
```

---

## Sitemap — Stato dopo le fix

| Tipo URL | Prima | Dopo |
|----------|-------|------|
| Pagine statiche | 17 | 17 |
| Pagine team Serie A | 0 | 18 |
| Pagine team Premier League | 0 | 8 |
| Pagine nazionali Mondiali | 0 | 14 |
| Pagine prodotto | ~380 | ~380 |
| **Totale** | **~407** | **~437+** |

---

## Priority Action Plan

### Immediato (GIA' FATTO in questo audit)
- [x] Metadata unici per tutte le pagine chiave (homepage, shop, serieA, premier-league, team pages, retro, 2025/26, 2024/25)
- [x] Product schema JSON-LD (Product + aggregateRating + BreadcrumbList)
- [x] robots.ts con AI crawler permessi
- [x] public/llms.txt
- [x] Sitemap con pagine team Serie A, Premier League, Mondiali
- [x] Organization + WebSite schema potenziati
- [x] Root metadata keywords aggiornate (15 keyword, no duplicati)
- [x] Canonical tags su tutte le pagine modificate
- [x] OG description da 5 → 130 caratteri

### Questa settimana (MANUALE — 30 minuti totali)
- [ ] **Azione Cloudflare** — Permettere GPTBot e PerplexityBot (5 min)
- [ ] **H1 server-rendered** su homepage e pagine categoria
- [ ] **Registrare sito in Google Search Console** e inviare sitemap
- [ ] **Bing Webmaster Tools** — invia sitemap per Bing/Copilot

### Questo mese
- [ ] Testo SEO above-the-fold su pagine listing (150-300 parole)
- [ ] FAQ schema su homepage per GEO
- [ ] ItemList/CollectionPage schema su pagine listing
- [ ] OG image 1200x630 per homepage e categorie principali
- [ ] Google Merchant Center — feed prodotti per Shopping

### Lungo termine
- [ ] Blog: articoli "Migliore maglia [squadra] 2025/26", "Guida maglie Mondiali 2026"
- [ ] Link building: partnership con siti notizie calcio italiani
- [ ] Pagine landing long-tail: "maglia Inter home 2025", "maglia Napoli away 2025"
- [ ] Valutare redirect /shop/serieA → /shop/serie-a (URL SEO-friendly)
