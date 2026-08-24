"use server";

import { after } from "next/server";
import { query } from "../lib/db";
import { createClient } from "../lib/supabase/server";
import { isSupabaseConfigured } from "../lib/supabase/config";
import { allowPublicAction } from "../lib/rate-limit";
import { site } from "../lib/content";

export interface EnquiryState {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<"name" | "email" | "message", string>>;
  formError?: string;
  values?: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Send the enquiry as an email via the EmailJS REST API (server-side, so the
 * private key never reaches the browser). Best-effort: the DB row is the source
 * of truth, so a failed email is logged but doesn't fail the submission.
 */
async function sendEnquiryEmail(values: {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}) {
  const serviceId = process.env.EmailJs_Gmail_serviceid_KEY;
  const templateId = process.env.EmailJs_Template_KEY;
  const publicKey = process.env.EmailJs_PUBLIC_KEY;
  const privateKey = process.env.EmailJs_Private_KEY;
  // The firm's monitored inbox. Deployment-specific, so it lives in env rather
  // than in the source — pointing the app at a new mailbox must not need a code
  // change.
  const toEmail = process.env.ENQUIRY_TO_EMAIL;

  if (!serviceId || !templateId || !publicKey || !privateKey || !toEmail) {
    console.warn(
      "[enquiry] EmailJS not fully configured (need EmailJs_* keys and ENQUIRY_TO_EMAIL) — skipping email",
    );
    return;
  }

  try {
    const res = await fetch("https://api.emailjs.com/api/v1.0/email/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        service_id: serviceId,
        template_id: templateId,
        user_id: publicKey,
        accessToken: privateKey,
        // Superset of params so any template variant renders. The form
        // collects name/email/company/service/message; service is also exposed
        // as {{budget}} and {{title}} for templates that use those names.
        template_params: {
          // The EmailJS template's "To email" is {{to_email}} — it MUST be sent
          // or the API rejects with 422 "recipients address is corrupted".
          // This is the firm's monitored inbox; reply_to is the enquirer.
          to_email: toEmail,
          to_name: site.name,
          name: values.name,
          email: values.email,
          reply_to: values.email,
          company: values.company || "—",
          service: values.service || "—",
          budget: values.service || "—",
          title: values.service || "your enquiry",
          message: values.message,
        },
      }),
    });
    if (!res.ok) {
      console.error(
        "[enquiry] EmailJS send failed:",
        res.status,
        await res.text(),
      );
    }
  } catch (err) {
    console.error("[enquiry] EmailJS request error:", err);
  }
}

export async function submitEnquiry(
  _prev: EnquiryState,
  formData: FormData,
): Promise<EnquiryState> {
  const values = {
    name: String(formData.get("name") ?? "").trim(),
    email: String(formData.get("email") ?? "").trim(),
    company: String(formData.get("company") ?? "").trim(),
    service: String(formData.get("service") ?? "").trim(),
    message: String(formData.get("message") ?? "").trim(),
  };

  const errors: EnquiryState["errors"] = {};
  if (values.name.length < 2) errors.name = "Please tell us your name.";
  if (!EMAIL_RE.test(values.email))
    errors.email = "Please enter a valid email address.";
  if (values.message.length < 10)
    errors.message = "Tell us a little more: a sentence or two is plenty.";

  if (Object.keys(errors).length > 0) {
    return { status: "error", errors, values };
  }

  const allowed = await allowPublicAction({
    action: "contact",
    identity: values.email,
    ip: { max: 10, windowSeconds: 60 * 60 },
    identityLimit: { max: 5, windowSeconds: 60 * 60 },
  });
  if (!allowed) {
    return {
      status: "error",
      formError:
        "Too many enquiries have been sent recently. Please wait an hour or contact us by email.",
      values,
    };
  }

  // Stamp the enquiry with the signed-in user's id when a session exists;
  // logged-out (public) submissions stay null. Read via the SSR server client.
  let userId: string | null = null;
  try {
    if (!isSupabaseConfigured()) throw new Error("no auth backend configured");
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  } catch (err) {
    console.error("[enquiry] session read failed (continuing anonymous):", err);
  }

  // Save to Postgres (Supabase). Parameterised query ($1..$6) — never string
  // interpolation — so user input can't be used for SQL injection.
  try {
    await query(
      `insert into enquiries (name, email, company, service, message, user_id)
       values ($1, $2, $3, $4, $5, $6)`,
      [
        values.name,
        values.email,
        values.company || null,
        values.service || null,
        values.message.slice(0, 4000),
        userId,
      ],
    );
  } catch (err) {
    console.error("[enquiry] failed to save:", err);
    return { status: "error", values };
  }

  // Send the notification email AFTER the response is returned, so the form
  // submission isn't blocked by the EmailJS round-trip (best-effort).
  after(() => sendEnquiryEmail(values));

  return { status: "success" };
}
