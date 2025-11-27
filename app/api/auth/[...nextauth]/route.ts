import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";
import { getBaseUrl } from "@/lib/utils/baseUrl";

// In development, always use localhost even if NEXTAUTH_URL is set to production URL
// This prevents issues when the env var is set to production URL but running locally
if (process.env.NODE_ENV === "development") {
  // Check if NEXTAUTH_URL is set to a production URL (contains vercel.app or goal-mania.it)
  const currentUrl = process.env.NEXTAUTH_URL || "";
  if (currentUrl.includes("vercel.app") || currentUrl.includes("goal-mania.it")) {
    // Override with localhost for development
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  } else if (!process.env.NEXTAUTH_URL) {
    // If not set at all, use localhost
    process.env.NEXTAUTH_URL = "http://localhost:3000";
  }
} else if (!process.env.NEXTAUTH_URL) {
  // In production, use getBaseUrl() if NEXTAUTH_URL is not set
  process.env.NEXTAUTH_URL = getBaseUrl();
}

// Log configuration on startup to help debug
console.log("NextAuth configuration:", {
  baseUrl: getBaseUrl(),
  nextAuthUrl: process.env.NEXTAUTH_URL,
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  providers: authOptions.providers.map((provider) => provider.id),
  debug: authOptions.debug,
  nodeEnv: process.env.NODE_ENV,
  vercel: process.env.VERCEL,
  vercelUrl: process.env.VERCEL_URL,
});

// Export all handlers needed for Next.js 15
const handler = NextAuth(authOptions);
export {
  handler as GET,
  handler as POST,
  handler as PUT,
  handler as DELETE,
  handler as PATCH,
};
