import {
  Hero,
  QuickEntry,
  WhoWeAre,
  BudgetFeature,
  CalculatorGrid,
  LearnBand,
  Faq,
  ContactCta,
} from "./components/sections";
import { JsonLd } from "./components/json-ld";
import { getMessages } from "./lib/messages";
import { site } from "./lib/content";

const ORG_ID = `${site.url}/#organization`;

/* Below the hero, the sections and order of the figma_landing design. */
export default async function Home() {
  const { locale } = await getMessages();
  return (
    <>
      {/* Who the site is, for search engines. No firm: the site's own name. */}
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@graph": [
            { "@type": "Organization", "@id": ORG_ID, name: site.name, url: site.url, logo: `${site.url}/icon.svg` },
            { "@type": "WebSite", url: site.url, name: site.name, inLanguage: locale, publisher: { "@id": ORG_ID } },
          ],
        }}
      />
      <Hero />
      <QuickEntry />
      <WhoWeAre />
      <BudgetFeature />
      <CalculatorGrid />
      <LearnBand />
      <Faq />
      <ContactCta wide />
    </>
  );
}
