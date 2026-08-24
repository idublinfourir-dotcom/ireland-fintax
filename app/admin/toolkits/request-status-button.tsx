"use client";

/* "Mark sent" / "Undo" for one Founders Hub request.

   The action is a database write with no other visible effect, so the button
   has to narrate it: it goes busy while the write is in flight and then shows
   a confirmation next to itself. Without that the click looked like it did
   nothing. Success notes clear themselves after a few seconds; errors stay
   until the next attempt. */

import { useActionState, useEffect, useState } from "react";
import { setRequestStatusAction, type ActionState } from "./actions";
import type { RequestStatus } from "../../lib/toolkit-requests";

const IDLE: ActionState = { status: "idle" };

const NOTE_VISIBLE_MS = 4000;

export function RequestStatusButton({
  id,
  status,
}: {
  id: string;
  status: RequestStatus;
}) {
  const [state, action, pending] = useActionState(setRequestStatusAction, IDLE);
  /* Holds the result already shown long enough. Compared by identity:
     useActionState hands back a fresh object per run, so a repeat click
     re-shows the note even when the message is the same. */
  const [expired, setExpired] = useState<ActionState | null>(null);
  const next: RequestStatus = status === "sent" ? "pending" : "sent";

  useEffect(() => {
    if (state.status !== "saved") return;
    const timer = setTimeout(() => setExpired(state), NOTE_VISIBLE_MS);
    return () => clearTimeout(timer);
  }, [state]);

  const note = state === expired ? IDLE : state;

  return (
    <form action={action} className="flex flex-wrap items-center justify-end gap-2">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="status" value={next} />

      {/* Announced on change so the confirmation reaches screen readers too. */}
      <p aria-live="polite" className="text-xs font-medium">
        {pending && <span className="text-muted">Saving…</span>}
        {!pending && note.status === "saved" && (
          <span className="text-secondary-600">✓ {note.message}</span>
        )}
        {!pending && note.status === "error" && (
          <span className="text-primary-600">{note.message}</span>
        )}
      </p>

      <button
        type="submit"
        disabled={pending}
        className="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-none border border-line px-3 text-xs font-semibold text-ink-body transition-colors duration-200 hover:border-ink/30 hover:text-ink disabled:cursor-not-allowed disabled:opacity-60"
      >
        {pending && (
          <span
            aria-hidden="true"
            className="h-3 w-3 animate-spin rounded-full border-2 border-ink/20 border-t-ink/70"
          />
        )}
        {pending
          ? next === "sent"
            ? "Marking sent…"
            : "Undoing…"
          : next === "sent"
            ? "Mark sent"
            : "Undo"}
      </button>
    </form>
  );
}
