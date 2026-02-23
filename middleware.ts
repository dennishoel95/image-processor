import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { hashPassword } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const appPassword = process.env.APP_PASSWORD;

  // If no password is configured, allow access (local dev without password)
  if (!appPassword) {
    return NextResponse.next();
  }

  const authCookie = request.cookies.get("auth-token")?.value;
  const expectedToken = await hashPassword(appPassword);

  const isAuthenticated = authCookie === expectedToken;
  const isLoginPage = request.nextUrl.pathname === "/login";
  const isAuthApi = request.nextUrl.pathname.startsWith("/api/auth");

  // Allow access to login page and auth API
  if (isLoginPage || isAuthApi) {
    // If already authenticated and trying to access login, redirect to home
    if (isAuthenticated && isLoginPage) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all paths except static files and Next.js internals
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
