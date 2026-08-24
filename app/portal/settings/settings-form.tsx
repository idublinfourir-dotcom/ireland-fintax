"use client";

import { useActionState } from "react";
import { Panel } from "../../components/dashboard-ui";
import { PasswordInput } from "../../components/password-input";
import {
  updateNameAction,
  updatePasswordAction,
  type SettingsState,
} from "./actions";

const initial: SettingsState = {};

const inputClasses =
  "w-full rounded-none border border-line bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500";

const labelClasses = "mb-1.5 block text-sm font-medium text-ink";

const buttonClasses =
  "inline-flex h-11 cursor-pointer items-center justify-center rounded-none bg-primary-500 px-6 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-default disabled:opacity-60";

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
}: {
  fullName: string;
  email: string;
}) {
  const [nameState, nameAction, namePending] = useActionState(
    updateNameAction,
    initial,
  );
  const [pwState, pwAction, pwPending] = useActionState(
    updatePasswordAction,
    initial,
  );

  return (
    <div className="mt-8 flex flex-col gap-6">
      {/* Display name */}
      <Panel className="p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Display name
        </h3>
        <form action={nameAction} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="full_name" className={labelClasses}>
              Full name
            </label>
            <input
              id="full_name"
              name="full_name"
              type="text"
              autoComplete="name"
              defaultValue={fullName}
              className={inputClasses}
              placeholder="Jane Doe"
            />
          </div>
          <p className="text-sm text-muted">
            Signed in as <span className="text-ink">{email}</span>
          </p>
          <Message state={nameState} />
          <div>
            <button type="submit" disabled={namePending} className={buttonClasses}>
              {namePending ? "Saving…" : "Save name"}
            </button>
          </div>
        </form>
      </Panel>

      {/* Password */}
      <Panel className="p-6">
        <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Password
        </h3>
        <form action={pwAction} className="mt-4 flex flex-col gap-4">
          <div>
            <label htmlFor="password" className={labelClasses}>
              New password
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
            />
          </div>
          <div>
            <label htmlFor="confirm" className={labelClasses}>
              Confirm new password
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
              {pwPending ? "Updating…" : "Update password"}
            </button>
          </div>
        </form>
      </Panel>
    </div>
  );
}
