import type { Metadata } from "next";
import { Breadcrumbs, Container, PageHero } from "../../components/ui";
import { ContactCta } from "../../components/sections";
import { CalculatorTabs } from "../../components/calculator-tabs";
import { CapitalAllowancesTool } from "../../components/capital-allowances-tool";
import { CA_LAST_REVIEWED } from "../../lib/ireland-capital-allowances";
import { getCaData } from "../../lib/ca-data";

export const metadata: Metadata = {
  title: "Ireland Capital Allowances & Working Capital Calculator",
  description:
    "Two tools in one: Irish capital allowances (tax), plant & machinery 12.5% over 8 years, cars capped at €24,000 with CO2 limits, industrial buildings 4%, and 100% accelerated allowances for energy-efficient equipment, plus working capital (finance): current assets minus current liabilities with the current and quick ratios. Republic of Ireland.",
};

export default async function IrelandCapitalAllowancesPage() {
  const { config } = await getCaData();

  return (
    <>
      <PageHero
        image="deskFinance"
        breadcrumb={
          <Breadcrumbs
            items={[
              { label: "Home", href: "/" },
              { label: "Tools" },
              { label: "Capital allowances & working capital" },
            ]}
          />
        }
        title="Capital allowances & working capital"
        lede={`Capital allowances (tax depreciation on plant, cars, buildings and energy-efficient equipment) and working capital (a liquidity snapshot) in one place, tax figures current as of ${CA_LAST_REVIEWED}.`}
      />

      <Container className="py-16 sm:py-20">
        <CalculatorTabs current="/tools/ireland-capital-allowances" />
        <CapitalAllowancesTool config={config} />
      </Container>

      <ContactCta />
    </>
  );
}
