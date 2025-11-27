import { NextAuthOptions } from "next-auth";
import { getServerSession } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";
import connectDB from "@/lib/db";
import User from "@/lib/models/User";
import mongoose from "mongoose";

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
          
          // Log database connection info (without exposing credentials)
          const dbUri = process.env.MONGODB_URI || '';
          const dbHost = dbUri.includes('@') 
            ? dbUri.split('@')[1]?.split('/')[0] || 'unknown'
            : 'unknown';
          console.log(`[Auth] Database host: ${dbHost}`);
          
          // For authentication, ensure we read from primary to avoid stale data
          // This is critical for password verification
          const mongoose = await import('mongoose');
          const readPreference = mongoose.connection.getClient().readPreference;
          console.log(`[Auth] Read preference: ${readPreference?.mode || 'default'}`);

          // Normalize email to lowercase to match schema behavior
          const normalizedEmail = credentials.email.toLowerCase().trim();
          
          // Get user document - use lean() to get plain object and ensure password is included
          // This bypasses any Mongoose schema transformations that might exclude the password
          const userDoc: any = await User.findOne({ email: normalizedEmail }).lean();
          
          if (!userDoc) {
            console.error(`[Auth] User not found for email: ${normalizedEmail}`);
            throw new Error("No user found with this email");
          }
          
          // Access password directly from the lean document
          const userPassword: string | undefined = userDoc.password;
          
          // Log what we found
          if (!userPassword) {
            console.error(`[Auth] ⚠️ Password field is missing from user document!`);
            console.error(`[Auth] Available fields:`, Object.keys(userDoc));
            throw new Error("Invalid password");
          }
          
          console.log(`[Auth] Password field retrieved successfully (length: ${userPassword.length})`);
          
          // Also get user data for return value
          const user = {
            _id: (userDoc as any)._id,
            email: (userDoc as any).email,
            name: (userDoc as any).name,
            role: (userDoc as any).role,
          };
          
          // Check if user has a password (for OAuth users who might not have passwords)
          if (!userPassword) {
            console.error(`[Auth] User ${normalizedEmail} has no password set`);
            console.error(`[Auth] User document keys:`, Object.keys(userDoc));
            throw new Error("Invalid password");
          }
          
          // Ensure password is a string and not undefined/null
          // Don't trim the hash - bcrypt hashes should not be trimmed
          const storedPasswordHash = String(userPassword);
          
          // Log the actual hash (first 20 chars) for debugging
          console.log(`[Auth] Retrieved password hash (first 20 chars): ${storedPasswordHash.substring(0, 20)}...`);
          if (!storedPasswordHash || storedPasswordHash.length === 0) {
            console.error(`[Auth] Password hash is empty or invalid for user: ${normalizedEmail}`);
            throw new Error("Invalid password");
          }

          // Diagnostic logging (without exposing sensitive data)
          const passwordHashLength = storedPasswordHash.length;
          const passwordHashPrefix = storedPasswordHash.substring(0, 10);
          console.log(`[Auth] Attempting password validation for: ${normalizedEmail}`);
          console.log(`[Auth] Stored password hash length: ${passwordHashLength}, prefix: ${passwordHashPrefix}...`);
          console.log(`[Auth] User ID: ${user._id}, Role: ${user.role}`);
          console.log(`[Auth] Database connection: ${process.env.MONGODB_URI ? 'Connected' : 'Not configured'}`);
          
          // Check if password hash looks valid (bcrypt hashes start with $2a$, $2b$, or $2y$)
          const isValidHashFormat = storedPasswordHash.startsWith('$2');
          if (!isValidHashFormat) {
            console.error(`[Auth] ⚠️ WARNING: Password hash format is invalid - doesn't start with $2`);
            console.error(`[Auth] Hash starts with: ${storedPasswordHash.substring(0, 5)}`);
            console.error(`[Auth] This might indicate the password was stored incorrectly or is plain text`);
            throw new Error("Invalid password");
          }
          
          // Get the raw password input (before any processing)
          const rawPassword = credentials.password;
          const trimmedPassword = rawPassword.trim();
          
          // Log password details (without exposing the actual password)
          console.log(`[Auth] Raw password length: ${rawPassword.length}`);
          console.log(`[Auth] Trimmed password length: ${trimmedPassword.length}`);
          console.log(`[Auth] Raw password === Trimmed password: ${rawPassword === trimmedPassword}`);
          
          // Check for any non-printable characters or encoding issues
          const rawPasswordBytes = Buffer.from(rawPassword, 'utf8').toString('hex');
          const trimmedPasswordBytes = Buffer.from(trimmedPassword, 'utf8').toString('hex');
          console.log(`[Auth] Raw password hex (first 24 chars): ${rawPasswordBytes.substring(0, 24)}...`);
          console.log(`[Auth] Trimmed password hex (first 24 chars): ${trimmedPasswordBytes.substring(0, 24)}...`);
          
          // Also log the stored hash hex for comparison
          const storedHashHex = Buffer.from(storedPasswordHash, 'utf8').toString('hex');
          console.log(`[Auth] Stored hash hex (first 24 chars): ${storedHashHex.substring(0, 24)}...`);
          
          // Try password comparison with multiple approaches
          let isPasswordValid = false;
          const comparisonAttempts: string[] = [];
          
          // Test 1: Trimmed password (most common)
          try {
            const result = await bcrypt.compare(trimmedPassword, storedPasswordHash);
            comparisonAttempts.push(`trimmed: ${result}`);
            if (result) {
              isPasswordValid = true;
              console.log(`[Auth] ✅ Password validated successfully (trimmed)`);
            } else {
              console.log(`[Auth] ❌ Password comparison failed (trimmed)`);
            }
          } catch (compareError: any) {
            comparisonAttempts.push(`trimmed: ERROR - ${compareError.message}`);
            console.error(`[Auth] Error comparing trimmed password:`, compareError);
          }
          
          // Test 2: Raw password (if different from trimmed)
          if (!isPasswordValid && rawPassword !== trimmedPassword) {
            try {
              const result = await bcrypt.compare(rawPassword, storedPasswordHash);
              comparisonAttempts.push(`raw: ${result}`);
              if (result) {
                isPasswordValid = true;
                console.log(`[Auth] ✅ Password validated successfully (raw)`);
              } else {
                console.log(`[Auth] ❌ Password comparison failed (raw)`);
              }
            } catch (compareError: any) {
              comparisonAttempts.push(`raw: ERROR - ${compareError.message}`);
              console.error(`[Auth] Error comparing raw password:`, compareError);
            }
          }
          
          // Test 3: Normalized password (Unicode normalization)
          if (!isPasswordValid) {
            try {
              const normalizedPassword = rawPassword.normalize('NFKC');
              const result = await bcrypt.compare(normalizedPassword, storedPasswordHash);
              comparisonAttempts.push(`normalized: ${result}`);
              if (result) {
                isPasswordValid = true;
                console.log(`[Auth] ✅ Password validated successfully (normalized)`);
              } else {
                console.log(`[Auth] ❌ Password comparison failed (normalized)`);
              }
            } catch (compareError: any) {
              comparisonAttempts.push(`normalized: ERROR - ${compareError.message}`);
              console.error(`[Auth] Error comparing normalized password:`, compareError);
            }
          }
          
          // Log all comparison attempts
          console.log(`[Auth] All comparison attempts:`, comparisonAttempts);
          
          // Additional diagnostic: Try to hash the input password and compare hashes
          // (This won't work for validation, but helps debug if there's a bcrypt version issue)
          try {
            const testHash = await bcrypt.hash(trimmedPassword, 10);
            console.log(`[Auth] Test hash of input password (first 20 chars): ${testHash.substring(0, 20)}...`);
            console.log(`[Auth] Stored hash format matches test hash format: ${testHash.substring(0, 7) === storedPasswordHash.substring(0, 7)}`);
          } catch (hashError) {
            console.error(`[Auth] Error creating test hash:`, hashError);
          }
          
          if (!isPasswordValid) {
            console.error(`[Auth] ❌ Password validation failed for email: ${normalizedEmail}`);
            console.error(`[Auth] Hash format valid: ${isValidHashFormat}`);
            console.error(`[Auth] Tried: trimmed, raw, and normalized password inputs`);
            console.error(`[Auth] Possible causes:`);
            console.error(`[Auth] 1. Password in database doesn't match the provided password`);
            console.error(`[Auth] 2. Password was changed in production but not synced locally`);
            console.error(`[Auth] 3. Character encoding mismatch`);
            console.error(`[Auth] 4. Database connection issue (check MONGODB_URI)`);
            throw new Error("Invalid password");
          }

          console.log(`[Auth] Successfully authenticated user: ${normalizedEmail}`);

          return {
            id: String(user._id),
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
