/* Validate a caller-supplied post-sign-in destination. Pure, unit-tested.

   One implementation, used by every place that honours a `next` parameter,
   because the naive version of this check is subtly wrong and three
   hand-written copies is how the fourth one gets it wrong too. */

/**
 * The same-origin path in `value`, or null when it is not one.
 *
 * Resolves against a fixed origin and checks the result STAYED there, rather
 * than pattern-matching the string. String tests are not sufficient:
 * `startsWith("/") && !startsWith("//")` looks airtight and is not, because
 * browsers treat a backslash as a slash in the authority position. `/\evil.ie`
 * passes that test and resolves to `//evil.ie`, which is a different site. A
 * sign-in page that can be made to land on an attacker's copy of itself is a
 * phishing primitive: the victim authenticates on the real domain, with the
 * real certificate, and is then handed to the fake.
 *
 * Returns the re-serialised path, not the input, so only the parts that
 * survived parsing are ever used.
 */
export function safeRedirectPath(value: string | null | undefined): string | null {
  const raw = value?.trim();
  if (!raw || !raw.startsWith("/")) return null;

  // Any origin works; it exists only to be compared against.
  const BASE = "http://redirect.invalid";
  try {
    const url = new URL(raw, BASE);
    if (url.origin !== BASE) return null;
    return `${url.pathname}${url.search}${url.hash}`;
  } catch {
    return null;
  }
}

/** `safeRedirectPath`, falling back to a trusted default. */
export function safeRedirectOr(
  value: string | null | undefined,
  fallback: string,
): string {
  return safeRedirectPath(value) ?? fallback;
}
