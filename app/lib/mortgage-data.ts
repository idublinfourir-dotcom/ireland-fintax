/* Server-side loader for the Ireland mortgage comparison.
   Reads lender products + policy from `mortgage_products` / `mortgage_settings`
   (editable in /admin/mortgage-rates); falls back to the static snapshot in
   ireland-mortgage.ts when the database is unreachable or not yet seeded, so
   the calculator never renders empty. */

import {
  mortgageProductsCollection,
  mortgageSettingsCollection,
} from "./collections";
import { isDbConfigured } from "./db-config";
import {
  DEFAULT_POLICY,
  LENDER_PRODUCTS,
  RATES_AS_OF,
  type LenderProduct,
  type MortgagePolicy,
} from "./ireland-mortgage";

export interface MortgageData {
  products: LenderProduct[];
  policy: MortgagePolicy;
  ratesAsOf: string;
}

const STATIC: MortgageData = {
  products: LENDER_PRODUCTS,
  policy: DEFAULT_POLICY,
  ratesAsOf: RATES_AS_OF,
};

export async function getMortgageData(): Promise<MortgageData> {
  // No backend configured: the static snapshot IS the answer.
  if (!isDbConfigured()) return STATIC;

  try {
    const [productsCollection, settingsCollection] = await Promise.all([
      mortgageProductsCollection(),
      mortgageSettingsCollection(),
    ]);

    const [productDocs, settingsDoc] = await Promise.all([
      productsCollection
        .find({ active: true })
        .sort({ ratePercent: 1, lender: 1 })
        .toArray(),
      settingsCollection.findOne({ _id: 1 }),
    ]);

    if (productDocs.length === 0) return STATIC;

    /* The rate fields are stored as numbers now (the pg numeric columns arrived
       as strings and every one of them was wrapped in Number()). The optional
       ones stay `undefined` rather than null, which is what LenderProduct
       expects and what the maths distinguishes on. */
    const products: LenderProduct[] = productDocs.map((r) => ({
      id: r._id.toHexString(),
      lender: r.lender,
      name: r.name,
      rateType: r.rateType,
      ratePercent: r.ratePercent,
      aprcPercent: r.aprcPercent,
      maxLtv: r.maxLtv,
      green: r.green,
      cashback: r.cashback ?? undefined,
      revertRatePercent: r.revertRatePercent ?? undefined,
      cashbackPercent: r.cashbackPercent ?? undefined,
      cashbackFlat: r.cashbackFlat ?? undefined,
      details: r.details ?? undefined,
      audience: r.audience,
    }));

    const policy: MortgagePolicy = settingsDoc
      ? {
          ltiFirstTime: settingsDoc.ltiFirstTime,
          ltiTradingUp: settingsDoc.ltiTradingUp,
          maxLtvOwner: settingsDoc.maxLtvOwner,
          maxLtvInvestment: settingsDoc.maxLtvInvestment,
          maxAgeAtEnd: settingsDoc.maxAgeAtEnd,
          maxTermOwner: settingsDoc.maxTermOwner,
          maxTermInvestment: settingsDoc.maxTermInvestment,
        }
      : DEFAULT_POLICY;

    return { products, policy, ratesAsOf: settingsDoc?.ratesAsOf ?? RATES_AS_OF };
  } catch (err) {
    console.error("[mortgage] DB read failed, using static snapshot:", err);
    return STATIC;
  }
}
