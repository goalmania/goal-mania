import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/shop/serie-a",
        destination: "/shop/serieA",
        permanent: true,
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  compress: true,
  experimental: {
    optimizePackageImports: [
      "recharts",
      "@heroicons/react",
      "lucide-react",
      "@radix-ui/react-icons",
      "@tabler/icons-react",
      "framer-motion",
      "@radix-ui/react-accordion",
      "@radix-ui/react-dialog",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-select",
      "@radix-ui/react-tabs",
    ],
  },
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 2592000,
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "crests.football-data.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.wikipedia.org",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "flagcdn.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
        pathname: "/**",
      },
      // Feed RSS — immagini articoli generati da AI
      { protocol: "https", hostname: "www.calcionews24.com", pathname: "/**" },
      { protocol: "https", hostname: "cdn.tuttosport.com", pathname: "/**" },
      { protocol: "https", hostname: "www.calciomercato.it", pathname: "/**" },
      { protocol: "https", hostname: "www.calcioefinanza.it", pathname: "/**" },
      { protocol: "https", hostname: "images.calciomercato.it", pathname: "/**" },
      { protocol: "https", hostname: "static.calcionews24.com", pathname: "/**" },
      { protocol: "https", hostname: "wp.tuttosport.com", pathname: "/**" },
      // Bing Image Search (se attivato)
      { protocol: "https", hostname: "*.bing.com", pathname: "/**" },
      { protocol: "https", hostname: "tse*.mm.bing.net", pathname: "/**" },
      // Wildcard per qualsiasi CDN WordPress dei feed (sicuro perché solo articoli nostri)
      { protocol: "https", hostname: "*.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i0.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i1.wp.com", pathname: "/**" },
      { protocol: "https", hostname: "i2.wp.com", pathname: "/**" },
      // Wildcard globale per immagini articoli da feed RSS (qualsiasi CDN)
      { protocol: "https", hostname: "**" },
    ],
  },
};

export default process.env.ANALYZE === "true"
  ? require("@next/bundle-analyzer")({
      enabled: true,
      analyzerMode: "static",
      openAnalyzer: false,
    })(nextConfig)
  : nextConfig;