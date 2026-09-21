/* Pure account-field validators shared by the settings server actions and the
   forgot-password flow. No React/IO — unit-tested with node:test. Floors
   mirror signup: name >= 2, password >= 8. */

export function validateDisplayName(name: string): string | null {
  if (name.trim().length < 2) return "Please enter your name.";
  return null;
}

export function validatePassword(
  password: string,
  confirm: string,
): string | null {
  if (password.length < 8) return "Password must be at least 8 characters.";
  if (password !== confirm) return "Passwords do not match.";
  return null;
}

/**
 * Does this look like a reset code at all?
 *
 * Shape only. Its single job is to reject obvious nonsense before it costs a
 * throttle attempt; whether the code is CORRECT is decided by redeeming it.
 *
 * Deliberately a RANGE rather than the generator's current length. Pinning it
 * would reject every code already sitting in an inbox the moment that constant
 * moved, and the failure would look like the codes were wrong rather than the
 * validator. For the same reason no digit count is stated in any copy the user
 * sees: see the header of lib/reset-email.ts.
 */
export function looksLikeCode(value: string): boolean {
  return /^\d{6,10}$/.test(value.trim());
}
