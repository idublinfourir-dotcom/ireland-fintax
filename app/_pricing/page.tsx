import type { Metadata } from "next";
import Link from "next/link";
import { Button, Container, PageHero } from "../components/ui";
import { ContactCta } from "../components/sections";
import { Accordion } from "../components/accordion";
import { PricingTable } from "../components/pricing-table";
import { pricingAddons, pricingTiers, site } from "../lib/content";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "Fixed monthly fees for accounting, tax and payroll. Three plans, no hourly billing, no surprise invoices.",
};

const pricingFaqs = [
  {
    question: "Can I change plan later?",
    answer:
      "Yes, plans flex with your business. Most clients start on Limited Company and move up when monthly numbers start driving decisions.",
  },
  {
    question: "Are there setup or onboarding fees?",
    answer:
      "No setup fee on annual billing. If your books need a cleanup before we take over, we quote that separately and fix the price before starting.",
  },
  {
    question: "What does “from” mean in the price?",
    answer:
      "The listed price covers a typical business at that stage. High transaction volumes, multiple entities or complex VAT push the quote up, but it is fixed before you sign and reviewed once a year.",
  },
];

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow="Pricing"
        title="Fixed fees. No surprises."
        lede="One monthly price agreed upfront, reviewed once a year. The meter never runs, so call us as often as you like."
        image="architecture"
      />

      <Container className="py-16 sm:py-20">
        <PricingTable tiers={pricingTiers} />

        <div className="mt-16 grid items-start gap-12 lg:grid-cols-[1fr_22rem]">
          <div>
            <div className="rounded-none border border-line bg-surface p-8">
              <h2 className="font-display text-xl font-medium tracking-tight text-ink">
                Add-ons and one-off work
              </h2>
              <dl className="mt-6 grid gap-x-10 gap-y-4 sm:grid-cols-2">
                {pricingAddons.map((addon) => (
                  <div
                    key={addon.name}
                    className="flex items-baseline justify-between gap-4 border-b border-line pb-3"
                  >
                    <dt className="text-sm font-medium text-ink">{addon.name}</dt>
                    <dd className="text-sm whitespace-nowrap text-muted">
                      {addon.note}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="mt-12">
              <h2 className="font-display text-2xl font-medium tracking-tight text-ink">
                Pricing questions
              </h2>
              <div className="mt-6">
                <Accordion items={pricingFaqs} />
              </div>
              <p className="mt-8 text-sm text-muted">
                More questions? See the{" "}
                <Link
                  href="/#faq"
                  className="font-medium text-primary-500 transition-colors duration-200 hover:text-primary-600"
                >
                  full FAQ
                </Link>{" "}
                or{" "}
                <Link
                  href="/contact"
                  className="font-medium text-primary-500 transition-colors duration-200 hover:text-primary-600"
                >
                  ask us directly
                </Link>
                .
              </p>
            </div>
          </div>

          <aside className="lg:sticky lg:top-28">
            <div className="rounded-none bg-navy-900 p-7 text-white">
              <h2 className="font-display text-lg font-medium tracking-tight">
                Not sure which plan fits?
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/70">
                Book a free call. We’ll look at your size and needs and recommend
                the plan that fits, or scope a custom one.
              </p>
              <Button href="/contact" className="mt-5 w-full">
                Book a free call
              </Button>
              <a
                href={site.phoneHref}
                className="mt-3 flex items-center justify-center gap-2 text-sm font-medium text-primary-300 transition-colors duration-200 hover:text-primary-400"
              >
                {site.phone}
              </a>
            </div>
          </aside>
        </div>
      </Container>

      <ContactCta />
    </>
  );
}
