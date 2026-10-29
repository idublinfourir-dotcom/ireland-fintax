"use client";

/* Shared form primitives + compliance chrome for the Tools calculators.
   Same Tailwind tokens as app/components/ui.tsx Button and the fields in
   ireland-income-tax-calculator.tsx: no new design system, just one place
   the VAT and Corporation Tax calculators both draw from. */

import { useId, useState } from "react";
import Link, { useLocale, useT } from "./locale-link";
import { calcMessages } from "../lib/messages/calc";
import { toolNames } from "../lib/messages/tool-names";
import { localDate, numberFormat, percent } from "../lib/i18n";
import { LATEST_BUDGET } from "../lib/budgets";

/* ---------- buttons (match ui.tsx Button) ---------- */

export const btnBase =
  "inline-flex h-12 cursor-pointer items-center justify-center gap-2 rounded-none px-7 text-sm font-semibold tracking-wide transition-[color,background-color,border-color,transform] duration-200 active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-2";
export const btnPrimary = `${btnBase} bg-primary-500 text-white hover:bg-primary-600 focus-visible:outline-primary-500`;
export const btnOutline = `${btnBase} border border-ink/20 text-ink hover:border-ink/40 hover:bg-ink/5 focus-visible:outline-ink/40`;

/* ---------- segmented radio group ---------- */

export function SegmentedField<T extends string>({
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

/* ---------- select (native, styled to match inputs) ---------- */

export function SelectField({
  label,
  value,
  onChange,
  hint,
  children,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  hint?: React.ReactNode;
  children: React.ReactNode;
}) {
  const id = useId();
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {label}
      </label>
      <div className="relative mt-1.5">
        <select
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-11 w-full cursor-pointer appearance-none rounded-none border border-line bg-surface ps-3 pe-9 text-sm text-ink transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        >
          {children}
        </select>
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          aria-hidden="true"
          className="pointer-events-none absolute inset-e-3 top-1/2 -translate-y-1/2 text-muted"
        >
          <path
            d="M2.5 4.5L6 8l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      {hint && <p className="mt-1 text-xs leading-5 text-muted">{hint}</p>}
    </div>
  );
}

/* ---------- numeric text buffer ----------
   Echoing String(parsedNumber) into a controlled <input type="number"> breaks
   decimal entry: "5." sanitises to "" mid-keystroke and "5.50" snaps to "5.5".
   The buffer holds exactly what was typed; the parent gets only the parsed
   number, and the buffer re-syncs only when the parent value changes
   externally (e.g. a Clear/Reset). */
export function useNumericText(value: number, onChange: (n: number) => void) {
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

export function CurrencyField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: React.ReactNode;
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
      {hint && <p className="mt-1 text-xs leading-5 text-muted">{hint}</p>}
    </div>
  );
}

export function NumericField({
  label,
  value,
  onChange,
  hint,
}: {
  label: string;
  value: number;
  onChange: (n: number) => void;
  hint?: React.ReactNode;
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
          inputMode="numeric"
          min={0}
          step="1"
          placeholder="0"
          value={text}
          onChange={(e) => handleChange(e.target.value)}
          className="h-11 w-full rounded-none border border-line bg-surface px-3 text-sm text-ink tabular-nums transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        />
      </div>
      {hint && <p className="mt-1 text-xs leading-5 text-muted">{hint}</p>}
    </div>
  );
}

/* ---------- proportion bar ----------
   A single hairline-bordered track split into coloured segments sized by
   value: visualises how a total divides (trading vs passive tax, net vs
   VAT). Empty/zero renders a quiet muted track. */

export interface BarSegment {
  label: string;
  value: number;
  /** Tailwind background class, e.g. "bg-primary-500". */
  className: string;
}

export function ProportionBar({ segments }: { segments: BarSegment[] }) {
  const t = useT(calcMessages);
  const total = segments.reduce((sum, s) => sum + Math.max(0, s.value), 0);
  const summary = segments.map((s) => s.label).join(", ");
  return (
    <div
      role="img"
      aria-label={total > 0 ? summary : t.noAmount}
      className="flex h-2.5 w-full overflow-hidden border border-line bg-surface-muted"
    >
      {total > 0 &&
        segments.map((s) => {
          const w = (Math.max(0, s.value) / total) * 100;
          if (w === 0) return null;
          return (
            <span
              key={s.label}
              className={s.className}
              style={{ width: `${w}%` }}
              aria-hidden="true"
            />
          );
        })}
    </div>
  );
}

/** Small square swatch used as a legend marker beside a breakdown row. */
export function LegendDot({ className }: { className: string }) {
  return (
    <span
      aria-hidden="true"
      className={`mt-[3px] h-2.5 w-2.5 shrink-0 ${className}`}
    />
  );
}

/* ---------- numbers in the page's language ---------- */

/** The formatters every calculator used with "en-IE", now in the page's
    language: €1,234.50 / 1.234,50 € / € 1.234,50. */
export function useFormat() {
  const locale = useLocale();
  const money2 = numberFormat(locale, { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const money0 = numberFormat(locale, { style: "currency", currency: "EUR", maximumFractionDigits: 0 });
  const pct2 = numberFormat(locale, { style: "percent", minimumFractionDigits: 2, maximumFractionDigits: 2 });
  const pct1 = numberFormat(locale, { style: "percent", minimumFractionDigits: 1, maximumFractionDigits: 1 });
  const num = numberFormat(locale);
  return {
    locale,
    money: (n: number) => money2.format(n),
    eur0: (n: number) => money0.format(n),
    pct2: (fraction: number) => pct2.format(fraction),
    pct1: (fraction: number) => pct1.format(fraction),
    num: (n: number) => num.format(n),
    /** A rate given in percent points: 12.5 → "12.5%" / "12,5 %". */
    rate: (points: number) => percent(locale, points),
  };
}

/* ---------- breadcrumb landmark ---------- */

/** The breadcrumb's <nav>, named in the page's language (Breadcrumbs in ui.tsx). */
export function BreadcrumbNav({ children }: { children: React.ReactNode }) {
  return <nav aria-label={useT(calcMessages).breadcrumb}>{children}</nav>;
}

/* ---------- the newest Budget ---------- */

/** BudgetNote's caveat (ui.tsx): the measures are announced, not yet law. */
export function BudgetNoteStatus() {
  const t = useT(calcMessages);
  const locale = useLocale();
  const label = useT(toolNames)[LATEST_BUDGET.href]?.label ?? LATEST_BUDGET.label;
  return (
    <>
      {t.budgetStatus.replace("{budget}", label).replace("{date}", localDate(locale, LATEST_BUDGET.checked))}
    </>
  );
}

/** BudgetNote's link (ui.tsx), here because it needs the page's language. */
export function BudgetNoteLink() {
  const t = useT(calcMessages);
  const label = useT(toolNames)[LATEST_BUDGET.href]?.label ?? LATEST_BUDGET.label;
  return (
    <Link
      href={LATEST_BUDGET.href}
      className="font-semibold text-primary-600 transition-colors duration-200 hover:text-primary-500"
    >
      {t.budgetLink.replace("{budget}", label)}
    </Link>
  );
}

/* ---------- compliance chrome (mandatory on a regulated CA-firm site) ---------- */

/** "Rates current as of …" stamp, read from the tool's config. */
export function RateStamp({
  asOf,
  sourceUrl,
}: {
  asOf: string;
  sourceUrl: string;
}) {
  const t = useT(calcMessages);
  const locale = useLocale();
  return (
    <p className="text-xs text-muted">
      {t.ratesAsOf.replace("{date}", localDate(locale, asOf))}{" "}
      <a
        href={sourceUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="font-medium text-primary-500 underline-offset-2 hover:underline"
      >
        {t.source}
      </a>
    </p>
  );
}

/** Indicative-estimate disclaimer shown with every result. */
export function ResultDisclaimer({
  asOf,
  sourceUrl,
}: {
  asOf: string;
  sourceUrl: string;
}) {
  const t = useT(calcMessages);
  const [before, after] = t.disclaimer.split("{link}");
  return (
    <div className="mt-8 border-t border-line pt-6">
      <p className="text-xs leading-5 text-muted">
        {before}
        <a
          href={sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary-500 underline-offset-2 hover:underline"
        >
          revenue.ie
        </a>
        {after}
      </p>
      <div className="mt-3">
        <RateStamp asOf={asOf} sourceUrl={sourceUrl} />
      </div>
    </div>
  );
}
