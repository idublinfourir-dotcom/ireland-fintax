import { cache, type ReactNode } from "react";
import Image from "next/image";
import Link from "./locale-link";
import { Button, Container, Emphasis, Eyebrow, SectionHeading, fill } from "./ui";
import { Reveal } from "./reveal";
import { Accordion } from "./accordion";
import { HeroVideo } from "./hero-video";
import { HeroCoverflow } from "./hero-coverflow";
import { TaxCalendarBoard, type CalendarRow } from "./tax-calendar-board";
import { CALCULATOR_TOOLS } from "./calculator-tabs";
import { getTaxRates } from "../lib/tax-data";
import { comparisonYears } from "../lib/ireland-income-tax";
import { getVatData } from "../lib/vat-data";
import { getCorporationTaxData } from "../lib/corporation-tax-data";
import { getRdData } from "../lib/rd-data";
import { getCaData } from "../lib/ca-data";
import { getCgtData } from "../lib/cgt-data";
import { getCatData } from "../lib/cat-data";
import { getMortgageData } from "../lib/mortgage-data";
import { LATEST_BUDGET } from "../lib/budgets";
import { REVIEWER, REVIEWER_CREDENTIALS, REVIEWER_NAME } from "../lib/reviewer";
import { serviceCategories } from "../lib/content";
import { LIVE_LOCALES, localDate, numberFormat, shortMonth, type Locale } from "../lib/i18n";
import { irishToday, upcomingDeadlines } from "../lib/tax-calendar";
import { getMessages, getT } from "../lib/messages";
import type { Messages } from "../lib/messages/en";
import { homeMessages } from "../lib/messages/home";
import { LocaleLink } from "./locale-link";
import paperwork from "../assets/home/paperwork.jpg";
import house from "../assets/home/house.jpg";
import laptopCharts from "../assets/home/laptop-charts.jpg";
import notebook from "../assets/home/notebook.jpg";
import laptopFigures from "../assets/home/laptop-figures.jpg";
import table from "../assets/home/table.jpg";
import founder from "../assets/home/founder.jpeg";

/* ---------- shared by the home sections ---------- */

/* The rate data the home page quotes, read once a request: the hero cards,
   the finder and the FAQ all use it, and only the tax rates are cached by
   their own loader. */
const homeData = cache(async () => {
  const [rates, vat, ct, rd, ca, cgt, cat, mortgage] = await Promise.all([
    getTaxRates(),
    getVatData(),
    getCorporationTaxData(),
    getRdData(),
    getCaData(),
    getCgtData(),
    getCatData(),
    getMortgageData(),
  ]);
  const { current } = comparisonYears(new Date(), rates);
  return { rates, current, vat, ct, rd, ca, cgt, cat, mortgage };
});

const euro = (locale: Locale, n: number) =>
  numberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(n);

/** The latest Budget's name in this language ("Budget 2027"). */
const budgetLabel = (t: Messages) => t.header.tools[LATEST_BUDGET.href]?.label ?? LATEST_BUDGET.label;

/* The header's box (max-w-7xl px-8), so the sections line up with the logo
   and the hero copy. Container is narrower. */
const wide = "mx-auto w-full max-w-7xl px-5 sm:px-8";

const sectionTitle =
  "mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-[2.875rem]";

/* The design's lighter display titles: the finder, the calendar and the quote. */
const lightTitle = "font-display font-normal leading-[1.1] tracking-[-0.03em] text-balance";

function ArrowUpRight({ className = "" }: { className?: string }) {
  return (
    <svg
      width="12"
      height="12"
      viewBox="0 0 12 12"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`shrink-0 rtl:-scale-x-100 ${className}`}
    >
      <path d="M3.5 8.5l5-5M4.5 3.5h4v4" />
    </svg>
  );
}

const nudge =
  "transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5";

function Index({ n }: { n: number }) {
  return <>{String(n + 1).padStart(2, "0")}</>;
}

/* ---------- hero ---------- */

export async function Hero() {
  const { locale, t } = await getMessages();
  const h = (await getT(homeMessages)).hero;
  // The cards run on the same admin-editable rates as the calculator pages.
  const { rates, current, vat, ct, rd, ca, cgt, cat, mortgage } = await homeData();
  const owner = mortgage.products.filter((p) => p.audience.includes("first-time")).map((p) => p.ratePercent).sort((a, b) => a - b);
  const median = owner[Math.floor(owner.length / 2)] ?? 4;
  const num = numberFormat(locale);
  const stats = [
    { value: num.format(CALCULATOR_TOOLS.length), label: h.stats.tools },
    { value: euro(locale, rates[current].incomeTax.srcop.single), label: h.stats.band.replace("{year}", String(current)) },
    { value: num.format(LIVE_LOCALES.length), label: h.stats.languages },
  ];
  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-navy-900 text-white">
      <HeroVideo
        clips={[
          // All three are Dublin's financial quarter: the Docklands and the
          // IFSC: rather than city landmarks. The brief is "Irish Fintax",
          // so the footage has to read as a business district, not a tourist
          // skyline, and no clip may carry another country's tax paperwork.
          //
          // Pexels License: free for commercial use, no attribution required.
          // Re-encoded to 1280x720 h264 (CRF 28), audio stripped, +faststart:
          // 7.5 MB to 4.4 MB for the three (28 Oct 2026). The posters stay
          // 1920px; next/image serves them resized.
          //
          // The part after the number is the first 8 hex of the file's
          // sha256, and the files are cached for a year (next.config.ts).
          // scripts/hash-hero.mjs keeps the names and these paths in step
          // (it runs before dev and build): to replace one, drop the new
          // file in public/ as plain hero-N.mp4 or .jpg.
          //
          // Down the Liffey through the office quarter, quays on both banks.
          // The concrete tower fills the left third, which is where the scrim
          // and the headline sit: white text measures 12.4:1 over that region.
          { src: "/hero-1.77020ed2.mp4", poster: "/hero-1.c788c91e.jpg" },
          // Dublin Docklands / IFSC: River Liffey and the Samuel Beckett Bridge
          { src: "/hero-2.a7630019.mp4", poster: "/hero-2.d21fc69f.jpg" },
          // Low over the water toward the Beckett Bridge and the Convention
          // Centre. Opens dark as the drone lifts off the water; that lands
          // under the 1s cross-fade from the previous clip, so it reads as
          // intended rather than as a black frame.
          { src: "/hero-3.4ec11020.mp4", poster: "/hero-3.8100e577.jpg" },
        ]}
        className="absolute inset-0 -z-20"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-navy-900/15"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900/85 via-navy-900/45 to-transparent"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-t from-navy-900/70 via-transparent to-navy-900/20"
      />
      <div className="hf-layout">
        <div className="max-w-4xl">
          <span className="animate-fade-up block">
            <Eyebrow tone="dark">{h.eyebrow}</Eyebrow>
          </span>
          <h1 className="animate-fade-up mt-6 font-display text-[2.5rem] font-normal leading-[1.1] tracking-[-0.04em] text-balance [animation-delay:80ms] sm:text-5xl lg:text-[2.875rem] xl:text-6xl 2xl:text-[4.25rem]">
            <Emphasis text={h.title.replace("{budget}", budgetLabel(t))} className="block text-primary-300 not-italic" />
          </h1>
          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-8 text-white/80 [animation-delay:150ms]">
            {h.lede.replace("{count}", num.format(CALCULATOR_TOOLS.length))}
          </p>
          <div className="animate-fade-up mt-8 flex flex-col items-stretch gap-3 [animation-delay:220ms] sm:flex-row sm:items-center sm:gap-3.5">
            <Button locale={locale} href="/tools/ireland-income-tax" className="group">
              {h.cta}
              <ArrowUpRight className={nudge} />
            </Button>
            <Button locale={locale} href={LATEST_BUDGET.href} variant="outlineLight" className="group">
              {h.budget.replace("{budget}", budgetLabel(t))}
              <ArrowUpRight className={nudge} />
            </Button>
          </div>
          <ul className="animate-fade-up mt-7 flex flex-wrap gap-x-6 gap-y-1.5 text-xs leading-[1.6] text-white/75 [animation-delay:260ms]">
            {h.checks.map((check) => (
              <li key={check} className="flex items-center gap-1.5">
                <span aria-hidden="true" className="text-primary-200">✓</span>
                {check}
              </li>
            ))}
          </ul>
          <dl className="animate-fade-up mt-10 flex max-w-xl flex-wrap gap-x-11 gap-y-5 border-t border-white/15 pt-6 [animation-delay:300ms]">
            {stats.map((s) => (
              <div key={s.label} className="flex flex-col-reverse">
                <dt className="mt-1 text-xs leading-5 text-white/75">{s.label}</dt>
                <dd className="font-display text-[1.625rem] leading-[1.15] font-bold tracking-[-0.02em]">{s.value}</dd>
              </div>
            ))}
          </dl>
        </div>
        <HeroCoverflow
          data={{
            year: current,
            rates: rates[current],
            vat: vat.config,
            ct: ct.config,
            rd: rd.config,
            ca: ca.config,
            cgt: cgt.config,
            cat: cat.config,
            mortgageRate: Math.round(median * 20) / 20,
          }}
        />
      </div>
    </section>
  );
}

/* ---------- finder (dark band under the hero) ---------- */

type FinderIcon = "wallet" | "trend" | "home" | "office";

function FinderGlyph({ name }: { name: FinderIcon }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "wallet":
      return (
        <svg {...common}>
          <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3" />
          <rect x="4" y="8" width="16" height="11" rx="2" />
          <path d="M16 13.5h1" />
        </svg>
      );
    case "trend":
      return (
        <svg {...common}>
          <path d="M3 17l6-6 4 4 8-8" />
          <path d="M15 7h6v6" />
        </svg>
      );
    case "home":
      return (
        <svg {...common}>
          <path d="M4 11l8-6.5 8 6.5" />
          <path d="M6 9.5V20h12V9.5" />
          <path d="M10 20v-5h4v5" />
        </svg>
      );
    case "office":
      return (
        <svg {...common}>
          <rect x="5" y="3.5" width="14" height="17" rx="1.5" />
          <path d="M9 8h2M13 8h2M9 12h2M13 12h2M10.5 20.5v-3.5h3v3.5" />
        </svg>
      );
  }
}

/* Paired by index with homeMessages finder.items (title, note). */
const finderEntries: { icon: FinderIcon; href: string }[] = [
  { icon: "wallet", href: "/tools/ireland-income-tax" },
  { icon: "trend", href: "/tools/ireland-cgt" },
  { icon: "home", href: "/personal/mortgage" },
  { icon: "office", href: "/toolkits" },
];

export async function Finder() {
  const { locale } = await getMessages();
  const f = (await getT(homeMessages)).finder;
  const { rates, current, cgt } = await homeData();
  const values = {
    band: euro(locale, rates[current].incomeTax.srcop.single),
    exemption: euro(locale, cgt.config.annualExemptionEur),
  };
  return (
    <section className="relative isolate overflow-hidden bg-navy-800 text-white">
      {/* the design's soft blue glow from the top edge */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_80%_at_50%_0%,rgb(48_70_181/0.18),transparent_70%)]"
      />
      <div className={`${wide} py-16 sm:py-[5.5rem]`}>
        <Reveal>
          <Eyebrow tone="midnight">{f.eyebrow}</Eyebrow>
          <h2 className={`mt-4 whitespace-pre-line text-[2rem] sm:text-[2.5rem] ${lightTitle}`}>{f.title}</h2>
        </Reveal>
        <Reveal delay={120}>
          <ul className="mt-8 grid grid-cols-1 gap-px border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
            {f.items.map((item, i) => (
              <li key={finderEntries[i].href} className="flex">
                <LocaleLink
                  locale={locale}
                  href={finderEntries[i].href}
                  className="group flex w-full items-start gap-4 bg-navy-800 px-5 py-7 shadow-[inset_0_1px_0_rgb(255_255_255/0.07)] transition-colors duration-200 hover:bg-navy-700 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-300"
                >
                  <span className="grid size-11 shrink-0 place-items-center rounded-lg border border-white/12 text-primary-300 transition-colors duration-200 group-hover:border-primary-300/50">
                    <FinderGlyph name={finderEntries[i].icon} />
                  </span>
                  <span className="flex min-w-0 flex-col">
                    <span className="font-display text-base leading-tight text-white">
                      {item.title}{" "}
                      <span
                        aria-hidden="true"
                        className="inline-block text-primary-300 transition-transform duration-200 rtl:-scale-x-100 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                      >
                        →
                      </span>
                    </span>
                    <span className="mt-1.5 text-sm leading-[1.65] text-white/60">{fill(item.note, values)}</span>
                  </span>
                </LocaleLink>
              </li>
            ))}
          </ul>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- who we are ---------- */

/* Says what the platform is and how it works. The one named person on the
   page is the quote further down, supplied by the owner (28 Oct 2026). */
export async function WhoWeAre() {
  const { locale } = await getMessages();
  const w = (await getT(homeMessages)).who;
  return (
    <section className="bg-white">
      <div className={`${wide} grid gap-14 py-20 sm:py-[5.5rem] lg:grid-cols-2 lg:items-center lg:gap-20`}>
        <Reveal>
          <Eyebrow>{w.eyebrow}</Eyebrow>
          <h2 className={`${sectionTitle} max-w-xl text-ink`}>{w.title}</h2>
          <p className="mt-6 max-w-md leading-[1.65] text-muted">{w.body}</p>
          <LocaleLink
            locale={locale}
            href="/about"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            {w.more}
            <ArrowUpRight className={nudge} />
          </LocaleLink>
          <p className="mt-5 max-w-xl text-xs leading-[1.6] text-muted">{w.note}</p>
          <figure className="relative mt-9 aspect-[47/22] max-w-[470px] overflow-hidden rounded-lg rounded-se-[65px] bg-surface-muted">
            <Image
              src={paperwork}
              alt=""
              fill
              sizes="(min-width: 640px) 470px, 100vw"
              placeholder="blur"
              className="object-cover"
            />
            <div
              aria-hidden="true"
              className="absolute inset-x-0 bottom-0 h-[70%] bg-gradient-to-b from-midnight/0 to-midnight/75"
            />
            <figcaption className="absolute start-5 end-5 bottom-4 text-sm text-white">
              {w.caption}
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={120}>
          <ol className="rounded-[10px] bg-surface-soft p-6 sm:p-[30px]">
            {w.principles.map((p, i) => (
              <li key={p.title} className="flex gap-6 border-b border-line py-6 first:pt-0 last:border-b-0 last:pb-0">
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-primary-100 bg-white text-[11px] text-primary-500">
                  <Index n={i} />
                </span>
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-primary-500">{p.label}</p>
                  <h3 className="mt-1.5 font-display text-[17px] font-semibold tracking-[-0.01em] text-ink">
                    {p.title}
                  </h3>
                  <p className="mt-1.5 text-sm leading-6 text-muted">{p.note}</p>
                </div>
              </li>
            ))}
          </ol>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- tax calendar ---------- */

const ENGLISH_MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

/* The dates still ahead in Ireland today (lib/tax-calendar.ts), so the page
   never shows a deadline that has passed. Hidden once the list runs out. */
export async function TaxCalendar() {
  const { locale } = await getMessages();
  const c = (await getT(homeMessages)).calendar;
  const today = irishToday();
  const upcoming = upcomingDeadlines(today);
  if (upcoming.length === 0) return null;

  const rows: CalendarRow[] = upcoming.map((d) => {
    const [y, m, day] = d.date.split("-").map(Number);
    const words = c.kinds[d.kind];
    const years = { year: String(y), prev: String(y - 1) };
    return {
      date: d.date,
      day: String(day),
      month: `${shortMonth(locale, m - 1)} ${y}`,
      long: localDate(locale, `${day} ${ENGLISH_MONTHS[m - 1]} ${y}`),
      audience: words.audience,
      title: words.title,
      note: words.note.replace(/\{(year|prev)\}/g, (_, k: "year" | "prev") => years[k]),
      link: words.link,
      href: d.source,
    };
  });
  const thisYear = Number(today.slice(0, 4));

  return (
    <section id="calendar" className="scroll-mt-24 bg-white">
      <div className={`${wide} py-20 sm:py-[5.5rem]`}>
        <TaxCalendarBoard
          rows={rows}
          more={c.more}
          less={c.less}
          nextLabel={c.next}
          intro={
            <>
              <Eyebrow>{c.eyebrow}</Eyebrow>
              <h2 className={`mt-5 text-4xl text-ink sm:text-[2.875rem] ${lightTitle}`}>
                <Emphasis
                  text={c.title.replace("{years}", `${thisYear} / ${thisYear + 1}`)}
                  className="block text-primary-500 not-italic"
                />
              </h2>
              <p className="mt-5 max-w-md leading-[1.65] text-muted">{c.body}</p>
            </>
          }
        />
      </div>
    </section>
  );
}

/* ---------- topics: a tool and a guide for each ---------- */

/* Paired by index with homeMessages topics.items (title, note, tags). */
const topicHrefs = [
  "/tools/ireland-income-tax",
  "/personal/investment",
  "/personal/mortgage",
  "/toolkits",
  "/investment-account",
  LATEST_BUDGET.href,
];

export async function Topics() {
  const { locale, t } = await getMessages();
  const c = (await getT(homeMessages)).topics;
  const budget = budgetLabel(t);
  return (
    <section className="bg-white">
      <div className={`${wide} py-20 sm:py-[5.5rem]`}>
        <Reveal className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,388px)] lg:items-center lg:gap-16">
          <div>
            <Eyebrow>{c.eyebrow}</Eyebrow>
            <h2 className={`${sectionTitle} max-w-3xl text-ink`}>{c.title}</h2>
            <p className="mt-5 max-w-3xl text-[17px] leading-[1.65] text-muted">{c.lede.replace("{budget}", budget)}</p>
          </div>
          <figure className="relative aspect-[388/220] overflow-hidden rounded-lg rounded-ee-[55px] bg-surface-muted">
            <Image
              src={laptopCharts}
              alt=""
              fill
              sizes="(min-width: 1024px) 388px, 100vw"
              placeholder="blur"
              className="object-cover"
            />
            <figcaption className="absolute start-4 bottom-4 flex items-center gap-2.5 rounded-[5px] border border-white bg-white/90 px-3.5 py-2 text-[11px] text-ink-body shadow-[0_5px_20px_rgb(23_33_57/0.09)] backdrop-blur-lg">
              <span aria-hidden="true" className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
              {c.caption}
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={120}>
          <ul className="mt-11 grid gap-3.5 sm:grid-cols-2 lg:grid-cols-3">
            {c.items.map((item, i) => (
              <li key={topicHrefs[i]}>
                <LocaleLink
                  locale={locale}
                  href={topicHrefs[i]}
                  className="group relative flex h-full flex-col rounded-lg border border-line bg-white p-[30px] shadow-[0_16px_32px_-12px_rgb(17_33_60/0.28),0_1px_2px_rgb(17_33_60/0.06)] transition-[border-color,box-shadow] duration-200 hover:border-primary-300 hover:shadow-[0_20px_40px_-12px_rgb(17_33_60/0.34),0_1px_2px_rgb(17_33_60/0.06)] focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
                >
                  <span className="text-[11px] text-primary-300">
                    <Index n={i} />
                  </span>
                  <h3 className="mt-3.5 pe-10 font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">
                    {item.title.replace("{budget}", budget)}
                  </h3>
                  <p className="mt-3 max-w-[16rem] text-[13px] leading-[1.65] text-muted">{item.note}</p>
                  <ul className="mt-auto flex flex-wrap gap-1.5 pt-4">
                    {item.tags.map((tag) => (
                      <li key={tag} className="rounded-full bg-surface-muted px-2.5 py-1 text-[10px] leading-[1.65] text-primary-500">
                        {tag}
                      </li>
                    ))}
                  </ul>
                  <span
                    aria-hidden="true"
                    className="absolute end-[27px] top-[27px] grid size-[30px] place-items-center rounded-full bg-surface-tint text-primary-500 transition-colors duration-200 group-hover:bg-primary-500 group-hover:text-white"
                  >
                    <ArrowUpRight className="size-3.5" />
                  </span>
                </LocaleLink>
              </li>
            ))}
          </ul>
          <p className="mt-5 text-xs leading-[1.65] text-muted">{c.footnote}</p>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- services ---------- */

export function Services() {
  return (
    <section id="services" className="scroll-mt-24 bg-canvas">
      <Container className="py-20 sm:py-28">
        <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="What we do"
            title="One firm for the whole journey."
            lede="Year-end accounts, payroll, tax, a part-time CFO: take one or the lot. Across Ireland."
          />
          <Link
            href="/services"
            className="text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            All services <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
          </Link>
        </div>
        <div className="mt-14 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {serviceCategories.map((category) => (
            <Link
              key={category.slug}
              href={`/services/${category.slug}`}
              className="group relative flex items-center justify-between gap-3 bg-surface p-8 transition-colors duration-200 hover:bg-secondary-50/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
            >
              <span
                aria-hidden="true"
                className="absolute inset-s-0 top-0 h-1 w-0 bg-primary-500 transition-all duration-300 group-hover:w-full"
              />
              <h3 className="flex flex-wrap items-center gap-2 font-display text-xl font-bold tracking-[-0.01em] text-ink">
                {category.title}
                {category.status === "coming-soon" && (
                  <span className="rounded-none bg-secondary-50 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-secondary-500">
                    Soon
                  </span>
                )}
              </h3>
              <span
                aria-hidden="true"
                className="text-primary-500 inline-block rtl:-scale-x-100 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
              >
                →
              </span>
            </Link>
          ))}

          {/* fills the trailing grid cell with a CTA instead of empty space */}
          <Link
            href="/contact"
            className="group flex items-center justify-between gap-3 bg-navy-900 p-8 text-white transition-colors duration-200 hover:bg-navy-800 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-400 sm:col-span-2 lg:col-span-1"
          >
            <h3 className="font-display text-xl font-bold tracking-[-0.01em] text-primary-300">
              Not sure where to start?
            </h3>
            <span
              aria-hidden="true"
              className="text-primary-300 inline-block rtl:-scale-x-100 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
            >
              →
            </span>
          </Link>
        </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- budget ---------- */

export async function BudgetFeature() {
  const { locale, t } = await getMessages();
  const b = (await getT(homeMessages)).budget;
  const budget = budgetLabel(t);
  return (
    <section className="relative isolate overflow-hidden bg-surface-muted">
      {/* a faint circle running off the start edge, as in the design */}
      <div
        aria-hidden="true"
        className="absolute -start-[248px] top-[74%] -z-10 hidden size-[453px] rounded-full border border-primary-100 lg:block"
      />
      <div className={`${wide} grid gap-14 py-20 sm:py-[5.5rem] lg:grid-cols-2 lg:items-center lg:gap-[90px]`}>
        <Reveal>
          <Eyebrow>{b.eyebrow.replace("{budget}", budget)}</Eyebrow>
          <h2 className={`${sectionTitle} max-w-md text-ink`}>
            <Emphasis text={b.title} className="text-primary-400 not-italic" />
          </h2>
          <p className="mt-6 max-w-md leading-[1.65] text-muted">{b.body}</p>
          <p className="mt-3 max-w-md text-sm leading-6 text-muted">
            {b.status.replace("{date}", localDate(locale, LATEST_BUDGET.checked))}
          </p>
          <div className="mt-8">
            <Button
              locale={locale}
              href={LATEST_BUDGET.href}
              className="group rounded-[5px]! shadow-[0_4px_12px_rgb(30_49_158/0.07)]"
            >
              {b.cta.replace("{budget}", budget)}
              <ArrowUpRight className={nudge} />
            </Button>
          </div>
        </Reveal>
        <Reveal delay={120} className="relative">
          <div className="relative ms-auto aspect-[469/455] max-h-[455px] w-full overflow-hidden rounded-[10px] rounded-ss-[80px] lg:w-[86%]">
            <Image
              src={house}
              alt=""
              fill
              sizes="(min-width: 1024px) 470px, 100vw"
              placeholder="blur"
              className="object-cover"
            />
          </div>
          <div className="relative mx-4 -mt-24 rounded-[9px] border border-white bg-white/90 px-6 py-6 shadow-[0_18px_45px_rgb(17_33_60/0.13)] backdrop-blur-xl sm:mx-8 sm:px-7 lg:absolute lg:-start-[15px] lg:top-[39%] lg:m-0 lg:w-[78%]">
            <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary-600/80">
              {b.cardEyebrow}
            </p>
            <p className="mt-2.5 font-display text-7xl leading-[1.15] font-bold tracking-[-0.06em] text-primary-600 sm:text-[88px]">
              {/* two-tone, as the design has it */}
              {String(LATEST_BUDGET.year).slice(0, 2)}
              <span className="text-primary-400">{String(LATEST_BUDGET.year).slice(2)}</span>
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {b.topics.map((topic) => (
                <li key={topic} className="rounded-full bg-surface-tint px-2.5 py-2 text-[11px] leading-none text-ink">
                  {topic}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{b.caption}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- learn, calculate, take action (midnight band) ---------- */

/* Paired by index with homeMessages learn.items (title, note, link). */
const learnSteps = [
  { href: "/blog", image: notebook },
  { href: "/tools/ireland-income-tax", image: laptopFigures },
  { href: "/#calendar", image: table },
];

export async function LearnBand() {
  const { locale } = await getMessages();
  const l = (await getT(homeMessages)).learn;
  return (
    <section className="relative isolate overflow-hidden bg-midnight text-white">
      <div
        aria-hidden="true"
        className="absolute -end-56 -top-64 -z-10 size-[40rem] bg-radial from-primary-500/35 to-transparent to-70%"
      />
      <div className={`${wide} py-20 sm:py-[5.5rem]`}>
        <Reveal>
          <Eyebrow tone="midnight">{l.eyebrow}</Eyebrow>
          <h2 className={`${sectionTitle} max-w-[40rem]`}>
            <Emphasis text={l.title} className="block text-primary-200 not-italic" />
          </h2>
        </Reveal>
        <ul className="mt-11 grid gap-x-7 gap-y-14 md:grid-cols-3">
          {l.items.map((item, i) => (
            <li key={learnSteps[i].href}>
              <Reveal delay={i * 80} className="flex h-full flex-col">
                <div className="relative aspect-[375/190] overflow-hidden rounded-[7px] bg-navy-800">
                  <Image
                    src={learnSteps[i].image}
                    alt=""
                    fill
                    sizes="(min-width: 768px) 33vw, 100vw"
                    placeholder="blur"
                    className="object-cover"
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-b from-midnight/0 to-midnight/40"
                  />
                  <span className="absolute start-3.5 bottom-3 rounded-[4px] border border-white bg-white/90 px-2.5 py-0.5 text-[11px] text-primary-500">
                    <Index n={i} />
                  </span>
                </div>
                <h3 className="mt-6 font-display text-[23px] font-semibold tracking-[-0.025em]">
                  {item.title}
                </h3>
                <p className="mt-4 max-w-[330px] text-sm leading-[1.65] text-white/70">
                  {item.note}
                </p>
                <LocaleLink
                  locale={locale}
                  href={learnSteps[i].href}
                  className="group mt-6 inline-flex items-center gap-1.5 self-start text-xs font-bold text-primary-200 transition-colors duration-200 hover:text-white"
                >
                  {item.link}
                  <ArrowUpRight className={nudge} />
                </LocaleLink>
              </Reveal>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/* ---------- faq ---------- */

/* Paired by index with homeMessages faq.items; "" for an answer with no link. */
const faqLinks = [
  "/blog/how-savings-and-investments-are-taxed",
  "/toolkits",
  "https://www.revenue.ie/en/property/rental-income/index.aspx",
  "/blog/how-savings-and-investments-are-taxed",
  "/tools/ireland-cat",
  "",
  "",
];

export async function Faq() {
  const { locale } = await getMessages();
  const f = (await getT(homeMessages)).faq;
  const { vat, cat } = await homeData();
  const values: Record<string, string> = {
    goods: euro(locale, vat.config.thresholds.goods),
    services: euro(locale, vat.config.thresholds.services),
    a: euro(locale, cat.config.thresholds.groupA),
    b: euro(locale, cat.config.thresholds.groupB),
    c: euro(locale, cat.config.thresholds.groupC),
    rate: numberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(cat.config.ratePercent / 100),
  };
  const items = f.items.map((item, i) => ({
    question: item.question,
    answer: item.answer.replace(/\{(\w+)\}/g, (whole, k: string) => values[k] ?? whole),
    link: item.link && faqLinks[i] ? { label: item.link, href: faqLinks[i] } : undefined,
  }));
  return (
    <section id="faq" className="scroll-mt-24 bg-white">
      <div className={`${wide} grid gap-10 py-20 sm:py-[6.25rem] lg:grid-cols-[minmax(0,495px)_minmax(0,605px)] lg:justify-between`}>
        <Reveal>
          <Eyebrow>{f.eyebrow}</Eyebrow>
          <h2 className={`${sectionTitle} max-w-md text-ink`}>{f.title}</h2>
        </Reveal>
        <Reveal delay={120} className="border-t border-line">
          <Accordion items={items} openFirst />
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- founder ---------- */

/* About the Founder (ui-ux-reviews design, frame 470:2090; owner, 29 Oct 2026).
   It replaced the closing quote, which the site review found promotional. The
   name and credentials are the reviewer's, from lib/reviewer.ts.
   Built to the frame's own measurements, not the site's home-section box: a
   1180px container, Arial throughout (the only section set in it; Liberation
   Sans and Arimo share its metrics), the frame's colours, and a blurred blue
   glow behind the photo. The text column keeps the frame's empty 49px below the
   last paragraph, which is what centres the photo against it. */
const FOUNDER_FONT =
  "Arial, Helvetica, 'Liberation Sans', Arimo, var(--font-arabic), var(--font-bengali), var(--font-devanagari), sans-serif";

export async function Founder() {
  const f = (await getT(homeMessages)).founder;
  return (
    <section
      aria-labelledby="founder"
      className="relative isolate overflow-hidden bg-midnight text-white"
      style={{ fontFamily: FOUNDER_FONT }}
    >
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 -z-10 h-full bg-[radial-gradient(60%_80%_at_50%_0%,rgb(48_70_181/0.18),transparent_70%)]"
      />
      <div className="mx-auto grid w-full max-w-[1244px] items-center gap-12 px-5 py-20 sm:px-8 sm:py-[100px] lg:grid-cols-[410px_minmax(0,1fr)] lg:gap-[90px]">
        <Reveal>
          <figure className="relative w-full max-w-[320px] md:max-w-[360px] lg:ms-2.5 lg:max-w-[400px]">
            <div
              aria-hidden="true"
              className="absolute inset-x-6 top-[14%] -z-10 h-[82%] rounded-full bg-[radial-gradient(closest-side,rgb(74_95_214/0.7),transparent)] blur-[56px]"
            />
            <Image
              src={founder}
              alt={REVIEWER_NAME}
              sizes="(min-width: 1024px) 400px, (min-width: 768px) 360px, 320px"
              className="h-auto w-full rounded-xl shadow-[0_30px_72px_rgb(0_0_0/0.6)]"
            />
          </figure>
        </Reveal>
        <Reveal delay={120} className="lg:pb-[49px]">
          <p className="text-xs leading-[19.8px] font-bold tracking-[0.12em] text-[#8493ff] uppercase">{f.eyebrow}</p>
          <h2 id="founder" className="mt-[35px] text-[2rem] leading-[1.2] font-bold tracking-[-0.02em] sm:text-[38px]">
            {REVIEWER_NAME}
          </h2>
          <p className="mt-1.5 text-[17px] leading-[1.4] font-semibold text-[#8493ff]">{REVIEWER_CREDENTIALS}</p>
          <div className="mt-5 flex max-w-[620px] flex-col gap-3.5 text-[15px] leading-[1.65] text-[#c0c9dc]">
            {f.paragraphs.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- trust strip ---------- */

export async function TrustStrip() {
  const items = (await getT(homeMessages)).trust;
  return (
    <section className="border-y border-line bg-surface-soft">
      <ul className={`${wide} grid grid-cols-1 gap-x-8 gap-y-2.5 py-5 text-xs font-semibold leading-5 text-ink-body sm:grid-cols-2 lg:gap-x-16`}>
        {items.map((item) => (
          <li key={item} className="flex items-center gap-2 lg:whitespace-nowrap">
            <span aria-hidden="true" className="text-primary-500">✓</span>
            {item.replace("{name}", REVIEWER_NAME).replace("{reviewer}", REVIEWER)}
          </li>
        ))}
      </ul>
    </section>
  );
}

/* ---------- home page closing call ---------- */

export async function HomeCta() {
  const { locale, t } = await getMessages();
  const c = (await getT(homeMessages)).cta;
  return (
    <section className="bg-surface-wash">
      <div className={`${wide} flex flex-col gap-8 py-16 lg:flex-row lg:items-center lg:justify-between lg:gap-12`}>
        <div className="max-w-2xl">
          <Eyebrow>{t.cta.eyebrow}</Eyebrow>
          <h2 className="mt-5 font-display text-3xl leading-[1.12] font-semibold tracking-[-0.035em] text-balance text-ink sm:text-[2.375rem]">
            <Emphasis text={c.title} className="text-primary-500 not-italic sm:block" />
          </h2>
          <p className="mt-5 text-sm leading-[1.65] text-muted">{c.body}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <Button locale={locale} href="/tools/ireland-income-tax" className="group">
            {c.explore}
            <ArrowUpRight className={nudge} />
          </Button>
          <Button
            locale={locale}
            href="/signup"
            variant="white"
            className="border border-primary-500"
          >
            {c.account}
          </Button>
        </div>
      </div>
    </section>
  );
}

/* ---------- related services rail ---------- */

export function RelatedServices({
  currentSlug,
  heading = "Explore other services",
}: {
  currentSlug?: string;
  heading?: string;
}) {
  const others = serviceCategories
    .filter((category) => category.slug !== currentSlug)
    .slice(0, 4);
  return (
    <section className="border-t border-line bg-canvas">
      <Container className="py-16 sm:py-20">
        <Reveal>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
            {heading}
          </h2>
          <Link
            href="/services"
            className="text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            All services <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
          </Link>
        </div>
        <div className="mt-8 grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
          {others.map((category) => (
            <Link
              key={category.slug}
              href={`/services/${category.slug}`}
              className="group relative flex flex-col bg-surface p-6 transition-colors duration-200 hover:bg-secondary-50/50 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
            >
              <span
                aria-hidden="true"
                className="absolute inset-s-0 top-0 h-0.5 w-0 bg-primary-400 transition-all duration-300 group-hover:w-full"
              />
              <h3 className="font-display text-base font-semibold tracking-tight text-ink">
                {category.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                {category.blurb}
              </p>
              <span className="mt-auto pt-4 text-sm font-semibold text-primary-500">
                Learn more <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
              </span>
            </Link>
          ))}
        </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- contact cta ---------- */

/* Inner pages' closing call to ask a question; the home page ends on HomeCta.
   `wide` lines it up with the home sections; other pages keep Container's
   width, which is what their content above it uses. */
export async function ContactCta({
  children,
  wide: isWide = false,
}: {
  children?: ReactNode;
  wide?: boolean;
}) {
  const { locale, t } = await getMessages();
  const box = isWide ? wide : "mx-auto w-full max-w-6xl px-5 sm:px-8";
  return (
    <section id="contact" className="scroll-mt-24 bg-surface-wash">
      <div className={`${box} flex flex-col gap-8 py-16 sm:flex-row sm:items-center sm:justify-between sm:gap-12`}>
        <div className="max-w-xl">
          <Eyebrow>{t.cta.eyebrow}</Eyebrow>
          <h2 className="mt-5 font-display text-3xl leading-[1.12] font-semibold tracking-[-0.035em] text-balance text-ink sm:text-[2.375rem]">
            {children ?? (
              <Emphasis text={t.cta.title} className="text-primary-400 not-italic sm:block" />
            )}
          </h2>
          <p className="mt-5 text-sm leading-[1.65] text-muted">{t.cta.body}</p>
        </div>
        <Button
          locale={locale}
          href="/contact"
          variant="white"
          className="group shrink-0 self-start sm:self-auto"
        >
          {t.cta.button}
          <ArrowUpRight className={nudge} />
        </Button>
      </div>
    </section>
  );
}
