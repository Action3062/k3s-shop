import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

// Eigene NextAuth-Instanz nur mit der edge-sicheren Config (kein prisma/bcrypt).
const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const { nextUrl } = req;
  const path = nextUrl.pathname;
  const isLoggedIn = !!req.auth;
  const isDashboard = path.startsWith("/dashboard");
  const isAuthPage = path === "/login" || path === "/signup";

  // Bereits eingeloggt + Login/Signup -> direkt ins Dashboard (kein doppelter Login)
  if (isLoggedIn && isAuthPage) {
    return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  // Nicht eingeloggt + geschützte Route -> Login mit Rücksprungziel
  if (!isLoggedIn && isDashboard) {
    const url = new URL("/login", nextUrl);
    url.searchParams.set("callbackUrl", path);
    return NextResponse.redirect(url);
  }
  // Admin-Bereich zusätzlich rollenbasiert sperren
  if (isDashboard && path.startsWith("/dashboard/admin")) {
    const role = (req.auth?.user as { role?: string } | undefined)?.role;
    if (role !== "ADMIN") return NextResponse.redirect(new URL("/dashboard", nextUrl));
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
