/* What Vercel Web Analytics is allowed to see of an address. PURE, tested.
   Some addresses here carry one-time secrets (/auth/confirm?token=...) or
   personal paths, so the query string and fragment are always dropped, and
   the admin, auth, API and member areas are not counted at all (with or
   without a language prefix). See components/site-analytics.tsx and the
   privacy page. */

const NOT_COUNTED = /^\/(?:[a-z]{2}\/)?(?:admin|auth|api|portal)(?:\/|$)/;

/** The address to report, or null to send nothing. */
export function analyticsUrl(raw: string, origin: string): string | null {
  let url: URL;
  try {
    url = new URL(raw, origin);
  } catch {
    return null;
  }
  if (NOT_COUNTED.test(url.pathname)) return null;
  url.search = "";
  url.hash = "";
  return url.toString();
}
