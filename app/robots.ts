import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/", "/auth/", "/cart", "/wishlist", "/_next/image"],
      },
      // Allow AI search crawlers for GEO visibility (ChatGPT, Perplexity, Bing Copilot, Claude, Apple)
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/", "/auth/", "/cart", "/wishlist", "/_next/image"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/", "/auth/", "/cart", "/wishlist", "/_next/image"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/", "/auth/", "/cart", "/wishlist", "/_next/image"],
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/", "/auth/", "/cart", "/wishlist", "/_next/image"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/", "/auth/", "/cart", "/wishlist", "/_next/image"],
      },
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/", "/auth/", "/cart", "/wishlist", "/_next/image"],
      },
      // Allow Google-Extended so the site appears in AI Overviews (Google SGE)
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/", "/auth/", "/cart", "/wishlist", "/_next/image"],
      },
    ],
    sitemap: "https://goal-mania.it/sitemap.xml",
  };
}
