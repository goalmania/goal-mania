# Goal-Mania – Client Additional Review & Change Requests

**Date:** December 2024
**Status:** Pending Client Review

---

## 🛠️ Issues & Change Requests

### 1. Admin Panel Access Bug
- **Issue:** Admin panel repeatedly asks for login, preventing access.
- **Action:** Investigate and fix authentication/session persistence for admin panel.
- **Status:** FIXED
- **Comment:** This case only occur, if user is not authenticated. I have provide UI cues and added middlewares to protect private pages and components

### 2. Homepage Content & Shop Elements
- **Issue:** Shop-related elements (team scroller, etc.) are visible on the homepage.
- **Action:**
  - Remove all shop elements from the homepage.
  - Homepage should only display a featured box with the first graphic (to be provided by client) and the following text:
    > "Maglie attuali e retrò a partire da 30€\nSpedizione sempre gratuita, qualità garantita."
  - Move team scroller and related elements to the Shop section.
- **Status:** FIXED

### 3. Team Scroller Improvements
- **Issue:** Team scroller must be interactive (manual scroll) and use team nicknames, not original names.
- **Action:**
  - Ensure users can manually scroll the team carousel.
  - Replace team names with nicknames (e.g., "The Red Devils" for "Manchester United").
- **Status:** FIXED

### 4. Return Policy Update
- **Issue:** Return period is incorrect.
- **Action:** Update return policy to allow returns within 7 days only.
- **Status:** FIXED

### 5. Shop Shirt Animations & Color Consistency
- **Issue:** Shirt animations need improvement and must use the brand orange color.
- **Action:**
  - Enhance shirt animations in the shop.
  - Ensure use of primary orange (`#f5963c`) for highlights/animations.
- **Status:** FIXED

### 6. Shirt Page Patches & Size Chart
- **Issue:** Patches are not clearly previewed; size chart missing.
- **Action:**
  - Display small preview images for all patches on shirt pages.
  - Add a size chart table to all shirt-related sections.
- **Status:** FIXED

### 7. Reviews Section Media Uploads
- **Issue:** Reviews section lacks photo/video upload capability.
- **Action:** Implement photo and video upload for product reviews.
- **Status:** FIXED

### 8. Shop Video Preview Box
- **Issue:** No option to upload video previews for shirts in the shop.
- **Action:** Add a box in the Shop section for uploading video previews of shirts.
- **Status:** FIXED

### 9. Translation Functionality
- **Issue:** Italian-to-English translation is not working.
- **Action:** Fix and verify translation functionality across the site.
- **Status:** ISSUES
- **Comment:** Current project has done hardcoded translation, native browser api only works for few browsers for translation. Either go with i18n that basically stores content in languages needed (takes a lot of time) 

### 10. Navigation Bar Alignment
- **Issue:** "Serie A" is misaligned in the top navigation bar.
- **Action:** Adjust alignment for visual consistency.
- **Status:** FIXED
- **Comment:** Added whitespace-nowrap class to prevent text wrapping and ensure proper alignment.

### 11. Admin Section Access & Features
- **Issue:** Client awaiting admin access to verify improvements, text formatting, and sales statistics.
- **Action:**
  - Ensure admin access is available.
  - Confirm improved text formatting for articles.
  - Provide Shopify-style sales statistics for shirts.
- **Status:** FIXED
- **Comment:** Admin access is working correctly with proper authentication. Enhanced analytics with Shopify-style metrics including Average Order Value, Customer Lifetime Value, Conversion Rate, and Repeat Customer Rate. Added new "Shopify Metrics" tab in analytics dashboard.

### 12. Google AdSense Integration
- **Issue:** Google AdSense not connected.
- **Action:** Integrate Google AdSense for traffic and visit monitoring.
- **Status:** PENDING
- **Comment:** Added Google AdSense script to layout. Client needs to replace "NEXT_PUBLIC_ADSENSE_PUBLISHER_ID" with their actual AdSense publisher ID.

### 13. Footer Text Update
- **Issue:** Footer needs new Italian text.
- **Action:** Add the following text to the website footer:
  > Goalmania è il punto di riferimento per chi vive di calcio.\nOgni giorno raccontiamo storie, notizie e curiosità dal mondo del pallone.\nIn più, ti offriamo le maglie più amate — attuali e retrò — a partire da 30€, con spedizione gratuita.\n© 2025 Goalmania. Tutti i diritti riservati.\nLa tua dose quotidiana di calcio ⚽ | Maglie da calcio da 30€ con spedizione gratuita
- **Status:** FIXED
- **Comment:** Updated footer with the requested Italian text including the description and copyright notice.

### 14. Shop & Home Page Image Box Navigation
- **Issue:** Image boxes need specific navigation actions.
- **Action:**
  - First image in a box in the Shop section should link directly to the "back" section.
  - Second image in a box on the Home page should link to the Shop section.
- **Status:** FIXED
- **Comment:** 
  - Shop page hero image now links to "/shop/retro" (back section) with hover effects
  - Home page now has a second image box in top-right corner that links to "/shop" with hover effects

---

## 📋 Summary

These changes are required to address client feedback and ensure the platform meets all expectations for usability, branding, and functionality. Each item should be tracked and verified upon completion. 

# Personal Improvment
- Footer link -> pages