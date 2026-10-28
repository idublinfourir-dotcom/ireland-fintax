import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Hindi (standard Hindi, आप), for the Hindi-speaking community in Ireland.
   USC, PRSI, CGT and CAT stay as Revenue writes them, with the Hindi name
   beside them where the reader needs it. */
export const hi: Messages = {
  meta: {
    title: "Irish Fintax: टैक्स और पैसे के बारे में सीखें",
    description:
      "कैलकुलेटर, गाइड और टेम्पलेट, जो आयरलैंड के टैक्स और निजी वित्त को आसान भाषा में समझाते हैं: आयकर, वैट, CGT, मॉर्टगेज, निवेश और कंपनी शुरू करना।",
  },

  header: {
    taxHub: "टैक्स कैलकुलेटर",
    calculatorsHeading: "आयरलैंड के कैलकुलेटर",
    openCalculators: "कैलकुलेटर खोलें",
    accounts: "अकाउंटिंग हब",
    founderHeading: "संस्थापकों के लिए संसाधन",
    browseAccounts: "अकाउंटिंग हब देखें",
    founderResources: [
      { label: "मेमो", desc: "आम सवालों पर तकनीकी नोट" },
      { label: "टेम्पलेट", desc: "विवरण, गणनाएँ और चेकलिस्ट" },
      { label: "टैक्स फ़ॉर्म", desc: "Revenue के फ़ॉर्म, क़दम दर क़दम" },
      { label: "वैट फ़ॉर्म", desc: "पंजीकरण और रिटर्न का चक्र" },
      { label: "शुरुआत की गाइड", desc: "कंपनी शुरू करना और चलाना" },
    ],
    personal: "निजी वित्त",
    personalHeading: "निजी वित्त",
    openPersonal: "निजी वित्त खोलें",
    budget: "बजट की व्याख्या",
    blog: "लेख",
    about: "हमारे बारे में",
    investmentAccount: "आयरिश इन्वेस्टमेंट अकाउंट",
    adminDashboard: "एडमिन डैशबोर्ड",
    myDashboard: "मेरा डैशबोर्ड",
    account: "अकाउंट",
    signIn: "साइन इन",
    ask: "सवाल पूछें",
    openMenu: "मेनू खोलें",
    submenu: "{label} मेनू",
    skip: "मुख्य सामग्री पर जाएँ",
    closeMenu: "मेनू बंद करें",
    language: "भाषा",
    tools: toolNames.hi,
  },

  footer: {
    blurb:
      "कैलकुलेटर, गाइड और टेम्पलेट, जो आयरलैंड के टैक्स और निजी वित्त को आसान भाषा में समझाते हैं।",
    getInTouch: "संपर्क करें",
    language: "भाषा",
    suite: "क़ानूनी टैक्स",
    resources: "संसाधन",
    company: "संस्था",
    links: {
      incomeTax: "इनकम टैक्स और PAYE",
      corporationTax: "कॉर्पोरेशन टैक्स (12.5%)",
      cgt: "कैपिटल गेन्स टैक्स",
      cat: "उपहार और विरासत टैक्स (CAT)",
      rd: "सेक्शन 766 R&D क्रेडिट",
      mortgage: "मॉर्गेज और उधार",
      investment: "निवेश और डीम्ड डिस्पोज़ल",
      budget: "{budget} हब",
      calendar: "टैक्स कैलेंडर",
      about: "हमारे बारे में",
      news: "ख़बरें और अपडेट",
      contact: "संपर्क",
      method: "तरीक़ा और मानक",
      report: "समस्या बताएँ",
    },
    disclaimer: "केवल सामान्य जानकारी, वित्तीय, टैक्स या कानूनी सलाह नहीं।",
    sources: "स्रोत: Revenue.ie, CCPC और सेंट्रल बैंक ऑफ़ आयरलैंड।",
    privacy: "डेटा गोपनीयता",
    sitemap: "XML साइटमैप",
  },

  cta: {
    eyebrow: "कोई सवाल छोटा नहीं होता",
    title: "अब भी समझने की कोशिश कर रहे हैं? *आपके सवाल से शुरू करते हैं।*",
    body: "टैक्स या पैसे के बारे में अपने शब्दों में पूछें।",
    button: "सवाल पूछें",
  },
};
