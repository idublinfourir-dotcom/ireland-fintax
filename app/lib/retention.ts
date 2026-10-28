/* How long personal data is kept, as promised on /privacy. Pure, so the rule
   is unit-tested; scripts/retention-cleanup.ts applies it once a month
   (.github/workflows/retention.yml). Change the privacy page with it. */

/** Questions, their replies and resource requests are deleted this long
    after the last activity. */
export const RETENTION_YEARS = 2;

/** The moment before which data is out of date: `years` before `now`. */
export function retentionCutoff(now: Date, years: number = RETENTION_YEARS): Date {
  const cutoff = new Date(now.getTime());
  cutoff.setUTCFullYear(cutoff.getUTCFullYear() - years);
  return cutoff;
}

/** Questions whose last message, from either side, is before the cutoff.
    `lastAdminMessageAt: null` also matches a question never answered. */
export function staleEnquiryFilter(cutoff: Date) {
  return {
    lastClientMessageAt: { $lt: cutoff },
    $or: [{ lastAdminMessageAt: null }, { lastAdminMessageAt: { $lt: cutoff } }],
  };
}

/** Resource requests made before the cutoff. */
export function staleToolkitRequestFilter(cutoff: Date) {
  return { createdAt: { $lt: cutoff } };
}
