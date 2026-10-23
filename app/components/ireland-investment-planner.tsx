"use client";

/* Personal investment options planner, in the site theme.
   Three questions — timeframe, risk, then the refinements — with the matching
   options ranked underneath as the answers change. All data and maths live in
   ../lib/ireland-investment so the figures stay in one auditable place.

   This is a comparison tool, not advice: it ranks option TYPES by return after
   Irish tax. It knows nothing about the user, so nothing here may be phrased
   as a recommendation, and the standing caveat below must not be removed. */

import { useId, useMemo, useState } from "react";
import Link from "./locale-link";
import {
  DATA_AS_OF,
  DEFAULT_INPUTS,
  HORIZONS,
  RISK_LEVELS,
  grossEquivalent,
  planInvestments,
  type Exclusion,
  type Horizon,
  type OptionFlag,
  type PlanNotice,
  type OptionResult,
  type PlannerInputs,
  type RiskLevel,
  type SectorFilter,
} from "../lib/ireland-investment";
import { useT } from "./locale-link";
import { investmentMessages } from "../lib/messages/investment";
import { investmentData } from "../lib/messages/investment-options";
import { useFormat } from "./calculator-fields";
import { localDate, numberFormat } from "../lib/i18n";

/* ---------- the page's language ---------- */

/* Euro amounts and rates as the planner's own formatEuro / formatPercent
   produce them, in the page's language. */
function usePlannerFormat() {
  const { eur0, locale } = useFormat();
  const t = useT(investmentMessages).planner;
  const data = useT(investmentData);
  const euro = (n: number) => eur0(Math.round(n));
  const pct = (rate: number, dp = 2) =>
    numberFormat(locale, { style: "percent", minimumFractionDigits: dp, maximumFractionDigits: dp }).format(rate);
  const flag = (f: OptionFlag) =>
    f.kind === "cap"
      ? t.flags.cap.replace("{cap}", euro(f.cap))
      : f.kind === "dgs"
        ? t.flags.dgs.replace("{limit}", euro(f.limit))
        : t.flags[f.kind];
  const reason = (r: Exclusion) => {
    switch (r.kind) {
      case "lock":
        return t.reasons.lock
          .replace("{years}", String(r.years))
          .replace("{horizon}", data.horizons[r.horizon].label.toLocaleLowerCase(locale));
      case "risk":
        return t.reasons.risk.replace("{risk}", String(r.risk));
      case "minimum":
        return t.reasons.minimum.replace("{minimum}", euro(r.minimum));
      default:
        return t.reasons[r.kind];
    }
  };
  const notice = (n: PlanNotice) =>
    n.kind === "dgs"
      ? t.notices.dgs.replace("{limit}", euro(n.limit))
      : n.kind === "inflation"
        ? t.notices.inflation.replace("{rate}", pct(n.inflation, 0))
        : t.notices[n.kind];
  return { t, data, euro, pct, flag, reason, notice, locale };
}

/* ---------- small shared pieces ---------- */

const cardBase =
  "cursor-pointer rounded-none border p-4 text-left transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";
const cardOn = "border-primary-500 bg-primary-50 ring-1 ring-inset ring-primary-500";
const cardOff = "border-line bg-surface hover:border-ink/30";

function StepHeading({ step, title, hint }: { step: string; title: string; hint?: string }) {
  return (
    <div className="mb-4">
      <span className="font-display text-xs font-semibold tracking-[0.16em] text-primary-500">
        {step}
      </span>
      <h3 className="mt-1 font-display text-xl font-bold tracking-[-0.01em] text-ink">
        {title}
      </h3>
      {hint && <p className="mt-1 text-sm leading-6 text-muted">{hint}</p>}
    </div>
  );
}

function RiskPill({ risk }: { risk: number }) {
  const t = useT(investmentMessages).planner;
  return (
    <span
      className="inline-flex shrink-0 items-center gap-1.5 border border-line bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-muted"
      title={t.riskTitle.replace("{risk}", String(risk))}
    >
      <span aria-hidden="true" className="flex gap-0.5">
        {[1, 2, 3, 4, 5].map((n) => (
          <span
            key={n}
            className={`h-1.5 w-1.5 ${n <= risk ? "bg-primary-500" : "bg-line"}`}
          />
        ))}
      </span>
      {t.riskShort.replace("{risk}", String(risk))}
    </span>
  );
}

/* ---------- inputs ---------- */

function AmountField({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  const id = useId();
  const t = useT(investmentMessages).planner;
  /* Local text buffer: echoing String(value) back into a controlled number
     input destroys mid-keystroke entry (a lone "0" renders empty, "50000"
     typed one key at a time keeps re-snapping). */
  const [text, setText] = useState(value ? String(value) : "");
  return (
    <div className="max-w-xs">
      <label htmlFor={id} className="block text-sm font-medium text-ink">
        {t.amount}
      </label>
      <div className="relative mt-1.5">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted">
          €
        </span>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={0}
          step="any"
          placeholder="0"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            const n = e.target.value === "" ? 0 : Number(e.target.value);
            onChange(Number.isFinite(n) ? n : 0);
          }}
          className="h-11 w-full rounded-none border border-line bg-surface pl-7 pr-3 text-sm tabular-nums text-ink transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40"
        />
      </div>
    </div>
  );
}

function Segmented<T extends string>({
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

/* ---------- one result row ---------- */

function ResultRow({ result, rank, years }: { result: OptionResult; rank: number; years: number }) {
  const { option } = result;
  const { t, data, euro, pct, flag } = usePlannerFormat();
  const text = data.options[option.id] ?? { ...option, link: option.link.label };
  const taxFree = result.effectiveTaxRate === 0 && option.category !== "pension";

  return (
    <li className="border border-line bg-surface p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-display text-sm font-semibold text-primary-500">
              {String(rank).padStart(2, "0")}
            </span>
            <h4 className="font-display text-base font-medium tracking-tight text-ink">
              {text.name}
            </h4>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted">
            <span className="border border-line bg-surface-muted px-2 py-0.5 font-semibold">
              {data.sectors[option.sector]}
            </span>
            <span className="border border-line bg-surface-muted px-2 py-0.5 font-semibold">
              {data.categories[option.category]}
            </span>
            <RiskPill risk={option.risk} />
            {option.guarantee === "state-full" && (
              <span className="border border-primary-300 bg-primary-50 px-2 py-0.5 font-semibold text-primary-600">
                {t.stateGuaranteed}
              </span>
            )}
            {option.guarantee === "dgs" && (
              <span className="border border-line bg-surface-muted px-2 py-0.5 font-semibold">
                {t.dgs}
              </span>
            )}
          </div>
        </div>

        <div className="text-right">
          <span className="block font-display text-2xl font-bold tabular-nums text-ink">
            {pct(result.netReturn)}
          </span>
          <span className="block text-[11px] text-muted">{t.afterTax}</span>
        </div>
      </div>

      <dl className="mt-5 grid gap-x-6 gap-y-3 border-t border-line pt-4 text-sm sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <dt className="text-xs text-muted">{t.gross}</dt>
          <dd className="mt-0.5 tabular-nums text-ink">
            {option.grossLow === option.grossHigh
              ? pct(option.grossLow)
              : t.range.replace("{low}", pct(option.grossLow)).replace("{high}", pct(option.grossHigh))}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t.taxTreatment}</dt>
          <dd className="mt-0.5 text-ink">
            {text.taxTreatment}
            {result.effectiveTaxRate > 0 && (
              <span className="text-muted">
                {" "}
                {t.effective.replace("{rate}", pct(result.effectiveTaxRate, 0))}
              </span>
            )}
          </dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t.access}</dt>
          <dd className="mt-0.5 text-ink">{text.liquidity}</dd>
        </div>
        <div>
          <dt className="text-xs text-muted">{t.minimumCap}</dt>
          <dd className="mt-0.5 tabular-nums text-ink">
            {option.minimum > 0 ? euro(option.minimum) : t.none}
            <span className="text-muted"> · {text.cap}</span>
          </dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <dt className="text-xs text-muted">
            {t.valueAfter.replace("{years}", String(years))}
          </dt>
          <dd className="mt-0.5 tabular-nums text-ink">
            <span className="font-semibold">{euro(result.projectedValue)}</span>
            <span className="text-muted">
              {" "}
              · {result.gain >= 0 ? "+" : ""}
              {euro(result.gain)}
            </span>
          </dd>
        </div>
        <div className="sm:col-span-2 lg:col-span-2">
          <dt className="text-xs text-muted">{t.afterInflation}</dt>
          <dd
            className={`mt-0.5 tabular-nums ${
              result.realReturn > 0 ? "text-ink" : "text-primary-600"
            }`}
          >
            {t.perYear.replace("{rate}", pct(result.realReturn))}
            {result.realReturn <= 0 && t.losesPower}
          </dd>
        </div>
      </dl>

      {taxFree && (
        <p className="mt-4 border-l-2 border-primary-400 pl-3 text-sm leading-6 text-ink">
          {t.taxFree.replace("{rate}", pct(grossEquivalent(result.grossMid, 0.33)))}
        </p>
      )}

      <p className="mt-4 text-sm leading-6 text-muted">{text.note}</p>

      {result.flagCodes.length > 0 && (
        <ul className="mt-3 space-y-1">
          {result.flagCodes.map(flag).map((f) => (
            <li key={f} className="flex gap-2 text-sm leading-6 text-ink">
              <span aria-hidden="true" className="text-primary-500">
                !
              </span>
              {f}
            </li>
          ))}
        </ul>
      )}

      {/* Where an Irish resident actually goes for this. New tab, because the
          planner holds the answers the visitor has just entered and losing
          them to an outbound click is the obvious annoyance. */}
      <a
        href={option.link.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-5 inline-flex h-10 cursor-pointer items-center justify-center gap-2 rounded-none border border-ink/20 px-5 text-sm font-semibold tracking-wide text-ink transition-[color,background-color,border-color] duration-200 hover:border-primary-400 hover:bg-primary-50/60 hover:text-primary-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500"
      >
        {text.link}
        <span aria-hidden="true">↗</span>
        <span className="sr-only">{t.newTab}</span>
      </a>
    </li>
  );
}

/* ---------- the planner ---------- */

export function IrelandInvestmentPlanner() {
  const { t, data, euro, reason, notice, locale } = usePlannerFormat();
  const pct0 = (rate: number) => numberFormat(locale, { style: "percent", maximumFractionDigits: 0 }).format(rate);
  const [amount, setAmount] = useState(DEFAULT_INPUTS.amount);
  const [horizon, setHorizon] = useState<Horizon>(DEFAULT_INPUTS.horizon);
  const [risk, setRisk] = useState<RiskLevel>(DEFAULT_INPUTS.risk);
  const [marginalRate, setMarginalRate] = useState(DEFAULT_INPUTS.marginalRate);
  const [sector, setSector] = useState<SectorFilter>(DEFAULT_INPUTS.sector);
  const [guaranteedOnly, setGuaranteedOnly] = useState(DEFAULT_INPUTS.guaranteedOnly);

  const inputs: PlannerInputs = useMemo(
    () => ({
      amount,
      horizon,
      risk,
      marginalRate,
      sector,
      guaranteedOnly,
      inflation: DEFAULT_INPUTS.inflation,
    }),
    [amount, horizon, risk, marginalRate, sector, guaranteedOnly],
  );

  const plan = useMemo(() => planInvestments(inputs), [inputs]);
  const guaranteedId = useId();

  return (
    <div>
      {/* ---- step 1: timeframe ---- */}
      <section aria-labelledby="step-timeframe">
        <StepHeading
          step="01"
          title={t.step1Title}
          hint={t.step1Hint}
        />
        <h3 id="step-timeframe" className="sr-only">
          {t.timeframe}
        </h3>
        <AmountField value={amount} onChange={setAmount} />
        <div role="radiogroup" aria-label={t.horizonLabel} className="mt-5 grid gap-3 sm:grid-cols-3">
          {HORIZONS.map((h) => {
            const active = h.value === horizon;
            return (
              <button
                key={h.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setHorizon(h.value)}
                className={`${cardBase} ${active ? cardOn : cardOff}`}
              >
                <span className="block font-display text-lg font-bold tracking-[-0.01em] text-ink">
                  {data.horizons[h.value].label}
                </span>
                <span className="mt-1 block text-sm leading-6 text-muted">{data.horizons[h.value].blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- step 2: risk ---- */}
      <section aria-labelledby="step-risk" className="mt-12 border-t border-line pt-10">
        <StepHeading
          step="02"
          title={t.step2Title}
          hint={t.step2Hint}
        />
        <h3 id="step-risk" className="sr-only">
          {t.riskHeading}
        </h3>
        <div role="radiogroup" aria-label={t.riskLevel} className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {RISK_LEVELS.map((level) => {
            const active = level.value === risk;
            return (
              <button
                key={level.value}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setRisk(level.value)}
                className={`${cardBase} ${active ? cardOn : cardOff}`}
              >
                <span className="flex items-center gap-2">
                  <span aria-hidden="true" className="flex gap-0.5">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <span
                        key={n}
                        className={`h-1.5 w-1.5 ${
                          n <= level.value ? "bg-primary-500" : "bg-line"
                        }`}
                      />
                    ))}
                  </span>
                  <span className="font-display text-sm font-bold text-ink">{data.risks[level.value].label}</span>
                </span>
                <span className="mt-1.5 block text-xs leading-5 text-muted">{data.risks[level.value].blurb}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ---- step 3: refinements ---- */}
      <section aria-labelledby="step-refine" className="mt-12 border-t border-line pt-10">
        <StepHeading
          step="03"
          title={t.step3Title}
          hint={t.step3Hint}
        />
        <h3 id="step-refine" className="sr-only">
          {t.refinements}
        </h3>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Segmented
            label={t.marginal}
            value={String(marginalRate)}
            onChange={(v) => setMarginalRate(Number(v))}
            options={[
              { value: "0.52", label: t.higher.replace("{rate}", pct0(0.52)) },
              { value: "0.4", label: pct0(0.4) },
              { value: "0.2", label: t.standard.replace("{rate}", pct0(0.2)) },
            ]}
          />
          <Segmented
            label={t.provider}
            value={sector}
            onChange={setSector}
            options={[
              { value: "all", label: t.all },
              { value: "state", label: t.stateBacked },
              { value: "private", label: t.private },
            ]}
          />
          <div className="flex items-end">
            <label
              htmlFor={guaranteedId}
              className="flex cursor-pointer items-start gap-3 border border-line bg-surface p-3 text-sm text-ink"
            >
              <input
                id={guaranteedId}
                type="checkbox"
                checked={guaranteedOnly}
                onChange={(e) => setGuaranteedOnly(e.target.checked)}
                className="mt-0.5 h-4 w-4 cursor-pointer accent-primary-500"
              />
              <span>
                {t.guaranteed}
                <span className="mt-0.5 block text-xs text-muted">
                  {t.guaranteedHint}
                </span>
              </span>
            </label>
          </div>
        </div>
      </section>

      {/* ---- results ---- */}
      <section aria-labelledby="step-results" className="mt-12 border-t border-line pt-10">
        <StepHeading step="04" title={t.step4Title} />
        <h3 id="step-results" className="sr-only">
          {t.results}
        </h3>

        <p className="text-sm leading-6 text-muted">
          {t.summary
            .replace("{fit}", String(plan.results.length))
            .replace("{amount}", euro(amount))
            .replace("{years}", String(plan.years))}
        </p>

        {plan.notices.length > 0 && (
          <ul className="mt-5 space-y-3">
            {plan.notices.map(notice).map((warning) => (
              <li
                key={warning}
                className="border-l-2 border-primary-400 bg-primary-50/40 p-4 text-sm leading-6 text-ink"
              >
                {warning}
              </li>
            ))}
          </ul>
        )}

        {plan.results.length > 0 && (
          <ol className="mt-6 space-y-4">
            {plan.results.map((result, index) => (
              <ResultRow
                key={result.option.id}
                result={result}
                rank={index + 1}
                years={plan.years}
              />
            ))}
          </ol>
        )}

        {plan.excluded.length > 0 && (
          <details className="mt-8 border border-line bg-surface-muted p-5">
            <summary className="cursor-pointer font-display text-sm font-semibold text-ink">
              {t.ruledOut.replace("{n}", String(plan.excluded.length))}
            </summary>
            <ul className="mt-4 space-y-2">
              {plan.excluded.map(({ option, why }) => (
                <li key={option.id} className="text-sm leading-6">
                  <span className="text-ink">{data.options[option.id]?.name ?? option.name}</span>{" "}
                  <span className="block text-muted">{reason(why)}</span>
                </li>
              ))}
            </ul>
          </details>
        )}

        <div className="mt-8 border-t border-line pt-6">
          <p className="max-w-3xl text-sm leading-6 text-muted">
            {t.plannerDisclaimer.replace("{date}", localDate(locale, DATA_AS_OF))}
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex text-sm font-semibold text-primary-500 transition-colors duration-200 hover:text-primary-600"
          >
            {t.askTax} <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>
    </div>
  );
}
