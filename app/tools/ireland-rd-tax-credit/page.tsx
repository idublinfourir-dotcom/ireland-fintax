import type { Metadata } from "next";
import { ReviewedBy } from "../../components/reviewed-by";
import { Breadcrumbs, BudgetNote, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/tool-tabs";
import { IrelandRdTaxCreditCalculator } from "../../components/ireland-rd-tax-credit-calculator";
import { RD_LAST_REVIEWED } from "../../lib/ireland-rd-tax-credit";
import { getRdData } from "../../lib/rd-data";
import { getMessages, getT } from "../../lib/messages";
import { rdMessages } from "../../lib/messages/rd";
import { calcMessages } from "../../lib/messages/calc";
import { localDate, percent } from "../../lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(rdMessages)).meta;
}


export default async function IrelandRdTaxCreditPage() {
  const { locale } = await getMessages();
  const t = await getT(rdMessages);
  const c = await getT(calcMessages);
  const { config } = await getRdData();

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
        lede={t.lede
          .replace("{date}", localDate(locale, RD_LAST_REVIEWED))
          .replace("{rate}", percent(locale, config.ratePercent))}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-rd-tax-credit" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandRdTaxCreditCalculator config={config} />
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
