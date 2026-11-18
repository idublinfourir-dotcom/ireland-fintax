import type { Metadata } from "next";
import { ReviewedBy } from "../../components/reviewed-by";
import { Breadcrumbs, BudgetNote, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/tool-tabs";
import { IrelandCryptoCgtCalculator } from "../../components/ireland-crypto-cgt-calculator";
import { getCgtData } from "../../lib/cgt-data";
import { exchangeFetch, listCoins } from "../../lib/crypto-prices";
import { numberFormat, percent } from "../../lib/i18n";
import { getLocale, getT } from "../../lib/messages";
import { cryptoMessages } from "../../lib/messages/crypto";
import { calcMessages } from "../../lib/messages/calc";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(cryptoMessages)).meta;
}

/* The CGT rate and exemption come from the CGT calculator's admin-editable
   settings (getCgtData), so both pages always agree. */
export default async function IrelandCryptoTaxPage() {
  const locale = await getLocale();
  const t = await getT(cryptoMessages);
  const c = await getT(calcMessages);
  // The coin list is live from both exchanges, cached for a day. `today` is the
  // UTC date, the exchanges' day: in summer, Irish midnight to 1am is still
  // "yesterday" there, and a row dated that day would find no price.
  const [{ config }, coins] = await Promise.all([getCgtData(), listCoins(exchangeFetch, { next: { revalidate: 86_400 } })]);
  const exemption = numberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(config.annualExemptionEur);

  return (
    <>
      <PageHero
        image="deskFinance"
        breadcrumb={<Breadcrumbs items={[{ label: c.home, href: "/" }, { label: c.tools }, { label: t.crumb }]} />}
        title={t.title}
        lede={t.lede.replace("{rate}", percent(locale, config.standardRatePercent))}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-crypto-tax" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandCryptoCgtCalculator config={config} coins={coins} today={new Date().toISOString().slice(0, 10)} />
        </div>

        <BudgetNote>{t.budgetNote}</BudgetNote>
        <ReviewedBy className="mt-2" />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {t.notes.map((note) => (
            <div key={note.title} className="rounded-none border border-line bg-surface p-6">
              <h2 className="font-display text-base font-medium tracking-tight text-ink">{note.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{note.body.replace("{exemption}", exemption)}</p>
            </div>
          ))}
        </div>
      </Container>

      <ContactCta />
    </>
  );
}
