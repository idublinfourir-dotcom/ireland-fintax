import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Irish. Tax names follow Revenue's Irish forms: CBL (VAT), MSU (USC),
   ÁSPC (PRSI), CGC (CGT), CFC (CAT). Needs a fluent speaker's review before
   it is relied on: it was drafted, not written by one. */
export const ga: Messages = {
  meta: {
    title: "Irish Fintax: foghlaim faoi cháin agus airgead",
    description:
      "Áireamháin, treoracha agus teimpléid a mhíníonn cáin agus airgeadas pearsanta na hÉireann i dteanga shimplí: cáin ioncaim, CBL, CGC, morgáistí, infheistíocht agus comhlacht a bhunú.",
  },

  header: {
    taxHub: "Áireamháin",
    calculatorsHeading: "Áireamháin d’Éirinn",
    openCalculators: "Oscail na háireamháin",
    accounts: "Mol Cuntasaíochta",
    founderHeading: "Acmhainní do bhunaitheoirí",
    browseAccounts: "Féach ar an Mol Cuntasaíochta",
    founderResources: [
      { label: "Meabhráin", desc: "Nótaí teicniúla ar cheisteanna coitianta" },
      { label: "Teimpléid", desc: "Ráitis, áirimh agus seicliostaí" },
      { label: "Foirmeacha cánach", desc: "Treoir trí fhoirmeacha na gCoimisinéirí Ioncaim" },
      { label: "Foirmeacha CBL", desc: "Clárú agus timthriall na dtuairisceán" },
      { label: "Treoracha bunaithe", desc: "Comhlacht a bhunú agus a reáchtáil" },
    ],
    personal: "Airgeadas pearsanta",
    personalHeading: "Airgeadas pearsanta",
    openPersonal: "Oscail Airgeadas pearsanta",
    budget: "Buiséad",
    blog: "Léargais",
    about: "Fúinn",
    investmentAccount: "Cuntas Infheistíochta IE",
    adminDashboard: "Painéal riaracháin",
    myDashboard: "Mo phainéal",
    account: "Cuntas",
    signIn: "Sínigh isteach",
    ask: "Cuir ceist",
    openMenu: "Oscail an roghchlár",
    submenu: "Roghchlár {label}",
    skip: "Léim go dtí an t-ábhar",
    closeMenu: "Dún an roghchlár",
    language: "Teanga",
    tools: toolNames.ga,
  },

  footer: {
    blurb:
      "Áireamháin, treoracha agus teimpléid a mhíníonn cáin agus airgeadas pearsanta na hÉireann i dteanga shimplí.",
    getInTouch: "Déan teagmháil linn",
    language: "Teanga",
    suite: "Sraith reachtúil",
    resources: "Acmhainní",
    company: "Eagraíocht",
    links: {
      incomeTax: "Cáin ioncaim agus ÍMAT",
      corporationTax: "Cáin chorparáide (12.5%)",
      cgt: "Cáin ghnóchan caipitiúil",
      cat: "Cáin fáltas caipitiúil (CFC)",
      rd: "Creidmheasanna T&F alt 766",
      mortgage: "Morgáiste agus iasachtaí",
      investment: "Infheistíocht agus diúscairt mheasta",
      budget: "Mol {budget}",
      calendar: "Féilire cánach reachtúil",
      about: "Fúinn",
      news: "Nuacht agus nuashonruithe",
      contact: "Teagmháil",
      method: "Modheolaíocht agus caighdeáin",
      report: "Tuairiscigh fadhb",
    },
    disclaimer: "Eolas ginearálta amháin, ní comhairle airgeadais, chánach ná dlí.",
    sources: "Foinsí: Revenue.ie, an CCPC agus Banc Ceannais na hÉireann.",
    privacy: "Príobháideacht sonraí",
    sitemap: "Mapa suímh XML",
  },

  cta: {
    eyebrow: "Níl a leithéid de rud ann agus ceist bhunúsach",
    title: "Fós ag iarraidh ciall a bhaint as? *Tosaímis le do cheist.*",
    body: "Cuir ceist faoi cháin nó airgead i d’fhocail féin.",
    button: "Cuir ceist",
  },
};
