/* Data access for enquiry chat threads. SERVER ONLY (imports pg via ./db).
   The enquiry's original `message` is the first line of a thread; the rows in
   enquiry_messages are the replies that follow. */

import { query } from "./db";

export type MessageSender = "admin" | "client";

export interface EnquiryMessage {
  id: string;
  enquiryId: string;
  sender: MessageSender;
  body: string;
  createdAt: Date;
}

interface MessageRow {
  id: string;
  enquiry_id: string;
  sender: MessageSender;
  body: string;
  created_at: Date;
}

const fromRow = (r: MessageRow): EnquiryMessage => ({
  id: r.id,
  enquiryId: r.enquiry_id,
  sender: r.sender,
  body: r.body,
  createdAt: r.created_at,
});

/** All reply messages for one enquiry, oldest first. */
export async function getThreadMessages(enquiryId: string): Promise<EnquiryMessage[]> {
  const { rows } = await query<MessageRow>(
    `select id, enquiry_id, sender, body, created_at
       from enquiry_messages
      where enquiry_id = $1
      order by created_at asc`,
    [enquiryId],
  );
  return rows.map(fromRow);
}

/** Reply messages for several enquiries at once (avoids an N+1 in the portal),
    grouped by enquiry id. */
export async function getThreadsFor(
  enquiryIds: string[],
): Promise<Map<string, EnquiryMessage[]>> {
  const grouped = new Map<string, EnquiryMessage[]>();
  if (enquiryIds.length === 0) return grouped;

  const { rows } = await query<MessageRow>(
    `select id, enquiry_id, sender, body, created_at
       from enquiry_messages
      where enquiry_id = any($1)
      order by created_at asc`,
    [enquiryIds],
  );
  for (const row of rows) {
    const msg = fromRow(row);
    const list = grouped.get(msg.enquiryId);
    if (list) list.push(msg);
    else grouped.set(msg.enquiryId, [msg]);
  }
  return grouped;
}

/* SQL boolean: is an enquiry unread for the ADMIN? True when the client has
   posted (the original message counts) more recently than the admin last
   opened the thread. The enquiries table MUST be aliased `e` in the query. */
export const ADMIN_UNREAD_SQL = `(
  coalesce(
    (select max(m.created_at) from enquiry_messages m
      where m.enquiry_id = e.id and m.sender = 'client'),
    e.created_at
  ) > coalesce(e.admin_last_read_at, to_timestamp(0))
)`;

/** Mark one enquiry thread read by the admin (they just opened it). */
export async function markAdminRead(enquiryId: string): Promise<void> {
  await query(`update enquiries set admin_last_read_at = now() where id = $1`, [
    enquiryId,
  ]);
}

/** Mark all of a client's owned enquiry threads read. */
export async function markClientRead(userId: string): Promise<void> {
  await query(
    `update enquiries set client_last_read_at = now()
      where user_id = $1`,
    [userId],
  );
}
