"use client";

import { useActionState } from "react";
import { runNewsAgentAction, type RunNowState } from "./actions";

export function RunNowButton() {
  const [state, action, pending] = useActionState<RunNowState>(runNewsAgentAction, { status: "idle" });
  return (
    <form action={action} className="flex flex-col items-end gap-1.5">
      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-none bg-primary-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending ? "Starting…" : "Run now"}
      </button>
      {state.message && (
        <p
          role={state.status === "error" ? "alert" : "status"}
          className={`max-w-xs text-right text-xs font-medium ${state.status === "error" ? "text-primary-600" : "text-secondary-600"}`}
        >
          {state.message}
        </p>
      )}
    </form>
  );
}
