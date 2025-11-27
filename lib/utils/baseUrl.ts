export function getBaseUrl(): string {
  // First, check if NEXTAUTH_URL is explicitly set (highest priority)
  if (process.env.NEXTAUTH_URL) {
    return process.env.NEXTAUTH_URL;
  }

  // Only use VERCEL_URL if we're actually on Vercel (not local)
  // VERCEL env var is automatically set by Vercel
  if (process.env.VERCEL && process.env.VERCEL_URL) {
    const vercelUrl = process.env.VERCEL_URL;
    // Vercel provides the host without protocol; prefix with https://
    if (vercelUrl.includes("http") || vercelUrl.includes("https")) {
      return vercelUrl;
    } else {
      return `https://${vercelUrl}`;
    }
  }

  // Check for production URL environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL;
  }

  // Local/dev fallback
  // Check if we're in development mode
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000";
  }

  // Final fallback
  return "http://localhost:3000";
}


