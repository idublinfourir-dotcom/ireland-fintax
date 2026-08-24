"use server";

/* Generic "Mark reviewed" action for the dashboard review reminder.

   Dispatches by calculator key: CGT stamps its own cgt_settings row; the
   Project-B calculators stamp their calculator_settings row via the shared
   helper. Audit area is `<key>-settings`, matching each editor's own writes.
   Re-checks requireAdmin. */

import { revalidatePath } from "next/cache";
import { query } from "../lib/db";
import { requireAdmin } from "../lib/supabase/guards";
import { markCalculatorReviewed } from "../lib/calculator-settings";
import { recordAudit } from "../lib/rate-audit";
import { EDITABLE_CALCULATORS } from "../lib/editable-calculators";

export async function markCalculatorReviewedAction(formData: FormData): Promise<void> {
  const user = await requireAdmin();
  const key = String(formData.get("key") ?? "").trim();
  const entry = EDITABLE_CALCULATORS.find((c) => c.key === key);
  if (!entry) return;

  if (key === "cgt") {
    // CGT keeps its reviewed_at in its own table.
    try {
      await query(`update cgt_settings set reviewed_at = now() where id = 1`);
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
