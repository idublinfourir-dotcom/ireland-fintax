/* The admin side of the news agent: run history, which calculators a recent
   story may have made stale, and the "Run now" button's call to GitHub.
   SERVER ONLY. The agent itself is scripts/news-agent.ts. */

import { ObjectId } from "mongodb";
import {
  mortgageProductsCollection,
  mortgageSettingsCollection,
  newsItemsCollection,
  newsRunsCollection,
  postsCollection,
  rateAuditCollection,
  taxRatesCollection,
  type NewsRunDoc,
} from "./collections";
import { loadReviewStatus } from "./editable-calculators";
import { AFFECTED_CALCULATORS, NEWS_LIMITS } from "./news-sources";

/* ── run history ───────────────────────────────────────────────────────── */

export type NewsRunRow = Omit<NewsRunDoc, "_id" | "postIds"> & { id: string; drafts: number };

export async function listNewsRuns(limit = 12): Promise<NewsRunRow[]> {
  const runs = await newsRunsCollection();
  const docs = await runs.find().sort({ startedAt: -1 }).limit(limit).toArray();
  return docs.map(({ _id, postIds, ...rest }) => ({ ...rest, id: _id.toHexString(), drafts: postIds.length }));
}

/** When a scheduled run is overdue. Runs are Tuesday and Friday, so a gap of
    five days means one was missed (a disabled schedule, a failing secret). */
export const STALE_AFTER_DAYS = 5;

/** The last successful run, and whether that is too long ago. `stale` is
    false before the first run ever, which is "not set up yet", not "broken". */
export async function newsHealth(): Promise<{ lastOk: Date | null; stale: boolean }> {
  const runs = await newsRunsCollection();
  const doc = await runs.findOne({ status: "ok" }, { sort: { startedAt: -1 }, projection: { startedAt: 1 } });
  const lastOk = doc?.startedAt ?? null;
  return {
    lastOk,
    stale: lastOk !== null && Date.now() - lastOk.getTime() > STALE_AFTER_DAYS * 24 * 60 * 60 * 1000,
  };
}

export async function isRunInProgress(): Promise<boolean> {
  const runs = await newsRunsCollection();
  const since = new Date(Date.now() - NEWS_LIMITS.staleRunMinutes * 60_000);
  return (await runs.countDocuments({ status: "running", startedAt: { $gte: since } })) > 0;
}

/** Recently rejected stories and their reasons, newest first. */
export async function listRecentRejections(limit = 8) {
  const items = await newsItemsCollection();
  const docs = await items
    .find({ status: "rejected" }, { projection: { title: 1, url: 1, note: 1, updatedAt: 1 } })
    .sort({ updatedAt: -1 })
    .limit(limit)
    .toArray();
  return docs.map((d) => ({ title: d.title, url: d.url, reason: d.note, at: d.updatedAt }));
}

/* ── rate checks ───────────────────────────────────────────────────────── */

export interface RateCheck {
  key: string;
  label: string;
  adminHref: string;
  storyId: string;
  storyTitle: string;
  storyAt: Date;
}

const rateCheckArea = (key: string) => `news-rate-check:${key}`;

/**
 * Calculators a recent AI story says may have changed, where nothing has
 * touched that calculator since the story arrived. "Touched" means a rate
 * saved or reviewed (each calculator records that its own way), or the
 * check dismissed here. Stories older than 120 days are not counted: by then
 * the yearly review reminder has it.
 */
export async function loadRateChecks(): Promise<RateCheck[]> {
  const posts = await postsCollection();
  const since = new Date(Date.now() - 120 * 24 * 60 * 60 * 1000);
  const stories = await posts
    .find(
      { "origin.kind": "ai", "origin.affects.0": { $exists: true }, createdAt: { $gte: since } },
      { projection: { title: 1, createdAt: 1, "origin.affects": 1 } },
    )
    .sort({ createdAt: -1 })
    .toArray();
  if (stories.length === 0) return [];

  // The newest story per calculator.
  const newest = new Map<string, (typeof stories)[number]>();
  for (const s of stories) for (const key of s.origin?.affects ?? []) if (!newest.has(key)) newest.set(key, s);

  const [reviews, taxRates, mortgageSettings, mortgageProducts, audit] = await Promise.all([
    loadReviewStatus(),
    taxRatesCollection().then((c) => c.find({}, { projection: { updatedAt: 1 } }).sort({ updatedAt: -1 }).limit(1).toArray()),
    mortgageSettingsCollection().then((c) => c.findOne({ _id: 1 }, { projection: { updatedAt: 1 } })),
    mortgageProductsCollection().then((c) => c.find({}, { projection: { updatedAt: 1 } }).sort({ updatedAt: -1 }).limit(1).toArray()),
    rateAuditCollection().then((c) =>
      c
        .aggregate<{ _id: string; at: Date }>([
          { $match: { area: { $regex: "^news-rate-check:" }, changedAt: { $gte: since } } },
          { $group: { _id: "$area", at: { $max: "$changedAt" } } },
        ])
        .toArray(),
    ),
  ]);

  const touched = (key: string): number => {
    const times: number[] = [];
    const review = reviews.find((r) => r.key === key);
    if (review?.reviewedAt) times.push(new Date(review.reviewedAt).getTime());
    if (key === "income-tax" && taxRates[0]) times.push(taxRates[0].updatedAt.getTime());
    if (key === "mortgage") {
      if (mortgageSettings) times.push(mortgageSettings.updatedAt.getTime());
      if (mortgageProducts[0]) times.push(mortgageProducts[0].updatedAt.getTime());
    }
    const dismissed = audit.find((a) => a._id === rateCheckArea(key));
    if (dismissed) times.push(dismissed.at.getTime());
    return times.length > 0 ? Math.max(...times) : 0;
  };

  return AFFECTED_CALCULATORS.flatMap((calc) => {
    const story = newest.get(calc.key);
    if (!story || touched(calc.key) >= story.createdAt.getTime()) return [];
    return [
      {
        key: calc.key,
        label: calc.label,
        adminHref: calc.adminHref,
        storyId: story._id.toHexString(),
        storyTitle: story.title,
        storyAt: story.createdAt,
      },
    ];
  });
}

/** Records "checked, nothing to change" for a calculator, which clears its
    rate check until the next story about it. */
export async function dismissRateCheck(key: string, changedBy: string): Promise<boolean> {
  const calc = AFFECTED_CALCULATORS.find((c) => c.key === key);
  if (!calc) return false;
  const audit = await rateAuditCollection();
  await audit.insertOne({
    _id: new ObjectId(),
    area: rateCheckArea(key),
    action: "checked",
    summary: `Checked ${calc.label} rates after a news story (no change)`,
    details: null,
    changedBy,
    changedAt: new Date(),
  });
  return true;
}

/* ── Run now ───────────────────────────────────────────────────────────── */

const REPO = () => process.env.NEWS_AGENT_REPO?.trim() || "idublinfourir-dotcom/ireland-fintax";
const WORKFLOW = "news-agent.yml";

export function isDispatchConfigured(): boolean {
  return Boolean(process.env.GITHUB_DISPATCH_TOKEN?.trim());
}

function githubError(status: number): string {
  switch (status) {
    case 401:
      return "GitHub refused the token: it is wrong or has expired. Make a new one and update GITHUB_DISPATCH_TOKEN.";
    case 403:
      return "The token may not run workflows: it needs Actions read and write on this repository, and an organisation may need to approve it.";
    case 404:
      return `GitHub cannot find .github/workflows/${WORKFLOW} on the main branch of ${REPO()}. It runs only once merged to main.`;
    case 422:
      return "GitHub would not start the run: the main branch or the workflow's manual trigger is missing.";
    default:
      return `GitHub answered ${status}. Try again in a minute.`;
  }
}

/**
 * Starts the news agent on GitHub Actions. Re-enables the workflow first:
 * GitHub silently disables scheduled workflows in a public repository after
 * 60 days without a commit, and enabling an enabled workflow is a no-op, so
 * this button also repairs the schedule.
 */
export async function dispatchNewsAgent(): Promise<{ ok: true } | { ok: false; message: string }> {
  const token = process.env.GITHUB_DISPATCH_TOKEN?.trim();
  if (!token) return { ok: false, message: "GITHUB_DISPATCH_TOKEN is not set, so this button cannot start a run." };

  const base = `https://api.github.com/repos/${REPO()}/actions/workflows/${WORKFLOW}`;
  const headers = {
    Authorization: `Bearer ${token}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "ireland-fintax-admin",
  };
  try {
    const enable = await fetch(`${base}/enable`, { method: "PUT", headers, signal: AbortSignal.timeout(15_000) });
    if (!enable.ok && enable.status !== 204) return { ok: false, message: githubError(enable.status) };
    const run = await fetch(`${base}/dispatches`, {
      method: "POST",
      headers: { ...headers, "Content-Type": "application/json" },
      body: JSON.stringify({ ref: process.env.NEWS_AGENT_REF?.trim() || "main" }),
      signal: AbortSignal.timeout(15_000),
    });
    if (run.status !== 204 && !run.ok) return { ok: false, message: githubError(run.status) };
    return { ok: true };
  } catch (err) {
    console.error("[news] dispatch failed:", err);
    return { ok: false, message: "Could not reach GitHub. Try again in a minute." };
  }
}
