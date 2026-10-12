/* Reading the news sources: RSS/Atom feeds, HTML list pages and article
   bodies, reduced to plain text for the model. PURE module (no fetch, no DB),
   unit-tested against trimmed copies of the real pages.

   No HTML or XML library on purpose: the sources are four known official
   sites, the output is plain text that is never rendered as markup, and a
   parser dependency would be the only one this repo carries for it. If a
   source changes its markup, its test fixture is the thing to update. */

import { createHash } from "node:crypto";
import type { NewsSource } from "./news-sources.ts";

export interface FeedItem {
  title: string;
  url: string;
  publishedAt: Date | null;
  /** Short plain-text description, when the source gives one. */
  summary: string;
  /** The full article as HTML, when the feed carries it (the Central Bank's
      does), so the page itself need not be fetched. */
  contentHtml: string | null;
}

/* ── entities and text ─────────────────────────────────────────────────── */

const NAMED: Record<string, string> = {
  amp: "&", lt: "<", gt: ">", quot: '"', apos: "'", nbsp: " ",
  euro: "€", pound: "£", ndash: "-", mdash: "-", hellip: "...",
  lsquo: "'", rsquo: "'", ldquo: '"', rdquo: '"', bull: "•", middot: "·",
  copy: "©", reg: "®", trade: "™", deg: "°", times: "×", divide: "÷",
  aacute: "á", eacute: "é", iacute: "í", oacute: "ó", uacute: "ú",
  Aacute: "Á", Eacute: "É", Iacute: "Í", Oacute: "Ó", Uacute: "Ú",
  agrave: "à", egrave: "è", ccedil: "ç", uuml: "ü", ouml: "ö", auml: "ä",
};

export function decodeEntities(text: string): string {
  return text.replace(/&(#x[0-9a-f]+|#\d+|[a-z]+);/gi, (match, body: string) => {
    if (body[0] === "#") {
      const code = body[1] === "x" || body[1] === "X" ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : match;
    }
    return NAMED[body] ?? match;
  });
}

const stripCdata = (s: string) => s.replace(/^\s*<!\[CDATA\[([\s\S]*?)\]\]>\s*$/, "$1");

/** Plain text of an inline fragment: tags dropped, entities decoded, one line. */
export function inlineToText(html: string): string {
  return decodeEntities(stripCdata(html).replace(/<[^>]*>/g, " ")).replace(/\s+/g, " ").trim();
}

/**
 * A page or fragment as readable plain text, keeping the structure a model
 * needs: headings as "## ", list items as "- ", table cells split by " | ".
 */
export function htmlToText(html: string): string {
  let s = html
    .replace(/<!--[\s\S]*?-->/g, " ")
    .replace(/<(script|style|noscript|svg|nav|header|footer|form|iframe|button|select)\b[\s\S]*?<\/\1>/gi, " ")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<h[1-6]\b[^>]*>/gi, "\n\n## ")
    .replace(/<li\b[^>]*>/gi, "\n- ")
    .replace(/<\/(td|th)>/gi, " | ")
    .replace(/<\/(p|div|section|article|main|li|tr|table|ul|ol|h[1-6]|blockquote|dd|dt)>/gi, "\n")
    // Inline tags vanish without a gap ("<b>0%</b>." stays "0%."); any other
    // tag still separates the words either side of it.
    .replace(/<\/?(a|b|i|em|strong|span|sup|sub|abbr|code|small|u|mark|font)\b[^>]*>/gi, "")
    .replace(/<[^>]*>/g, " ");
  s = decodeEntities(s);
  return s
    .split("\n")
    .map((line) => line.replace(/[ \t ]+/g, " ").trim())
    .filter((line, i, all) => line !== "" || (i > 0 && all[i - 1] !== ""))
    .join("\n")
    // A heading's text often starts on the line after its tag.
    .replace(/^##\n+(?=[^\n#])/gm, "## ")
    .replace(/^##$/gm, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** The part of a page between the source's start and end markers. */
export function sliceArticle(html: string, extract?: NewsSource["extract"]): string {
  if (!extract) return html;
  const start = html.search(extract.start);
  if (start < 0) return html;
  const rest = html.slice(start);
  const end = rest.slice(1).search(extract.end);
  // The end marker can sit inside a tag (class="bottom-links"): drop the
  // half-open tag it leaves behind.
  return end < 0 ? rest : rest.slice(0, end + 1).replace(/<[^>]*$/, "");
}

export function extractArticleText(html: string, extract?: NewsSource["extract"]): string {
  return htmlToText(sliceArticle(html, extract));
}

/**
 * Same-site, non-PDF pages an article links to. A Revenue eBrief is often a
 * few lines pointing at the updated guidance, so these are what the agent
 * follows when the brief alone is too thin to write from.
 */
export function followableLinks(html: string, pageUrl: string, limit = 3): string[] {
  const base = new URL(pageUrl);
  const out: string[] = [];
  for (const m of html.matchAll(/<a\b[^>]*\bhref\s*=\s*"([^"#]+)"/gi)) {
    let url: URL;
    try {
      url = new URL(decodeEntities(m[1]), base);
    } catch {
      continue;
    }
    if (url.host !== base.host || !/^https?:$/.test(url.protocol)) continue;
    if (/\.(pdf|docx?|xlsx?|zip|csv)$/i.test(url.pathname)) continue;
    const href = canonicalUrl(url.toString());
    if (href === canonicalUrl(pageUrl) || out.includes(href)) continue;
    out.push(href);
    if (out.length >= limit) break;
  }
  return out;
}

/* ── dates ─────────────────────────────────────────────────────────────── */

const MONTHS = [
  "january", "february", "march", "april", "may", "june",
  "july", "august", "september", "october", "november", "december",
];

const DAY_MONTH_YEAR = /\b(\d{1,2}) (January|February|March|April|May|June|July|August|September|October|November|December) (\d{4})\b/i;

/** An RFC 822 / ISO date, or a "9 October 2026" one, or null. */
export function parseDate(text: string | null | undefined): Date | null {
  if (!text) return null;
  const t = text.trim();
  const dmy = t.match(DAY_MONTH_YEAR);
  if (dmy && dmy.index === 0) {
    const month = MONTHS.indexOf(dmy[2].toLowerCase());
    return new Date(Date.UTC(Number(dmy[3]), month, Number(dmy[1])));
  }
  // Date.parse rejects a trailing bare "Z" after an RFC 822 time, which the
  // Central Bank's feed uses ("Fri, 09 Oct 2026 13:33:04 Z").
  const ms = Date.parse(t.replace(/ Z$/, " GMT"));
  return Number.isFinite(ms) ? new Date(ms) : null;
}

/* ── URLs ──────────────────────────────────────────────────────────────── */

/** One spelling per article: no fragment, no tracking parameters, no doubled
    slashes (the ECB's feed links read "europa.eu//press/..."). */
export function canonicalUrl(raw: string): string {
  const url = new URL(raw);
  url.hash = "";
  url.hostname = url.hostname.toLowerCase();
  url.pathname = url.pathname.replace(/\/{2,}/g, "/");
  for (const key of [...url.searchParams.keys()]) {
    if (/^(utm_|fbclid$|gclid$)/i.test(key)) url.searchParams.delete(key);
  }
  return url.toString();
}

export function urlHash(url: string): string {
  return createHash("sha256").update(canonicalUrl(url)).digest("hex");
}

/* ── robots.txt ────────────────────────────────────────────────────────── */

/**
 * Does robots.txt let `agent` fetch `path`? RFC 9309: the group naming the
 * agent wins over "*", the longest matching rule wins, Allow wins a tie, and
 * `*` and `$` are wildcards. No matching rule means allowed.
 */
export function robotsAllows(robots: string, path: string, agent: string): boolean {
  type Group = { agents: string[]; rules: { allow: boolean; pattern: string }[] };
  const groups: Group[] = [];
  let current: Group | null = null;
  let lastWasAgent = false;

  for (const raw of robots.split(/\r?\n/)) {
    const line = raw.replace(/#.*$/, "").trim();
    const m = line.match(/^([a-z-]+)\s*:\s*(.*)$/i);
    if (!m) continue;
    const field = m[1].toLowerCase();
    const value = m[2].trim();
    if (field === "user-agent") {
      if (!current || !lastWasAgent) {
        current = { agents: [], rules: [] };
        groups.push(current);
      }
      current.agents.push(value.toLowerCase());
      lastWasAgent = true;
    } else if ((field === "allow" || field === "disallow") && current) {
      if (value) current.rules.push({ allow: field === "allow", pattern: value });
      lastWasAgent = false;
    } else {
      lastWasAgent = false;
    }
  }

  const name = agent.toLowerCase();
  const mine = groups.filter((g) => g.agents.some((a) => a !== "*" && name.includes(a)));
  const chosen = mine.length > 0 ? mine : groups.filter((g) => g.agents.includes("*"));
  const rules = chosen.flatMap((g) => g.rules);

  let best: { allow: boolean; length: number } | null = null;
  for (const rule of rules) {
    // Everything literal except `*` (any run) and a final `$` (end of path).
    const anchored = rule.pattern.endsWith("$");
    const body = (anchored ? rule.pattern.slice(0, -1) : rule.pattern)
      .replace(/[.+?^${}()|[\]\\]/g, "\\$&")
      .replace(/\*/g, ".*");
    const re = new RegExp(`^${body}${anchored ? "$" : ""}`);
    if (!re.test(path)) continue;
    const length = rule.pattern.length;
    if (!best || length > best.length || (length === best.length && rule.allow)) best = { allow: rule.allow, length };
  }
  return best ? best.allow : true;
}

/* ── feeds ─────────────────────────────────────────────────────────────── */

function tag(xml: string, names: string[]): string | null {
  for (const name of names) {
    const m = xml.match(new RegExp(`<${name}\\b[^>]*>([\\s\\S]*?)</${name}>`, "i"));
    if (m) return m[1];
  }
  return null;
}

function feedLink(entry: string): string | null {
  const rss = tag(entry, ["link"]);
  if (rss && rss.trim()) return decodeEntities(stripCdata(rss).trim());
  // Atom: <link rel="alternate" href="..."/>, or the first <link href>.
  const links = [...entry.matchAll(/<link\b([^>]*)\/?>/gi)].map((m) => m[1]);
  const alt = links.find((a) => /rel\s*=\s*"alternate"/i.test(a)) ?? links.find((a) => !/rel\s*=/i.test(a)) ?? links[0];
  const href = alt?.match(/href\s*=\s*"([^"]+)"/i)?.[1];
  return href ? decodeEntities(href) : null;
}

/** Items of an RSS 2.0 or Atom feed, in feed order. Unparseable items are
    dropped rather than failing the whole feed. */
export function parseFeed(xml: string): FeedItem[] {
  const blocks = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1>/gi)].map((m) => m[2]);
  const items: FeedItem[] = [];
  for (const entry of blocks) {
    const title = inlineToText(tag(entry, ["title"]) ?? "");
    const link = feedLink(entry);
    if (!title || !link) continue;
    let url: string;
    try {
      url = canonicalUrl(link);
    } catch {
      continue;
    }
    const content = tag(entry, ["content:encoded", "a10:content", "content"]);
    // A feed escapes the HTML it carries, so one decode gives the markup back.
    const contentHtml = content ? decodeEntities(stripCdata(content)) : null;
    items.push({
      title,
      url,
      publishedAt: parseDate(inlineToText(tag(entry, ["pubDate", "published", "updated", "dc:date"]) ?? "")),
      summary: inlineToText(decodeEntities(tag(entry, ["description", "summary"]) ?? "")).slice(0, 600),
      contentHtml: contentHtml && contentHtml.trim() ? contentHtml : null,
    });
  }
  return items;
}

/* ── list pages ────────────────────────────────────────────────────────── */

/**
 * Items of an HTML list page: every link matching the source's pattern, in
 * page order, each with the date the page gives it. Revenue prints a date
 * heading above a group of items ("preceding"); a list that prints the date
 * after each title is "following".
 */
export function parseListPage(html: string, source: NewsSource): FeedItem[] {
  if (!source.linkPattern) return [];
  const body = html.replace(/<(script|style)\b[\s\S]*?<\/\1>/gi, " ").replace(/<!--[\s\S]*?-->/g, " ");
  const tokens = new RegExp(
    `<a\\b[^>]*\\bhref\\s*=\\s*"([^"]*)"[^>]*>([\\s\\S]*?)</a>|${DAY_MONTH_YEAR.source}`,
    "gi",
  );

  const items: FeedItem[] = [];
  const seen = new Set<string>();
  let currentDate: Date | null = null;
  let waiting: FeedItem | null = null;

  for (const m of body.matchAll(tokens)) {
    if (m[1] === undefined) {
      const date = parseDate(m[0]);
      if (source.dateMode === "following") {
        if (waiting && !waiting.publishedAt) waiting.publishedAt = date;
        waiting = null;
      } else {
        currentDate = date;
      }
      continue;
    }
    const href = decodeEntities(m[1]);
    if (!source.linkPattern.test(href)) continue;
    const title = inlineToText(m[2]);
    if (!title) continue;
    let url: string;
    try {
      url = canonicalUrl(new URL(href, source.url).toString());
    } catch {
      continue;
    }
    if (seen.has(url)) continue;
    seen.add(url);
    const item: FeedItem = {
      title,
      url,
      publishedAt: source.dateMode === "following" ? null : currentDate,
      summary: "",
      contentHtml: null,
    };
    items.push(item);
    waiting = item;
  }
  return items;
}

/** Items of either kind of source. */
export function parseSource(body: string, source: NewsSource): FeedItem[] {
  const items = source.kind === "rss" ? parseFeed(body) : parseListPage(body, source);
  return source.keepLink ? items.filter((i) => source.keepLink!.test(i.url)) : items;
}
