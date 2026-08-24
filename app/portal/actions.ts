"use server";

/* Client-side of the enquiry chat: a client posts a reply into one of their
   own enquiry threads. Ownership is enforced exclusively by user_id. Guest
   enquiries are claimed only at a verified auth callback boundary. */

import { revalidatePath } from "next/cache";
import { query } from "../lib/db";
import { requireClient } from "../lib/supabase/guards";
import { validateEnquiryReply } from "../lib/enquiry-message-validation";

export async function sendClientMessageAction(formData: FormData): Promise<void> {
  const user = await requireClient();

  const id = String(formData.get("id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!/^\d+$/.test(id) || validateEnquiryReply(body)) return;

  // The enquiry must belong to this client.
  const { rows } = await query<{ id: string }>(
    `select id from enquiries
      where id = $1 and user_id = $2`,
    [id, user.id],
  );
  if (rows.length === 0) return;

  try {
    await query(
      `insert into enquiry_messages (enquiry_id, sender, sender_user_id, body)
       values ($1, 'client', $2, $3)`,
      [id, user.id, body],
    );
  } catch (err) {
    console.error("[portal] client reply failed:", err);
    return;
  }

  revalidatePath("/portal");
  revalidatePath("/admin/enquiries");
}
