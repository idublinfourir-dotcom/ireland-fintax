import type { Metadata } from "next";
import { Breadcrumbs, BudgetNote, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/calculator-tabs";
import { IrelandIncomeTaxCalculator } from "../../components/ireland-income-tax-calculator";
import { getTaxRates } from "../../lib/tax-data";
import { comparisonYears } from "../../lib/ireland-income-tax";
import { LATEST_BUDGET } from "../../lib/budgets";

/* The years follow the calendar (comparisonYears): this page renders per
   request, so it moves to 2027 v 2026 on 1 January 2027 by itself. */
export async function generateMetadata(): Promise<Metadata> {
  const { current, prior } = comparisonYears(new Date(), await getTaxRates());
  return {
    title: `Ireland Income Tax Calculator (Income Tax + USC + PRSI): ${current}`,
    description: `Estimate your Irish personal tax for ${current}: income tax, USC and PRSI, with pension relief, tax credits and a ${prior} comparison. Republic of Ireland.`,
  };
}

const notesFor = (current: number, prior: number) => [
  {
    title: "Income tax, USC & PRSI",
    body: "Full annual position across all three deductions, with the 20%/40% band split and every tax credit itemised so each number is traceable to a rule.",
  },
  {
    title: "Pension relief, done right",
    body: "Applies the age-banded relief cap on €115,000 of earnings, pension reduces income tax only, not USC or PRSI, and any excess above the cap gets no relief.",
  },
  {
    title: `${current} vs ${prior}`,
    body: "Shows both tax years side by side and the year-on-year change, so you can see what each Budget changed in the bands, credits, USC and PRSI.",
  },
];

export default async function IrelandIncomeTaxPage() {
  const ratesByYear = await getTaxRates();
  const { current, prior } = comparisonYears(new Date(), ratesByYear);
  const notes = notesFor(current, prior);
  return (
    <>
      <PageHero
        image="deskFinance"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools" },
              { label: "Ireland income tax" },
            ]}
          />
        }
        title="Ireland income tax calculator"
        lede={`Estimate your Irish income tax, USC and PRSI for ${current}, including pension relief and tax credits, with a ${prior} comparison alongside.`}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-income-tax" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandIncomeTaxCalculator
            ratesByYear={ratesByYear}
            currentYear={current}
            priorYear={prior}
          />
        </div>

        <BudgetNote>
          {current < LATEST_BUDGET.year
            ? "Budget 2027 changes the bands, credits and USC from 1 January 2027."
            : `The ${current} figures are ${LATEST_BUDGET.label}'s.`}
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
