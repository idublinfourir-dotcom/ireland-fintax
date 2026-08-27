import { type NextRequest, NextResponse } from "next/server";
import { AuthError } from "next-auth";
import { signIn } from "../../../auth";
import { isAuthConfigured } from "../../lib/auth/config";

/**
 * Email-confirmation landing route. The signup email links here with a
 * single-use `token`; redeeming it marks the address proved, establishes the
 * session and claims any matching guest enquiries (the `signIn` event in
 * auth.ts), then forwards the user on.
 *
 * The token is issued and redeemed by this app — see app/lib/auth/tokens.ts.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const token = searchParams.get("token");
  const next = searchParams.get("next") ?? "/portal";
  const safeNext =
    next.startsWith("/") && !next.startsWith("//") ? next : "/portal";

  // No backend: no token could have been issued, so there is nothing to verify.
  if (!isAuthConfigured()) {
    console.error("[auth] confirm: no authentication backend configured");
    return NextResponse.redirect(`${origin}/login?notice=confirm`);
  }

  if (token) {
    /* Every failure below lands on the same /login?notice=confirm screen, so
       this log is the only way to tell them apart afterwards. Never log the
       token itself — it is a single-use credential. */
    try {
      const result = await signIn("verify-email", { token, redirect: false });
      if (typeof result === "string" && result.includes("error=")) {
        console.error("[auth] confirm: the token was rejected");
      } else {
        return NextResponse.redirect(`${origin}${safeNext}`);
      }
    } catch (err) {
      if (!(err instanceof AuthError)) throw err;
      console.error("[auth] confirm: could not redeem the token", {
        type: err.type,
      });
    }
  } else {
    console.error("[auth] confirm: hit with no token", {
      referer: request.headers.get("referer"),
    });
  }

  return NextResponse.redirect(`${origin}/login?notice=confirm`);
}
