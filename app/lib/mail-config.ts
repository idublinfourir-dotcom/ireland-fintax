/* Outbound-mail configuration, deliberately free of any `nodemailer` import.
 *
 * `lib/auth/config.ts` reads `isMailerConfigured` to decide whether email
 * signup can be offered at all, and that module is pulled into the edge
 * middleware bundle, where nodemailer cannot be bundled. Keeping these env
 * reads in their own module means importing them never drags the transport in.
 *
 * app/lib/mailer.ts is the counterpart that actually sends. */

export interface MailerConfig {
  host: string;
  port: number;
  user: string;
  pass: string;
  /** Envelope From. Must be an address the SMTP account is allowed to send as. */
  from: string;
  replyTo: string;
}

/**
 * Is outbound mail wired up at all?
 *
 * Cheap enough to call on a request path, and the answer decides real
 * behaviour rather than just logging: signup refuses up front when this is
 * false (see `isSignupEmailConfigured`), because an account whose confirmation
 * link was never sent can never be signed in to.
 */
export function isMailerConfigured(): boolean {
  return readMailerConfig() !== null;
}

/**
 * SMTP settings, or null when the deploy has no mail backend.
 *
 * Only the three authentication keys are required. `MAIL_FROM` defaults to the
 * authenticated mailbox because most providers reject a From the account does
 * not own; a display name in front of it ("Ireland Fintax <box@example.ie>")
 * is fine, the address itself is what is checked. `MAIL_REPLY_TO` defaults to
 * the same place, so replying to anything this site sends reaches a human.
 *
 * `quiet` suppresses the warning for the callers that ask merely to find out
 * (the signup gate), so a deploy with no mail configured logs once per send
 * attempt rather than once per page render.
 */
export function readMailerConfig(quiet = true): MailerConfig | null {
  const host = process.env.SMTP_HOST?.trim();
  const user = process.env.SMTP_USER?.trim();
  const pass = process.env.SMTP_PASS?.trim();
  const from = process.env.MAIL_FROM?.trim();
  const replyTo = process.env.MAIL_REPLY_TO?.trim();

  const missing = [
    !host && "SMTP_HOST",
    !user && "SMTP_USER",
    !pass && "SMTP_PASS",
  ].filter(Boolean);

  if (missing.length > 0) {
    if (!quiet) {
      console.warn(`[mailer] SMTP not configured (missing ${missing.join(", ")})`);
    }
    return null;
  }

  // 465 is implicit TLS and the default here; 587 starts plaintext and
  // upgrades via STARTTLS. A non-numeric SMTP_PORT would otherwise become NaN
  // and fail at connect time with nothing pointing at the cause.
  const port = Number(process.env.SMTP_PORT?.trim() || 465);

  return {
    host: host!,
    port: Number.isFinite(port) && port > 0 ? port : 465,
    user: user!,
    pass: pass!,
    from: from || user!,
    replyTo: replyTo || from || user!,
  };
}
