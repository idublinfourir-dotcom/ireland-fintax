/* Phrases a Budget 2027 line in any language from messages/budget.ts and the
   figures the measure carries (Impact.vars). Pure: the planner renders with
   it, and i18n.test.ts renders English with it and compares against the
   sentences lib/budget-2027.ts itself writes, so the templates cannot drift
   from the maths. */

import type { PersonalLine } from "./budget-2027.ts";

export interface BudgetFormat {
  /** Whole euro: €1,235. */
  eur: (n: number) => string;
  /** Euro and cent: €1.28. */
  eur2: (n: number) => string;
  /** A count with grouping: 1,500. */
  num: (n: number) => string;
  /** Percent points: 20 → 20%. */
  pct: (points: number) => string;
}

export interface BudgetWordsMessages {
  yearlyMore: string;
  yearlyLess: string;
  measures: Record<string, Record<string, string>>;
}

const EUR = ["it", "usc", "band", "credits", "homeCarer", "uscBand", "rise", "max", "now", "price", "before"];
const EUR2 = ["from", "to", "perWeek", "carbon"];

/** One line's explanation and, for per-unit lines, its change and estimate. */
export function budgetWords(
  line: PersonalLine,
  w: BudgetWordsMessages,
  f: BudgetFormat,
): { body: string; change?: string; estimate?: string } {
  const m = w.measures[line.id] ?? {};
  const impact = line.impact;
  const vars = impact.vars ?? {};
  // Litres per week print as typed; a year's worth of heating oil is grouped.
  const rawLitres = line.id === "petrol" || line.id === "diesel";

  const value = (name: string): string => {
    const n = vars[name];
    switch (name) {
      case "yearly":
        return (impact.kind === "perUnit" && impact.cheaper ? w.yearlyLess : w.yearlyMore).replace(
          "{amount}",
          f.eur(n),
        );
      case "homeCarerPart":
        return vars.homeCarer > 0 ? fill(m.homeCarerPart ?? "") : "";
      case "who":
        return m[impact.variant ?? ""] ?? "";
      case "taxPart":
        return m[impact.variant ?? ""] ?? "";
      case "rate":
        return f.pct(n);
      case "litres":
        return rawLitres ? String(n) : f.num(n);
      case "kwh":
        return f.num(n);
    }
    if (EUR.includes(name)) return f.eur(n);
    if (EUR2.includes(name)) return f.eur2(n);
    return String(n);
  };
  function fill(template: string): string {
    return template.replace(/\{(\w+)\}/g, (_, name: string) => value(name));
  }

  const bodyTemplate =
    impact.variant === "tooExpensive" ? (m.tooExpensive ?? "") : (m.body ?? "");
  const original =
    impact.kind === "exact" ? impact.detail : impact.text;
  const result: { body: string; change?: string; estimate?: string } = {
    body: bodyTemplate ? fill(bodyTemplate) : original,
  };
  if (impact.kind === "perUnit") {
    result.change = m.change ? fill(m.change) : impact.change;
    if (impact.estimate !== undefined) {
      result.estimate = m.estimate ? fill(m.estimate) : impact.estimate;
    }
  }
  return result;
}
