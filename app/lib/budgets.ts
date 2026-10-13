/* Every Budget the site covers, newest first. One list drives the header's
   Budget dropdown (desktop and mobile), the footer link and /budget's redirect
   target, so a new October means one new entry here plus its page. */

export interface BudgetYear {
  year: number;
  href: string;
  label: string;
  /** One line under the label in the dropdown. */
  desc: string;
}

export const BUDGETS: BudgetYear[] = [
  {
    year: 2027,
    href: "/budget/2027",
    label: "Budget 2027",
    desc: "Announced 6 October 2026. See what changes for you.",
  },
];

/** The newest Budget: where the top-level "Budget" link and /budget go. */
export const LATEST_BUDGET = BUDGETS[0];
