import {
  Hero,
  QuickEntry,
  Services,
  PromoBanner,
  AiBand,
  Industries,
  Process,
  Faq,
  ContactCta,
} from "./components/sections";

export default function Home() {
  return (
    <>
      <Hero />
      <QuickEntry />
      <Services />
      <PromoBanner
        eyebrow="Beyond compliance"
        title="We help you read the numbers, not just file them."
        body="A partner who knows your business, a forecast on the table, and plain-English advice before the big decisions, not after."
        ctaHref="/services/cfo-service"
        ctaLabel="Explore advisory"
        image="forecast"
      />
      <AiBand />
      <Industries />
      <PromoBanner
        eyebrow="A real partner"
        title="You get a person, not a ticket number."
        body="Partners cap their client list on purpose. Message the accountant who knows your books and get an answer the same day. Switching takes one signed letter."
        ctaHref="/about"
        ctaLabel="Meet the firm"
        image="meeting"
        reverse
      />
      <Process />
      <Faq />
      <ContactCta />
    </>
  );
}
