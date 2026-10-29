import type { Metadata } from "next";
import { ReviewedBy } from "../../components/reviewed-by";
import { Breadcrumbs, BudgetNote, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/tool-tabs";
import { IrelandIncomeTaxCalculator } from "../../components/ireland-income-tax-calculator";
import { getTaxRates } from "../../lib/tax-data";
import { comparisonYears } from "../../lib/ireland-income-tax";
import { LATEST_BUDGET } from "../../lib/budgets";
import { getLocale, getT } from "../../lib/messages";
import { incomeTaxMessages } from "../../lib/messages/income-tax";
import { calcMessages } from "../../lib/messages/calc";
import { toolNames } from "../../lib/messages/tool-names";

/* The years follow the calendar (comparisonYears): this page renders per
   request, so it moves to 2027 v 2026 on 1 January 2027 by itself. */
export async function generateMetadata(): Promise<Metadata> {
  const { current, prior } = comparisonYears(new Date(), await getTaxRates());
  const t = await getT(incomeTaxMessages);
  const years = (s: string) => s.replace("{current}", String(current)).replace("{prior}", String(prior));
  return { title: years(t.meta.title), description: years(t.meta.description) };
}

export default async function IrelandIncomeTaxPage() {
  const ratesByYear = await getTaxRates();
  const { current, prior } = comparisonYears(new Date(), ratesByYear);
  const t = await getT(incomeTaxMessages);
  const c = await getT(calcMessages);
  const locale = await getLocale();
  const years = (s: string) => s.replace("{current}", String(current)).replace("{prior}", String(prior));
  const budgetLabel = toolNames[locale][LATEST_BUDGET.href]?.label ?? LATEST_BUDGET.label;
  return (
    <>
      <PageHero
        image="deskFinance"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: c.home, href: "/" },
              { label: c.tools },
              { label: t.crumb },
            ]}
          />
        }
        title={t.title}
        lede={years(t.lede)}
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
            ? t.budgetBefore
            : years(t.budgetAfter).replace("{budget}", budgetLabel)}
        </BudgetNote>
        <ReviewedBy className="mt-2" />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {t.notes.map((raw) => ({ title: years(raw.title), body: years(raw.body) })).map((note) => (
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
