/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inter, Italianno, Mulish, Barlow_Condensed, Barlow, Space_Mono } from "next/font/google";
import { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import "./globals.css";
import Script from "next/script";
import SiteShell from "@/app/_components/SiteShell";
import AnalyticsTrackerLoader from "@/components/analytics/AnalyticsTrackerLoader";

const PIXEL_ID = "1059199992701994";

const inter = Inter({ subsets: ["latin"] });
const italianno = Italianno({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-italianno",
});
const mulish = Mulish({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-mulish",
});
const barlowCondensed = Barlow_Condensed({
  weight: ["300", "400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow-condensed",
});
const barlow = Barlow({
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-barlow",
});
const spaceMono = Space_Mono({
  weight: ["400", "700"],
  subsets: ["latin"],
  display: "swap",
  variable: "--font-space-mono",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Goal Mania — Maglie da Calcio a 30€",
    template: "%s | Goal Mania",
  },
  manifest: "/site.webmanifest",
  description:
    "Goal Mania: negozio online di maglie da calcio a partire da 30€. Serie A, Premier League, Mondiali 2026, maglie retro. Spedizione gratuita in Italia.",
  keywords: [
    "maglie da calcio",
    "maglie calcio a prezzi bassi",
    "maglie calcio 30 euro",
    "maglie Serie A",
    "maglie Premier League",
    "maglie Mondiali 2026",
    "negozio maglie calcio online",
    "maglia Inter",
    "maglia Juventus",
    "maglia Napoli",
    "maglia Milan",
    "maglia Liverpool",
    "maglia Arsenal",
    "maglie calcio retro",
    "football shirts",
  ],
  authors: [{ name: "Goal Mania" }],
  verification: {
    google: "NgWEwSj9CLxYPIR8GMiEMo0f-edOghZzGqw7_9P2u-E",
  },
  other: {
    "google-adsense-account": "ca-pub-1255454616752120",
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it"),
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "https://goal-mania.it",
    siteName: "Goal Mania",
    title: "Goal Mania — Maglie da Calcio a 30€",
    description:
      "Negozio online di maglie da calcio a partire da 30€. Serie A, Premier League, Mondiali 2026 e maglie retro. Spedizione gratuita in Italia.",
    images: [
      {
        url: "/favicon-for-public/web-app-manifest-512x512.png",
        width: 512,
        height: 512,
        alt: "Goal Mania — Maglie da Calcio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goal Mania — Maglie da Calcio a 30€",
    description:
      "Negozio online di maglie da calcio a partire da 30€. Serie A, Premier League, Mondiali 2026.",
    images: ["/favicon-for-public/web-app-manifest-512x512.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-for-public/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-for-public/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/icon.png", type: "image/png" }],
    apple: [
      { url: "/apple-icon.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-for-public/web-app-manifest-192x192.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/apple-icon.png",
        sizes: "192x192",
      },
      {
        rel: "mask-icon",
        url: "/favicon-for-app/safari-pinned-tab.svg",
        color: "#111111",
      },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="it"
      suppressHydrationWarning
      className={`${italianno.variable} ${mulish.variable} ${barlowCondensed.variable} ${barlow.variable} ${spaceMono.variable} text-base dark`}
    >
      <head>
        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "Goal Mania",
                url: process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it",
                logo: {
                  "@type": "ImageObject",
                  url: `${process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it"}/favicon-for-public/web-app-manifest-512x512.png`,
                  width: 512,
                  height: 512,
                },
                description:
                  "Negozio online italiano di maglie da calcio a partire da 30€. Serie A, Premier League, Mondiali 2026 e maglie retro.",
                contactPoint: {
                  "@type": "ContactPoint",
                  contactType: "customer service",
                  availableLanguage: "Italian",
                  email: "info@goal-mania.it",
                },
                sameAs: [
                  "https://www.facebook.com/goalmania",
                  "https://www.instagram.com/goalmania",
                  "https://twitter.com/goalmania",
                ],
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "Goal Mania",
                url: process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: `${process.env.NEXT_PUBLIC_APP_URL || "https://goal-mania.it"}/search?q={search_term_string}`,
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        {/* Favicon with cache busting */}
        <link rel="icon" type="image/png" sizes="192x192" href="/icon.png?v=2" />
        <link rel="shortcut icon" href="/icon.png?v=2" />
        <link rel="apple-touch-icon" sizes="192x192" href="/apple-icon.png?v=2" />
        {/* Resource hints to improve LCP/FCP */}
        {/* Facebook Pixel */}
        <link rel="preconnect" href="https://connect.facebook.net" />
        <link rel="dns-prefetch" href="//connect.facebook.net" />
        <link rel="preconnect" href="https://www.facebook.com" />
        <link rel="dns-prefetch" href="//www.facebook.com" />
        {/* Google Tag Manager / Analytics */}
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="//www.googletagmanager.com" />
        <link rel="preconnect" href="https://www.google-analytics.com" />
        <link rel="dns-prefetch" href="//www.google-analytics.com" />
        {/* Google AdSense */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" />
        <link rel="dns-prefetch" href="//pagead2.googlesyndication.com" />
        {/* Cloudinary (images) */}
        <link
          rel="preconnect"
          href="https://res.cloudinary.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="//res.cloudinary.com" />
        {/* Google Fonts for admin pages that import CSS */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="dns-prefetch" href="//fonts.gstatic.com" />
      </head>
      <body className={inter.className} suppressHydrationWarning>
        <Script
          id="facebook-pixel"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
          !function(f,b,e,v,n,t,s)
          {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};
          if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
          n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];
          s.parentNode.insertBefore(t,s)}(window, document,'script',
          'https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${PIXEL_ID}');
          fbq('track', 'PageView');
        `,
          }}
        />
        <noscript>
          {/* eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text */}
          <img
            height="1"
            width="1"
            style={{ display: "none" }}
            src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
            alt=""
          />
        </noscript>
        {process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}`}
              strategy="lazyOnload"
            />
            <Script
              id="google-analytics"
              strategy="lazyOnload"
              dangerouslySetInnerHTML={{
                __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}');
    `,
              }}
            />
          </>
        )}

        {/* Google AdSense */}
        {process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID && (
          <Script
            id="google-adsense"
            strategy="lazyOnload"
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${process.env.NEXT_PUBLIC_ADSENSE_PUBLISHER_ID}`}
            crossOrigin="anonymous"
          />
        )}

        <Providers>
          <SiteShell>{children}</SiteShell>
          <AnalyticsTrackerLoader />
        </Providers>
      </body>
    </html>
  );
}
