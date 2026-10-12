/* The news agent's sources, limits and the calculators a story can affect.
   PURE module (no DB, no fetch), shared by scripts/news-agent.ts, the admin
   pages and node --test.

   Every source here is an official publisher whose re-use terms were checked
   (Oct 2026), and each carries the attribution its licence asks for. That is
   the rule for adding one: the agent WRITES from these pages, so a source
   whose licence has not been read does not go in. Press feeds (RTÉ, Irish
   Times) were left out on purpose: the press publishers' right covers more
   than "very short extracts", and the official sources carry the substance
   anyway. gov.ie is out too: its article pages answer automated requests with
   an AWS WAF human-verification challenge, which is the site saying no. */

export type NewsSourceKind = "rss" | "html-list";

export interface NewsSource {
  id: string;
  /** Shown in the admin review panel and the public Sources list. */
  publisher: string;
  label: string;
  kind: NewsSourceKind;
  url: string;
  /** html-list only: which links on the page are items. Matched against the
      href exactly as written in the page. */
  linkPattern?: RegExp;
  /** html-list only: where an item's date sits relative to its link. Revenue
      groups items under a date heading; other lists print it after the title. */
  dateMode?: "preceding" | "following";
  /** Feed or list items whose link does not match are dropped (ECB speeches,
      interviews and blog posts share the press feed). */
  keepLink?: RegExp;
  /** The article body runs from the first match of `start` to the first match
      of `end` after it. Without it the whole page is reduced to text. */
  extract?: { start: RegExp; end: RegExp };
  /** The licence's attribution statement, rendered under the post. */
  attribution: string;
}

const PSI_ATTRIBUTION =
  "Contains Irish Public Sector Information licensed under a Creative Commons Attribution 4.0 International (CC BY 4.0) licence.";

const REVENUE_ATTRIBUTION =
  "Information provided courtesy of the Revenue Commissioners under a Creative Commons Attribution 4.0 International (CC BY 4.0) licence.";

const REVENUE_EXTRACT = { start: /<h1[\s>]/i, end: /class="bottom-links/i };

export const NEWS_SOURCES: NewsSource[] = [
  {
    id: "revenue-ebrief",
    publisher: "Revenue",
    label: "Revenue eBriefs",
    kind: "html-list",
    url: "https://www.revenue.ie/en/tax-professionals/ebrief/index.aspx",
    linkPattern: /^\/en\/tax-professionals\/ebrief\/\d{4}\/[\w-]+\.aspx$/,
    dateMode: "preceding",
    extract: REVENUE_EXTRACT,
    attribution: REVENUE_ATTRIBUTION,
  },
  {
    id: "revenue-news",
    publisher: "Revenue",
    label: "Revenue news",
    kind: "html-list",
    url: "https://www.revenue.ie/en/news/index.aspx",
    linkPattern: /^\/en\/news\/articles\/[\w-]+\.aspx$/,
    dateMode: "preceding",
    extract: REVENUE_EXTRACT,
    attribution: REVENUE_ATTRIBUTION,
  },
  {
    id: "central-bank",
    publisher: "Central Bank of Ireland",
    label: "Central Bank news",
    kind: "rss",
    url: "https://www.centralbank.ie/feeds/news-media-feed",
    extract: { start: /<article[\s>]/i, end: /<\/article>/i },
    attribution: PSI_ATTRIBUTION,
  },
  {
    id: "ecb-press",
    publisher: "European Central Bank",
    label: "ECB press releases",
    kind: "rss",
    url: "https://www.ecb.europa.eu/rss/press.html",
    keepLink: /\/press\/pr\//,
    extract: { start: /<main[\s>]/i, end: /<\/main>/i },
    attribution: "Source: European Central Bank.",
  },
];

export function getNewsSource(id: string): NewsSource | undefined {
  return NEWS_SOURCES.find((s) => s.id === id);
}

/* Items never drafted, whatever the model thinks of them. Each names a real
   firm or person in an enforcement or criminal context, where a model's
   mistake is a defamation problem, not a typo. Checked against the title
   before triage, so they never reach the model at all. */
export const BLOCKED_TITLES: RegExp[] = [
  /warning on unauthori[sz]ed firm/i,
  /\(clone\)/i,
  /enforcement action/i,
  /\breprimand/i,
  /\bfined\b/i,
  /prohibition notice/i,
  /\bdefaulters?\b/i,
  /\bseiz(e|es|ed|ure|ures)\b/i,
  /contraband/i,
  /\bconvict/i,
  /\bcourt\b/i,
];

export function isBlockedTitle(title: string): boolean {
  return BLOCKED_TITLES.some((re) => re.test(title));
}

export const NEWS_LIMITS = {
  /** Drafts per run. Past this, the rest go into one round-up post. */
  maxDrafts: 3,
  /** Triage score (0 to 10) a story needs to be drafted at all. */
  minScore: 7,
  /** Most stories a round-up covers. */
  roundupMax: 6,
  /** Items older than this are ignored, so a long gap is not a flood. */
  lookbackDays: 10,
  /** Below this many characters of source text the story is too thin to
      write from honestly, and is skipped rather than padded out. */
  minSourceChars: 500,
  /** Source text per story sent to the model. Groq's free tier allows 8K
      tokens a minute INCLUDING the reply and any reasoning, so a draft call
      has to stay well under that: roughly 4 characters a token. */
  maxSourceChars: 9_000,
  roundupItemChars: 1_200,
  triageBatch: 12,
  /** AI drafts nobody has opened are removed after this many days. */
  expireDays: 21,
  /** A run still marked running after this long crashed. */
  staleRunMinutes: 120,
} as const;

/** Bumped whenever the prompts change, and stored on every draft, so a bad
    draft can be traced to the prompt that wrote it. */
export const PROMPT_VERSION = "news-v1";

/** Identifies the agent honestly. The `compatible;` form is the convention
    crawlers use (Googlebot does the same): gov.ie's CloudFront rejects a bare
    product token but accepts this, and it still names us and links back. */
export const NEWS_USER_AGENT =
  "Mozilla/5.0 (compatible; IrelandFintaxNewsBot/1.0; +https://www.irishfintax.ie/about)";

/* ── calculators a story can affect ────────────────────────────────────── */

export interface AffectedCalculator {
  key: string;
  label: string;
  /** Public page, offered to the model as an internal link. */
  href: string;
  /** Where the rates are edited. */
  adminHref: string;
}

/* Keys match EDITABLE_CALCULATORS where one exists, so the dashboard can
   compare a story's date with that calculator's last review. */
export const AFFECTED_CALCULATORS: AffectedCalculator[] = [
  { key: "income-tax", label: "Income tax", href: "/tools/ireland-income-tax", adminHref: "/admin/tax-rates" },
  { key: "vat", label: "VAT", href: "/tools/ireland-vat", adminHref: "/admin/vat-rates" },
  { key: "corporation-tax", label: "Corporation tax", href: "/tools/ireland-corporation-tax", adminHref: "/admin/ct-rates" },
  { key: "rd-credit", label: "R&D tax credit", href: "/tools/ireland-rd-tax-credit", adminHref: "/admin/rd-rates" },
  {
    key: "capital-allowances",
    label: "Capital allowances",
    href: "/tools/ireland-capital-allowances",
    adminHref: "/admin/capital-allowances-rates",
  },
  { key: "cgt", label: "Capital gains tax", href: "/tools/ireland-cgt", adminHref: "/admin/cgt-rates" },
  { key: "cat", label: "Capital acquisitions tax", href: "/tools/ireland-cat", adminHref: "/admin/cat-rates" },
  { key: "mortgage", label: "Mortgage", href: "/personal/mortgage", adminHref: "/admin/mortgage-rates" },
];

export const AFFECTED_KEYS = AFFECTED_CALCULATORS.map((c) => c.key);

export function getAffectedCalculator(key: string): AffectedCalculator | undefined {
  return AFFECTED_CALCULATORS.find((c) => c.key === key);
}
