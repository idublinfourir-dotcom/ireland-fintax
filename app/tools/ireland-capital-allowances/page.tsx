import type { Metadata } from "next";
import { Breadcrumbs, BudgetNote, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/tool-tabs";
import { CapitalAllowancesTool } from "../../components/capital-allowances-tool";
import { CA_LAST_REVIEWED } from "../../lib/ireland-capital-allowances";
import { getCaData } from "../../lib/ca-data";
import { getMessages, getT } from "../../lib/messages";
import { caMessages } from "../../lib/messages/ca";
import { calcMessages } from "../../lib/messages/calc";
import { localDate } from "../../lib/i18n";

export async function generateMetadata(): Promise<Metadata> {
  return (await getT(caMessages)).meta;
}

export default async function IrelandCapitalAllowancesPage() {
  const { locale } = await getMessages();
  const t = await getT(caMessages);
  const c = await getT(calcMessages);
  const { config } = await getCaData();

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
        lede={t.lede.replace("{date}", localDate(locale, CA_LAST_REVIEWED))}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-capital-allowances" />
        <CapitalAllowancesTool config={config} />

        <BudgetNote>{t.budgetNote}</BudgetNote>
      </Container>

      <ContactCta />
    </>
  );
}
