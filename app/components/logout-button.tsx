"use client";

import { useFormStatus } from "react-dom";
import { Spinner } from "./spinner";

/** Submit button for the sign-out form; shows a pending state while redirecting. */
export function LogoutButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex cursor-pointer items-center gap-2 rounded-none border border-line px-4 py-2 text-sm font-medium text-ink transition-colors duration-200 hover:bg-surface-muted disabled:cursor-default disabled:opacity-60"
    >
      {pending && <Spinner className="h-4 w-4 text-primary-500" />}
      {pending ? "Signing out…" : "Log out"}
    </button>
  );
}
