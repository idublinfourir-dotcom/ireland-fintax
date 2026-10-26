"use server";

import { redirect } from "next/navigation";
import { localePath } from "../lib/messages";
import { AuthError, CredentialsSignin } from "next-auth";
import { SIGN_IN_RATE_LIMITED, signIn } from "../../auth";
import { usersCollection } from "../lib/collections";
import { isAuthConfigured } from "../lib/auth/config";
import { safeRedirectPath } from "../lib/safe-redirect";
import { getT } from "../lib/messages";
import { accountMessages } from "../lib/messages/account";

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

export async function login(
  _prev: AuthState,
  formData: FormData,
): Promise<AuthState> {
  const t = (await getT(accountMessages)).errors;
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const requestedNext = String(formData.get("next") ?? "").trim();

  if (!email || !password) {
    return { error: t.enterBoth, values: { email } };
  }

  if (!isAuthConfigured()) {
    return { error: t.notConfigured, values: { email } };
  }

  /* `authorize` returns null for a wrong password, an unknown address and an
     unconfirmed one alike, so it cannot be used to probe which accounts exist.
     Auth.js reports that as a thrown AuthError; some builds instead hand back
     the error URL, so both signals are treated as a failure. */
  let failed = false;
  let limited = false;
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    if (typeof result === "string" && result.includes("error=")) {
      failed = true;
      limited = result.includes(`code=${SIGN_IN_RATE_LIMITED}`);
    }
  } catch (err) {
    if (!(err instanceof AuthError)) throw err;
    failed = true;
    limited = err instanceof CredentialsSignin && err.code === SIGN_IN_RATE_LIMITED;
  }

  // The brute-force cap is in `authorize` (auth.ts), so it also covers Auth.js's
  // own credentials endpoint; it reports itself with this code.
  if (limited) return { error: t.tooManySignIns, values: { email } };

  /* Answer before looking anything up. The old code read the account first so
     it could say which failure it was, which is exactly the leak described on
     t.loginRejected. Nothing about the account is needed to reject. */
  if (failed) return { error: t.loginRejected, values: { email } };

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
  if (target) redirect(await localePath(target));

  redirect(await localePath(account?.role === "admin" ? "/admin" : "/portal"));
}
