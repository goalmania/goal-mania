# Project: Second Round of Client Revisions

The following are the requested updates and revisions for the next project iteration:

---

1. **Admin Panel Accessibility** (DONE)
   - The admin panel is still not accessible. Please verify and resolve the issue so that the backend is working properly.

2. **Mystery Box Page** (DONE)
   - There are no text descriptions for the product sizes. Keep the current size format, but update the style to match the new design—without reducing image quality. It's important that the images retain their sharpness and proportions.

3. **FAQ Title Styling** (DONE)
   - The FAQ title is still not styled correctly. Please adjust it to match the visual identity of the site.

4. **Homepage & Shop Graphics** (DONE)
   - On both the homepage and the shop section, the graphics I sent you need to be placed inside rounded rectangular containers. These should also include a call-to-action button within each block to improve user engagement.

5. **Shop Section Intro & Graphics** (DONE)
   - In the shop section, you can remove the introductory part that says "Discover our shirts". Replace it with the first visual graphic (the one I sent you) inside the new styled rectangle.
   - The graphic with “90s and 2000s” should go in the Retro section, and please move the Retro category close to the 2025/26 category in the shop menu.

6. **Team Logo Carousel** (DONE)
   - When a user clicks on a team logo in the carousel, it should open a dedicated page showing only the shirts from that team.

7. **Patches Section & Product Detail Styling** (DONE)
   - The Patches section is still missing the images—please upload those. (admin can now update this, and fix it their end)
   - Within the product detail pages, use orange and blue as accent colors to match our branding.
   **Comments**
      - Created a robust Global Patch management system and Available Patches
      - Admin can assign patches, update, delete or create new ones

8. **Admin Video Uploads in Shop** (DONE)
   - In the Shop section, there needs to be a dedicated area where only the admin can upload videos that showcase the shirts. These videos should appear in the product pages when relevant.
   **Comments**
      - Complete video upload system implemented with all features:
        • Video cards matching image card design (same UI/UX)
        • Cloudinary integration with 500MB file limit support
        • Real-time progress indicators and retry logic
        • Enhanced error handling and debugging
        • Video preview with click-to-play modals
        • Video removal functionality (hover + delete)
        • Support for both new uploads and existing videos from database
      - Issue: Current Cloudinary account tier may not support video uploads
      - Solution needed: Either upgrade Cloudinary plan or implement alternative video storage (Vercel Blob, AWS S3, etc.)

9. **Related Products** (OUT OF SCOPE)
   - In each product page, please include a section for related products so users can discover similar items.
   **Comments**
   - This would take too much refactorig and complex algorithim to be implemented thus making it out of scope for now

10. **Mystery Box Menu Icon**
    - In the main menu, for the Mystery Box link, add a small box icon next to the text, to visually reinforce the idea.

11. **Why Choose GoalMania Section** (DONE)
    - In the “Why choose GoalMania” section, make sure it clearly states that shipping is always free, and update the return policy to 7 days, not 30.

12. **Add Google Analytics & Adsense**

13. **Fix the Styling of Ad in the article** (DONE)
   - Style make it more visible and lead the reader to click on the link
   - always keeping the same size improving the graphics maybe putting orange color shading a little to make the button visible the shirt the titles

---