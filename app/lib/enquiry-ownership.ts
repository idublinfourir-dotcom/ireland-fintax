/* Server-only ownership helpers for guest enquiries.

   Email matching is allowed only at a trusted verification boundary
   (/auth/confirm or the configured OAuth callback). Portal reads and writes
   use user_id exclusively, so merely signing in with an address can never
   expose or claim another person's guest enquiry. */

import { query } from "./db";

export async function claimVerifiedGuestEnquiries(
  userId: string,
  email: string | null | undefined,
): Promise<void> {
  const normalizedEmail = email?.trim();
  if (!normalizedEmail) return;

  await query(
    `update enquiries
        set user_id = $1
      where user_id is null and lower(email) = lower($2)`,
    [userId, normalizedEmail],
  );
}
