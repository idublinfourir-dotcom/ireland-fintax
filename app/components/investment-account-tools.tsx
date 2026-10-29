"use client";

/* The Investment Account page's calculator. Copy in
   messages/investment-account.ts (`calc`); all the maths is in
   lib/ireland-investment-account.ts; nothing here is stored or sent
   anywhere. */

import { useState } from "react";
import { CurrencyField, SelectField, useFormat } from "./calculator-fields";
import { useT } from "./locale-link";
import { INVESTMENT_ACCOUNT, projectAccount } from "../lib/ireland-investment-account";
import { localDate, MONTHS } from "../lib/i18n";
import { investmentAccountMessages } from "../lib/messages/investment-account";

/* July 2027, when providers are expected to start, to December 2030. */
const OPENINGS = Array.from({ length: 42 }, (_, k) => ({ year: 2027 + Math.floor((k + 6) / 12), month: (k + 6) % 12 }));
/* Left out of the year table on phones, so the tax and value columns fit. */
const COLUMNS = ["year", "days", "paidIn", "growth", "average", "tax", "end"] as const;
const WIDE_ONLY = new Set<(typeof COLUMNS)[number]>(["days", "growth"]);
const cell = "border-b border-line p-2 sm:p-2.5";
const steps = (max: number, step: number) => Array.from({ length: Math.round(max / step) + 1 }, (_, k) => k * step);

export function AccountProjection() {
  const f = useFormat();
  const t = useT(investmentAccountMessages).calc;
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
  const threshold = f.eur0(taxFreeThreshold);
  const tiles = [
    { label: t.paid, value: r.paid },
    { label: fee > 0 ? t.growthAfterFees : t.growthTile, value: r.growth },
    { label: t.taxTile, value: r.tax },
    { label: t.valueOn.replace("{year}", String(untilYear)), value: r.final, strong: true },
  ];

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)]">
      <div className="grid content-start gap-5 bg-surface-muted p-6">
        <SelectField label={t.opens} value={String(opening)} onChange={(v) => setOpening(Number(v))}>
          {OPENINGS.map((o, k) => (
            <option key={k} value={k}>
              {localDate(f.locale, `1 ${MONTHS[o.month]} ${o.year}`)}
            </option>
          ))}
        </SelectField>
        <CurrencyField label={t.first} value={firstPayment} onChange={setFirstPayment} />
        <CurrencyField label={t.monthly} value={monthly} onChange={setMonthly} hint={t.monthlyHint} />
        <CurrencyField label={t.yearly} value={yearly} onChange={setYearly} hint={t.yearlyHint} />
        <SelectField label={t.until} value={String(untilYear)} onChange={(v) => setUntil(Number(v))}>
          {Array.from({ length: 40 }, (_, k) => openYear + k).map((y) => <option key={y} value={y}>{y}</option>)}
        </SelectField>
        <SelectField label={t.growth} value={String(ret)} onChange={(v) => setRet(Number(v))} hint={t.growthHint}>
          {steps(10, 0.5).map((x) => <option key={x} value={x}>{f.rate(x)}</option>)}
        </SelectField>
        <SelectField label={t.fee} value={String(fee)} onChange={(v) => setFee(Number(v))} hint={t.feeHint}>
          {steps(1.5, 0.25).map((x) => <option key={x} value={x}>{f.rate(x)}</option>)}
        </SelectField>
      </div>

      <div className="min-w-0">
        <div className="grid gap-px border border-line bg-line sm:grid-cols-2 xl:grid-cols-4">
          {tiles.map((tile) => (
            <div key={tile.label} className="bg-surface p-5">
              <p className="text-sm text-muted">{tile.label}</p>
              <p className={`mt-1 font-display text-2xl font-bold tabular-nums ${tile.strong ? "text-primary-500" : "text-ink"}`}>{f.eur0(tile.value)}</p>
            </div>
          ))}
        </div>

        <div aria-live="polite" className="mt-4 grid gap-3 text-sm leading-6">
          <p>
            {r.firstTaxYear === null
              ? t.noTax.replace("{threshold}", threshold)
              : t.firstTax.replace("{year}", String(r.firstTaxYear)).replace("{threshold}", threshold)}{" "}
            {r.growth > 0 && r.tax > 0 && t.share.replace("{share}", f.pct1(r.tax / r.growth))}{" "}
            {t.noWithdrawalTax}
          </p>
          {r.refused > 0 && (
            <p className="bg-amber-50 p-3 text-amber-900">
              {t.refused.replace("{refused}", f.eur0(r.refused)).replace("{limit}", f.eur0(annualLimit))}
            </p>
          )}
        </div>

        <div className="mt-6 overflow-x-auto border border-line">
          <table className="w-full border-collapse text-xs sm:min-w-[40rem] sm:text-sm">
            <thead>
              <tr className="text-start text-muted">
                {COLUMNS.map((c) => (
                  <th key={c} className={`border-b border-line p-2 font-semibold sm:p-2.5 ${WIDE_ONLY.has(c) ? "hidden sm:table-cell" : ""}`}>{t.cols[c]}</th>
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
            {t.how}
            <span aria-hidden="true" className="text-muted transition-transform duration-200 group-open:rotate-180">⌄</span>
          </summary>
          <ul className="mt-3 list-disc space-y-2 ps-5 text-sm leading-6">
            {t.howItems.map((item) => (
              <li key={item}>{item.replaceAll("{threshold}", threshold).replace("{limit}", f.eur0(annualLimit))}</li>
            ))}
          </ul>
          <p className="mt-3 text-sm">
            {t.source}{" "}
            <a className="text-primary-500 hover:underline" href="https://data.oireachtas.ie/ie/oireachtas/bill/2026/98/eng/initiated/b9826d.pdf" target="_blank" rel="noopener noreferrer">
              {t.sourceLink}
            </a>
            .
          </p>
        </details>

        <p className="mt-4 text-xs leading-5 text-muted">{t.illustration}</p>
      </div>
    </div>
  );
}
