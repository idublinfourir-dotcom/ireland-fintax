/* Sent when someone submits the signup form with an address that already has
   a confirmed account.

   This message exists so the FORM does not have to say it. Answering "an
   account with this email already exists" on screen tells whoever typed it
   that the address is registered here, and for an accountancy practice the
   fact that leaks is "this person is a client of this firm". So the form says
   the same thing to everybody and the detail goes to the address itself,
   which is the one place only its owner can read.

   The real owner is not left guessing either: they submitted a signup form
   and need to know why the password they just chose will not work.

   Pure: composes strings, sends nothing. */

import {
  button,
  emailShell,
  greetingName,
  paragraph,
  signOff,
} from "./email-layout.ts";

export interface ExistingAccountEmailInput {
  /** The name on the EXISTING account, not the one just typed into the form. */
  name: string;
  /** Absolute /login URL. */
  loginUrl: string;
  /** Absolute /forgot-password URL. */
  resetUrl: string;
  firmName: string;
}

export function existingAccountSubject(): string {
  return "You already have an account";
}

/** Said in both parts. Someone who did not do this has had their address typed
    into a signup form by a stranger, and the useful thing to tell them is that
    nothing happened: no second account, and their password is untouched. */
const IGNORE_LINE =
  "If this wasn't you, you can ignore this email. No new account was created and your password has not changed.";

const FORGOT_LINE = "Forgotten your password? Reset it here:";

export function existingAccountText(input: ExistingAccountEmailInput): string {
  return [
    `Hi ${greetingName(input.name)},`,
    "",
    "Someone just tried to create an account with this email address, but you already have one with us, so we haven't made a second.",
    "",
    "Sign in here:",
    input.loginUrl,
    "",
    FORGOT_LINE,
    input.resetUrl,
    "",
    IGNORE_LINE,
    "",
    input.firmName,
  ].join("\n");
}

export function existingAccountHtml(input: ExistingAccountEmailInput): string {
  return emailShell({
    firmName: input.firmName,
    bodyHtml: [
      paragraph(`Hi ${greetingName(input.name)},`),
      paragraph(
        "Someone just tried to create an account with this email address, but you already have one with us, so we haven't made a second.",
      ),
      button(input.loginUrl, "Sign in"),
      paragraph(`${FORGOT_LINE} ${input.resetUrl}`),
      paragraph(IGNORE_LINE),
      signOff(input.firmName),
    ].join("\n"),
  });
}
