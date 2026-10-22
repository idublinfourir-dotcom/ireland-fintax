"use client";

/* Two-in-one tool on the Capital Allowances page:
   • Capital allowances (tax)  — wear & tear / writing-down allowances.
   • Working capital (finance) — assets − liabilities + liquidity ratios.
   A sub-tab switches between them; the explainer cards below follow the mode. */

import { useState } from "react";
import { IrelandCapitalAllowancesCalculator } from "./ireland-capital-allowances-calculator";
import { WorkingCapitalCalculator } from "./working-capital-calculator";
import type { CaConfig } from "../lib/ireland-capital-allowances";
import { useT } from "./locale-link";
import { caMessages } from "../lib/messages/ca";

type Mode = "tax" | "finance";

/* Notes per mode: caMessages.modeNotes. */

export function CapitalAllowancesTool({ config }: { config: CaConfig }) {
  const t = useT(caMessages);
  const [mode, setMode] = useState<Mode>("tax");

  return (
    <>
      <div
        role="tablist"
        aria-label={t.modeLabel}
        className="mb-6 flex flex-wrap gap-1.5 rounded-none border border-line bg-surface-muted p-1"
      >
        {(
          [
            ["tax", t.modeTax],
            ["finance", t.modeFinance],
          ] as [Mode, string][]
        ).map(([m, label]) => {
          const active = mode === m;
          return (
            <button
              key={m}
              type="button"
              role="tab"
              aria-selected={active}
              onClick={() => setMode(m)}
              className={`flex-1 cursor-pointer rounded-none px-4 py-2.5 text-sm font-semibold whitespace-nowrap transition-colors duration-200 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 ${
                active ? "bg-primary-500 text-white" : "text-ink hover:bg-surface"
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="rounded-none border border-line bg-canvas p-6 sm:p-8 lg:p-10">
        {mode === "tax" ? (
          <IrelandCapitalAllowancesCalculator config={config} />
        ) : (
          <WorkingCapitalCalculator />
        )}
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-3">
        {t.modeNotes[mode].map((note) => (
          <div key={note.title} className="rounded-none border border-line bg-surface p-6">
            <h2 className="font-display text-base font-medium tracking-tight text-ink">
              {note.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{note.body}</p>
          </div>
        ))}
      </div>
    </>
  );
}
