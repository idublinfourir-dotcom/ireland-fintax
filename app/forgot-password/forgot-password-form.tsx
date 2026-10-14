"use client";

import Link from "../components/locale-link";
import { useActionState, useState } from "react";
import {
  requestResetCode,
  resetPasswordWithCode,
  type CompleteResetState,
  type RequestCodeState,
} from "./actions";
import { PasswordInput } from "../components/password-input";
import { useT } from "../components/locale-link";
import { accountMessages } from "../lib/messages/account";

/* Two SEPARATE <form>s posting to two SEPARATE actions, so rendering one at a
   time is correct here.

   This is not the rule the contact wizard follows. That one is a single <form>
   whose every step stays mounted behind `hidden`, because it posts one
   FormData at the end and unmounting a step would silently drop its fields.
   Nothing is shared between these two posts except the address, which is
   carried across in a hidden input, so there is nothing to drop. Please do not
   "fix" this to match the wizard. */

const inputClasses =
  "w-full rounded-none border border-line bg-canvas px-4 py-3 text-[15px] text-ink placeholder:text-muted focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-primary-500";

const requestInitial: RequestCodeState = {};
const completeInitial: CompleteResetState = {};

function Alert({ children }: { children: React.ReactNode }) {
  return (
    <p
      role="alert"
      className="rounded-none border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
    >
      {children}
    </p>
  );
}

export function ForgotPasswordForm() {
  const t = useT(accountMessages);
  const [requestState, requestAction, requestPending] = useActionState(
    requestResetCode,
    requestInitial,
  );
  const [completeState, completeAction, completePending] = useActionState(
    resetPasswordWithCode,
    completeInitial,
  );

  /* Lets someone who mistyped the address go back without a page load. Kept in
     the client because the server action's returned state is what drives the
     step, and it has no "undo". */
  const [restarted, setRestarted] = useState(false);
  const onStepTwo = Boolean(requestState.sent) && !restarted;

  if (onStepTwo) {
    return (
      <div className="flex flex-col gap-5">
        {/* Says only that we have finished, never whether an account was found.
            The wording has to hold for an address with no account at all. */}
        <p className="rounded-none border border-primary-300 bg-primary-50 px-4 py-3 text-sm text-primary-600">
          {t.forgot.sentIf.split("{email}").map((part, i) =>
            i === 0 ? (
              part
            ) : (
              <span key={i}>
                <span className="font-medium">{requestState.email}</span>
                {part}
              </span>
            ),
          )}
        </p>

        {completeState.error && <Alert>{completeState.error}</Alert>}

        <form action={completeAction} noValidate className="flex flex-col gap-5">
          <input type="hidden" name="email" value={requestState.email ?? ""} />

          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-ink">
              {t.forgot.code}
            </label>
            <input
              id="code"
              name="code"
              type="text"
              /* `one-time-code` plus a numeric mode is what makes iOS and
                 Safari offer the code straight from the mail app. */
              autoComplete="one-time-code"
              inputMode="numeric"
              autoFocus
              required
              className={`${inputClasses} font-mono tracking-[0.3em]`}
              /* No digit count, here or in the label: the length is one
                 constant in lib/auth/reset-tokens.ts and copy that counts the
                 digits would be a lie the moment it moved. */
              placeholder={t.forgot.codePlaceholder}
            />
            <p className="mt-1.5 text-xs text-muted">
              {t.forgot.codeHint}
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              {t.forgot.newPassword}
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
            />
            <p className="mt-1.5 text-xs text-muted">{t.forgot.atLeast8}</p>
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              {t.forgot.confirmNew}
            </label>
            <PasswordInput
              id="confirm"
              name="confirm"
              autoComplete="new-password"
              minLength={8}
            />
          </div>

          <button
            type="submit"
            disabled={completePending}
            className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-none bg-primary-500 px-7 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-default disabled:opacity-60"
          >
            {completePending ? t.forgot.setting : t.forgot.set}
          </button>

          <p className="text-sm text-muted">
            {t.forgot.wrongAddress}{" "}
            <button
              type="button"
              onClick={() => setRestarted(true)}
              className="cursor-pointer font-medium text-primary-500 underline-offset-2 transition-colors duration-200 hover:text-primary-600 hover:underline"
            >
              {t.forgot.startAgain}
            </button>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {requestState.error && <Alert>{requestState.error}</Alert>}

      <form
        action={requestAction}
        noValidate
        className="flex flex-col gap-5"
        onSubmit={() => setRestarted(false)}
      >
        <div>
          <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-ink">
            {t.email}
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={requestState.email ?? ""}
            className={inputClasses}
            placeholder={t.emailPlaceholder}
          />
          <p className="mt-1.5 text-xs text-muted">
            {t.forgot.emailHint}
          </p>
        </div>

        <button
          type="submit"
          disabled={requestPending}
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-none bg-primary-500 px-7 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-default disabled:opacity-60"
        >
          {requestPending ? t.forgot.sending : t.forgot.send}
        </button>

        <p className="text-sm text-muted">
          {t.forgot.remembered}{" "}
          <Link
            href="/login"
            className="font-medium text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            {t.forgot.backToSignIn}
          </Link>
        </p>
      </form>
    </div>
  );
}
