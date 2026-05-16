# CRO Audit — goal-mania.it
**Date:** 2026-05-15 | **Model:** Editorial-Retail Hybrid (Football News + Jersey E-Commerce)  
**Auditor:** Claude Code | **Method:** Live site exploration (Chrome MCP) + source code analysis

---

## Executive Summary

Goal Mania is a structurally sound idea with a genuinely differentiated model: use football content to build an audience, then convert that audience into jersey buyers mid-read. The editorial-commerce funnel exists and works in concept. The execution has a cluster of problems that collectively make conversion highly unlikely for any new visitor.

The three biggest conversion killers, in order:

1. **The site actively lies about social proof.** Product listings show 2,500 reviews at 4.9 stars. Product pages show "No Reviews Yet." This contradiction is the single fastest way to destroy purchase intent.
2. **Broken product pages in the site's primary categories.** Inter Milan — Italy's biggest club — shows zero products. Arsenal thumbnails are blank. A visitor who can't see the product cannot buy it.
3. **No guest checkout.** Every buyer must create an account before paying. On a site with zero established trust, this is a hard wall most visitors will not cross.

Fix these three things and the conversion rate will move. The rest is optimization.

---

## Phase 1: Discovery Map

### Pages Audited (Live)
- Homepage (`/`)
- Shop (`/shop`)
- Serie A category (`/shop/serieA`)
- Inter Milan products (`/shop/serieA/inter`) — BROKEN
- Arsenal products (`/shop/premier-league/arsenal`) — PARTIAL FAILURE
- Product detail: Maglia Arsenal Home 2026-27 (`/products/6a0713916a83e00d73028255`)
- News listing (`/news`)
- Article: transfer story (`/news/[slug]`)
- Cart (`/cart`)
- Checkout (`/checkout`) — address + payment steps

### Source Files Reviewed
`app/layout.tsx`, `app/page.tsx`, `components/layout/header.tsx`, `components/PromoToast.tsx`, `app/_components/ProductDetailClient.tsx`, `app/_components/JerseyAdBlock.tsx`, `app/products/[id]/page.tsx`, `app/checkout/page.tsx`, `app/checkout/PaymentStep.tsx`, `app/shop/page.tsx`, `app/shop/serieA/[team]/page.tsx`, `app/shop/premier-league/[team]/page.tsx`, `app/news/[slug]/page.tsx`, `app/sitemap.ts`

---

## Phase 2: Dimensional Analysis

---

### D1 — Value Proposition

**What the site claims to be:** A football jersey store. The `<meta description>` reads: *"Goal Mania — La tua destinazione per le migliori maglie da calcio. Acquista le ultime maglie di Serie A, Premier League e altro ancora."* Standard, undifferentiated.

**What the site actually is:** Something more interesting and more valuable — an editorial-commerce hybrid where news content about players and clubs creates organic interest in the jerseys those players wear. The `JerseyAdBlock` component, which inserts a contextual jersey ad mid-article, is the entire thesis of this model: read about Keane going to Juventus → buy the Juventus jersey.

**The problem:** This differentiation is invisible. Nothing on the homepage, shop, or product pages explains that Goal Mania is a football media brand that also sells jerseys, or vice versa. The editorial and commerce sides sit beside each other without being introduced. The unique content-to-commerce funnel exists in the code but not in the positioning.

**Verdict:** The value proposition is buried. The homepage presents as a generic jersey store with a news section attached. A visitor reading the nav bar — "Ultime Notizie / Negozio / Categoria" — has no reason to understand why those things belong together or what makes this site worth buying from vs a generic marketplace.

---

### D2 — Trust & Credibility

This is the most damaged dimension on the site.

**Finding 1: Fabricated social proof — critical**

The `PromoToast` component (the persistent popup) displays:
- **"2.5k recensioni 4.9"** with 5 filled gold stars
- Source: a hardcoded fallback in the code: `setReviewCount(2500)` and `setAverageRating(4.9)` that fires when the actual product fetch returns no reviews.

The product listing cards on the homepage carousels also show 5-star ratings with review counts. These come from the same mechanism: when `reviews.length === 0`, the fallback is 2,500 reviews at 4.9 stars.

Meanwhile, every individual product page shows the Reviews tab as **"No Reviews Yet."**

Any visitor who clicks a jersey they discovered through the popup, sees the "2.5k reviews" alongside, then arrives on the product page to find zero reviews, has received direct evidence that the site lies to them. That visitor is not buying.

**Finding 2: Fake/test data left in production — critical**

The logged-in test account used during auditing has a saved address:
```
Myra Mcdonald
398 East First Parkway
Duis nisi omnis haru
Voluptate ipsum cor, Iste quo doloribus e Distinctio Quam ill
Spain
+1 (393) 365-6259
```

Lines 3-4 are Lorem Ipsum placeholder text. This is test seed data that was never removed from the production database. Any real user who reaches checkout and sees a pre-populated address with gibberish text has found a bug that signals a non-production-ready store.

**Finding 3: Review stars always render as 5/5**

In `PromoToast.tsx`, the star rendering is:
```jsx
{[1, 2, 3, 4, 5].map((star) => (
  <svg className="fill-[#FFD700]" ...>
```

All 5 stars are always gold regardless of `averageRating`. A 3.2 rating would show as 5 stars. The rating number is shown only as text. This is not a star rating component — it is a decoration that always claims perfection.

**Finding 4: "UNKNOWN" category labels on product cards**

Product cards on the homepage display the badge "UNKNOWN" as the category label. This appears when `product.category` is undefined or empty in the DB records. On a live storefront, this tells a visitor the product data is incomplete.

**Finding 5: Social media links unverified**

The Organization schema in `layout.tsx` includes `sameAs` links to Facebook and Instagram. These links were not verified live but should be audited to confirm they point to active, populated accounts.

**Trust signals that DO exist (buried):**
- 4-icon trust strip on product pages: "1 Anno Garanzia" / "Spedizione Gratuita Express" / "7 Giorni Sostituzione" / "100% Sicuri Pagamenti"
- These appear well below the fold, after the image gallery, after all customization options — most buyers never scroll that far

**Trust signals missing entirely:**
- No SSL badge visible in the UI
- No returns policy link on product pages or in checkout
- No delivery timeframe stated on product pages
- No physical address or company registration info (P.IVA) anywhere on the site
- WhatsApp button (green circle, bottom-right) present but provides no context about response times

---

### D3 — Product Pages

**Finding 1: Broken product images across major SKUs**

Arsenal Home 2026-27: thumbnails 2, 3, and 4 (of 4) fail to load. Only the hero image renders. A buyer cannot inspect the product from multiple angles.

**Finding 2: Product descriptions are skeletal**

Arsenal Home 2026-27 description: *"nuova maglia arsenal"* — three words. This provides nothing: no fabric, no fit, no technology, no licensing info, no care instructions, no sizing notes. It also contributes nothing to organic search.

**Finding 3: Size information is incomplete**

The size selector shows S/M/L/XL/XXL/3XL with an ADULT/KIDS toggle. There is no size guide link, no sizing chart modal, no measurement guide. For a clothing product sold internationally, this forces a decision under uncertainty. The `ProductSizeChart.tsx` component exists in the codebase — it is not being rendered on these pages.

**Finding 4: No stock indicators**

Sizes show no stock availability. A visitor selecting "S" cannot tell if it's in stock. No "only X left" urgency, no "out of stock" state, no backorder notice. The `stockQuantity` field exists in the product data model but is not surfaced in the UI.

**Finding 5: Customization UX is functional but buried**

The customization options (patch selection, shorts, socks, player edition, jersey number) are well-implemented in terms of functionality. However, they appear below the primary CTA buttons, after the trust strip. The flow is: price → size → [scroll] → customizations. This is backwards — customization drives AOV and should be integrated into the primary purchase flow above the fold.

**Finding 6: The popup fires on product pages too**

The `PromoToast` fires 2 seconds after landing on any product page. On a 768px-wide mobile viewport, the popup covers 92% of the width, obscuring the size selector and CTA buttons. A user in the act of selecting a size is interrupted by a popup promoting a different jersey.

**Finding 7: Title in browser tab is duplicated**

`generateMetadata` returns `title: \`${p.title} | Goal Mania\`` which is then wrapped by the layout template `"%s | Goal Mania"` — resulting in browser tab titles like **"Maglia Arsenal Home 2026-27 | Goal Mania | Goal Mania"** (confirmed live). Redundant branding.

---

### D4 — Editorial-to-Commerce Funnel

This is the most strategically interesting dimension because it represents Goal Mania's actual competitive differentiation.

**What works:**

The `JerseyAdBlock` component inserts a jersey recommendation mid-article. When a `featuredJerseyId` is set on the article, it pulls that specific jersey. When not set, it falls back to extracting team names from the article title and finding a matching jersey. In the Juventus transfer article audited, the JerseyAdBlock correctly surfaced a Juventus jersey. This is the funnel working as intended.

**What doesn't work:**

1. **The PromoToast competes with the JerseyAdBlock.** A visitor reading a Juventus article receives two promotions: the in-article JerseyAdBlock (Juve-contextual, correct) and the PromoToast popup 2 seconds later (showing a random jersey — the Uruguay national team jersey was shown during the audit). These two promotions contradict each other and the popup undermines the editorial credibility of the article.

2. **The JerseyAdBlock copy is generic.** The component renders a jersey image and a "Compra Ora" button but uses static, non-contextual copy. There is no connection drawn between the article content and the jersey. A reader doesn't understand why this jersey is appearing here. The editorial-commerce bridge requires a sentence of context: "Keane just signed for Juventus — wear the same badge" communicates the connection. The current implementation shows a product card with no explanation.

3. **Article content doesn't link to products.** Article body text never links to product pages. An article about a Premier League signing could naturally link "Arsenal" to `/shop/premier-league/arsenal`. None of this internal linking exists. The articles are traffic assets that dead-end.

4. **The funnel only runs one way.** A visitor who enters via the shop (not via an article) sees no editorial content. Product pages don't link to related articles. There is no "Read why this jersey matters" or "Latest news about [team]" sidebar. The content that drives discovery is siloed from the commerce pages.

5. **Locale inconsistency breaks immersion.** Article pages contain English strings mixed into Italian: "Back to News," "Author," "Related Articles." A reader in full editorial immersion hits these and is reminded this is a half-finished product.

---

### D5 — Navigation & Information Architecture

**Top navigation (desktop):** Home / World Cup 2026 / Ultime Notizie / Negozio / Categoria ▼ / Chi siamo / Contatti

**Problems:**

1. **"World Cup 2026" in the nav is the only item with an icon (trophy emoji).** It gets attention disproportionate to its commercial importance. If World Cup jerseys are a key collection, this makes sense. If not, it's visual noise.

2. **"Categoria" dropdown exists but the underlying pages are broken.** `/category/[slug]` pages use `fetch('/api/admin/categories', { cache: 'no-store' })` with a relative URL — this fails during server-side rendering because relative URLs require a base URL. The category metadata reads `title: \`Category: ${slug}\`` — raw slug, no formatting, not localized, not useful.

3. **Shop navigation ("Negozio") leads to `/shop` which has `force-dynamic`.** Every shop visit hits the database. There is no ISR caching on the primary commercial page.

4. **"ShopNav" component** (within the shop) provides sub-navigation: Serie A / Premier League / World Cup / Stagioni / Retro / Giubbotti / Limited Edition / Mystery Box. However, this secondary nav only appears within the shop section. From news articles or product pages, there is no breadcrumb path back to browse-by-league.

5. **Search is icon-only** (magnifying glass) with no placeholder text, no suggested searches, no autocomplete. Users who know the team they want but don't know the URL path have to hunt.

6. **Wishlist requires login.** The heart icon in the nav requires authentication. A guest visitor who wants to save items for later is immediately blocked and redirected to sign-in.

---

### D6 — Checkout & Cart

**Cart page:**

The cart page exists but the `PromoToast` fires here too. A user who has decided to buy, has a product in their cart, and is reviewing their selection is served a popup promoting a different product. This actively distracts from completing the purchase.

**Checkout — step 1 (address):**

- Requires login (non-negotiable gate). No guest checkout option exists anywhere in the code. The redirect at line 457-458 of `app/checkout/page.tsx` sends unauthenticated users directly to `/auth/signin`.
- First-time visitors must create an account to complete a purchase. Account creation requires an email and password. On a site with no established reputation, many visitors will abandon here.
- Pre-populated address shows fake seed data in production ("Myra Mcdonald", lorem ipsum). This needs to be purged.

**Checkout — step 2 (payment):**

- **Payment methods: Card (Visa/Mastercard/AmEx) + PayPal.** That is the full set. Missing: Apple Pay, Google Pay, Scalapay (Italy's leading BNPL), Klarna. For Italian mobile shoppers, the absence of Apple Pay / Google Pay adds meaningful friction.
- **Shipping revealed here, not on product pages.** "Spedizione: Free" appears for the first time on the payment step. This is a major missed opportunity — free shipping is a conversion driver that should be communicated at the point of decision (product page, cart), not as a late-stage reveal.
- **Coupon codes locked behind "Premium" tier.** The checkout shows a coupon input that reads: *"Gli utenti premium hanno accesso esclusivo ai codici sconto."* A new customer arriving with a discount code (from a marketing campaign, social post, or referral) will be told they are not Premium enough to use it. The coupon gating is hostile to acquisition.
- **"Prendi 3 Paghi 2" cross-sell at checkout.** Conceptually sound, but requires 2 more items to qualify. A customer with 1 item sees "Not Eligible — Add 2 more." This reads as nagging, not as opportunity. It would convert better as a positive prompt before checkout: "Add 2 more jerseys and one is free."

**Checkout — what is missing:**

- No delivery date estimate
- No returns policy link
- No "need help?" contact option
- No trust badges (the 4-icon strip from product pages is absent)
- No payment security badges (padlock, "Pagamento Sicuro", card logos)
- No order confirmation behavior tested (would require actual payment)

---

### D7 — Mobile Experience

**Header:** Hamburger menu collapses navigation correctly. Logo renders (both desktop `/images/recentUpdate/desktop-logo.png` and mobile inline text). Cart and wishlist icons are size-reduced on mobile (15px vs ~20px desktop).

**PromoToast on mobile:** The component renders at `w-[92%]` on small viewports and uses `min-h-[180px]`. On a 375px iPhone viewport this covers approximately 60-70% of the visible screen and 90% of the width. It fires 2 seconds after any page load. On a product page, the size selector and CTA buttons are covered.

**Product images:** Served via `next/image` with `fill` + `object-cover` on the main image. Should deliver appropriately sized images. However, broken Cloudinary URLs mean "appropriately sized broken image" — blank space that's just as useless on mobile.

**Checkout on mobile:** Two-step (address → payment) checkout is actually mobile-appropriate. However, the absence of Apple Pay / Google Pay is felt most acutely on mobile. A mobile Safari user on iPhone expects Apple Pay as a one-tap option on the payment step.

**MysteryBoxPageClient:** Uses 3 raw `<img>` tags (`/box.png`, `/ball.png`, `/delivery.png`) with no `alt` text. On mobile, these are unoptimized and invisible to screen readers.

---

### D8 — SEO / Traffic Signals (CRO-relevant subset)

*(Full SEO audit in separate report. This covers only what affects conversion.)*

**Category pages with broken metadata:** `/shop/premier-league/arsenal` renders with the page title "Category: arsenal" — raw slug, lowercase, no brand. Users arriving via organic search see this in the tab title and potentially in Google as the page title. It signals a low-quality page and increases bounce.

**"UNKNOWN" product category:** Product cards showing "UNKNOWN" as the category badge will appear in any screenshot-based social share, any product schema crawl, and any analytics report. It signals data incompleteness throughout the funnel.

**`og:type: "website"` on product pages:** Product pages should have `og:type: "product"`. The current value means LinkedIn, WhatsApp, and Facebook share cards don't render as product cards — they render as generic links with no price signal.

**Missing structured data:** No `Product` schema, no `AggregateRating` schema, no `Article` schema on news pages. The editorial-commerce hybrid has an opportunity to dominate rich results on both product and article queries — currently none are captured.

---

## Phase 3: Diagnosis

### The 3 Biggest Conversion Killers

**Killer #1: The fake reviews destroy the trust needed to buy.**

The purchase decision for a €30 jersey from an unknown Italian site requires trust. The site's primary trust signal — 2,500 reviews at 4.9 stars — is the `PromoToast` hardcoded fallback. It is fabricated. Any visitor who clicks through to a product page and sees "No Reviews Yet" has been lied to. At that moment, the conversion is dead. Not slowed — dead.

This is not a UX problem. It is a credibility problem. No amount of CTA optimization, page speed improvement, or checkout streamlining recovers a visitor who has concluded they are being deceived.

**Killer #2: Broken product discovery in core categories.**

Inter Milan (`/shop/serieA/inter`) returns zero products. Inter is Italy's dominant club — their jersey is the highest-demand Serie A product. Arsenal returns blank product images on 3 of 4 thumbnails. These are not edge cases. They are the site's highest-traffic entry points.

A visitor who arrives looking for their club's jersey and finds either nothing or blank images has no reason to browse further. The browse-to-add-to-cart step is the first conversion event and it is failing on the most commercially important SKUs.

**Killer #3: No guest checkout.**

Italian e-commerce users, especially first-time visitors, have no prior relationship with Goal Mania. Being required to create an account before paying imposes a cost — time, personal data, password creation — that many will not pay for a €30 jersey from an unknown store. Industry data consistently shows 20-40% cart abandonment attributable to mandatory account creation. The site's checkout code hard-redirects unauthenticated users to sign-in with no guest option offered.

---

### The Single Highest-Leverage Change

**Remove the fake review fallbacks from `PromoToast` and product listing cards.**

This is one targeted code change that eliminates active trust destruction without requiring product, design, or infrastructure work. Replace hardcoded `2500` / `4.9` fallbacks with either no star display (when 0 reviews) or an honest empty state ("Be the first to review"). It takes an hour to ship. The alternative — leaving it — means every other conversion improvement operates under a self-inflicted trust deficit.

---

### The Structural Weakness of the Editorial-Retail Model

The model is sound. The execution has a fatal structural flaw: **the two sides of the business don't know each other exists from the visitor's perspective.**

Editorial content (news articles) drives readers in. The `JerseyAdBlock` tries to capture them at a moment of football emotion. But:

- The editorial side never explains "we sell jerseys" upfront
- The commerce side never says "we cover football news"
- The popup promotes a random jersey that contradicts the contextual JerseyAdBlock
- Product pages don't reference articles about the team
- Articles don't link to product category pages

The result is a site that has two separate businesses that happen to share a domain. The compounding flywheel — read content → develop team affinity → buy jersey → return for content → repeat — is theoretically there but practically never fires because the handoffs between modes are broken.

The model will only work when a visitor understands in the first 10 seconds: *"This is a place for football fans. They write about the game I love. They sell jerseys. I trust them."* Currently, the experience doesn't communicate any of that.

---

## Phase 4: Prioritized Action Plan

### 🔴 CRITICAL — Do This Week (0–7 days)

#### CRO-C1 — Kill the fake reviews
**Effort:** 2 hours | **Impact:** Eliminates the site's primary trust-destroying element

In `components/PromoToast.tsx`, remove the hardcoded fallbacks:
```diff
- setReviewCount(2500);
- setAverageRating(4.9);
+ // Don't show ratings if no real reviews exist
+ setReviewCount(0);
+ setAverageRating(0);
```

Add a conditional: only render the star/review block if `reviewCount > 0`:
```jsx
{reviewCount > 0 && (
  <div className="flex flex-col items-center gap-1">
    <span>{formatReviewCount(reviewCount)} recensioni {averageRating}</span>
    {/* stars */}
  </div>
)}
```

Apply the same fix to all product listing card components that fall back to synthetic ratings.

---

#### CRO-C2 — Fix Inter Milan product query
**Effort:** 1 hour | **Impact:** Restores the highest-demand Serie A category

In `app/shop/serieA/[team]/page.tsx`, the product query uses `title: { $regex: \`^Maglia\\s+${teamName}\` }`. For Inter, confirm the database records use "Inter" and not "F.C. Internazionale," "Internazionale," or similar. Run:

```js
// In MongoDB console or admin panel
db.products.find({ title: /inter/i }).limit(10)
```

Fix the teamName mapping to match actual DB record titles. If records use "Internazionale", add:
```js
const TEAM_NAME_OVERRIDES = {
  inter: "Internazionale",
  // etc.
};
```

---

#### CRO-C3 — Remove test data from production database
**Effort:** 30 minutes | **Impact:** Removes evidence of non-production-readiness from checkout

Delete or replace all user records with Lorem Ipsum addresses in the production database. This is a data hygiene task that should never have survived a production deployment.

---

#### CRO-C4 — Suppress PromoToast on product pages and checkout
**Effort:** 1 hour | **Impact:** Stops interrupting users mid-purchase

In `components/PromoToast.tsx`, add pathname check:
```jsx
import { usePathname } from 'next/navigation';

export default function PromoToast() {
  const pathname = usePathname();
  const isProductPage = pathname?.startsWith('/products/');
  const isCheckout = pathname === '/checkout';
  const isCart = pathname === '/cart';

  // Don't show on these pages
  if (isProductPage || isCheckout || isCart) return null;
  // ...
}
```

Also fix the localStorage check — currently `handleDismiss` sets the dismissed flag but the `useEffect` timer never reads it before firing:
```jsx
useEffect(() => {
  if (localStorage.getItem('promoToastDismissed') === 'true') return;
  const timer = setTimeout(() => setIsVisible(true), 2000);
  return () => clearTimeout(timer);
}, []);
```

---

#### CRO-C5 — Fix broken product images
**Effort:** 2-4 hours | **Impact:** Restores visual product communication for Arsenal, PL section

Audit Cloudinary image URLs for all products. Identify which product records have broken image URLs. Re-upload the missing images or update the database records to point to valid URLs. The priority SKUs are Arsenal and any other Premier League jerseys currently showing blank thumbnails.

---

### 🟠 HIGH — Month 1 (8–30 days)

#### CRO-H1 — Add guest checkout
**Effort:** 3-5 days | **Impact:** Removes the hardest conversion barrier for new visitors

In `app/checkout/page.tsx`, replace the hard redirect:
```diff
- if (status === "unauthenticated") {
-   router.push("/auth/signin?callbackUrl=/checkout");
- }
```

With a guest checkout flow that collects name, email, and shipping address without account creation. Offer account creation post-purchase ("Save your details for next time?"). This is the most impactful single change that requires engineering effort.

---

#### CRO-H2 — Add "Spedizione Gratuita" to product pages above fold
**Effort:** 2 hours | **Impact:** Removes hidden-cost anxiety before the decision point

Move the trust strip (currently below the product tabs) to immediately below the price/size section, above the CTA buttons. Free shipping should be visible before a user decides to buy, not after they've scrolled through the entire page. Even a single line — **"🚚 Spedizione Gratuita in Italia"** — next to the price changes the psychological calculus.

---

#### CRO-H3 — Fix the metadata double-branding
**Effort:** 30 minutes | **Impact:** Fixes browser tabs + potential Google title display

In `app/products/[id]/page.tsx`:
```diff
- title: `${p.title} | Goal Mania`,
+ title: p.title,  // layout.tsx template already appends " | Goal Mania"
```

Apply same fix to all pages that manually append "| Goal Mania" when a layout title template is already active.

---

#### CRO-H4 — Fix category page metadata
**Effort:** 2 hours | **Impact:** Removes "Category: arsenal" from browser tabs and SERPs

In `app/category/[slug]/page.tsx`, replace:
```diff
- title: `Category: ${slug}`,
- description: `Products in category ${slug}`,
+ title: `Maglie ${categoryName} | Goal Mania`,
+ description: `Acquista le migliori maglie ${categoryName} su Goal Mania. Spedizione gratuita.`,
```

Apply the same treatment to all team-specific shop pages (`/shop/serieA/[team]`, `/shop/premier-league/[team]`) which currently have no `generateMetadata` at all.

---

#### CRO-H5 — Add size guide to product pages
**Effort:** 1 day | **Impact:** Reduces size-selection uncertainty, decreases returns

`ProductSizeChart.tsx` exists in the codebase. Render it. Add a "Guida alle taglie" link next to the size selector that opens the chart. Include chest/height measurements for S through 3XL and a note on fit (slim vs regular).

---

#### CRO-H6 — Surface stock availability on size buttons
**Effort:** 1 day | **Impact:** Creates urgency, reduces abandoned sessions due to uncertainty

The `stockQuantity` field exists in the product data model. Render it:
- Sizes with 0 stock: greyed out, "Esaurito"
- Sizes with ≤ 3 units: "Solo 2 disponibili"
- Sizes in stock: normal

---

#### CRO-H7 — Add trust badges to checkout
**Effort:** 2 hours | **Impact:** Reduces payment-step abandonment

The 4-icon trust strip from product pages should be replicated in the checkout order summary. Add to the right column of checkout: card logos (Visa/MC/AmEx/PayPal), lock icon, "Pagamento 100% Sicuro," and a returns policy link. These signals matter most at the moment money changes hands.

---

#### CRO-H8 — Fix coupon access
**Effort:** 2 hours | **Impact:** Unlocks discounts as an acquisition driver

Remove the "Premium" restriction from the coupon input at checkout, or at minimum show the coupon field to all users and only block redemption of Premium-exclusive codes. As currently implemented, acquisition campaigns using discount codes will fail for any non-Premium user who reaches checkout.

---

### 🟡 MEDIUM — Month 2 (31–60 days)

#### CRO-M1 — Add Apple Pay / Google Pay / Scalapay
**Effort:** 2-3 days | **Impact:** Material conversion lift on mobile

Stripe supports Apple Pay and Google Pay via the `PaymentRequestButton` component. Scalapay is Italy's dominant BNPL provider and is expected by Italian shoppers for purchases above €20. Adding these payment options, particularly one-tap Apple Pay for mobile Safari users, will reduce checkout abandonment.

---

#### CRO-M2 — Contextualise the JerseyAdBlock copy
**Effort:** 1 day | **Impact:** Connects editorial emotion to purchase intent

The `JerseyAdBlock` currently renders a jersey image and "Compra Ora." Modify it to include a one-line editorial bridge:
- If article mentions a player transfer: *"[Player] now wears this badge — get the jersey."*
- If article is about a match: *"Support [Team] — wear their colours."*
- Generic fallback: *"La maglia ufficiale di [Team] — disponibile ora."*

This turns a product card into a contextual recommendation and closes the editorial-commerce gap.

---

#### CRO-M3 — Surface "Prendi 3 Paghi 2" before cart
**Effort:** 1 day | **Impact:** Drives AOV without checkout friction

The "Buy 3 get 1 free" offer currently appears at checkout as a "Not Eligible" notice with a requirement to add 2 more items. Move this promotion to:
1. A persistent banner on shop/category pages: *"Compra 3 maglie, la terza è gratis →"*
2. The product page, above the CTA: *"Aggiungine 2 di più e la terza è gratis"*

At checkout it becomes a positive confirmation ("Hai guadagnato 1 maglia gratis!") rather than a nagging eligibility gap.

---

#### CRO-M4 — Establish real review collection
**Effort:** 1 week setup | **Impact:** Builds genuine social proof over 60-90 days

With fake reviews removed (CRO-C1), the site needs real ones. Implement a post-purchase email sequence:
1. Order confirmation (immediate)
2. Delivery confirmation (when shipped)
3. Review request 7 days after estimated delivery

Use a lightweight review platform (Judge.me, Trustpilot, or custom) that feeds star ratings back to product pages and schema markup. This is a 60-90 day compounding investment.

---

#### CRO-M5 — Build the content-to-commerce cross-links
**Effort:** 2 days | **Impact:** Activates the flywheel that is currently broken

Two changes, both in code:
1. **Articles → Products:** In `app/news/[slug]/page.tsx`, add a "Shop [Team] Jerseys" section below the article body that renders the relevant team's latest 3 products.
2. **Products → Articles:** On product detail pages, add "Ultime notizie su [Team]" — the 2 most recent articles mentioning the team name.

---

#### CRO-M6 — Fix locale consistency
**Effort:** 4 hours | **Impact:** Removes "unfinished product" signals

Replace all English strings in the Italian user-facing UI:
- `app/news/[slug]/page.tsx`: "Back to News" → "← Torna alle Notizie", "Author" → "Autore", "Related Articles" → "Articoli Correlati"
- Product pages: "Write a Review" → "Scrivi una Recensione", "Poor/Fair/Good/Very Good/Excellent" → Italian equivalents
- All category pages: resolve the `Category: [slug]` metadata issue

---

### ⚪ STRATEGIC — Month 3+ (61–90 days)

#### CRO-S1 — Add company credibility signals
**Effort:** 2 days | **Impact:** Unlocks trust for Italian B2B and returning visitors

Create an `/about` page with: team names and photos, P.IVA / Ragione Sociale, registered office, founding year, mission statement. Italian online shoppers expect these signals — their absence is a reason not to buy.

---

#### CRO-S2 — Build a returns/guarantee page
**Effort:** 1 day | **Impact:** Removes a pre-purchase objection that is currently unaddressed

The "7 Giorni Sostituzione" trust badge exists on product pages with no link to policy details. Create a `/resi-e-garanzie` page that explains: the return window, the process, who pays return shipping, how exchanges work. Link to it from product pages and checkout.

---

#### CRO-S3 — Personalise the editorial-commerce bridge
**Effort:** 1 sprint | **Impact:** High long-term LTV via repeat purchase

Track which team categories a logged-in user browses. Surface personalized article recommendations on the homepage ("Ultime notizie su [Team]") and personalized jersey cross-sells on news pages. This requires minimal ML — simple session-based or history-based matching is enough.

---

## Score Summary

| Dimension | Current State | Priority |
|---|---|---|
| Value Proposition | Generic, hides real differentiation | M |
| Trust & Credibility | **Actively damaged by fake reviews** | 🔴 CRITICAL |
| Product Pages | Broken images, 3-word descriptions, no size guide | 🔴 CRITICAL |
| Editorial Funnel | Exists in code, broken in execution | 🟠 HIGH |
| Navigation & IA | Functional but category pages broken | 🟠 HIGH |
| Checkout | No guest checkout, 2 payment methods | 🔴 CRITICAL |
| Mobile | Popup covers CTAs, no Apple Pay | 🟠 HIGH |
| SEO/Traffic | Double title tags, missing schema | 🟡 MEDIUM |

---

## Effort vs Impact Matrix

| Action | Effort | Impact |
|---|---|---|
| CRO-C1: Kill fake reviews | 2 hours | 🔴 Highest |
| CRO-C2: Fix Inter category | 1 hour | 🔴 Highest |
| CRO-C4: Suppress popup on product/cart/checkout | 1 hour | 🔴 High |
| CRO-C3: Remove test data | 30 min | 🟠 High |
| CRO-H2: Surface free shipping above fold | 2 hours | 🟠 High |
| CRO-H3/H4: Fix metadata | 3 hours | 🟡 Medium |
| CRO-H1: Add guest checkout | 3-5 days | 🔴 Highest |
| CRO-M1: Apple Pay / Scalapay | 2-3 days | 🟠 High |
| CRO-M4: Real review collection | 1 week | 🟠 High (60-day lag) |

**The first three items on this list take under 4 hours combined and address the site's most damaging conversion problems. Ship those before anything else.**

---

*CRO Audit generated by Claude Code — 2026-05-15*
