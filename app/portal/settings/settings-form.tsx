"use client";

import { useActionState } from "react";
import { Panel } from "../../components/dashboard-ui";
import { PasswordInput } from "../../components/password-input";
import {
  deleteAccountAction,
  updateNameAction,
  updatePasswordAction,
  type SettingsState,
} from "./actions";
import { useT } from "../../components/locale-link";
import { accountMessages } from "../../lib/messages/account";

const initial: SettingsState = {};

const inputClasses =
  "w-full rounded-none border border-line bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500";

const labelClasses = "mb-1.5 block text-sm font-medium text-ink";

const buttonClasses =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-none bg-primary-500 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-default disabled:opacity-60";

const deleteButtonClasses =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-none bg-red-700 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-red-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-700 disabled:cursor-default disabled:opacity-60";

function Message({ state }: { state: SettingsState }) {
  if (state.error)
    return (
      <p
        role="alert"
        className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
      >
        {state.error}
      </p>
    );
  if (state.ok)
    return (
      <p className="rounded-none border border-primary-300 bg-primary-50 px-4 py-3 text-sm text-primary-600">
        {state.ok}
      </p>
    );
  return null;
}

export function SettingsForm({
  fullName,
  email,
  hasPassword,
  canDelete,
}: {
  fullName: string;
  email: string;
  /** False for an account made through Google with no password set yet:
      there is no current password to ask for. */
  hasPassword: boolean;
  /** Members only; admin accounts are removed in the database. */
  canDelete: boolean;
}) {
  const t = useT(accountMessages).settings;
  const [nameState, nameAction, namePending] = useActionState(
    updateNameAction,
    initial,
  );
  const [pwState, pwAction, pwPending] = useActionState(
    updatePasswordAction,
    initial,
  );
  const [delState, delAction, delPending] = useActionState(
    deleteAccountAction,
    initial,
  );

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* Display name */}
      <Panel className="p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {t.displayName}
        </h3>
        <form action={nameAction} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="full_name" className={labelClasses}>
              {t.fullName}
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              defaultValue={fullName}
              className={inputClasses}
              placeholder={t.namePlaceholder}
            />
          </div>
          <p className="text-sm text-muted">
            {t.signedInAs.split("{email}")[0]}
            <span className="text-ink">{email}</span>
            {t.signedInAs.split("{email}")[1]}
          </p>
          <Message state={nameState} />
          <div>
            <button type="submit" disabled={namePending} className={buttonClasses}>
              {namePending ? t.saving : t.saveName}
            </button>
          </div>
        </form>
      </Panel>

      {/* Password */}
      <Panel className="p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          {t.password}
        </h3>
        <form action={pwAction} className="mt-4 flex flex-col gap-4">
          {hasPassword && (
            <div>
              <label htmlFor="current" className={labelClasses}>
                {t.currentPassword}
              </label>
              <PasswordInput
                id="current"
                name="current"
                autoComplete="current-password"
              />
            </div>
          )}
          <div>
            <label htmlFor="password" className={labelClasses}>
              {t.newPassword}
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className={labelClasses}>
              {t.confirmNew}
            </label>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
            />
          </div>
          <Message state={pwState} />
          <div>
            <button type="submit" disabled={pwPending} className={buttonClasses}>
              {pwPending ? t.updating : t.updatePassword}
            </button>
          </div>
        </form>
      </Panel>

      {/* Delete account */}
      {canDelete && (
        <Panel className="p-6">
          <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            {t.deleteTitle}
          </h3>
          <form action={delAction} className="mt-4 flex flex-col gap-4">
            <p className="text-sm text-ink">{t.deleteIntro}</p>
            <div>
              <label htmlFor="confirm_email" className={labelClasses}>
                {t.confirmEmail}
              </label>
              <input
                id="confirm_email"
                name="confirm_email"
                type="email"
                autoComplete="off"
                spellCheck={false}
                className={inputClasses}
                placeholder={email}
              />
            </div>
            {hasPassword && (
              <div>
                <label htmlFor="delete_current" className={labelClasses}>
                  {t.currentPassword}
                </label>
                <PasswordInput
                  id="delete_current"
                  name="current"
                  autoComplete="current-password"
                />
              </div>
            )}
            <Message state={delState} />
            <div>
              <button
                type="submit"
                disabled={delPending}
                className={deleteButtonClasses}
              >
                {delPending ? t.deleting : t.deleteAccount}
              </button>
            </div>
          </form>
        </Panel>
      )}
    </div>
  );
}
