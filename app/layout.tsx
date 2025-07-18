/* eslint-disable @typescript-eslint/no-unused-vars */
import { Inter, Italianno } from "next/font/google";
import { Metadata, Viewport } from "next";
import { Providers } from "@/components/providers";
import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { ToastProvider } from "@/components/ToastProvider";
import "./globals.css";
import Container from "./_sections/container";
import Script from "next/script";

const PIXEL_ID = "1059199992701994";

const inter = Inter({ subsets: ["latin"] });
const italianno = Italianno({
  weight: "400",
  subsets: ["latin"],
  display: "swap",
  variable: "--font-italianno",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  title: "Goal Mania - Your Ultimate Shopping Destination",
  description: "Find the best products at the best prices.",
  keywords: ["ecommerce", "shopping", "online store"],
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/images/image.png", sizes: "64x64", type: "image/png" },
      { url: "/images/image.png", sizes: "32x32", type: "image/png" },
      { url: "/images/image.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [{ url: "/images/image.png", sizes: "180x180", type: "image/png" }],
    other: [
      {
        rel: "apple-touch-icon-precomposed",
        url: "/images/image.png",
        sizes: "180x180",
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
      lang="en"
      suppressHydrationWarning
      className={`${italianno.variable} font-italianno text-base sm:text-lg`}
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>
      <body className={inter.className}>
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-LGL162TKF8"
          strategy="afterInteractive"
        />
        <Script
          id="google-analytics"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-LGL162TKF8');
    `,
          }}
        />

        <Providers>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-grow">{children}</main>
            {/* <Container>{children}</Container> */}
            <Footer />
            <ToastProvider />
          </div>
        </Providers>
      </body>
    </html>
  );
}
