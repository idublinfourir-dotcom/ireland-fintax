"use client";

/* Deloitte-Ireland-style Income Tax Calculator (Income Tax + USC + PRSI).
   Form → "Calculate Tax" → results screen (current year vs prior year, 2026 vs
   2025 unless the page says otherwise), in the site theme.
   All maths lives in ../lib/ireland-income-tax. Tax only — no mortgage here. */

import { useEffect, useId, useRef, useState } from "react";
import {
  compareYears,
  RATES_BY_YEAR,
  type IncomeTaxInput,
  type IncomeTaxResult,
  type YearComparison,
  type YearRates,
} from "../lib/ireland-income-tax";
import { useT } from "./locale-link";
import { incomeTaxMessages, type IncomeTaxMessages } from "../lib/messages/income-tax";
import { useFormat } from "./calculator-fields";

/* Money in the results table: whole euros (rounded like Deloitte) shown as .00.
   Negatives come out as "-€4,987.00"; deduction rows wrap in parentheses. */
function useMoney() {
  const { money } = useFormat();
  return (n: number) => money(Math.round(n));
}

/* A rate held as a fraction (0.2) in the page's language: 20% / 20 %. */
function useRateLabel() {
  const { rate } = useFormat();
  return (fraction: number) => rate(+(fraction * 100).toFixed(4));
}

/* ---------- button styles (match app/components/ui.tsx Button) ---------- */

const btnBase =
  "inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-none px-7 text-sm font-semibold tracking-wide transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2";
const btnPrimary = `${btnBase} bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-primary-500`;
const btnOutline = `${btnBase} border border-ink/20 text-ink hover:border-ink/40 hover:bg-ink/5 focus-visible:outline-ink/40`;

/* ---------- inputs ---------- */

function SegmentedField<T extends string>({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: string }[];
}) {
  return (
    <div>
      <span className="block text-sm font-medium text-ink">{label}</span>
      <div
        role="radiogroup"
        aria-label={label}
        className="mt-1.5 flex flex-wrap gap-1.5 rounded-none border border-line bg-surface-muted p-1"
      >
        {options.map((opt) => {
          const active = opt.value === value;
          return (
            <button
              key={opt.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(opt.value)}
              className={`flex-1 cursor-pointer rounded-none px-3 py-1.5 text-xs font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                active ? "bg-primary-500 text-white" : "text-ink hover:bg-surface"
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function YesNoField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  const t = useT(incomeTaxMessages);
  return (
    <SegmentedField<"yes" | "no">
      label={label}
      value={value ? "yes" : "no"}
      onChange={(v) => onChange(v === "yes")}
      options={[
        { value: "yes", label: t.yes },
        { value: "no", label: t.no },
      ]}
    />
  );
}

/* Numeric field with a local text buffer. Echoing String(parsedNumber) straight
   back into a controlled <input type="number"> destroys decimal entry: "5." is
   sanitised to "" mid-keystroke, "5.50" snaps back to "5.5" and moves the
   cursor, and a leading 0 renders as empty — so a user typing 5.5 could end up
   with 55. The buffer holds exactly what was typed; the parent only receives
   the parsed number, and the buffer re-syncs only when the parent value is
   changed externally (e.g. Clear Form). */
function useNumericText(value: number, onChange: (n: number) => void) {
  const [text, setText] = useState(value ? String(value) : "");
  const [prevValue, setPrevValue] = useState(value);
  if (value !== prevValue) {
    setPrevValue(value);
    const parsed = text === "" ? 0 : Number(text);
    if (parsed !== value) setText(value ? String(value) : "");
  }
  const handleChange = (raw: string) => {
    setText(raw);
    const n = raw === "" ? 0 : Number(raw);
    onChange(Number.isFinite(n) ? n : 0);
  };
  return { text, handleChange };
}

function CurrencyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: string;
}) {
  const id = useId();
  const { text, handleChange } = useNumericText(value, onChange);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute inset-s-3 top-1/2 -translate-y-1/2 text-sm text-muted">
          €
        </span>
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          step="any"
          placeholder="0"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          className="h-11 w-full rounded-none border border-line bg-surface ps-7 pe-3 text-sm text-ink tabular-nums transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        />
      </div>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

function NumberField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
}) {
  const id = useId();
  const { text, handleChange } = useNumericText(value, onChange);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <input
        id={id}
        type="number"
        inputMode="decimal"
        min={0}
        max={120}
        step="any"
        placeholder="0"
        value={text}
        onChange={(e) => handleChange(e.target.value)}
        className="mt-1.5 h-11 w-full rounded-none border border-line bg-surface px-3 text-sm text-ink tabular-nums transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
      />
    </div>
  );
}

/* ---------- results table ---------- */

type RowVariant = "default" | "emphasis" | "net";

interface RowDef {
  label: string;
  rate?: string;
  value: (r: IncomeTaxResult) => number;
  deduct?: boolean;
  variant?: RowVariant;
  /** Row only shown when the calculation includes a spouse income. */
  spouseOnly?: boolean;
  /** Row hidden when it is zero in both years. */
  hideIfZero?: boolean;
}

const buildRows = (
  rates: YearRates,
  t: IncomeTaxMessages["rows"],
  rateLabel: (fraction: number) => string,
): RowDef[] => [
  { label: t.total, value: (r) => r.grossIncome },
  { label: t.yours, value: (r) => r.yourIncome },
  { label: t.spouse, value: (r) => r.spouseIncome, spouseOnly: true },
  { label: t.pension, value: (r) => r.pension.qualifying, deduct: true },
  {
    label: t.lower,
    rate: rateLabel(rates.incomeTax.standardRate),
    value: (r) => r.incomeTax.taxAtStandard,
  },
  {
    label: t.higher,
    rate: rateLabel(rates.incomeTax.higherRate),
    value: (r) => r.incomeTax.taxAtHigher,
  },
  { label: t.credits, value: (r) => r.incomeTax.totalCredits, deduct: true },
  { label: t.netTax, value: (r) => r.incomeTax.netTax, deduct: true, variant: "emphasis" },
  { label: t.usc, value: (r) => r.usc.total + r.spouseUsc.total, deduct: true },
  {
    label: t.beforePrsi,
    value: (r) => r.netIncomeBeforePrsi,
    variant: "emphasis",
  },
  { label: t.prsi, value: (r) => r.prsi.total + r.spousePrsi.total, deduct: true },
  { label: t.autoEnrolment, value: (r) => r.autoEnrolment, deduct: true, hideIfZero: true },
  { label: t.annual, value: (r) => r.netIncome, variant: "net" },
  { label: t.monthly, value: (r) => r.monthlyNetIncome, variant: "net" },
  { label: t.weekly, value: (r) => r.weeklyNetIncome, variant: "net" },
];

function AmountCell({ row, r }: { row: RowDef; r: IncomeTaxResult }) {
  const money = useMoney();
  const text = row.deduct ? `(${money(row.value(r))})` : money(row.value(r));
  return (
    <td className="px-4 py-2.5 text-end tabular-nums text-ink">
      {row.rate && <span className="me-3 text-xs text-muted">({row.rate})</span>}
      {text}
    </td>
  );
}

function ResultsTable({
  comparison,
  rates,
  currentYear,
  priorYear,
}: {
  comparison: YearComparison;
  rates: YearRates;
  currentYear: number;
  priorYear: number;
}) {
  const { current, prior, delta } = comparison;
  const t = useT(incomeTaxMessages);
  const money = useMoney();
  const ROWS = buildRows(rates, t.rows, useRateLabel()).filter(
    (row) =>
      (!row.spouseOnly || current.spouseIncome > 0) &&
      (!row.hideIfZero || row.value(current) > 0 || row.value(prior) > 0),
  );
  const rowBg = (variant: RowVariant | undefined, i: number) => {
    if (variant === "net") return "bg-primary-50 font-semibold";
    if (variant === "emphasis") return "bg-surface-muted font-medium";
    return i % 2 === 0 ? "bg-surface" : "bg-surface-muted/50";
  };

  return (
    <div>
      <div className="overflow-x-auto border border-line">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="bg-surface-muted">
              <th className="px-4 py-3 text-start font-semibold text-muted" />
              <th className="px-4 py-3 text-end font-display text-base font-semibold text-primary-600">
                {currentYear}
              </th>
              <th className="px-4 py-3 text-end font-display text-base font-semibold text-ink">
                {priorYear}
              </th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => (
              <tr key={row.label} className={rowBg(row.variant, i)}>
                <td className="px-4 py-2.5 text-start text-ink">{row.label}</td>
                <AmountCell row={row} r={current} />
                <AmountCell row={row} r={prior} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* difference block */}
      <div className="mt-8">
        <h3 className="text-center font-display text-base font-medium text-ink">
          {t.difference.replace("{current}", String(currentYear)).replace("{prior}", String(priorYear))}
        </h3>
        <dl className="mx-auto mt-4 max-w-xl">
          {[
            { label: t.rows.annual, v: delta.annual },
            { label: t.rows.monthly, v: delta.monthly },
            { label: t.rows.weekly, v: delta.weekly },
          ].map((d) => (
            <div
              key={d.label}
              className="flex items-baseline justify-between gap-4 border-t border-line py-3"
            >
              <dt className="text-sm text-muted">{d.label}</dt>
              <dd
                className={`font-display text-base font-semibold tabular-nums ${
                  d.v >= 0 ? "text-primary-600" : "text-secondary-600"
                }`}
              >
                {money(d.v)}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}

/* ---------- calculator (form + results) ---------- */

const DEFAULTS: IncomeTaxInput = {
  maritalStatus: "single",
  hasChildOnChildBenefit: false,
  isPrincipalCarerOfDependentChild: false,
  age: 0,
  employmentIncome: 0,
  selfEmploymentOrOtherIncome: 0,
  pensionContribution: 0,
  spouseEmploymentIncome: 0,
  spouseSelfEmploymentOrOtherIncome: 0,
  rentPaid: 0,
  claimHomeCarerCredit: false,
};

export function IrelandIncomeTaxCalculator({
  ratesByYear = RATES_BY_YEAR,
  currentYear = 2026,
  priorYear = 2025,
  initialInput,
}: {
  /** Admin-managed per-year rates from the DB (tax-data.ts); static fallback. */
  ratesByYear?: Record<number, YearRates>;
  /** The two tax years compared. Both must have rates in `ratesByYear`. */
  currentYear?: number;
  priorYear?: number;
  /** Starts filled in and calculated with these figures (the Budget page
      hands over the visitor's own). */
  initialInput?: IncomeTaxInput;
}) {
  const t = useT(incomeTaxMessages);
  const { eur0 } = useFormat();
  const rateLabel = useRateLabel();
  const [form, setForm] = useState<IncomeTaxInput>(() => ({ ...DEFAULTS, ...initialInput }));
  const [result, setResult] = useState<YearComparison | null>(() =>
    initialInput ? compareYears(form, currentYear, priorYear, ratesByYear) : null,
  );
  const resultsRef = useRef<HTMLDivElement>(null);

  // After results render, bring the results section into view (not the page top).
  useEffect(() => {
    // Smooth or instant follows globals.css, which honours reduced motion.
    if (result) resultsRef.current?.scrollIntoView({ block: "start" });
  }, [result]);

  const set = <K extends keyof IncomeTaxInput>(key: K, value: IncomeTaxInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const calculate = () => {
    setResult(compareYears(form, currentYear, priorYear, ratesByYear));
  };

  const newCalculation = () => {
    setForm(DEFAULTS);
    setResult(null);
  };

  if (result) {
    return (
      <div ref={resultsRef} className="scroll-mt-24">
        <ResultsTable
          comparison={result}
          rates={ratesByYear[currentYear]}
          currentYear={currentYear}
          priorYear={priorYear}
        />
        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button type="button" className={btnOutline} onClick={() => setResult(null)}>
            {t.goBack}
          </button>
          <button type="button" className={btnPrimary} onClick={newCalculation}>
            {t.newCalc}
          </button>
        </div>
        <p className="mt-8 text-center text-xs leading-5 text-muted">
          {t.footnote
            .replace("{currentRate}", rateLabel(ratesByYear[currentYear].prsi.rate))
            .replace("{current}", String(currentYear))
            .replace("{priorRate}", rateLabel(ratesByYear[priorYear].prsi.rate))
            .replace("{prior}", String(priorYear))}
        </p>
      </div>
    );
  }

  return (
    <form
      className="mx-auto max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        calculate();
      }}
    >
      <div className="flex flex-col gap-5">
        <h3 className="font-display text-lg font-medium text-ink">{t.status}</h3>
        <SegmentedField
          label={t.marital}
          value={form.maritalStatus}
          onChange={(v) => set("maritalStatus", v)}
          options={[
            { value: "single", label: t.single },
            { value: "married", label: t.married },
            { value: "widowed", label: t.widowed },
          ]}
        />
        <YesNoField
          label={t.childBenefit}
          value={form.hasChildOnChildBenefit}
          onChange={(v) => set("hasChildOnChildBenefit", v)}
        />
        <YesNoField
          label={t.principalCarer}
          value={form.isPrincipalCarerOfDependentChild}
          onChange={(v) => set("isPrincipalCarerOfDependentChild", v)}
        />
        <NumberField
          label={t.age.replace("{current}", String(currentYear))}
          value={form.age}
          onChange={(v) => set("age", v)}
        />

        <h3 className="mt-4 font-display text-lg font-medium text-ink">
          {t.income}
        </h3>
        <CurrencyField
          label={t.employment}
          value={form.employmentIncome}
          onChange={(v) => set("employmentIncome", v)}
        />
        <CurrencyField
          label={t.selfEmployment}
          value={form.selfEmploymentOrOtherIncome}
          onChange={(v) => set("selfEmploymentOrOtherIncome", v)}
        />

        {form.maritalStatus === "married" && (
          <>
            <h3 className="mt-4 font-display text-lg font-medium text-ink">
              {t.spouseHeading}
            </h3>
            <CurrencyField
              label={t.spouseEmployment}
              value={form.spouseEmploymentIncome ?? 0}
              onChange={(v) => set("spouseEmploymentIncome", v)}
            />
            <CurrencyField
              label={t.spouseSelf}
              value={form.spouseSelfEmploymentOrOtherIncome ?? 0}
              onChange={(v) => set("spouseSelfEmploymentOrOtherIncome", v)}
              hint={t.spouseHint.replace("{amount}", eur0(ratesByYear[currentYear].incomeTax.srcop.marriedBandIncrease))}
            />
            <YesNoField
              label={t.homeCarer}
              value={form.claimHomeCarerCredit ?? false}
              onChange={(v) => set("claimHomeCarerCredit", v)}
            />
          </>
        )}

        <CurrencyField
          label={t.rent}
          value={form.rentPaid ?? 0}
          onChange={(v) => set("rentPaid", v)}
          hint={t.rentHint}
        />

        <CurrencyField
          label={t.pensionContribution}
          value={form.pensionContribution}
          onChange={(v) => set("pensionContribution", v)}
          hint={t.pensionHint}
        />
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <button type="submit" className={btnPrimary}>
          {t.calculate}
        </button>
        <button type="button" className={btnOutline} onClick={newCalculation}>
          {t.clear}
        </button>
      </div>
    </form>
  );
}
