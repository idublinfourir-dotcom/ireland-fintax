import { type NextRequest, NextResponse } from "next/server";
import { auth } from "../../../auth";
import { isAuthConfigured } from "../../lib/auth/config";
import { safeRedirectPath } from "../../lib/safe-redirect";
import { DEFAULT_LOCALE, isLocale, localeHref } from "../../lib/i18n";

/**
 * Post-Google landing route: routes by role, admins to /admin and everyone
 * else to /portal: unless an explicit safe `next` was carried through.
 *
 * The PKCE exchange itself is no longer done here. Google now redirects to
 * Auth.js' own handler at /api/auth/callback/google, which mints the session
 * and creates the account on a first sign-in; the button sends users on to
 * this route afterwards because only the server knows which area to land them
 * in. Guest enquiries are claimed by the `signIn` event in auth.ts.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);

  const next = safeRedirectPath(searchParams.get("next"));
  // The language the sign-in started in (GoogleButton passes it along).
  const lang = searchParams.get("lang") ?? "";
  const locale = isLocale(lang) ? lang : DEFAULT_LOCALE;
  const go = (path: string) => NextResponse.redirect(`${origin}${localeHref(locale, path)}`);

  // No backend: nothing can have issued a session. Bounce to the same notice
  // screen every other OAuth failure lands on.
  if (!isAuthConfigured()) {
    console.error("[auth] oauth: no authentication backend configured");
    return go("/login?notice=oauth");
  }

  const session = await auth();
  if (!session?.user) {
    /* Reached with no session: the provider errored, the user cancelled, or
       this URL was opened directly. They are indistinguishable from here, so
       grep "[auth] oauth" alongside Auth.js' own error logs. */
    console.error("[auth] oauth: callback reached with no session", {
      referer: request.headers.get("referer"),
    });
    return go("/login?notice=oauth");
  }

  if (next) return go(next);

  return go(session.user.role === "admin" ? "/admin" : "/portal");
}
