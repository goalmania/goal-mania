import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
      // Allow AI search crawlers for GEO visibility (ChatGPT, Perplexity, Bing Copilot, Claude, Apple)
      {
        userAgent: "GPTBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
      {
        userAgent: "PerplexityBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
      {
        userAgent: "anthropic-ai",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
      {
        userAgent: "Claude-Web",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
      {
        userAgent: "ClaudeBot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
      {
        userAgent: "Applebot",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
      // Allow Google-Extended so the site appears in AI Overviews (Google SGE)
      {
        userAgent: "Google-Extended",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout/", "/account/"],
      },
    ],
    sitemap: "https://goal-mania.it/sitemap.xml",
  };
}
