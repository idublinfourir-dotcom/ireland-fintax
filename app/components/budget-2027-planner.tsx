"use client";

/* Budget 2027 for you: three steps (your situation, your figures, your
   Budget). All maths and every figure live in ../lib/budget-2027 (pure,
   tested); this file is the form and the statement.

   The result is set like a statement: one line per change with a dotted
   leader to the amount, a rule, and the total. Each line opens to show why,
   from when, its status and its source, so the statement itself stays clean.

   Nothing typed here leaves the browser: no request, no storage, nothing in
   the URL (URLs land in browser history and hosting logs). */

import { useEffect, useRef, useState, type ReactNode } from "react";
import dynamic from "next/dynamic";
import Link from "./locale-link";
import {
  EMPTY_PROFILE,
  YEARS,
  incomeTaxInputFor,
  personalise,
  type BudgetProfile,
  type ExactLine,
  type PersonalBudget,
  type PersonalLine,
} from "../lib/budget-2027";
import type { YearRates } from "../lib/ireland-income-tax";
import { CheckIcon, Chevron, GroupRow } from "./ui";
import { btnOutline, btnPrimary, CurrencyField, NumericField, useFormat } from "./calculator-fields";
import { useT } from "./locale-link";
import { budgetMessages, type BudgetMessages } from "../lib/messages/budget";
import { budgetWords } from "../lib/budget-2027-words";
import { numberFormat } from "../lib/i18n";

/* Only needed once someone opens the full breakdown, so it is not in the
   page's first download. */
const IrelandIncomeTaxCalculator = dynamic(
  () => import("./ireland-income-tax-calculator").then((m) => m.IrelandIncomeTaxCalculator),
  { ssr: false, loading: () => <BreakdownLoading /> },
);

function BreakdownLoading() {
  return <p className="text-sm text-muted">{useT(budgetMessages).planner.loading}</p>;
}

/* ---------- the page's language ---------- */

/* Copy and numbers for the planner. `line` phrases a measure in this
   language from the figures it carries (lib/budget-2027-words.ts). */
function useBudget() {
  const t = useT(budgetMessages);
  const { locale, eur0, money } = useFormat();
  const signedFmt = numberFormat(locale, {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
    signDisplay: "exceptZero",
  });
  const fmt = {
    eur: (n: number) => eur0(Math.round(n)),
    eur2: money,
    num: (n: number) => numberFormat(locale).format(n),
    pct: (points: number) => numberFormat(locale, { style: "percent", maximumFractionDigits: 2 }).format(points / 100),
  };
  const m = (l: PersonalLine) => t.measures[l.id];
  return {
    t,
    signed: (n: number) => signedFmt.format(Math.round(n)),
    words: (l: PersonalLine) => budgetWords(l, t, fmt),
    title: (l: { id: string; title: string }) => t.measures[l.id]?.title ?? l.title,
    starts: (l: PersonalLine) => m(l)?.starts ?? l.starts.label,
  };
}

/* ---------- formatting and styles ---------- */

const textBtn =
  "cursor-pointer text-sm font-semibold text-primary-600 underline decoration-primary-300 underline-offset-4 transition-colors duration-200 hover:text-primary-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";
const leader = "min-w-6 flex-1 translate-y-[-3px] border-b border-dotted border-ink/25";

/* ---------- step 1: your situation ---------- */

type BoolKey = {
  [K in keyof BudgetProfile]: BudgetProfile[K] extends boolean ? K : never;
}[keyof BudgetProfile];

/* Labels: budgetMessages.planner.situationGroups / situations, by key. */
const SITUATIONS: { group: string; items: { key: BoolKey; label: string }[] }[] = [
  {
    group: "Work",
    items: [
      { key: "employee", label: "Employee" },
      { key: "selfEmployed", label: "Self-employed" },
      { key: "minimumWage", label: "Paid the minimum wage" },
    ],
  },
  {
    group: "Home",
    items: [
      { key: "renting", label: "Renting" },
      { key: "mortgage", label: "Paying a mortgage" },
      { key: "buyingFirstHome", label: "Buying a first home" },
      { key: "lettingRoom", label: "Letting a room" },
      { key: "solarExport", label: "Solar panels selling to the grid" },
      { key: "derelictProperty", label: "A vacant or run-down building" },
    ],
  },
  {
    group: "Family",
    items: [
      { key: "married", label: "Married or civil partners" },
      { key: "homeCarer", label: "One of us cares for someone at home" },
      { key: "singleParent", label: "Single parent" },
      { key: "hasChildren", label: "Children" },
      { key: "childcare", label: "Paying for childcare" },
      { key: "college", label: "Someone in college" },
    ],
  },
  {
    group: "Payments and age",
    items: [
      { key: "age66Plus", label: "66 or over" },
      { key: "medicalCard", label: "Medical card" },
      { key: "welfarePayment", label: "Weekly welfare payment or State Pension" },
      { key: "livingAlone", label: "Living Alone Increase" },
      { key: "fuelAllowance", label: "Fuel Allowance" },
      { key: "workingFamilyPayment", label: "Working Family Payment" },
      { key: "disabilityPayment", label: "Long-term disability payment" },
      { key: "carer", label: "Carer’s Allowance" },
    ],
  },
  {
    group: "Savings and investments",
    items: [
      { key: "funds", label: "Funds, ETFs or life policies" },
      { key: "mightSell", label: "Might sell shares or property" },
      { key: "giftOrInheritance", label: "A gift or inheritance" },
    ],
  },
  {
    group: "Spending",
    items: [
      { key: "petrol", label: "Petrol car" },
      { key: "diesel", label: "Diesel car" },
      { key: "heatingOil", label: "Oil heating" },
      { key: "gas", label: "Gas heating" },
      { key: "smoker", label: "Smoking" },
      { key: "vaper", label: "Vaping" },
      { key: "buyingCar", label: "Buying a new car" },
    ],
  },
  {
    group: "Business",
    items: [
      { key: "companyDirector", label: "Running a company" },
      { key: "farmer", label: "Farming" },
      { key: "childminder", label: "Childminding at home" },
    ],
  },
];

function Tick({ on }: { on: boolean }) {
  return (
    <span
      aria-hidden="true"
      className={`grid h-[18px] w-[18px] shrink-0 place-items-center border transition-colors duration-150 ${
        on ? "border-primary-500 bg-primary-500 text-white" : "border-ink/30 bg-white"
      }`}
    >
      {on && <CheckIcon className="h-3 w-3" />}
    </span>
  );
}

/* ---------- step 2: your figures ---------- */

type Field = { key: keyof BudgetProfile; label: string; euro?: boolean; hint?: string };

function figuresFor(p: BudgetProfile, t: BudgetMessages["planner"]): { group: string; fields: Field[] }[] {
  const optional = t.optional;
  const L = t.fields;
  const income: Field[] = [];
  if (p.employee || p.minimumWage)
    income.push({ key: "employmentIncome", label: L.employmentIncome, euro: true, hint: L.employmentIncomeHint.replace("{year}", String(YEARS.before)) });
  if (p.selfEmployed) income.push({ key: "selfEmploymentIncome", label: L.selfEmploymentIncome, euro: true });
  if (p.minimumWage) income.push({ key: "minimumWageHours", label: L.minimumWageHours });
  if (p.married)
    income.push({ key: "spouseIncome", label: L.spouseIncome, euro: true, hint: L.spouseIncomeHint });

  const home: Field[] = [];
  if (p.renting) home.push({ key: "rentMonthly", label: L.rentMonthly, euro: true, hint: L.rentMonthlyHint });
  if (p.buyingFirstHome) {
    home.push({ key: "homePrice", label: L.homePrice, euro: true });
    home.push({
      key: "taxPaidFourYears",
      label: L.taxPaidFourYears,
      euro: true,
      hint: L.taxPaidFourYearsHint,
    });
  }

  const family: Field[] = [];
  if (p.hasChildren) {
    family.push({ key: "childrenUnder12", label: L.childrenUnder12 });
    family.push({ key: "children12Plus", label: L.children12Plus });
  }
  if (p.childcare) family.push({ key: "childcareHours", label: L.childcareHours, hint: optional });
  if (p.college) family.push({ key: "studentsInCollege", label: L.studentsInCollege });

  const spending: Field[] = [];
  if (p.petrol) spending.push({ key: "petrolLitresPerWeek", label: L.petrolLitresPerWeek, hint: optional });
  if (p.diesel) spending.push({ key: "dieselLitresPerWeek", label: L.dieselLitresPerWeek, hint: optional });
  if (p.heatingOil)
    spending.push({ key: "heatingOilLitresPerYear", label: L.heatingOilLitresPerYear, hint: L.heatingOilLitresPerYearHint });
  if (p.gas)
    spending.push({ key: "gasKwhPerYear", label: L.gasKwhPerYear, hint: L.gasKwhPerYearHint });
  if (p.smoker) spending.push({ key: "packsPerWeek", label: L.packsPerWeek, hint: optional });

  return [
    { group: "Income", fields: income },
    { group: "Home", fields: home },
    { group: "Family", fields: family },
    { group: "Spending", fields: spending },
  ].filter((g) => g.fields.length > 0);
}

/* ---------- step 3: your Budget ---------- */

/* Why, from when, status, source: shown only when a line is opened. */
function LineFacts({ line }: { line: PersonalLine }) {
  const { t, starts } = useBudget();
  const dt = "font-semibold text-ink-body";
  return (
    <dl className="mt-3 grid gap-x-6 gap-y-1.5 text-xs leading-5 text-muted sm:grid-cols-[auto_1fr]">
      <dt className={dt}>{t.planner.starts}</dt>
      <dd>{starts(line)}</dd>
      <dt className={dt}>{t.planner.status}</dt>
      <dd>{t.statuses[line.status] ?? line.statusLabel}</dd>
      <dt className={dt}>{t.planner.source}</dt>
      <dd>
        <a
          href={line.source.url}
          rel="noopener noreferrer"
          target="_blank"
          className="underline decoration-line underline-offset-2 transition-colors duration-200 hover:text-ink"
        >
          {line.source.label}
        </a>
      </dd>
      {line.calculator && (
        <>
          <dt className={dt}>{t.planner.workItOut}</dt>
          <dd>
            <Link href={line.calculator.href} className="font-semibold text-primary-600 underline-offset-2 hover:underline">
              {t.calculators[line.calculator.label] ?? line.calculator.label}
            </Link>
          </dd>
        </>
      )}
    </dl>
  );
}

/* One expandable line: the summary row (title and whatever sits beside it)
   opens to the explanation and the facts. */
function LineDetails({ line, summary, body }: { line: PersonalLine; summary: ReactNode; body: string }) {
  return (
    <details className="group border-b border-line">
      <summary className="flex cursor-pointer list-none items-baseline gap-3 py-4 [&::-webkit-details-marker]:hidden">
        <Chevron className="text-muted transition-transform duration-200 group-open:rotate-90" />
        {summary}
      </summary>
      <div className="pb-5 ps-6">
        <p className="max-w-2xl text-sm leading-6 text-ink-body">{body}</p>
        <LineFacts line={line} />
      </div>
    </details>
  );
}

function StatementLine({ line }: { line: ExactLine }) {
  const { signed, words, title } = useBudget();
  const amount = line.impact.amount;
  return (
    <LineDetails
      line={line}
      body={words(line).body}
      summary={
        <>
          <span className="text-[15px] font-medium text-ink">{title(line)}</span>
          <span aria-hidden="true" className={leader} />
          <span
            className={`font-display text-lg font-semibold tabular-nums ${
              amount >= 0 ? "text-primary-600" : "text-ink-body"
            }`}
          >
            {signed(amount)}
          </span>
        </>
      }
    />
  );
}

function TotalLine({ label, amount }: { label: string; amount: number }) {
  const { signed } = useBudget();
  return (
    <div className="flex items-baseline justify-between gap-4 border-t-[3px] border-double border-ink py-4">
      <span className="text-[15px] font-semibold text-ink">{label}</span>
      <span className="font-display text-3xl font-bold tabular-nums text-ink sm:text-4xl">{signed(amount)}</span>
    </div>
  );
}

function Ledger({ lines, total, label }: { lines: ExactLine[]; total: number; label: string }) {
  return (
    <div className="border-t border-ink">
      {lines.map((l) => (
        <StatementLine key={l.id} line={l} />
      ))}
      <TotalLine label={label} amount={total} />
    </div>
  );
}

/* Lines without a sum: usage-based and good-to-know. Phones put a per-unit
   change under the title; wider screens lead to it on the right. */
function NoteList({ lines }: { lines: PersonalLine[] }) {
  const { words, title } = useBudget();
  return (
    <div className="border-t border-ink">
      {lines.map((line) => {
        const unit = line.impact.kind === "perUnit" ? line.impact : null;
        const said = words(line);
        return (
          <LineDetails
            key={line.id}
            line={line}
            body={said.body}
            summary={
              <span className="min-w-0 flex-1">
                <span className="flex flex-col gap-0.5 sm:flex-row sm:items-baseline sm:gap-3">
                  <span className="text-[15px] font-medium text-ink">{title(line)}</span>
                  {unit && (
                    <>
                      <span aria-hidden="true" className={`hidden sm:block ${leader}`} />
                      <span
                        className={`text-[15px] font-semibold sm:text-end ${
                          unit.cheaper ? "text-primary-600" : "text-ink-body"
                        }`}
                      >
                        {said.change}
                      </span>
                    </>
                  )}
                </span>
                {said.estimate && <span className="mt-1 block text-sm text-muted">{said.estimate}</span>}
              </span>
            }
          />
        );
      })}
    </div>
  );
}

function Section({ id, title, note, children }: { id: string; title: string; note: string; children: ReactNode }) {
  return (
    <section aria-labelledby={id}>
      <div className="mb-4">
        <h3 id={id} className="font-display text-2xl font-semibold tracking-[-0.01em] text-ink">
          {title}
        </h3>
        <p className="mt-1 text-sm leading-6 text-muted">{note}</p>
      </div>
      {children}
    </section>
  );
}

function Statement({
  result,
  profile,
  ratesByYear,
}: {
  result: PersonalBudget;
  profile: BudgetProfile;
  ratesByYear: Record<number, YearRates>;
}) {
  const [showBreakdown, setShowBreakdown] = useState(false);
  const { t: all, title } = useBudget();
  const t = all.planner;
  const hasTax = result.yearly.some((l) => l.id === "income-tax");

  if (result.exact.length + result.perUnit.length + result.info.length === 0) {
    return (
      <p className="max-w-xl text-base leading-7 text-ink-body">
        {t.nothing}
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-14">
      {result.exact.length > 0 && (
        <Section
          id="statement-money"
          title={t.moneyTitle.replace("{after}", String(YEARS.after)).replace("{before}", String(YEARS.before))}
          note={t.moneyNote}
        >
          {result.yearly.length > 0 && <Ledger lines={result.yearly} total={result.totalPerYear} label={t.eachYear} />}
          {result.once.length > 0 && (
            <div className={result.yearly.length > 0 ? "mt-8" : ""}>
              <Ledger lines={result.once} total={result.totalOnce} label={t.oneOff} />
            </div>
          )}

          {hasTax && (
            <div className="mt-6">
              <button
                type="button"
                className={textBtn}
                aria-expanded={showBreakdown}
                onClick={() => setShowBreakdown((v) => !v)}
              >
                {showBreakdown ? t.hideBreakdown : t.showBreakdown}
              </button>
              {showBreakdown && (
                <div className="mt-6 border border-line bg-white p-5 sm:p-8">
                  <IrelandIncomeTaxCalculator
                    ratesByYear={ratesByYear}
                    currentYear={YEARS.after}
                    priorYear={YEARS.before}
                    initialInput={incomeTaxInputFor(profile)}
                  />
                </div>
              )}
            </div>
          )}
        </Section>
      )}

      {result.perUnit.length > 0 && (
        <Section
          id="statement-usage"
          title={t.usageTitle}
          note={t.usageNote}
        >
          <NoteList lines={result.perUnit} />
        </Section>
      )}

      {result.info.length > 0 && (
        <Section id="statement-info" title={t.infoTitle} note={t.infoNote}>
          <NoteList lines={result.info} />
        </Section>
      )}

      <Section id="statement-dates" title={t.datesTitle} note={t.datesNote}>
        <ol className="grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-3">
          {result.timeline.map((item) => (
            <li key={item.title} className="bg-white p-4">
              <p className="font-display text-base font-semibold text-ink">
                {all.measures[idByTitle(result, item.title)]?.starts ?? item.starts.label}
              </p>
              <p className="mt-1 text-sm leading-6 text-ink-body">
                {title({ id: idByTitle(result, item.title), title: item.title })}
              </p>
            </li>
          ))}
        </ol>
      </Section>
    </div>
  );
}

/* The timeline carries titles, not ids; find the line each came from. */
function idByTitle(result: PersonalBudget, title: string): string {
  return [...result.exact, ...result.perUnit, ...result.info].find((l) => l.title === title)?.id ?? "";
}

/* ---------- the planner ---------- */

export function Budget2027Planner({ ratesByYear }: { ratesByYear: Record<number, YearRates> }) {
  const { t: all } = useBudget();
  const t = all.planner;
  const STEPS = t.steps;
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [profile, setProfile] = useState<BudgetProfile>(EMPTY_PROFILE);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const shownStep = useRef(step);

  // Move focus to the step heading when the step changes (never on load, and
  // not on React's development double-mount). Smooth or instant follows
  // globals.css, which honours reduced motion.
  useEffect(() => {
    if (shownStep.current === step) return;
    shownStep.current = step;
    headingRef.current?.focus();
    headingRef.current?.scrollIntoView({ block: "start" });
  }, [step]);

  const toggle = (key: BoolKey) => setProfile((p) => ({ ...p, [key]: !p[key] }));

  const figures = figuresFor(profile, t);
  const picked = SITUATIONS.reduce((n, g) => n + g.items.filter((i) => profile[i.key]).length, 0);
  const result = step === 3 ? personalise(profile, ratesByYear) : null;
  const heading = STEPS[step - 1];

  return (
    <div>
      {/* Where you are: a real sequence, so it is numbered. */}
      <ol className="flex flex-wrap gap-x-8 gap-y-2 border-b border-line pb-4 text-sm">
        {STEPS.map(({ label }, i) => {
          const n = i + 1;
          const state = n === step ? "current" : n < step ? "done" : "todo";
          return (
            <li
              key={label}
              aria-current={state === "current" ? "step" : undefined}
              className={`flex items-center gap-2 ${
                state === "current" ? "font-semibold text-ink" : state === "done" ? "text-ink-body" : "text-muted"
              }`}
            >
              <span
                className={`grid h-6 w-6 place-items-center text-xs font-semibold tabular-nums ${
                  state === "current"
                    ? "bg-ink text-white"
                    : state === "done"
                      ? "bg-primary-50 text-primary-600"
                      : "border border-line text-muted"
                }`}
              >
                {n}
              </span>
              {label}
            </li>
          );
        })}
      </ol>

      <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2
            ref={headingRef}
            tabIndex={-1}
            className="scroll-mt-28 font-display text-3xl font-bold tracking-[-0.02em] text-ink outline-none sm:text-4xl"
          >
            {heading.title}
          </h2>
          <p className="mt-2 text-base leading-7 text-muted">{heading.sub}</p>
        </div>
        {step === 3 && (
          <div className="flex gap-6">
            <button type="button" className={textBtn} onClick={() => setStep(figures.length > 0 ? 2 : 1)}>
              {t.edit}
            </button>
            <button
              type="button"
              className={textBtn}
              onClick={() => {
                setProfile(EMPTY_PROFILE);
                setStep(1);
              }}
            >
              {t.startAgain}
            </button>
          </div>
        )}
      </div>

      {step === 1 && (
        <div className="mt-8">
          {SITUATIONS.map((g) => (
            <GroupRow key={g.group} title={t.situationGroups[g.group] ?? g.group}>
              <div role="group" aria-label={t.situationGroups[g.group] ?? g.group} className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
                {g.items.map((item) => {
                  const on = profile[item.key];
                  return (
                    <button
                      key={item.key}
                      type="button"
                      aria-pressed={on}
                      onClick={() => toggle(item.key)}
                      className={`flex min-h-12 cursor-pointer items-center gap-3 border px-4 py-3 text-start text-sm transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                        on
                          ? "border-primary-500 bg-primary-50 font-medium text-ink"
                          : "border-line bg-white text-ink-body hover:border-ink/30"
                      }`}
                    >
                      <Tick on={on} />
                      {t.situations[item.key] ?? item.label}
                    </button>
                  );
                })}
              </div>
            </GroupRow>
          ))}

          {/* data-sticky-actions lifts the site's back-to-top button clear of
              this bar (globals.css). */}
          <div
            data-sticky-actions
            className="sticky bottom-0 z-10 flex items-center justify-between gap-4 border-t border-line bg-white/95 py-4 backdrop-blur-sm"
          >
            <p className="text-sm text-muted" aria-live="polite">
              {picked === 0 ? t.nothingPicked : t.picked.replace("{n}", String(picked))}
            </p>
            <button
              type="button"
              className={`${btnPrimary} disabled:cursor-not-allowed disabled:bg-primary-500/40`}
              disabled={picked === 0}
              onClick={() => setStep(figures.length > 0 ? 2 : 3)}
            >
              {t.continue}
            </button>
          </div>
        </div>
      )}

      {step === 2 && (
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            setStep(3);
          }}
        >
          {figures.map((g) => (
            <GroupRow key={g.group} title={t.figureGroups[g.group] ?? g.group}>
              <div className="grid max-w-2xl gap-5 sm:grid-cols-2">
                {g.fields.map((f) => {
                  const Field = f.euro ? CurrencyField : NumericField;
                  return (
                    <Field
                      key={f.key}
                      label={f.label}
                      hint={f.hint}
                      value={profile[f.key] as number}
                      onChange={(n) => setProfile((p) => ({ ...p, [f.key]: Math.max(0, n) }))}
                    />
                  );
                })}
              </div>
            </GroupRow>
          ))}
          <div className="flex flex-wrap gap-3 border-t border-line pt-6">
            <button type="submit" className={btnPrimary}>
              {t.show}
            </button>
            <button type="button" className={btnOutline} onClick={() => setStep(1)}>
              {t.back}
            </button>
          </div>
        </form>
      )}

      {step === 3 && result && (
        <div className="mt-10">
          <Statement result={result} profile={profile} ratesByYear={ratesByYear} />
        </div>
      )}

      <p className="mt-12 max-w-2xl text-xs leading-5 text-muted">
        {t.footer}
      </p>
    </div>
  );
}
