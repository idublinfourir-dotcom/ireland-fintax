import type { Metadata } from "next";
import { ReviewedBy } from "../../components/reviewed-by";
import { Breadcrumbs, BudgetNote, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/tool-tabs";
import { IrelandCorporationTaxCalculator } from "../../components/ireland-corporation-tax-calculator";
import { CT_LAST_REVIEWED } from "../../lib/ireland-corporation-tax";
import { getCorporationTaxData } from "../../lib/corporation-tax-data";
import { getMessages, getT } from "../../lib/messages";
import { ctMessages } from "../../lib/messages/ct";
import { calcMessages } from "../../lib/messages/calc";
import { localDate } from "../../lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(ctMessages)).meta;
}


export default async function IrelandCorporationTaxPage() {
  const { locale } = await getMessages();
  const t = await getT(ctMessages);
  const c = await getT(calcMessages);
  const { config } = await getCorporationTaxData();

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
        lede={t.lede.replace("{date}", localDate(locale, CT_LAST_REVIEWED))}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-corporation-tax" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandCorporationTaxCalculator config={config} />
        </div>

        <BudgetNote>{t.budgetNote}</BudgetNote>
        <ReviewedBy className="mt-2" />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {t.notes.map((note) => (
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
