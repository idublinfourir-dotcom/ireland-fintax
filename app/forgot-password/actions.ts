"use server";

import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn } from "../../auth";
import { usersCollection } from "../lib/collections";
import { allowPublicAction } from "../lib/rate-limit";
import { hashPassword } from "../lib/auth/password";
import {
  clearPasswordResetCodes,
  consumePasswordResetCode,
  createPasswordResetCode,
} from "../lib/auth/reset-tokens";
import { AUTH_NOT_CONFIGURED, isAuthConfigured } from "../lib/auth/config";
import { looksLikeCode, validatePassword } from "../lib/account-validation";
import { sendMail } from "../lib/mailer";
import { resetHtml, resetSubject, resetText } from "../lib/reset-email";
import { site } from "../lib/content";

/* Two actions, not one, because the two steps have different abuse profiles.
   Asking for a code is an email-volume and cost problem; submitting one is a
   brute-force problem. They therefore get separate throttle keys, and merging
   them would force one set of limits onto both. */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Said for a wrong code, an expired one, one already used, and an address
 *  with no account at all.
 *
 *  Deliberately one message for all of them. Telling them apart would reveal
 *  whether a code was ever issued for that address, which is the fact this
 *  whole flow is built to withhold. */
const CODE_REJECTED =
  "That code isn't valid. It may have expired or already been used. Request a new one and try again.";

export interface RequestCodeState {
  error?: string;
  /** Step 1 finished. Says nothing about whether an email was actually sent. */
  sent?: boolean;
  email?: string;
}

export interface CompleteResetState {
  error?: string;
}

/**
 * Issue a code and email it, for an account that exists.
 *
 * Every failure inside is swallowed. Best-effort here, unlike signup, and the
 * difference is deliberate: signup refuses up front when mail is unconfigured
 * because the link is the second half of creating the account, and an account
 * that can never be confirmed is dead. A reset has no half-made state to roll
 * back, and surfacing "we couldn't send it" would confirm the address has an
 * account, undoing the anti-enumeration the caller is built around.
 *
 * Never logs the code. It is a live credential for its whole window.
 */
async function issueAndSend(email: string): Promise<void> {
  const users = await usersCollection();
  const account = await users.findOne(
    { email },
    { projection: { name: 1, emailVerified: 1 } },
  );

  if (!account) {
    console.warn("[reset] no account for the address requested:", email);
    return;
  }

  /* An address that was never confirmed does not get a reset code. Setting a
     password would not help: `authorize` refuses to sign in an unconfirmed
     account, so they would still be locked out, and the way forward is the
     signup form, which reissues the confirmation link. Treating a reset code
     as proof of the address instead would quietly make this a second route to
     `emailVerified`, and that field is the boundary that lets guest enquiries
     be claimed by email. Reset is a password feature; it does not get to move
     an ownership boundary. */
  if (!account.emailVerified) {
    console.warn("[reset] address is not confirmed, no code issued:", email);
    return;
  }

  const code = await createPasswordResetCode(account._id);

  const sent = await sendMail({
    to: email,
    subject: resetSubject(),
    html: resetHtml({ name: account.name ?? "", code, firmName: site.name }),
    text: resetText({ name: account.name ?? "", code, firmName: site.name }),
    logPrefix: "[reset]",
  });

  // Loudly, because the user is told nothing: to them a refused send and a
  // delivered one look the same, by design.
  if (!sent) {
    console.error("[reset] a code was issued but the email was NOT sent:", email);
  }
}

/** Step 1. Answers identically for every address. */
export async function requestResetCode(
  _prev: RequestCodeState,
  formData: FormData,
): Promise<RequestCodeState> {
  const email = String(formData.get("email") ?? "").trim();

  // A malformed address is rejected: it reveals nothing, since it could not
  // belong to an account either way, and it saves a pointless round trip.
  if (!EMAIL_RE.test(email)) {
    return { error: "Please enter a valid email address." };
  }

  if (!isAuthConfigured()) return { error: AUTH_NOT_CONFIGURED };

  const allowed = await allowPublicAction({
    action: "password-reset-request",
    identity: email,
    ip: { max: 10, windowSeconds: 60 * 60 },
    identityLimit: { max: 3, windowSeconds: 60 * 60 },
  });
  if (!allowed) {
    return {
      error: "Too many reset requests. Please wait an hour and try again.",
      email,
    };
  }

  try {
    await issueAndSend(email.toLowerCase());
  } catch (err) {
    // Swallowed on purpose. See issueAndSend.
    console.error("[reset] could not issue a code:", err);
  }

  /* The SAME screen either way: unknown address, unconfirmed address, refused
     send, database error. A reset form that answers differently is an account
     enumeration oracle, and for an accountancy practice the fact it leaks is
     "this person is a client of this firm". */
  return { sent: true, email };
}

/** Step 2. The brute-force boundary. */
export async function resetPasswordWithCode(
  _prev: CompleteResetState,
  formData: FormData,
): Promise<CompleteResetState> {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const code = String(formData.get("code") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  /* Validate the password BEFORE the code is spent. The code is single-use, so
     verifying first and then rejecting the password as too short would burn it
     on a mistake this check catches for free, and the user would have to go
     back to step 1 for a fresh one.

     The validator is the one the settings page uses. Two different minimum
     lengths in one app is a bug, whichever of them is the stricter. */
  const invalid = validatePassword(password, confirm);
  if (invalid) return { error: invalid };

  /* Shape only. Its one job is to keep obvious nonsense from spending a
     throttle attempt; whether the code is right is decided by redeeming it. */
  if (!looksLikeCode(code)) return { error: CODE_REJECTED };

  if (!EMAIL_RE.test(email)) return { error: CODE_REJECTED };
  if (!isAuthConfigured()) return { error: AUTH_NOT_CONFIGURED };

  /* THE brute-force cap. A code short enough to type is only safe while the
     attempts are capped, and this is the visible half of that. The other half
     is the per-code counter in lib/auth/reset-tokens.ts, which exists because
     allowPublicAction fails OPEN when the database errors. */
  const allowed = await allowPublicAction({
    action: "password-reset-verify",
    identity: email,
    ip: { max: 15, windowSeconds: 60 * 60 },
    identityLimit: { max: 5, windowSeconds: 60 * 60 },
  });
  if (!allowed) {
    return {
      error: "Too many attempts. Please wait an hour and request a new code.",
    };
  }

  let role: "admin" | "client" = "client";

  try {
    const users = await usersCollection();
    const account = await users.findOne(
      { email },
      { projection: { role: 1, emailVerified: 1 } },
    );

    // Same message as a wrong code: an unknown address must not be
    // distinguishable from a bad guess.
    if (!account || !account.emailVerified) return { error: CODE_REJECTED };
    if (!(await consumePasswordResetCode(account._id, code))) {
      return { error: CODE_REJECTED };
    }

    role = account.role === "admin" ? "admin" : "client";

    await users.updateOne(
      { _id: account._id },
      {
        $set: {
          passwordHash: await hashPassword(password),
          /* Revokes every session opened before now. A reset assumes the old
             password may be in someone else's hands, so their session is
             exactly the one that should stop working. Sessions are JWTs with
             no row to delete, so this stamp is the mechanism: see the jwt
             callback in auth.ts. */
          passwordChangedAt: new Date(),
        },
      },
    );

    /* The code was consumed above; this clears anything a concurrent request
       issued in the meantime, so the window cannot be reused. Best-effort: the
       password has already changed, which is the part that matters. */
    await clearPasswordResetCodes(account._id);
  } catch (err) {
    console.error("[reset] could not complete the password reset:", err);
    return {
      error: "Couldn't reset your password. Please try again.",
    };
  }

  /* Sign them straight in rather than sending them back to /login to retype
     the password they just chose. This mints a token AFTER the stamp above,
     so it is the only session that survives. */
  let signedIn = false;
  try {
    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });
    signedIn = !(typeof result === "string" && result.includes("error="));
  } catch (err) {
    if (!(err instanceof AuthError)) throw err;
    console.error("[reset] password was reset but sign-in failed:", err.type);
  }

  // `redirect` throws, so it stays outside the try blocks above.
  if (!signedIn) redirect("/login?notice=reset");

  // Same convention as the login action: admins to /admin, everyone else to
  // /portal. Do not invent a second rule for this.
  redirect(role === "admin" ? "/admin" : "/portal");
}
