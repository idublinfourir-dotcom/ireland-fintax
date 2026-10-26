import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Irish. Tax names follow Revenue's Irish forms: CBL (VAT), MSU (USC),
   ÁSPC (PRSI), CGC (CGT), CFC (CAT). Needs a fluent speaker's review before
   it is relied on: it was drafted, not written by one. */
export const ga: Messages = {
  meta: {
    title: "Irish Fintax: foghlaim faoi cháin agus airgead saor in aisce",
    description:
      "Áireamháin, treoracha agus teimpléid saor in aisce a mhíníonn cáin agus airgeadas pearsanta na hÉireann i dteanga shimplí: cáin ioncaim, CBL, CGC, morgáistí, infheistíocht agus comhlacht a bhunú.",
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
    skip: "Léim go dtí an t-ábhar",
    closeMenu: "Dún an roghchlár",
    language: "Teanga",
    tools: toolNames.ga,
  },

  footer: {
    blurb:
      "Áireamháin, treoracha agus teimpléid saor in aisce a mhíníonn cáin agus airgeadas pearsanta na hÉireann i dteanga shimplí.",
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
    disclaimer: "Eolas ginearálta amháin, ní comhairle airgeadais, chánach ná dlí.",
  },

  hero: {
    eyebrow: "Foghlaim airgeadais saor in aisce · Éire",
    title: "Tuig cáin agus airgead, *i dteanga shimplí.*",
    lede:
      "Áireamháin, treoracha agus teimpléid saor in aisce faoi cháin na hÉireann, morgáistí, infheistíocht agus comhlacht a bhunú. Foghlaim conas a oibríonn sé, ansin déan d’áireamh féin.",
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
    eyebrow: "Cé muid féin",
    title: "Áit saor in aisce le foghlaim conas a oibríonn cáin agus airgead in Éirinn.",
    body: [
      "Is ardán foghlama saor in aisce é Irish Fintax. Mínímid cáin agus airgeadas pearsanta na hÉireann i dteanga shimplí, agus tugaimid áireamháin duit chun d’uimhreacha féin a thriail, ionas go dtuigfidh tú cad atá ar siúl sula socraíonn tú aon rud.",
      "Gan táillí, gan aon rud le díol leat, agus gan clárú chun tosú.",
    ],
    more: "Tuilleadh fúinn",
    principles: [
      { title: "Saor in aisce, do chách", note: "Tá gach áireamhán, treoir agus teimpléad saor in aisce, agus ní gá cuntas chun tosú." },
      { title: "Teanga shimplí", note: "Na rialacha mínithe mar a mhíneofá do chara iad, gan bhéarlagair." },
      { title: "Bunaithe ar fhoinsí poiblí", note: "Úsáideann na háireamháin na rátaí a fhoilsíonn na Coimisinéirí Ioncaim agus nascann siad le foinse gach figiúir." },
      { title: "Eolas, ní comhairle", note: "Cabhraímid leat tuiscint a fháil. Má bhraitheann cinneadh ar do chás féin, téigh chuig comhairleoir rialáilte." },
    ],
  },

  promos: {
    budget: {
      title: "Cad a athraíonn {budget} duitse?",
      body: "Cuir tic leis an méid a bhaineann leat, ó theach ar cíos nó do chéad teach a cheannach go pinsean, carr nó teaghlach, agus ní fheicfidh tú ach na hathruithe a théann i bhfeidhm ort, in euro nuair is féidir figiúr beacht a thabhairt. Bunaithe ar na figiúirí oifigiúla, agus oibrithe amach i do bhrabhsálaí.",
      cta: "Féach cad a athraíonn duit",
    },
    calculators: {
      eyebrow: "Áireamháin",
      title: "Ná léigh faoi amháin. Déan d’áireamh féin.",
      body: "Cáin ioncaim, CBL, CGC, CFC, cáin chorparáide agus tuilleadh, ar fad le rátaí na hÉireann. Athraigh figiúr agus féach cad a tharlaíonn: is é an bealach is tapúla le tuiscint conas a oibríonn cáin i ndáiríre.",
      cta: "Bain triail as na háireamháin",
    },
    company: {
      eyebrow: "Mol Cuntasaíochta",
      title: "Ag bunú comhlachta? Tosaigh anseo.",
      body: "Meabhráin, teimpléid, foirmeacha cánach agus CBL, agus treoracha céim ar chéim d’Éirinn agus don Ríocht Aontaithe. Iad ar fad saor in aisce: inis dúinn cé acu atá uait agus seolfaimid chugat é ar ríomhphost.",
      cta: "Féach ar an Mol Cuntasaíochta",
    },
  },

  learn: {
    eyebrow: "Conas foghlaim anseo",
    title: "Foghlaim é, triail é, *cuir ceist faoi.*",
    lede: "Tosaigh áit ar bith a oireann duit. Léann formhór na ndaoine beagán, déanann siad a n-áireamh féin, agus ní chuireann siad ceist ach nuair nach dtuigeann siad rud éigin fós.",
    items: [
      { title: "Foghlaim", note: "Meabhráin agus treoracha i dteanga shimplí faoi na rudaí a chuireann mearbhall ar dhaoine i ndáiríre." },
      { title: "Triail", note: "Cuir d’fhigiúirí féin sna háireamháin agus féach cad a athraíonn." },
      { title: "Fiafraigh", note: "Fós in amhras? Cuir ceist i d’fhocail féin agus faigh freagra ar ríomhphost." },
    ],
  },

  audiences: {
    eyebrow: "Cé dó é",
    title: "Is cuma cad atá romhat, tosaigh anseo.",
    lede: "Is minic a thagann ceisteanna faoi cháin agus airgead le himeachtaí saoil. Seo iad na cinn atá ar an suíomh faoi láthair.",
    items: [
      { name: "Fostaithe", note: "Féach ar do ghlanphá agus cad a chiallaíonn athruithe an Bhuiséid dó." },
      { name: "Trádálaithe aonair", note: "Cathain is gá clárú le haghaidh CBL, cén ráta a bhaineann leat, agus timthriall na dtuairisceán." },
      { name: "Bunaitheoirí comhlachtaí", note: "Cáin chorparáide, an creidmheas T&F, liúntais chaipitiúla agus treoracha bunaithe." },
      { name: "Infheisteoirí agus tiarnaí talún", note: "Gnóchain chaipitiúla ar scaireanna nó ar mhaoin, agus roghanna infheistíochta curtha i gcomparáid." },
      { name: "Teaghlaigh", note: "Bronntanais agus oidhreachtaí, agus na tairseacha saor ó cháin a bhaineann leo." },
      { name: "Ceannaitheoirí tí", note: "Oibrigh amach morgáiste sula labhraíonn tú le hiasachtóir." },
    ],
  },

  process: {
    eyebrow: "Cuir ceist",
    title: "Ceist agat? Seo mar a oibríonn sé.",
    lede: "Mura gclúdaíonn na háireamháin agus na treoracha é, cuir ceist. Tá sé saor in aisce, agus níl a leithéid de rud ann agus ceist ró-bhunúsach.",
    steps: [
      { title: "Roghnaigh ábhar", description: "Cáin ioncaim, CBL, morgáiste, comhlacht a bhunú: cibé rud atá i gceist." },
      { title: "Cuir ceist i d’fhocail féin", description: "Ní gá béarlagair. Cuir í mar a chuirfeá ar chara í." },
      { title: "Faigh freagra soiléir", description: "Léann duine í agus freagraíonn sé ar ríomhphost." },
      { title: "Coinnigh in aon áit amháin é", description: "Cuir ceist agus tú sínithe isteach agus fanfaidh gach freagra i do chuntas saor in aisce." },
    ],
  },

  faq: {
    eyebrow: "Ceisteanna coitianta",
    title: "Ceisteanna, freagraí díreacha.",
    items: [
      { question: "An bhfuil sé saor in aisce i ndáiríre?", answer: "Tá. Tá gach áireamhán, treoir agus teimpléad anseo saor in aisce le húsáid, agus is amhlaidh do cheist a chur." },
      { question: "An comhairle airgeadais nó chánach é seo?", answer: "Ní hea. Is eolas ginearálta é gach rud anseo chun cabhrú leat tuiscint a fháil ar conas a oibríonn rudaí. Athraíonn rátaí agus rialacha agus tá tábhacht le do chás féin, mar sin déan seiceáil leis na Coimisinéirí Ioncaim nó le comhairleoir cáilithe rialáilte sula ndéanann tú cinneadh mór." },
      { question: "An gá dom cuntas a bheith agam?", answer: "Ní gá. Tá na háireamháin agus na treoracha oscailte do chách. Níl cuntas saor in aisce úsáideach ach le haghaidh ceisteanna: cuir ceist agus tú sínithe isteach agus fanfaidh do cheisteanna agus ár bhfreagraí le chéile in aon áit amháin." },
      { question: "An faoi Éirinn amháin atá sé?", answer: "Den chuid is mó. Úsáideann na háireamháin rátaí agus rialacha na hÉireann, agus clúdaíonn cuid de na hacmhainní do bhunaitheoirí an Ríocht Aontaithe freisin." },
    ],
  },

  cta: {
    eyebrow: "Cuir ceist",
    title: "Rud éigin nach dtuigeann tú?",
    body: "Cuir ceist faoi cháin nó airgead mar a chuirfeá ar chara í, agus seolfaimid freagra soiléir chugat ar ríomhphost. Tá sé saor in aisce.",
    button: "Cuir ceist",
  },
};
