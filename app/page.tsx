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

/* Below the hero, the sections and order of the figma_landing design. */
export default function Home() {
  return (
    <>
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
