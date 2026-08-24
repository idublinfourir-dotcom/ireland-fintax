"use server";

import { revalidatePath } from "next/cache";
import { requireClient } from "../../lib/supabase/guards";
import { createClient } from "../../lib/supabase/server";
import {
  isSupabaseConfigured,
  SUPABASE_NOT_CONFIGURED,
} from "../../lib/supabase/config";
import { query } from "../../lib/db";
import {
  validateDisplayName,
  validatePassword,
} from "../../lib/account-validation";

export type SettingsState = { ok?: string; error?: string };

/** Update the client's display name in auth user_metadata (header) AND
 *  profiles (portal). Both stores are written so the two stay in sync. */
export async function updateNameAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireClient();
  const fullName = String(formData.get("full_name") ?? "").trim();

  const invalid = validateDisplayName(fullName);
  if (invalid) return { error: invalid };

  try {
    if (!isSupabaseConfigured()) return { error: SUPABASE_NOT_CONFIGURED };
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({
      data: { full_name: fullName },
    });
    if (error) throw error;

    await query("update public.profiles set full_name = $1 where id = $2", [
      fullName,
      user.id,
    ]);
  } catch (err) {
    console.error("[settings] name update failed:", err);
    return { error: "Couldn't save your name. Please try again." };
  }

  revalidatePath("/portal/settings");
  revalidatePath("/portal");
  return { ok: "Name updated." };
}

/** Change the password on the active session. No current-password re-auth
 *  (per approved design). */
export async function updatePasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  await requireClient();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const invalid = validatePassword(password, confirm);
  if (invalid) return { error: invalid };

  try {
    if (!isSupabaseConfigured()) return { error: SUPABASE_NOT_CONFIGURED };
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) throw error;
  } catch (err) {
    console.error("[settings] password update failed:", err);
    return { error: "Couldn't update your password. Please try again." };
  }

  return { ok: "Password updated." };
}
