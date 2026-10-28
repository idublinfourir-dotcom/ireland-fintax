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
    explore: "Taiscéal",
    links: {
      budget: "Buiséad",
      calculators: "Áireamháin chánach",
      personal: "Airgeadas pearsanta",
      accounts: "Mol Cuntasaíochta",
      blog: "Léargais",
      about: "Fúinn",
      faq: "Ceisteanna coitianta",
      ask: "Cuir ceist",
    },
    getInTouch: "Déan teagmháil linn",
    language: "Teanga",
    rights: "Gach ceart ar cosaint.",
    privacy: "Príobháideacht",
    disclaimer: "Eolas ginearálta amháin, ní comhairle airgeadais, chánach ná dlí.",
  },

  hero: {
    eyebrow: "Foghlaim airgeadais · Éire",
    title: "Tuig cáin agus airgead, *i dteanga shimplí.*",
    lede:
      "Áireamháin, treoracha agus teimpléid faoi cháin na hÉireann, morgáistí, infheistíocht agus comhlacht a bhunú. Foghlaim conas a oibríonn sé, ansin déan d’áireamh féin.",
    cta: "Bain triail as na háireamháin",
    ask: "Cuir ceist",
  },

  quickEntries: [
    { title: "Áireamháin chánach", note: "Cáin ioncaim, CBL, CGC, CFC agus tuilleadh, d’Éirinn." },
    { title: "Airgeadas pearsanta", note: "Oibrigh amach morgáiste agus cuir bealaí infheistíochta i gcomparáid." },
    { title: "Comhlacht a bhunú", note: "Meabhráin, teimpléid agus treoracha bunaithe do bhunaitheoirí." },
    { title: "Cuir ceist", note: "Rud éigin nach dtuigeann tú? Cuir ceist agus míneoimid é." },
  ],

  who: {
    eyebrow: "Beagán fúinn",
    title: "Tuiscint ar dtús. Cinntí ina dhiaidh sin.",
    body: "Is suíomh foghlama é Irish Fintax faoi cháin agus airgeadas pearsanta. Léigh míniú soiléir, bain triail as na huirlisí agus tóg do thuiscint ar do luas féin.",
    more: "Cuir aithne ar Irish Fintax",
    caption: "Déan spás do léargas níos soiléire.",
    principles: [
      { title: "Tosaigh láithreach", note: "Ní gá cuntas a bheith agat chun tosú." },
      { title: "Teanga shimplí", note: "An míniú laethúil, leis na téarmaí teicniúla nuair is úsáideach iad." },
      { title: "Foinsí is féidir leat a leanúint", note: "Féach ar na foinsí poiblí atá taobh thiar de na rialacha." },
      { title: "Foghlaim, ní comhairle", note: "Maidir le cinntí pearsanta, labhair le comhairleoir rialáilte." },
    ],
  },

  budget: {
    eyebrow: "{budget} · Mínithe",
    title: "Is mór an Buiséad. Tosaigh leis an méid *is tábhachtaí duitse.*",
    body: "Ar cíos, ag ceannach tí, ag coigilt do phinsean nó ag tógáil clainne? Féach ar athruithe an Bhuiséid a bhaineann le do chás.",
    cta: "Fiosraigh {budget}",
    cardEyebrow: "Do shaol. Do cheisteanna.",
    topics: ["Teach agus cíos", "Obair agus ioncam", "Teaghlach", "Coigilt agus pinsin"],
    caption: "Léargas níos soiléire ar a n-athraíonn.",
  },

  calculators: {
    eyebrow: "Uirlisí le smaoineamh níos soiléire",
    title: "Cuir do cheisteanna i bhfigiúirí.",
    lede: "Roghnaigh áireamhán. Athraigh na hionchuir. Tuig cad a athraíonn.",
    caption: "D’fhigiúirí féin. Pictiúr níos soiléire.",
    items: [
      { name: "Cáin ioncaim", note: "Féach ar do ghlanphá." },
      { name: "CBL", note: "Tuig CBL iníoctha nó infhaighte." },
      { name: "Cáin chorparáide", note: "Féach ar an gcáin ar bhrabúis chomhlachta." },
      { name: "Cáin ghnóchan caipitiúil", note: "Tuig an cháin nuair a dhíolann tú sócmhainn." },
      { name: "Bronntanais agus oidhreacht", note: "Féach ar Cháin Fáltas Caipitiúil." },
      { name: "Morgáiste", note: "Cuir aisíocaíochtaí i gcomparáid sula socraíonn tú." },
    ],
    footnote: "Uirlisí foghlama iad na háireamháin. Seiceáil na toimhdí agus na foinsí ar leathanach gach uirlise.",
  },

  learn: {
    eyebrow: "Bealach simplí le foghlaim",
    title: "Ó “cad is brí leis sin?” go “*tuigim anois*.”",
    items: [
      { title: "Foghlaim na bunrudaí", note: "Tosaigh le treoracha agus meabhráin a mhíníonn na rialacha i ngnáthchaint.", link: "Féach ar na treoracha" },
      { title: "Bain triail as d’fhigiúirí", note: "Úsáid na háireamháin le feiceáil conas a athraíonn figiúirí éagsúla an toradh.", link: "Aimsigh áireamhán" },
      { title: "Fiafraigh an rud nach léir", note: "Seol do cheist i d’fhocail féin. Ní gá na téarmaí teicniúla.", link: "Cuir ceist" },
    ],
  },

  faq: {
    eyebrow: "Sula dtosaíonn tú",
    title: "Cúpla rud a d’fhéadfá a bheith ag smaoineamh orthu.",
    items: [
      { question: "An gá dom cuntas a bheith agam?", answer: "Ní gá cuntas chun tosú. Má shíníonn tú isteach, is féidir leat ceisteanna agus freagraí a choinneáil in aon áit amháin." },
      { question: "An comhairle airgeadais nó chánach é seo?", answer: "Ní hea. Is eolas foghlama ginearálta atá ar an suíomh. Labhair le comhairleoir cáilithe faoi chinntí a bhaineann go sonrach le do chúinsí féin." },
      { question: "Cá háit ar cheart dom tosú?", answer: "Tosaigh le háireamhán má tá figiúirí agat le fiosrú, leis an Mol Cuntasaíochta le haghaidh treoracha, nó cuir ceist má theastaíonn cabhair uait chun ábhar a thuiscint." },
    ],
  },

  cta: {
    eyebrow: "Níl a leithéid de rud ann agus ceist bhunúsach",
    title: "Fós ag iarraidh ciall a bhaint as? *Tosaímis le do cheist.*",
    body: "Cuir ceist faoi cháin nó airgead i d’fhocail féin.",
    button: "Cuir ceist",
  },
};
