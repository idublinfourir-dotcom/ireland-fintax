"use server";

import { headers } from "next/headers";
import { ObjectId } from "mongodb";
import { usersCollection } from "../lib/collections";
import { allowPublicAction } from "../lib/rate-limit";
import { hashPassword } from "../lib/auth/password";
import { createVerificationToken } from "../lib/auth/tokens";
import {
  AUTH_NOT_CONFIGURED,
  isAuthConfigured,
  isGoogleEnabled,
  isSignupEmailConfigured,
  roleForEmail,
} from "../lib/auth/config";
import { sendMail } from "../lib/mailer";
import {
  confirmHtml,
  confirmSubject,
  confirmText,
} from "../lib/signup-email";
import {
  existingAccountHtml,
  existingAccountSubject,
  existingAccountText,
} from "../lib/signup-existing-email";
import { resolveEmailOrigin } from "../lib/site-origin";
import { site } from "../lib/content";

export interface SignupState {
  error?: string;
  /** Every address that got as far as the lookup ends here, whether an account
      was created, an existing unconfirmed one had its link reissued, or a
      confirmed one was told by email that it already exists. The three are
      deliberately indistinguishable: see the note on `signup`. */
  checkEmail?: boolean;
  values?: { email?: string; fullName?: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Where the confirmation link points. AUTH_URL wins when it is set, so a
    deployed link always carries the canonical host; the Origin header is the
    local fallback. See resolveEmailOrigin for why that order and not the
    reverse. */
async function siteOrigin(): Promise<string> {
  const headerStore = await headers();
  return resolveEmailOrigin({
    configured: process.env.AUTH_URL,
    originHeader: headerStore.get("origin"),
    fallback: site.url,
  });
}

/**
 * Issue a confirmation token and email the link.
 *
 * Best-effort, like every other mail this app sends: a failure is logged and
 * the caller still reports "check your email", because the alternative is
 * leaving a half-created account behind with no way to finish. The user can
 * submit the form again to get a fresh link.
 */
async function sendConfirmationEmail(
  userId: ObjectId,
  email: string,
  fullName: string,
): Promise<void> {
  const token = await createVerificationToken(userId);
  const origin = await siteOrigin();

  const input = {
    name: fullName,
    verifyUrl: `${origin}/auth/confirm?token=${token}`,
    firmName: site.name,
  };

  await sendMail({
    to: email,
    subject: confirmSubject(),
    html: confirmHtml(input),
    text: confirmText(input),
    logPrefix: "[signup]",
  });
}

/**
 * Tell the address itself that it already has an account.
 *
 * The form cannot say this, so the detail goes where only the owner can read
 * it. They submitted a signup form and are owed an explanation for why the
 * password they just chose will not work.
 *
 * Best-effort, like the confirmation link: the caller shows the same screen
 * either way, because a visible send failure would confirm the address exists
 * just as loudly as the old error message did.
 */
async function sendExistingAccountEmail(
  email: string,
  name: string,
): Promise<void> {
  const origin = await siteOrigin();
  const input = {
    name,
    loginUrl: `${origin}/login`,
    resetUrl: `${origin}/forgot-password`,
    firmName: site.name,
  };

  await sendMail({
    to: email,
    subject: existingAccountSubject(),
    html: existingAccountHtml(input),
    text: existingAccountText(input),
    logPrefix: "[signup]",
  });
}

export async function signup(
  _prev: SignupState,
  formData: FormData,
): Promise<SignupState> {
  const fullName = String(formData.get("full_name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const values = { email, fullName };

  if (fullName.length < 2) return { error: "Please tell us your name.", values };
  if (!EMAIL_RE.test(email))
    return { error: "Please enter a valid email address.", values };
  if (password.length < 8)
    return { error: "Password must be at least 8 characters.", values };

  if (!isAuthConfigured()) return { error: AUTH_NOT_CONFIGURED, values };

  /* Refuse before writing anything. The confirmation link is the second half
     of this flow, not a nicety: without it the account is created, cannot be
     confirmed, and therefore can never sign in — while the form cheerfully
     says "check your email". Better to say so than to leave a dead account
     behind and blame the user's inbox. */
  if (!isSignupEmailConfigured()) {
    return {
      error: isGoogleEnabled()
        ? "Email sign-up is unavailable right now — we can’t send the confirmation link. Use “Continue with Google” instead."
        : "Sign-up is unavailable right now — we can’t send the confirmation link. Please contact us and we’ll set your account up.",
      values,
    };
  }

  const allowed = await allowPublicAction({
    action: "signup",
    identity: email,
    ip: { max: 5, windowSeconds: 60 * 60 },
    identityLimit: { max: 3, windowSeconds: 60 * 60 },
  });
  if (!allowed) {
    return {
      error:
        "Too many account creation attempts. Please wait an hour and try again.",
      values,
    };
  }

  // Emails are stored lowercased — the unique index on them is the account
  // boundary, and Auth.js' adapter looks accounts up by exact match.
  const normalisedEmail = email.toLowerCase();

  /* Hashed BEFORE the lookup, so every branch below pays the same ~250ms.
     Doing it only on the create path made a new address measurably slower
     than a registered one, which is the same fact the error messages used to
     give away, just told by the clock instead. */
  const passwordHash = await hashPassword(password);

  try {
    const users = await usersCollection();
    const existing = await users.findOne({ email: normalisedEmail });

    /* Already registered and confirmed. No second account, and the form says
       nothing about it: the old "an account with this email already exists"
       answered a stranger's question about who banks with this firm. The real
       owner is told the same thing by email, where only they can read it. */
    if (existing?.emailVerified) {
      await sendExistingAccountEmail(
        normalisedEmail,
        existing.name ?? fullName,
      );
      return { checkEmail: true, values };
    }

    if (existing) {
      /* Registered but never confirmed. No second account is created, and the
         name and password hash on this one are deliberately left ALONE.

         Overwriting them, which is what this did originally, is an account
         takeover primitive. Whoever submits this form has not proved they own
         the address: Mallory submits Alice's address with a password Mallory
         chooses, the hash on Alice's pending account becomes Mallory's, Alice
         gets a confirmation mail that looks like the one she was waiting for
         and clicks it, and confirmation stamps emailVerified. Mallory can now
         sign in as Alice with the password she set. Reissuing the link is safe
         because it only ever goes to the address on the account; rewriting the
         credentials is not.

         So the remedy is the resend alone, which is also exactly what the real
         owner needs when the first message went to spam. */
      await sendConfirmationEmail(
        existing._id,
        normalisedEmail,
        existing.name ?? fullName,
      );
      // Same screen as a brand-new signup. Saying "already registered but not
      // confirmed" named the address just as precisely as the error above did.
      return { checkEmail: true, values };
    }

    const userId = new ObjectId();
    await users.insertOne({
      _id: userId,
      name: fullName,
      email: normalisedEmail,
      // Confirmation is a security boundary: guest enquiries may only be
      // claimed once this address has been proved, and `authorize` refuses to
      // sign in an account where this is still null.
      emailVerified: null,
      image: null,
      role: roleForEmail(normalisedEmail),
      passwordHash,
      createdAt: new Date(),
    });

    await sendConfirmationEmail(userId, normalisedEmail, fullName);
    return { checkEmail: true, values };
  } catch (err) {
    /* 11000 = duplicate key: two signups for the same address raced and the
       unique index caught the loser. The winner's confirmation email is out,
       so this reports exactly what the winner reported. It used to answer with
       the "already exists" error, which made a race a third way to ask whether
       an address is registered. */
    if (
      typeof err === "object" &&
      err !== null &&
      (err as { code?: number }).code === 11000
    ) {
      return { checkEmail: true, values };
    }
    console.error("[signup] could not create the account:", err);
    return {
      error: "Account creation is temporarily unavailable. Please try again.",
      values,
    };
  }
}
