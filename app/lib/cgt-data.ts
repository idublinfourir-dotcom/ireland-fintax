/* Server-side loader for the Ireland CGT calculator.
   Reads the editable config (cgt_settings, a singleton document) and the
   indexation multiplier table (cgt_multipliers, 29 documents), both editable in
   /admin/cgt-rates; falls back to the versioned constants in ireland-cgt.ts
   when the database is unreachable, a document is missing, or a stored value
   fails validation — so the calculator never renders broken numbers. */

import { cgtMultipliersCollection, cgtSettingsCollection } from "./collections";
import { isDbConfigured } from "./db-config";
import {
  CGT_CONFIG_DEFAULT,
  CGT_MULTIPLIERS_DEFAULT,
  parseCgtConfig,
  type CgtConfig,
  type CgtMultiplier,
} from "./ireland-cgt";

export interface CgtData {
  config: CgtConfig;
  multipliers: CgtMultiplier[];
  /** When the CGT rates were last reviewed/changed (ISO string), or null. */
  reviewedAt: string | null;
}

/**
 * Load the CGT config + multipliers: stored documents when present and valid,
 * otherwise the versioned code fallback. Never throws.
 */
export async function getCgtData(): Promise<CgtData> {
  // No backend configured: the versioned defaults ARE the answer.
  if (!isDbConfigured()) {
    return {
      config: CGT_CONFIG_DEFAULT,
      multipliers: CGT_MULTIPLIERS_DEFAULT,
      reviewedAt: null,
    };
  }

  try {
    const [settings, multipliersCollection] = await Promise.all([
      cgtSettingsCollection(),
      cgtMultipliersCollection(),
    ]);

    const [settingsDoc, multiplierDocs] = await Promise.all([
      settings.findOne({ _id: 1 }),
      multipliersCollection.find().sort({ sortOrder: 1 }).toArray(),
    ]);

    const config = parseCgtConfig(settingsDoc?.config) ?? CGT_CONFIG_DEFAULT;
    const reviewedAt = settingsDoc?.reviewedAt?.toISOString() ?? null;

    // Multipliers are stored as numbers, but a hand-edited document could
    // hold anything — drop rows that are not a usable multiplier rather than
    // rendering NaN.
    let multipliers: CgtMultiplier[] = CGT_MULTIPLIERS_DEFAULT;
    if (multiplierDocs.length > 0) {
      const parsed = multiplierDocs
        .map((r) => ({
          yearKey: r._id,
          yearLabel: r.yearLabel,
          sortOrder: r.sortOrder,
          multiplier: Number(r.multiplier),
        }))
        .filter((m) => Number.isFinite(m.multiplier) && m.multiplier > 0);
      if (parsed.length > 0) multipliers = parsed;
    }

    return { config, multipliers, reviewedAt };
  } catch (err) {
    console.error("[cgt] DB read failed, using static defaults:", err);
    return {
      config: CGT_CONFIG_DEFAULT,
      multipliers: CGT_MULTIPLIERS_DEFAULT,
      reviewedAt: null,
    };
  }
}
