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
    taxHub: "Tax Calculation Hub",
    calculatorsHeading: "Ireland calculators",
    openCalculators: "Open the calculators",
    accounts: "Accounts and Finance",
    founderHeading: "Founder resources",
    browseAccounts: "Browse Accounts and Finance",
    founderResources: [
      { label: "Memos", desc: "Technical notes on common questions" },
      { label: "Templates", desc: "Statements, workings and checklists" },
      { label: "Tax forms", desc: "Revenue form walkthroughs" },
      { label: "VAT forms", desc: "Registration and the returns cycle" },
      { label: "Setup guides", desc: "Starting and running a company" },
    ],
    personal: "Personal Finance Tools",
    personalHeading: "Personal finance",
    openPersonal: "Open Personal Finance Tools",
    budget: "Budget",
    blog: "Blog",
    about: "About",
    investmentAccount: "Investment Account",
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
      accounts: "Accounts and Finance",
      blog: "Blog",
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
    title: "Understand tax and money, *in plain English.*",
    lede:
      "Free calculators, guides and templates for Irish tax, mortgages, investing and starting a company. Learn how it works, then run your own numbers.",
    cta: "Try the calculators",
    ask: "Ask a question",
  },

  quickEntries: [
    { title: "Tax calculators", note: "Income tax, VAT, CGT, CAT and more, for Ireland." },
    { title: "Personal finance", note: "Work out a mortgage and compare ways to invest." },
    { title: "Starting a company", note: "Memos, templates and setup guides for founders." },
    { title: "Ask a question", note: "Stuck on something? Ask, and we’ll explain it." },
  ],

  who: {
    eyebrow: "Who we are",
    title: "A free place to learn how Irish tax and money work.",
    body: [
      "Irish Fintax is a free learning platform. We explain Irish tax and personal finance in plain English, and give you calculators to try your own numbers, so you understand what is going on before you decide anything.",
      "No fees, nothing to sell you, and no sign-up to get started.",
    ],
    more: "More about us",
    principles: [
      { title: "Free, for everyone", note: "Every calculator, guide and template is free, and you don’t need an account to start." },
      { title: "Plain English", note: "The rules explained the way you’d explain them to a friend, without the jargon." },
      { title: "Built on public sources", note: "The calculators use Revenue’s published rates and link to where each figure comes from." },
      { title: "Information, not advice", note: "We help you understand. For a decision that hinges on your situation, see a regulated adviser." },
    ],
  },

  promos: {
    budget: {
      /* {budget} is the Budget's label in this language, from header.tools. */
      title: "What does {budget} change for you?",
      body: "Tick what applies to you, from renting or buying a first home to a pension, a car or a family, and see only the changes that affect you, in euro where the rules make it exact. Built from the official figures, worked out in your browser.",
      cta: "See what changes for you",
    },
    calculators: {
      eyebrow: "Calculators",
      title: "Don’t just read about it. Run your own numbers.",
      body: "Income tax, VAT, CGT, CAT, corporation tax and more, all using Irish rates. Change a figure and watch what happens: it’s the quickest way to understand how a tax really works.",
      cta: "Try the calculators",
    },
    company: {
      eyebrow: "Accounts and Finance",
      title: "Starting a company? Start here.",
      body: "Memos, templates, tax and VAT forms and step-by-step setup guides for Ireland and the UK. All free: tell us which one you need and we’ll email it over.",
      cta: "Browse Accounts and Finance",
    },
  },

  learn: {
    eyebrow: "How to learn here",
    title: "Learn it, try it, *ask about it.*",
    lede: "Start wherever suits you. Most people read a little, run their own numbers, and only ask when something still doesn’t add up.",
    items: [
      { title: "Learn", note: "Plain-English memos and guides on the things people actually get stuck on." },
      { title: "Try", note: "Put your own figures into the calculators and see what changes." },
      { title: "Ask", note: "Still unsure? Ask in your own words and get an answer by email." },
    ],
  },

  audiences: {
    eyebrow: "Who it’s for",
    title: "Whatever you’re dealing with, start here.",
    lede: "Tax and money questions tend to arrive with life events. These are the ones the site covers today.",
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
    title: "Got a question? Here’s what happens.",
    lede: "If the calculators and guides don’t cover it, ask. It’s free, and there’s no such thing as too basic.",
    steps: [
      { title: "Pick a topic", description: "Income tax, VAT, a mortgage, starting a company: whatever it’s about." },
      { title: "Ask in your own words", description: "No jargon needed. Ask it the way you’d ask a friend." },
      { title: "Get a plain-English answer", description: "A real person reads it and replies by email." },
      { title: "Keep it in one place", description: "Ask while signed in and every answer stays in your free account." },
    ],
  },

  faq: {
    eyebrow: "FAQ",
    title: "Questions, answered straight.",
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
    body: "Ask about tax or money the way you’d ask a friend, and we’ll reply by email with a plain-English answer. It’s free.",
    button: "Ask a question",
  },
};

export type Messages = typeof en;
