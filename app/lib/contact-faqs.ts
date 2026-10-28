/* Related-FAQ data + matcher for the contact wizard. PURE (no React/IO) so
   getRelatedFaqs is unit-testable and can be imported by both the client
   component and node --test.

   Each FAQ links to the page or calculator that answers it, so the contact form
   can quietly deflect a common question to a real answer while the user types.
   Every entry points at a tax tool: the Services pages are hidden, so nothing
   here may link into /services. */

export interface ContactFaq {
  /** The question, as a user might phrase it. */
  q: string;
  /** A one-line answer/teaser. */
  a: string;
  /** Where to send them for the full answer. */
  href: string;
  /** Lowercase substrings matched against the typed message. */
  keywords: string[];
}

export const CONTACT_FAQS: ContactFaq[] = [
  {
    q: "Do I have to register for VAT?",
    a: "The thresholds are €85,000 for goods and €42,500 for services in any 12 months. Our VAT tool shows your net position.",
    href: "/tools/ireland-vat",
    keywords: ["vat", "register for vat", "vat3", "threshold"],
  },
  {
    q: "How much Capital Gains Tax will I pay?",
    a: "CGT is 31% on disposals from 7 October 2026 (33% before), with indexation relief on older assets. Estimate it with the CGT calculator.",
    href: "/tools/ireland-cgt",
    keywords: ["capital gains", "cgt", "selling", "sold", "disposal", "shares"],
  },
  {
    q: "Is a gift or inheritance taxable?",
    a: "Capital Acquisitions Tax at 33% above your group threshold, with agricultural and business relief. Try the CAT calculator.",
    href: "/tools/ireland-cat",
    keywords: ["gift", "inheritance", "inherit", "cat", "estate", "family farm", "bequest"],
  },
  {
    q: "What Corporation Tax rate applies?",
    a: "12.5% on trading profits, 25% on passive income. The corporation tax tool totals it for you.",
    href: "/tools/ireland-corporation-tax",
    keywords: ["corporation tax", "corporate tax", "trading profit", "12.5", "company tax"],
  },
];

/* Bengali য় and Devanagari ज़, ड़, फ़ … each have two encodings: one code point
   or the letter plus a nukta. Keyboards differ in which they send, so both
   sides are brought to NFC before comparing, or "শেয়ার" typed one way misses
   the keyword written the other. */
const fold = (s: string) => s.normalize("NFC").toLowerCase();

/**
 * Return the FAQs whose keywords appear in the message (case-insensitive
 * substring), most nothing-fancy first, capped at `limit`. Empty/whitespace
 * message → no FAQs.
 */
export function getRelatedFaqs(
  message: string,
  faqs: ContactFaq[] = CONTACT_FAQS,
  limit = 2,
): ContactFaq[] {
  const text = fold(message.trim());
  if (!text) return [];
  return faqs
    .filter((f) => f.keywords.some((k) => text.includes(fold(k))))
    .slice(0, limit);
}
