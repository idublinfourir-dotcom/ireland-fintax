"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "../../auth";
import { usersCollection } from "../lib/collections";
import { AUTH_NOT_CONFIGURED, isAuthConfigured } from "../lib/auth/config";
import { allowPublicAction } from "../lib/rate-limit";
import { safeRedirectPath } from "../lib/safe-redirect";

export interface AuthState {
  error?: string;
  values?: { email?: string };
}

/* Said for a wrong password, an unknown address and an unconfirmed one alike.

   The confirmation hint is given to EVERYONE rather than only to accounts that
   really are unconfirmed. Naming that case was friendlier and was an
   enumeration oracle: a different message for "this address exists but is not
   confirmed" confirms the address is registered. On a practice's site the fact
   that leaks is "this person is a client of this firm", so the hint is worth
   keeping only if it costs nothing to say, which it does when it is
   unconditional. `authorize` is written to be silent for the same reason; this
   is the other half of that. */
const LOGIN_REJECTED =
  "Invalid login credentials. If you've just signed up, check your inbox (and your spam folder) for the confirmation link.";

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return { error: "Enter your email and password.", values: { email } };
  }

  if (!isAuthConfigured()) {
    return { error: AUTH_NOT_CONFIGURED, values: { email } };
  }

  /* The brute-force cap on the front door. bcrypt at cost 12 makes each guess
     expensive but not prohibitive, and nothing else limited this: signup, the
     contact form and both halves of the password reset were throttled while
     the login form itself was not.

     Counts every attempt, not only failures, which is how the rest of the app
     uses this helper. The per-identity cap is deliberately the looser of the
     two so a stranger cannot cheaply lock a real client out of their own
     account by burning it; the window is short for the same reason. */
  const allowed = await allowPublicAction({
    action: "login",
    identity: email,
    ip: { max: 50, windowSeconds: 15 * 60 },
    identityLimit: { max: 10, windowSeconds: 15 * 60 },
  });
  if (!allowed) {
    return {
      error: "Too many sign-in attempts. Please wait a few minutes and try again.",
      values: { email },
    };
  }

  /* `authorize` returns null for a wrong password, an unknown address and an
     unconfirmed one alike, so it cannot be used to probe which accounts exist.
     Auth.js reports that as a thrown AuthError; some builds instead hand back
     the error URL, so both signals are treated as a failure. */
  let failed = false;
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (typeof result === "string" && result.includes("error=")) failed = true;
  } catch (err) {
    if (!(err instanceof AuthError)) throw err;
    failed = true;
  }

  /* Answer before looking anything up. The old code read the account first so
     it could say which failure it was, which is exactly the leak described on
     LOGIN_REJECTED. Nothing about the account is needed to reject. */
  if (failed) return { error: LOGIN_REJECTED, values: { email } };

  // Only now, on success, and only for the role. Reading the account directly
  // rather than re-reading the session keeps this independent of the cookie
  // that was just written.
  const users = await usersCollection();
  const account = await users.findOne(
    { email: email.toLowerCase() },
    { projection: { role: 1 } },
  );

  /* Honour an explicit, safe redirect (set when the user was gated). Otherwise
     route by role: admins land on /admin, everyone else on /portal.

     This redirect is RELATIVE, so the destination has to be validated by
     parsing rather than by pattern: see safeRedirectPath. */
  const target = safeRedirectPath(requestedNext);
  if (target) redirect(target);

  redirect(account?.role === "admin" ? "/admin" : "/portal");
}
