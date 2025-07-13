/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: [
      "res.cloudinary.com",
      "images.unsplash.com",
      "goalmania.shop",
      "media.api-sports.io",
      "crests.football-data.org",
    ],
  },
  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: `
              default-src 'self';
              script-src 'self' https://*.stripe.com https://js.stripe.com https://connect.facebook.net https://www.googletagmanager.com 'unsafe-inline' 'unsafe-eval';
              style-src 'self' https://fonts.googleapis.com 'unsafe-inline';
              font-src 'self' https://fonts.gstatic.com;
              img-src 'self' data: https://res.cloudinary.com https://images.unsplash.com https://goalmania.shop https://media.api-sports.io https://www.facebook.com;
              frame-src 'self' https://*.stripe.com https://js.stripe.com;
              connect-src 'self' https://*.stripe.com https://*.api-sports.io https://v3.football.api-sports.io https://*.cloudinary.com https://api.cloudinary.com https://www.google-analytics.com;
            `
              .replace(/\s+/g, " ")
              .trim(),
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
