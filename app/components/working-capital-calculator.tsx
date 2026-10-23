"use client";

/* Working Capital calculator (finance) — current assets − current liabilities,
   plus the current and quick (acid-test) ratios. Standard financial-analysis
   metrics, not tax. All maths live in ../lib/working-capital (single source of
   truth). */

import { useMemo, useState } from "react";
import {
  computeWorkingCapital,
  type WorkingCapitalResult,
} from "../lib/working-capital";
import { CurrencyField, LegendDot, ProportionBar, useFormat } from "./calculator-fields";
import { useT } from "./locale-link";
import { numberFormat } from "../lib/i18n";
import { caMessages, type CaMessages } from "../lib/messages/ca";

/* Rule-of-thumb reading of a ratio — deliberately hedged. */
type Bands = CaMessages["wc"]["bands"];
function currentRatioBand(r: number | null, b: Bands): string {
  if (r === null) return b.none;
  if (r < 1) return b.currentUnder1;
  if (r < 1.5) return b.current1to15;
  if (r <= 3) return b.current15to3;
  return b.currentOver3;
}

function quickRatioBand(r: number | null, b: Bands): string {
  if (r === null) return b.none;
  if (r < 1) return b.quickUnder1;
  return b.quickOk;
}

function RatioCard({
  title,
  value,
  formula,
  reading,
}: {
  title: string;
  value: string;
  formula: string;
  reading: string;
}) {
  return (
    <div className="border border-line bg-surface p-5">
      <div className="flex items-baseline justify-between gap-4">
        <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
          {title}
        </h3>
        <span className="font-display text-lg font-semibold text-ink tabular-nums">
          {value}
        </span>
      </div>
      <p className="mt-1 text-xs text-muted tabular-nums">{formula}</p>
      <p className="mt-2 text-xs leading-5 text-ink-body">{reading}</p>
    </div>
  );
}

function ResultCard({ r }: { r: WorkingCapitalResult }) {
  const t = useT(caMessages).wc;
  const { money } = useFormat();
  const copy = t.verdict[r.direction];
  const view = {
    sub: copy.sub,
    tag: {
      text: copy.tag,
      cls: {
        surplus: "bg-primary-500 text-white",
        deficit: "bg-navy-900 text-white",
        balanced: "border border-line bg-surface-muted text-muted",
      }[r.direction],
    },
  };

  return (
    <div className="border border-line bg-surface">
      <div className="border-b border-line px-5 py-5 sm:px-6">
        <div className="flex items-baseline justify-between gap-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t.heading}
          </p>
          <span
            className={`rounded-none px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${view.tag.cls}`}
          >
            {view.tag.text}
          </span>
        </div>
        <p className="mt-3 font-display text-[2.5rem] font-semibold leading-none tracking-tight text-ink tabular-nums">
          {money(Math.abs(r.workingCapital))}
        </p>
        <p className="mt-2.5 text-sm text-muted">{view.sub}</p>
        <div className="mt-4">
          <ProportionBar
            segments={[
              {
                label: t.barAssets.replace("{amount}", money(r.currentAssets)),
                value: r.currentAssets,
                className: "bg-primary-500",
              },
              {
                label: t.barLiabilities.replace("{amount}", money(r.currentLiabilities)),
                value: r.currentLiabilities,
                className: "bg-navy-900",
              },
            ]}
          />
        </div>
      </div>
      <dl className="divide-y divide-line">
        <div className="flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <LegendDot className="bg-primary-500" />
            <span className="text-sm text-ink-body">{t.assets}</span>
          </div>
          <span className="text-sm font-medium text-ink tabular-nums">
            {money(r.currentAssets)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 px-5 py-3.5 sm:px-6">
          <div className="flex items-baseline gap-2.5">
            <LegendDot className="bg-navy-900" />
            <span className="text-sm text-ink-body">{t.liabilities}</span>
          </div>
          <span className="text-sm font-medium text-ink tabular-nums">
            {money(r.currentLiabilities)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-4 bg-surface-muted px-5 py-3.5 sm:px-6">
          <span className="text-sm font-semibold text-ink">
            {t.total}
          </span>
          <span className="font-display text-sm font-semibold text-ink tabular-nums">
            {money(r.workingCapital)}
          </span>
        </div>
      </dl>
    </div>
  );
}

export function WorkingCapitalCalculator() {
  const t = useT(caMessages).wc;
  const { locale } = useFormat();
  // "1.50×" / "1,50×": two decimals in the page's language.
  const two = numberFormat(locale, { minimumFractionDigits: 2, maximumFractionDigits: 2, useGrouping: false });
  const ratio = (n: number) => `${two.format(n)}×`;
  const [currentAssets, setCurrentAssets] = useState(0);
  const [currentLiabilities, setCurrentLiabilities] = useState(0);
  const [inventory, setInventory] = useState(0);

  const r = useMemo(
    () => computeWorkingCapital({ currentAssets, currentLiabilities, inventory }),
    [currentAssets, currentLiabilities, inventory],
  );

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      {/* inputs */}
      <div className="flex flex-col gap-5">
        <div className="border-s-[3px] border-primary-500 bg-surface-muted px-4 py-3 text-xs leading-5 text-ink-body">
          <span className="font-semibold text-ink">{t.introTitle}</span> {t.introBody}
        </div>

        <CurrencyField
          label={t.assets}
          value={currentAssets}
          onChange={setCurrentAssets}
          hint={t.assetsHint}
        />
        <CurrencyField
          label={t.liabilities}
          value={currentLiabilities}
          onChange={setCurrentLiabilities}
          hint={t.liabilitiesHint}
        />
        <CurrencyField
          label={t.inventory}
          value={inventory}
          onChange={setInventory}
          hint={t.inventoryHint}
        />

        <div className="mt-auto border border-line bg-surface p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            {t.snapshotTitle}
          </p>
          <p className="mt-2 text-xs leading-5 text-muted">
            {t.snapshotBody}
          </p>
        </div>
      </div>

      {/* results */}
      <div className="flex flex-col gap-5">
        <ResultCard r={r} />
        <div className="grid gap-5 sm:grid-cols-2">
          <RatioCard
            title={t.currentRatio}
            value={r.currentRatio === null ? "—" : ratio(r.currentRatio)}
            formula={t.currentFormula}
            reading={currentRatioBand(r.currentRatio, t.bands)}
          />
          <RatioCard
            title={t.quickRatio}
            value={r.quickRatio === null ? "—" : ratio(r.quickRatio)}
            formula={t.quickFormula}
            reading={quickRatioBand(r.quickRatio, t.bands)}
          />
        </div>
        <p className="border-t border-line pt-6 text-xs leading-5 text-muted">
          {t.disclaimer}
        </p>
      </div>
    </div>
  );
}
