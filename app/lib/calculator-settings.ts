/* Shared server-side loader for admin-editable calculator configs.

   One document per calculator in `calculator_settings`, keyed by the
   calculator slug and editable in /admin/<calc>-rates. Every calculator's
   `*-data.ts` is a thin typed wrapper around getCalculatorConfig: it passes its
   own `parse` + code-default `fallback`, so a missing document / invalid stored
   value / database error all resolve to today's versioned numbers — the tool
   never renders broken data.

   Mirrors cgt-data.ts, but generic: CGT keeps its own two-collection loader
   (cgt_settings + cgt_multipliers); the four Project-B calculators share this.

   The config is stored as a real subdocument rather than a JSON string, so it
   arrives back already parsed and stays queryable. */

import { calculatorSettingsCollection } from "./collections";
import { isDbConfigured } from "./db-config";

export interface CalculatorConfigResult<T> {
  config: T;
  /** When this calculator was last reviewed/saved (ISO string), or null. */
  reviewedAt: string | null;
}

/**
 * Load a calculator's config: the stored document when present and valid,
 * otherwise the code fallback. `parse` returns a valid typed config or null
 * (reject partial / malformed values). Never throws — any failure falls back
 * to `fallback`.
 */
export async function getCalculatorConfig<T>(
  key: string,
  parse: (raw: unknown) => T | null,
  fallback: T,
): Promise<CalculatorConfigResult<T>> {
  // No backend configured: the code default IS the answer, so don't open a
  // connection just to fail and catch. Keeps `next build` quiet on a fresh
  // clone with no .env.local.
  if (!isDbConfigured()) return { config: fallback, reviewedAt: null };

  try {
    const settings = await calculatorSettingsCollection();
    const doc = await settings.findOne({ _id: key });

    return {
      config: parse(doc?.config) ?? fallback,
      reviewedAt: doc?.reviewedAt?.toISOString() ?? null,
    };
  } catch (err) {
    console.error(`[calc:${key}] DB read failed, using static defaults:`, err);
    return { config: fallback, reviewedAt: null };
  }
}

/**
 * Upsert a calculator's config and stamp it reviewed now. The caller is
 * responsible for validating `config` before this point (guardrails); we only
 * store it. Throws on error so the action can surface a message.
 */
export async function saveCalculatorConfig(
  key: string,
  config: unknown,
): Promise<void> {
  const settings = await calculatorSettingsCollection();
  const now = new Date();
  await settings.updateOne(
    { _id: key },
    { $set: { config, reviewedAt: now, updatedAt: now } },
    { upsert: true },
  );
}

/**
 * Stamp reviewedAt = now without touching config. If the calculator has no
 * document yet (serving code defaults), inserts a CONFIG-LESS one (config stays
 * null → the code fallback remains authoritative, so no rate drift) purely to
 * record the review date — this lets the admin dismiss the reminder for an
 * un-customised calculator. Never throws — a review stamp must not block the
 * admin.
 */
export async function markCalculatorReviewed(key: string): Promise<void> {
  try {
    const settings = await calculatorSettingsCollection();
    const now = new Date();
    await settings.updateOne(
      { _id: key },
      {
        $set: { reviewedAt: now, updatedAt: now },
        $setOnInsert: { config: null },
      },
      { upsert: true },
    );
  } catch (err) {
    console.error(`[calc:${key}] mark reviewed failed:`, err);
  }
}
