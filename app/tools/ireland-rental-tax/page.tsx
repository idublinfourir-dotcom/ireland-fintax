import type { Metadata } from "next";
import { ReviewedBy } from "../../components/reviewed-by";
import { Breadcrumbs, BudgetNote, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/tool-tabs";
import { IrelandRentalTaxCalculator } from "../../components/ireland-rental-tax-calculator";
import { getTaxRates } from "../../lib/tax-data";
import { comparisonYears } from "../../lib/ireland-income-tax";
import { RENT_A_ROOM_LIMIT, RPRIR_MAX } from "../../lib/ireland-rental-tax";
import { numberFormat } from "../../lib/i18n";
import { getLocale, getT } from "../../lib/messages";
import { rentalMessages } from "../../lib/messages/rental";
import { calcMessages } from "../../lib/messages/calc";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(rentalMessages)).meta;
}

/* Income tax, USC and PRSI rates come from the same admin-editable store as
   the income tax calculator; the Rent-a-Room limits and RPRIR are statute,
   in ireland-rental-tax.ts. */
export default async function IrelandRentalTaxPage() {
  const ratesByYear = await getTaxRates();
  const { current } = comparisonYears(ratesByYear);
  const t = await getT(rentalMessages);
  const c = await getT(calcMessages);
  const eur = numberFormat(await getLocale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const figures = (s: string) =>
    s
      .replace("{limit}", eur.format(RENT_A_ROOM_LIMIT[2026]))
      .replace("{nextLimit}", eur.format(RENT_A_ROOM_LIMIT[2027]))
      .replace("{rprir}", eur.format(RPRIR_MAX[2026]));

  return (
    <>
      <PageHero
        image="deskFinance"
        breadcrumb={
          <Breadcrumbs items={[{ label: c.home, href: "/" }, { label: c.tools }, { label: t.crumb }]} />
        }
        title={t.title}
        lede={t.lede}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-rental-tax" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandRentalTaxCalculator ratesByYear={ratesByYear} defaultYear={current} />
        </div>

        <BudgetNote>{figures(t.budgetNote)}</BudgetNote>
        <ReviewedBy className="mt-2" />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {t.notes.map((note) => (
            <div key={note.title} className="rounded-none border border-line bg-surface p-6">
              <h2 className="font-display text-base font-medium tracking-tight text-ink">{note.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{figures(note.body)}</p>
            </div>
          ))}
        </div>
      </Container>

      <ContactCta />
    </>
  );
}
