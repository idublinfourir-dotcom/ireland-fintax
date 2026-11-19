import type { Metadata } from "next";
import { ReviewedBy } from "../../components/reviewed-by";
import { Breadcrumbs, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { PersonalTabs } from "../../components/tool-tabs";
import { BudgetNoteLink } from "../../components/calculator-fields";
import { IrelandStampDutyCalculator } from "../../components/ireland-stamp-duty-calculator";
import { RESIDENTIAL_BANDS } from "../../lib/ireland-stamp-duty";
import { numberFormat } from "../../lib/i18n";
import { getLocale, getT } from "../../lib/messages";
import { stampDutyMessages } from "../../lib/messages/stamp-duty";
import { mortgageMessages } from "../../lib/messages/mortgage";
import { calcMessages } from "../../lib/messages/calc";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(stampDutyMessages)).meta;
}

/* The rates are statute, in ireland-stamp-duty.ts: no database read. Budget
   2027 left them alone, so the usual "announced, subject to the Finance Bill"
   note does not apply; the page says so and links to the Budget page. */
export default async function IrelandStampDutyPage() {
  const t = await getT(stampDutyMessages);
  const m = await getT(mortgageMessages);
  const c = await getT(calcMessages);
  const eur = numberFormat(await getLocale(), { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const bands = (s: string) =>
    s.replaceAll("{b1}", eur.format(RESIDENTIAL_BANDS[0].upTo)).replaceAll("{b2}", eur.format(RESIDENTIAL_BANDS[1].upTo));

  return (
    <>
      <PageHero
        image="deskFinance"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: c.home, href: "/" },
              { label: m.crumbHub, href: "/personal/mortgage" },
              { label: t.crumb },
            ]}
          />
        }
        title={t.title}
        lede={t.lede}
      />

      <Container className="py-16 sm:py-20">
        <PersonalTabs current="/personal/stamp-duty" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandStampDutyCalculator />
        </div>

        <p className="mt-6 text-sm leading-6 text-muted">
          {t.budgetNote} <BudgetNoteLink />
        </p>
        <ReviewedBy className="mt-2" />

        <div className="mt-12 grid gap-6 sm:grid-cols-3">
          {t.notes.map((note) => (
            <div key={note.title} className="rounded-none border border-line bg-surface p-6">
              <h2 className="font-display text-base font-medium tracking-tight text-ink">{note.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted">{bands(note.body)}</p>
            </div>
          ))}
        </div>
      </Container>

      <ContactCta />
    </>
  );
}
