/* The signup confirmation link.

   Unlike everything else this app mails, this one is load-bearing rather than
   best-effort: the account is created with `emailVerified: null` and cannot be
   signed in to until the link is followed, so a message that never arrives
   leaves a dead account behind. `app/signup/actions.ts` therefore refuses the
   whole flow when no mail backend is configured, instead of writing the user
   and hoping.

   Pure: composes strings, sends nothing. */

import {
  button,
  emailShell,
  greetingName,
  paragraph,
  signOff,
} from "./email-layout.ts";

export interface ConfirmEmailInput {
  /** The name they gave at signup, for the greeting. */
  name: string;
  /** Absolute /auth/confirm URL carrying the single-use token. */
  verifyUrl: string;
  firmName: string;
}

export function confirmSubject(): string {
  return "Confirm your email address";
}

/** Stated in both parts so the two cannot drift. The window matches the token
    TTL in lib/auth/tokens.ts, so change them together. */
const EXPIRY_LINE = "The link is good for 24 hours and can be used once.";

export function confirmText(input: ConfirmEmailInput): string {
  return [
    `Hi ${greetingName(input.name)},`,
    "",
    "Confirm your email address to finish setting up your client account:",
    input.verifyUrl,
    "",
    EXPIRY_LINE,
    "If you didn't ask for an account, ignore this email and nothing happens.",
    "",
    input.firmName,
  ].join("\n");
}

export function confirmHtml(input: ConfirmEmailInput): string {
  return emailShell({
    firmName: input.firmName,
    bodyHtml: [
      paragraph(`Hi ${greetingName(input.name)},`),
      paragraph(
        "Confirm your email address to finish setting up your client account.",
      ),
      button(input.verifyUrl, "Confirm my email"),
      paragraph(
        `${EXPIRY_LINE} If you didn't ask for an account, ignore this email and nothing happens.`,
      ),
      signOff(input.firmName),
    ].join("\n"),
  });
}
