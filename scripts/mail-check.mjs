// SMTP check: node scripts/mail-check.mjs [recipient@example.com]
//
// With no argument it only opens the connection and authenticates, which is
// the half that actually breaks (wrong host, login password instead of an app
// password). Pass an address and it also sends a short test message, so you
// can see what arrives and where it lands.
//
// Mirrors app/lib/mail-config.ts by hand: that module is TypeScript and this
// script runs outside Next. Keep the two in step.
import nodemailer from "nodemailer";
import "./load-env.mjs";

const host = process.env.SMTP_HOST?.trim();
const user = process.env.SMTP_USER?.trim();
const pass = process.env.SMTP_PASS?.trim();
const port = Number(process.env.SMTP_PORT?.trim() || 465);
const from = process.env.MAIL_FROM?.trim() || user;

const missing = [!host && "SMTP_HOST", !user && "SMTP_USER", !pass && "SMTP_PASS"].filter(
  Boolean,
);
if (missing.length > 0) {
  console.error(`Not configured: set ${missing.join(", ")} in .env.local`);
  process.exit(1);
}

const transport = nodemailer.createTransport({
  host,
  port,
  secure: port === 465,
  auth: { user, pass },
});

try {
  await transport.verify();
  console.log(`Authenticated with ${host}:${port} as ${user}`);

  const to = process.argv[2];
  if (!to) {
    console.log("\nPass an address to send a test message: node scripts/mail-check.mjs you@example.com");
  } else {
    const info = await transport.sendMail({
      from,
      to,
      subject: "SMTP check",
      text: "Plain-text part. If you can read this, outbound mail works.",
      html: "<p>HTML part. If you can read this, outbound mail works.</p>",
    });
    console.log(`Sent to ${to} (${info.messageId})`);
    if (info.rejected?.length) console.warn("Rejected:", info.rejected);
  }
} catch (err) {
  console.error("SMTP check failed:", err.message);
  process.exitCode = 1;
} finally {
  transport.close();
}
