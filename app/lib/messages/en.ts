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
    skip: "Skip to content",
    closeMenu: "Close menu",
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
    eyebrow: "Who we are",
    title: "What this site is",
    body: [
      "Irish Fintax explains Irish tax and personal finance without the jargon, with calculators so you can try your own numbers before you decide anything.",
      "It is a learning site, and nothing here is for sale.",
    ],
    more: "More about us",
    principles: [
      { title: "Free", note: "Calculators, guides, templates and questions all cost nothing, and you don’t need an account to start." },
      { title: "Plain English", note: "Each rule is explained in ordinary words, with the technical term alongside where you’ll need it." },
      { title: "Built on public sources", note: "The calculators use Revenue’s published rates and link to where each figure comes from." },
      { title: "Information, not advice", note: "For a decision that depends on your own situation, see a regulated adviser." },
    ],
  },

  promos: {
    budget: {
      /* {budget} is the Budget's label in this language, from header.tools. */
      title: "What does {budget} change for you?",
      body: "Tick what applies to you (renting, buying a first home, a pension, a car, a family) and see only the changes that affect you, in euro where the rules give an exact figure. It uses the official Budget figures and runs in your browser.",
      cta: "See what changes for you",
    },
    calculators: {
      eyebrow: "Calculators",
      title: "Run your own numbers",
      body: "Income tax, VAT, CGT, CAT, corporation tax and more, at Irish rates. Change one figure and see what moves with it.",
      cta: "Try the calculators",
    },
    company: {
      eyebrow: "Accounting Hub",
      title: "Setting up a company",
      body: "Memos, templates, tax and VAT forms and step-by-step setup guides for Ireland and the UK. They’re free: tell us which one you need and we’ll email it to you.",
      cta: "Browse the Accounting Hub",
    },
  },

  learn: {
    eyebrow: "How to learn here",
    title: "How people use the *site*",
    lede: "Most people read a little, try their own numbers, and ask only when something still doesn’t add up.",
    items: [
      { title: "Learn", note: "Memos and guides on the things people most often get stuck on." },
      { title: "Try", note: "Put your own figures into the calculators and see what changes." },
      { title: "Ask", note: "Still unsure? Ask in your own words and get an answer by email." },
    ],
  },

  audiences: {
    eyebrow: "Who it’s for",
    title: "Who the site covers",
    lede: "Tax questions usually come with a change in your life. These are the ones the site covers so far.",
    items: [
      { name: "Employees", note: "See your take-home pay and what the Budget changes mean for it." },
      { name: "Sole traders", note: "When to register for VAT, which rate applies, and the returns cycle." },
      { name: "Company founders", note: "Corporation tax, the R&D credit, capital allowances and setup guides." },
      { name: "Investors and landlords", note: "Capital gains on shares or property, and investment options compared." },
      { name: "Families", note: "Gifts and inheritances, and the tax-free thresholds that apply." },
      { name: "Homebuyers", note: "Work out a mortgage before you talk to a lender." },
    ],
  },

  process: {
    eyebrow: "Ask a question",
    title: "How asking a question works",
    lede: "If the calculators and guides don’t answer it, you can ask us. It’s free, and basic questions are welcome.",
    steps: [
      { title: "Pick a topic", description: "Income tax, VAT, a mortgage, starting a company, or something else." },
      { title: "Ask in your own words", description: "You don’t need the technical terms." },
      { title: "Get an answer by email", description: "A person reads your question and writes back." },
      { title: "Keep it in one place", description: "Ask while signed in and every answer stays in your free account." },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Frequently asked questions",
    items: [
      { question: "Is it really free?", answer: "Yes. Every calculator, guide and template here is free to use, and so is asking a question." },
      { question: "Is this financial or tax advice?", answer: "No. Everything here is general information to help you understand how things work. Rates and rules change and your own situation matters, so check with Revenue or a qualified, regulated adviser before acting on a big decision." },
      { question: "Do I need an account?", answer: "No. The calculators and guides are open to everyone. A free account is only useful for questions: ask while signed in and your questions and our answers stay together in one place." },
      { question: "Is it only about Ireland?", answer: "Mostly. The calculators use Irish rates and rules, and some of the founder resources also cover the UK." },
    ],
  },

  cta: {
    eyebrow: "Ask a question",
    title: "Stuck on something?",
    body: "Ask about tax or money in your own words and we’ll reply by email. It’s free.",
    button: "Ask a question",
  },
};

export type Messages = typeof en;
