import type { ReactNode } from "react";
import Image from "next/image";
import Link from "./locale-link";
import { Button, Container, Emphasis, Eyebrow, SectionHeading } from "./ui";
import { Reveal } from "./reveal";
import { Accordion } from "./accordion";
import { HeroVideo } from "./hero-video";
import { HeroCoverflow } from "./hero-coverflow";
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
import { serviceCategories } from "../lib/content";
import { getMessages } from "../lib/messages";
import { LocaleLink } from "./locale-link";
import paperwork from "../assets/home/paperwork.jpg";
import house from "../assets/home/house.jpg";
import laptopCharts from "../assets/home/laptop-charts.jpg";
import notebook from "../assets/home/notebook.jpg";
import laptopFigures from "../assets/home/laptop-figures.jpg";
import table from "../assets/home/table.jpg";

/* ---------- hero ---------- */

export async function Hero() {
  const { locale, t } = await getMessages();
  // The cards run on the same admin-editable rates as the calculator pages.
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
  const owner = mortgage.products.filter((p) => p.audience.includes("first-time")).map((p) => p.ratePercent).sort((a, b) => a - b);
  const median = owner[Math.floor(owner.length / 2)] ?? 4;
  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-navy-900 text-white">
      <HeroVideo
        clips={[
          // All three are Dublin's financial quarter — the Docklands and the
          // IFSC — rather than city landmarks. The brief is "Irish Fintax",
          // so the footage has to read as a business district, not a tourist
          // skyline, and no clip may carry another country's tax paperwork.
          //
          // Pexels License: free for commercial use, no attribution required.
          // Re-encoded to 1920x1080 h264, audio stripped, +faststart.
          //
          // Down the Liffey through the office quarter, quays on both banks.
          // The concrete tower fills the left third, which is where the scrim
          // and the headline sit — white text measures 12.4:1 over that region.
          { src: "/hero-1.mp4", poster: "/hero-1.jpg" },
          // Dublin Docklands / IFSC — River Liffey and the Samuel Beckett Bridge
          { src: "/hero-2.mp4", poster: "/hero-2.jpg" },
          // Low over the water toward the Beckett Bridge and the Convention
          // Centre. Opens dark as the drone lifts off the water; that lands
          // under the 1s cross-fade from the previous clip, so it reads as
          // intended rather than as a black frame.
          { src: "/hero-3.mp4", poster: "/hero-3.jpg" },
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
            <Eyebrow tone="dark">{t.hero.eyebrow}</Eyebrow>
          </span>
          <h1 className="animate-fade-up mt-7 font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-balance [animation-delay:80ms] sm:text-6xl xl:text-7xl">
            <Emphasis text={t.hero.title} className="text-primary-300 not-italic" />
          </h1>
          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-8 text-white/80 [animation-delay:150ms] sm:text-xl">
            {t.hero.lede}
          </p>
          <div className="animate-fade-up mt-10 flex flex-col items-stretch gap-3 [animation-delay:220ms] sm:flex-row sm:items-center sm:gap-4">
            <Button locale={locale} href="/tools/ireland-income-tax">
              {t.hero.cta}
            </Button>
            <Button locale={locale} href="/contact" variant="outlineLight">
              {t.hero.ask}
            </Button>
          </div>
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

/* ---------- quick entry (dark strip) ---------- */

type EntryIcon = "user" | "building" | "compass" | "chip";

function EntryGlyph({ name }: { name: EntryIcon }) {
  const common = {
    width: 22,
    height: 22,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "user":
      return (
        <svg {...common}>
          <circle cx="12" cy="8" r="3.5" />
          <path d="M5 20c0-3.6 3.1-6 7-6s7 2.4 7 6" />
        </svg>
      );
    case "building":
      return (
        <svg {...common}>
          <path d="M4 21h16M6 21V5l7-2v18M18 21V9l-5-1.5" />
          <path d="M9 8h0M9 11h0M9 14h0" />
        </svg>
      );
    case "compass":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="9" />
          <path d="M15.5 8.5l-2 5-5 2 2-5 5-2z" />
        </svg>
      );
    case "chip":
      return (
        <svg {...common}>
          <rect x="7" y="7" width="10" height="10" rx="1.5" />
          <path d="M10 4v3M14 4v3M10 17v3M14 17v3M4 10h3M4 14h3M17 10h3M17 14h3" />
        </svg>
      );
  }
}

/* Paired by index with t.quickEntries (title, note). */
const quickEntries: { icon: EntryIcon; href: string }[] = [
  { icon: "chip", href: "/tools/ireland-income-tax" },
  { icon: "user", href: "/personal/mortgage" },
  { icon: "building", href: "/toolkits" },
  { icon: "compass", href: "/contact" },
];

export async function QuickEntry() {
  const { locale, t } = await getMessages();
  return (
    <section className="bg-navy-800 text-white">
      <Container className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {quickEntries.map((entry, i) => (
          <LocaleLink
            key={entry.href}
            locale={locale}
            href={entry.href}
            className="group flex items-start gap-4 bg-navy-800 px-5 py-7 transition-colors duration-200 hover:bg-navy-700"
          >
            <span className="mt-0.5 text-primary-300 transition-colors duration-200 group-hover:text-primary-400">
              <EntryGlyph name={entry.icon} />
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-1.5 font-display text-base font-semibold tracking-tight text-white">
                {t.quickEntries[i].title}
                <span
                  aria-hidden="true"
                  className="translate-x-0 text-primary-300 inline-block rtl:-scale-x-100 transition-transform duration-200 group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                >
                  →
                </span>
              </span>
              <span className="mt-1 text-sm leading-6 text-white/60">
                {t.quickEntries[i].note}
              </span>
            </span>
          </LocaleLink>
        ))}
      </Container>
    </section>
  );
}

/* ---------- shared by the home sections below ---------- */

/* The header's box (max-w-7xl px-8), so the sections line up with the logo
   and the hero copy, as figma_landing has them. Container is narrower. */
const wide = "mx-auto w-full max-w-7xl px-5 sm:px-8";

const sectionTitle =
  "mt-5 font-display text-4xl font-semibold leading-[1.1] tracking-[-0.035em] text-balance sm:text-[2.875rem]";

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

/* ---------- who we are ---------- */

/* Says what the platform is and how it works, never who runs it: no names,
   faces or credentials until real ones are supplied (see CLAUDE.md on the
   invented team this replaced). */
export async function WhoWeAre() {
  const { locale, t } = await getMessages();
  return (
    <section className="bg-white">
      <div className={`${wide} grid gap-14 py-20 sm:py-[5.5rem] lg:grid-cols-2 lg:items-center lg:gap-20`}>
        <Reveal>
          <Eyebrow rule>{t.who.eyebrow}</Eyebrow>
          <h2 className={`${sectionTitle} max-w-xl text-ink`}>{t.who.title}</h2>
          <p className="mt-6 max-w-md leading-[1.65] text-muted">{t.who.body}</p>
          <LocaleLink
            locale={locale}
            href="/about"
            className="group mt-6 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            {t.who.more}
            <ArrowUpRight className={nudge} />
          </LocaleLink>
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
            <figcaption className="absolute start-5 bottom-4 text-sm text-white">
              {t.who.caption}
            </figcaption>
          </figure>
        </Reveal>
        <Reveal delay={120}>
          <ol className="rounded-[10px] bg-surface-soft p-6 sm:p-[30px]">
            {t.who.principles.map((p, i) => (
              <li key={p.title} className="flex gap-6 border-b border-line py-6 first:pt-0">
                <span className="grid size-7 shrink-0 place-items-center rounded-full border border-primary-100 bg-white text-[11px] text-primary-500">
                  <Index n={i} />
                </span>
                <div>
                  <h3 className="font-display text-[17px] font-semibold tracking-[-0.01em] text-ink">
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
  const budget = t.header.tools[LATEST_BUDGET.href]?.label ?? LATEST_BUDGET.label;
  return (
    <section className="relative isolate overflow-hidden bg-surface-muted">
      {/* a faint circle running off the start edge, as in the design */}
      <div
        aria-hidden="true"
        className="absolute -start-[248px] top-[74%] -z-10 hidden size-[453px] rounded-full border border-primary-100 lg:block"
      />
      <div className={`${wide} grid gap-14 py-20 sm:py-[5.5rem] lg:grid-cols-2 lg:items-center lg:gap-[90px]`}>
        <Reveal>
          <Eyebrow rule>{t.budget.eyebrow.replace("{budget}", budget)}</Eyebrow>
          <h2 className={`${sectionTitle} max-w-md text-ink`}>
            <Emphasis text={t.budget.title} className="text-primary-400 not-italic" />
          </h2>
          <p className="mt-6 max-w-md leading-[1.65] text-muted">{t.budget.body}</p>
          <div className="mt-8">
            <Button
              locale={locale}
              href={LATEST_BUDGET.href}
              className="group rounded-[5px]! shadow-[0_4px_12px_rgb(30_49_158/0.07)]"
            >
              {t.budget.cta.replace("{budget}", budget)}
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
              {t.budget.cardEyebrow}
            </p>
            <p className="mt-2.5 font-display text-7xl leading-[1.15] font-bold tracking-[-0.06em] text-primary-600 sm:text-[88px]">
              {/* two-tone, as the design has it */}
              {String(LATEST_BUDGET.year).slice(0, 2)}
              <span className="text-primary-400">{String(LATEST_BUDGET.year).slice(2)}</span>
            </p>
            <ul className="mt-3 flex flex-wrap gap-1.5">
              {t.budget.topics.map((topic) => (
                <li key={topic} className="rounded-full bg-surface-tint px-2.5 py-2 text-[11px] leading-none text-ink">
                  {topic}
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-muted">{t.budget.caption}</p>
          </div>
        </Reveal>
      </div>
    </section>
  );
}

/* ---------- calculators ---------- */

/* Paired by index with t.calculators.items (name, note). */
const calculatorHrefs = [
  "/tools/ireland-income-tax",
  "/tools/ireland-vat",
  "/tools/ireland-corporation-tax",
  "/tools/ireland-cgt",
  "/tools/ireland-cat",
  "/personal/mortgage",
];

export async function CalculatorGrid() {
  const { locale, t } = await getMessages();
  const c = t.calculators;
  return (
    <section className="bg-white">
      <div className={`${wide} py-20 sm:py-[5.5rem]`}>
        <Reveal className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,388px)] lg:items-center lg:gap-16">
          <div>
            <Eyebrow rule>{c.eyebrow}</Eyebrow>
            <h2 className={`${sectionTitle} text-ink`}>{c.title}</h2>
            <p className="mt-5 text-[17px] leading-[1.65] text-muted">{c.lede}</p>
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
              <li key={calculatorHrefs[i]}>
                <LocaleLink
                  locale={locale}
                  href={calculatorHrefs[i]}
                  className="group relative flex h-full flex-col rounded-lg border border-line bg-white p-[30px] transition-colors duration-200 hover:border-primary-300 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary-500"
                >
                  <span className="text-[11px] text-primary-300">
                    <Index n={i} />
                  </span>
                  <h3 className="mt-4 pe-10 font-display text-[21px] font-semibold tracking-[-0.02em] text-ink">
                    {item.name}
                  </h3>
                  <p className="mt-3 max-w-[15rem] text-[13px] leading-[1.65] text-muted">
                    {item.note}
                  </p>
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

/* ---------- a simple way to learn (midnight band) ---------- */

/* Paired by index with t.learn.items (title, note, link). */
const learnSteps = [
  { href: "/toolkits", image: notebook },
  { href: "/tools/ireland-income-tax", image: laptopFigures },
  { href: "/contact", image: table },
];

export async function LearnBand() {
  const { locale, t } = await getMessages();
  return (
    <section className="relative isolate overflow-hidden bg-midnight text-white">
      <div
        aria-hidden="true"
        className="absolute -end-56 -top-64 -z-10 size-[40rem] bg-radial from-primary-500/35 to-transparent to-70%"
      />
      <div className={`${wide} py-20 sm:py-[5.5rem]`}>
        <Reveal>
          <Eyebrow tone="midnight" rule>
            {t.learn.eyebrow}
          </Eyebrow>
          <h2 className={`${sectionTitle} max-w-[40rem]`}>
            <Emphasis text={t.learn.title} className="text-primary-200 not-italic" />
          </h2>
        </Reveal>
        <ul className="mt-11 grid gap-x-7 gap-y-14 md:grid-cols-3">
          {t.learn.items.map((item, i) => (
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

export async function Faq() {
  const { t } = await getMessages();
  return (
    <section id="faq" className="scroll-mt-24 bg-white">
      <div className={`${wide} grid gap-10 py-20 sm:py-[6.25rem] lg:grid-cols-[minmax(0,495px)_minmax(0,605px)] lg:justify-between`}>
        <Reveal>
          <Eyebrow>{t.faq.eyebrow}</Eyebrow>
          <h2 className={`${sectionTitle} max-w-sm text-ink`}>{t.faq.title}</h2>
        </Reveal>
        <Reveal delay={120} className="border-t border-line">
          <Accordion items={t.faq.items} />
        </Reveal>
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

/* `wide` lines it up with the home sections; other pages keep Container's
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
