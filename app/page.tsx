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
