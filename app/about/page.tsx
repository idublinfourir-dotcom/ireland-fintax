import type { Metadata } from "next";
import Link from "next/link";
import { Container, PageHero, SectionHeading } from "../components/ui";
import { ContactCta } from "../components/sections";
import { Reveal } from "../components/reveal";
import { ClipReveal } from "../components/clip-reveal";
import { images } from "../lib/images";

export const metadata: Metadata = {
  title: "About",
  description:
    "Ireland Fintax is a free place to learn how Irish tax and personal finance work, with calculators, guides and templates in plain English.",
};

/* What is actually on the site, each pointing at it. No firm story, team or
   credentials: this is a free learning platform. */
const sections = [
  {
    title: "Accountants Hub",
    description:
      "Calculators for income tax, VAT, corporation tax, the R&D credit, capital allowances, CGT and CAT, using Irish rates.",
    href: "/tools/ireland-income-tax",
  },
  {
    title: "Personal Hub",
    description:
      "Work out a mortgage, and compare investment options side by side on risk, tax and access to your money.",
    href: "/personal/mortgage",
  },
  {
    title: "Founders Hub",
    description:
      "Memos, templates, tax and VAT forms and setup guides for starting and running a company.",
    href: "/toolkits",
  },
  {
    title: "Ask a question",
    description:
      "Stuck on something the tools don’t cover? Ask it in your own words and get a plain-English answer by email.",
    href: "/contact",
  },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="About"
        title="Learn how the money side works."
        lede="Ireland Fintax is a free learning platform for Irish tax and personal finance: plain-English explanations and calculators you can run yourself."
        image="office"
      />

      <Container className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <Reveal>
          <SectionHeading eyebrow="Why it exists" title="Tax shouldn’t need a translator." />
          <div className="mt-6 flex flex-col gap-5 text-[15px] leading-7 text-ink-body">
            <p>
              Most people meet tax and money questions at the worst moment: a
              first payslip, selling shares, buying a home, starting a company.
              The rules are public, but they are written for specialists.
            </p>
            <p>
              This site puts them in plain English and lets you try your own
              numbers, so you understand what is going on before you decide
              anything. Everything here is free.
            </p>
            <p>
              It is general information, not advice. Rates and rules change and
              your own situation matters, so check with Revenue or a qualified,
              regulated adviser before acting on a big decision.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-5">
          <ClipReveal
            url={images.teamLaptops}
            className="h-48 w-full rounded-none"
          />
          {sections.map((section) => (
            <Link
              key={section.title}
              href={section.href}
              className="group border-l-2 border-primary-400 bg-surface py-1 pl-5"
            >
              <h3 className="font-display text-lg font-medium tracking-tight text-ink transition-colors duration-200 group-hover:text-primary-500">
                {section.title} <span aria-hidden="true">→</span>
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {section.description}
              </p>
            </Link>
          ))}
        </Reveal>
      </Container>

      <ContactCta />
    </>
  );
}
