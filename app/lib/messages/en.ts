/* English copy for the site chrome: header, footer and the closing call to
 * ask a question on inner pages. The home page's own copy is in home.ts.
 * The other languages are typed as `Messages`, and i18n.test.ts checks they
 * carry exactly these keys and array lengths.
 * *Asterisks* mark the emphasised words of a title (see Emphasis in ui.tsx):
 * one whole sentence, so each language places the emphasis itself. */

import { toolNames } from "./tool-names.ts";

export const en = {
  meta: {
    title: "Irish Fintax: learn how Irish tax and money work",
    description:
      "Calculators, guides and templates that explain Irish tax and personal finance in plain English: income tax, VAT, CGT, mortgages, investing and starting a company.",
  },

  header: {
    taxHub: "Tax Calculators",
    calculatorsHeading: "Ireland calculators",
    openCalculators: "Open the calculators",
    accounts: "Accounting Hub",
    founderHeading: "Founder resources",
    browseAccounts: "Browse the Accounting Hub",
    founderResources: [
      { label: "Memos", desc: "Technical notes on common questions" },
      { label: "Templates", desc: "Statements, workings and checklists" },
      { label: "Tax forms", desc: "Revenue form walkthroughs" },
      { label: "VAT forms", desc: "Registration and the returns cycle" },
      { label: "Setup guides", desc: "Starting and running a company" },
    ],
    personal: "Personal Finance",
    personalHeading: "Personal finance",
    openPersonal: "Open Personal Finance",
    budget: "Budget Explanation",
    blog: "Insights",
    about: "About",
    investmentAccount: "IE Investment Account",
    adminDashboard: "Admin dashboard",
    myDashboard: "My dashboard",
    account: "Account",
    signIn: "Sign in",
    ask: "Ask a question",
    openMenu: "Open menu",
    submenu: "{label} menu",
    skip: "Skip to content",
    closeMenu: "Close menu",
    language: "Language",
    /* Menu entries by href. One a language lacks (a new Budget year, say)
       falls back to the English label in calculator-tabs / budgets.ts. */
    tools: toolNames.en,
  },

  footer: {
    blurb:
      "Calculators, guides and templates that explain Irish tax and personal finance in plain English.",
    getInTouch: "Get in touch",
    language: "Language",
    suite: "Tax calculators",
    resources: "Resources",
    company: "Company",
    /* {budget} is the Budget's label in this language, from header.tools. */
    links: {
      incomeTax: "Income tax & PAYE",
      corporationTax: "Corporation tax (12.5%)",
      cgt: "Capital gains tax",
      cat: "Capital acquisitions tax (CAT)",
      rd: "Section 766 R&D credits",
      mortgage: "Mortgage & borrowing",
      investment: "Investment & deemed disposal",
      budget: "{budget} hub",
      calendar: "Tax calendar",
      about: "About us",
      news: "News & updates",
      contact: "Contact",
      method: "Methodology & standards",
      report: "Report an issue",
    },
    disclaimer: "General information only, not financial, tax or legal advice.",
    sources: "Sourced to Revenue.ie, CCPC and the Central Bank of Ireland.",
    reviewed: "Content reviewed by {reviewer}, and a group of Ireland-based finance professionals who want to make financial literacy easier for people in Ireland.",
    privacy: "Data privacy",
    sitemap: "XML sitemap",
  },

  cta: {
    eyebrow: "There’s no such thing as a basic question",
    title: "Still making sense of it? *Let’s start with your question.*",
    body: "Ask about tax or money in your own words.",
    button: "Ask a question",
  },
};

export type Messages = typeof en;
