import { headers } from "next/headers";

/* Structured data for search engines (schema.org JSON-LD). It carries the
   request's CSP nonce like every other script on the page, and "<" is escaped
   so text from a post can never close the tag. */
export async function JsonLd({ data }: { data: Record<string, unknown> }) {
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  return (
    <script
      type="application/ld+json"
      nonce={nonce}
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, "\\u003c") }}
    />
  );
}
