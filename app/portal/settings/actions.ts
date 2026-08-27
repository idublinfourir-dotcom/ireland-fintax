"use server";

import { revalidatePath } from "next/cache";
import { updateSession } from "../../../auth";
import { requireClient } from "../../lib/auth/guards";
import { toObjectId, usersCollection } from "../../lib/collections";
import { hashPassword } from "../../lib/auth/password";
import { AUTH_NOT_CONFIGURED, isAuthConfigured } from "../../lib/auth/config";
import {
  validateDisplayName,
  validatePassword,
} from "../../lib/account-validation";

export type SettingsState = { ok?: string; error?: string };

/** Update the client's display name. One write now that the account and the
 *  profile are the same document — the two stores that used to be kept in
 *  sync (auth user_metadata and public.profiles) are one. */
export async function updateNameAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const user = await requireClient();
  const fullName = String(formData.get("full_name") ?? "").trim();

  const invalid = validateDisplayName(fullName);
  if (invalid) return { error: invalid };

  if (!isAuthConfigured()) return { error: AUTH_NOT_CONFIGURED };

  const id = toObjectId(user.id);
  if (!id) return { error: "Couldn't save your name. Please try again." };

  try {
    const users = await usersCollection();
    await users.updateOne({ _id: id }, { $set: { name: fullName } });

    // The header renders the name from the session token, not the database,
    // so re-stamp it or the old one stays on screen until the next sign-in.
    await updateSession({ user: { name: fullName } });
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
  const user = await requireClient();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const invalid = validatePassword(password, confirm);
  if (invalid) return { error: invalid };

  if (!isAuthConfigured()) return { error: AUTH_NOT_CONFIGURED };

  const id = toObjectId(user.id);
  if (!id) return { error: "Couldn't update your password. Please try again." };

  try {
    const users = await usersCollection();
    // Also fills in a password for an account created through Google, which is
    // what "set a password" means for those users.
    await users.updateOne(
      { _id: id },
      { $set: { passwordHash: await hashPassword(password) } },
    );
  } catch (err) {
    console.error("[settings] password update failed:", err);
    return { error: "Couldn't update your password. Please try again." };
  }

  return { ok: "Password updated." };
}
