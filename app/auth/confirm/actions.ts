"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "../../../auth";
import { isAuthConfigured } from "../../lib/auth/config";
import { safeRedirectOr } from "../../lib/safe-redirect";

/**
 * Redeems the signup confirmation token from the button on /auth/confirm:
 * marks the address proved, starts the session and claims any matching guest
 * enquiries (the `signIn` event in auth.ts), then forwards the user on.
 *
 * Only a POST spends the token. Opening the link (a GET) shows the button, so
 * mail scanners that open every link in advance (Outlook Safe Links,
 * Mimecast) no longer use it up before the person clicks.
 */
export async function confirmEmailAction(formData: FormData) {
  const token = String(formData.get("token") ?? "");
  const next = safeRedirectOr(String(formData.get("next") ?? ""), "/portal");

  // No backend: no token could have been issued, so there is nothing to verify.
  if (!isAuthConfigured()) {
    console.error("[auth] confirm: no authentication backend configured");
    redirect("/login?notice=confirm");
  }

  /* Every failure lands on the same /login?notice=confirm screen, so this log
     is the only way to tell them apart afterwards. Never log the token itself:
     it is a single-use credential. */
  let confirmed = false;
  if (token) {
    try {
      const result = await signIn("verify-email", { token, redirect: false });
      if (typeof result === "string" && result.includes("error=")) {
        console.error("[auth] confirm: the token was rejected");
      } else {
        confirmed = true;
      }
    } catch (err) {
      if (!(err instanceof AuthError)) throw err;
      console.error("[auth] confirm: could not redeem the token", { type: err.type });
    }
  } else {
    console.error("[auth] confirm: posted with no token");
  }

  redirect(confirmed ? next : "/login?notice=confirm");
}
