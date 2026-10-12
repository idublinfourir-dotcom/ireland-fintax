"use client";

/* Run now, and then follow the run: after a start request (or when the page
   opened mid-run) it polls for the newest run every few seconds, refreshes
   the page once the run shows up and again when it finishes, and says what
   came of it. Shown always; without GITHUB_DISPATCH_TOKEN it is disabled and
   says why, rather than vanishing. */

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useActionState, useEffect, useState } from "react";
import type { LatestRun } from "../../lib/news-admin";
import { latestNewsRunAction, runNewsAgentAction, type RunNowState } from "./actions";

const POLL_MS = 6_000;
/** A run takes 2 to 3 minutes; past this, GitHub has lost it or it is stuck. */
const GIVE_UP_MS = 20 * 60_000;

type Phase =
  | { kind: "idle" }
  | { kind: "waiting" }
  | { kind: "running" }
  | { kind: "done"; run: LatestRun }
  | { kind: "gave-up" };

export function RunNowButton({ configured, latest }: { configured: boolean; latest: LatestRun | null }) {
  const router = useRouter();
  const [state, action, pending] = useActionState<RunNowState>(runNewsAgentAction, { status: "idle" });
  const [phase, setPhase] = useState<Phase>(latest?.status === "running" ? { kind: "running" } : { kind: "idle" });

  // Fixed at first render: the page re-renders with newer runs as it
  // refreshes, but "which run are we waiting for" must not move with it.
  const [baselineId, setBaselineId] = useState(latest?.id ?? null);
  const [openedMidRun, setOpenedMidRun] = useState(latest?.status === "running" ? latest.id : null);

  const started = state.status === "started";
  const watching = (started || openedMidRun !== null) && phase.kind !== "done" && phase.kind !== "gave-up";

  useEffect(() => {
    if (!watching) return;
    const since = Date.now();
    let sawRunning = false;
    let busy = false;

    const timer = setInterval(async () => {
      if (busy) return;
      if (Date.now() - since > GIVE_UP_MS) {
        clearInterval(timer);
        setPhase({ kind: "gave-up" });
        return;
      }
      busy = true;
      try {
        const run = await latestNewsRunAction();
        // After Run now: any run newer than the one on the page when it
        // loaded. Opened mid-run: that same run.
        const ours = run && (started ? run.id !== baselineId : run.id === openedMidRun);
        if (!run || !ours) {
          if (started) setPhase({ kind: "waiting" });
          return;
        }
        if (run.status === "running") {
          setPhase({ kind: "running" });
          if (!sawRunning) {
            sawRunning = true;
            router.refresh();
          }
          return;
        }
        clearInterval(timer);
        setOpenedMidRun(null);
        setPhase({ kind: "done", run });
        router.refresh();
      } catch {
        // A missed poll is retried on the next tick.
      } finally {
        busy = false;
      }
    }, POLL_MS);

    return () => clearInterval(timer);
  }, [watching, started, router, baselineId, openedMidRun]);

  const following = watching && (phase.kind === "waiting" || phase.kind === "running" || started);

  return (
    <form
      action={action}
      // Each press waits for a run newer than the newest one on the page now,
      // so a second press after a finished run follows the new run, not the old.
      onSubmit={() => {
        setBaselineId(latest?.id ?? null);
        setOpenedMidRun(null);
        setPhase({ kind: "waiting" });
      }}
      className="flex flex-col items-end gap-1.5"
    >
      <button
        type="submit"
        disabled={pending || !configured || following}
        className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-none bg-primary-500 px-4 text-sm font-semibold text-white transition-colors duration-200 hover:bg-primary-600 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {following && (
          <span
            aria-hidden="true"
            className="h-3.5 w-3.5 animate-spin rounded-full border-2 border-white/40 border-t-white"
          />
        )}
        {pending ? "Starting…" : following ? "Running…" : "Run now"}
      </button>
      <Status configured={configured} state={state} phase={phase} following={following} />
    </form>
  );
}

function Status({
  configured,
  state,
  phase,
  following,
}: {
  configured: boolean;
  state: RunNowState;
  phase: Phase;
  following: boolean;
}) {
  const note = "max-w-xs text-right text-xs";
  if (!configured) {
    return (
      <p className={`${note} text-muted`}>
        Needs <code className="font-mono">GITHUB_DISPATCH_TOKEN</code> in this site&apos;s environment (then a
        redeploy). Scheduled runs work without it.
      </p>
    );
  }
  if (state.status === "error") {
    return (
      <p role="alert" className={`${note} font-medium text-primary-600`}>
        {state.message}
      </p>
    );
  }
  if (phase.kind === "done") {
    const { run } = phase;
    if (run.status === "failed") {
      return (
        <p role="status" className={`${note} font-medium text-primary-600`}>
          The run failed. Its problem is listed under Recent runs.
        </p>
      );
    }
    return (
      <p role="status" className={`${note} font-medium text-secondary-600`}>
        {run.drafts > 0 ? (
          <>
            Finished: {run.drafts} new {run.drafts === 1 ? "draft" : "drafts"}.{" "}
            <Link href="/admin/posts?filter=review" className="underline hover:text-secondary-500">
              Review
            </Link>
          </>
        ) : (
          "Finished: nothing new worth drafting this time."
        )}
        {run.problems > 0 && ` ${run.problems} problem${run.problems === 1 ? "" : "s"} noted below.`}
      </p>
    );
  }
  if (phase.kind === "gave-up") {
    return (
      <p role="status" className={`${note} text-muted`}>
        Still no result after 20 minutes. Check the run&apos;s log on GitHub, or refresh later.
      </p>
    );
  }
  if (following) {
    return (
      <p role="status" aria-live="polite" className={`${note} text-muted`}>
        {phase.kind === "running"
          ? "Running now, usually 2 to 3 minutes. This page updates itself when it finishes."
          : "Started. Waiting for GitHub to pick it up…"}
      </p>
    );
  }
  return null;
}
