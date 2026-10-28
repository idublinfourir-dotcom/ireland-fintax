/* English copy for the translated surface: header, footer and home page.
 * The other languages are typed as `Messages`, and i18n.test.ts checks they
 * carry exactly these keys and array lengths. Arrays pair by index with the
 * hrefs and icons in components/sections.tsx, so keep the order.
 * *Asterisks* mark the emphasised words of a title (see Emphasis in ui.tsx):
 * one whole sentence, so each language places the emphasis itself. */

import { toolNames } from "./tool-names.ts";

export const en = {
  meta: {
    title: "Irish Fintax: free tax and money learning",
    description:
      "Free calculators, guides and templates that explain Irish tax and personal finance in plain English: income tax, VAT, CGT, mortgages, investing and starting a company.",
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
      "Free calculators, guides and templates that explain Irish tax and personal finance in plain English.",
    explore: "Explore",
    links: {
      budget: "Budget",
      calculators: "Tax calculators",
      personal: "Personal finance",
      accounts: "Accounting Hub",
      blog: "Insights",
      about: "About",
      faq: "FAQ",
      ask: "Ask a question",
    },
    getInTouch: "Get in touch",
    language: "Language",
    rights: "All rights reserved.",
    privacy: "Privacy",
    disclaimer: "General information only, not financial, tax or legal advice.",
  },

  hero: {
    eyebrow: "Free finance learning · Ireland",
    title: "Learn how Irish tax and money *work.*",
    lede:
      "Free calculators, guides and templates for Irish tax, mortgages, investing and starting a company. Read how a tax works, then try it with your own figures.",
    cta: "Try the calculators",
    ask: "Ask a question",
  },

  quickEntries: [
    { title: "Tax calculators", note: "Income tax, VAT, CGT, CAT and more, for Ireland." },
    { title: "Personal finance", note: "Work out a mortgage and compare ways to invest." },
    { title: "Starting a company", note: "Memos, templates and setup guides for founders." },
    { title: "Ask a question", note: "If something doesn’t make sense, ask us." },
  ],

  who: {
    eyebrow: "A little about us",
    title: "Understanding first. Decisions second.",
    body: "Irish Fintax is a free learning site for tax and personal finance. Read a clear explanation, explore the tools and build your understanding at your own pace.",
    more: "Get to know Irish Fintax",
    caption: "Make room for a clearer view.",
    principles: [
      { title: "Free to explore", note: "No payment or account needed to start." },
      { title: "Plain English", note: "The everyday explanation, with technical terms when useful." },
      { title: "Sources you can follow", note: "Explore the public sources behind the rules." },
      { title: "Learning, not advice", note: "For personal decisions, speak with a regulated adviser." },
    ],
  },

  budget: {
    /* {budget} is the Budget's label in this language, from header.tools. */
    eyebrow: "{budget} · Explained",
    title: "The Budget is big. Start with what *matters to you.*",
    body: "Renting, buying, saving for a pension or raising a family? Explore the Budget changes that relate to your situation.",
    cta: "Explore {budget}",
    cardEyebrow: "Your life. Your questions.",
    topics: ["Home & renting", "Work & income", "Family", "Saving & pensions"],
    caption: "A clearer view of what changes.",
  },

  calculators: {
    eyebrow: "Free tools for clearer thinking",
    title: "Put your questions into numbers.",
    lede: "Choose a calculator. Change the inputs. Understand what moves.",
    caption: "Your numbers. A clearer picture.",
    items: [
      { name: "Income tax", note: "Explore your take-home pay." },
      { name: "VAT", note: "Understand VAT payable or receivable." },
      { name: "Corporation tax", note: "Explore tax on company profits." },
      { name: "Capital gains tax", note: "Understand tax when you sell an asset." },
      { name: "Gifts & inheritance", note: "Explore Capital Acquisitions Tax." },
      { name: "Mortgage", note: "Compare repayments before you decide." },
    ],
    footnote: "Calculators are learning tools. Check assumptions and sources on each tool page.",
  },

  learn: {
    eyebrow: "A simple way to learn",
    title: "From “what does that mean?” to “*now I understand*.”",
    items: [
      { title: "Learn the basics", note: "Start with guides and memos that explain the rules in everyday language.", link: "Explore the guides" },
      { title: "Try your numbers", note: "Use the calculators to see how different figures change the result.", link: "Find a calculator" },
      { title: "Ask what’s unclear", note: "Send your question in your own words. You don’t need the technical terms.", link: "Ask a question" },
    ],
  },

  faq: {
    eyebrow: "Before you start",
    title: "A few things you might wonder.",
    items: [
      { question: "Is Irish Fintax really free?", answer: "Yes. You can explore calculators, guides and templates without paying, and you can ask a question for free." },
      { question: "Do I need an account?", answer: "No account is needed to start exploring. Signing in lets you keep questions and answers in one place." },
      { question: "Is this financial or tax advice?", answer: "No. The site provides general learning information. Speak with a suitably qualified adviser about decisions specific to your circumstances." },
      { question: "Where should I begin?", answer: "Start with a calculator if you have figures to explore, the Accounting Hub for guides, or ask a question if you need help understanding a topic." },
    ],
  },

  cta: {
    eyebrow: "There’s no such thing as a basic question",
    title: "Still making sense of it? *Let’s start with your question.*",
    body: "Ask about tax or money in your own words.",
    button: "Ask a question",
  },
};

export type Messages = typeof en;
