"use server";

import { revalidatePath } from "next/cache";
import { AuthError } from "next-auth";
import { signIn, updateSession } from "../../../auth";
import { requireUser } from "../../lib/auth/guards";
import { toObjectId, usersCollection } from "../../lib/collections";
import { hashPassword } from "../../lib/auth/password";
import { isAuthConfigured } from "../../lib/auth/config";
import {
  validateDisplayName,
  validatePassword,
} from "../../lib/account-validation";
import { getT } from "../../lib/messages";
import { accountMessages } from "../../lib/messages/account";

export type SettingsState = { ok?: string; error?: string };

/* Guarded with requireUser, not requireClient.
 *
 * Every write here is scoped to the caller's OWN account id, so the role is
 * irrelevant to what can be changed, and requireClient bounced admins to
 * /admin. That left an admin with no way to set or rotate their own password
 * anywhere in the app: the one account type that can edit published tax rates
 * was also the one that could not fix a password it thought was compromised.
 * The area pages still guard their own access; this only decides who may edit
 * themselves, which is everyone. */

/** Update the client's display name. A single write: the credentials and the
 *  profile live in one account document, so there is nothing to keep in
 *  sync. */
export async function updateNameAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const t = (await getT(accountMessages)).errors;
  const user = await requireUser();
  const fullName = String(formData.get("full_name") ?? "").trim();

  const invalid = validateDisplayName(fullName, t);
  if (invalid) return { error: invalid };

  if (!isAuthConfigured()) return { error: t.notConfigured };

  const id = toObjectId(user.id);
  if (!id) return { error: t.nameSaveFailed };

  try {
    const users = await usersCollection();
    await users.updateOne({ _id: id }, { $set: { name: fullName } });

    // The header renders the name from the session token, not the database,
    // so re-stamp it or the old one stays on screen until the next sign-in.
    await updateSession({ user: { name: fullName } });
  } catch (err) {
    console.error("[settings] name update failed:", err);
    return { error: t.nameSaveFailed };
  }

  revalidatePath("/portal/settings");
  revalidatePath("/portal");
  revalidatePath("/admin/settings");
  return { ok: t.nameSaved };
}

/** Change the password on the active session. No current-password re-auth
 *  (per approved design). */
export async function updatePasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const t = (await getT(accountMessages)).errors;
  const user = await requireUser();
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const invalid = validatePassword(password, confirm, t);
  if (invalid) return { error: invalid };

  if (!isAuthConfigured()) return { error: t.notConfigured };

  const id = toObjectId(user.id);
  if (!id) return { error: t.passwordSaveFailed };

  try {
    const users = await usersCollection();
    // Also fills in a password for an account created through Google, which is
    // what "set a password" means for those users.
    await users.updateOne(
      { _id: id },
      {
        $set: {
          passwordHash: await hashPassword(password),
          /* Ends every session opened before now, the same way a reset does.
             Changing your password is what someone does when they think
             another person has their account, and without this stamp that
             remedy did nothing: the other session kept working until its token
             expired, up to 30 days. See the jwt callback in auth.ts. */
          passwordChangedAt: new Date(),
        },
      },
    );
  } catch (err) {
    console.error("[settings] password update failed:", err);
    return { error: t.passwordSaveFailed };
  }

  /* Re-mint THIS browser's session, or the stamp above would sign the author
     out along with everyone else the moment the next check ran. Minting after
     the write means the new token is the only one that survives it. Signing
     in again is how the reset flow does this, and the password is already in
     hand here, so there is nothing to prompt for.

     Best-effort: the password has already changed, which is the part that
     matters. A failure here costs a re-login, not the update. */
  try {
    await signIn("credentials", { email: user.email, password, redirect: false });
  } catch (err) {
    if (!(err instanceof AuthError)) throw err;
    console.error("[settings] password changed but re-signing in failed:", err.type);
  }

  return { ok: t.passwordSaved };
}
