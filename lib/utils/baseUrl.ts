export function getBaseUrl(): string {
  const vercelUrl = process.env.VERCEL_URL;
  if (vercelUrl) {
    // Vercel provides the host without protocol; prefix with https://
    return `${vercelUrl.replace(/\/$/, "")}`;
  }

  // Local/dev fallback
  return "http://localhost:3000";
}


