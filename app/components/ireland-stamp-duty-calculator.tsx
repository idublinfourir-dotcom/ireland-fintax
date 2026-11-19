"use client";

/* Stamp duty on buying property. The maths lives in ../lib/ireland-stamp-duty;
   this collects the price and kind of property and shows the duty band by
   band. Nothing leaves the browser. */

import { useState } from "react";
import {
  computeStampDuty,
  NEW_HOME_VAT,
  STAMP_DUTY_LAST_REVIEWED,
  STAMP_DUTY_SOURCE_URL,
  type HomeVat,
  type PropertyKind,
} from "../lib/ireland-stamp-duty";
import { CurrencyField, ResultDisclaimer, SegmentedField, useFormat } from "./calculator-fields";
import { useT } from "./locale-link";
import { stampDutyMessages } from "../lib/messages/stamp-duty";

const hintClass = "mt-1 text-xs leading-5 text-muted";
const eyebrow = "text-xs font-semibold uppercase tracking-[0.16em] text-muted";

function Row({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className={`flex items-baseline justify-between gap-4 px-5 py-3 sm:px-6 ${strong ? "bg-surface-muted" : ""}`}>
      <dt className={`text-sm ${strong ? "font-semibold text-ink" : "text-ink-body"}`}>{label}</dt>
      <dd className={`text-sm tabular-nums ${strong ? "font-display font-semibold text-ink" : "font-medium text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}

export function IrelandStampDutyCalculator() {
  const t = useT(stampDutyMessages);
  const { money, eur0, pct1, rate } = useFormat();

  const [kind, setKind] = useState<PropertyKind>("residential");
  const [price, setPrice] = useState(0);
  const [residentialPart, setResidentialPart] = useState(0);
  const [vat, setVat] = useState<HomeVat>("none");

  const r = computeStampDuty({ kind, price, residentialPart, vat });
  const pct = (fraction: number) => rate(Math.round(fraction * 10_000) / 100);
  /* Intl writes the minus, so it sits on the correct side in Arabic. */
  const less = (n: number) => money(n > 0 ? -n : 0);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* inputs */}
      <div className="flex flex-col gap-5">
        <div className="border-s-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
          <span className="font-semibold text-ink">{t.introTitle}</span> {t.introBody}
        </div>

        <div>
          <SegmentedField
            label={t.kind}
            value={kind}
            onChange={setKind}
            options={(["residential", "nonResidential", "mixed"] as const).map((k) => ({ value: k, label: t.kinds[k] }))}
          />
          <p className={hintClass}>{t.kindHints[kind]}</p>
        </div>

        <CurrencyField
          label={t.price}
          value={price}
          onChange={setPrice}
          hint={kind === "residential" ? t.priceHint : t.priceHintNoVat}
        />

        {kind === "residential" && (
          <div>
            <SegmentedField
              label={t.newHome}
              value={vat}
              onChange={setVat}
              options={(["none", "house", "apartment"] as const).map((v) => ({ value: v, label: t.vats[v] }))}
            />
            <p className={hintClass}>
              {t.vatHints[vat].replace("{rate}", vat === "none" ? "" : pct(NEW_HOME_VAT[vat]))}
            </p>
          </div>
        )}

        {kind === "mixed" && (
          <CurrencyField
            label={t.homePart}
            value={residentialPart}
            onChange={setResidentialPart}
            hint={t.homePartHint}
          />
        )}
      </div>

      {/* results */}
      <div className="flex flex-col gap-5">
        <div className="border border-line bg-surface px-5 py-5 sm:px-6" aria-live="polite">
          <p className={eyebrow}>{t.totalHeading}</p>
          <p className="mt-3 font-display text-[2rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
            {money(r.total)}
          </p>
          <p className="mt-2.5 text-sm text-muted">{t.ofPrice.replace("{rate}", pct1(r.effectiveRate))}</p>
        </div>

        <div className="border border-line bg-surface">
          <p className={`${eyebrow} border-b border-line px-5 py-3 sm:px-6`}>{t.breakdown}</p>
          <dl className="divide-y divide-line">
            <Row label={t.rows.price} value={money(r.price)} />
            {r.vat > 0 && (
              <>
                <Row label={t.rows.vat.replace("{rate}", pct(r.vatRate))} value={less(r.vat)} />
                <Row label={t.rows.exVat} value={money(r.residential)} />
              </>
            )}
            {kind === "mixed" && (
              <>
                <Row label={t.rows.homePart} value={money(r.residential)} />
                <Row label={t.rows.otherPart} value={money(r.nonResidential)} />
              </>
            )}
            {r.slices.map((s) => (
              <Row
                key={s.rate}
                label={t.rows.slice
                  .replace("{amount}", Number.isInteger(s.amount) ? eur0(s.amount) : money(s.amount))
                  .replace("{rate}", pct(s.rate))}
                value={money(s.duty)}
              />
            ))}
            {r.rounding >= 0.005 && <Row label={t.rows.rounding} value={less(r.rounding)} />}
            <Row label={t.rows.total} value={money(r.total)} strong />
          </dl>
        </div>

        <div className="border border-line bg-surface p-5">
          <h2 className={eyebrow}>{t.notIncluded}</h2>
          <p className="mt-2 text-xs leading-5 text-muted">{t.notIncludedBody}</p>
        </div>

        <p className="text-xs leading-5 text-muted">{t.footnote}</p>
        <ResultDisclaimer asOf={STAMP_DUTY_LAST_REVIEWED} sourceUrl={STAMP_DUTY_SOURCE_URL} />
      </div>
    </div>
  );
}
