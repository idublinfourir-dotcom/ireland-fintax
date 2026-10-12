import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "../../lib/auth/guards";
import { countAwaitingReview } from "../../lib/posts";
import {
  STALE_AFTER_DAYS,
  isDispatchConfigured,
  listNewsRuns,
  newsHealth,
  listRecentRejections,
  loadRateChecks,
  type NewsRunRow,
  type RateCheck,
} from "../../lib/news-admin";
import { NEWS_LIMITS, NEWS_SOURCES } from "../../lib/news-sources";
import { Icon } from "../../components/dashboard-icons";
import { PageHeader, Panel, StatTile, StatusChip, timeAgo } from "../../components/dashboard-ui";
import { dismissRateCheckAction } from "./actions";
import { RunNowButton } from "./run-now-button";

export const metadata: Metadata = {
  title: "News agent",
  robots: { index: false, follow: false },
};

const when = new Intl.DateTimeFormat("en-IE", {
  weekday: "short",
  day: "numeric",
  month: "short",
  hour: "2-digit",
  minute: "2-digit",
  timeZone: "Europe/Dublin",
});

const TRIGGER_LABEL: Record<NewsRunRow["trigger"], string> = {
  schedule: "Scheduled",
  manual: "Run now",
  local: "Local",
};

function RunStatus({ run }: { run: NewsRunRow }) {
  if (run.status === "running") return <StatusChip label="Running" tone="dark" />;
  if (run.status === "failed") return <StatusChip label="Failed" tone="dark" />;
  return <StatusChip label="OK" tone="green" />;
}

export default async function NewsAgentPage() {
  await requireAdmin();

  let runs: NewsRunRow[] = [];
  let awaiting = 0;
  let health: { lastOk: Date | null; stale: boolean } = { lastOk: null, stale: false };
  let rateChecks: RateCheck[] = [];
  let rejections: Awaited<ReturnType<typeof listRecentRejections>> = [];
  let loadError = false;
  try {
    [runs, awaiting, health, rateChecks, rejections] = await Promise.all([
      listNewsRuns(),
      countAwaitingReview(),
      newsHealth(),
      loadRateChecks(),
      listRecentRejections(),
    ]);
  } catch (err) {
    console.error("[news] admin page load failed:", err);
    loadError = true;
  }

  const { lastOk } = health;
  // Before the first run ever, say how to start rather than that it broke.
  const stale = health.stale || !lastOk;
  const latest = runs.find((r) => r.status !== "running");

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader
        eyebrow="Blog"
        title="News agent"
        lede={
          <>
            Every Tuesday and Friday morning the agent reads official sources, picks the updates that matter to
            people learning about tax and money, and drafts a post for each (at most {NEWS_LIMITS.maxDrafts} a
            run). Drafts wait in{" "}
            <Link href="/admin/posts?filter=review" className="font-medium text-primary-600 hover:text-primary-500">
              Blog posts
            </Link>
            . Nothing goes live until you check it and publish it.
          </>
        }
        actions={
          isDispatchConfigured() ? (
            <RunNowButton />
          ) : (
            <p className="max-w-xs text-right text-xs text-muted">
              Run now needs <code className="font-mono">GITHUB_DISPATCH_TOKEN</code> in the site&apos;s settings.
              Scheduled runs work without it.
            </p>
          )
        }
      />

      {loadError && (
        <p className="mb-6 border border-dashed border-line bg-white p-6 text-center text-sm text-muted">
          Could not read the news agent&apos;s records. Check the database connection and try again.
        </p>
      )}

      {!loadError && stale && (
        <Panel className="mb-6 border-l-2 border-l-primary-500 px-5 py-4">
          <p className="text-sm font-semibold text-ink">
            {lastOk
              ? `No successful run in the last ${STALE_AFTER_DAYS} days (the last was ${timeAgo(lastOk)})`
              : "The agent has not completed a run yet"}
          </p>
          <p className="mt-1 text-sm leading-6 text-ink-body">
            {lastOk
              ? "Scheduled runs may have stopped. GitHub turns off scheduled workflows in a public repository after 60 days without a commit; Run now turns it back on. Otherwise check the latest run below for its error."
              : "Once the workflow is merged to main and its secrets are set, the first scheduled run appears here, or start one with Run now."}
          </p>
        </Panel>
      )}

      <div className="mb-8 grid gap-4 sm:grid-cols-3">
        <StatTile
          label="Awaiting review"
          value={awaiting}
          hint={awaiting === 0 ? "Nothing to check" : "AI drafts to check"}
          icon={<Icon name="sparkles" className="h-[18px] w-[18px]" />}
        />
        <StatTile
          label="Last successful run"
          value={lastOk ? timeAgo(lastOk) : "Never"}
          icon={<Icon name="clock" className="h-[18px] w-[18px]" />}
        />
        <StatTile
          label="Drafted, last runs"
          value={runs.reduce((n, r) => n + r.drafts, 0)}
          hint={`Over the last ${runs.length} run${runs.length === 1 ? "" : "s"}`}
          icon={<Icon name="newspaper" className="h-[18px] w-[18px]" />}
        />
      </div>

      {rateChecks.length > 0 && (
        <Panel className="mb-8 overflow-hidden border-l-2 border-l-primary-500">
          <div className="border-b border-line bg-primary-50/60 px-5 py-3.5">
            <h3 className="font-display text-base font-semibold tracking-tight text-ink">Calculator rates to check</h3>
            <p className="text-xs text-muted">
              A recent story says these may have changed, and their rates have not been touched since.
            </p>
          </div>
          <ul className="divide-y divide-line">
            {rateChecks.map((c) => (
              <li key={c.key} className="flex flex-wrap items-center justify-between gap-3 px-5 py-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-ink">{c.label}</p>
                  <p className="text-xs text-muted">
                    From{" "}
                    <Link href={`/admin/posts/${c.storyId}`} className="font-medium text-primary-600 hover:text-primary-500">
                      {c.storyTitle}
                    </Link>{" "}
                    · {timeAgo(c.storyAt)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Link
                    href={c.adminHref}
                    className="inline-flex h-8 items-center rounded-none border border-line px-3 text-xs font-semibold text-ink-body transition-colors duration-200 hover:border-ink/30 hover:text-ink"
                  >
                    Open rates
                  </Link>
                  <form action={dismissRateCheckAction}>
                    <input type="hidden" name="key" value={c.key} />
                    <button
                      type="submit"
                      className="inline-flex h-8 cursor-pointer items-center rounded-none border border-primary-500 px-3 text-xs font-semibold text-primary-600 transition-colors duration-200 hover:bg-primary-500 hover:text-white"
                    >
                      Checked, no change
                    </button>
                  </form>
                </div>
              </li>
            ))}
          </ul>
        </Panel>
      )}

      <div className="grid items-start gap-6 xl:grid-cols-[1.65fr_1fr]">
        <Panel className="overflow-hidden">
          <div className="border-b border-line px-5 py-4">
            <h3 className="font-display text-lg font-semibold tracking-tight text-ink">Recent runs</h3>
          </div>
          {runs.length === 0 ? (
            <p className="px-5 py-10 text-center text-sm text-muted">No runs yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {runs.map((run) => (
                <li key={run.id} className="px-5 py-3.5">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm font-semibold text-ink">
                      {when.format(run.startedAt)}
                      <span className="font-normal text-muted"> · {TRIGGER_LABEL[run.trigger]}</span>
                    </p>
                    <div className="flex items-center gap-2">
                      <RunStatus run={run} />
                      {run.runUrl && (
                        <a
                          href={run.runUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-semibold text-muted hover:text-ink"
                        >
                          Log <Icon name="arrowUpRight" className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>
                  <p className="mt-1 text-xs tabular-nums text-muted">
                    {run.counts.fresh} new · {run.counts.blocked} blocked · {run.counts.qualified} important ·{" "}
                    <span className={run.drafts > 0 ? "font-semibold text-ink" : ""}>{run.drafts} drafted</span>
                    {run.counts.failed > 0 && ` · ${run.counts.failed} failed`}
                    {run.models.length > 0 && ` · ${run.models.map((m) => m.model.replace(/^.*\//, "")).join(", ")}`}
                  </p>
                  {run.errors.length > 0 && (
                    <details className="mt-1.5 text-xs">
                      <summary className="cursor-pointer font-medium text-primary-600">
                        {run.errors.length} problem{run.errors.length === 1 ? "" : "s"}
                      </summary>
                      <ul className="mt-1.5 list-disc space-y-1 pl-5 leading-5 text-ink-body">
                        {run.errors.map((e, i) => (
                          <li key={i} className="break-words">
                            {e}
                          </li>
                        ))}
                      </ul>
                    </details>
                  )}
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="flex flex-col gap-6">
          <Panel className="overflow-hidden">
            <div className="border-b border-line px-5 py-4">
              <h3 className="font-display text-lg font-semibold tracking-tight text-ink">Sources</h3>
              <p className="text-xs text-muted">Official publishers only, each credited under its licence.</p>
            </div>
            <ul className="divide-y divide-line">
              {NEWS_SOURCES.map((s) => {
                const health = latest?.sources.find((h) => h.id === s.id);
                return (
                  <li key={s.id} className="flex items-start gap-3 px-5 py-3">
                    <span
                      aria-hidden="true"
                      className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                        !health ? "bg-line" : health.ok ? "bg-primary-500" : "bg-navy-900"
                      }`}
                    />
                    <span className="min-w-0 flex-1">
                      <a
                        href={s.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block text-sm font-medium text-ink hover:text-primary-600"
                      >
                        {s.label}
                      </a>
                      <span className="block text-xs text-muted">
                        {!health
                          ? "Not read yet"
                          : health.ok
                            ? `${health.items} recent item${health.items === 1 ? "" : "s"} last run`
                            : `Could not be read: ${health.error}`}
                      </span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </Panel>

          {rejections.length > 0 && (
            <Panel className="overflow-hidden">
              <div className="border-b border-line px-5 py-4">
                <h3 className="font-display text-lg font-semibold tracking-tight text-ink">Recently rejected</h3>
                <p className="text-xs text-muted">The agent will not draft these again.</p>
              </div>
              <ul className="divide-y divide-line">
                {rejections.map((r) => (
                  <li key={r.url} className="px-5 py-3">
                    <a
                      href={r.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-ink hover:text-primary-600"
                    >
                      {r.title}
                    </a>
                    {r.reason && <p className="text-xs text-muted">{r.reason}</p>}
                  </li>
                ))}
              </ul>
            </Panel>
          )}
        </div>
      </div>
    </div>
  );
}
