"use client";

/* Rental income tax: Rent-a-Room Relief against having the rent taxed. The
   maths lives in ../lib/ireland-rental-tax (on top of the income tax
   engine); this collects the inputs and shows both answers side by side. */

import { useMemo, useState } from "react";
import type { MaritalStatus, YearRates } from "../lib/ireland-income-tax";
import {
  computeRentalTax,
  RENT_A_ROOM_LIMIT,
  RENT_A_ROOM_PENDING,
  RENTAL_LAST_REVIEWED,
  RENTAL_SOURCE_URL,
  type Letting,
} from "../lib/ireland-rental-tax";
import {
  CurrencyField,
  NumericField,
  ResultDisclaimer,
  SegmentedField,
  useFormat,
} from "./calculator-fields";
import { useT } from "./locale-link";
import { rentalMessages } from "../lib/messages/rental";
import { incomeTaxMessages } from "../lib/messages/income-tax";

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

function Answer({ heading, value, sub }: { heading: string; value: string; sub: string }) {
  return (
    <div className="border border-line bg-surface px-5 py-5 sm:px-6">
      <p className={eyebrow}>{heading}</p>
      <p className="mt-3 font-display text-[2rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
        {value}
      </p>
      <p className="mt-2.5 text-sm text-muted">{sub}</p>
    </div>
  );
}

export function IrelandRentalTaxCalculator({
  ratesByYear,
  defaultYear,
}: {
  ratesByYear: Record<number, YearRates>;
  defaultYear: number;
}) {
  const t = useT(rentalMessages);
  const it = useT(incomeTaxMessages);
  const { money, eur0, pct1 } = useFormat();

  const years = Object.keys(RENT_A_ROOM_LIMIT).map(Number).filter((y) => ratesByYear[y]);
  const [year, setYear] = useState(years.includes(defaultYear) ? defaultYear : years[0]);
  const [letting, setLetting] = useState<Letting>("room");
  const [grossRent, setGrossRent] = useState(0);
  const [expenses, setExpenses] = useState(0);
  const [furnishings, setFurnishings] = useState(0);
  const [rprir, setRprir] = useState(false);
  const [status, setStatus] = useState<MaritalStatus>("single");
  const [age, setAge] = useState(40);
  const [employment, setEmployment] = useState(0);
  const [selfEmployment, setSelfEmployment] = useState(0);
  const [spouse, setSpouse] = useState(0);

  const otherYear = years.find((y) => y !== year);
  const [r, other] = useMemo(() => {
    const run = (y: number) =>
      computeRentalTax(
        {
          letting,
          grossRent,
          expenses,
          furnishings,
          rprir,
          person: {
            maritalStatus: status,
            hasChildOnChildBenefit: false,
            isPrincipalCarerOfDependentChild: false,
            age,
            employmentIncome: employment,
            selfEmploymentOrOtherIncome: selfEmployment,
            spouseEmploymentIncome: spouse,
            pensionContribution: 0,
          },
        },
        y,
        ratesByYear[y],
      );
    return [run(year), otherYear === undefined ? null : run(otherYear)] as const;
  }, [letting, grossRent, expenses, furnishings, rprir, status, age, employment, selfEmployment, spouse, year, otherYear, ratesByYear]);

  const s = r.standard;
  /* Intl writes the minus, so it sits on the correct side in Arabic. */
  const less = (n: number) => money(n > 0 ? -n : 0);
  const ofRent = t.ofRent.replace("{rate}", pct1(r.grossRent > 0 ? s.total / r.grossRent : 0));
  const room = r.room;
  const verdict =
    !room || !room.qualifies || r.grossRent === 0
      ? null
      : s.total > 0
        ? t.verdictSaves.replace("{amount}", money(s.total))
        : r.loss > 0
          ? t.verdictLoss.replace("{loss}", money(r.loss))
          : t.verdictNone;

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* inputs */}
      <div className="flex flex-col gap-5">
        <div className="border-s-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
          <span className="font-semibold text-ink">{t.introTitle}</span> {t.introBody}
        </div>

        <div>
          <SegmentedField
            label={t.year}
            value={String(year)}
            onChange={(v) => setYear(Number(v))}
            options={years.map((y) => ({ value: String(y), label: String(y) }))}
          />
          {RENT_A_ROOM_PENDING.includes(year) && (
            <p className={hintClass}>
              {t.pendingYear.replace("{limit}", eur0(r.limit)).replace("{year}", String(year))}
            </p>
          )}
        </div>

        <div>
          <SegmentedField
            label={t.letting}
            value={letting}
            onChange={setLetting}
            options={[
              { value: "room", label: t.room },
              { value: "property", label: t.property },
            ]}
          />
          <p className={hintClass}>{letting === "room" ? t.roomHint : t.propertyHint}</p>
        </div>

        <CurrencyField
          label={t.rent}
          value={grossRent}
          onChange={setGrossRent}
          hint={letting === "room" ? t.rentHintRoom : t.rentHintProperty}
        />
        <CurrencyField label={t.expenses} value={expenses} onChange={setExpenses} hint={t.expensesHint} />
        <CurrencyField label={t.furnishings} value={furnishings} onChange={setFurnishings} hint={t.furnishingsHint} />

        {letting === "property" && (
          <div>
            <label className="flex cursor-pointer items-start gap-2.5 border border-line bg-surface-muted px-4 py-2.5 text-sm font-medium text-ink-body transition-colors duration-200 hover:text-ink">
              <input
                type="checkbox"
                checked={rprir}
                onChange={(e) => setRprir(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 accent-primary-500"
              />
              {t.rprir}
            </label>
            <p className={hintClass}>{t.rprirHint}</p>
          </div>
        )}

        <div className="mt-2 border-t border-line pt-5">
          <p className="font-display text-base font-medium tracking-tight text-ink">{t.youHeading}</p>
          <p className={hintClass}>{t.youHint}</p>
        </div>
        <div>
          <SegmentedField
            label={it.marital}
            value={status}
            onChange={setStatus}
            options={[
              { value: "single", label: it.single },
              { value: "married", label: it.married },
            ]}
          />
          {status === "married" && <p className={hintClass}>{t.marriedHint}</p>}
        </div>
        <NumericField label={it.age.replace("{current}", String(year))} value={age} onChange={setAge} />
        <CurrencyField label={it.employment} value={employment} onChange={setEmployment} />
        <CurrencyField label={it.selfEmployment} value={selfEmployment} onChange={setSelfEmployment} />
        {status === "married" && (
          <CurrencyField label={it.spouseEmployment} value={spouse} onChange={setSpouse} />
        )}
      </div>

      {/* results */}
      <div className="flex flex-col gap-5">
        {room ? (
          <div className="grid gap-3 sm:grid-cols-2">
            <Answer
              heading={t.roomHeading}
              value={room.qualifies ? money(0) : t.notAvailable}
              sub={
                room.qualifies
                  ? t.under
                      .replace("{amount}", eur0(room.headroom))
                      .replace("{limit}", eur0(r.limit))
                      .replace("{year}", String(year))
                  : t.over
                      .replace("{amount}", money(room.overBy))
                      .replace("{limit}", eur0(r.limit))
                      .replace("{rent}", money(r.grossRent))
              }
            />
            <Answer heading={t.standardHeading} value={money(s.total)} sub={ofRent} />
          </div>
        ) : (
          <Answer heading={t.propertyHeading} value={money(s.total)} sub={ofRent} />
        )}

        {verdict && (
          <p className="border-s-[3px] border-primary-500 bg-primary-50 px-4 py-3 text-sm leading-6 text-ink" aria-live="polite">
            {verdict}
          </p>
        )}

        <div className="border border-line bg-surface">
          <p className={`${eyebrow} border-b border-line px-5 py-3 sm:px-6`}>
            {room ? t.breakdownRoom : t.breakdownProperty}
          </p>
          <dl className="divide-y divide-line">
            <Row label={t.rows.gross} value={money(r.grossRent)} />
            <Row label={t.rows.expenses} value={less(r.expenses)} />
            <Row label={t.rows.wearAndTear} value={less(r.wearAndTear)} />
            {r.loss > 0 ? (
              <Row label={t.rows.loss} value={money(r.loss)} strong />
            ) : (
              <Row label={t.rows.profit} value={money(r.profit)} strong />
            )}
            <Row label={t.rows.incomeTax} value={money(s.incomeTax)} />
            {s.rprir > 0 && <Row label={t.rows.rprir} value={less(s.rprir)} />}
            <Row label={t.rows.usc} value={money(s.usc)} />
            <Row label={t.rows.prsi} value={money(s.prsi)} />
            <Row label={t.rows.total} value={money(s.total)} strong />
            {other && otherYear !== undefined && other.standard.total !== s.total && (
              <Row label={t.otherYear.replace("{year}", String(otherYear))} value={money(other.standard.total)} />
            )}
          </dl>
        </div>

        {!room && r.loss > 0 && <p className="text-sm leading-6 text-muted">{t.lossNote.replace("{loss}", money(r.loss))}</p>}

        {room && (
          <div className="border border-line bg-surface p-5">
            <h2 className={eyebrow}>{t.conditionsTitle}</h2>
            <ul className="mt-3 list-disc space-y-1.5 ps-4 text-xs leading-5 text-ink-body">
              {t.conditions.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="border border-line bg-surface p-5">
          <h2 className={eyebrow}>{t.notIncluded}</h2>
          <p className="mt-2 text-xs leading-5 text-muted">{t.notIncludedBody}</p>
        </div>

        <p className="text-xs leading-5 text-muted">{t.footnote}</p>
        <ResultDisclaimer asOf={RENTAL_LAST_REVIEWED} sourceUrl={RENTAL_SOURCE_URL} />
      </div>
    </div>
  );
}
