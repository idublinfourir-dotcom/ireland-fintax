/* SMTP transport for the mail this site sends OUT. SERVER ONLY.

   Deliberately provider-agnostic: it speaks plain SMTP, so the same code sends
   through Zoho (where the mailbox this site currently sends from lives), or
   Resend, or anything else, by changing env vars only. Every message's layout
   lives in this repo (reply-email.ts, enquiry-email.ts, signup-email.ts), so
   it is reviewable and changes in a commit, rather than in a provider's
   dashboard where nothing records who edited it.

   Every send is best-effort: `sendMail` never throws. The caller has already
   committed its database write, so a refused send is logged and swallowed. The
   one flow that cannot tolerate a silent failure is signup, where the link IS
   the second half of the transaction: it checks `isMailerConfigured` before
   it writes anything. */

import nodemailer, { type Transporter } from "nodemailer";
import { readMailerConfig, type MailerConfig } from "./mail-config.ts";

// One transporter per process: nodemailer pools connections, so rebuilding it
// per send would re-handshake TLS every time. Hung off globalThis because the
// dev server re-evaluates modules on every edit, which would otherwise leak a
// pool per save.
const globalForMail = globalThis as unknown as { mailer?: Transporter };

function getTransport(config: MailerConfig): Transporter {
  if (globalForMail.mailer) return globalForMail.mailer;
  const transport = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.port === 465,
    auth: { user: config.user, pass: config.pass },
  });
  globalForMail.mailer = transport;
  return transport;
}

/**
 * Send one email. Returns true only when the SMTP server accepted it.
 *
 * `text` is required, not optional: it is what a text-only client shows, and
 * its absence is a well-known spam signal.
 */
export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Tag for the log lines, e.g. "[enquiry]". */
  logPrefix: string;
  /** Overrides MAIL_REPLY_TO for this one message. */
  replyTo?: string;
}): Promise<boolean> {
  const config = readMailerConfig(false);
  if (!config) {
    console.warn(`${opts.logPrefix} no SMTP config; skipping email`);
    return false;
  }

  try {
    await getTransport(config).sendMail({
      from: config.from,
      replyTo: opts.replyTo || config.replyTo,
      to: opts.to,
      subject: opts.subject,
      text: opts.text,
      html: opts.html,
    });
    return true;
  } catch (err) {
    console.error(`${opts.logPrefix} SMTP send failed:`, err);
    return false;
  }
}
