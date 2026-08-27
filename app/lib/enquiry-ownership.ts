/* Server-only ownership helpers for guest enquiries.

   Email matching is allowed only at a trusted verification boundary — the
   signup confirmation link, or a Google sign-in, both of which prove the
   address. Portal reads and writes use userId exclusively, so merely signing
   in with an address can never expose or claim another person's guest
   enquiry. */

import {
  CASE_INSENSITIVE,
  enquiriesCollection,
  toObjectId,
} from "./collections";

export async function claimVerifiedGuestEnquiries(
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  const normalizedEmail = email?.trim();
  if (!normalizedEmail) return;

  const owner = toObjectId(userId);
  if (!owner) return;

  const enquiries = await enquiriesCollection();
  await enquiries.updateMany(
    // `userId: null` matches both an explicit null and a missing field, which
    // is what "unclaimed" means. Already-claimed enquiries are never touched.
    { userId: null, email: normalizedEmail },
    { $set: { userId: owner } },
    // The collation has to be on the query as well as the index, or the match
    // silently becomes case-sensitive.
    { collation: CASE_INSENSITIVE },
  );
}
