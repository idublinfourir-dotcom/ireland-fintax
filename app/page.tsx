import {
  Hero,
  Finder,
  WhoWeAre,
  TaxCalendar,
  Topics,
  BudgetFeature,
  LearnBand,
  Faq,
  Quote,
  TrustStrip,
  HomeCta,
} from "./components/sections";
import { JsonLd } from "./components/json-ld";
import { getMessages } from "./lib/messages";
import { site } from "./lib/content";

const ORG_ID = `${site.url}/#organization`;

/* The sections and order of the ui-ux-reviews design (28 Oct 2026). The hero's
   coverflow is the earlier export's, kept as it was. */
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
      <Finder />
      <WhoWeAre />
      <TaxCalendar />
      <Topics />
      <BudgetFeature />
      <LearnBand />
      <Faq />
      <Quote />
      <TrustStrip />
      <HomeCta />
    </>
  );
}
