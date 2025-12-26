export function getBaseUrl(): string {
  // Check for production URL first
  if (process.env.NEXT_PUBLIC_SITE_URL) {
    return process.env.NEXT_PUBLIC_SITE_URL;
  }

  // Vercel automatic deployment URL
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    // Vercel provides the host without protocol; prefix with https://
    // check if it has http or https
    if (vercelUrl.includes("http") || vercelUrl.includes("https")) {
      return vercelUrl;
    } else {
      return `https://${vercelUrl}`;
    }
  }

  // Local/dev fallback
  return "http://localhost:3000";
}


