import type { CSSProperties, ReactNode } from "react";
import Link from "./locale-link";
import { Button, Container, Emphasis, Eyebrow, SectionHeading } from "./ui";
import { Reveal } from "./reveal";
import { ClipReveal } from "./clip-reveal";
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
import { images } from "../lib/images";
import { serviceCategories } from "../lib/content";
import { getMessages } from "../lib/messages";
import type { Locale } from "../lib/i18n";
import { LocaleLink } from "./locale-link";

function bg(url: string): CSSProperties {
  return { backgroundImage: `url(${url})` };
}

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

/* ---------- who we are ---------- */

/* Says what the platform is and how it works, never who runs it: no names,
   faces or credentials until real ones are supplied (see CLAUDE.md on the
   invented team this replaced). */
export async function WhoWeAre() {
  const { locale, t } = await getMessages();
  return (
    <section className="bg-white">
      <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow={t.who.eyebrow}
            title={t.who.title}
          />
          <div className="mt-6 flex flex-col gap-5 text-[15px] leading-7 text-ink-body">
            {t.who.body.map((para) => (
              <p key={para}>{para}</p>
            ))}
          </div>
          <LocaleLink
            locale={locale}
            href="/about"
            className="mt-6 inline-block text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            {t.who.more} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
          </LocaleLink>
          <ClipReveal
            // Not deskFinance: that photo is IRS forms and a dollar bill.
            url={images.teamLaptops}
            className="mt-10 hidden h-56 w-full rounded-none lg:block"
          />
        </Reveal>
        <Reveal delay={120}>
          <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {t.who.principles.map((p) => (
              <li key={p.title} className="bg-surface p-6">
                <h3 className="font-display text-lg font-medium tracking-tight text-ink">
                  {p.title}
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{p.note}</p>
              </li>
            ))}
          </ul>
        </Reveal>
      </Container>
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

/* ---------- promo banner (kpmg-style full-width split) ---------- */

export function PromoBanner({
  eyebrow,
  title,
  body,
  ctaHref,
  ctaLabel,
  image,
  reverse = false,
  locale,
}: {
  locale?: Locale;
  eyebrow: string;
  title: ReactNode;
  body: string;
  ctaHref: string;
  ctaLabel: string;
  image: keyof typeof images;
  reverse?: boolean;
}) {
  return (
    <section className="border-y border-line bg-surface">
      <div className="grid lg:grid-cols-2">
        <div
          className={`flex flex-col justify-center px-5 py-16 sm:px-8 sm:py-20 lg:py-28 ${
            reverse
              ? "lg:order-2 lg:ms-0 lg:me-auto lg:max-w-xl lg:ps-16"
              : "lg:ms-auto lg:me-0 lg:max-w-xl lg:pe-16"
          }`}
        >
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.03] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink-body">{body}</p>
            <div className="mt-9">
              <Button locale={locale} href={ctaHref}>
                {ctaLabel}
              </Button>
            </div>
          </Reveal>
        </div>
        <div
          aria-hidden="true"
          className={`min-h-[320px] bg-cover bg-center lg:min-h-[520px] ${
            reverse ? "lg:order-1" : ""
          }`}
          style={bg(images[image])}
        />
      </div>
    </section>
  );
}

/* ---------- AI band (signature pillar) ---------- */

type AiIcon = "forecast" | "automate" | "tax";

function AiGlyph({ name }: { name: AiIcon }) {
  const common = {
    width: 24,
    height: 24,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.6,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };
  switch (name) {
    case "forecast":
      return (
        <svg {...common}>
          <path d="M4 19V5M4 19h16" />
          <path d="M7 15l4-4 3 2 5-6" />
          <path d="M19 7v3.5M19 7h-3.5" />
        </svg>
      );
    case "automate":
      return (
        <svg {...common}>
          <path d="M13 3L5 13h5l-1 8 8-10h-5l1-8z" />
        </svg>
      );
    case "tax":
      return (
        <svg {...common}>
          <path d="M7 3h7l4 4v9a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2z" />
          <path d="M13 3v5h5" />
          <path d="M9 13l2 2 3-4" />
        </svg>
      );
  }
}

/* Paired by index with t.learn.items (title, note). */
const aiIcons: AiIcon[] = ["tax", "forecast", "automate"];

export async function AiBand() {
  const { t } = await getMessages();
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(var(--color-primary-300)_1px,transparent_1px),linear-gradient(90deg,var(--color-primary-300)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div
        aria-hidden="true"
        className="absolute -inset-e-32 -top-32 -z-10 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"
      />
      <Container className="py-24 sm:py-32">
        <Reveal>
          <div className="max-w-2xl border-s-2 border-primary-400 ps-6 sm:ps-8">
            <Eyebrow tone="dark">{t.learn.eyebrow}</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-bold leading-[1.03] tracking-[-0.02em] text-balance sm:text-5xl">
              <Emphasis text={t.learn.title} className="text-primary-300 not-italic" />
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/80">
              {t.learn.lede}
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-white/12 bg-white/12 sm:grid-cols-3">
            {t.learn.items.map((cap, i) => (
              <div
                key={aiIcons[i]}
                className="flex flex-col bg-navy-900 px-7 py-9"
              >
                <span className="text-primary-300">
                  <AiGlyph name={aiIcons[i]} />
                </span>
                <h3 className="mt-5 font-display text-lg font-medium tracking-tight text-white">
                  {cap.title}
                </h3>
                <p className="mt-2.5 text-[15px] leading-7 text-white/65">
                  {cap.note}
                </p>
              </div>
            ))}
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- who it's for (was: industries) ---------- */

/* Life situations the site actually covers, each pointing at its tool. Was the
   firm's sector list (`industries` in content.ts, now unused).
   Paired by index with t.audiences.items (name, note). */
const audienceHrefs = [
  "/tools/ireland-income-tax",
  "/tools/ireland-vat",
  "/tools/ireland-corporation-tax",
  "/tools/ireland-cgt",
  "/tools/ireland-cat",
  "/personal/mortgage",
];

export async function Industries() {
  const { locale, t } = await getMessages();
  return (
    <section className="border-t border-line bg-white">
      <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow={t.audiences.eyebrow}
            title={t.audiences.title}
            lede={t.audiences.lede}
          />
          <ClipReveal
            url={images.meeting}
            className="mt-10 hidden h-64 w-full rounded-none lg:block"
          />
        </Reveal>
        <Reveal delay={120}>
        <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {t.audiences.items.map((a, i) => (
            <li key={audienceHrefs[i]}>
              <LocaleLink
                locale={locale}
                href={audienceHrefs[i]}
                className="group block h-full bg-surface p-6 transition-colors duration-200 hover:bg-secondary-50/50"
              >
                <h3 className="font-display text-lg font-medium tracking-tight text-ink transition-colors duration-200 group-hover:text-primary-500">
                  {a.name} <span aria-hidden="true" className="inline-block rtl:-scale-x-100">→</span>
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{a.note}</p>
              </LocaleLink>
            </li>
          ))}
        </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- process ---------- */

export async function Process() {
  const { t } = await getMessages();
  return (
    <section
      id="process"
      className="scroll-mt-24 border-y border-line bg-surface-muted/50"
    >
      <Container className="py-20 sm:py-28">
        <Reveal>
        <SectionHeading
          eyebrow={t.process.eyebrow}
          title={t.process.title}
          lede={t.process.lede}
        />
        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {t.process.steps.map((step, index) => (
            <li key={step.title} className="relative border-t-2 border-ink/10 pt-6">
              <span
                aria-hidden="true"
                className="absolute -top-0.5 inset-s-0 h-0.5 w-14 bg-primary-400"
              />
              <span className="font-display text-3xl font-medium text-primary-500">
                {String(index + 1).padStart(2, "0")}
              </span>
              <h3 className="mt-3 font-display text-lg font-medium text-ink">
                {step.title}
              </h3>
              <p className="mt-2 text-[15px] leading-7 text-muted">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- faq ---------- */

export async function Faq() {
  const { t } = await getMessages();
  return (
    <section id="faq" className="scroll-mt-24 border-t border-line bg-white">
      <Container className="py-20 sm:py-28">
        <Reveal className="mx-auto max-w-3xl">
          <SectionHeading eyebrow={t.faq.eyebrow} title={t.faq.title} />
          <div className="mt-10">
            <Accordion items={t.faq.items} />
          </div>
        </Reveal>
      </Container>
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

export async function ContactCta({ children }: { children?: ReactNode }) {
  const { locale, t } = await getMessages();
  return (
    <section id="contact" className="scroll-mt-24 bg-canvas">
      <Container className="py-20 sm:py-24">
        <div className="relative isolate overflow-hidden rounded-none bg-navy-900 text-white">
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-20 bg-cover bg-center opacity-40"
            style={bg(images.teamMeeting)}
          />
          <div
            aria-hidden="true"
            className="absolute inset-0 -z-10 bg-gradient-to-r from-navy-900 via-navy-900/95 to-navy-900/70"
          />
          <div className="px-6 py-16 text-center sm:px-16 sm:py-20">
            <Eyebrow tone="dark" align="center">
              {t.cta.eyebrow}
            </Eyebrow>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-medium leading-[1.12] tracking-tight text-balance sm:text-4xl">
              {children ?? t.cta.title}
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
              {t.cta.body}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button locale={locale} href="/contact">
                {t.cta.button}
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
