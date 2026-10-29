import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Bangla (standard Bangladeshi spelling, আপনি), for the Bangla-speaking
   community in Ireland. USC, PRSI, CGT and CAT stay as Revenue writes them,
   with the Bangla name beside them where the reader needs it. */
export const bn: Messages = {
  meta: {
    title: "Irish Fintax: আইরিশ কর ও আর্থিক ব্যবস্থাপনা জানুন",
    description:
      "আইরিশ কর ও ব্যক্তিগত অর্থব্যবস্থার সহজ নির্দেশিকা, ক্যালকুলেটর ও টেমপ্লেট: আয়কর, ভ্যাট, CGT, মর্টগেজ, বিনিয়োগ এবং কোম্পানি প্রতিষ্ঠা।",
  },

  header: {
    taxHub: "কর ক্যালকুলেটর",
    calculatorsHeading: "আয়ারল্যান্ড ক্যালকুলেটর",
    openCalculators: "ক্যালকুলেটরগুলো দেখুন",
    accounts: "অ্যাকাউন্টিং হাব",
    founderHeading: "উদ্যোক্তা রিসোর্স",
    browseAccounts: "অ্যাকাউন্টিং হাব দেখুন",
    founderResources: [
      { label: "মেমো", desc: "প্রচলিত প্রশ্নের প্রযুক্তিগত ব্যাখ্যা" },
      { label: "টেমপ্লেট", desc: "বিবরণী, হিসাব ও চেকলিস্ট" },
      { label: "কর ফরম", desc: "Revenue ফরম পূরণের ধাপ" },
      { label: "ভ্যাট ফরম", desc: "নিবন্ধন ও রিটার্ন দাখিলের নিয়ম" },
      { label: "সেটআপ গাইড", desc: "কোম্পানি শুরু ও পরিচালনার নিয়ম" },
    ],
    personal: "ব্যক্তিগত অর্থব্যবস্থা",
    personalHeading: "ব্যক্তিগত অর্থব্যবস্থা",
    openPersonal: "ব্যক্তিগত অর্থব্যবস্থা দেখুন",
    budget: "বাজেট ব্যাখ্যা",
    blog: "ইনসাইটস",
    about: "আমাদের সম্পর্কে",
    investmentAccount: "IE ইনভেস্টমেন্ট অ্যাকাউন্ট",
    adminDashboard: "অ্যাডমিন ড্যাশবোর্ড",
    myDashboard: "আমার ড্যাশবোর্ড",
    account: "অ্যাকাউন্ট",
    signIn: "সাইন ইন",
    ask: "প্রশ্ন করুন",
    openMenu: "মেনু খুলুন",
    submenu: "{label} মেনু",
    skip: "মূল বিষয়বস্তুতে যান",
    closeMenu: "মেনু বন্ধ করুন",
    language: "ভাষা",
    tools: toolNames.bn,
  },

  footer: {
    blurb:
      "আইরিশ কর ও ব্যক্তিগত অর্থব্যবস্থার সহজ নির্দেশিকা, ক্যালকুলেটর ও টেমপ্লেট।",
    getInTouch: "যোগাযোগ করুন",
    language: "ভাষা",
    suite: "কর ক্যালকুলেটর",
    resources: "রিসোর্স",
    company: "প্রতিষ্ঠান",
    links: {
      incomeTax: "আয়কর ও PAYE",
      corporationTax: "করপোরেট কর (12.5%)",
      cgt: "মূলধনি লাভ কর (CGT)",
      cat: "উপহার ও উত্তরাধিকার কর (CAT)",
      rd: "Section 766 R&D ক্রেডিট",
      mortgage: "মর্টগেজ ও ঋণ",
      investment: "বিনিয়োগ ও ডিমড ডিসপোজাল",
      budget: "{budget} হাব",
      calendar: "কর ক্যালেন্ডার",
      about: "আমাদের কথা",
      news: "সংবাদ ও আপডেট",
      contact: "যোগাযোগ",
      method: "পদ্ধতি ও মানদণ্ড",
      report: "সমস্যা জানান",
    },
    disclaimer: "কেবল সাধারণ তথ্য, কোনো আর্থিক, কর বা আইনি পরামর্শ নয়।",
    sources: "তথ্যসূত্র: Revenue.ie, CCPC এবং Central Bank of Ireland।",
    reviewed: "{reviewer} এবং আয়ারল্যান্ডভিত্তিক একদল আর্থিক পেশাজীবী দ্বারা বিষয়বস্তু পর্যালোচিত, যাঁরা আয়ারল্যান্ডের মানুষের জন্য আর্থিক জ্ঞান সহজলভ্য করতে চান।",
    privacy: "তথ্য গোপনীয়তা",
    sitemap: "XML সাইটম্যাপ",
  },

  cta: {
    eyebrow: "কোনো প্রশ্নই ছোট নয়",
    title: "বুঝতে কোনো দ্বিধা আছে? *আপনার প্রশ্নটি দিয়েই শুরু করা যাক।*",
    body: "কর বা অর্থ সংক্রান্ত যেকোনো প্রশ্ন আপনার নিজের ভাষায় জানান।",
    button: "প্রশ্ন করুন",
  },
};
