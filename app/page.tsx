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
import { getMessages } from "./lib/messages";

/* Same sections and order as before the learning-platform switch, rewritten
   for it. Only the Services grid is gone (hidden site-wide); Who we are sits
   in its slot. */
export default async function Home() {
  const { locale, t } = await getMessages();
  const budget = t.header.tools[LATEST_BUDGET.href]?.label ?? LATEST_BUDGET.label;
  return (
    <>
      <Hero />
      <QuickEntry />
      <WhoWeAre />
      <PromoBanner
        locale={locale}
        eyebrow={budget}
        title={t.promos.budget.title.replace("{budget}", budget)}
        body={t.promos.budget.body}
        ctaHref={LATEST_BUDGET.href}
        ctaLabel={t.promos.budget.cta}
        image="deskFinance"
        reverse
      />
      <PromoBanner
        locale={locale}
        eyebrow={t.promos.calculators.eyebrow}
        title={t.promos.calculators.title}
        body={t.promos.calculators.body}
        ctaHref="/tools/ireland-income-tax"
        ctaLabel={t.promos.calculators.cta}
        image="forecast"
      />
      <AiBand />
      <Industries />
      <PromoBanner
        locale={locale}
        eyebrow={t.promos.company.eyebrow}
        title={t.promos.company.title}
        body={t.promos.company.body}
        ctaHref="/toolkits"
        ctaLabel={t.promos.company.cta}
        image="office"
        reverse
      />
      <Process />
      <Faq />
      <ContactCta />
    </>
  );
}
