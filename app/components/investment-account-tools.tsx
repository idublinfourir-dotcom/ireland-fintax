"use client";

/* The Investment Account page's calculator. English only (the page is not in
   TRANSLATED_PATHS). All the maths is in lib/ireland-investment-account.ts;
   nothing here is stored or sent anywhere. */

import { useState } from "react";
import { CurrencyField, SelectField, useFormat } from "./calculator-fields";
import { INVESTMENT_ACCOUNT, projectAccount } from "../lib/ireland-investment-account";

const MONTHS = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
/* July 2027, when providers are expected to start, to December 2030. */
const OPENINGS = Array.from({ length: 42 }, (_, k) => ({ year: 2027 + Math.floor((k + 6) / 12), month: (k + 6) % 12 }));
/* Left out of the year table on phones, so the tax and value columns fit. */
const WIDE_ONLY = new Set(["Days open", "Growth"]);
const cell = "border-b border-line p-2 sm:p-2.5";
const steps = (max: number, step: number) => Array.from({ length: Math.round(max / step) + 1 }, (_, k) => k * step);

export function AccountProjection() {
  const f = useFormat();
  const [opening, setOpening] = useState(0);
  const [firstPayment, setFirstPayment] = useState(5_000);
  const [monthly, setMonthly] = useState(500);
  const [yearly, setYearly] = useState(0);
  const [until, setUntil] = useState(2046);
  const [ret, setRet] = useState(5);
  const [fee, setFee] = useState(0);

  const { year: openYear, month: openMonth } = OPENINGS[opening];
  const untilYear = Math.max(until, openYear);
  const r = projectAccount({ openYear, openMonth, firstPayment, monthly, yearly, untilYear, ret: ret / 100, fee: fee / 100 });
  const { annualLimit, taxFreeThreshold } = INVESTMENT_ACCOUNT;
  const tiles = [
    { label: "You pay in", value: r.paid },
    { label: fee > 0 ? "Growth, after fees" : "Growth", value: r.growth },
    { label: "1% tax, all years", value: r.tax },
    { label: `Value on 31 December ${untilYear}`, value: r.final, strong: true },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="grid content-start gap-5 bg-surface-muted p-6">
        <SelectField label="Account opens on" value={String(opening)} onChange={(v) => setOpening(Number(v))}>
          {OPENINGS.map((o, k) => <option key={k} value={k}>{`1 ${MONTHS[o.month]} ${o.year}`}</option>)}
        </SelectField>
        <CurrencyField label="Paid in when it opens" value={firstPayment} onChange={setFirstPayment} />
        <CurrencyField label="Each month" value={monthly} onChange={setMonthly} hint="On the 1st, from the month it opens." />
        <CurrencyField label="Extra each January" value={yearly} onChange={setYearly} hint="From the second year on." />
        <SelectField label="Keep it until 31 December" value={String(untilYear)} onChange={(v) => setUntil(Number(v))}>
          {Array.from({ length: 40 }, (_, k) => openYear + k).map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectField>
        <SelectField
          label="Growth a year (your assumption)"
          value={String(ret)}
          onChange={(v) => setRet(Number(v))}
          hint="Not a forecast. Growth of the investments after their own fund charges. Real returns go up and down, and can be negative."
        >
          {steps(10, 0.5).map((x) => <option key={x} value={x}>{f.rate(x)}</option>)}
        </SelectField>
        <SelectField
          label="Provider fee a year"
          value={String(fee)}
          onChange={(v) => setFee(Number(v))}
          hint="No provider has published prices. Industry sources expect about 0.5% without advice, up to 1.5% with it."
        >
          {steps(1.5, 0.25).map((x) => <option key={x} value={x}>{f.rate(x)}</option>)}
        </SelectField>
      </div>

      <div className="min-w-0">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((t) => (
            <div key={t.label} className="bg-surface p-5">
              <p className="text-sm text-muted">{t.label}</p>
              <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${t.strong ? "text-primary-500" : "text-ink"}`}>{f.eur0(t.value)}</p>
            </div>
          ))}
        </div>

        <div aria-live="polite" className="mt-4 grid gap-3 text-sm leading-6">
          <p>
            {r.firstTaxYear === null
              ? `The average value never goes over ${f.eur0(taxFreeThreshold)} in a year, so no tax is due.`
              : `The 1% first applies in ${r.firstTaxYear}, the first year the average value goes over ${f.eur0(taxFreeThreshold)}.`}{" "}
            {r.growth > 0 && r.tax > 0 && `Over the whole period the tax comes to ${f.pct1(r.tax / r.growth)} of the growth.`}{" "}
            Taking money out is not taxed.
          </p>
          {r.refused > 0 && (
            <p className="bg-amber-50 p-3 text-amber-900">
              {f.eur0(r.refused)} of what you planned to pay in is over the {f.eur0(annualLimit)} limit for its calendar year,
              so it is left out. Providers are expected to refuse it: money over the limit is charged 1% a month until it is
              taken out.
            </p>
          )}
        </div>

        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full border-collapse text-xs sm:min-w-[40rem] sm:text-sm">
            <thead>
              <tr className="text-left text-muted">
                {["Year", "Days open", "Paid in", "Growth", "Average value", "1% tax", "Value at 31 Dec"].map((h) => (
                  <th key={h} className={`border-b border-line p-2 font-semibold sm:p-2.5 ${WIDE_ONLY.has(h) ? "hidden sm:table-cell" : ""}`}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="tabular-nums">
              {r.rows.map((row) => (
                <tr key={row.year}>
                  <td className={cell}>{row.year}</td>
                  <td className={`${cell} hidden sm:table-cell`}>{row.days}</td>
                  <td className={cell}>{f.eur0(row.paidIn)}</td>
                  <td className={`${cell} hidden sm:table-cell`}>{f.eur0(row.growth)}</td>
                  <td className={cell}>{f.eur0(row.average)}</td>
                  <td className={cell}>{row.tax > 0 ? f.money(row.tax) : "-"}</td>
                  <td className={cell}>{f.eur0(row.endValue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <details className="group mt-4 border border-line px-5 py-4">
          <summary className="flex cursor-pointer list-none items-center justify-between font-semibold text-ink [&::-webkit-details-marker]:hidden">
            How it is worked out
            <span aria-hidden="true" className="text-muted transition-transform duration-200 group-open:rotate-180">⌄</span>
          </summary>
          <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6">
            <li>The account is valued at the close of every calendar day it is open, weekends included. The average value is those daily values added up and divided by the number of days (section 747Q(5)).</li>
            <li>Tax for the year: (average value − {f.eur0(taxFreeThreshold)}) × 1%, nil if that is below zero (747Q(4) and (7)). In the year it opens, the average covers only the days it was open, and the {f.eur0(taxFreeThreshold)} is not reduced.</li>
            <li>The tax is taken from the account on 31 December here. The law lets the provider take it from the account or another way you agree, and pay it to Revenue by 14 April (747Q(6), 747T).</li>
            <li>At most {f.eur0(annualLimit)} is paid in each calendar year, whatever is taken out (747H, 747L). Payments are made on the 1st of the month.</li>
            <li>Growth and the provider fee are spread evenly over the days, so a full year grows by exactly the rate you chose, less the fee. Growth is shown after fees and before this tax.</li>
            <li>Nothing else is taxed: no exit tax, CGT, dividend withholding tax or deemed disposal inside the account, and nothing when you take money out (747P, Finance Bill s.27).</li>
          </ul>
          <p className="mt-3 text-sm">
            Source:{" "}
            <a className="text-primary-500 hover:underline" href="https://data.oireachtas.ie/ie/oireachtas/bill/2026/98/eng/initiated/b9826d.pdf" target="_blank" rel="noopener noreferrer">
              Finance (No. 2) Bill 2026, section 26, new Part 27A
            </a>
            .
          </p>
        </details>

        <p className="mt-4 text-xs leading-5 text-muted">
          Illustration only, not advice. It assumes one steady return every year; real returns vary and can be negative. Rules
          are as in the Finance (No. 2) Bill 2026 and may change before it becomes law.
        </p>
      </div>
    </div>
  );
}
