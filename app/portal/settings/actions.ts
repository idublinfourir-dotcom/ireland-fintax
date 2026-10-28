"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { AuthError } from "next-auth";
import { signIn, signOut, updateSession } from "../../../auth";
import { requireUser } from "../../lib/auth/guards";
import { toObjectId, usersCollection } from "../../lib/collections";
import { hashPassword, verifyPassword } from "../../lib/auth/password";
import { isAuthConfigured } from "../../lib/auth/config";
import {
  validateDisplayName,
  validatePassword,
} from "../../lib/account-validation";
import { deleteAccountData } from "../../lib/account-deletion";
import { allowPublicAction } from "../../lib/rate-limit";
import { getT, localePath } from "../../lib/messages";
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
  // Capped: the name rides in the session cookie.
  const fullName = String(formData.get("full_name") ?? "").trim().slice(0, 120);

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

/**
 * Is `current` this account's password? True when the account has no password
 * at all (signed up through Google), since there is nothing to ask for.
 *
 * Asked before a password change or a deletion so that a session left open
 * on a shared computer, or taken some other way, cannot lock the owner out or
 * erase the account. Capped per account and fails closed: without the cap a
 * session holder could guess the password at the server's pace.
 */
async function currentPasswordOk(
  userId: string,
  passwordHash: string | null | undefined,
  current: string,
): Promise<"ok" | "wrong" | "limited"> {
  if (!passwordHash) return "ok";
  const allowed = await allowPublicAction({
    action: "current-password",
    identity: userId,
    ip: { max: 30, windowSeconds: 15 * 60 },
    identityLimit: { max: 5, windowSeconds: 15 * 60 },
    failClosed: true,
  });
  if (!allowed) return "limited";
  return current && (await verifyPassword(current, passwordHash)) ? "ok" : "wrong";
}

/** Change the password on the active session. Asks for the current password
 *  when the account has one. */
export async function updatePasswordAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const t = (await getT(accountMessages)).errors;
  const user = await requireUser();
  const current = String(formData.get("current") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  const invalid = validatePassword(password, confirm, t);
  if (invalid) return { error: invalid };

  if (!isAuthConfigured()) return { error: t.notConfigured };

  const id = toObjectId(user.id);
  if (!id) return { error: t.passwordSaveFailed };

  try {
    const users = await usersCollection();
    const account = await users.findOne({ _id: id }, { projection: { passwordHash: 1 } });
    if (!account) return { error: t.passwordSaveFailed };
    const check = await currentPasswordOk(user.id, account.passwordHash, current);
    if (check === "limited") return { error: t.tooManyPasswordAttempts };
    if (check === "wrong") return { error: t.currentPasswordWrong };

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

/**
 * Delete the caller's own account and everything tied to it (see
 * lib/account-deletion.ts), then sign out. Needs the account's email address
 * typed out, and the current password when the account has one.
 *
 * Members only. An admin account is removed in the database, deliberately:
 * deleting the last admin from a settings page would leave nobody able to
 * answer questions or edit rates.
 */
export async function deleteAccountAction(
  _prev: SettingsState,
  formData: FormData,
): Promise<SettingsState> {
  const t = (await getT(accountMessages)).errors;
  const user = await requireUser();
  if (user.role === "admin") return { error: t.deleteFailed };
  if (!isAuthConfigured()) return { error: t.notConfigured };

  const typed = String(formData.get("confirm_email") ?? "").trim().toLowerCase();
  if (typed !== user.email.trim().toLowerCase()) return { error: t.deleteEmailMismatch };

  const id = toObjectId(user.id);
  if (!id) return { error: t.deleteFailed };

  try {
    const users = await usersCollection();
    const account = await users.findOne(
      { _id: id },
      { projection: { passwordHash: 1, email: 1 } },
    );
    if (!account) return { error: t.deleteFailed };
    const check = await currentPasswordOk(
      user.id,
      account.passwordHash,
      String(formData.get("current") ?? ""),
    );
    if (check === "limited") return { error: t.tooManyPasswordAttempts };
    if (check === "wrong") return { error: t.currentPasswordWrong };

    await deleteAccountData(id, account.email);
  } catch (err) {
    console.error("[settings] account deletion failed:", err);
    return { error: t.deleteFailed };
  }

  // The account is gone, so any other session ends at its next check (see
  // auth.ts). This one ends now.
  try {
    await signOut({ redirect: false });
  } catch (err) {
    if (!(err instanceof AuthError)) throw err;
    console.error("[settings] account deleted but signing out failed:", err.type);
  }
  redirect(await localePath("/login?notice=deleted"));
}
