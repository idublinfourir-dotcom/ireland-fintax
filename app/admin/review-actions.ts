"use server";

/* Generic "Mark reviewed" action for the dashboard review reminder.

   Dispatches by calculator key: CGT stamps its own cgt_settings row; the
   Project-B calculators stamp their calculator_settings row via the shared
   helper. Audit area is `<key>-settings`, matching each editor's own writes.
   Re-checks requireAdmin. */

import { revalidatePath } from "next/cache";
import { cgtSettingsCollection } from "../lib/collections";
import { requireAdmin } from "../lib/auth/guards";
import { markCalculatorReviewed } from "../lib/calculator-settings";
import { recordAudit } from "../lib/rate-audit";
import { EDITABLE_CALCULATORS } from "../lib/editable-calculators";

export async function markCalculatorReviewedAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const key = String(formData.get("key") ?? "").trim();
  const entry = EDITABLE_CALCULATORS.find((c) => c.key === key);
  if (!entry) return;

  if (key === "cgt") {
    // CGT keeps its reviewedAt in its own collection. Upserted, like
    // markCalculatorReviewed does for the other five: with no document yet the
    // SQL UPDATE this replaces silently did nothing, so the reminder could not
    // be dismissed for an un-customised CGT. A config-less document leaves the
    // code defaults authoritative, so no rate moves.
    try {
      const settings = await cgtSettingsCollection();
      await settings.updateOne(
        { _id: 1 },
        {
          $set: { reviewedAt: new Date() },
          $setOnInsert: { config: null, updatedAt: new Date() },
        },
        { upsert: true },
      );
    } catch (err) {
      console.error("[cgt] mark reviewed failed:", err);
      return;
    }
  } else {
    await markCalculatorReviewed(key);
  }

  await recordAudit({
    area: `${key}-settings`,
    action: "reviewed",
    summary: `Marked ${entry.label} reviewed (no change)`,
    changedBy: user.email ?? "admin",
  });

  revalidatePath("/admin");
  revalidatePath(entry.adminHref);
}
