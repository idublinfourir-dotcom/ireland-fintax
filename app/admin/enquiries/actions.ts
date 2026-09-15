"use server";

/* Admin side of the enquiry chat: post a reply into a thread. Re-checks
   requireAdmin; revalidates the inbox, the dashboard and the client portal.

   A reply lands in two places: the in-app thread (the message document) and
   the client's email inbox (best-effort, see notifyClientByEmail). */

import { revalidatePath } from "next/cache";
import { after } from "next/server";
import {
  enquiriesCollection,
  toEnquiryRef,
  usersCollection,
} from "../../lib/collections";
import { requireAdmin } from "../../lib/auth/guards";
import { addThreadMessage } from "../../lib/enquiry-messages";
import { validateEnquiryReply } from "../../lib/enquiry-message-validation";
import { sendMail } from "../../lib/mailer";
import {
  replyHtml,
  replySubject,
  replyText,
  type ReplyEmailInput,
} from "../../lib/reply-email";
import { site } from "../../lib/content";

/**
 * Email the client a copy of an admin reply.
 *
 * Recipient is the address on their account (the one they sign in with) and
 * falls back to the address typed on the contact form for guest enquiries that
 * were never claimed. Looking the account up rather than trusting the form
 * address means a client who changed their email still gets the reply.
 *
 * The message is composed in `lib/reply-email.ts` and sent over SMTP, so what
 * the client receives is defined in this repo rather than in a dashboard.
 *
 * Best-effort: the thread message is already committed, so a missing SMTP
 * config or a refused send is logged and the reply still stands in the portal.
 */
async function notifyClientByEmail(ref: number, body: string) {
  try {
    const enquiries = await enquiriesCollection();
    const enquiry = await enquiries.findOne(
      { ref },
      { projection: { name: 1, email: 1, service: 1, userId: 1 } },
    );
    if (!enquiry) {
      console.warn(`[enquiries] enquiry #${ref} vanished before the email`);
      return;
    }

    let to = enquiry.email;
    if (enquiry.userId) {
      const users = await usersCollection();
      const owner = await users.findOne(
        { _id: enquiry.userId },
        { projection: { email: 1 } },
      );
      if (owner?.email) to = owner.email;
    }

    if (!to) {
      console.warn(
        `[enquiries] no email on enquiry #${ref}; reply stays in-app only`,
      );
      return;
    }

    const input: ReplyEmailInput = {
      clientName: enquiry.name,
      body,
      service: enquiry.service,
      firmName: site.name,
    };

    const sent = await sendMail({
      to,
      subject: replySubject(input),
      html: replyHtml(input),
      text: replyText(input),
      logPrefix: "[enquiries]",
    });

    // One line per successful send, so the ops log shows which replies actually
    // left the building. The reference only: the address stays out of the log.
    if (sent) console.info(`[enquiries] reply on #${ref} emailed`);
  } catch (err) {
    console.error(`[enquiries] reply email for #${ref} failed:`, err);
  }
}

/** Admin posts a reply into an enquiry thread. Sending also marks the thread
    read for the admin (they've clearly seen it) — see addThreadMessage. */
export async function sendAdminMessageAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const ref = toEnquiryRef(String(formData.get("id") ?? "").trim());
  const body = String(formData.get("body") ?? "").trim();
  if (ref === null || validateEnquiryReply(body)) return;

  // An unchecked checkbox isn't submitted at all, so absence means "don't
  // email". Read before the insert, so the intent is captured with the reply.
  const emailCopy = formData.get("email_copy") !== null;

  try {
    const posted = await addThreadMessage({
      enquiryRef: ref,
      sender: "admin",
      senderUserId: admin.id,
      body,
    });
    if (!posted) return;
  } catch (err) {
    console.error("[enquiries] admin reply failed:", err);
    return;
  }

  // Email the client AFTER the response is sent, so the admin's send button
  // isn't waiting on the SMTP round-trip. Skipped entirely when the admin
  // unticked the copy: the reply is then portal-only.
  if (emailCopy) after(() => notifyClientByEmail(ref, body));

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  revalidatePath("/portal");
}
