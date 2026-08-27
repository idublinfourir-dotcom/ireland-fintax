import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";
import { isAuthConfigured } from "./app/lib/auth/config";

/* Next 16 middleware: gates the authenticated areas.
 *
 * Built from ./auth.config only — never from ./auth, which pulls in the
 * MongoDB driver and bcrypt and cannot run on the edge. That is enough to
 * VERIFY the session JWT, which is all the gate needs; role checks happen in
 * the /admin and /portal layouts, which run in the Node runtime.
 *
 * Unlike the Supabase version this replaces, there is no session to refresh
 * here — the JWT is self-contained, so the middleware only reads it. */

const { auth } = NextAuth(authConfig);

const PROTECTED = ["/portal", "/admin"];

export const proxy = auth((request) => {
  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));
  if (!needsAuth) return NextResponse.next();

  // No backend configured: nobody can be signed in, so send the protected
  // areas to /login rather than letting the page try to read a session.
  const signedIn = isAuthConfigured() && Boolean(request.auth?.user);
  if (signedIn) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/login";
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
});

export const config = {
  // Only the authenticated areas need gating. Marketing, login and signup
  // pages skip the proxy entirely.
  matcher: ["/portal/:path*", "/admin/:path*"],
};
