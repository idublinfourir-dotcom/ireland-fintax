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
import { sendTemplateEmail } from "../lib/emailjs";
import { site } from "../lib/content";

export interface EnquiryState {
  status: "idle" | "success" | "error";
  errors?: Partial<Record<"name" | "email" | "message", string>>;
  formError?: string;
  values?: Record<string, string>;
}

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Send the enquiry as an email (server-side, so the private key never reaches
 * the browser). Best-effort: the stored enquiry is the source of truth, so a
 * failed email is logged but doesn't fail the submission.
 */
async function sendEnquiryEmail(values: {
  name: string;
  email: string;
  company: string;
  service: string;
  message: string;
}) {
  // The firm's monitored inbox. Deployment-specific, so it lives in env rather
  // than in the source — pointing the app at a new mailbox must not need a code
  // change.
  const toEmail = process.env.ENQUIRY_TO_EMAIL;
  if (!toEmail) {
    console.warn("[enquiry] ENQUIRY_TO_EMAIL is not set — skipping email");
    return;
  }

  await sendTemplateEmail({
    templateId: process.env.EmailJs_Template_KEY,
    toEmail,
    toName: site.name,
    logPrefix: "enquiry",
    // Superset of params so any template variant renders. The form collects
    // name/email/company/service/message; service is also exposed as
    // {{budget}} and {{title}} for templates that use those names.
    params: {
      name: values.name,
      email: values.email,
      // to_email is the firm's monitored inbox; reply_to is the enquirer.
      reply_to: values.email,
      company: values.company || "—",
      service: values.service || "—",
      budget: values.service || "—",
      title: values.service || "your enquiry",
      message: values.message,
    },
  });
}

/**
 * Acknowledge the enquiry to the person who sent it: "we have it, we'll be in
 * touch". Separate template from the notification above, because the two are
 * written for opposite readers — that one is an internal work item, this one is
 * a reply to a stranger.
 *
 * Optional. With no template configured the enquiry still lands in the admin
 * inbox and the notification still goes out; the sender simply gets no
 * acknowledgement, which is the behaviour before this existed. Best-effort like
 * every other mail here: sendTemplateEmail never throws.
 *
 * Note `company` is the FIRM here, not the enquirer's employer — this email is
 * addressed to them, so it follows the signup template's convention. The
 * notification template uses the same name for the other meaning.
 */
async function sendEnquiryAutoReply(values: {
  name: string;
  email: string;
  service: string;
  message: string;
}) {
  const templateId = process.env.EmailJs_AutoReply_Template_KEY;
  if (!templateId) {
    console.warn(
      "[enquiry-reply] EmailJs_AutoReply_Template_KEY is not set — skipping the acknowledgement",
    );
    return;
  }

  await sendTemplateEmail({
    templateId,
    toEmail: values.email,
    toName: values.name,
    logPrefix: "enquiry-reply",
    params: {
      name: values.name,
      company: site.name,
      title: values.service || "your enquiry",
      // Echoed back so the sender can see what actually reached us.
      message: values.message,
    },
  });
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
      message: values.message.slice(0, 4000),
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

  /* Both mails go out AFTER the response is returned, so the form submission is
     never blocked by a mail round-trip. Sequential rather than parallel: the
     team's notification is the one that matters, so it goes first and the
     acknowledgement cannot delay it. Neither can throw. */
  after(async () => {
    await sendEnquiryEmail(values);
    await sendEnquiryAutoReply(values);
  });

  return { status: "success" };
}
