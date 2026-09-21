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

  // One lookup, used either way: to say WHICH failure it was, or to route by
  // role. Reading the account directly rather than re-reading the session keeps
  // this independent of the cookie that was just written.
  const users = await usersCollection();
  const account = await users.findOne(
    { email: email.toLowerCase() },
    { projection: { role: 1, emailVerified: 1 } },
  );

  if (failed) {
    return {
      error:
        account && !account.emailVerified
          ? "Email not confirmed. Check your inbox for the confirmation link."
          : "Invalid login credentials.",
      values: { email },
    };
  }

  /* Honour an explicit, safe redirect (set when the user was gated). Otherwise
     route by role: admins land on /admin, everyone else on /portal.

     This redirect is RELATIVE, so the destination has to be validated by
     parsing rather than by pattern: see safeRedirectPath. */
  const target = safeRedirectPath(requestedNext);
  if (target) redirect(target);

  redirect(account?.role === "admin" ? "/admin" : "/portal");
}
