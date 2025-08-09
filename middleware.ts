import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

const PRIVATE_ROUTES = [
  "/wishlist",
  "/cart",
  "/profile",
  "/admin"
];

export async function middleware(request: NextRequest) {
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  });

  const pathname = request.nextUrl.pathname;
  const isPrivateRoute = PRIVATE_ROUTES.some((route) => pathname === route || pathname.startsWith(route + "/"));
  const isAdminRoute = pathname.startsWith("/admin");
  const isArticlesAdminRoute = pathname.startsWith("/admin/articles");

  if (isPrivateRoute) {
    if (!token) {
      const callbackUrl = encodeURIComponent(request.nextUrl.pathname + request.nextUrl.search);
      const signinUrl = new URL(`/auth/signin?callbackUrl=${callbackUrl}&reason=auth-required`, request.url);
      return NextResponse.redirect(signinUrl);
    }
    if (isAdminRoute) {
      const role = token.role as string | undefined;
      const isJournalistAllowedHere = isArticlesAdminRoute && role === "journalist";
      const isAdmin = role === "admin";
      if (!isAdmin && !isJournalistAllowedHere) {
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/wishlist/:path*", "/cart/:path*", "/profile/:path*", "/admin/:path*"],
};
