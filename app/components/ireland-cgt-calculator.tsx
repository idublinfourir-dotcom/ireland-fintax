"use client";

/* Ireland Capital Gains Tax calculator. Proceeds less the indexed allowable
   cost gives the gain; PPR relief, losses and the €1,270 exemption reduce it;
   the rate (31% from 7 Oct 2026, or 10% Entrepreneur Relief / 40% / 15%)
   gives the CGT due.

   The rates and the indexation multiplier table are passed in as props — the
   server page reads them from MongoDB (editable at /admin/cgt-rates) and falls
   back to the code defaults. All maths live in ../lib/ireland-cgt. */

import { useMemo, useState } from "react";
import {
  computeCgt,
  CGT_LAST_REVIEWED,
  CGT_SOURCE_URL,
  type CgtConfig,
  type CgtMultiplier,
  type CgtResult,
  type RateMode,
} from "../lib/ireland-cgt";
import {
  CurrencyField,
  NumericField,
  ProportionBar,
  ResultDisclaimer,
  SegmentedField,
  SelectField,
  useFormat,
} from "./calculator-fields";
import { useT } from "./locale-link";
import { cgtMessages } from "../lib/messages/cgt";
import { numberFormat } from "../lib/i18n";
import { fill } from "./ui";

/* Multipliers as Revenue prints them, up to three decimals: ×6.08, ×1.049
   (×6,08 / ×1,049 where the language uses a decimal comma). */
function useMultiplier() {
  const { locale } = useFormat();
  const f = numberFormat(locale, { maximumFractionDigits: 3 });
  return (m: number) => f.format(m);
}

/* Checkbox that reveals an optional section — keeps the common case simple. */
function SectionToggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 border border-line bg-surface-muted px-4 py-2.5 text-sm font-medium text-ink-body transition-colors duration-200 hover:text-ink">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 shrink-0 accent-primary-500"
      />
      {label}
    </label>
  );
}

/* One breakdown line: label (+ optional sub) · value. */
function Row({
  label,
  sub,
  value,
  strong,
  muted,
}: {
  label: string;
  sub?: string;
  value: string;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 px-5 py-3 sm:px-6 ${
        muted ? "bg-surface-muted" : ""
      }`}
    >
      <div>
        <span className={`text-sm ${strong ? "font-semibold text-ink" : "text-ink-body"}`}>
          {label}
        </span>
        {sub && <span className="mt-0.5 block text-xs text-muted tabular-nums">{sub}</span>}
      </div>
      <span
        className={`shrink-0 tabular-nums ${
          strong ? "font-display text-sm font-semibold text-ink" : "text-sm font-medium text-ink"
        }`}
      >
        {value}
      </span>
    </div>
  );
}

function ResultCard({ r }: { r: CgtResult }) {
  const t = useT(cgtMessages);
  const { money, rate } = useFormat();
  const computed = (s: string) => t.computed[s] ?? s;
  const view = r.isLoss
    ? { tag: { text: t.verdict.loss.tag, cls: "bg-navy-900 text-white" }, hero: r.disposalLoss, sub: t.verdict.loss.sub }
    : r.totalTax > 0
      ? { tag: { text: t.verdict.due.tag, cls: "bg-primary-500 text-white" }, hero: r.totalTax, sub: t.verdict.due.sub.replace("{rate}", rate(r.effectiveRatePercent)) }
      : { tag: { text: t.verdict.none.tag, cls: "border border-line bg-surface-muted text-muted" }, hero: 0, sub: t.verdict.none.sub };

  return (
    <div className="border border-line bg-surface">
      <div className="border-b border-line px-5 py-5 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t.heading}
          </p>
          <span
            className={`rounded-none px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${view.tag.cls}`}
          >
            {view.tag.text}
          </span>
        </div>
        <p className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
          {money(view.hero)}
        </p>
        <p className="mt-2.5 text-sm text-muted">{view.sub}</p>
        {r.bands.length > 0 && (
          <div className="mt-4">
            <ProportionBar
              segments={[
                { label: t.barTax.replace("{amount}", money(r.totalTax)), value: r.totalTax, className: "bg-primary-500" },
                {
                  label: t.barKept.replace("{amount}", money(Math.max(0, r.taxableGain - r.totalTax))),
                  value: Math.max(0, r.taxableGain - r.totalTax),
                  className: "bg-navy-900",
                },
              ]}
            />
          </div>
        )}
      </div>

      <dl className="divide-y divide-line">
        <Row label={t.proceeds} value={money(r.proceeds)} />
        <Row
          label={t.lessCost}
          sub={
            r.indexedAcquisition !== r.acquisitionCost || r.indexedEnhancement !== r.enhancementCost
              ? t.inclIndexation
              : undefined
          }
          value={`− ${money(r.allowableCost)}`}
        />
        <Row label={r.rawGain < 0 ? t.loss : t.gain} value={money(r.rawGain)} strong />
        {r.pprRelief > 0 && (
          <Row label={t.lessPpr} sub={t.pprSub.replace("{percent}", rate(r.exemptFractionPercent))} value={`− ${money(r.pprRelief)}`} />
        )}
        {r.lossesApplied > 0 && <Row label={t.lessLosses} value={`− ${money(r.lossesApplied)}`} />}
        {r.exemptionApplied > 0 && (
          <Row label={t.lessExemption} value={`− ${money(r.exemptionApplied)}`} />
        )}
        <Row label={t.taxable} value={money(r.taxableGain)} strong />
        {r.bands.map((b) => (
          <Row
            key={b.label}
            label={computed(b.label)}
            sub={`${money(b.amount)} × ${rate(b.ratePercent)}`}
            value={money(b.tax)}
          />
        ))}
        <Row label={t.total} value={money(r.totalTax)} strong muted />
        {r.lossCarried > 0 && (
          <Row label={t.carried} value={money(r.lossCarried)} />
        )}
        {r.paymentDue && <Row label={t.paymentDue} value={computed(r.paymentDue)} />}
      </dl>
    </div>
  );
}

export function IrelandCgtCalculator({
  config,
  multipliers,
}: {
  config: CgtConfig;
  multipliers: CgtMultiplier[];
}) {
  const t = useT(cgtMessages);
  const { money, rate } = useFormat();
  const mult = useMultiplier();
  const [proceeds, setProceeds] = useState(0);
  const [disposalCosts, setDisposalCosts] = useState(0);
  const [acquisitionCost, setAcquisitionCost] = useState(0);
  const [acqYearKey, setAcqYearKey] = useState("none");
  const [disposalMonth, setDisposalMonth] = useState("");

  const [showEnhancement, setShowEnhancement] = useState(false);
  const [enhancementCost, setEnhancementCost] = useState(0);
  const [enhYearKey, setEnhYearKey] = useState("none");

  const [showLosses, setShowLosses] = useState(false);
  const [currentYearLosses, setCurrentYearLosses] = useState(0);
  const [broughtForwardLosses, setBroughtForwardLosses] = useState(0);

  const [showRelief, setShowRelief] = useState(false);
  const [rateMode, setRateMode] = useState<RateMode>("standard");
  const [entrepreneurUsed, setEntrepreneurUsed] = useState(0);

  const [showPpr, setShowPpr] = useState(false);
  const [monthsOwned, setMonthsOwned] = useState(0);
  const [monthsOccupied, setMonthsOccupied] = useState(0);

  const multMap = useMemo(
    () => new Map(multipliers.map((m) => [m.yearKey, m.multiplier])),
    [multipliers],
  );
  const acqMult = acqYearKey === "none" ? 1 : multMap.get(acqYearKey) ?? 1;
  const enhMult = enhYearKey === "none" ? 1 : multMap.get(enhYearKey) ?? 1;

  const r = useMemo(
    () =>
      computeCgt(
        {
          proceeds,
          disposalCosts,
          acquisitionCost,
          acquisitionMultiplier: acqMult,
          enhancementCost: showEnhancement ? enhancementCost : 0,
          enhancementMultiplier: showEnhancement ? enhMult : 1,
          currentYearLosses: showLosses ? currentYearLosses : 0,
          broughtForwardLosses: showLosses ? broughtForwardLosses : 0,
          applyExemption: true,
          ppr: showPpr ? { monthsOwned, monthsOccupied } : undefined,
          rateMode: showRelief ? rateMode : "standard",
          entrepreneurReliefUsedEur: entrepreneurUsed,
          disposalMonth: disposalMonth ? Number(disposalMonth) : undefined,
        },
        config,
      ),
    [
      proceeds, disposalCosts, acquisitionCost, acqMult, showEnhancement, enhancementCost,
      enhMult, showLosses, currentYearLosses, broughtForwardLosses, showPpr, monthsOwned,
      monthsOccupied, showRelief, rateMode, entrepreneurUsed, disposalMonth, config,
    ],
  );

  const rateOptions: { value: RateMode; label: string }[] = [
    { value: "standard", label: t.rates.standard.replace("{rate}", rate(config.standardRatePercent)) },
    { value: "entrepreneur", label: t.rates.entrepreneur.replace("{rate}", rate(config.entrepreneurRatePercent)) },
    { value: "rate40", label: t.rates.rate40.replace("{rate}", rate(40)) },
    { value: "rate15", label: t.rates.rate15.replace("{rate}", rate(15)) },
  ];

  const yearOptions = (
    <>
      <option value="none">{t.noIndexation}</option>
      {multipliers.map((m) => (
        <option key={m.yearKey} value={m.yearKey}>
          {t.computed[m.yearLabel] ?? m.yearLabel} (×{mult(m.multiplier)})
        </option>
      ))}
    </>
  );

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* inputs */}
      <div className="flex flex-col gap-5">
        <div className="border-s-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
          <span className="font-semibold text-ink">{t.introTitle}</span> {t.introBody}
        </div>

        <CurrencyField
          label={t.proceeds}
          value={proceeds}
          onChange={setProceeds}
          hint={t.proceedsHint}
        />
        <CurrencyField
          label={t.sellingCosts}
          value={disposalCosts}
          onChange={setDisposalCosts}
          hint={t.sellingCostsHint}
        />
        <CurrencyField
          label={t.acquisition}
          value={acquisitionCost}
          onChange={setAcquisitionCost}
          hint={t.acquisitionHint}
        />
        <SelectField
          label={t.acqYear}
          value={acqYearKey}
          onChange={setAcqYearKey}
          hint={t.acqYearHint}
        >
          {yearOptions}
        </SelectField>

        {acquisitionCost > 0 && acqMult !== 1 && (
          <div className="border border-line bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
            {fill(t.indexedCost, {
              cost: money(acquisitionCost),
              multiplier: mult(acqMult),
              indexed: <span className="font-semibold text-ink tabular-nums">{money(r.indexedAcquisition)}</span>,
            })}
          </div>
        )}

        <SelectField
          label={t.saleMonth}
          value={disposalMonth}
          onChange={setDisposalMonth}
          hint={t.saleMonthHint}
        >
          <option value="">{t.selectMonth}</option>
          {t.months.map((m, i) => (
            <option key={m} value={String(i + 1)}>
              {m}
            </option>
          ))}
        </SelectField>

        {/* optional sections */}
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <SectionToggle label={t.enhancementToggle} checked={showEnhancement} onChange={setShowEnhancement} />
          {showEnhancement && (
            <div className="flex flex-col gap-4 border-s-[3px] border-line ps-4">
              <CurrencyField
                label={t.enhancement}
                value={enhancementCost}
                onChange={setEnhancementCost}
                hint={t.enhancementHint}
              />
              <SelectField label={t.enhancementYear} value={enhYearKey} onChange={setEnhYearKey}>
                {yearOptions}
              </SelectField>
            </div>
          )}

          <SectionToggle label={t.lossesToggle} checked={showLosses} onChange={setShowLosses} />
          {showLosses && (
            <div className="flex flex-col gap-4 border-s-[3px] border-line ps-4">
              <CurrencyField
                label={t.lossesThisYear}
                value={currentYearLosses}
                onChange={setCurrentYearLosses}
                hint={t.lossesThisYearHint}
              />
              <CurrencyField
                label={t.lossesForward}
                value={broughtForwardLosses}
                onChange={setBroughtForwardLosses}
                hint={t.lossesForwardHint}
              />
            </div>
          )}

          <SectionToggle label={t.reliefToggle} checked={showRelief} onChange={setShowRelief} />
          {showRelief && (
            <div className="flex flex-col gap-4 border-s-[3px] border-line ps-4">
              <SegmentedField<RateMode> label={t.rate} value={rateMode} onChange={setRateMode} options={rateOptions} />
              {rateMode === "entrepreneur" && (
                <CurrencyField
                  label={t.entrepreneurUsed}
                  value={entrepreneurUsed}
                  onChange={setEntrepreneurUsed}
                  hint={t.entrepreneurUsedHint
                    .replace("{relief}", rate(config.entrepreneurRatePercent))
                    .replace("{cap}", money(config.entrepreneurLifetimeCapEur))
                    .replace("{standard}", rate(config.standardRatePercent))}
                />
              )}
            </div>
          )}

          <SectionToggle label={t.pprToggle} checked={showPpr} onChange={setShowPpr} />
          {showPpr && (
            <div className="flex flex-col gap-4 border-s-[3px] border-line ps-4">
              <NumericField
                label={t.monthsOwned}
                value={monthsOwned}
                onChange={setMonthsOwned}
                hint={t.monthsOwnedHint}
              />
              <NumericField
                label={t.monthsOccupied}
                value={monthsOccupied}
                onChange={setMonthsOccupied}
                hint={t.monthsOccupiedHint}
              />
            </div>
          )}
        </div>
      </div>

      {/* results */}
      <div className="flex flex-col">
        <ResultCard r={r} />
        <ResultDisclaimer asOf={CGT_LAST_REVIEWED} sourceUrl={CGT_SOURCE_URL} />
      </div>
    </div>
  );
}
