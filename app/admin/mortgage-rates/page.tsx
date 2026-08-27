import type { Metadata } from "next";
import {
  mortgageProductsCollection,
  mortgageSettingsCollection,
} from "../../lib/collections";
import { requireAdmin } from "../../lib/auth/guards";
import { DEFAULT_POLICY, RATES_AS_OF } from "../../lib/ireland-mortgage";
import { RatesManager, type AdminProduct, type AdminSettings } from "./rates-manager";

export const metadata: Metadata = {
  title: "Mortgage rates",
  robots: { index: false, follow: false },
};

export default async function MortgageRatesPage() {
  await requireAdmin();

  const [productsCollection, settingsCollection] = await Promise.all([
    mortgageProductsCollection(),
    mortgageSettingsCollection(),
  ]);

  // Every product, active or not — this is the editor, not the public list.
  const [productDocs, settingsDoc] = await Promise.all([
    productsCollection.find().sort({ lender: 1, ratePercent: 1 }).toArray(),
    settingsCollection.findOne({ _id: 1 }),
  ]);

  const products: AdminProduct[] = productDocs.map((r) => ({
    id: r._id.toHexString(),
    lender: r.lender,
    name: r.name,
    rateType: r.rateType,
    ratePercent: r.ratePercent,
    aprcPercent: r.aprcPercent,
    // Stored as a fraction (0.9), edited as a percentage (90).
    maxLtvPercent: Math.round(r.maxLtv * 100),
    green: r.green,
    cashback: r.cashback ?? "",
    revertRatePercent: r.revertRatePercent,
    cashbackPercent: r.cashbackPercent,
    cashbackFlat: r.cashbackFlat,
    details: r.details ?? "",
    audience: r.audience,
    active: r.active,
  }));

  const s = settingsDoc;
  const settings: AdminSettings = s
    ? {
        ratesAsOf: s.ratesAsOf,
        ltiFirstTime: s.ltiFirstTime,
        ltiTradingUp: s.ltiTradingUp,
        maxLtvOwnerPercent: Math.round(s.maxLtvOwner * 100),
        maxLtvInvestmentPercent: Math.round(s.maxLtvInvestment * 100),
        maxAgeAtEnd: s.maxAgeAtEnd,
        maxTermOwner: s.maxTermOwner,
        maxTermInvestment: s.maxTermInvestment,
      }
    : {
        ratesAsOf: RATES_AS_OF,
        ltiFirstTime: DEFAULT_POLICY.ltiFirstTime,
        ltiTradingUp: DEFAULT_POLICY.ltiTradingUp,
        maxLtvOwnerPercent: Math.round(DEFAULT_POLICY.maxLtvOwner * 100),
        maxLtvInvestmentPercent: Math.round(DEFAULT_POLICY.maxLtvInvestment * 100),
        maxAgeAtEnd: DEFAULT_POLICY.maxAgeAtEnd,
        maxTermOwner: DEFAULT_POLICY.maxTermOwner,
        maxTermInvestment: DEFAULT_POLICY.maxTermInvestment,
      };

  return (
    <div className="mx-auto max-w-5xl">
      <header className="mb-8">
        <h2 className="font-display text-2xl font-semibold text-ink">
          Mortgage rates
        </h2>
        <p className="mt-1 text-sm text-muted">
          Lender products and Central Bank policy shown on the{" "}
          <a
            href="/tools/ireland"
            className="font-medium text-primary-600 transition-colors duration-200 hover:text-primary-500"
          >
            Ireland mortgage calculator
          </a>
          . Changes go live immediately — no deploy needed.
          {products.length === 0 && (
            <>
              {" "}
              No products in the database yet — run{" "}
              <code className="rounded-none bg-surface-muted px-1.5 py-0.5 text-xs">
                node scripts/db-seed.mjs
              </code>{" "}
              to seed them.
            </>
          )}
        </p>
      </header>

      <RatesManager products={products} settings={settings} />
    </div>
  );
}
