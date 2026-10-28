"use client";

/* Ireland R&D Corporation Tax Credit calculator: 35% of qualifying R&D spend,
   paid over three annual instalments (greater of 50% / €87,500 in year one,
   then 3/5 and the balance). The user enters only spend they judge eligible;
   this component never decides what qualifies. The editable rates/thresholds
   arrive as `config` (admin-editable, DB-backed with a code fallback); the
   maths + the two prose-only fields (effectiveBenefitPercent, effectiveFrom)
   live in ../lib/ireland-rd-tax-credit. */

import { useMemo, useState } from "react";
import {
  computeRdCredit,
  rdConfigForPeriod,
  RD_EARLIER_PERIOD,
  RD_LAST_REVIEWED,
  RD_SOURCE_URL,
  type RdConfig,
} from "../lib/ireland-rd-tax-credit";
import {
  CurrencyField,
  LegendDot,
  ProportionBar,
  ResultDisclaimer,
  SegmentedField,
  useFormat,
} from "./calculator-fields";
import { useT } from "./locale-link";
import { rdMessages } from "../lib/messages/rd";
import { fill } from "./ui";


/* One instalment row: swatch · year + when · amount. */
function InstalmentRow({
  dotClass,
  year,
  when,
  value,
}: {
  dotClass: string;
  year: string;
  when: string;
  value: string;
}) {
  return (
    <div className="flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-6">
      <dt className="flex items-baseline gap-2.5">
        <LegendDot className={dotClass} />
        <div>
          <span className="text-sm text-ink-body">{year}</span>
          <span className="mt-0.5 block text-xs text-muted">{when}</span>
        </div>
      </dt>
      <dd className="text-sm font-medium text-ink tabular-nums">{value}</dd>
    </div>
  );
}

export function IrelandRdTaxCreditCalculator({ config: current }: { config: RdConfig }) {
  const t = useT(rdMessages);
  const { money, eur0, rate } = useFormat();
  const [spend, setSpend] = useState(0);
  const [grant, setGrant] = useState(0);
  /* Periods with a return due before 23 Sep 2027 keep 30% and €75,000. */
  const [period, setPeriod] = useState<"current" | "earlier">("current");
  const config = useMemo(() => rdConfigForPeriod(current, period === "earlier"), [current, period]);
  const threshold = eur0(config.firstYearThresholdEur);
  const combined = config.ratePercent + config.tradingDeductionPercent;

  const r = useMemo(() => computeRdCredit(spend, grant, config), [spend, grant, config]);
  const { year1, year2, year3 } = r.instalments;

  // Explain which arm of the instalment rule applied, in plain words.
  const instalmentNote = (
    r.paidInFullYearOne
      ? t.paidInFull
      : year1 === config.firstYearThresholdEur
        ? t.floorWins
        : t.halfWins
  ).replace("{threshold}", threshold);

  return (
    <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
      {/* input */}
      <div className="flex flex-col gap-5">
        <div className="border-s-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
          <span className="font-semibold text-ink">{t.introTitle}</span>{" "}
          {t.introBody
            .replace("{rate}", rate(config.ratePercent))
            .replace("{deduction}", rate(config.tradingDeductionPercent))
            .replace("{combined}", rate(combined))}
        </div>

        <div>
          <SegmentedField<"current" | "earlier">
            label={t.period}
            value={period}
            onChange={setPeriod}
            options={[
              { value: "current", label: `${t.periodCurrent} · ${rate(current.ratePercent)}` },
              { value: "earlier", label: `${t.periodEarlier} · ${rate(RD_EARLIER_PERIOD.ratePercent)}` },
            ]}
          />
          <p className="mt-1 text-xs leading-5 text-muted">
            {t.periodHint
              .replace("{rate}", rate(current.ratePercent))
              .replace("{threshold}", eur0(current.firstYearThresholdEur))
              .replace("{oldRate}", rate(RD_EARLIER_PERIOD.ratePercent))
              .replace("{oldThreshold}", eur0(RD_EARLIER_PERIOD.firstYearThresholdEur))}
          </p>
        </div>

        <CurrencyField
          label={t.spend}
          value={spend}
          onChange={setSpend}
          hint={t.spendHint}
        />

        <CurrencyField
          label={t.grant}
          value={grant}
          onChange={setGrant}
          hint={t.grantHint}
        />

        {r.grantFunding > 0 && (
          <div className="border border-line bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
            {fill(t.qualifyingLine, {
              gross: money(r.grossExpenditure),
              grant: money(r.grantFunding),
              net: (
                <span className="font-semibold text-ink tabular-nums">
                  {money(r.qualifyingSpend)}
                </span>
              ),
            })}
          </div>
        )}

        <div className="mt-auto border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t.hardPartTitle}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted">
            {/* Ends with RD_CREDIT.effectiveFrom, written into the copy: it is
                prose-only and not editable. Change both together. */}
            {t.hardPartBody}
          </p>
        </div>
      </div>

      {/* results */}
      <div className="flex flex-col">
        <div className="border border-line bg-surface">
          {/* hero: the credit */}
          <div className="border-b border-line px-5 py-5 sm:px-6">
            <div className="flex items-baseline justify-between gap-4">
              <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
                {t.heading}
              </p>
              <span className="text-xs text-muted tabular-nums">
                {t.rateOf.replace("{rate}", rate(config.ratePercent)).replace("{amount}", money(r.qualifyingSpend))}
              </span>
            </div>
            <p className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
              {money(r.credit)}
            </p>
            <p className="mt-2.5 text-sm text-muted">
              {fill(t.plusDeduction, {
                deduction: money(r.tradingDeductionValue),
                combined: (
                  <span className="font-semibold text-primary-600 tabular-nums">
                    {money(r.combinedBenefit)}
                  </span>
                ),
                percent: rate(combined),
              })}
            </p>
            <div className="mt-4">
              <ProportionBar
                segments={[
                  { label: t.bar.replace("{n}", "1").replace("{amount}", money(year1)), value: year1, className: "bg-primary-500" },
                  { label: t.bar.replace("{n}", "2").replace("{amount}", money(year2)), value: year2, className: "bg-navy-900" },
                  { label: t.bar.replace("{n}", "3").replace("{amount}", money(year3)), value: year3, className: "bg-primary-300" },
                ]}
              />
            </div>
          </div>

          {/* instalment schedule */}
          <dl className="divide-y divide-line">
            <InstalmentRow
              dotClass="bg-primary-500"
              year={t.year1}
              when={t.year1When}
              value={money(year1)}
            />
            <InstalmentRow
              dotClass="bg-navy-900"
              year={t.year2}
              when={t.year2When}
              value={money(year2)}
            />
            <InstalmentRow
              dotClass="bg-primary-300"
              year={t.year3}
              when={t.year3When}
              value={money(year3)}
            />
            <div className="flex items-baseline justify-between gap-4 bg-surface-muted px-5 py-3.5 sm:px-6">
              <dt className="text-sm font-semibold text-ink">{t.total}</dt>
              <dd className="font-display text-sm font-semibold text-ink tabular-nums">
                {money(r.credit)}
              </dd>
            </div>
          </dl>

          <p className="border-t border-line px-5 py-3 text-xs leading-5 text-muted sm:px-6">
            {instalmentNote}
          </p>
        </div>

        {/* how it's paid: info note */}
        <div className="mt-5 border border-line bg-surface p-5">
          <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t.threeTitle}
          </h2>
          <p className="mt-2 text-xs leading-5 text-muted">
            {t.threeBody.replace("{threshold}", threshold)}
          </p>
        </div>

        <ResultDisclaimer asOf={RD_LAST_REVIEWED} sourceUrl={RD_SOURCE_URL} />
      </div>
    </div>
  );
}
