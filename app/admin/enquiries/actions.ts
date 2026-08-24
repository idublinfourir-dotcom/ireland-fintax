"use server";

/* Admin side of the enquiry chat: post a reply into a thread. Re-checks
   requireAdmin; revalidates the inbox, the dashboard and the client portal. */

import { revalidatePath } from "next/cache";
import { query } from "../../lib/db";
import { requireAdmin } from "../../lib/supabase/guards";
import { validateEnquiryReply } from "../../lib/enquiry-message-validation";

/** Admin posts a reply into an enquiry thread. Sending also marks the thread
    read for the admin (they've clearly seen it). */
export async function sendAdminMessageAction(formData: FormData): Promise<void> {
  const admin = await requireAdmin();

  const id = String(formData.get("id") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  if (!/^\d+$/.test(id) || validateEnquiryReply(body)) return;

  try {
    await query(
      `insert into enquiry_messages (enquiry_id, sender, sender_user_id, body)
       values ($1, 'admin', $2, $3)`,
      [id, admin.id, body],
    );
    await query(`update enquiries set admin_last_read_at = now() where id = $1`, [
      id,
    ]);
  } catch (err) {
    console.error("[enquiries] admin reply failed:", err);
    return;
  }

  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
  revalidatePath("/portal");
}
