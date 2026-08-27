/* EmailJS REST sender. SERVER ONLY — the private key must never reach the
   browser.

   Two things send mail: the contact form's enquiry notification and the signup
   confirmation link. Both go through here so the `to_email` rule below is
   stated once. */

const ENDPOINT = "https://api.emailjs.com/api/v1.0/email/send";

export interface SendTemplateEmail {
  /** EmailJS template id for this specific mail. */
  templateId: string | undefined;
  /** Who receives it. */
  toEmail: string;
  toName: string;
  /** Everything else the template renders. */
  params: Record<string, string>;
  /** Tag for the log lines, e.g. "enquiry". */
  logPrefix: string;
}

/**
 * Send one templated email. Returns whether it went out.
 *
 * Never throws: every caller treats mail as best-effort, so a failure is
 * logged and the surrounding action still succeeds.
 */
export async function sendTemplateEmail({
  templateId,
  toEmail,
  toName,
  params,
  logPrefix,
}: SendTemplateEmail): Promise<boolean> {
  const serviceId = process.env.EmailJs_Gmail_serviceid_KEY;
  const publicKey = process.env.EmailJs_PUBLIC_KEY;
  const privateKey = process.env.EmailJs_Private_KEY;

  if (!serviceId || !templateId || !publicKey || !privateKey || !toEmail) {
    console.warn(
      `[${logPrefix}] EmailJS not fully configured (need EmailJs_* keys and a recipient) — skipping email`,
    );
    return false;
  }

  try {
    const res = await fetch(ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        template_params: {
          // The EmailJS templates' "To email" field is {{to_email}} — it MUST
          // be sent or the API rejects with 422 "recipients address is
          // corrupted" and the mail silently never arrives. This broke once in
          // production. If you touch template_params, keep to_email in it.
          to_email: toEmail,
          to_name: toName,
          ...params,
        },
      }),
    });

    if (!res.ok) {
      console.error(
        `[${logPrefix}] EmailJS send failed:`,
        res.status,
        await res.text(),
      );
      return false;
    }
    return true;
  } catch (err) {
    console.error(`[${logPrefix}] EmailJS request error:`, err);
    return false;
  }
}
