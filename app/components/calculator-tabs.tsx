/* The Ireland calculators, in one place. Drives the on-page switcher (ToolTabs in
   tool-tabs.tsx) and the Accountants Hub dropdown in the site header. Plain
   data, so server and client code can both import it.

   Mortgage used to live here; it moved to the Personal Hub — see
   app/components/personal-tabs.tsx. */
export const CALCULATOR_TOOLS = [
  {
    href: "/tools/ireland-income-tax",
    label: "Income tax",
    desc: "Income tax, USC & PRSI: 2026 vs 2025",
  },
  {
    href: "/tools/ireland-vat",
    label: "VAT",
    desc: "Net VAT position: payable or receivable",
  },
  {
    href: "/tools/ireland-corporation-tax",
    label: "Corporation tax",
    desc: "12.5% trading, 25% passive: total tax due",
  },
  {
    href: "/tools/ireland-rd-tax-credit",
    label: "R&D credit",
    desc: "35% credit on qualifying R&D spend",
  },
  {
    href: "/tools/ireland-capital-allowances",
    label: "Capital allowances",
    desc: "Capital allowances (tax) + working capital",
  },
  {
    href: "/tools/ireland-cgt",
    label: "CGT",
    desc: "Capital gains tax with indexation relief",
  },
  {
    href: "/tools/ireland-cat",
    label: "CAT",
    desc: "Gift & inheritance tax: thresholds & reliefs",
  },
] as const;

export interface ToolTab {
  readonly href: string;
  readonly label: string;
}
