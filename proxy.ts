import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import authConfig from "./auth.config";
import { isAuthConfigured } from "./app/lib/auth/config";

/* Next 16 middleware. Two jobs: gate the authenticated areas, and stamp a
 * per-request Content-Security-Policy nonce on every document.
 *
 * Built from ./auth.config only — never from ./auth, which pulls in the
 * MongoDB driver and bcrypt and cannot run on the edge. That is enough to
 * VERIFY the session JWT, which is all the gate needs; role checks happen in
 * the /admin and /portal layouts, which run in the Node runtime.
 *
 * There is no session to refresh here — the JWT is self-contained, so the
 * middleware only ever reads it. */

const { auth } = NextAuth(authConfig);

const PROTECTED = ["/portal", "/admin"];

const isDev = process.env.NODE_ENV !== "production";

/**
 * The policy, bound to one request's nonce.
 *
 * `script-src` no longer carries 'unsafe-inline'. That directive is what makes
 * a CSP worth having against injected script, and while nothing in this app
 * writes raw HTML today, a policy that permits any inline script is one bad
 * component away from being decorative.
 *
 * 'strict-dynamic' lets the one nonced bootstrap tag load Next's own chunks
 * without enumerating them. Browsers that honour it ignore 'self' in this
 * directive, which is the point: the allow-list stops mattering and only
 * scripts this server vouched for run. 'self' stays for older browsers.
 *
 * `style-src` keeps 'unsafe-inline' deliberately. React and Tailwind both set
 * style attributes at runtime, nonces do not apply to those, and removing it
 * breaks rendering rather than hardening anything. Injected CSS is a far
 * smaller problem than injected script.
 *
 * `connect-src` is 'self' alone: the database is reached server-side only, and
 * Google sign-in is a full-page redirect through this app's own
 * /api/auth/callback/google, not a cross-origin fetch.
 */
function policyFor(nonce: string): string {
  return [
    `default-src 'self'`,
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic'${isDev ? " 'unsafe-eval'" : ""}`,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: blob: https://lh3.googleusercontent.com https://images.unsplash.com`,
    `font-src 'self'`,
    `connect-src 'self'${isDev ? " ws: http://localhost:*" : ""}`,
    `frame-ancestors 'none'`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    ...(isDev ? [] : [`upgrade-insecure-requests`]),
  ]
    .join("; ")
    .replace(/\s+/g, " ")
    .trim();
}

export const proxy = auth((request) => {
  /* A fresh value per request: a nonce that repeats is an allow-list entry an
     attacker can aim at. */
  const nonce = btoa(crypto.randomUUID());
  const csp = policyFor(nonce);

  const { pathname } = request.nextUrl;
  const needsAuth = PROTECTED.some((p) => pathname.startsWith(p));

  if (needsAuth) {
    // No backend configured: nobody can be signed in, so send the protected
    // areas to /login rather than letting the page try to read a session.
    const signedIn = isAuthConfigured() && Boolean(request.auth?.user);
    if (!signedIn) {
      const url = request.nextUrl.clone();
      url.pathname = "/login";
      url.searchParams.set("next", pathname);
      const bounced = NextResponse.redirect(url);
      bounced.headers.set("Content-Security-Policy", csp);
      return bounced;
    }
  }

  /* The policy goes on the REQUEST as well as the response. That is not
     belt-and-braces: Next reads the nonce back out of this request header to
     stamp its own bootstrap <script>, and without it the tag ships unnonced
     and the page dies under its own policy. */
  const headers = new Headers(request.headers);
  headers.set("x-nonce", nonce);
  headers.set("Content-Security-Policy", csp);

  const response = NextResponse.next({ request: { headers } });
  response.headers.set("Content-Security-Policy", csp);
  return response;
});

export const config = {
  /* Everything that returns a document, which is wider than the gate needs:
     the policy has to reach pages the auth check does not care about. Static
     assets and image optimiser output are skipped — a CSP on a .js file or a
     .png means nothing, and running middleware for them is pure latency. */
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icon.svg|robots.txt|sitemap.xml).*)",
  ],
};
