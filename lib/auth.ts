import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";

// Extend the built-in session types
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      role?: string;
    };
  }

  interface User {
    id: string;
    email?: string | null;
    name?: string | null;
    image?: string | null;
    role?: string;
  }
}

// Admin role check
export async function isAdmin() {
  const session = await getServerSession(authOptions);
  return session?.user?.role === 'admin';
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error("Please enter an email and password");
        }

        try {
          await connectDB();

          const user = await User.findOne({ email: credentials.email });
          if (!user) {
            throw new Error("No user found with this email");
          }

          const isPasswordValid = await bcrypt.compare(
            credentials.password,
            user.password
          );
          if (!isPasswordValid) {
            throw new Error("Invalid password");
          }

          return {
            id: user._id.toString(),
            email: user.email,
            name: user.name,
            role: user.role as string | undefined,
          };
        } catch (error) {
          console.error("Auth error:", error);
          throw new Error(
            error instanceof Error ? error.message : "Authentication error"
          );
          }
        },
      }),
    ],
    session: {
      strategy: "jwt",
      maxAge: 30 * 24 * 60 * 60, // 30 days
      // Explicitly set cookie path to '/'
      updateAge: 24 * 60 * 60, // 24 hours
    },
    cookies: {
      sessionToken: {
        name: process.env.NODE_ENV === "production"
          ? "__Secure-next-auth.session-token"
          : "next-auth.session-token",
        options: {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
        },
      },
    },
    secret: process.env.NEXTAUTH_SECRET,
    pages: {
      signIn: "/auth/signin",
      error: "/auth/error",
    },
    callbacks: {
      async jwt({ token, user, trigger, session }) {
        // Initial sign in
        if (user) {
          token.id = user.id;
          token.email = user.email;
          token.name = user.name;
          token.role = user.role as string | undefined;
          console.log("[NextAuth][JWT Callback] Set token role:", token.role);
        }

        // Handle updates to the session
        if (trigger === "update" && session) {
          if (session.user) {
            token.name = session.user.name;
            token.email = session.user.email;
            // Do not update role here to avoid accidental removal
          }
        }

        // Always log token on callback
        console.log("[NextAuth][JWT Callback] Token:", token);
        return token;
      },
      async session({ session, token }) {
        if (session.user) {
          session.user.id = token.id as string;
          session.user.name = token.name as string;
          session.user.email = token.email as string;
          session.user.role = token.role as string | undefined;
          console.log("[NextAuth][Session Callback] Set session user role:", session.user.role);
        }
        // Always log session on callback
        console.log("[NextAuth][Session Callback] Session:", session);
        return session;
      },
    },
    debug: process.env.NODE_ENV === "development",
  };
