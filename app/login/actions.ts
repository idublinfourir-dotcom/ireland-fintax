"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "../../auth";
import { usersCollection } from "../lib/collections";
import { AUTH_NOT_CONFIGURED, isAuthConfigured } from "../lib/auth/config";

export interface AuthState {
  error?: string;
  values?: { email?: string };
}

/** Only same-origin relative paths — blocks open-redirects via `next`. */
function isSafe(path: string) {
  return path.startsWith("/") && !path.startsWith("//");
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

  // Honor an explicit, safe redirect (set when the user was gated). Otherwise
  // route by role: admins land on /admin, everyone else on /portal.
  if (requestedNext && isSafe(requestedNext)) {
    redirect(requestedNext);
  }

  redirect(account?.role === "admin" ? "/admin" : "/portal");
}
