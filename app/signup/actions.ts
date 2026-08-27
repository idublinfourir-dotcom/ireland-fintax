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
import { sendTemplateEmail } from "../lib/emailjs";
import { site } from "../lib/content";

export interface SignupState {
  error?: string;
  checkEmail?: boolean;
  values?: { email?: string; fullName?: string };
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Where the confirmation link points. The Origin header adapts to whatever
    host the form was posted from (localhost, preview, prod); the fallbacks are
    only reached when a client omits it. */
async function siteOrigin(): Promise<string> {
  const headerStore = await headers();
  return (
    headerStore.get("origin") ??
    process.env.AUTH_URL?.replace(/\/$/, "") ??
    site.url
  );
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

  await sendTemplateEmail({
    templateId: process.env.EmailJs_Verify_Template_KEY,
    toEmail: email,
    toName: fullName,
    logPrefix: "signup",
    params: {
      name: fullName,
      verify_url: `${origin}/auth/confirm?token=${token}`,
      // Some template variants render the firm rather than the recipient.
      company: site.name,
      title: "Confirm your email address",
      message:
        "Confirm your email address to finish setting up your client account.",
    },
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

  try {
    const users = await usersCollection();
    const existing = await users.findOne({ email: normalisedEmail });

    if (existing?.emailVerified) {
      return {
        error: "An account with this email already exists. Try signing in.",
        values,
      };
    }

    if (existing) {
      /* The address was registered but never confirmed, so no one holds a
         session for it and nothing has been claimed under it. Treat this as a
         retry of the original signup — refresh the details, reissue the link —
         rather than a dead end the real owner cannot get past. */
      await users.updateOne(
        { _id: existing._id },
        { $set: { name: fullName, passwordHash: await hashPassword(password) } },
      );
      await sendConfirmationEmail(existing._id, normalisedEmail, fullName);
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
      passwordHash: await hashPassword(password),
      createdAt: new Date(),
    });

    await sendConfirmationEmail(userId, normalisedEmail, fullName);
    return { checkEmail: true, values };
  } catch (err) {
    // 11000 = duplicate key: two signups for the same address raced and the
    // unique index caught the loser. The winner's confirmation email is out.
    if (
      typeof err === "object" &&
      err !== null &&
      (err as { code?: number }).code === 11000
    ) {
      return {
        error: "An account with this email already exists. Try signing in.",
        values,
      };
    }
    console.error("[signup] could not create the account:", err);
    return {
      error: "Account creation is temporarily unavailable. Please try again.",
      values,
    };
  }
}
