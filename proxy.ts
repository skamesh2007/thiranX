import { NextRequest, NextResponse } from "next/server";

const PROTECTED_ROUTES = ["/dashboard", "/leetcode", "/roadmap", "/chat"];
const AUTH_ROUTES = ["/auth/login", "/auth/register"];

export function proxy(req: NextRequest) {
  const token = req.cookies.get("token")?.value;
  const { pathname } = req.nextUrl;

  const isProtected = PROTECTED_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isAuthRoute = AUTH_ROUTES.some((route) =>
    pathname.startsWith(route)
  );
  const isRoot = pathname === "/";

  // Root: redirect based on auth state
  if (isRoot) {
    return NextResponse.redirect(
      new URL(token ? "/dashboard" : "/auth/login", req.url)
    );
  }

  // Protected page without token → login
  if (isProtected && !token) {
    return NextResponse.redirect(new URL("/auth/login", req.url));
  }

  // Auth pages with token → dashboard
  if (isAuthRoute && token) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/dashboard/:path*",
    "/leetcode/:path*",
    "/roadmap/:path*",
    "/chat/:path*",
    "/auth/:path*",
    "/profile/:path*",
  ],
};