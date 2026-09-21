"use client";

import Link from "next/link";
import { useActionState, useState } from "react";
import {
  requestResetCode,
  resetPasswordWithCode,
  type CompleteResetState,
  type RequestCodeState,
} from "./actions";
import { PasswordInput } from "../components/password-input";

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
          If <span className="font-medium">{requestState.email}</span> has an
          account with us, a reset code is on its way. Enter it below to set a
          new password.
        </p>

        {completeState.error && <Alert>{completeState.error}</Alert>}

        <form action={completeAction} noValidate className="flex flex-col gap-5">
          <input type="hidden" name="email" value={requestState.email ?? ""} />

          <div>
            <label htmlFor="code" className="mb-1.5 block text-sm font-medium text-ink">
              Reset code
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
              placeholder="Code from your email"
            />
            <p className="mt-1.5 text-xs text-muted">
              It expires in 15 minutes and can be used once. Check your spam
              folder if it hasn&rsquo;t arrived.
            </p>
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              New password
            </label>
            <PasswordInput
              id="password"
              name="password"
              autoComplete="new-password"
              minLength={8}
            />
            <p className="mt-1.5 text-xs text-muted">At least 8 characters.</p>
          </div>

          <div>
            <label
              htmlFor="confirm"
              className="mb-1.5 block text-sm font-medium text-ink"
            >
              Confirm new password
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
            {completePending ? "Setting your password…" : "Set new password"}
          </button>

          <p className="text-sm text-muted">
            Wrong address?{" "}
            <button
              type="button"
              onClick={() => setRestarted(true)}
              className="cursor-pointer font-medium text-primary-500 underline-offset-2 transition-colors duration-200 hover:text-primary-600 hover:underline"
            >
              Start again
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
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            defaultValue={requestState.email ?? ""}
            className={inputClasses}
            placeholder="jane@company.co"
          />
          <p className="mt-1.5 text-xs text-muted">
            We&rsquo;ll email you a code to set a new password.
          </p>
        </div>

        <button
          type="submit"
          disabled={requestPending}
          className="inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-none bg-primary-500 px-7 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 disabled:cursor-default disabled:opacity-60"
        >
          {requestPending ? "Sending…" : "Send reset code"}
        </button>

        <p className="text-sm text-muted">
          Remembered it?{" "}
          <Link
            href="/login"
            className="font-medium text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            Back to sign in
          </Link>
        </p>
      </form>
    </div>
  );
}
