"use client";

import { useActionState } from "react";
import { runNewsAgentAction, type RunNowState } from "./actions";

/** Starts the news agent on GitHub Actions. Shown always; without
    GITHUB_DISPATCH_TOKEN it is disabled and says why, rather than vanishing. */
export function RunNowButton({ configured }: { configured: boolean }) {
  const [state, action, pending] = useActionState<RunNowState>(runNewsAgentAction, { status: "idle" });
  return (
    <form action={action} className="flex flex-col items-end gap-1.5">
      <button
        type="submit"
        disabled={pending || !configured}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-none bg-primary-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? "Starting…" : "Run now"}
      </button>
      {!configured ? (
        <p className="max-w-xs text-right text-xs text-muted">
          Needs <code className="font-mono">GITHUB_DISPATCH_TOKEN</code> in this site&apos;s environment (then a
          redeploy). Scheduled runs work without it.
        </p>
      ) : (
        state.message && (
          <p
            role={state.status === "error" ? "alert" : "status"}
            className={`max-w-xs text-right text-xs font-medium ${state.status === "error" ? "text-primary-600" : "text-secondary-600"}`}
          >
            {state.message}
          </p>
        )
      )}
    </form>
  );
}
