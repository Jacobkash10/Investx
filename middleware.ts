import { NextRequest, NextResponse } from "next/server";
import { getSessionCookie } from "better-auth/cookies";

const protectedRoutes = [
  "/dashboard",
  "/market",
  "/portfolio",
  "/orders",
  "/history",
  "/alerts",
  "/watchlist",
  "/profile",
  "/analytics",
];

const authRoutes = [
  "/connexion",
  "/inscription",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = getSessionCookie(request);

  const isProtectedRoute = protectedRoutes.some(
    (route) => pathname.startsWith(route)
  );

  const isAuthRoute = authRoutes.some(
    (route) => pathname.startsWith(route)
  );

  // User non connecté → accès refusé pages privées
  if (isProtectedRoute && !sessionCookie) {
    return NextResponse.redirect(
      new URL("/connexion", request.url)
    );
  }

  // User connecté → empêche accès connexion/inscription
  if (isAuthRoute && sessionCookie) {
    return NextResponse.redirect(
      new URL("/profile", request.url)
    );
  }

  // User connecté → empêche accès à "/"
  if (pathname === "/" && sessionCookie) {
    return NextResponse.redirect(
      new URL("/dashboard", request.url)
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/market/:path*",
    "/portfolio/:path*",
    "/orders/:path*",
    "/history/:path*",
    "/alerts/:path*",
    "/watchlist/:path*",
    "/profile/:path*",
    "/analytics/:path*",

    "/connexion",
    "/inscription",
  ],
};