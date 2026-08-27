/* Data access for enquiry chat threads. SERVER ONLY.
   The enquiry's original `message` is the first line of a thread; the documents
   in enquiry_messages are the replies that follow. */

import { ObjectId, type Filter } from "mongodb";
import {
  enquiriesCollection,
  enquiryMessagesCollection,
  toEnquiryRef,
  toObjectId,
  type EnquiryDoc,
  type EnquiryMessageDoc,
} from "./collections";

export type MessageSender = "admin" | "client";

export interface EnquiryMessage {
  id: string;
  enquiryId: string;
  sender: MessageSender;
  body: string;
  createdAt: Date;
}

const fromDoc = (r: EnquiryMessageDoc): EnquiryMessage => ({
  id: r._id.toHexString(),
  enquiryId: String(r.enquiryRef),
  sender: r.sender,
  body: r.body,
  createdAt: r.createdAt,
});

/** All reply messages for one enquiry, oldest first. */
export async function getThreadMessages(
  enquiryId: string,
): Promise<EnquiryMessage[]> {
  const ref = toEnquiryRef(enquiryId);
  if (ref === null) return [];

  const messages = await enquiryMessagesCollection();
  const docs = await messages
    .find({ enquiryRef: ref })
    .sort({ createdAt: 1 })
    .toArray();
  return docs.map(fromDoc);
}

/** Reply messages for several enquiries at once (avoids an N+1 in the portal),
    grouped by enquiry id. */
export async function getThreadsFor(
  enquiryIds: string[],
): Promise<Map<string, EnquiryMessage[]>> {
  const grouped = new Map<string, EnquiryMessage[]>();

  const refs = enquiryIds
    .map(toEnquiryRef)
    .filter((r): r is number => r !== null);
  if (refs.length === 0) return grouped;

  const messages = await enquiryMessagesCollection();
  const docs = await messages
    .find({ enquiryRef: { $in: refs } })
    .sort({ createdAt: 1 })
    .toArray();

  for (const doc of docs) {
    const msg = fromDoc(doc);
    const list = grouped.get(msg.enquiryId);
    if (list) list.push(msg);
    else grouped.set(msg.enquiryId, [msg]);
  }
  return grouped;
}

/* Is an enquiry unread for the ADMIN? True when the client has posted (the
   original message counts) more recently than the admin last opened the thread.

   The SQL this replaces recomputed `max(client message time)` with a correlated
   subquery on every row. `lastClientMessageAt` holds that value on the enquiry
   itself — seeded to createdAt so the opening message counts, and advanced by
   addThreadMessage — which turns the test into a field comparison the list
   query and the unread count can share. `$expr` is what allows one field to be
   compared against another. */
export const ADMIN_UNREAD_FILTER: Filter<EnquiryDoc> = {
  $expr: {
    $gt: ["$lastClientMessageAt", { $ifNull: ["$adminLastReadAt", new Date(0)] }],
  },
};

/** The same test as ADMIN_UNREAD_FILTER, for documents already in hand — the
    inbox and dashboard lists flag rows they have just fetched rather than
    running a second query. Keep the two in step. */
export function isUnreadForAdmin(
  enquiry: Pick<EnquiryDoc, "lastClientMessageAt" | "adminLastReadAt">,
): boolean {
  const lastRead = enquiry.adminLastReadAt?.getTime() ?? 0;
  return enquiry.lastClientMessageAt.getTime() > lastRead;
}

/**
 * Append a reply to a thread and advance the denormalised "last message from
 * this side" stamp in the same call, so the unread test can never drift from
 * the messages it describes.
 *
 * Returns false when the enquiry does not exist.
 */
export async function addThreadMessage(input: {
  enquiryRef: number;
  sender: MessageSender;
  senderUserId: string | null;
  body: string;
}): Promise<boolean> {
  const [messages, enquiries] = await Promise.all([
    enquiryMessagesCollection(),
    enquiriesCollection(),
  ]);

  const createdAt = new Date();
  const stamp =
    input.sender === "admin"
      ? // An admin writing a reply has plainly read the thread.
        { lastAdminMessageAt: createdAt, adminLastReadAt: createdAt }
      : { lastClientMessageAt: createdAt };

  const { matchedCount } = await enquiries.updateOne(
    { ref: input.enquiryRef },
    { $set: stamp },
  );
  if (matchedCount === 0) return false;

  await messages.insertOne({
    _id: new ObjectId(),
    enquiryRef: input.enquiryRef,
    sender: input.sender,
    senderUserId: input.senderUserId ? toObjectId(input.senderUserId) : null,
    body: input.body,
    createdAt,
  });

  return true;
}

/** Mark one enquiry thread read by the admin (they just opened it). */
export async function markAdminRead(enquiryId: string): Promise<void> {
  const ref = toEnquiryRef(enquiryId);
  if (ref === null) return;

  const enquiries = await enquiriesCollection();
  await enquiries.updateOne({ ref }, { $set: { adminLastReadAt: new Date() } });
}

/** Mark all of a client's owned enquiry threads read. */
export async function markClientRead(userId: string): Promise<void> {
  const owner = toObjectId(userId);
  if (!owner) return;

  const enquiries = await enquiriesCollection();
  await enquiries.updateMany(
    { userId: owner },
    { $set: { clientLastReadAt: new Date() } },
  );
}
