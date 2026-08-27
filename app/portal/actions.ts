"use server";

/* Client-side of the enquiry chat: a client posts a reply into one of their
   own enquiry threads. Ownership is enforced exclusively by userId. Guest
   enquiries are claimed only at a verified auth boundary. */

import { revalidatePath } from "next/cache";
import {
  enquiriesCollection,
  toEnquiryRef,
  toObjectId,
} from "../lib/collections";
import { requireClient } from "../lib/auth/guards";
import { addThreadMessage } from "../lib/enquiry-messages";
import { validateEnquiryReply } from "../lib/enquiry-message-validation";

export async function sendClientMessageAction(formData: FormData): Promise<void> {
  const user = await requireClient();

  const ref = toEnquiryRef(String(formData.get("id") ?? "").trim());
  const body = String(formData.get("body") ?? "").trim();
  if (ref === null || validateEnquiryReply(body)) return;

  const owner = toObjectId(user.id);
  if (!owner) return;

  try {
    // The enquiry must belong to this client.
    const enquiries = await enquiriesCollection();
    const owned = await enquiries.findOne(
      { ref, userId: owner },
      { projection: { _id: 1 } },
    );
    if (!owned) return;

    await addThreadMessage({
      enquiryRef: ref,
      sender: "client",
      senderUserId: user.id,
      body,
    });
  } catch (err) {
    console.error("[portal] client reply failed:", err);
    return;
  }

  revalidatePath("/portal");
  revalidatePath("/admin/enquiries");
}
