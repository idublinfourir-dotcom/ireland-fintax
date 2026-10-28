import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Bangla (standard Bangladeshi spelling, আপনি), for the Bangla-speaking
   community in Ireland. USC, PRSI, CGT and CAT stay as Revenue writes them,
   with the Bangla name beside them where the reader needs it. */
export const bn: Messages = {
  meta: {
    title: "Irish Fintax: কর ও অর্থ শিখুন",
    description:
      "ক্যালকুলেটর, গাইড ও টেমপ্লেট, যা আয়ারল্যান্ডের কর ও ব্যক্তিগত অর্থব্যবস্থা সহজ ভাষায় বোঝায়: আয়কর, ভ্যাট, CGT, মর্টগেজ, বিনিয়োগ এবং কোম্পানি শুরু করা।",
  },

  header: {
    taxHub: "কর ক্যালকুলেটর",
    calculatorsHeading: "আয়ারল্যান্ডের ক্যালকুলেটর",
    openCalculators: "ক্যালকুলেটরগুলো খুলুন",
    accounts: "অ্যাকাউন্টিং হাব",
    founderHeading: "উদ্যোক্তাদের জন্য রিসোর্স",
    browseAccounts: "অ্যাকাউন্টিং হাব দেখুন",
    founderResources: [
      { label: "মেমো", desc: "সাধারণ প্রশ্ন নিয়ে কারিগরি নোট" },
      { label: "টেমপ্লেট", desc: "বিবরণী, হিসাব ও চেকলিস্ট" },
      { label: "করের ফর্ম", desc: "Revenue-এর ফর্ম ধাপে ধাপে" },
      { label: "ভ্যাটের ফর্ম", desc: "নিবন্ধন ও রিটার্নের চক্র" },
      { label: "শুরু করার গাইড", desc: "কোম্পানি শুরু ও পরিচালনা" },
    ],
    personal: "ব্যক্তিগত অর্থ",
    personalHeading: "ব্যক্তিগত অর্থ",
    openPersonal: "ব্যক্তিগত অর্থ খুলুন",
    budget: "বাজেটের ব্যাখ্যা",
    blog: "লেখা",
    about: "আমাদের সম্পর্কে",
    investmentAccount: "আইরিশ ইনভেস্টমেন্ট অ্যাকাউন্ট",
    adminDashboard: "অ্যাডমিন ড্যাশবোর্ড",
    myDashboard: "আমার ড্যাশবোর্ড",
    account: "অ্যাকাউন্ট",
    signIn: "সাইন ইন",
    ask: "প্রশ্ন করুন",
    openMenu: "মেনু খুলুন",
    submenu: "{label} মেনু",
    skip: "মূল অংশে যান",
    closeMenu: "মেনু বন্ধ করুন",
    language: "ভাষা",
    tools: toolNames.bn,
  },

  footer: {
    blurb:
      "ক্যালকুলেটর, গাইড ও টেমপ্লেট, যা আয়ারল্যান্ডের কর ও ব্যক্তিগত অর্থব্যবস্থা সহজ ভাষায় বোঝায়।",
    getInTouch: "যোগাযোগ",
    language: "ভাষা",
    suite: "আইনি কর",
    resources: "রিসোর্স",
    company: "প্রতিষ্ঠান",
    links: {
      incomeTax: "আয়কর ও PAYE",
      corporationTax: "কর্পোরেশন ট্যাক্স (12.5%)",
      cgt: "ক্যাপিটাল গেইনস ট্যাক্স",
      cat: "উপহার ও উত্তরাধিকার কর (CAT)",
      rd: "সেকশন 766 R&D ক্রেডিট",
      mortgage: "মর্টগেজ ও ধার",
      investment: "বিনিয়োগ ও ডিমড ডিসপোজাল",
      budget: "{budget} হাব",
      calendar: "কর ক্যালেন্ডার",
      about: "আমাদের সম্পর্কে",
      news: "খবর ও হালনাগাদ",
      contact: "যোগাযোগ",
      method: "পদ্ধতি ও মান",
      report: "সমস্যা জানান",
    },
    disclaimer: "শুধু সাধারণ তথ্য, আর্থিক, কর বা আইনি পরামর্শ নয়।",
    sources: "উৎস: Revenue.ie, CCPC আর সেন্ট্রাল ব্যাংক অব আয়ারল্যান্ড।",
    privacy: "ডেটার গোপনীয়তা",
    sitemap: "XML সাইটম্যাপ",
  },

  cta: {
    eyebrow: "কোনো প্রশ্নই খুব সাধারণ নয়",
    title: "এখনো বুঝে উঠছেন? *চলুন আপনার প্রশ্ন দিয়েই শুরু করি।*",
    body: "কর বা টাকা-পয়সা নিয়ে নিজের ভাষায় জিজ্ঞেস করুন।",
    button: "প্রশ্ন করুন",
  },
};
