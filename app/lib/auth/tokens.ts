import { createHash, randomBytes } from "node:crypto";
import { ObjectId } from "mongodb";
import { verificationTokensCollection } from "../collections";

/* Signup email-confirmation tokens. SERVER ONLY.
 *
 * Supabase issued and verified these; with Auth.js the app owns them. The
 * token in the emailed link is the only copy — the database holds its SHA-256,
 * so a leaked dump cannot be replayed into a confirmed account. */

/** How long a confirmation link stays usable. */
const TTL_MS = 24 * 60 * 60 * 1000;

/** 256 bits of entropy, URL-safe as hex. Not guessable, not enumerable. */
function newToken(): string {
  return randomBytes(32).toString("hex");
}

function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

/**
 * Issue a confirmation token for an account and return the RAW token to put in
 * the link. Any earlier token for the same account is dropped, so a resent
 * email invalidates the previous one.
 */
export async function createVerificationToken(
  userId: ObjectId,
): Promise<string> {
  const tokens = await verificationTokensCollection();
  await tokens.deleteMany({ userId });

  const token = newToken();
  await tokens.insertOne({
    _id: new ObjectId(),
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + TTL_MS),
    createdAt: new Date(),
  });

  return token;
}

/**
 * Redeem a token, returning the account it belongs to, or null when it is
 * unknown, already used or expired.
 *
 * `findOneAndDelete` makes the redemption atomic: two clicks on the same link
 * race for one document and only the first gets it, so a token can never be
 * spent twice. Expiry is re-checked here because the TTL index only sweeps
 * about once a minute and so is housekeeping, not a boundary.
 */
export async function consumeVerificationToken(
  token: string,
): Promise<ObjectId | null> {
  if (!token) return null;

  const tokens = await verificationTokensCollection();
  const doc = await tokens.findOneAndDelete({ tokenHash: hashToken(token) });
  if (!doc) return null;
  if (doc.expiresAt.getTime() < Date.now()) return null;

  return doc.userId;
}
