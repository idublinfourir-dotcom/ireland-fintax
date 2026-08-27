"use server";

/* Admin side of the enquiry chat: post a reply into a thread. Re-checks
   requireAdmin; revalidates the inbox, the dashboard and the client portal. */

import { revalidatePath } from "next/cache";
import { toEnquiryRef } from "../../lib/collections";
import { requireAdmin } from "../../lib/auth/guards";
import { addThreadMessage } from "../../lib/enquiry-messages";
import { validateEnquiryReply } from "../../lib/enquiry-message-validation";

/** Admin posts a reply into an enquiry thread. Sending also marks the thread
    read for the admin (they've clearly seen it) — see addThreadMessage. */
export async function sendAdminMessageAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const ref = toEnquiryRef(String(formData.get("id") ?? "").trim());
  const body = String(formData.get("body") ?? "").trim();
  if (ref === null || validateEnquiryReply(body)) return;

  try {
    await addThreadMessage({
      enquiryRef: ref,
      sender: "admin",
      senderUserId: admin.id,
      body,
    });
  } catch (err) {
    console.error("[enquiries] admin reply failed:", err);
    return;
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  revalidatePath("/portal");
}
