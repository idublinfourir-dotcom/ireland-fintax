import { compare, hash } from "bcryptjs";

/* Password hashing. SERVER ONLY.
 *
 * bcryptjs rather than the native `bcrypt` binding: it is pure JavaScript, so
 * it needs no build step and works unchanged on every serverless target. */

/** Work factor. 12 is ~250ms on current hardware — costly to brute force,
    cheap enough for a login request. Raise it, never lower it. */
const ROUNDS = 12;

export function hashPassword(password: string): Promise<string> {
  return hash(password, ROUNDS);
}

/**
 * Check a password against a stored hash.
 *
 * `stored` is null for accounts created through Google that never set a
 * password. Returning false — rather than throwing — keeps the failure
 * indistinguishable from a wrong password, so the response cannot be used to
 * probe which addresses are OAuth-only.
 */
export async function verifyPassword(
  password: string,
  stored: string | null | undefined,
): Promise<boolean> {
  if (!stored) return false;
  try {
    return await compare(password, stored);
  } catch {
    return false;
  }
}
