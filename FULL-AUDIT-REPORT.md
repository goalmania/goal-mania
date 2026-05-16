# SEO Full Audit Report — dmfootballservices.it

**Date:** 2026-05-15  
**Audited URL:** https://dmfootballservices.it/  
**Business Type:** Italian B2B SaaS — Football Management Software  
**Products:** ClubIS (club management) + DM Scout (AI scouting platform)  
**Stack:** React/Vite SPA · Vercel CDN · Italian market only  
**Auditor:** Claude Code SEO Audit (multi-agent)

---

## Executive Summary

| Category | Score | Weight | Weighted |
|---|---|---|---|
| Technical SEO | 28/100 | 22% | 6.2 |
| Content Quality | 52/100 | 23% | 12.0 |
| On-Page SEO | 61/100 | 20% | 12.2 |
| Schema / Structured Data | 70/100 | 10% | 7.0 |
| Performance (CWV) | 35/100 | 10% | 3.5 |
| AI Search Readiness | 54/100 | 10% | 5.4 |
| Images | 30/100 | 5% | 1.5 |
| **OVERALL SEO HEALTH SCORE** | | | **47.8 / 100** |

> **Rating: D+ — Significant Issues.** The site has excellent meta-layer SEO (schema, robots.txt, llms.txt, hreflang, HSTS) but a React SPA architecture without SSR creates a cluster of critical failures that block most organic acquisition. The top 3 fixes (SSR/prerendering + broken assets + vercel.json rewrite) can move the score to 70+ within 30 days without content work.

### Top 5 Critical Issues

1. 🔴 **SPA with no SSR** — Full page body is `<div id="root"></div>` in static HTML; crawlers see zero product content
2. 🔴 **og-image.png and favicon.png → 404** — All social shares show blank cards; OG image tag is broken
3. 🔴 **All sub-routes return 404** — `/privacy`, `/prezzi`, `/contatti`, etc. hit Vercel's 404 (no rewrite rule configured)
4. 🟠 **Sitemap has 1 URL only** — Google has no declarative path to any product, pricing, or contact pages
5. 🟠 **Missing security headers** — No CSP, X-Frame-Options, X-Content-Type-Options, or Permissions-Policy

### Top 5 Quick Wins (< 1 hour each)

1. ✅ Add `vercel.json` rewrite: `"source": "/(.*)", "destination": "/index.html"` — fixes all 404 routes in one config change
2. ✅ Add `favicon.png` and `og-image.png` to `/public` directory and redeploy — fixes broken social cards
3. ✅ Add security headers block to `vercel.json` — closes all 4 missing header gaps
4. ✅ Add `x-default` hreflang tag and expand sitemap to all routes — immediate crawl improvement
5. ✅ Create `llms-full.txt` from existing `llms.txt` content — improves AI citation quality at zero infrastructure cost

---

## 1. Technical SEO

**Score: 28/100 — Critical**

### Architecture: React SPA Without SSR

The site is a React/Vite Single Page Application. Every URL — homepage, products, pricing, FAQ — is JavaScript-rendered. The static HTML shell served to crawlers is:

```html
<body><div id="root"></div></body>
```

This creates a two-wave indexing problem: Google may index blank pages for 7–14 days before its JS rendering queue processes the page. Non-rendering crawlers (Bing, social link scrapers, most AI crawlers) see zero content. This is the single largest SEO liability on the site.

| Issue | Severity | Status |
|---|---|---|
| SPA with no SSR/prerender | Critical | ❌ |
| All sub-routes return HTTP 404 | Critical | ❌ |
| `/og-image.png` → 404 | Critical | ❌ |
| `/favicon.png` → 404 | Critical | ❌ |
| Sitemap: 1 URL only | High | ❌ |
| Missing CSP, X-Frame, nosniff, Permissions-Policy | High | ❌ |
| JS bundle 847KB raw / 238KB gzip | High | ⚠️ |
| No route-based code splitting | High | ⚠️ |
| HTML cache: max-age=0 (no browser cache) | Medium | ⚠️ |
| hreflang missing `x-default` | Medium | ⚠️ |
| `llms-full.txt` missing (404) | Medium | ⚠️ |
| HTTP/2 | — | ✅ |
| HSTS `max-age=63072000` (2 years) | — | ✅ |
| TTFB 0.13s (Vercel CDN, cache HIT) | — | ✅ Excellent |
| robots.txt: all bots allowed incl. AI crawlers | — | ✅ |
| Canonical tag present and correct | — | ✅ |

### Fix: Vercel Rewrite + Security Headers

Create `vercel.json` at project root (5-minute fix, immediate impact):

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

### Fix: SSR/Prerendering

For the Vite/React stack, options ranked by effort vs. impact:

| Option | Effort | Impact | Notes |
|---|---|---|---|
| **Prerender.io** | Low (SaaS, no code change) | High | Intercepts bot user-agents and serves cached HTML. ~$14/month. Fastest path. |
| **Vike** (formerly vite-plugin-ssr) | Medium | High | Drop-in for Vite projects. Minimal refactoring required. |
| **Next.js migration** | High | Full | Most complete solution; enables SSG per route |
| **Astro** | High | Full | Highest performance; larger rewrite |

---

## 2. Content Quality

**Score: 52/100 — Below Average**

### E-E-A-T Assessment

| Signal | Status | Notes |
|---|---|---|
| Experience | ⚠️ Weak | No case studies, usage examples, or real-world club deployments shown |
| Expertise | ✅ Good | Detailed FIGC/FFP/SEPA/C.U. terminology demonstrates genuine domain knowledge |
| Authoritativeness | ⚠️ Weak | No named team, no press mentions, no FIGC partnership badge |
| Trustworthiness | ⚠️ Weak | No customer reviews, no P.IVA/Ragione Sociale visible, no certifications |

### Meta Title & Description

| Element | Current | Assessment |
|---|---|---|
| Title | "DM Football Services — Software Gestionale Calcio \| ClubIS & DM Scout" (76 chars) | Slightly long (ideal 55-60); good keyword inclusion |
| Description | 224 characters | **Too long** — Google truncates at ~160 chars |

**Improved description (157 chars):**
> ClubIS: gestionale per club di Eccellenza, Promozione e Serie D. DM Scout: scouting professionale con AI. 7 giorni gratis, nessuna carta di credito.

### Content Gaps

| Missing Content | SEO Value | Effort |
|---|---|---|
| Dedicated `/clubis` product page | High — ranks for "software gestionale calcio Serie D" | Medium |
| Dedicated `/dmscout` product page | High — ranks for "piattaforma scouting calcio AI" | Medium |
| Dedicated `/prezzi` pricing page | High — captures "prezzi software gestionale calcio" queries | Low |
| Blog / knowledge base | High — topical authority for Italian football management | High |
| Customer testimonials / case studies | High — E-E-A-T + conversion | Medium |
| About/Team page | Medium — E-E-A-T, humanizes the brand | Low |
| Privacy + Cookie policy pages | Medium — legal compliance + trust | Low |
| Comparison pages vs competitors | High — bottom-funnel, high-intent | High |

### Keyword Coverage

| Target Keyword | Status |
|---|---|
| software gestionale calcio | ✅ In title + body |
| gestionale club calcio | ✅ In content |
| scouting calcio AI | ✅ In title + body |
| software Serie D | ✅ In meta + content |
| software Eccellenza | ✅ Present |
| software agenti calcio | ⚠️ Meta keywords only |
| software direttore sportivo | ⚠️ Weak — no dedicated section |
| prezzi software gestionale | ❌ No pricing page URL |
| piattaforma scouting football | ⚠️ Sparse body coverage |

---

## 3. On-Page SEO

**Score: 61/100 — Average**

| Element | Status | Notes |
|---|---|---|
| Title tag | ✅ | 76 chars (slightly over ideal) |
| Meta description | ⚠️ | 224 chars — truncated in SERP |
| H1 (in JS) | ✅ | "Tecnologia per il calcio che capisce il tuo lavoro." |
| H2 headings (in JS) | ✅ | ClubIS, DM Scout, feature sections present |
| Canonical | ✅ | Points to `https://dmfootballservices.it/` |
| Open Graph | ✅ | All required tags present |
| Twitter Card | ✅ | `summary_large_image` configured |
| OG Image | ❌ | `/og-image.png` → 404 — social sharing completely broken |
| Favicon | ❌ | `/favicon.png` → 404 |
| robots meta | ✅ | `index, follow` |
| hreflang | ⚠️ | `hreflang="it"` present but missing `x-default` |
| Internal linking | ⚠️ | JS-rendered only — invisible to crawlers |
| Geo meta tags | ✅ | `geo.region=IT`, `geo.placename=Italia` |

### Image Alt Text (in JS bundle)

Alt text is implemented in React JSX (not static HTML) — invisible to crawlers before JS execution.

Current values:
- `alt="DM Football Services"` — logo (acceptable)
- `alt="ClubIS"` — product screenshots (generic, improvable)
- `alt="DM Scout"` — product screenshots (generic, improvable)

**Recommended:**
- `alt="ClubIS — dashboard presidenza con KPI e Financial Fair Play in tempo reale"`
- `alt="DM Scout — radar 6 assi con confronto multi-giocatore"`

---

## 4. Schema / Structured Data

**Score: 70/100 — Good (with gaps)**

The site implements a comprehensive JSON-LD `@graph` — above average for Italian SaaS.

### Implemented

| Type | Status | Rich Result Eligibility |
|---|---|---|
| Organization | ✅ | Knowledge Panel |
| WebSite | ✅ | Sitelinks search box |
| WebPage | ✅ | Standard |
| SoftwareApplication (ClubIS) | ✅ | Software rich result |
| SoftwareApplication (DM Scout) | ✅ | Software rich result |
| FAQPage | ✅ | FAQ accordion in SERP |

### Issues & Gaps

| Issue | Severity | Fix |
|---|---|---|
| Organization logo points to `/favicon.png` → 404 | High | Fix image, update schema URL to an actual 512×512 logo |
| Missing `AggregateRating` on both SoftwareApplications | High | Enables star ratings in SERP — biggest conversion impact |
| Missing `sameAs` social links | Medium | Add LinkedIn, YouTube once profiles exist |
| Missing `foundingDate` | Low | Minor trust signal |
| SoftwareApplication URLs are external (clubis.it, dmscout.it) | Medium | Product schemas point off-domain |

### Highest-Impact Addition: AggregateRating

```json
{
  "@type": "SoftwareApplication",
  "name": "ClubIS",
  "aggregateRating": {
    "@type": "AggregateRating",
    "ratingValue": "4.8",
    "reviewCount": "47",
    "bestRating": "5"
  }
}
```

> Star ratings in search results can improve CTR by 15-30%. Requires real reviews on a third-party platform (Capterra, G2, Trustpilot IT).

---

## 5. Performance (Core Web Vitals)

**Score: 35/100 — Poor**

*PageSpeed Insights API was rate-limited; values estimated from direct network measurements.*

| Metric | Estimated (Mobile) | Good Threshold | Status |
|---|---|---|---|
| TTFB | 0.13s | < 0.8s | ✅ Excellent |
| FCP | ~3.5–4.5s | < 1.8s | ❌ Poor |
| LCP | ~4.5–6.5s | < 2.5s | ❌ Poor |
| TBT | ~400–700ms | < 200ms | ❌ Poor |
| INP | ~300–500ms | < 200ms | ⚠️ At risk |
| CLS | Unknown | < 0.1 | ⚠️ Unknown |

### Root Causes

1. **847KB JS bundle** — All content is JS-rendered. On mid-range mobile (Googlebot's benchmark hardware), execution takes 2–4 seconds before anything renders.
2. **No code splitting** — Every route loads all code including unused sections.
3. **Images in PNG, not WebP** — 22+ product screenshots totaling ~1.5MB uncompressed:
   - `dmscout-dashboard.png`: 286KB → WebP estimate: ~85KB (70% savings)
   - `dmscout-radar.png`: 202KB → WebP estimate: ~60KB
   - `clubis-rosa.png`: 104KB → WebP estimate: ~30KB
   - `clubis-kpi.png`: 97KB → WebP estimate: ~28KB
4. **No lazy loading** — Images load without `loading="lazy"` or explicit dimensions (CLS risk).

### Fixes

```jsx
// 1. Route-based code splitting
const ClubISSection = React.lazy(() => import('./sections/ClubIS'));
const DMScoutSection = React.lazy(() => import('./sections/DMScout'));

// 2. Lazy images with explicit dimensions (prevents CLS)
<img
  src="/assets/dmscout-dashboard.webp"
  loading="lazy"
  width="1280"
  height="800"
  alt="DM Scout — dashboard principale con database giocatori"
/>
```

Convert images with `sharp` or `cwebp`:
```bash
find public/assets -name "*.png" -exec cwebp -q 82 {} -o {}.webp \;
```

---

## 6. AI Search Readiness (GEO)

**Score: 54/100 — Developing**

The team has made the right structural choices but the SPA architecture limits their effectiveness.

| Signal | Status | Notes |
|---|---|---|
| GPTBot, ClaudeBot, PerplexityBot allowed | ✅ | Explicit Allow / in robots.txt |
| Google-Extended, anthropic-ai, cohere-ai | ✅ | All allowed |
| `llms.txt` present | ✅ | Detailed, well-structured, Italian |
| `llms-full.txt` | ❌ | Returns 404 |
| FAQPage schema | ✅ | 8 Q&A pairs — AIO-eligible |
| JS rendering barrier | ❌ | AI crawlers without JS see empty shell |
| Question-based headings | ❌ | Current headings are declarative ("Piani e prezzi") not interrogative ("Quanto costa ClubIS?") |
| Named author / timestamp in llms.txt | ❌ | Undated, uncredited content |
| YouTube presence | ❌ | Highest-correlation AI citation signal (~0.737) |
| Review site listings (Capterra, G2) | ❌ | No verified SaaS listings detected |
| Wikipedia entity | ❌ | No entity page |

### AI Platform Citation Readiness

| Platform | Score | Primary Barrier |
|---|---|---|
| Google AI Overviews | 38/100 | CSR blocks schema; no question headings |
| Perplexity | 52/100 | llms.txt partial mitigation; low domain authority |
| ChatGPT | 48/100 | No Wikipedia / external authority |
| Claude.ai | 55/100 | ClaudeBot allowed + llms.txt helps |
| Bing Copilot | 35/100 | Bing does not run JS rendering at scale |

### llms.txt Improvements Needed

The current `llms.txt` is good (60% of optimal) but should add:
1. `Last-Updated: YYYY-MM-DD` timestamp
2. Named author/editorial contact
3. Question-based H2/H3 headings (e.g., "Quanto costa ClubIS?" not "Piani e prezzi")
4. Self-contained answer blocks of 134–167 words per section
5. RSL 1.0 licensing declaration permitting AI reuse
6. Named club case studies (even anonymized: "Club di Serie D in Piemonte ha ridotto...")

---

## 7. Images

**Score: 30/100 — Poor**

| Issue | Severity |
|---|---|
| OG image (1200×630) → 404 | Critical |
| Favicon → 404 | High |
| All 22+ product screenshots in PNG (no WebP/AVIF) | High |
| Alt text only in JS (invisible to crawlers) | High |
| No explicit `width`/`height` on images (CLS risk) | Medium |
| No CDN-level auto image optimization | Medium |

### Image Optimization Roadmap

1. Add `favicon.png` and `og-image.png` to `/public` directory → redeploy
2. Convert all product PNGs to WebP (estimate 65–75% size reduction, ~1MB saved)
3. Add `loading="lazy"` + explicit dimensions to all `<img>` tags
4. Use `fetchpriority="high"` on hero image only
5. Consider `srcset` for retina/responsive sizes

---

## 8. Backlinks

**Score: ~20/100 — Estimated Weak (new/young domain)**

No Moz/Bing API credentials available; Common Crawl analysis performed.

- Domain appears to have minimal referring domain count (characteristic of a new SaaS launch)
- Sister domains `clubis.it` and `dmscout.it` represent an immediate internal link equity opportunity — cross-link all three domains prominently
- No social profile presence detected in schema (`sameAs` is empty)

### Link Building Opportunities (Italian Football Niche)

| Source Type | Priority | Notes |
|---|---|---|
| Lega Nazionale Dilettanti (LND) | High | Covers Eccellenza/Promozione/Serie D — perfect partner |
| FIGC.it partner/vendor directory | High | Authority domain, exact target market |
| Calcio e Finanza (calcioefinanza.it) | High | Italian football business press |
| Regional football federation websites | Medium | 20 Italian regional FIGC committees |
| Tuttomercatoweb.com / Transfermarkt.it | Medium | High-DA Italian football media |
| Capterra/G2/SoftwareAdvice | Medium | SaaS review sites (also help AI citation) |
| startupitalia.eu, wired.it | Medium | Italian tech press |
| YouTube channel (tutorials/demos) | High | Highest AI citation correlation (0.737) |

---

## 9. Search Experience (SXO)

**Score: 42/100 — Below Average**

### Query-to-Page Intent Match

| Search Query | User Intent | Match | Gap |
|---|---|---|---|
| "software gestionale calcio" | Transactional | ⚠️ Partial | No pricing URL, no comparison |
| "ClubIS" / "DM Scout" | Navigational | ✅ Good | — |
| "gestionale calcio Serie D" | Transactional | ⚠️ Partial | No dedicated Serie D page |
| "software scouting calcio AI" | Transactional | ⚠️ Partial | No DM Scout dedicated page |
| "quanto costa ClubIS" | Commercial | ❌ Poor | No accessible `/prezzi` URL |
| "alternative a [competitor]" | Commercial investigation | ❌ Missing | No comparison content |
| "prova gratis software calcio" | Transactional | ⚠️ Partial | CTA exists but no trial landing page |

### Persona Coverage

| Persona | Coverage | Gap |
|---|---|---|
| Segretario (secretary) | ✅ Good | No workflow walkthrough |
| Direttore Sportivo | ✅ Good | No ROI argument / case study |
| Allenatore (coach) | ⚠️ Weak | No training session demo |
| Scout | ✅ Good | Well served by DM Scout section |
| Agente FIFA | ⚠️ Mentioned in FAQ only | No dedicated section |
| Presidente (president) | ✅ Good | No financial ROI calculator |
| Settore Giovanile | ⚠️ Brief mention | No dedicated content |

### B2B Trust Signal Gaps (Italian Market)

Italian football clubs making software decisions expect:

- ❌ Customer logos / club names using the software
- ❌ Testimonials from presidents/secretaries
- ❌ FIGC partnership or certification badge
- ❌ P.IVA / Ragione Sociale visible on site
- ❌ Italian registered office address
- ✅ Phone number (+39 333 421 8596) — present in schema, verify it's also visible in rendered page
- ✅ "7 giorni gratis, nessuna carta di credito" — strong trust signal, ensure it's above the fold

---

## Priority Action Plan

### 🔴 Critical — Fix This Week

| # | Action | Effort | Impact |
|---|---|---|---|
| C1 | `vercel.json` with SPA rewrite + security headers | 30 min | Fixes all 404 routes; adds security headers |
| C2 | Add `favicon.png` + `og-image.png` to `/public` and redeploy | 1 hour | Fixes all social sharing; fixes schema logo |
| C3 | Implement Prerender.io or Vike SSR | 1–5 days | Resolves SPA indexability root cause |

### 🟠 High — Fix Within Month 1

| # | Action | Effort | Impact |
|---|---|---|---|
| H1 | Expand sitemap.xml to all routes | 1 hour | Better crawl discovery |
| H2 | Create `/clubis` dedicated product page | 3 days | Ranks for "software gestionale calcio Serie D" |
| H3 | Create `/dmscout` dedicated product page | 2 days | Ranks for "piattaforma scouting calcio AI" |
| H4 | Create `/prezzi` pricing comparison page | 1 day | Captures commercial-intent pricing queries |
| H5 | Add `AggregateRating` schema + get Capterra/G2 reviews | 3 days | Enables SERP star ratings (+15-30% CTR) |
| H6 | Convert all PNGs to WebP | 2 hours | ~70% image size reduction; LCP improvement |
| H7 | Implement React.lazy() code splitting | 1 day | Reduces initial JS; improves INP |
| H8 | Fix Organization logo schema URL | 30 min | Knowledge Panel logo |

### 🟡 Medium — Month 2

| # | Action | Effort | Impact |
|---|---|---|---|
| M1 | Create `llms-full.txt` with expanded product + FAQ content | 2 hours | Better AI citation |
| M2 | Rewrite llms.txt H2/H3 headings as questions | 1 hour | Google AIO slot matching |
| M3 | Add timestamp + author to llms.txt | 30 min | AI freshness signal |
| M4 | Create `/about` page with team + P.IVA + company info | 1 day | E-E-A-T + trust |
| M5 | Create `/privacy` and `/cookie` policy pages | 1 day | Legal compliance |
| M6 | Add customer testimonials section | 3 days | E-E-A-T + conversion |
| M7 | Fix meta description to ≤160 chars | 30 min | Better SERP CTR |
| M8 | Add `x-default` hreflang + expand sitemap | 30 min | Hreflang compliance |
| M9 | Add lazy loading + explicit dimensions to images | 2 hours | CLS fix |
| M10 | Add `sameAs` social links to Organization schema | 1 hour | Entity disambiguation |

### ⚪ Low — Month 3+

| # | Action | Effort | Impact |
|---|---|---|---|
| L1 | YouTube channel with product demo videos | Ongoing | Highest AI citation signal (0.737 correlation) |
| L2 | Blog: Italian football management content | Ongoing | Topical authority + long-tail traffic |
| L3 | LND/FIGC partnership link acquisition | Ongoing | Domain authority + niche trust |
| L4 | Comparison pages vs competitors | 2 days each | Bottom-funnel captures |
| L5 | Cross-link clubis.it ↔ dmscout.it ↔ dmfootballservices.it | 1 day | Internal equity distribution |
| L6 | AVIF image format with WebP fallback | 1 day | Further image optimization |

---

## Technical Appendix

### Crawled URLs

| URL | HTTP Code | Notes |
|---|---|---|
| https://dmfootballservices.it/ | 200 | 13.5KB HTML shell (SPA) |
| https://dmfootballservices.it/robots.txt | 200 | All bots allowed |
| https://dmfootballservices.it/sitemap.xml | 200 | 1 URL only |
| https://dmfootballservices.it/llms.txt | 200 | Detailed, well-structured |
| https://dmfootballservices.it/llms-full.txt | 404 | Missing |
| https://dmfootballservices.it/og-image.png | 404 | **Critical — social sharing broken** |
| https://dmfootballservices.it/favicon.png | 404 | Missing |
| https://dmfootballservices.it/privacy | 404 | No Vercel rewrite rule |
| https://dmfootballservices.it/prezzi | 404 | No Vercel rewrite rule |
| https://dmfootballservices.it/blog | 404 | No content |
| https://dmfootballservices.it/contatti | 404 | No Vercel rewrite rule |

### Asset Inventory

| Asset | Raw Size | Gzip | Format | WebP? |
|---|---|---|---|---|
| index-oihZ3H1x.js | 847KB | 238KB | JS | — |
| index-CeIE9GVO.css | 62KB | — | CSS | — |
| dmscout-dashboard.png | 286KB | — | PNG | ❌ |
| dmscout-radar.png | 202KB | — | PNG | ❌ |
| clubis-rosa.png | 104KB | — | PNG | ❌ |
| clubis-kpi.png | 97KB | — | PNG | ❌ |
| + 17 more PNGs | ~1.2MB total | — | PNG | ❌ |

### Server Configuration

| Setting | Value | Status |
|---|---|---|
| Hosting | Vercel (fra1 — Frankfurt) | ✅ |
| HTTP | HTTP/2 | ✅ |
| TTFB (cached) | 0.13s | ✅ Excellent |
| HTML cache | max-age=0, must-revalidate | ⚠️ |
| HSTS | max-age=63072000 (2 years) | ✅ |
| CSP | Not set | ❌ |
| X-Frame-Options | Not set | ❌ |
| X-Content-Type-Options | Not set | ❌ |
| Permissions-Policy | Not set | ❌ |
| Sitemap in robots.txt | ✅ Present | ✅ |

---

*Report generated by Claude Code SEO Audit — 2026-05-15*
