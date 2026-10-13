import type { Metadata } from "next";
import { Breadcrumbs, BudgetNote, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/calculator-tabs";
import { IrelandCatCalculator } from "../../components/ireland-cat-calculator";
import { CAT_LAST_REVIEWED } from "../../lib/ireland-cat";
import { getCatData } from "../../lib/cat-data";

export const metadata: Metadata = {
  title: "Ireland CAT Calculator: Gift & Inheritance Tax (Group A/B/C)",
  description:
    "Estimate Irish Capital Acquisitions Tax on a gift or inheritance. Group A/B/C thresholds (€420,000 / €44,000 / €22,000 from 7 October 2026), the €3,000 small-gift exemption, agricultural and business relief at 90%, prior-benefit aggregation and 33%, with the pay & file date. Republic of Ireland.",
};

const notes = [
  {
    title: "Group thresholds",
    body: "Your relationship to the disponer sets the tax-free threshold, Group A €420,000 (children), B €44,000 (close relatives), C €22,000 (everyone else), for gifts and inheritances from 7 October 2026. The tool derives it for you.",
  },
  {
    title: "Farm & business relief",
    body: "Agricultural relief and business relief each cut the taxable value of qualifying property by 90%, subject to conditions (active-farmer test, six-year retention) not modelled here.",
  },
  {
    title: "Aggregation since 1991",
    body: "Earlier gifts and inheritances in the same group since 5 December 1991 use up the threshold. Enter their taxable value to see the true CAT on the current benefit.",
  },
];

export default async function IrelandCatPage() {
  const { config } = await getCatData();

  return (
    <>
      <PageHero
        image="deskFinance"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools" },
              { label: "Ireland CAT" },
            ]}
          />
        }
        title="Ireland CAT calculator"
        lede={`Estimate gift and inheritance tax, group thresholds, small-gift exemption, agricultural and business relief, aggregation and the pay & file date. Figures current as of ${CAT_LAST_REVIEWED}.`}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-cat" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandCatCalculator config={config} />
        </div>

        <BudgetNote>
          Budget 2027 raised the thresholds for gifts and inheritances from 7 October 2026.
        </BudgetNote>

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {notes.map((note) => (
            <div key={note.title} className="rounded-none border border-line bg-surface p-6">
              <h2 className="font-display text-base font-medium tracking-tight text-ink">
                {note.title}
              </h2>
              <p className="mt-2 text-sm leading-6 text-muted">{note.body}</p>
            </div>
          ))}
        </div>
      </Container>

      <ContactCta />
    </>
  );
}
