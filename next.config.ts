import type { NextConfig } from "next";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  analyzerMode: "static",
  openAnalyzer: false,
});

// Temporarily disable auto-cert due to configuration issues
// // @ts-expect-error - No type definitions available for anchor-pki
// import autoCert from "anchor-pki/auto-cert/integrations/next";

// const withAutoCert = autoCert({
//   enabledEnv: "development",
//   allowIdentifiers: "localhost,127.0.0.1,*.localhost",
// });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: [
      "recharts",
      "@heroicons/react",
      "lucide-react",
      "@radix-ui/react-icons",
    ],
  },
  i18n: {
    defaultLocale: 'it',
    locales: ['en', 'it'],
    localeDetection: false,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
      },
      {
        protocol: "https",
        hostname: "crests.football-data.org",
      },
      {
        protocol: "https",
        hostname: "goalmania.shop",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "media.api-sports.io",
      },
    ],
  },
  // Add Next.js headers for better security and cookie handling
  // headers: async () => {
  //   return [
  //     {
  //       source: "/(.*)",
  //       headers: [
  //         {
  //           key: "X-DNS-Prefetch-Control",
  //           value: "on",
  //         },
  //         {
  //           key: "Strict-Transport-Security",
  //           value: "max-age=63072000; includeSubDomains; preload",
  //         },
  //         {
  //           key: "X-Content-Type-Options",
  //           value: "nosniff",
  //         },
  //         {
  //           key: "Referrer-Policy",
  //           value: "origin-when-cross-origin",
  //         },
  //       ],
  //     },
  //   ];
  // },
};

export default withBundleAnalyzer(nextConfig);
