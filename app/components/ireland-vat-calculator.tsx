"use client";

/* Ireland VAT calculator — a business's net VAT position, as on the VAT3
   return. Two INPUT tabs, one per side:
   • VAT received — VAT you charge customers on SALES (output VAT, T1).
   • VAT paid     — VAT you pay suppliers on PURCHASES (input VAT, T2).
   The category dropdown mirrors across the tabs ("what you buy" defaults to
   "what you sell") but is independently changeable. Amounts are per side.

   The RESULT (right) is not a tab — it computes the verdict from both sides:
   received > paid → PAYABLE; paid > received → RECEIVABLE (e.g. KFC: €2.5M
   paid vs €2M received → €0.5M receivable).
   All maths + rates live in ../lib/ireland-vat (single source of truth). */

import { useState } from "react";
import {
  addVat,
  removeVat,
  vatPosition,
  getVatRate,
  VAT_CATEGORIES,
  VAT_LAST_REVIEWED,
  VAT_SOURCE_URL,
  type VatConfig,
  type VatPosition,
  type VatRate,
  type VatThresholds,
} from "../lib/ireland-vat";
import {
  CurrencyField,
  LegendDot,
  ProportionBar,
  ResultDisclaimer,
  SelectField,
} from "./calculator-fields";
import { useLocale, useT } from "./locale-link";
import { vatMessages } from "../lib/messages/vat";
import { localDate, numberFormat, percent } from "../lib/i18n";
import { Emphasis, fill } from "./ui";

type Side = "received" | "paid";

/* Money in the page's language: €1,234.50 / 1.234,50 € / € 1.234,50. */
function useMoney() {
  const locale = useLocale();
  const two = numberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const zero = numberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  return { money: (n: number) => two.format(n), eur0: (n: number) => zero.format(n) };
}

/* A rate's name and text in the page's language, or as stored. */
function useRateText() {
  const t = useT(vatMessages);
  const locale = useLocale();
  return (r: VatRate) => {
    const tr = t.rates[r.key];
    return {
      name: tr?.name ?? r.label.split(": ")[0],
      group: tr ? `${tr.name}: ${percent(locale, r.percent)}` : r.label,
      applies: tr?.applies ?? r.applies,
      note: r.note ? (tr?.note ?? r.note) : undefined,
    };
  };
}

const keyOf = (label: string) =>
  (VAT_CATEGORIES.find((c) => c.label === label) ?? VAT_CATEGORIES[0]).rateKey;

/* ---------- category selector (shared markup) ---------- */

function CategorySelect({
  label,
  value,
  onChange,
  hint,
  rates,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: React.ReactNode;
  rates: VatRate[];
}) {
  const t = useT(vatMessages);
  const rateText = useRateText();
  return (
    <SelectField label={label} value={value} onChange={onChange} hint={hint}>
      {rates.map((r) => {
        const items = VAT_CATEGORIES.filter((c) => c.rateKey === r.key);
        if (items.length === 0) return null;
        return (
          <optgroup key={r.key} label={rateText(r).group}>
            {items.map((c) => (
              <option key={c.label} value={c.label}>
                {t.categories[c.label] ?? c.label}
              </option>
            ))}
          </optgroup>
        );
      })}
    </SelectField>
  );
}

/* ---------- net position verdict (computed — not a tab) ---------- */

function VerdictCard({ pos }: { pos: VatPosition }) {
  const { outputVat: received, inputVat: paid, netVat, direction } = pos;
  const t = useT(vatMessages);
  const { money } = useMoney();
  const copy = t.verdict[direction];
  const view = {
    ...copy,
    tag: {
      text: copy.tag,
      cls: {
        payable: "bg-navy-900 text-white",
        receivable: "bg-primary-500 text-white",
        balanced: "border border-line bg-surface-muted text-muted",
      }[direction],
    },
  };

  return (
    <div className="border border-line bg-surface">
      <div className="border-b border-line px-5 py-5 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {view.eyebrow}
          </p>
          <span
            className={`rounded-none px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${view.tag.cls}`}
          >
            {view.tag.text}
          </span>
        </div>
        <p className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
          {money(netVat)}
        </p>
        <p className="mt-2.5 text-sm text-muted">{view.sub}</p>
        <div className="mt-4">
          <ProportionBar
            segments={[
              {
                label: t.receivedBar.replace("{amount}", money(received)),
                value: received,
                className: "bg-navy-900",
              },
              {
                label: t.paidBar.replace("{amount}", money(paid)),
                value: paid,
                className: "bg-primary-500",
              },
            ]}
          />
        </div>
      </div>
      <dl className="divide-y divide-line">
        <div className="flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <LegendDot className="bg-navy-900" />
            <span className="text-sm text-ink-body">
              {t.receivedRow}
            </span>
          </div>
          <span className="text-sm font-medium text-ink tabular-nums">
            {money(received)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <LegendDot className="bg-primary-500" />
            <span className="text-sm text-ink-body">
              {t.paidRow}
            </span>
          </div>
          <span className="text-sm font-medium text-ink tabular-nums">{money(paid)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-4 bg-surface-muted px-5 py-3.5 sm:px-6">
          <span className="text-sm font-semibold text-ink">{view.netLabel}</span>
          <span className="font-display text-sm font-semibold text-ink tabular-nums">
            {money(netVat)}
          </span>
        </div>
      </dl>
      <p className="border-t border-line px-5 py-3 text-xs leading-5 text-muted sm:px-6">
        {t.mirrorsVat3}
      </p>
    </div>
  );
}

/* ---------- registration thresholds ---------- */

function ThresholdsCard({ thresholds }: { thresholds: VatThresholds }) {
  const t = useT(vatMessages);
  const locale = useLocale();
  const { eur0 } = useMoney();
  return (
    <div className="mt-5 border border-line bg-surface p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
        {t.thresholdsTitle}
      </h3>
      <div className="mt-3 flex flex-wrap gap-x-8 gap-y-2 text-sm text-ink-body">
        <span>
          {t.goods}{" "}
          <span className="font-semibold text-ink">{eur0(thresholds.goods)}</span>
        </span>
        <span>
          {t.services}{" "}
          <span className="font-semibold text-ink">{eur0(thresholds.services)}</span>
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-muted">
        {t.thresholdsBody.replace("{since}", localDate(locale, thresholds.since))}
      </p>
    </div>
  );
}

/* ---------- calculator ---------- */

export function IrelandVatCalculator({ config }: { config: VatConfig }) {
  const { rates, thresholds } = config;
  const t = useT(vatMessages);
  const { money } = useMoney();
  const rateText = useRateText();
  const [side, setSide] = useState<Side>("received");
  const [salesAmount, setSalesAmount] = useState(0);
  const [purchaseAmount, setPurchaseAmount] = useState(0);
  const [salesCategory, setSalesCategory] = useState<string>(
    VAT_CATEGORIES[0].label,
  );
  // null → mirror the sales category; a value → user has set it independently.
  const [purchaseCategoryOverride, setPurchaseCategoryOverride] = useState<
    string | null
  >(null);
  const purchaseCategory = purchaseCategoryOverride ?? salesCategory;
  const purchaseMirrored = purchaseCategoryOverride === null;

  const salesRate = getVatRate(keyOf(salesCategory), rates);
  const purchaseRate = getVatRate(keyOf(purchaseCategory), rates);

  // Sales entered net (you set prices before VAT); purchases entered gross
  // (supplier invoices show the total you actually paid).
  const sales = addVat(salesAmount, salesRate.percent);
  const purchases = removeVat(purchaseAmount, purchaseRate.percent);
  // received = output VAT (T1); paid = input VAT (T2).
  const pos = vatPosition(sales.vat, purchases.vat);

  const received = side === "received";
  const locale = useLocale();

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* inputs — tabbed by side */}
      <div className="flex flex-col gap-5">
        <div className="border-l-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
          <span className="font-semibold text-ink">{t.introTitle}</span>{" "}
          <Emphasis text={t.introBody} className="font-medium not-italic text-ink" />
        </div>

        {/* side tabs */}
        <div>
          <div
            role="tablist"
            aria-label={t.sideLabel}
            className="flex gap-1.5 rounded-none border border-line bg-surface-muted p-1"
          >
            {(["received", "paid"] as Side[]).map((s) => {
              const active = side === s;
              return (
                <button
                  key={s}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setSide(s)}
                  className={`flex-1 cursor-pointer rounded-none px-3 py-2 text-xs font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                    active ? "bg-primary-500 text-white" : "text-ink hover:bg-surface"
                  }`}
                >
                  {s === "received" ? t.tabReceived : t.tabPaid}
                </button>
              );
            })}
          </div>

          {/* active panel */}
          <div
            role="tabpanel"
            className="mt-4 border border-line bg-surface p-4 sm:p-5"
          >
            <div className="flex items-baseline justify-between gap-3">
              <div className="flex items-baseline gap-2.5">
                <LegendDot className={received ? "bg-navy-900" : "bg-primary-500"} />
                <h3 className="text-sm font-semibold text-ink">
                  {received ? t.headReceived : t.headPaid}
                </h3>
              </div>
              <span
                className={`rounded-none px-2 py-0.5 font-display text-xs font-semibold tabular-nums text-white ${
                  received ? "bg-navy-900" : "bg-primary-500"
                }`}
              >
                {percent(locale, (received ? salesRate : purchaseRate).percent)}
              </span>
            </div>
            <p className="mt-1 text-xs leading-5 text-muted">
              {received ? t.descReceived : t.descPaid}
            </p>

            <div className="mt-4 flex flex-col gap-4">
              {received ? (
                <CategorySelect
                  label={t.whatYouSell}
                  value={salesCategory}
                  onChange={setSalesCategory}
                  rates={rates}
                  hint={
                    <>
                      {t.rateApplies
                        .replace("{rate}", rateText(salesRate).name)
                        .replace("{applies}", rateText(salesRate).applies)}
                      {rateText(salesRate).note && (
                        <span className="block">{rateText(salesRate).note}</span>
                      )}
                    </>
                  }
                />
              ) : (
                <CategorySelect
                  label={t.whatYouBuy}
                  value={purchaseCategory}
                  onChange={setPurchaseCategoryOverride}
                  rates={rates}
                  hint={
                    <>
                      {t.rateApplies
                        .replace("{rate}", rateText(purchaseRate).name)
                        .replace("{applies}", rateText(purchaseRate).applies)}
                      {rateText(purchaseRate).note && (
                        <span className="block">{rateText(purchaseRate).note}</span>
                      )}
                      <span className="mt-0.5 block text-muted">
                        {purchaseMirrored ? t.mirrored : t.independent}
                        {!purchaseMirrored && (
                          <button
                            type="button"
                            onClick={() => setPurchaseCategoryOverride(null)}
                            className="font-medium text-primary-500 underline-offset-2 hover:underline"
                          >
                            {t.matchSell}
                          </button>
                        )}
                      </span>
                    </>
                  }
                />
              )}

              {received ? (
                <CurrencyField
                  label={t.salesLabel}
                  value={salesAmount}
                  onChange={setSalesAmount}
                  hint={t.salesHint}
                />
              ) : (
                <CurrencyField
                  label={t.purchasesLabel}
                  value={purchaseAmount}
                  onChange={setPurchaseAmount}
                  hint={t.purchasesHint}
                />
              )}
            </div>

            <p className="mt-3 border-t border-line pt-3 text-xs leading-5 text-muted">
              {received ? (
                sales.gross > 0 ? (
                  fill(t.salesSummary, {
                    vat: <span className="font-medium text-ink">{money(sales.vat)}</span>,
                    gross: money(sales.gross),
                  })
                ) : (
                  t.salesEmpty
                )
              ) : purchases.gross > 0 ? (
                fill(t.purchasesSummary, {
                  vat: <span className="font-medium text-ink">{money(purchases.vat)}</span>,
                  net: money(purchases.net),
                })
              ) : (
                t.purchasesEmpty
              )}
            </p>
          </div>
        </div>

        {/* both-sides recap, so switching tabs never hides a figure */}
        <div className="flex flex-wrap gap-x-6 gap-y-1 border border-line bg-surface-muted px-4 py-3 text-xs text-ink-body">
          <span>
            {t.recapReceived}{" "}
            <span className="font-semibold text-ink tabular-nums">{money(sales.vat)}</span>
          </span>
          <span>
            {t.recapPaid}{" "}
            <span className="font-semibold text-ink tabular-nums">
              {money(purchases.vat)}
            </span>
          </span>
        </div>
      </div>

      {/* result — computed verdict */}
      <div className="flex flex-col">
        <VerdictCard pos={pos} />
        <ThresholdsCard thresholds={thresholds} />
        <ResultDisclaimer asOf={VAT_LAST_REVIEWED} sourceUrl={VAT_SOURCE_URL} />
      </div>
    </div>
  );
}
