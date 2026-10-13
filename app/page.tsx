import {
  Hero,
  QuickEntry,
  WhoWeAre,
  PromoBanner,
  AiBand,
  Industries,
  Process,
  Faq,
  ContactCta,
} from "./components/sections";
import { LATEST_BUDGET } from "./lib/budgets";

/* Same sections and order as before the learning-platform switch, rewritten
   for it. Only the Services grid is gone (hidden site-wide); Who we are sits
   in its slot. */
export default function Home() {
  return (
    <>
      <Hero />
      <QuickEntry />
      <WhoWeAre />
      <PromoBanner
        eyebrow={LATEST_BUDGET.label}
        title={`What does ${LATEST_BUDGET.label} change for you?`}
        body="Tick what applies to you, from renting or buying a first home to a pension, a car or a family, and see only the changes that affect you, in euro where the rules make it exact. Built from the official figures, worked out in your browser."
        ctaHref={LATEST_BUDGET.href}
        ctaLabel="See what changes for you"
        image="deskFinance"
        reverse
      />
      <PromoBanner
        eyebrow="Calculators"
        title="Don’t just read about it. Run your own numbers."
        body="Income tax, VAT, CGT, CAT, corporation tax and more, all using Irish rates. Change a figure and watch what happens: it’s the quickest way to understand how a tax really works."
        ctaHref="/tools/ireland-income-tax"
        ctaLabel="Try the calculators"
        image="forecast"
      />
      <AiBand />
      <Industries />
      <PromoBanner
        eyebrow="Accounts and Finance"
        title="Starting a company? Start here."
        body="Memos, templates, tax and VAT forms and step-by-step setup guides for Ireland and the UK. All free: tell us which one you need and we’ll email it over."
        ctaHref="/toolkits"
        ctaLabel="Browse Accounts and Finance"
        image="office"
        reverse
      />
      <Process />
      <Faq />
      <ContactCta />
    </>
  );
}
