# SEO Action Plan — dmfootballservices.it
**Date:** 2026-05-15 | **Overall Score: 47.8/100** | **Target: 75/100 in 90 days**

---

## 🔴 CRITICAL — Fix This Week (0–7 days)

### C1 — Add vercel.json with SPA Rewrite + Security Headers
**Effort:** 30 min | **Impact:** Fixes all 404 routes; adds missing security headers

Create `/vercel.json` at project root:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ],
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" },
        { "key": "X-Frame-Options", "value": "SAMEORIGIN" },
        { "key": "Permissions-Policy", "value": "camera=(), microphone=(), geolocation=()" }
      ]
    }
  ]
}
```

Fixes: `/privacy` → 200, `/prezzi` → 200, `/contatti` → 200, and all future routes.

---

### C2 — Fix Broken Images (og-image.png + favicon.png)
**Effort:** 1 hour | **Impact:** Restores social sharing on all platforms; fixes schema logo

1. Place `og-image.png` (1200×630px) and `favicon.png` (512×512px) in the `/public` directory of your Vite project
2. Run `npm run build` and verify `dist/og-image.png` and `dist/favicon.png` exist
3. Redeploy to Vercel

Without this, every LinkedIn/Twitter/WhatsApp share shows a blank card — social distribution is completely broken.

---

### C3 — Implement SSR or Prerendering
**Effort:** 1–5 days | **Impact:** Resolves the core indexability problem

**Fastest option — Prerender.io (no code changes needed):**
1. Sign up at prerender.io (~$14/month for small sites)
2. Add Prerender middleware to Vercel via their Vercel integration
3. All bot user-agents (Googlebot, Bingbot, AI crawlers) receive pre-rendered HTML

**Best long-term option — Vike (drop-in for Vite):**
```bash
npm install vike
```
Follow Vike migration guide for React: https://vike.dev/migration/react-router

Priority pages to SSR first: homepage, `/clubis`, `/dmscout`, `/prezzi`

---

## 🟠 HIGH — Month 1 (8–30 days)

### H1 — Expand sitemap.xml
**Effort:** 1 hour

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://dmfootballservices.it/</loc><lastmod>2026-05-15</lastmod><priority>1.0</priority></url>
  <url><loc>https://dmfootballservices.it/clubis</loc><priority>0.9</priority></url>
  <url><loc>https://dmfootballservices.it/dm-scout</loc><priority>0.9</priority></url>
  <url><loc>https://dmfootballservices.it/prezzi</loc><priority>0.8</priority></url>
  <url><loc>https://dmfootballservices.it/about</loc><priority>0.6</priority></url>
  <url><loc>https://dmfootballservices.it/contatti</loc><priority>0.6</priority></url>
  <url><loc>https://dmfootballservices.it/privacy</loc><priority>0.3</priority></url>
</urlset>
```

---

### H2 — Create `/clubis` Dedicated Product Page
**Effort:** 3 days | **Target keywords:** "software gestionale calcio Serie D", "gestionale club calcio", "gestionale FIGC Eccellenza"

Page structure (1,800–2,500 words):
- H1: "ClubIS — Gestionale Completo per Club di Calcio"
- H2: "Per chi è ClubIS?" (Eccellenza, Promozione, Serie D)
- H2: "11 Dashboard Role-Based" (detailed feature section per role)
- H2: "Piani e Prezzi ClubIS" (pricing table)
- H2: "Domande Frequenti su ClubIS" (FAQPage schema)
- CTA: "Prova gratis 14 giorni — Nessuna carta di credito"

---

### H3 — Create `/dm-scout` Dedicated Product Page
**Effort:** 2 days | **Target keywords:** "piattaforma scouting calcio AI", "software scouting Serie D", "software agenti calcio"

Page structure (1,800–2,500 words):
- H1: "DM Scout — Piattaforma di Scouting Calcistico con AI"
- H2: "Per chi è DM Scout?" (scout, agenti FIFA, direttori sportivi)
- H2: "Come funziona l'AI di DM Scout?"
- H2: "Radar 6 Assi e Confronto Multi-Giocatore"
- H2: "Piano e Prezzo" (€49/mese, tutto incluso)
- H2: "DM Scout vs ScoutDecision vs LFScouting" (comparison table)
- CTA: "Prova gratis 14 giorni"

---

### H4 — Create `/prezzi` Pricing Page
**Effort:** 1 day | **Target keywords:** "quanto costa ClubIS", "prezzi software gestionale calcio"

Include:
- Side-by-side comparison of ClubIS Starter/Pro/Elite + DM Scout
- Bundle offer: ClubIS Elite + DM Scout integrated
- Annual discount (15%) calculator
- "7 giorni gratis, nessuna carta di credito" for every plan
- FAQ: "Posso cambiare piano? Posso disdire quando voglio?"

---

### H5 — Add AggregateRating Schema + Get Reviews
**Effort:** 3 days

1. Create Capterra Italia listing for ClubIS: https://www.capterra.it/vendors/login
2. Create G2 listing for DM Scout: https://sell.g2.com
3. Ask existing users for reviews (email campaign)
4. Once reviews are live, add schema to product pages:

```json
"aggregateRating": {
  "@type": "AggregateRating",
  "ratingValue": "4.8",
  "reviewCount": "12",
  "bestRating": "5"
}
```

Star ratings in SERP can improve CTR by 15–30%.

---

### H6 — Convert All Images to WebP
**Effort:** 2 hours

```bash
# Install cwebp
brew install webp

# Convert all PNGs in assets
find src/assets -name "*.png" -exec sh -c 'cwebp -q 82 "$1" -o "${1%.png}.webp"' _ {} \;
```

Update all `<img>` tags to use `.webp` with PNG fallback:
```html
<picture>
  <source srcset="/assets/dmscout-dashboard.webp" type="image/webp" />
  <img src="/assets/dmscout-dashboard.png" loading="lazy" width="1280" height="800"
       alt="DM Scout — dashboard principale con database giocatori" />
</picture>
```

Estimated savings: ~1MB across 22 images (70% reduction).

---

### H7 — Implement React.lazy() Code Splitting
**Effort:** 1 day

```jsx
import React, { Suspense, lazy } from 'react';

const ClubISSection = lazy(() => import('./sections/ClubIS'));
const DMScoutSection = lazy(() => import('./sections/DMScout'));
const PricingSection = lazy(() => import('./sections/Pricing'));
const FAQSection = lazy(() => import('./sections/FAQ'));

function App() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HeroSection /> {/* Eager — above fold */}
      <ClubISSection />
      <DMScoutSection />
      <PricingSection />
      <FAQSection />
    </Suspense>
  );
}
```

---

### H8 — Fix Schema Issues
**Effort:** 1 hour

1. **Fix Organization logo** — change `"url": "https://dmfootballservices.it/favicon.png"` to a real 512×512 PNG logo URL
2. **Add x-default hreflang:**
```html
<link rel="alternate" hreflang="it" href="https://dmfootballservices.it/" />
<link rel="alternate" hreflang="x-default" href="https://dmfootballservices.it/" />
```
3. **Fix meta description** to ≤160 chars:
> ClubIS: gestionale per club di Eccellenza, Promozione e Serie D. DM Scout: scouting professionale con AI. 7 giorni gratis, nessuna carta di credito.

---

## 🟡 MEDIUM — Month 2 (31–60 days)

### M1 — Create llms-full.txt
**Effort:** 2 hours

Publish at `https://dmfootballservices.it/llms-full.txt`. Include:
- All content from llms.txt (expanded to 15-20 FAQ Q&As)
- Named club case studies (even anonymized)
- Feature comparison tables in prose format
- RSL 1.0 licensing declaration at top
- `Last-Updated: YYYY-MM-DD` timestamp
- Named author/contact line

---

### M2 — Rewrite llms.txt Headings as Questions
**Effort:** 1 hour | **Impact:** Google AIO slot matching

Current → Improved:
- "Piani e prezzi ClubIS" → "Quanto costa ClubIS? Quali piani sono disponibili?"
- "Funzionalità principali" → "Cosa può fare DM Scout per il mio lavoro?"  
- "Integrazione ClubIS + DM Scout" → "ClubIS e DM Scout si integrano tra loro?"

---

### M3 — Create /about Page with Legal Info
**Effort:** 1 day

Must include:
- Team section (names, roles) — humanizes E-E-A-T
- P.IVA / Ragione Sociale / REA number
- Registered office address
- Company founding year
- "Missione" statement

Italian B2B buyers check for P.IVA before any purchase decision.

---

### M4 — Add Customer Testimonials
**Effort:** 3 days

Format for maximum impact:
```html
<blockquote>
  "Da quando usiamo ClubIS, abbiamo eliminato 3 fogli Excel e ridotto 
  gli errori nei tesseramenti dell'80%."
  <cite>— Marco R., Segretario, A.S.D. [club name], Eccellenza Lombardia</cite>
</blockquote>
```

Implement `Review` schema alongside testimonials to enable rich results.

---

### M5 — Add Trust Signals Across Site
**Effort:** 2 days

- GDPR compliance badge (link to privacy policy)
- "Sicuro al 100% — Dati protetti in conformità al GDPR" text near CTAs
- Capterra/G2 review badge once profiles are live
- Phone number prominent in header (already in schema, make it visible)
- "Pagamento sicuro" badge near pricing

---

### M6 — Cross-Link Sister Domains
**Effort:** 1 day

Add prominent cross-links:
- clubis.it → "Cerchi anche uno scouting tool? Scopri DM Scout →"
- dmscout.it → "Hai un club? ClubIS ti gestisce tutto →"
- Both → Link back to dmfootballservices.it ecosystem page

Each domain is on a separate site, making cross-links real external backlinks.

---

## ⚪ LOW — Month 3+ (61–90 days)

### L1 — YouTube Channel
**Effort:** Ongoing | **Impact:** Highest AI citation signal (0.737 correlation)

Priority videos:
1. "Demo completa ClubIS 2026 — Gestionale per club di Serie D" (walkthrough)
2. "Come funziona l'AI di DM Scout — Tutorial passo passo"
3. "ClubIS vs Excel: confronto reale per la segreteria" (comparison)

Upload to YouTube. Embed on product pages. Title with exact Italian search queries.

---

### L2 — Blog: Italian Football Management Content
**Effort:** Ongoing | **Target:** 4 articles/month

Priority articles:
1. "Software gestionale calcio: guida alla scelta 2026 per le società dilettantistiche"
2. "Come funziona lo scouting AI nel calcio dilettantistico italiano"
3. "ClubIS vs Golee vs GeSoSport: confronto completo 2026" ← Bottom-funnel, high intent
4. "Financial Fair Play nel calcio dilettantistico: come ClubIS ti aiuta a restare in regola"
5. "FIGC Comunicati Ufficiali: cosa sono e come gestirli automaticamente"

---

### L3 — FIGC/LND Backlink Acquisition
**Effort:** Ongoing

Target links from:
- LND.it (Lega Nazionale Dilettanti) — vendor/partner directory
- Regional FIGC federation websites (20 regions, easy outreach)
- FIGC partner technology ecosystem page
- Italian football coaching associations

---

### L4 — Comparison Pages
**Effort:** 2 days each

Create:
- `/clubis-vs-golee` — "ClubIS vs Golee: quale gestionale calcio scegliere?"
- `/dm-scout-vs-scoutdecision` — comparison for scouts and DS

These capture bottom-funnel "alternative a X" and "X vs Y" searches.

---

## Score Projection

| Action Group | Points Gained | New Score |
|---|---|---|
| Baseline | — | 47.8 |
| Critical fixes (C1-C3) | +8 | 55.8 |
| High priority (H1-H8) | +12 | 67.8 |
| Medium priority (M1-M6) | +7 | 74.8 |
| Low / Month 3+ | +8 | ~82.8 |

---

## Competitive Positioning Note

The SXO analysis identified a genuinely differentiated market position no competitor currently owns:

> **"The only Italian platform combining AI-powered scouting + full club management in one integrated ecosystem, built specifically for Eccellenza, Promozione, and Serie D clubs."**

No competitor offers both products integrated. GeSoSport has scouting modules but not AI. Golee manages clubs but has no scouting tool. ScoutDecision is international with no Italian-specific FIGC compliance.

**This position is valuable but currently invisible to Google because the SPA serves an empty HTML shell.** The architectural fix (C3) is what unlocks this competitive advantage in organic search.

---

*Action Plan generated by Claude Code SEO Audit — 2026-05-15*
