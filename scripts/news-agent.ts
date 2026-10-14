// The news agent: finds important official tax and finance updates, drafts a
// blog post for each and leaves it for an admin to review and publish.
//
//   node scripts/news-agent.ts            run it (GitHub Actions does this)
//   node scripts/news-agent.ts --dry-run  read-only: print drafts, write nothing
//
// Runs on Node's own type stripping, so it shares the app's pure modules with
// no build step. It talks to MongoDB directly, like the db-* scripts, because
// app/lib/collections.ts reaches for Next-only modules.
//
// Nothing here publishes anything. Every draft lands as status "draft" with an
// `origin` block, and the admin's Publish (with "facts checked" ticked) is the
// only way one goes live.
//
// The repo is public, so its Actions logs are too: this prints counts, source
// health and the titles of public source items, never a draft's text.

import { MongoClient, ObjectId, type Collection } from "mongodb";
import { dbName, mongoUri } from "./load-env.mjs";
import {
  NEWS_LIMITS,
  NEWS_SOURCES,
  NEWS_USER_AGENT,
  PRESS_SIGNALS,
  PROMPT_VERSION,
  isBlockedTitle,
  type NewsSource,
} from "../app/lib/news-sources.ts";
import {
  canonicalUrl,
  followableLinks,
  htmlToText,
  parseFeed,
  parseSource,
  robotsAllows,
  sliceArticle,
  urlHash,
  type FeedItem,
} from "../app/lib/news-parse.ts";
import {
  DRAFT_SCHEMA,
  TRIAGE_SCHEMA,
  draftMessages,
  draftToPost,
  parseTriage,
  triageMessages,
  type DraftPost,
  type DraftSource,
  type TriageResult,
} from "../app/lib/news-draft.ts";
import {
  OPENROUTER_MODELS_URL,
  callJson,
  llmTargets,
  pickOpenRouterModels,
  type JsonCall,
  type LlmConfig,
  type LlmDeps,
} from "../app/lib/news-llm.ts";
import { newsDigestHtml, newsDigestSubject, newsDigestText } from "../app/lib/news-email.ts";
import { sendMail } from "../app/lib/mailer.ts";
import { postSlug } from "../app/lib/post-types.ts";
import { readingMinutes } from "../app/lib/post-blocks.ts";
import { POST_LIMITS } from "../app/lib/post-validation.ts";
import { site } from "../app/lib/content.ts";
import type {
  NewsItemDoc,
  NewsItemStatus,
  NewsRunDoc,
  PostDoc,
  PostOriginSource,
  RateAuditDoc,
} from "../app/lib/collections.ts";

const DRY = process.argv.includes("--dry-run");
const DAY = 24 * 60 * 60 * 1000;
const log = (line: string) => console.log(line);
const sleep = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

/* ── fetching, politely ────────────────────────────────────────────────── */

const lastHit = new Map<string, number>();
const robotsCache = new Map<string, string | null>();

/** At least 1.5 s between two requests to the same host. */
async function pace(host: string) {
  const wait = (lastHit.get(host) ?? 0) + 1500 - Date.now();
  if (wait > 0) await sleep(wait);
  lastHit.set(host, Date.now());
}

async function rawGet(url: string): Promise<Response> {
  await pace(new URL(url).host);
  return fetch(url, {
    headers: { "User-Agent": NEWS_USER_AGENT, Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8" },
    signal: AbortSignal.timeout(30_000),
    redirect: "follow",
  });
}

/** robots.txt per RFC 9309: a 4xx means no rules, a 5xx or no answer means
    stay away from that host for this run. */
async function allowedByRobots(url: string): Promise<boolean> {
  const u = new URL(url);
  if (!robotsCache.has(u.host)) {
    let body: string | null = null;
    try {
      const res = await rawGet(`${u.protocol}//${u.host}/robots.txt`);
      body = res.ok ? await res.text() : res.status < 500 ? "" : null;
    } catch {
      body = null;
    }
    robotsCache.set(u.host, body);
  }
  const robots = robotsCache.get(u.host);
  if (robots === null || robots === undefined) return false;
  return robotsAllows(robots, u.pathname + u.search, "IrishFintaxNewsBot");
}

async function getText(url: string): Promise<string> {
  if (!(await allowedByRobots(url))) throw new Error("robots.txt does not allow it");
  const res = await rawGet(url);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const body = await res.text();
  // A WAF challenge comes back as 200 with a captcha page. That is the site
  // saying no; the agent takes no for an answer.
  if (/<title>\s*(human verification|just a moment|attention required)/i.test(body)) {
    throw new Error("the site answered with a bot challenge");
  }
  return body;
}

/* ── the run ───────────────────────────────────────────────────────────── */

interface Candidate {
  hash: string;
  source: NewsSource;
  item: FeedItem;
  attempts: number;
  triage?: TriageResult;
}

interface Ctx {
  now: Date;
  run: NewsRunDoc;
  posts: Collection<PostDoc>;
  items: Collection<NewsItemDoc>;
  audit: Collection<RateAuditDoc>;
  llm: LlmConfig;
  deps: LlmDeps;
}

function triggerFromEnv(): NewsRunDoc["trigger"] {
  if (process.env.GITHUB_ACTIONS !== "true") return "local";
  return process.env.GITHUB_EVENT_NAME === "schedule" ? "schedule" : "manual";
}

function runUrlFromEnv(): string | null {
  const { GITHUB_SERVER_URL, GITHUB_REPOSITORY, GITHUB_RUN_ID } = process.env;
  return GITHUB_SERVER_URL && GITHUB_REPOSITORY && GITHUB_RUN_ID
    ? `${GITHUB_SERVER_URL}/${GITHUB_REPOSITORY}/actions/runs/${GITHUB_RUN_ID}`
    : null;
}

async function llmCall(ctx: Ctx, call: JsonCall) {
  const result = await callJson(call, ctx.llm, ctx.deps);
  const usage = ctx.run.models.find((m) => m.provider === result.provider && m.model === result.model);
  if (usage) {
    usage.calls++;
    usage.tokens += result.tokens;
  } else {
    ctx.run.models.push({ provider: result.provider, model: result.model, calls: 1, tokens: result.tokens });
  }
  return result;
}

async function setItem(ctx: Ctx, c: Candidate, status: NewsItemStatus, extra: Partial<NewsItemDoc> = {}) {
  if (DRY) return;
  const now = new Date();
  const set: Partial<NewsItemDoc> = {
    url: c.item.url,
    sourceId: c.source.id,
    title: c.item.title,
    publishedAt: c.item.publishedAt,
    status,
    score: c.triage?.score ?? null,
    reason: c.triage?.reason ?? null,
    affects: c.triage?.affects ?? [],
    runId: ctx.run._id,
    updatedAt: now,
    ...extra,
  };
  // A field may not be in both $set and $setOnInsert, so the insert defaults
  // cover only what this call is not setting.
  const defaults = { firstSeenAt: now, postId: null, note: null, attempts: 0 };
  const onInsert = Object.fromEntries(Object.entries(defaults).filter(([k]) => !(k in set)));
  await ctx.items.updateOne({ _id: c.hash }, { $set: set, $setOnInsert: onInsert }, { upsert: true });
}

/** Sources whose list could not be read are recorded and skipped; one bad
    source never stops the others. */
async function collect(ctx: Ctx): Promise<Candidate[]> {
  const since = ctx.now.getTime() - NEWS_LIMITS.lookbackDays * DAY;
  const found: Candidate[] = [];
  for (const source of NEWS_SOURCES) {
    try {
      const items = parseSource(await getText(source.url), source).filter(
        (i) => !i.publishedAt || i.publishedAt.getTime() >= since,
      );
      ctx.run.sources.push({ id: source.id, ok: true, items: items.length, error: null });
      for (const item of items) found.push({ hash: urlHash(item.url), source, item, attempts: 0 });
      log(`${source.label}: ${items.length} recent item(s)`);
    } catch (err) {
      const message = (err as Error).message;
      ctx.run.sources.push({ id: source.id, ok: false, items: 0, error: message });
      log(`${source.label}: could not be read (${message})`);
    }
  }
  ctx.run.counts.fetched = found.length;

  // The same article can sit in two lists; keep the first.
  const unique = [...new Map(found.map((c) => [c.hash, c])).values()];
  const seen = new Map(
    (await ctx.items.find({ _id: { $in: unique.map((c) => c.hash) } }, { projection: { status: 1, attempts: 1 } }).toArray()).map(
      (d) => [d._id, d],
    ),
  );
  // A failed draft gets one more go on a later run; everything else is done.
  return unique
    .filter((c) => {
      const prior = seen.get(c.hash);
      if (!prior) return true;
      c.attempts = prior.attempts ?? 0;
      return prior.status === "failed" && c.attempts < 2;
    });
}

/** Titles the triage must not repeat: recent news posts and rejected items. */
async function recentTitles(ctx: Ctx): Promise<string[]> {
  const since = new Date(ctx.now.getTime() - 45 * DAY);
  const [posts, rejected] = await Promise.all([
    ctx.posts
      .find({ category: "news", createdAt: { $gte: since } }, { projection: { title: 1 } })
      .sort({ createdAt: -1 })
      .limit(30)
      .toArray(),
    ctx.items
      .find({ status: "rejected", updatedAt: { $gte: since } }, { projection: { title: 1 } })
      .sort({ updatedAt: -1 })
      .limit(15)
      .toArray(),
  ]);
  return [...new Set([...posts.map((p) => p.title), ...rejected.map((r) => r.title)])];
}

/** Recent press headlines, newest first: a triage hint and nothing else (see
    PRESS_SIGNALS). Titles only; a feed that cannot be read is skipped. */
async function pressHeadlines(ctx: Ctx): Promise<string[]> {
  const since = ctx.now.getTime() - NEWS_LIMITS.lookbackDays * DAY;
  const items: FeedItem[] = [];
  for (const feed of PRESS_SIGNALS) {
    try {
      items.push(...parseFeed(await getText(feed.url)).filter((i) => !i.publishedAt || i.publishedAt.getTime() >= since));
    } catch (err) {
      log(`${feed.label} (press signal): could not be read (${(err as Error).message})`);
    }
  }
  items.sort((a, b) => (b.publishedAt?.getTime() ?? 0) - (a.publishedAt?.getTime() ?? 0));
  const titles = [...new Set(items.map((i) => i.title))].slice(0, NEWS_LIMITS.pressHeadlines);
  log(`${titles.length} press headline(s) as triage signal`);
  return titles;
}

async function triage(ctx: Ctx, candidates: Candidate[], recent: string[], press: string[]) {
  for (let i = 0; i < candidates.length; i += NEWS_LIMITS.triageBatch) {
    const batch = candidates.slice(i, i + NEWS_LIMITS.triageBatch);
    const withIds = batch.map((c, j) => ({ c, id: `item${i + j + 1}` }));
    try {
      const result = await llmCall(ctx, {
        name: "triage",
        schema: TRIAGE_SCHEMA,
        messages: triageMessages(
          withIds.map(({ c, id }) => ({
            id,
            title: c.item.title,
            publisher: c.source.publisher,
            publishedAt: c.item.publishedAt,
            summary: c.item.summary || (c.item.contentHtml ? htmlToText(c.item.contentHtml).slice(0, 500) : ""),
          })),
          recent,
          press,
        ),
        maxTokens: 2500,
      });
      const scores = parseTriage(result.data, withIds.map((w) => w.id), recent);
      withIds.forEach(({ c }, j) => (c.triage = scores[j]));
      ctx.run.counts.triaged += batch.length;
    } catch (err) {
      ctx.run.errors.push(`Triage failed for ${batch.length} item(s): ${(err as Error).message}`);
      for (const c of batch) {
        ctx.run.counts.failed++;
        await setItem(ctx, c, "failed", { note: "Triage failed.", attempts: c.attempts + 1 });
      }
    }
  }
}

/** The story's own text, plus pages it links to on the same site when the
    story alone is too thin (a Revenue eBrief is often three lines). */
async function sourceTexts(c: Candidate, budget: number): Promise<DraftSource[]> {
  let html: string;
  if (c.item.contentHtml) {
    html = c.item.contentHtml;
  } else {
    html = sliceArticle(await getText(c.item.url), c.source.extract);
  }
  const primary: DraftSource = {
    title: c.item.title,
    publisher: c.source.publisher,
    url: c.item.url,
    publishedAt: c.item.publishedAt,
    text: htmlToText(html).slice(0, budget),
  };
  const out = [primary];
  let used = primary.text.length;

  if (used < NEWS_LIMITS.minSourceChars * 3) {
    for (const link of followableLinks(html, c.item.url, 2)) {
      if (used >= budget) break;
      try {
        const page = await getText(link);
        const pageText = htmlToText(sliceArticle(page, c.source.extract));
        if (pageText.length < 200) continue;
        const firstLine = pageText.split("\n").find((l) => l.trim())?.replace(/^## /, "").trim() ?? link;
        const text = pageText.slice(0, budget - used);
        out.push({ title: firstLine.slice(0, 200), publisher: c.source.publisher, url: canonicalUrl(link), publishedAt: null, text });
        used += text.length;
      } catch {
        // A linked page that cannot be read is not worth failing the story.
      }
    }
  }
  return out;
}

const totalChars = (sources: DraftSource[]) => sources.reduce((n, s) => n + s.text.length, 0);

async function draft(
  ctx: Ctx,
  sources: DraftSource[],
  kind: "single" | "roundup",
): Promise<{ post: DraftPost; provider: string; model: string }> {
  let errors: string[] = [];
  for (let attempt = 0; attempt < 2; attempt++) {
    const result = await llmCall(ctx, {
      name: "news_post",
      schema: DRAFT_SCHEMA,
      messages: draftMessages(sources, kind, errors),
      maxTokens: 3000,
    });
    const converted = draftToPost(result.data, sources, kind);
    if (converted.ok) return { post: converted.value, provider: result.provider, model: result.model };
    errors = converted.errors;
    log(`  draft rejected by the checks (${errors.length} problem(s))${attempt === 0 ? ", asking again" : ""}`);
  }
  throw new Error(`The draft failed its checks twice: ${errors.join(" ")}`);
}

async function uniqueSlug(posts: Collection<PostDoc>, title: string): Promise<string> {
  const base = postSlug(title).slice(0, POST_LIMITS.slug - 7).replace(/-+$/, "") || "news-update";
  for (let n = 1; n <= 9; n++) {
    const slug = n === 1 ? base : `${base}-${n}`;
    if (!(await posts.findOne({ slug }, { projection: { _id: 1 } }))) return slug;
  }
  return `${base}-${new ObjectId().toHexString().slice(-6)}`;
}

function attributionFor(sourceId: string): string {
  return NEWS_SOURCES.find((s) => s.id === sourceId)?.attribution ?? "";
}

async function save(
  ctx: Ctx,
  drafted: { post: DraftPost; provider: string; model: string },
  sources: DraftSource[],
  from: Candidate[],
  kind: "single" | "roundup",
) {
  const { post } = drafted;
  if (DRY) {
    log(`\n--- DRY RUN: ${kind} draft ---\n${JSON.stringify({ ...post, sources: sources.map((s) => s.url) }, null, 2)}`);
    ctx.run.counts.drafted++;
    return;
  }
  const now = new Date();
  const originSources: PostOriginSource[] = sources.map((s) => {
    const owner = from.find((c) => c.source.publisher === s.publisher) ?? from[0];
    return {
      url: s.url,
      title: s.title,
      publisher: s.publisher,
      publishedAt: s.publishedAt,
      attribution: attributionFor(owner.source.id),
    };
  });
  const affects = [...new Set([...post.affects, ...from.flatMap((c) => c.triage?.affects ?? [])])];
  const _id = new ObjectId();
  const slug = await uniqueSlug(ctx.posts, post.title);
  await ctx.posts.insertOne({
    _id,
    slug,
    title: post.title,
    excerpt: post.excerpt,
    blocks: post.blocks,
    category: "news",
    cover: post.cover,
    readingMinutes: readingMinutes(post.blocks),
    status: "draft",
    publishedAt: null,
    createdAt: now,
    updatedAt: now,
    origin: {
      kind: "ai",
      runId: ctx.run._id,
      provider: drafted.provider,
      model: drafted.model,
      promptVersion: PROMPT_VERSION,
      format: kind,
      generatedAt: now,
      sources: originSources,
      flags: post.flags,
      affects,
      reviewedBy: null,
      reviewedAt: null,
    },
  });
  for (const c of from) await setItem(ctx, c, "drafted", { postId: _id });
  await ctx.audit.insertOne({
    _id: new ObjectId(),
    area: "posts",
    action: "ai-draft",
    summary: `News agent drafted "${post.title}"`,
    details: { id: _id.toHexString(), slug, sources: sources.map((s) => s.url) },
    changedBy: "news-agent",
    changedAt: now,
  });
  ctx.run.postIds.push(_id);
  ctx.run.counts.drafted++;
  log(`  drafted "${post.title}" (${post.flags.length} flag(s))`);
}

async function draftSingle(ctx: Ctx, c: Candidate) {
  log(`Drafting: ${c.item.title}`);
  try {
    const sources = await sourceTexts(c, NEWS_LIMITS.maxSourceChars);
    if (totalChars(sources) < NEWS_LIMITS.minSourceChars) {
      log("  too little source text to write from; skipped");
      await setItem(ctx, c, "thin");
      return;
    }
    await save(ctx, await draft(ctx, sources, "single"), sources, [c], "single");
  } catch (err) {
    ctx.run.counts.failed++;
    ctx.run.errors.push(`"${c.item.title}": ${(err as Error).message}`);
    await setItem(ctx, c, "failed", { note: (err as Error).message.slice(0, 500), attempts: c.attempts + 1 });
  }
}

async function draftRoundup(ctx: Ctx, group: Candidate[]) {
  const usable: { c: Candidate; source: DraftSource }[] = [];
  for (const c of group) {
    try {
      const [primary] = await sourceTexts(c, NEWS_LIMITS.roundupItemChars);
      if (primary.text.length >= NEWS_LIMITS.minSourceChars / 2) usable.push({ c, source: primary });
      else await setItem(ctx, c, "thin");
    } catch (err) {
      ctx.run.counts.failed++;
      await setItem(ctx, c, "failed", { note: (err as Error).message.slice(0, 500), attempts: c.attempts + 1 });
    }
  }
  if (usable.length === 0) return;
  if (usable.length === 1) return draftSingle(ctx, usable[0].c);

  log(`Drafting a round-up of ${usable.length} updates`);
  const from = usable.map((u) => u.c);
  try {
    const sources = usable.map((u) => u.source);
    await save(ctx, await draft(ctx, sources, "roundup"), sources, from, "roundup");
  } catch (err) {
    ctx.run.counts.failed++;
    ctx.run.errors.push(`Round-up: ${(err as Error).message}`);
    for (const c of from) await setItem(ctx, c, "failed", { note: (err as Error).message.slice(0, 500), attempts: c.attempts + 1 });
  }
}

/** AI drafts nobody has opened go after NEWS_LIMITS.expireDays. One an admin
    has edited (updatedAt moved on from createdAt) is theirs now and stays. */
async function expireOldDrafts(ctx: Ctx) {
  const cutoff = new Date(ctx.now.getTime() - NEWS_LIMITS.expireDays * DAY);
  const stale = (
    await ctx.posts
      .find(
        { "origin.kind": "ai", status: "draft", "origin.reviewedAt": null, createdAt: { $lt: cutoff } },
        { projection: { title: 1, createdAt: 1, updatedAt: 1 } },
      )
      .toArray()
  ).filter((p) => p.updatedAt.getTime() === p.createdAt.getTime());
  if (stale.length === 0 || DRY) return;
  const ids = stale.map((p) => p._id);
  await ctx.posts.deleteMany({ _id: { $in: ids }, "origin.kind": "ai", status: "draft" });
  await ctx.items.updateMany({ postId: { $in: ids } }, { $set: { status: "expired", updatedAt: new Date() } });
  for (const p of stale) {
    await ctx.audit.insertOne({
      _id: new ObjectId(),
      area: "posts",
      action: "ai-expire",
      summary: `Removed unreviewed AI draft "${p.title}" after ${NEWS_LIMITS.expireDays} days`,
      details: { id: p._id.toHexString() },
      changedBy: "news-agent",
      changedAt: new Date(),
    });
  }
  log(`Removed ${stale.length} unreviewed draft(s) older than ${NEWS_LIMITS.expireDays} days`);
}

async function notify(ctx: Ctx) {
  if (DRY || ctx.run.postIds.length === 0) return;
  const to = (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
  if (to.length === 0) return;
  const drafts = await ctx.posts
    .find({ _id: { $in: ctx.run.postIds } }, { projection: { title: 1, "origin.flags": 1 } })
    .toArray();
  const origin = (process.env.AUTH_URL?.trim() || site.url).replace(/\/+$/, "");
  const input = {
    drafts: drafts.map((d) => ({ title: d.title, flagCount: d.origin?.flags.length ?? 0 })),
    reviewUrl: `${origin}/admin/posts?filter=review`,
    siteName: site.name,
  };
  await sendMail({
    to: to.join(", "),
    subject: newsDigestSubject(input),
    text: newsDigestText(input),
    html: newsDigestHtml(input),
    logPrefix: "[news-agent]",
  });
}

async function work(ctx: Ctx) {
  await expireOldDrafts(ctx);

  if (ctx.llm.openRouterKey) {
    try {
      const res = await fetch(OPENROUTER_MODELS_URL, { signal: AbortSignal.timeout(20_000) });
      ctx.llm.openRouterModels = res.ok ? pickOpenRouterModels(await res.json()) : [];
    } catch {
      ctx.llm.openRouterModels = [];
    }
  }
  if (llmTargets(ctx.llm).length === 0) {
    throw new Error("No model is configured: set GROQ_API_KEY (and optionally OPENROUTER_API_KEY).");
  }

  const fresh = await collect(ctx);
  ctx.run.counts.fresh = fresh.length;
  log(`${fresh.length} new item(s) to consider`);

  const open: Candidate[] = [];
  for (const c of fresh) {
    if (isBlockedTitle(c.item.title)) {
      ctx.run.counts.blocked++;
      await setItem(ctx, c, "blocked");
    } else {
      open.push(c);
    }
  }
  if (open.length === 0) return;

  const recent = await recentTitles(ctx);
  await triage(ctx, open, recent, await pressHeadlines(ctx));

  const scored = open.filter((c) => c.triage);
  const qualified: Candidate[] = [];
  for (const c of scored) {
    if (c.triage!.duplicateOf) await setItem(ctx, c, "duplicate", { note: `Repeats "${c.triage!.duplicateOf}".` });
    else if (c.triage!.score < NEWS_LIMITS.minScore) await setItem(ctx, c, "low");
    else qualified.push(c);
  }
  qualified.sort(
    (a, b) => b.triage!.score - a.triage!.score || (b.item.publishedAt?.getTime() ?? 0) - (a.item.publishedAt?.getTime() ?? 0),
  );
  ctx.run.counts.qualified = qualified.length;
  log(`${qualified.length} item(s) scored ${NEWS_LIMITS.minScore} or more`);

  // Up to the cap, one post each. On a busy day (a Budget), the cap's last
  // slot becomes one round-up, so the important items are not just dropped.
  const busy = qualified.length > NEWS_LIMITS.maxDrafts;
  const singles = busy ? qualified.slice(0, NEWS_LIMITS.maxDrafts - 1) : qualified;
  const roundup = busy ? qualified.slice(NEWS_LIMITS.maxDrafts - 1, NEWS_LIMITS.maxDrafts - 1 + NEWS_LIMITS.roundupMax) : [];
  const leftOver = busy ? qualified.slice(NEWS_LIMITS.maxDrafts - 1 + NEWS_LIMITS.roundupMax) : [];

  for (const c of singles) await draftSingle(ctx, c);
  if (roundup.length > 0) await draftRoundup(ctx, roundup);
  for (const c of leftOver) await setItem(ctx, c, "over-cap");

  await notify(ctx);
}

async function main() {
  const client = new MongoClient(mongoUri(), { serverSelectionTimeoutMS: 15_000 });
  await client.connect();
  const db = client.db(dbName);
  const runs = db.collection<NewsRunDoc>("news_runs");
  const now = new Date();

  const run: NewsRunDoc = {
    _id: new ObjectId(),
    trigger: triggerFromEnv(),
    runUrl: runUrlFromEnv(),
    status: "running",
    startedAt: now,
    finishedAt: null,
    counts: { fetched: 0, fresh: 0, blocked: 0, triaged: 0, qualified: 0, drafted: 0, failed: 0 },
    sources: [],
    models: [],
    postIds: [],
    errors: [],
    promptVersion: PROMPT_VERSION,
  };

  const ctx: Ctx = {
    now,
    run,
    posts: db.collection<PostDoc>("posts"),
    items: db.collection<NewsItemDoc>("news_items"),
    audit: db.collection<RateAuditDoc>("rate_audit"),
    llm: {
      groqKey: process.env.GROQ_API_KEY?.trim() || undefined,
      openRouterKey: process.env.OPENROUTER_API_KEY?.trim() || undefined,
      siteUrl: site.url,
    },
    deps: { fetch, sleep, log },
  };

  log(`News agent ${PROMPT_VERSION}${DRY ? " (dry run: nothing is written)" : ""}, database "${dbName}"`);

  try {
    if (!DRY) {
      // A run that died mid-way never marked itself finished.
      await runs.updateMany(
        { status: "running", startedAt: { $lt: new Date(now.getTime() - NEWS_LIMITS.staleRunMinutes * 60_000) } },
        { $set: { status: "failed", finishedAt: now }, $push: { errors: "Stopped without finishing (crashed or cancelled)." } },
      );
      await runs.insertOne(run);
    }
    await work(ctx);
    run.status = "ok";
  } catch (err) {
    run.status = "failed";
    run.errors.push((err as Error).message);
    console.error(`Run failed: ${(err as Error).message}`);
    process.exitCode = 1;
  } finally {
    run.finishedAt = new Date();
    if (!DRY) await runs.replaceOne({ _id: run._id }, run).catch((err) => console.error("Could not save the run record:", err));
    await client.close();
  }

  const c = run.counts;
  log(
    `Done: ${c.fetched} fetched, ${c.fresh} new, ${c.blocked} blocked, ${c.triaged} triaged, ${c.qualified} qualified, ${c.drafted} drafted, ${c.failed} failed.`,
  );
  if (run.errors.length > 0) log(`${run.errors.length} problem(s) recorded on the run; see /admin/news.`);
}

await main();
