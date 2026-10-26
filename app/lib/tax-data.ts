/* Server-side loader for the Ireland income tax calculator.
   Reads the per-year rate config from `tax_rates` (one document per tax year,
   keyed by the year, editable in /admin/tax-rates); falls back to the versioned
   RATES_<year> configs in ireland-income-tax.ts when the DB is unreachable,
   the document is missing, or the stored value fails validation — so the
   calculator never renders with broken numbers. The stored shape is in
   tax-rates-parse.ts. */

import { taxRatesCollection } from "./collections";
import { isDbConfigured } from "./db-config";
import { cache } from "react";
import type { YearRates } from "./ireland-income-tax";
import { FALLBACK, TAX_YEARS, parseYearRates } from "./tax-rates-parse";

export { TAX_YEARS, parseYearRates, yearRatesToJson } from "./tax-rates-parse";

/* ---------- loader ---------- */

/* Cached per request, so a page and its metadata share one read. */
export const getTaxRates = cache(async (): Promise<Record<number, YearRates>> => {
  // No backend configured: the versioned RATES_<year> configs ARE the answer.
  if (!isDbConfigured()) return { ...FALLBACK };

  try {
    const taxRates = await taxRatesCollection();
    const docs = await taxRates.find({ _id: { $in: [...TAX_YEARS] } }).toArray();

    const out: Record<number, YearRates> = { ...FALLBACK };
    for (const doc of docs) {
      const parsed = parseYearRates(doc._id, doc.rates);
      if (parsed) out[doc._id] = parsed;
      else console.error(`[tax] stored rates for ${doc._id} failed validation — using fallback`);
    }
    return out;
  } catch (err) {
    console.error("[tax] DB read failed, using static rate configs:", err);
    return { ...FALLBACK };
  }
});
