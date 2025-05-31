import NextAuth from "next-auth";
import { authOptions } from "@/lib/auth";

// Log configuration on startup to help debug
console.log("NextAuth configuration:", {
  baseUrl: process.env.NEXTAUTH_URL || "http://localhost:3000",
  hasSecret: !!process.env.NEXTAUTH_SECRET,
  providers: authOptions.providers.map((provider) => provider.id),
  debug: authOptions.debug,
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
