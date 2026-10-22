"use client";

/* The Investment Account page's two tools: the eligibility checker and the
   "same money, three homes" comparison. English only (the page is not in
   TRANSLATED_PATHS). All the maths is in lib/ireland-investment-account.ts;
   nothing here is stored or sent anywhere. */

import { useState } from "react";
import { CurrencyField, NumericField, SelectField, useFormat } from "./calculator-fields";
import {
  compareWrappers,
  eligibility,
  INVESTMENT_ACCOUNT,
  TOP_RATES,
  type EligibilityAnswer,
  type IneligibleReason,
} from "../lib/ireland-investment-account";

type YesNo = "" | "yes" | "no";
const QUESTIONS: { key: keyof EligibilityAnswer; text: string; yesIsOk: boolean }[] = [
  { key: "adult", text: `Will you be ${INVESTMENT_ACCOUNT.minAge} or over when you open it?`, yesIsOk: true },
  { key: "resident", text: "Are you resident in Ireland for tax?", yesIsOk: true },
  { key: "ppsn", text: "Do you have a PPS number?", yesIsOk: true },
  { key: "hasAccount", text: "Do you already have an Investment Account?", yesIsOk: false },
  { key: "closedThisYear", text: "Have you closed an Investment Account earlier this year?", yesIsOk: false },
];
const REASONS: Record<IneligibleReason, string> = {
  minor: "Accounts are for adults at launch. Accounts for children are being considered for future years.",
  nonResident: "Only people resident in Ireland for tax can open one.",
  noPpsn: "You need a PPS number. You can apply for one through MyWelfare.",
  hasAccount: "Only one account per person at launch. You could move yours to another provider instead.",
  closedThisYear: "If you close an account during a year, you cannot open another until the next year.",
};
const YES_NO = [{ value: "yes" as const, label: "Yes" }, { value: "no" as const, label: "No" }];

function YesNoRow({ label, value, onChange }: { label: string; value: YesNo; onChange: (v: YesNo) => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line py-3.5">
      <span className="min-w-0 flex-1 basis-60 text-sm font-medium text-ink">{label}</span>
      <div role="radiogroup" aria-label={label} className="flex gap-1.5">
        {YES_NO.map((o) => (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={value === o.value}
            onClick={() => onChange(o.value)}
            className={`h-10 w-16 cursor-pointer border text-sm font-semibold transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
              value === o.value ? "border-primary-500 bg-primary-500 text-white" : "border-line bg-surface text-ink hover:border-primary-300"
            }`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function EligibilityChecker() {
  const [answers, setAnswers] = useState<Record<string, YesNo>>({});
  const pending = QUESTIONS.some((q) => !answers[q.key]);
  const reasons = pending
    ? []
    : eligibility(Object.fromEntries(QUESTIONS.map((q) => [q.key, answers[q.key] === "yes"])) as unknown as EligibilityAnswer);
  return (
    <div className="border border-line bg-surface p-6 sm:p-8">
      <div className="border-t border-line">
        {QUESTIONS.map((q) => (
          <YesNoRow key={q.key} label={q.text} value={answers[q.key] ?? ""} onChange={(v) => setAnswers((a) => ({ ...a, [q.key]: v }))} />
        ))}
      </div>
      <div aria-live="polite" className="mt-6">
        {pending ? (
          <p className="bg-surface-muted p-4 text-sm text-muted">Answer all five to see your result.</p>
        ) : reasons.length === 0 ? (
          <div className="bg-primary-50 p-4">
            <p className="font-display text-lg font-semibold text-ink">You could open one from 1 July 2027.</p>
            <p className="mt-1 text-sm text-ink-body">
              Subject to the final rules in the Finance (No. 2) Bill 2026. Providers will check your age, residence and PPS
              number when you apply.
            </p>
          </div>
        ) : (
          <div className="bg-amber-50 p-4">
            <p className="font-display text-lg font-semibold text-ink">Not under the rules in the Finance Bill.</p>
            {reasons.map((r) => (
              <p key={r} className="mt-1 text-sm text-ink-body">{REASONS[r]}</p>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const HALF_STEPS = (max: number) => Array.from({ length: max * 2 + 1 }, (_, k) => k / 2);

export function WrapperComparison() {
  const f = useFormat();
  const [lump, setLump] = useState(10_000);
  const [monthly, setMonthly] = useState(500);
  const [years, setYears] = useState(15);
  const [ret, setRet] = useState(5);
  const [div, setDiv] = useState(2);
  const [rateId, setRateId] = useState<string>("top");
  const [bad, setBad] = useState(false);

  const topRate = TOP_RATES.find((t) => t.id === rateId)!.rate;
  const r = compareWrappers({
    lump: Math.max(0, lump),
    monthly: Math.max(0, monthly),
    years: Math.min(30, Math.max(1, Math.round(years) || 1)),
    ret: ret / 100,
    dividendYield: div / 100,
    topRate,
    badYear: bad,
  });
  const a = r.account;
  const max = Math.max(a.final, r.etf.final, r.shares.final, 1);
  const heldAs = a.heldAs === "shares" ? "as shares bought directly" : "in the same ETF";
  const overText =
    a.overflow <= 0
      ? ""
      : `${f.eur0(a.overflow)} of it was over the ${f.eur0(INVESTMENT_ACCOUNT.annualLimit)} yearly limit. It waits outside, held ${heldAs} (whichever ends higher)` +
        (a.moved <= 0.5
          ? ", because no later year has room under the limit to take it in."
          : `, and moves into the account each January as the limit allows${a.left > 0.5 ? `; ${f.eur0(a.left)} is still outside at the end.` : ", all of it before the end."}`);
  const cards = [
    {
      title: "Investment Account",
      final: a.final,
      tax: a.tax + a.outsideTax,
      note: a.overflow > 0
        ? `${f.eur0(a.tax)} of it is the 1% account tax; ${f.eur0(a.outsideTax)} is tax on money waiting outside`
        : "No exit tax, no deemed disposal",
      bar: "bg-primary-500",
    },
    { title: "ETF outside the account", final: r.etf.final, tax: r.etf.tax, note: "35% exit tax, deemed disposal every 8 years", bar: "bg-ink/60" },
    {
      title: "Shares bought directly",
      final: r.shares.final,
      tax: r.shares.tax,
      note: `31% CGT on selling; dividends taxed each year at about ${Math.round(topRate * 100)}%`,
      bar: "bg-ink/30",
    },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="grid content-start gap-5 bg-surface-muted p-6">
        <CurrencyField label="Lump sum at the start" value={lump} onChange={setLump} />
        <CurrencyField label="Each month" value={monthly} onChange={setMonthly} />
        <NumericField label="Years (1 to 30)" value={years} onChange={setYears} />
        <SelectField label="Assumed return a year" value={String(ret)} onChange={(v) => setRet(Number(v))}>
          {HALF_STEPS(10).map((x) => <option key={x} value={x}>{f.rate(x)}</option>)}
        </SelectField>
        <SelectField
          label="Share dividend yield"
          value={String(div)}
          onChange={(v) => setDiv(Number(v))}
          hint="Part of the return above, paid out as dividends on direct shares."
        >
          {HALF_STEPS(5).map((x) => <option key={x} value={x}>{f.rate(x)}</option>)}
        </SelectField>
        <SelectField
          label="Your top rate of tax"
          value={rateId}
          onChange={setRateId}
          hint="Income tax, USC and PRSI together, for 2027. Used for share dividends only."
        >
          {TOP_RATES.map((t) => <option key={t.id} value={t.id}>{`${t.label}: about ${Math.round(t.rate * 100)}%`}</option>)}
        </SelectField>
        <label className="flex cursor-pointer items-center gap-2.5 border border-line bg-surface px-4 py-2.5 text-sm font-medium text-ink-body">
          <input type="checkbox" checked={bad} onChange={(e) => setBad(e.target.checked)} className="h-4 w-4 shrink-0 accent-primary-500" />
          Include a bad year (markets fall 20% in year 3)
        </label>
        <p className="text-xs leading-5 text-muted">
          Only {f.eur0(INVESTMENT_ACCOUNT.annualLimit)} a year can go into the account. Anything over that waits outside, in the
          same ETF or as shares bought directly (whichever ends higher), and moves in each January as the limit allows. Selling
          it to move it in is taxed. All of it is counted in the Investment Account total.
        </p>
      </div>

      <div className="min-w-0">
        <div className="grid gap-4 sm:grid-cols-3">
          {cards.map((c, k) => (
            <div key={c.title} className={`p-5 ${k === 0 ? "border-2 border-primary-500" : "border border-line"}`}>
              <p className="text-sm font-semibold text-ink">{c.title}</p>
              <p className="mt-2 font-display text-3xl font-bold tabular-nums text-ink">{f.eur0(c.final)}</p>
              <p className="text-sm text-muted">after tax</p>
              <p className="mt-3 text-sm">Tax paid: <strong className="tabular-nums">{f.eur0(c.tax)}</strong></p>
              <p className="text-sm text-muted">{c.note}</p>
            </div>
          ))}
        </div>

        <div className="mt-6 border border-line p-5">
          <p className="font-semibold text-ink">Final value after tax</p>
          <div className="mt-4 grid gap-3">
            {cards.map((c) => (
              <div key={c.title}>
                <div className="flex justify-between text-sm"><span>{c.title}</span><span className="tabular-nums">{f.eur0(c.final)}</span></div>
                <div className="mt-1 h-3.5 bg-surface-muted">
                  <div className={`h-full ${c.bar}`} style={{ width: `${Math.max(1, (c.final / max) * 100)}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-muted">
            You pay in {f.eur0(r.paid)} in total.{" "}
            {a.firstTaxYear === null
              ? `The account never goes above ${f.eur0(INVESTMENT_ACCOUNT.taxFreeThreshold)} on average, so no tax is due.`
              : `The 1% first applies in year ${a.firstTaxYear}.`}{" "}
            {overText}
          </p>
        </div>

        <details className="group mt-4 border border-line px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink [&::-webkit-details-marker]:hidden">
            Tax by year
            <span aria-hidden="true" className="text-muted transition-transform duration-200 group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-3 max-h-80 overflow-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="text-left text-muted">
                  <th className="border-b border-line p-2 font-semibold">Year</th>
                  <th className="border-b border-line p-2 font-semibold">Account average value</th>
                  <th className="border-b border-line p-2 font-semibold">Account 1% tax</th>
                  <th className="border-b border-line p-2 font-semibold">ETF deemed disposal tax</th>
                </tr>
              </thead>
              <tbody className="tabular-nums">
                {r.rows.map((row) => (
                  <tr key={row.year}>
                    <td className="border-b border-line p-2">{row.year}</td>
                    <td className="border-b border-line p-2">{f.eur0(row.average)}</td>
                    <td className="border-b border-line p-2">{f.eur0(row.accountTax)}</td>
                    <td className="border-b border-line p-2">{row.deemedTax > 0 ? f.eur0(row.deemedTax) : "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </details>

        <details className="group mt-4 border border-line px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink [&::-webkit-details-marker]:hidden">
            How each figure is worked out
            <span aria-hidden="true" className="text-muted transition-transform duration-200 group-open:rotate-180">⌄</span>
          </summary>
          <div className="mt-3 grid gap-3 text-sm leading-6">
            <p><strong className="text-ink">Investment Account.</strong> Each year: (average value − €50,000) × 1%, taken from the account. Nothing more when you withdraw. The law averages the daily values over the days the account is open; this averages the 12 month-end values of an account open all year. Source: <a className="text-primary-500 hover:underline" href="https://data.oireachtas.ie/ie/oireachtas/bill/2026/98/eng/initiated/b9826d.pdf">Finance (No. 2) Bill 2026, section 747Q</a>.</p>
            <p><strong className="text-ink">Money over the €12,000 limit.</strong> It waits outside, worked out both as the same ETF and as shares bought directly, and the higher result is shown. Each January, whatever room that year&apos;s payments leave under the limit is filled by selling the oldest of it and paying it in, with exit tax or CGT on its gain. The tax it pays outside is included in the account&apos;s tax.</p>
            <p><strong className="text-ink">ETF outside the account.</strong> Each month&apos;s purchase is taxed on its own 8th, 16th and 24th anniversary: 35% × (value − amount invested), less tax already paid, paid by selling units. The units sold to pay it are taxed too, using that credit. On the final sale: 35% × (value − amount invested), less the credits; any overpayment comes back. A loss on one purchase counts as nil and doesn&apos;t reduce the gain on another. Sources: Finance (No. 2) Bill 2026, new section 739DA; Revenue Tax and Duty Manuals <a className="text-primary-500 hover:underline" href="https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-27/27-04-01.pdf">27-04-01</a> and <a className="text-primary-500 hover:underline" href="https://www.revenue.ie/en/tax-professionals/tdm/income-tax-capital-gains-tax-corporation-tax/part-27/27-01a-02.pdf">27-01a-02</a>.</p>
            <p><strong className="text-ink">Shares bought directly.</strong> Dividends each year are taxed at your top rate (income tax, USC and PRSI), with the 25% withholding tax credited, and the rest is reinvested. On the final sale: (gain − €1,270) × 31%. The rate includes PRSI, as in Revenue&apos;s own example; an employee with only a little investment income may not pay PRSI on it, which would leave direct shares slightly better off. Sources: Revenue, <a className="text-primary-500 hover:underline" href="https://www.revenue.ie/en/gains-gifts-and-inheritance/transfering-an-asset/how-to-calculate-CGT.aspx">how to calculate CGT</a> and <a className="text-primary-500 hover:underline" href="https://www.revenue.ie/en/additional-incomes/dividend-income/index.aspx">dividend income</a>.</p>
            <p className="text-muted">All three: the same money on the same dates and the same total return a year, compounded monthly.</p>
          </div>
        </details>

        <p className="mt-4 text-xs leading-5 text-muted">
          Illustration only, not advice. One steady return every year and no fees. Real returns vary and can be negative.
          Provider fees are not yet published. At low returns (about 3% a year or less) the 1% charge can cost more than the tax
          it saves.
        </p>
      </div>
    </div>
  );
}
