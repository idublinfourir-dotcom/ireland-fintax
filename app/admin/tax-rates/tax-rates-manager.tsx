"use client";

/* Admin editor for the Ireland income tax calculator: one card per tax year,
   covering income tax bands/credits, USC, PRSI and pension relief. TWO-PHASE:
   "Review change" lists the fields that changed, "Confirm" upserts the year's
   document in tax_rates, records it in the change log and revalidates the
   public calculator: no deploy. Percentages are shown and entered as percent
   (20, 0.5) and stored as fractions (0.2, 0.005). */

import { useActionState } from "react";
import type { YearRates } from "../../lib/ireland-income-tax";
import type { RateAuditRow } from "../../lib/rate-audit";
import type { DiffEntry } from "../../lib/rate-diff";
import { saveTaxYear, type TwoPhaseState } from "./actions";
import { submitKeepingValues } from "../submit-keeping-values";

const IDLE: TwoPhaseState = { status: "idle" };

const primaryBtn =
  "inline-flex h-9 cursor-pointer items-center rounded-none bg-primary-500 px-4 text-xs font-semibold text-white transition-colors duration-200 hover:bg-primary-600 disabled:opacity-60";
const outlineBtn =
  "inline-flex h-9 cursor-pointer items-center rounded-none border border-line bg-white px-4 text-xs font-semibold text-ink transition-colors duration-200 hover:border-primary-300 disabled:opacity-60";

const inputClass =
  "h-9 w-full rounded-none border border-line bg-white px-2.5 text-sm text-ink transition-colors duration-200 focus:border-primary-400 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary-400/40";

const toPct = (fraction: number) => +(fraction * 100).toFixed(4);

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-semibold uppercase tracking-wide text-muted">
        {label}
      </span>
      {children}
    </label>
  );
}

function Euro({ name, value, label }: { name: string; value: number; label: string }) {
  return (
    <Field label={label}>
      <input name={name} type="number" step="any" min="0" defaultValue={value} className={inputClass} required />
    </Field>
  );
}

function Pct({ name, value, label }: { name: string; value: number; label: string }) {
  return (
    <Field label={`${label} (%)`}>
      <input name={name} type="number" step="any" min="0" max="100" defaultValue={toPct(value)} className={inputClass} required />
    </Field>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h4 className="mt-5 border-b border-line pb-1.5 text-sm font-semibold text-ink">
      {children}
    </h4>
  );
}

function StateNote({ state }: { state: TwoPhaseState }) {
  if (state.status !== "saved" && state.status !== "error") return null;
  return (
    <p
      role="status"
      className={`text-xs font-medium ${
        state.status === "saved" ? "text-secondary-600" : "text-primary-600"
      }`}
    >
      {state.message}
    </p>
  );
}

const PENSION_BANDS = [
  { name: "pension_rate_u30", label: "Under 30" },
  { name: "pension_rate_30_39", label: "30 to 39" },
  { name: "pension_rate_40_49", label: "40 to 49" },
  { name: "pension_rate_50_54", label: "50 to 54" },
  { name: "pension_rate_55_59", label: "55 to 59" },
  { name: "pension_rate_60_plus", label: "60+" },
] as const;

function DiffList({ diff }: { diff: DiffEntry[] }) {
  return (
    <ul className="mt-2 space-y-1">
      {diff.map((d) => (
        <li key={d.label} className="text-sm tabular-nums text-ink">
          {d.label}: {d.from} → {d.to}
        </li>
      ))}
    </ul>
  );
}

function YearForm({ rates }: { rates: YearRates }) {
  const [state, action, pending] = useActionState(saveTaxYear, IDLE);
  const previewing = state.status === "preview";
  const it = rates.incomeTax;
  const usc = rates.usc;
  const prsi = rates.prsi;

  return (
    <form onSubmit={submitKeepingValues(action)} className="rounded-none border border-line bg-white p-5">
      <h3 className="font-display text-base font-semibold text-ink">
        Tax year {rates.year}
      </h3>

      {/* Disabled while previewing, so the fields cannot drift from what is
          being confirmed; disabled fields are not posted, so the Confirm
          submit carries only the payload. */}
      <fieldset disabled={previewing} className="m-0 min-w-0 border-0 p-0">
      <input type="hidden" name="year" value={rates.year} />

      <SectionTitle>Income tax: rates &amp; bands</SectionTitle>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Pct name="it_standard_rate" value={it.standardRate} label="Standard rate" />
        <Pct name="it_higher_rate" value={it.higherRate} label="Higher rate" />
        <Euro name="age_credit_threshold" value={it.ageCreditThreshold} label="Age credit from age" />
        <Euro name="srcop_single" value={it.srcop.single} label="SRCOP: single (€)" />
        <Euro name="srcop_single_spccc" value={it.srcop.singleWithSpccc} label="SRCOP: single + SPCCC (€)" />
        <Euro name="srcop_married_one" value={it.srcop.marriedOneIncome} label="SRCOP: married, 1 income (€)" />
        <Euro name="srcop_married_increase" value={it.srcop.marriedBandIncrease} label="SRCOP: married 2nd-income increase, max (€)" />
      </div>

      <SectionTitle>Income tax: credits (€)</SectionTitle>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Euro name="credit_personal_single" value={it.credits.personalSingle} label="Personal: single" />
        <Euro name="credit_personal_married" value={it.credits.personalMarried} label="Personal: married" />
        <Euro name="credit_personal_widowed" value={it.credits.personalWidowed} label="Personal: widowed, no children" />
        <Euro name="credit_employee_paye" value={it.credits.employeePaye} label="Employee PAYE" />
        <Euro name="credit_earned_income" value={it.credits.earnedIncome} label="Earned income" />
        <Euro name="credit_employment_cap" value={it.credits.employmentCombinedCap} label="PAYE + earned cap" />
        <Euro name="credit_spccc" value={it.credits.spccc} label="SPCCC" />
        <Euro name="credit_age_single" value={it.credits.ageSingle} label="Age: single" />
        <Euro name="credit_age_married" value={it.credits.ageMarried} label="Age: married" />
        <Euro name="credit_home_carer" value={it.credits.homeCarer} label="Home carer" />
        <Euro name="home_carer_threshold" value={it.homeCarerIncomeThreshold} label="Home carer full up to" />
      </div>

      <SectionTitle>Rent tax credit</SectionTitle>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Pct name="rent_credit_rate" value={it.rentCredit.rate} label="Share of rent" />
        <Euro name="rent_credit_max_single" value={it.rentCredit.maxSingle} label="Maximum, one person (€)" />
        <Euro name="rent_credit_max_joint" value={it.rentCredit.maxJoint} label="Maximum, couple (€)" />
      </div>

      <SectionTitle>USC</SectionTitle>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Euro name="usc_exemption_threshold" value={usc.exemptionThreshold} label="Exempt at/below (€)" />
        <Euro name="usc_band1_up_to" value={usc.bands[0].upTo} label="Band 1 up to (€)" />
        <Euro name="usc_band2_up_to" value={usc.bands[1].upTo} label="Band 2 up to (€)" />
        <Euro name="usc_band3_up_to" value={usc.bands[2].upTo} label="Band 3 up to (€)" />
        <Pct name="usc_band1_rate" value={usc.bands[0].rate} label="Band 1 rate" />
        <Pct name="usc_band2_rate" value={usc.bands[1].rate} label="Band 2 rate" />
        <Pct name="usc_band3_rate" value={usc.bands[2].rate} label="Band 3 rate" />
        <Pct name="usc_band4_rate" value={usc.bands[3].rate} label="Balance rate" />
        <Euro name="usc_reduced_age" value={usc.reduced.ageThreshold} label="Reduced bands from age" />
        <Euro name="usc_reduced_ceiling" value={usc.reduced.incomeCeiling} label="Reduced income ceiling (€)" />
        <Euro name="usc_reduced_band1_up_to" value={usc.reduced.bands[0].upTo} label="Reduced band 1 up to (€)" />
        <Pct name="usc_reduced_band1_rate" value={usc.reduced.bands[0].rate} label="Reduced band 1 rate" />
        <Pct name="usc_reduced_band2_rate" value={usc.reduced.bands[1].rate} label="Reduced balance rate" />
        <Euro name="usc_surcharge_threshold" value={usc.selfEmployedSurchargeThreshold} label="Self-emp surcharge over (€)" />
        <Pct name="usc_surcharge_rate" value={usc.selfEmployedSurchargeRate} label="Self-emp surcharge" />
      </div>

      <SectionTitle>PRSI</SectionTitle>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        <Pct name="prsi_rate" value={prsi.rate} label="Blended rate for the year" />
        <Euro name="prsi_min" value={prsi.selfEmployedMinimum} label="Class S minimum (€)" />
        <Euro name="prsi_weekly_exemption" value={prsi.weeklyExemptionThreshold} label="Weekly exemption (€)" />
        <Euro name="prsi_weekly_credit_max" value={prsi.weeklyCreditMax} label="Weekly credit max (€)" />
        <Euro name="prsi_taper_upper" value={prsi.weeklyCreditTaperUpper} label="Credit taper upper (€/wk)" />
        <Euro name="prsi_taper_divisor" value={prsi.weeklyCreditTaperDivisor} label="Credit taper divisor" />
      </div>

      <SectionTitle>Pension relief</SectionTitle>
      <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Euro name="pension_earnings_cap" value={rates.pension.earningsCap} label="Earnings cap (€)" />
        {PENSION_BANDS.map((b, i) => (
          <Pct key={b.name} name={b.name} value={rates.pension.ageBands[i]?.rate ?? 0} label={`Relief: ${b.label}`} />
        ))}
      </div>
      <p className="mt-2 text-xs text-muted">
        Age boundaries of the relief bands are fixed (&lt;30, 30 to 39, 40 to 49, 50 to 54,
        55 to 59, 60+): only the relief % is editable.
      </p>
      </fieldset>

      {state.status === "preview" && (
        <div className="mt-4 border border-line bg-surface-muted p-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted">
            Confirm change to {rates.year}
          </p>
          <DiffList diff={state.diff} />
          <input type="hidden" name="payload" value={state.payload} />
        </div>
      )}

      <div className="mt-5 flex items-center gap-3">
        {previewing ? (
          <>
            <button type="submit" disabled={pending} className={primaryBtn}>
              {pending ? "Saving…" : "Confirm"}
            </button>
            <button type="submit" name="cancel" value="1" formNoValidate disabled={pending} className={outlineBtn}>
              Cancel
            </button>
          </>
        ) : (
          <button type="submit" disabled={pending} className={primaryBtn}>
            {pending ? "…" : `Review ${rates.year} change`}
          </button>
        )}
        <StateNote state={state} />
      </div>
    </form>
  );
}

const auditTime = (iso: string) =>
  new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(iso));

function AuditPanel({ entries }: { entries: RateAuditRow[] }) {
  return (
    <div className="rounded-none border border-line bg-white p-5">
      <h3 className="font-display text-base font-semibold text-ink">Recent changes</h3>
      {entries.length === 0 ? (
        <p className="mt-2 text-xs text-muted">No changes recorded yet.</p>
      ) : (
        <ul className="mt-3 divide-y divide-line">
          {entries.map((e) => (
            <li key={e.id} className="flex items-baseline justify-between gap-4 py-2">
              <div>
                <span className="text-sm text-ink-body">{e.summary}</span>
                <span className="mt-0.5 block text-xs text-muted">{e.changedBy ?? "(unknown)"}</span>
              </div>
              <span className="shrink-0 text-xs text-muted tabular-nums">{auditTime(e.changedAt)}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export function TaxRatesManager({
  years,
  audit,
}: {
  years: YearRates[];
  audit: RateAuditRow[];
}) {
  return (
    <div className="flex flex-col gap-8">
      {years.map((y) => (
        <YearForm key={y.year} rates={y} />
      ))}
      <AuditPanel entries={audit} />
    </div>
  );
}
