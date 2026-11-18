"use client";

/* Ireland Capital Allowances calculator: wear & tear / writing-down allowances
   on plant & machinery (12.5%/8yr), cars (12.5%/8yr on €24,000, by CO2 and date),
   industrial buildings (4%/25yr) and energy-efficient equipment (100% ACA).
   The user picks the asset class; this component never guesses. The editable
   rates/limits arrive as `config` (admin-editable, DB-backed with a code
   fallback); the maths + the statutory car CO2 rules live in
   ../lib/ireland-capital-allowances. Cars lead with the rules from 1 January
   2027 and show the 2026 total alongside, like the income tax calculator. */

import { useMemo, useState } from "react";
import {
  computeCapitalAllowance,
  CAR_RELIEF,
  CAR_RULES,
  CO2_CATEGORIES,
  CA_LAST_REVIEWED,
  CA_SOURCE_URL,
  type AssetKey,
  type CaConfig,
  type CarRules,
  type Co2Category,
} from "../lib/ireland-capital-allowances";
import {
  CurrencyField,
  LegendDot,
  ResultDisclaimer,
  SegmentedField,
  SelectField,
  useFormat,
} from "./calculator-fields";
import { useT } from "./locale-link";
import { caMessages } from "../lib/messages/ca";
import { plural } from "../lib/i18n";
import { fill } from "./ui";


/* One breakdown line: label + optional derivation · value. */
function Row({
  dotClass,
  label,
  sub,
  value,
  strong,
}: {
  dotClass?: string;
  label: string;
  sub?: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-6 ${
        strong ? "bg-surface-muted" : ""
      }`}
    >
      <dt className="flex items-baseline gap-2.5">
        {dotClass && <LegendDot className={dotClass} />}
        <div>
          <span className={`text-sm ${strong ? "font-semibold text-ink" : "text-ink-body"}`}>
            {label}
          </span>
          {sub && <span className="mt-0.5 block text-xs text-muted tabular-nums">{sub}</span>}
        </div>
      </dt>
      <dd
        className={`tabular-nums ${
          strong
            ? "font-display text-sm font-semibold text-ink"
            : "text-sm font-medium text-ink"
        }`}
      >
        {value}
      </dd>
    </div>
  );
}

export function IrelandCapitalAllowancesCalculator({ config }: { config: CaConfig }) {
  const t = useT(caMessages).tax;
  const { money, eur0, rate, locale } = useFormat();
  const assetText = (a: { key: string; label: string; note: string }) => t.assets[a.key] ?? a;
  const years = (n: number) => plural(locale, n, t.years);
  const [assetKey, setAssetKey] = useState<AssetKey>("plant-machinery");
  const [cost, setCost] = useState(0);
  const [co2Category, setCo2Category] = useState<Co2Category>("a");
  const [carRules, setCarRules] = useState<CarRules>(CAR_RULES[0]);
  const otherRules = CAR_RULES.find((y) => y !== carRules)!;

  // Resolve from the (possibly edited) config, not the module const.
  const cls = config.classes.find((a) => a.key === assetKey) ?? config.classes[0];
  const isCar = cls.co2Restricted === true;

  const r = useMemo(
    () => computeCapitalAllowance({ assetKey, cost, co2Category, carRules }, config),
    [assetKey, cost, co2Category, carRules, config],
  );
  const other = computeCapitalAllowance({ assetKey, cost, co2Category, carRules: otherRules }, config);
  const relief = CAR_RELIEF[carRules][co2Category];
  const reliefNote = (relief === 1 ? t.co2Relief.full : relief === 0.5 ? t.co2Relief.half : t.co2Relief.none)
    .replace("{cap}", eur0(config.motorCapEur))
    .replace("{half}", eur0(config.motorCapEur / 2));

  const heroLabel = r.firstYearFull ? t.firstYear : t.annual;
  const heroValue = r.firstYearFull ? r.firstYearAllowance : r.annualAllowance;
  const heroSub = r.firstYearFull
    ? t.fullYearOne
    : t.perYear.replace("{rate}", rate(r.ratePercent)).replace("{years}", years(r.years));

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* inputs */}
      <div className="flex flex-col gap-5">
        <div className="border-s-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
          <span className="font-semibold text-ink">{t.introTitle}</span> {t.introBody}
        </div>

        <SelectField
          label={t.assetType}
          value={assetKey}
          onChange={(v) => setAssetKey(v as AssetKey)}
          hint={assetText(cls).note}
        >
          {config.classes.map((a) => (
            <option key={a.key} value={a.key}>
              {assetText(a).label}
            </option>
          ))}
        </SelectField>

        {isCar && (
          <>
            <SegmentedField
              label={t.bought}
              value={String(carRules)}
              onChange={(v) => setCarRules(Number(v) as CarRules)}
              options={CAR_RULES.map((y) => ({ value: String(y), label: t.boughtOptions[y] }))}
            />
            <SelectField
              label={t.co2}
              value={co2Category}
              onChange={(v) => setCo2Category(v as Co2Category)}
              hint={reliefNote}
            >
              {CO2_CATEGORIES.map((k) => (
                <option key={k} value={k}>
                  {t.co2Groups[k]}
                </option>
              ))}
            </SelectField>
          </>
        )}

        <CurrencyField
          label={isCar ? t.carCost : t.assetCost}
          value={cost}
          onChange={setCost}
          hint={
            isCar
              ? t.carCostHint.replace("{cap}", eur0(config.motorCapEur))
              : t.assetCostHint
          }
        />

        <div className="mt-auto border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t.notIncluded}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted">
            {t.notIncludedBody}
          </p>
        </div>
      </div>

      {/* results */}
      <div className="flex flex-col">
        <div className="border border-line bg-surface">
          {/* hero */}
          <div className="border-b border-line px-5 py-5 sm:px-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {heroLabel}
              </p>
              <span className="text-xs text-muted tabular-nums">
                {assetText(cls).label}
              </span>
            </div>
            <p className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
              {money(heroValue)}
            </p>
            <p className="mt-2.5 text-sm text-muted">
              {fill(t.writtenOffTotal, {
                heroSub,
                total: (
                  <span className="font-semibold text-primary-600 tabular-nums">
                    {money(r.totalAllowances)}
                  </span>
                ),
              })}
            </p>
          </div>

          {/* breakdown */}
          <dl className="divide-y divide-line">
            <Row label={t.cost} value={money(r.cost)} />
            {r.restricted && (
              <Row
                dotClass="bg-navy-900"
                label={t.allowable}
                sub={
                  relief === 0
                    ? t.noRelief
                    : relief === 1
                      ? t.setAt.replace("{cap}", eur0(config.motorCapEur))
                      : `${t.cappedAt.replace("{cap}", eur0(config.motorCapEur))}${t.halfCo2}`
                }
                value={money(r.allowableCost)}
              />
            )}
            <Row
              dotClass="bg-primary-500"
              label={r.firstYearFull ? t.yearOne : t.annual}
              sub={
                r.firstYearFull
                  ? t.fullOf.replace("{amount}", money(r.allowableCost))
                  : `${money(r.allowableCost)} × ${rate(r.ratePercent)}`
              }
              value={money(heroValue)}
            />
            <Row
              label={t.writtenOffOver}
              value={years(r.firstYearFull ? 1 : r.years)}
            />
            <Row label={t.totalAllowances} value={money(r.totalAllowances)} strong />
            {isCar && <Row label={t.ifBought[otherRules]} value={money(other.totalAllowances)} />}
            <Row
              dotClass="bg-primary-300"
              label={t.saving.replace("{rate}", rate(config.tradingCtPercent))}
              sub={t.savingSub}
              value={money(r.taxSaving)}
            />
          </dl>
        </div>

        <ResultDisclaimer asOf={CA_LAST_REVIEWED} sourceUrl={CA_SOURCE_URL} />
      </div>
    </div>
  );
}
