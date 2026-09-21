/* The password-reset code.

   A code the reader types back in, not a link they click. Three reasons, and
   all three are why this is not modelled on signup-email.ts:

   1. It works on a device other than the one that asked. A link carries the
      request's own origin and, in flows that bind it, that browser's state;
      "ask on the laptop, finish on the phone" then fails.
   2. It does not go through /auth/confirm, so that route's single-use signup
      token stays the only thing it ever redeems.
   3. There is nothing clickable for a phisher to imitate. A reset mail is the
      most impersonated message a firm sends.

   Best-effort, unlike the signup link: there is no half-created account to
   roll back, and saying "we could not send it" would confirm the address has
   an account. See app/forgot-password/actions.ts.

   NEVER state how many digits the code has, here or anywhere the user can see
   it. The length is one constant in lib/auth/reset-tokens.ts, and copy that
   counts the digits turns changing it into a silent lie. reset-email.test.ts
   enforces this.

   Pure: composes strings, sends nothing. */

import {
  codeBlock,
  emailShell,
  greetingName,
  paragraph,
  signOff,
} from "./email-layout.ts";

export interface ResetEmailInput {
  /** The name on the account, for the greeting. */
  name: string;
  /** The one-time code, as digits. Never logged, never put in a URL. */
  code: string;
  firmName: string;
}

export function resetSubject(): string {
  return "Your password reset code";
}

/** Stated in both parts so the two cannot drift. The window matches
    RESET_TTL_MS in lib/auth/reset-tokens.ts, so change them together. */
const EXPIRY_LINE = "The code is good for 15 minutes and can be used once.";

/** Said in both parts. Someone who did not ask for this has had their address
    typed into a reset form by a stranger, and the useful thing to tell them is
    that ignoring it costs nothing: no code is spent and no password changes. */
const IGNORE_LINE =
  "If you didn't ask to reset your password, ignore this email. Your password stays as it is.";

export function resetText(input: ResetEmailInput): string {
  return [
    `Hi ${greetingName(input.name)},`,
    "",
    "Enter this code to set a new password:",
    "",
    // On its own line and nothing else, so a mail client that wraps or
    // linkifies surrounding text cannot take any of it with the code, and so
    // a reader can select the line to copy it.
    input.code,
    "",
    EXPIRY_LINE,
    IGNORE_LINE,
    "",
    input.firmName,
  ].join("\n");
}

export function resetHtml(input: ResetEmailInput): string {
  return emailShell({
    firmName: input.firmName,
    bodyHtml: [
      paragraph(`Hi ${greetingName(input.name)},`),
      paragraph("Enter this code to set a new password."),
      codeBlock(input.code),
      paragraph(`${EXPIRY_LINE} ${IGNORE_LINE}`),
      signOff(input.firmName),
    ].join("\n"),
  });
}
