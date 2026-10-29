import type { Metadata } from "next";
import { ReviewedBy } from "../../components/reviewed-by";
import { Breadcrumbs, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/tool-tabs";
import { IrelandVatCalculator } from "../../components/ireland-vat-calculator";
import { VAT_LAST_REVIEWED } from "../../lib/ireland-vat";
import { getVatData } from "../../lib/vat-data";
import { getMessages, getT } from "../../lib/messages";
import { vatMessages } from "../../lib/messages/vat";
import { calcMessages } from "../../lib/messages/calc";
import { localDate } from "../../lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(vatMessages)).meta;
}

export default async function IrelandVatPage() {
  const { config } = await getVatData();
  const { locale } = await getMessages();
  const t = await getT(vatMessages);
  const c = await getT(calcMessages);

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
        lede={t.lede.replace("{date}", localDate(locale, VAT_LAST_REVIEWED))}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-vat" />

        <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
          <IrelandVatCalculator config={config} />
        </div>
        <ReviewedBy className="mt-6" />

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
