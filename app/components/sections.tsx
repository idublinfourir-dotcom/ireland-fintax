import type { CSSProperties, ReactNode } from "react";
import Link from "next/link";
import { Button, Container, Eyebrow, SectionHeading } from "./ui";
import { Reveal } from "./reveal";
import { ClipReveal } from "./clip-reveal";
import { Accordion } from "./accordion";
import { HeroVideo } from "./hero-video";
import { images } from "../lib/images";
import { serviceCategories } from "../lib/content";

function bg(url: string): CSSProperties {
  return { backgroundImage: `url(${url})` };
}

/* ---------- hero ---------- */

export function Hero() {
  return (
    <section className="relative isolate flex min-h-[88vh] items-center overflow-hidden bg-navy-900 text-white">
      <HeroVideo
        clips={[
          // All three are Dublin's financial quarter — the Docklands and the
          // IFSC — rather than city landmarks. The brief is "Ireland Fintax",
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
      <Container className="py-28 sm:py-36 lg:py-44">
        <div className="max-w-4xl">
          <span className="animate-fade-up block">
            <Eyebrow tone="dark">
              Free finance learning · Ireland
            </Eyebrow>
          </span>
          <h1 className="animate-fade-up mt-7 font-display text-5xl font-bold leading-[0.95] tracking-[-0.03em] text-balance [animation-delay:80ms] sm:text-6xl lg:text-7xl">
            Understand tax and money,{" "}
            <em className="text-primary-300 not-italic">in plain English.</em>
          </h1>
          <p className="animate-fade-up mt-7 max-w-xl text-lg leading-8 text-white/80 [animation-delay:150ms] sm:text-xl">
            Free calculators, guides and templates for Irish tax, mortgages,
            investing and starting a company. Learn how it works, then run
            your own numbers.
          </p>
          <div className="animate-fade-up mt-10 flex flex-col items-start gap-3 [animation-delay:220ms] sm:flex-row sm:items-center sm:gap-4">
            <Button href="/tools/ireland-income-tax">Try the calculators</Button>
            <Button href="/contact" variant="outlineLight">
              Ask a question
            </Button>
          </div>
        </div>
      </Container>
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

const quickEntries: {
  icon: EntryIcon;
  title: string;
  note: string;
  href: string;
}[] = [
  {
    icon: "chip",
    title: "Tax calculators",
    note: "Income tax, VAT, CGT, CAT and more, for Ireland.",
    href: "/tools/ireland-income-tax",
  },
  {
    icon: "user",
    title: "Personal finance",
    note: "Work out a mortgage and compare ways to invest.",
    href: "/personal/mortgage",
  },
  {
    icon: "building",
    title: "Starting a company",
    note: "Memos, templates and setup guides for founders.",
    href: "/toolkits",
  },
  {
    icon: "compass",
    title: "Ask a question",
    note: "Stuck on something? Ask, and we’ll explain it.",
    href: "/contact",
  },
];

export function QuickEntry() {
  return (
    <section className="bg-navy-800 text-white">
      <Container className="grid grid-cols-1 gap-px bg-white/10 sm:grid-cols-2 lg:grid-cols-4">
        {quickEntries.map((entry) => (
          <Link
            key={entry.title}
            href={entry.href}
            className="group flex items-start gap-4 bg-navy-800 px-5 py-7 transition-colors duration-200 hover:bg-navy-700"
          >
            <span className="mt-0.5 text-primary-300 transition-colors duration-200 group-hover:text-primary-400">
              <EntryGlyph name={entry.icon} />
            </span>
            <span className="flex flex-col">
              <span className="flex items-center gap-1.5 font-display text-base font-semibold tracking-tight text-white">
                {entry.title}
                <span
                  aria-hidden="true"
                  className="translate-x-0 text-primary-300 transition-transform duration-200 group-hover:translate-x-1"
                >
                  →
                </span>
              </span>
              <span className="mt-1 text-sm leading-6 text-white/60">
                {entry.note}
              </span>
            </span>
          </Link>
        ))}
      </Container>
    </section>
  );
}

/* ---------- who we are ---------- */

/* Says what the platform is and how it works, never who runs it: no names,
   faces or credentials until real ones are supplied (see CLAUDE.md on the
   invented team this replaced). */
const principles = [
  {
    title: "Free, for everyone",
    note: "Every calculator, guide and template is free, and you don’t need an account to start.",
  },
  {
    title: "Plain English",
    note: "The rules explained the way you’d explain them to a friend, without the jargon.",
  },
  {
    title: "Built on public sources",
    note: "The calculators use Revenue’s published rates and link to where each figure comes from.",
  },
  {
    title: "Information, not advice",
    note: "We help you understand. For a decision that hinges on your situation, see a regulated adviser.",
  },
];

export function WhoWeAre() {
  return (
    <section className="bg-white">
      <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Who we are"
            title="A free place to learn how Irish tax and money work."
          />
          <div className="mt-6 flex flex-col gap-5 text-[15px] leading-7 text-ink-body">
            <p>
              Ireland Fintax is a free learning platform. We explain Irish tax
              and personal finance in plain English, and give you calculators
              to try your own numbers, so you understand what is going on
              before you decide anything.
            </p>
            <p>No fees, nothing to sell you, and no sign-up to get started.</p>
          </div>
          <Link
            href="/about"
            className="mt-6 inline-block text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            More about us <span aria-hidden="true">→</span>
          </Link>
          <ClipReveal
            // Not deskFinance: that photo is IRS forms and a dollar bill.
            url={images.teamLaptops}
            className="mt-10 hidden h-56 w-full rounded-none lg:block"
          />
        </Reveal>
        <Reveal delay={120}>
          <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
            {principles.map((p) => (
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
            All services <span aria-hidden="true">→</span>
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
                className="absolute left-0 top-0 h-1 w-0 bg-primary-500 transition-all duration-300 group-hover:w-full"
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
                className="text-primary-500 transition-transform duration-200 group-hover:translate-x-1"
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
              className="text-primary-300 transition-transform duration-200 group-hover:translate-x-1"
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
}: {
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
              ? "lg:order-2 lg:ml-0 lg:mr-auto lg:max-w-xl lg:pl-16"
              : "lg:ml-auto lg:mr-0 lg:max-w-xl lg:pr-16"
          }`}
        >
          <Reveal>
            <Eyebrow>{eyebrow}</Eyebrow>
            <h2 className="mt-5 font-display text-4xl font-bold leading-[1.03] tracking-[-0.02em] text-balance text-ink sm:text-5xl">
              {title}
            </h2>
            <p className="mt-5 text-lg leading-8 text-ink-body">{body}</p>
            <div className="mt-9">
              <Button href={ctaHref}>{ctaLabel}</Button>
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

const aiCapabilities: { icon: AiIcon; title: string; note: string }[] = [
  {
    icon: "tax",
    title: "Learn",
    note: "Plain-English memos and guides on the things people actually get stuck on.",
  },
  {
    icon: "forecast",
    title: "Try",
    note: "Put your own figures into the calculators and see what changes.",
  },
  {
    icon: "automate",
    title: "Ask",
    note: "Still unsure? Ask in your own words and get an answer by email.",
  },
];

export function AiBand() {
  return (
    <section className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 opacity-[0.06] [background-image:linear-gradient(var(--color-primary-300)_1px,transparent_1px),linear-gradient(90deg,var(--color-primary-300)_1px,transparent_1px)] [background-size:44px_44px]"
      />
      <div
        aria-hidden="true"
        className="absolute -right-32 -top-32 -z-10 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl"
      />
      <Container className="py-24 sm:py-32">
        <Reveal>
          <div className="max-w-2xl border-l-2 border-primary-400 pl-6 sm:pl-8">
            <Eyebrow tone="dark">How to learn here</Eyebrow>
            <h2 className="mt-6 font-display text-4xl font-bold leading-[1.03] tracking-[-0.02em] text-balance sm:text-5xl">
              Learn it, try it,{" "}
              <em className="text-primary-300 not-italic">ask about it.</em>
            </h2>
            <p className="mt-6 text-lg leading-8 text-white/80">
              Start wherever suits you. Most people read a little, run their
              own numbers, and only ask when something still doesn’t add up.
            </p>
          </div>
          <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden border border-white/12 bg-white/12 sm:grid-cols-3">
            {aiCapabilities.map((cap) => (
              <div
                key={cap.title}
                className="flex flex-col bg-navy-900 px-7 py-9"
              >
                <span className="text-primary-300">
                  <AiGlyph name={cap.icon} />
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
   firm's sector list (`industries` in content.ts, now unused). */
const audiences = [
  {
    name: "Employees",
    note: "See your take-home pay and what the Budget changes mean for it.",
    href: "/tools/ireland-income-tax",
  },
  {
    name: "Sole traders",
    note: "When to register for VAT, which rate applies, and the returns cycle.",
    href: "/tools/ireland-vat",
  },
  {
    name: "Company founders",
    note: "Corporation tax, the R&D credit, capital allowances and setup guides.",
    href: "/tools/ireland-corporation-tax",
  },
  {
    name: "Investors and landlords",
    note: "Capital gains on shares or property, and investment options compared.",
    href: "/tools/ireland-cgt",
  },
  {
    name: "Families",
    note: "Gifts and inheritances, and the tax-free thresholds that apply.",
    href: "/tools/ireland-cat",
  },
  {
    name: "Homebuyers",
    note: "Work out a mortgage before you talk to a lender.",
    href: "/personal/mortgage",
  },
];

export function Industries() {
  return (
    <section className="border-t border-line bg-white">
      <Container className="grid gap-14 py-20 sm:py-28 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <Reveal>
          <SectionHeading
            eyebrow="Who it’s for"
            title="Whatever you’re dealing with, start here."
            lede="Tax and money questions tend to arrive with life events. These are the ones the site covers today."
          />
          <ClipReveal
            url={images.meeting}
            className="mt-10 hidden h-64 w-full rounded-none lg:block"
          />
        </Reveal>
        <Reveal delay={120}>
        <ul className="grid gap-px overflow-hidden border border-line bg-line sm:grid-cols-2">
          {audiences.map((a) => (
            <li key={a.name}>
              <Link
                href={a.href}
                className="group block h-full bg-surface p-6 transition-colors duration-200 hover:bg-secondary-50/50"
              >
                <h3 className="font-display text-lg font-medium tracking-tight text-ink transition-colors duration-200 group-hover:text-primary-500">
                  {a.name} <span aria-hidden="true">→</span>
                </h3>
                <p className="mt-2 text-sm leading-6 text-muted">{a.note}</p>
              </Link>
            </li>
          ))}
        </ul>
        </Reveal>
      </Container>
    </section>
  );
}

/* ---------- process ---------- */

const steps = [
  {
    title: "Pick a topic",
    description: "Income tax, VAT, a mortgage, starting a company: whatever it’s about.",
  },
  {
    title: "Ask in your own words",
    description: "No jargon needed. Ask it the way you’d ask a friend.",
  },
  {
    title: "Get a plain-English answer",
    description: "A real person reads it and replies by email.",
  },
  {
    title: "Keep it in one place",
    description: "Ask while signed in and every answer stays in your free account.",
  },
];

export function Process() {
  return (
    <section
      id="process"
      className="scroll-mt-24 border-y border-line bg-surface-muted/50"
    >
      <Container className="py-20 sm:py-28">
        <Reveal>
        <SectionHeading
          eyebrow="Ask a question"
          title="Got a question? Here’s what happens."
          lede="If the calculators and guides don’t cover it, ask. It’s free, and there’s no such thing as too basic."
        />
        <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <li key={step.title} className="relative border-t-2 border-ink/10 pt-6">
              <span
                aria-hidden="true"
                className="absolute -top-0.5 left-0 h-0.5 w-14 bg-primary-400"
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

const faqs = [
  {
    question: "Is it really free?",
    answer:
      "Yes. Every calculator, guide and template here is free to use, and so is asking a question.",
  },
  {
    question: "Is this financial or tax advice?",
    answer:
      "No. Everything here is general information to help you understand how things work. Rates and rules change and your own situation matters, so check with Revenue or a qualified, regulated adviser before acting on a big decision.",
  },
  {
    question: "Do I need an account?",
    answer:
      "No. The calculators and guides are open to everyone. A free account is only useful for questions: ask while signed in and your questions and our answers stay together in one place.",
  },
  {
    question: "Is it only about Ireland?",
    answer:
      "Mostly. The calculators use Irish rates and rules, and some of the founder resources also cover the UK.",
  },
];

export function Faq() {
  return (
    <section id="faq" className="scroll-mt-24 border-t border-line bg-white">
      <Container className="py-20 sm:py-28">
        <Reveal className="mx-auto max-w-3xl">
          <SectionHeading eyebrow="FAQ" title="Questions, answered straight." />
          <div className="mt-10">
            <Accordion items={faqs} />
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
            All services <span aria-hidden="true">→</span>
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
                className="absolute left-0 top-0 h-0.5 w-0 bg-primary-400 transition-all duration-300 group-hover:w-full"
              />
              <h3 className="font-display text-base font-semibold tracking-tight text-ink">
                {category.title}
              </h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
                {category.blurb}
              </p>
              <span className="mt-auto pt-4 text-sm font-semibold text-primary-500">
                Learn more <span aria-hidden="true">→</span>
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

export function ContactCta({ children }: { children?: ReactNode }) {
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
              Ask a question
            </Eyebrow>
            <h2 className="mx-auto mt-5 max-w-2xl font-display text-3xl font-medium leading-[1.12] tracking-tight text-balance sm:text-4xl">
              {children ?? "Stuck on something?"}
            </h2>
            <p className="mx-auto mt-4 max-w-xl leading-7 text-white/75">
              Ask about tax or money the way you’d ask a friend, and we’ll reply
              by email with a plain-English answer. It’s free.
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Button href="/contact">Ask a question</Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
