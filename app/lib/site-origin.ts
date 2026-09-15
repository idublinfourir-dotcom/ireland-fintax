/* Where an emailed link should point.

   Pure and free of `next/headers`, so it can be unit-tested and so the
   precedence below is stated once rather than re-derived at each call site.

   The order matters and is the opposite of what it was: a configured
   AUTH_URL WINS over the request's Origin header.

   The header seems convenient because it adapts to whatever host the form was
   posted from, but a link built from it is only valid for the host that
   happened to send the request. Sign up against a dev server and every
   recipient gets http://localhost:3000, which resolves to the reader's own
   machine, and which most mail clients will not even turn into a link. It is
   also the wrong shape on principle: the host of a link this app puts in
   somebody's inbox should not be taken from a request header.

   The header stays as the fallback, because locally there is no AUTH_URL and
   the header is then exactly right. */

export function resolveEmailOrigin(input: {
  /** AUTH_URL: the canonical origin, set in production only. */
  configured?: string | null;
  /** The request's Origin header, when there is one. */
  originHeader?: string | null;
  /** Last resort, the site's own published URL. */
  fallback: string;
}): string {
  const trim = (value: string | null | undefined) =>
    value?.trim().replace(/\/+$/, "") || "";

  return trim(input.configured) || trim(input.originHeader) || trim(input.fallback);
}
