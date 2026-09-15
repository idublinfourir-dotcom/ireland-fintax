"use server";

import { after } from "next/server";
import { ObjectId } from "mongodb";
import {
  enquiriesCollection,
  nextSequence,
  toObjectId,
} from "../lib/collections";
import { getUser } from "../lib/auth/guards";
import { allowPublicAction } from "../lib/rate-limit";
import { sendMail } from "../lib/mailer";
import { ackHtml, ackSubject, ackText } from "../lib/enquiry-email";
import { site } from "../lib/content";

export interface EnquiryState {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<"name" | "email" | "message", string>>;
  formError?: string;
  values?: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Acknowledge the enquiry to the person who sent it.
 *
 * It goes to the CUSTOMER, and there is deliberately no second mail to the
 * firm: new enquiries surface in /admin/enquiries with an unread badge, which
 * is how the team sees them. Reply-To is left at the default (the firm's own
 * mailbox), so answering the acknowledgement still reaches a human.
 *
 * Best-effort: the stored enquiry is the source of truth, so a failed email is
 * logged and the submission still succeeded. sendMail never throws.
 */
async function sendEnquiryAck(values: {
  name: string;
  email: string;
  service: string;
  message: string;
}) {
  const input = {
    name: values.name,
    message: values.message,
    service: values.service || null,
    firmName: site.name,
  };

  const sent = await sendMail({
    to: values.email,
    subject: ackSubject(),
    html: ackHtml(input),
    text: ackText(input),
    logPrefix: "[enquiry]",
  });
  if (sent) console.info("[enquiry] acknowledgement emailed");
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
    // Capped where it is read, not only where it is stored, so the enquiry
    // document and the acknowledgement always carry the same text.
    message: String(formData.get("message") ?? "")
      .trim()
      .slice(0, 4000),
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
  // logged-out (public) submissions stay null and can be claimed later, but
  // only once the address has been proved.
  let userId: ObjectId | null = null;
  try {
    const user = await getUser();
    userId = user ? toObjectId(user.id) : null;
  } catch (err) {
    console.error("[enquiry] session read failed (continuing anonymous):", err);
  }

  try {
    const createdAt = new Date();
    const enquiries = await enquiriesCollection();

    await enquiries.insertOne({
      _id: new ObjectId(),
      // Short, human-readable reference: the portal and the admin inbox render
      // it as "Ref #0042". Allocated atomically — see nextSequence.
      ref: await nextSequence("enquiries"),
      name: values.name,
      email: values.email,
      company: values.company || null,
      service: values.service || null,
      message: values.message,
      userId,
      adminLastReadAt: null,
      clientLastReadAt: null,
      // The opening message is the first thing the client "said", so it counts
      // towards the admin's unread test from the moment it lands.
      lastClientMessageAt: createdAt,
      lastAdminMessageAt: null,
      createdAt,
    });
  } catch (err) {
    console.error("[enquiry] failed to save:", err);
    return { status: "error", values };
  }

  // Acknowledge AFTER the response is returned, so the form submission is
  // never blocked by the SMTP round-trip.
  after(() => sendEnquiryAck(values));

  return { status: "success" };
}
