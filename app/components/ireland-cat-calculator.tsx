"use client";

/* Ireland CAT calculator: gift & inheritance tax for one benefit.
   Left: inputs (benefit type, relationship, value, liabilities, relief, small
   gift toggle, prior same-group benefits, valuation month). Right: the computed
   breakdown: market value → incumbrance-free → relief → small gift → taxable →
   threshold → CAT due. All maths live in ../lib/ireland-cat (single source). */

import { useState } from "react";
import {
  computeCat,
  RELATIONSHIPS,
  CAT_LAST_REVIEWED,
  CAT_SOURCE_URL,
  type BenefitType,
  type CatConfig,
  type Relationship,
  type ReliefKind,
} from "../lib/ireland-cat";
import {
  CurrencyField,
  SegmentedField,
  SelectField,
  ResultDisclaimer,
  useFormat,
} from "./calculator-fields";
import { useT } from "./locale-link";
import { catMessages } from "../lib/messages/cat";
import { fill } from "./ui";

/* Months, relationship notes and relief names: catMessages. */

function Line({ label, value, strong = false, muted = false }: {
  label: string; value: string; strong?: boolean; muted?: boolean;
}) {
  return (
    <div className={`flex items-baseline justify-between gap-4 px-5 py-3 sm:px-6 ${strong ? "bg-surface-muted" : ""}`}>
      <dt className={`text-sm ${strong ? "font-semibold text-ink" : muted ? "text-muted" : "text-ink-body"}`}>
        {label}
      </dt>
      <dd className={`tabular-nums ${strong ? "font-display text-sm font-semibold text-ink" : "text-sm font-medium text-ink"}`}>
        {value}
      </dd>
    </div>
  );
}

export function IrelandCatCalculator({ config }: { config: CatConfig }) {
  const t = useT(catMessages);
  const { money, eur0, rate } = useFormat();
  const computed = (s: string) => t.computed[s] ?? s;
  const smallGift = eur0(config.smallGiftExemptionEur);
  const [benefitType, setBenefitType] = useState<BenefitType>("gift");
  const [relationship, setRelationship] = useState<Relationship>("child");
  const [marketValue, setMarketValue] = useState(0);
  const [deductibleLiabilities, setDeductibleLiabilities] = useState(0);
  const [relief, setRelief] = useState<ReliefKind>("none");
  const [applySmallGift, setApplySmallGift] = useState(true);
  const [priorBenefits, setPriorBenefits] = useState(0);
  const [valuationMonth, setValuationMonth] = useState(6);
  const [takenBeforeRise, setTakenBeforeRise] = useState(false);

  const r = computeCat(
    {
      benefitType,
      relationship,
      marketValue,
      deductibleLiabilities,
      relief,
      applySmallGiftExemption: applySmallGift,
      priorBenefits,
      valuationMonth,
      takenBeforeRise,
    },
    config,
  );

  const isGift = benefitType === "gift";

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* inputs */}
      <div className="flex flex-col gap-5">
        <div className="border-s-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
          <span className="font-semibold text-ink">{t.introTitle}</span>{" "}
          {t.introBody.replace("{amount}", smallGift)}
        </div>

        <SegmentedField<BenefitType>
          label={t.benefitType}
          value={benefitType}
          onChange={setBenefitType}
          options={[
            { value: "gift", label: t.gift },
            { value: "inheritance", label: t.inheritance },
          ]}
        />

        <SelectField
          label={t.relationship}
          value={relationship}
          onChange={(v) => setRelationship(v as Relationship)}
          hint={
            <>
              {fill(t.groupLine, {
                note: t.groupNotes[relationship],
                group: <span className="font-semibold text-ink">{r.group}</span>,
                threshold: <span className="font-semibold text-ink">{money(r.groupThreshold)}</span>,
              })}
            </>
          }
        >
          {RELATIONSHIPS.map((rel) => (
            <option key={rel.value} value={rel.value}>{t.relationships[rel.value]}</option>
          ))}
        </SelectField>

        <SelectField
          label={t.taken}
          value={takenBeforeRise ? "before" : "after"}
          onChange={(v) => setTakenBeforeRise(v === "before")}
          hint={t.takenHint}
        >
          <option value="after">{t.takenAfter}</option>
          <option value="before">{t.takenBefore}</option>
        </SelectField>

        <CurrencyField
          label={t.marketValue}
          value={marketValue}
          onChange={setMarketValue}
          hint={t.marketValueHint}
        />

        <CurrencyField
          label={t.liabilities}
          value={deductibleLiabilities}
          onChange={setDeductibleLiabilities}
          hint={t.liabilitiesHint}
        />

        <SegmentedField<ReliefKind>
          label={t.relief}
          value={relief}
          onChange={setRelief}
          options={[
            { value: "none", label: t.none },
            { value: "agricultural", label: t.agricultural.replace("{rate}", rate(config.reliefs.agriculturalPercent)) },
            { value: "business", label: t.business.replace("{rate}", rate(config.reliefs.businessPercent)) },
            { value: "dwelling-house", label: t.dwelling.replace("{rate}", rate(config.reliefs.dwellingHousePercent)) },
          ]}
        />

        {isGift && (
          <SegmentedField<"on" | "off">
            label={t.applySmallGift.replace("{amount}", smallGift)}
            value={applySmallGift ? "on" : "off"}
            onChange={(v) => setApplySmallGift(v === "on")}
            options={[
              { value: "on", label: t.apply },
              { value: "off", label: t.skip },
            ]}
          />
        )}

        <CurrencyField
          label={t.prior}
          value={priorBenefits}
          onChange={setPriorBenefits}
          hint={t.priorHint}
        />

        <SelectField
          label={t.valuationMonth}
          value={String(valuationMonth)}
          onChange={(v) => setValuationMonth(Number(v))}
          hint={r.paymentDue ? t.payBy.replace("{date}", computed(r.paymentDue)) : undefined}
        >
          {t.months.map((name, i) => (
            <option key={name} value={i + 1}>{name}</option>
          ))}
        </SelectField>
      </div>

      {/* result */}
      <div className="flex flex-col">
        <div className="border border-line bg-surface">
          <div className="border-b border-line px-5 py-5 sm:px-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {t.catDue}
              </p>
              <span className="rounded-none bg-navy-900 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-white">
                {t.groupBadge.replace("{group}", r.group).replace("{rate}", rate(r.ratePercent))}
              </span>
            </div>
            <p className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
              {money(r.catDue)}
            </p>
            <p className="mt-2.5 text-sm text-muted">
              {r.taxableExcess > 0
                ? t.above
                    .replace("{excess}", money(r.taxableExcess))
                    .replace("{threshold}", money(r.groupThreshold))
                    .replace("{group}", r.group)
                : t.within.replace("{threshold}", money(r.groupThreshold)).replace("{group}", r.group)}
            </p>
          </div>
          <dl className="divide-y divide-line">
            <Line label={t.lineMarket} value={money(r.marketValue)} />
            {r.deductibleLiabilities > 0 && (
              <Line label={t.lessLiabilities} value={`− ${money(r.deductibleLiabilities)}`} muted />
            )}
            {r.reliefPercent > 0 && (
              <Line
                label={t.lessRelief
                  .replace("{relief}", relief === "none" ? r.reliefLabel : t.reliefNames[relief])
                  .replace("{rate}", rate(r.reliefPercent))}
                value={`− ${money(r.reliefAmount)}`}
                muted
              />
            )}
            {r.smallGiftExemptionApplied > 0 && (
              <Line label={t.lessSmallGift} value={`− ${money(r.smallGiftExemptionApplied)}`} muted />
            )}
            <Line label={t.taxableValue} value={money(r.currentTaxableValue)} />
            {r.priorBenefits > 0 && (
              <Line label={t.priorInGroup} value={money(r.priorBenefits)} muted />
            )}
            <Line label={t.remaining} value={money(r.thresholdRemaining)} muted />
            <Line label={t.excess} value={money(r.taxableExcess)} />
            <Line label={t.catAt.replace("{rate}", rate(r.ratePercent))} value={money(r.catDue)} strong />
          </dl>
          <p className="border-t border-line px-5 py-3 text-xs leading-5 text-muted sm:px-6">
            {r.paymentDue
              ? t.basedOn
                  .replace("{month}", t.months[valuationMonth - 1])
                  .replace("{date}", computed(r.paymentDue))
              : t.setMonth}
          </p>
        </div>
        <ResultDisclaimer asOf={CAT_LAST_REVIEWED} sourceUrl={CAT_SOURCE_URL} />
      </div>
    </div>
  );
}
