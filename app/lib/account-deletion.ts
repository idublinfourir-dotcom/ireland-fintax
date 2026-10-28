/* Self-service account deletion (Settings, "Delete my account"), as /privacy
   promises. SERVER ONLY. Removes the account and everything tied to it: the
   questions it owns or that were sent from its confirmed address, their
   replies, its resource requests, its OAuth links, its confirmation links and
   its reset codes. Rate-limit counters hold only hashes and expire on their
   own after 8 days. */

import type { ObjectId } from "mongodb";
import {
  CASE_INSENSITIVE,
  accountsCollection,
  enquiriesCollection,
  enquiryMessagesCollection,
  passwordResetTokensCollection,
  toolkitRequestsCollection,
  usersCollection,
  verificationTokensCollection,
} from "./collections";

/**
 * Delete the account `userId` and its data. `email` must be the account's own
 * address, which is confirmed: an unconfirmed account cannot hold a session.
 *
 * Replies go before their questions and the account goes last, so a stop half
 * way never leaves replies without a question, and leaves the account in place
 * (still signed in) to try again.
 */
export async function deleteAccountData(userId: ObjectId, email: string): Promise<void> {
  const enquiries = await enquiriesCollection();
  const refs = (
    await enquiries
      // Claimed by the account, or sent as a guest from its address: the
      // rule that claims guest questions once the address is proved
      // (enquiry-ownership.ts).
      .find({ $or: [{ userId }, { email: email.trim() }] }, {
        projection: { ref: 1 },
        collation: CASE_INSENSITIVE,
      })
      .toArray()
  ).map((e) => e.ref);

  if (refs.length) {
    const messages = await enquiryMessagesCollection();
    await messages.deleteMany({ enquiryRef: { $in: refs } });
    await enquiries.deleteMany({ ref: { $in: refs } });
  }

  const requests = await toolkitRequestsCollection();
  await requests.deleteMany({ email: email.trim() }, { collation: CASE_INSENSITIVE });

  const verifications = await verificationTokensCollection();
  await verifications.deleteMany({ userId });
  const resets = await passwordResetTokensCollection();
  await resets.deleteMany({ userId });
  const links = await accountsCollection();
  await links.deleteMany({ userId });

  const users = await usersCollection();
  await users.deleteOne({ _id: userId });
}
