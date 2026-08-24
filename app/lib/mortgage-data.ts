/* Server-side loader for the Ireland mortgage comparison.
   Reads lender products + policy from Postgres (editable in /admin/mortgage-rates);
   falls back to the static snapshot in ireland-mortgage.ts when the DB is
   unreachable or not yet seeded, so the calculator never renders empty. */

import { query } from "./db";
import {
  DEFAULT_POLICY,
  LENDER_PRODUCTS,
  RATES_AS_OF,
  type LenderProduct,
  type MortgagePolicy,
  type ProductType,
  type RateType,
} from "./ireland-mortgage";

export interface MortgageData {
  products: LenderProduct[];
  policy: MortgagePolicy;
  ratesAsOf: string;
}

interface ProductRow {
  id: string;
  lender: string;
  name: string;
  rate_type: RateType;
  rate_percent: string; // pg numeric arrives as string
  aprc_percent: string;
  max_ltv: string;
  green: boolean;
  cashback: string | null;
  revert_rate_percent: string | null;
  cashback_percent: string | null;
  cashback_flat: string | null;
  details: string | null;
  audience: ProductType[];
}

interface SettingsRow {
  rates_as_of: string;
  lti_first_time: string;
  lti_trading_up: string;
  max_ltv_owner: string;
  max_ltv_investment: string;
  max_age_at_end: number;
  max_term_owner: number;
  max_term_investment: number;
}

export async function getMortgageData(): Promise<MortgageData> {
  try {
    const [{ rows: productRows }, { rows: settingsRows }] = await Promise.all([
      query<ProductRow>(
        `select id, lender, name, rate_type, rate_percent, aprc_percent,
                max_ltv, green, cashback, revert_rate_percent,
                cashback_percent, cashback_flat, details, audience
           from mortgage_products
          where active
          order by rate_percent asc, lender asc`,
      ),
      query<SettingsRow>(
        `select rates_as_of, lti_first_time, lti_trading_up,
                max_ltv_owner, max_ltv_investment, max_age_at_end,
                max_term_owner, max_term_investment
           from mortgage_settings
          where id = 1`,
      ),
    ]);

    if (productRows.length === 0) {
      return { products: LENDER_PRODUCTS, policy: DEFAULT_POLICY, ratesAsOf: RATES_AS_OF };
    }

    const products: LenderProduct[] = productRows.map((r) => ({
      id: r.id,
      lender: r.lender,
      name: r.name,
      rateType: r.rate_type,
      ratePercent: Number(r.rate_percent),
      aprcPercent: Number(r.aprc_percent),
      maxLtv: Number(r.max_ltv),
      green: r.green,
      cashback: r.cashback ?? undefined,
      revertRatePercent:
        r.revert_rate_percent == null ? undefined : Number(r.revert_rate_percent),
      cashbackPercent:
        r.cashback_percent == null ? undefined : Number(r.cashback_percent),
      cashbackFlat: r.cashback_flat == null ? undefined : Number(r.cashback_flat),
      details: r.details ?? undefined,
      audience: r.audience,
    }));

    const s = settingsRows[0];
    const policy: MortgagePolicy = s
      ? {
          ltiFirstTime: Number(s.lti_first_time),
          ltiTradingUp: Number(s.lti_trading_up),
          maxLtvOwner: Number(s.max_ltv_owner),
          maxLtvInvestment: Number(s.max_ltv_investment),
          maxAgeAtEnd: s.max_age_at_end,
          maxTermOwner: s.max_term_owner,
          maxTermInvestment: s.max_term_investment,
        }
      : DEFAULT_POLICY;

    return { products, policy, ratesAsOf: s?.rates_as_of ?? RATES_AS_OF };
  } catch (err) {
    console.error("[mortgage] DB read failed, using static snapshot:", err);
    return { products: LENDER_PRODUCTS, policy: DEFAULT_POLICY, ratesAsOf: RATES_AS_OF };
  }
}
