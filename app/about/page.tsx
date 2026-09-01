import type { Metadata } from "next";
import { Container, Eyebrow, PageHero, SectionHeading } from "../components/ui";
import { ContactCta } from "../components/sections";
import { Reveal } from "../components/reveal";
import { ClipReveal } from "../components/clip-reveal";
import { values } from "../lib/content";
import { images } from "../lib/images";

export const metadata: Metadata = {
  title: "About",
  description:
    "A partner-led finance and tax practice with a deliberately short client list. How Ireland Fintax works, and what we stand for.",
};

const credentials = [
  "Xero Platinum Partner",
  "QuickBooks ProAdvisor",
  "ACCA approved employer",
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="The firm"
        title="Accountants who act like partners."
        lede="Ireland Fintax was founded on a simple complaint: most firms only call when the invoice is due. We built the practice we wished existed: close to the numbers, ahead of the deadlines, honest about the fees."
        image="office"
      />

      <Container className="grid gap-14 py-16 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <Reveal>
          <SectionHeading
            eyebrow="Our story"
            title="Twenty years of tending other people's numbers."
          />
          <div className="mt-6 flex flex-col gap-5 text-[15px] leading-7 text-ink-body">
            <p>
              We started in a single room above a farm shop. The first clients
              were rural businesses that needed more than a year-end filing:
              they needed someone who understood seasonality, capital spend
              and what a bad harvest does to cash flow.
            </p>
            <p>
              The practice has grown into six service lines and five hundred
              clients, but the operating principle is unchanged: every client
              gets a partner who knows their business, books that are never
              out of date, and advice in plain English before decisions are
              made, not after.
            </p>
            <p>
              We cap each partner’s client list on purpose. Growth that costs
              the existing clients their service is not growth we want.
            </p>
          </div>
        </Reveal>

        <Reveal delay={120} className="flex flex-col gap-5">
          <ClipReveal
            url={images.teamLaptops}
            className="h-48 w-full rounded-none"
          />
          {values.map((value) => (
            <div
              key={value.title}
              className="border-l-2 border-primary-400 bg-surface py-1 pl-5"
            >
              <h3 className="font-display text-lg font-medium tracking-tight text-ink">
                {value.title}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted">
                {value.description}
              </p>
            </div>
          ))}
        </Reveal>
      </Container>

      <section>
        <Container className="py-16 sm:py-20">
          <div className="flex flex-col items-center gap-6 text-center">
            <Eyebrow>Credentials</Eyebrow>
            <ul className="flex flex-wrap items-center justify-center gap-3">
              {credentials.map((credential) => (
                <li
                  key={credential}
                  className="rounded-none border border-line bg-surface px-5 py-2.5 text-sm font-medium text-ink-body"
                >
                  {credential}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <ContactCta />
    </>
  );
}
