"use client";

/* mortgages.ie-style mortgage payments calculator, in the site theme.
   Three steps: 1) Mortgage → 2) Applicants → 3) Results (lender comparison).
   All maths and the lender-rate snapshot live in ../lib/ireland-mortgage. */

import { useEffect, useId, useRef, useState } from "react";
import Link from "./locale-link";
import {
  PRODUCT_TYPES,
  compareProducts,
  maxTermFor,
  type ComparisonResult,
  type LenderProduct,
  type MortgageNotice,
  type MortgagePolicy,
  type ProductQuote,
  type ProductType,
  type RateType,
} from "../lib/ireland-mortgage";
import { useT } from "./locale-link";
import { mortgageMessages, type MortgageMessages } from "../lib/messages/mortgage";
import { useFormat } from "./calculator-fields";
import { localDate, numberFormat, plural } from "../lib/i18n";
import { fill } from "./ui";

/* Monthly payments match mortgages.ie to the cent, so show cents. Rates keep
   two decimals unless whole: 4.50% / 4,50 % / 4%. */
function useMortgageFormat() {
  const { money, eur0, locale, rate } = useFormat();
  const pct = (n: number) => {
    const d = n % 1 === 0 ? 0 : 2;
    return numberFormat(locale, { style: "percent", minimumFractionDigits: d, maximumFractionDigits: d }).format(n / 100);
  };
  return { money, moneyWhole: (n: number) => eur0(Math.round(n)), pct, rate, locale };
}

/* A product's name in the page's language when it follows the usual
   patterns ("5 Year Fixed", "Buy-to-Let Variable"); otherwise as stored. */
function translateProductName(name: string, t: MortgageMessages["products"]): string {
  const one = (n: string): string | null => {
    const fixed = /^(\d+) Year Fixed( Green)?$/.exec(n);
    if (fixed) return t.yearFixed.replace("{n}", fixed[1]) + (fixed[2] ? ` (${t.green})` : "");
    if (n === "Full-term Fixed") return t.fullTerm;
    if (n === "Standard Variable") return t.standardVariable;
    if (n === "Variable") return t.variable;
    return null;
  };
  const btl = /^Buy-to-Let (.+)$/.exec(name);
  if (btl) {
    const inner = one(btl[1]);
    return inner ? t.buyToLet.replace("{name}", inner) : name;
  }
  return one(name) ?? name;
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
                active ? "bg-surface text-ink shadow-sm" : "text-muted hover:text-ink"
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

/* Numeric field with a local text buffer. Echoing String(parsedNumber) straight
   back into a controlled <input type="number"> destroys decimal entry: "5." is
   sanitised to "" mid-keystroke, "5.50" snaps back to "5.5" and moves the
   cursor, and a leading 0 renders as empty — so a user typing 5.5 could end up
   with 55. The buffer holds exactly what was typed; the parent only receives
   the parsed number, and the buffer re-syncs only when the parent value is
   changed externally (e.g. New Calculation). */
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
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
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
          className="h-11 w-full rounded-none border border-line bg-surface pl-7 pr-3 text-sm text-ink tabular-nums transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
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
  suffix,
  max = 120,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  suffix?: string;
  max?: number;
}) {
  const id = useId();
  const { text, handleChange } = useNumericText(value, onChange);
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <input
          id={id}
          type="number"
          inputMode="decimal"
          min={0}
          max={max}
          step="any"
          placeholder="0"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          className="h-11 w-full rounded-none border border-line bg-surface px-3 pr-14 text-sm text-ink tabular-nums transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        />
        {suffix && (
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

/* ---------- step indicator ---------- */

function StepIndicator({ current }: { current: number }) {
  const STEPS = useT(mortgageMessages).steps;
  return (
    <div className="mx-auto flex max-w-sm items-start">
      {STEPS.map((label, i) => {
        const stepNo = i + 1;
        const done = stepNo < current;
        const active = stepNo === current;
        return (
          <div key={label} className="flex flex-1 items-start last:flex-none">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-10 w-10 items-center justify-center rounded-full border text-sm font-semibold transition-colors duration-200 ${
                  done
                    ? "border-secondary-500 bg-secondary-500 text-white"
                    : active
                      ? "border-primary-500 bg-primary-500 text-white"
                      : "border-line bg-surface text-muted"
                }`}
                aria-current={active ? "step" : undefined}
              >
                {done ? "✓" : stepNo}
              </div>
              <span
                className={`mt-1.5 text-xs font-medium ${
                  active ? "text-ink" : "text-muted"
                }`}
              >
                {label}
              </span>
            </div>
            {stepNo < STEPS.length && (
              <div
                className={`mt-5 h-px flex-1 ${done ? "bg-secondary-500" : "bg-line"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ---------- results ---------- */

function QuoteList({
  result,
  termYears,
}: {
  result: ComparisonResult;
  termYears: number;
}) {
  const t = useT(mortgageMessages);
  const [tab, setTab] = useState<"all" | RateType>("all");
  const quotes =
    tab === "all"
      ? result.quotes
      : result.quotes.filter((q) => q.product.rateType === tab);

  const tabClass = (active: boolean) =>
    `cursor-pointer whitespace-nowrap rounded-none border px-3 py-1.5 text-xs font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
      active
        ? "border-primary-500 bg-primary-500 text-white"
        : "border-line bg-surface text-muted hover:text-ink"
    }`;

  return (
    <div>
      <div className="flex flex-wrap gap-1.5" role="tablist" aria-label={t.rateTypeLabel}>
        <button
          type="button"
          role="tab"
          aria-selected={tab === "all"}
          onClick={() => setTab("all")}
          className={tabClass(tab === "all")}
        >
          {t.all}
        </button>
        {result.availableRateTypes.map((rt) => (
          <button
            key={rt}
            type="button"
            role="tab"
            aria-selected={tab === rt}
            onClick={() => setTab(rt)}
            className={tabClass(tab === rt)}
          >
            {t.rateTypes[rt]}
          </button>
        ))}
      </div>

      <div className="mt-4 border-t border-line">
        {quotes.length === 0 && (
          <p className="py-8 text-center text-sm text-muted">
            {t.noProducts}
          </p>
        )}
        {quotes.map((q) => (
          <QuoteCard key={q.product.id} quote={q} />
        ))}
      </div>

      {quotes.length > 0 && (
        <p className="mt-3 text-xs text-muted">
          {t.termNote.replace("{years}", String(termYears))}
        </p>
      )}
    </div>
  );
}

function QuoteCard({ quote }: { quote: ProductQuote }) {
  const { product, monthly, totalRepayable, totalInterest, phases, cashbackValue } =
    quote;
  const [open, setOpen] = useState(false);
  const t = useT(mortgageMessages);
  const { money, moneyWhole, pct, rate, locale } = useMortgageFormat();
  const years = (n: number) => plural(locale, n, t.years);
  const cashbackRate = /^(\d+(?:\.\d+)?)% cashback$/i.exec(product.cashback ?? "");
  const detailsId = useId();
  const twoPhase = phases.length > 1;

  return (
    <div className="border-b border-line py-5">
      <div className="flex flex-col gap-4 sm:grid sm:grid-cols-[1.4fr_1fr_1fr_auto] sm:items-center">
        {/* lender + product */}
        <div>
          <p className="text-sm font-semibold text-ink">{product.lender}</p>
          <p className="mt-0.5 text-sm text-muted">{translateProductName(product.name, t.products)}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5">
            {product.green && (
              <span className="rounded-none bg-secondary-50 px-2 py-0.5 text-[11px] font-semibold text-secondary-600">
                {t.greenMortgage}
              </span>
            )}
            {product.cashback && (
              <span className="rounded-none bg-primary-50 px-2 py-0.5 text-[11px] font-semibold text-primary-600">
                {cashbackRate
                  ? t.products.cashback.replace("{rate}", rate(Number(cashbackRate[1])))
                  : product.cashback}
              </span>
            )}
          </div>
        </div>

        {/* monthly */}
        <div className="sm:text-center">
          <p className="font-display text-xl font-semibold tabular-nums text-ink">
            {money(monthly)}
          </p>
          <p className="text-xs text-muted">
            {twoPhase ? t.monthlyFirst.replace("{years}", String(phases[0].years)) : t.monthly}
          </p>
        </div>

        {/* rate + APRC */}
        <div className="sm:text-center">
          <p className="text-base font-semibold tabular-nums text-ink">
            {pct(product.ratePercent)}
          </p>
          <p className="text-xs text-muted">
            {t.rateAprc.replace("{aprc}", rate(product.aprcPercent))}
          </p>
        </div>

        {/* CTA + details toggle */}
        <div className="flex items-center gap-4 sm:flex-col sm:items-end sm:gap-2 sm:justify-self-end">
          <Link href="/contact" className={`${btnPrimary} !h-10 !px-5 !text-xs`}>
            {t.ask}
          </Link>
          <button
            type="button"
            aria-expanded={open}
            aria-controls={detailsId}
            onClick={() => setOpen((o) => !o)}
            className="cursor-pointer text-xs font-medium text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            {open ? t.hide : t.see}
          </button>
        </div>
      </div>

      {open && (
        <div
          id={detailsId}
          className="mt-4 rounded-none border border-line bg-surface-muted p-4"
        >
          <div className="flex flex-col gap-1">
            {phases.map((p, i) => (
              <p key={i} className="text-sm text-ink">
                {fill(t.phase, {
                  years: years(p.years),
                  amount: <strong className="tabular-nums">{money(p.monthly)}</strong>,
                })}{" "}
                <span className="text-muted">
                  {t.phaseRate
                    .replace("{rate}", pct(p.ratePercent))
                    .replace("{kind}", twoPhase ? (i === 0 ? t.fixed : t.variableKind) : t.interest)}
                </span>
              </p>
            ))}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            <div>
              <p className="text-xs text-muted">{t.totalCost}</p>
              <p className="text-sm font-semibold tabular-nums text-ink">
                {moneyWhole(totalRepayable)}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted">{t.totalInterest}</p>
              <p className="text-sm font-semibold tabular-nums text-ink">
                {moneyWhole(totalInterest)}
              </p>
            </div>
            {cashbackValue > 0 && (
              <div>
                <p className="text-xs text-muted">{t.cashbackLabel}</p>
                <p className="text-sm font-semibold tabular-nums text-secondary-600">
                  {moneyWhole(cashbackValue)}
                </p>
              </div>
            )}
          </div>

          {product.details && (
            <p className="mt-3 text-xs leading-5 text-muted">{product.details}</p>
          )}
        </div>
      )}
    </div>
  );
}

/* ---------- calculator (wizard) ---------- */

interface FormState {
  productType: ProductType;
  propertyValue: number;
  loanAmount: number;
  termYears: number;
  /** Green-mortgage rates need a Building Energy Rating of B3 or better. */
  ber: "b3plus" | "below";
  application: "single" | "joint";
  age1: number;
  income1: number;
  age2: number;
  income2: number;
}

const DEFAULTS: FormState = {
  productType: "first-time",
  propertyValue: 300_000,
  loanAmount: 200_000,
  termYears: 30,
  ber: "b3plus",
  application: "single",
  age1: 30,
  income1: 0,
  age2: 0,
  income2: 0,
};

export function IrelandMortgageCalculator({
  products,
  policy,
  ratesAsOf,
}: {
  products: LenderProduct[];
  policy: MortgagePolicy;
  ratesAsOf: string;
}) {
  const t = useT(mortgageMessages);
  const { moneyWhole, rate, locale } = useMortgageFormat();
  const ltvFmt = numberFormat(locale, { style: "percent", maximumFractionDigits: 1 });
  const notice = (n: MortgageNotice): string => {
    switch (n.kind) {
      case "ltv":
        return t.notices.ltv
          .replace("{ltv}", ltvFmt.format(n.ltv))
          .replace("{max}", rate(n.maxLtvPercent))
          .replace("{deposit}", moneyWhole(n.deposit));
      case "lti":
        return t.notices.lti
          .replace("{loan}", moneyWhole(n.loan))
          .replace("{multiple}", String(n.multiple))
          .replace("{maxLoan}", moneyWhole(n.maxLoan));
      case "term":
        return (n.investment ? t.notices.termInvestment : t.notices.termResidential)
          .replace("{term}", String(n.termYears))
          .replace("{max}", String(n.maxTerm));
      case "age":
        return t.notices.age
          .replace("{term}", String(n.termYears))
          .replaceAll("{maxAge}", String(n.maxAgeAtEnd))
          .replace("{years}", String(n.yearsLeft));
    }
  };
  const [form, setForm] = useState<FormState>(DEFAULTS);
  const [step, setStep] = useState(1);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  // After results render, bring the results section into view (not the page top).
  useEffect(() => {
    if (step === 3 && result) {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [step, result]);

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const maxTerm = maxTermFor(policy, form.productType);

  const goToStep2 = () => {
    if (form.propertyValue <= 0) return setError(t.errors.value);
    if (form.loanAmount <= 0) return setError(t.errors.borrow);
    if (form.loanAmount > form.propertyValue) return setError(t.errors.tooMuch);
    if (form.termYears < 5 || form.termYears > maxTerm)
      return setError(
        (form.productType === "investment" ? t.errors.termInvestment : t.errors.termResidential).replace(
          "{max}",
          String(maxTerm),
        ),
      );
    setError(null);
    setStep(2);
  };

  const calculate = () => {
    if (form.age1 < 18 || form.age1 > 80) return setError(t.errors.age);
    if (form.income1 <= 0) return setError(t.errors.income);
    if (form.application === "joint") {
      if (form.age2 < 18 || form.age2 > 80) return setError(t.errors.age2);
      if (form.income2 <= 0) return setError(t.errors.income2);
    }
    setError(null);

    const joint = form.application === "joint";
    setResult(
      compareProducts(
        {
          productType: form.productType,
          propertyValue: form.propertyValue,
          loanAmount: form.loanAmount,
          termYears: form.termYears,
          age: joint ? Math.max(form.age1, form.age2) : form.age1,
          income: form.income1 + (joint ? form.income2 : 0),
          berB3Plus: form.ber === "b3plus",
        },
        products,
        policy,
      ),
    );
    setStep(3);
  };

  const newCalculation = () => {
    setForm(DEFAULTS);
    setResult(null);
    setError(null);
    setStep(1);
  };

  /* ---------- step 3: results ---------- */

  if (step === 3 && result) {
    return (
      <div ref={resultsRef} className="scroll-mt-24">
        <StepIndicator current={3} />

        {/* requirements summary */}
        <div className="mx-auto mt-8 max-w-2xl rounded-none border border-line bg-surface-muted p-6 text-center">
          <h3 className="font-display text-base font-semibold text-ink">
            {t.requirements}
          </h3>
          <p className="mt-2 text-sm text-ink">
            {t.over.replace("{loan}", moneyWhole(form.loanAmount)).replace("{years}", String(form.termYears))}
          </p>
          <p className="mt-1 text-sm text-ink">
            {t.propertyValue.replace("{value}", moneyWhole(form.propertyValue))}
          </p>
          <p className="mt-1 text-sm text-ink">
            {t.ageLine.replace(
              "{age}",
              String(form.application === "joint" ? Math.max(form.age1, form.age2) : form.age1),
            )}
          </p>
          <button
            type="button"
            onClick={() => {
              setStep(1);
              setError(null);
            }}
            className="mt-3 cursor-pointer text-sm font-medium text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            {t.change}
          </button>
        </div>

        {result.notices.length > 0 && (
          <div className="mx-auto mt-6 max-w-2xl space-y-3">
            {result.notices.map(notice).map((w) => (
              <p
                key={w}
                className="rounded-none border border-primary-400/40 bg-primary-50 px-4 py-3 text-sm leading-6 text-primary-600"
              >
                {w}
              </p>
            ))}
          </div>
        )}

        <div className="mt-10">
          <h3 className="font-display text-lg font-medium text-ink">{t.topResults}</h3>
          <div className="mt-4">
            <QuoteList result={result} termYears={form.termYears} />
          </div>
        </div>

        <div className="mt-10 flex flex-wrap justify-center gap-4">
          <button type="button" className={btnOutline} onClick={() => setStep(2)}>
            {t.goBack}
          </button>
          <button type="button" className={btnPrimary} onClick={newCalculation}>
            {t.newCalc}
          </button>
        </div>

        <p className="mt-8 text-center text-xs leading-5 text-muted">
          {t.footnote.replace("{date}", localDate(locale, ratesAsOf))}
        </p>
      </div>
    );
  }

  /* ---------- steps 1 & 2: form ---------- */

  return (
    <form
      className="mx-auto max-w-xl"
      onSubmit={(e) => {
        e.preventDefault();
        if (step === 1) goToStep2();
        else calculate();
      }}
    >
      <StepIndicator current={step} />

      <div className="mt-8 flex flex-col gap-5">
        {step === 1 ? (
          <>
            <SegmentedField
              label={t.productType}
              value={form.productType}
              onChange={(v) => set("productType", v)}
              options={PRODUCT_TYPES.map((o) => ({ ...o, label: t.productTypes[o.value] }))}
            />
            <CurrencyField
              label={t.homeValue}
              value={form.propertyValue}
              onChange={(v) => set("propertyValue", v)}
            />
            <CurrencyField
              label={t.borrow}
              value={form.loanAmount}
              onChange={(v) => set("loanAmount", v)}
              hint={
                form.propertyValue > 0 && form.loanAmount > 0
                  ? t.ltvHint.replace("{ltv}", ltvFmt.format(form.loanAmount / form.propertyValue))
                  : undefined
              }
            />
            <NumberField
              label={t.term}
              value={form.termYears}
              onChange={(v) => set("termYears", v)}
              suffix={t.yearsSuffix}
              max={maxTerm}
            />
            <div>
              <SegmentedField
                label={t.ber}
                value={form.ber}
                onChange={(v) => set("ber", v)}
                options={[
                  { value: "b3plus", label: t.berPlus },
                  { value: "below", label: t.berBelow },
                ]}
              />
              <p className="mt-1 text-xs text-muted">
                {t.berHint}
              </p>
            </div>
          </>
        ) : (
          <>
            <SegmentedField
              label={t.application}
              value={form.application}
              onChange={(v) => set("application", v)}
              options={[
                { value: "single", label: t.single },
                { value: "joint", label: t.joint },
              ]}
            />

            <h3 className="mt-2 font-display text-sm font-semibold uppercase tracking-wide text-muted">
              {t.applicant}
            </h3>
            <NumberField
              label={t.ageNext}
              value={form.age1}
              onChange={(v) => set("age1", v)}
              suffix={t.yearsSuffix}
              max={80}
            />
            <CurrencyField
              label={t.income}
              value={form.income1}
              onChange={(v) => set("income1", v)}
            />

            {form.application === "joint" && (
              <>
                <h3 className="mt-2 font-display text-sm font-semibold uppercase tracking-wide text-muted">
                  {t.secondApplicant}
                </h3>
                <NumberField
                  label={t.ageNext}
                  value={form.age2}
                  onChange={(v) => set("age2", v)}
                  suffix={t.yearsSuffix}
                  max={80}
                />
                <CurrencyField
                  label={t.income}
                  value={form.income2}
                  onChange={(v) => set("income2", v)}
                />
              </>
            )}
          </>
        )}
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 rounded-none border border-secondary-400/40 bg-secondary-50 px-4 py-3 text-sm text-secondary-600"
        >
          {error}
        </p>
      )}

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        {step === 2 && (
          <button
            type="button"
            className={btnOutline}
            onClick={() => {
              setError(null);
              setStep(1);
            }}
          >
            {t.back}
          </button>
        )}
        <button type="submit" className={btnPrimary}>
          {step === 1 ? t.next : t.calculate}
        </button>
      </div>
    </form>
  );
}
