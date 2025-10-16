/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inter, Italianno, Mulish } from "next/font/google";
import { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";
import Container from "./_sections/container";
import Script from "next/script";
import PromoToast from "@/components/PromoToast";

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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: {
    default: "Goal Mania - Maglie Calcio Ufficiali",
    template: "%s | Goal Mania",
  },
  description: "Negozio ufficiale di maglie da calcio. Trova le migliori maglie delle tue squadre preferite.",
  keywords: ["maglie calcio", "jersey", "football shirts", "Goal Mania", "maglie ufficiali", "calcio"],
  authors: [{ name: "Goal Mania" }],
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://goalmania.com"),
  openGraph: {
    type: "website",
    locale: "it_IT",
    url: "/",
    siteName: "Goal Mania",
    title: "Goal Mania - Maglie Calcio Ufficiali",
    description: "Negozio ufficiale di maglie da calcio",
    images: [
      {
        url: "/images/recentUpdate/desktop-logo.png",
        width: 1200,
        height: 630,
        alt: "Goal Mania Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Goal Mania - Maglie Calcio Ufficiali",
    description: "Negozio ufficiale di maglie da calcio",
    images: ["/images/recentUpdate/desktop-logo.png"],
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
      { url: "/favicon.ico", sizes: "any", type: "image/x-icon" },
      { url: "/images/image.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-for-public/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/favicon-for-public/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: [{ url: "/favicon.ico", type: "image/x-icon" }],
    apple: [
      { url: "/images/image.png", sizes: "180x180", type: "image/png" },
      { url: "/favicon-for-app/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/images/image.png",
        sizes: "180x180",
      },
      {
        rel: "mask-icon",
        url: "/favicon-for-app/safari-pinned-tab.svg",
        color: "#0A1A2F",
      },
    ],
  },
  manifest: "/site.webmanifest",
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
      className={`${italianno.variable} ${mulish.variable} font-italianno text-base sm:text-lg`}
    >
      <head>
        {/* Structured Data for Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "Goal Mania",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://goalmania.com",
              logo: `${process.env.NEXT_PUBLIC_APP_URL || "https://goalmania.com"}/images/recentUpdate/desktop-logo.png`,
              description: "Negozio ufficiale di maglie da calcio",
              sameAs: [
                "https://www.facebook.com/goalmania",
                "https://www.instagram.com/goalmania",
                "https://twitter.com/goalmania",
              ],
            }),
          }}
        />
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
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
          <div className="min-h-screen flex flex-col">
            {children}
            <ToastProvider />
          </div>
        </Providers>
      </body>
    </html>
  );
}
