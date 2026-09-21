import { createHash, randomInt } from "node:crypto";
import { ObjectId } from "mongodb";
import { passwordResetTokensCollection } from "../collections";
import { looksLikeCode } from "../account-validation";

/* Password-reset codes. SERVER ONLY.
 *
 * The counterpart to tokens.ts, which issues the 256-bit signup link. The
 * difference is the threat model, and it drives every constant below: this one
 * has to be TYPED, so it is short, so it is guessable given unlimited tries.
 * A link token is safe because it is unguessable; a code is safe only because
 * the tries are capped and the window is short.
 *
 * As with the signup token, the database holds only the SHA-256, so a leaked
 * dump cannot be replayed into a password change. */

/** Digits in a code.
 *
 * ONE definition, and deliberately not repeated in user-visible copy: see the
 * header of lib/reset-email.ts. Eight rather than six because the search space
 * matters more here than the two extra characters cost, and because the code
 * is pasted from a mail client far more often than it is retyped.
 *
 * The verifier does NOT check against this value (see `looksLikeCode`), so
 * changing it cannot strand codes already in flight. */
const CODE_DIGITS = 8;

/** How long a code stays usable. Short on purpose: the window in which a
    guess is worth attempting is the window this is open. Keep it in step with
    EXPIRY_LINE in lib/reset-email.ts. */
const RESET_TTL_MS = 15 * 60 * 1000;

/** Wrong guesses allowed against one code before it is burnt.
 *
 * With 8 digits and 5 tries the chance of hitting a live code is 5e-8 per
 * issued code. This is the second of two caps: the rate limiter in
 * lib/rate-limit.ts is the first, but it fails open on a database error, so
 * this one exists to fail closed in the same write path as the redemption. */
const MAX_ATTEMPTS = 5;

/** Cryptographically random digits. `randomInt` is rejection-sampled, so every
    value is equally likely; `Math.random` here would be guessable from a
    couple of observed codes. Padded, because a leading zero is a real digit
    and dropping it would quietly shrink the space tenfold. */
function newCode(): string {
  return String(randomInt(0, 10 ** CODE_DIGITS)).padStart(CODE_DIGITS, "0");
}

function hashCode(code: string): string {
  return createHash("sha256").update(code).digest("hex");
}

/**
 * Issue a reset code for an account and return the RAW code to email. Any
 * earlier code for the same account is dropped, so asking again invalidates
 * the previous one and there is never more than one live code per user.
 *
 * Never log the return value. It is a live credential for its whole window.
 */
export async function createPasswordResetCode(
  userId: ObjectId,
): Promise<string> {
  const tokens = await passwordResetTokensCollection();
  await tokens.deleteMany({ userId });

  const code = newCode();
  await tokens.insertOne({
    _id: new ObjectId(),
    userId,
    codeHash: hashCode(code),
    attempts: 0,
    expiresAt: new Date(Date.now() + RESET_TTL_MS),
    createdAt: new Date(),
  });

  return code;
}

/**
 * Redeem a code for an account. True means the caller may now set a new
 * password for `userId`.
 *
 * Every failure returns false and says nothing about which failure it was:
 * unknown, expired, already used and out-of-attempts are indistinguishable
 * from here. Telling them apart would reveal whether a code was ever issued
 * for the address, which is the fact the whole flow is built to withhold.
 *
 * `findOneAndDelete` on the (userId, codeHash) pair is what makes the code
 * single-use: two submissions of the same code race for one document and only
 * the first gets it. Expiry is re-checked on the winner because the TTL index
 * sweeps about once a minute, so it is housekeeping and not a boundary.
 */
export async function consumePasswordResetCode(
  userId: ObjectId,
  code: string,
): Promise<boolean> {
  if (!looksLikeCode(code)) return false;

  const tokens = await passwordResetTokensCollection();
  const hit = await tokens.findOneAndDelete({
    userId,
    codeHash: hashCode(code.trim()),
  });

  if (hit) {
    if (hit.expiresAt.getTime() < Date.now()) return false;
    // A code that had already been guessed at too often is dead even when the
    // right one finally arrives, so the cap cannot be outlasted.
    if (hit.attempts >= MAX_ATTEMPTS) return false;
    return true;
  }

  /* Wrong code. Charge the guess against whatever code is outstanding for this
     account and burn it once the cap is spent. Both statements are scoped to
     this user, so one account's guessing can never void another's code. */
  await tokens.updateOne({ userId }, { $inc: { attempts: 1 } });
  await tokens.deleteMany({ userId, attempts: { $gte: MAX_ATTEMPTS } });

  return false;
}

/** Drop any outstanding code for an account. Called once the password has
    actually changed, so a second code issued during the same window cannot be
    used to change it again. */
export async function clearPasswordResetCodes(userId: ObjectId): Promise<void> {
  const tokens = await passwordResetTokensCollection();
  await tokens.deleteMany({ userId });
}
