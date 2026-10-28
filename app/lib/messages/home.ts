import type { Translations } from "../i18n";

/* The home page below the header, all seven languages side by side (the
   ui-ux-reviews design, 28 Oct 2026). Lists of objects pair by index with the
   hrefs and icons in components/sections.tsx, so keep the order.
   *Asterisks* mark the emphasised words of a title (Emphasis in ui.tsx).
   {placeholders} are filled at runtime from the same rate data the
   calculators use, so a figure changes in one place:
     {count}       the number of tax calculators (CALCULATOR_TOOLS)
     {band} {year} the single person's 20% band for the current tax year
     {exemption}   the CGT annual exemption
     {goods} {services} the VAT registration thresholds
     {a} {b} {c} {rate} the CAT group thresholds and rate
     {budget}      the latest Budget's label ("Budget 2027")
     {years} {year} {prev} calendar years
   Fixed figures that are not in the rate data, and need a look when they
   move: budget.body (Budget 2027's headline changes), topics.items[4] (the
   Investment Account) and faq.items[0] (exit tax 38% in 2026, 35% from
   2027). */

const en = {
  hero: {
    eyebrow: "Finance learning · Ireland",
    title: "Master your Irish tax. *Save, grow, prosper.*",
    lede: "{count} statutory Irish tax calculators, Central Bank 4x mortgage rules, and plain-English financial intelligence. Zero guesswork.",
    cta: "Start planning",
    budget: "{budget} hub",
    checks: ["Explore without an account", "No account needed to start"],
    stats: {
      tools: "Tax calculators",
      band: "Standard cut-off, {year}",
      languages: "Languages",
    },
  },

  finder: {
    eyebrow: "Confidence architecture · 60-second finder",
    title: "Not sure where to start?\nLet’s route you.",
    items: [
      { title: "Salary & Budget", note: "Take-home pay, the {band} standard band and tax credits." },
      { title: "Shares, property, crypto", note: "Capital gains tax and the {exemption} annual exemption." },
      { title: "Buying a home", note: "The 4x borrowing limit and lender rates." },
      { title: "Starting a business", note: "Sole trader vs Ltd, VAT registration and Form 11." },
    ],
  },

  who: {
    eyebrow: "A little about us",
    title: "A place to learn how Irish tax and money work.",
    body: "Irish Fintax is a learning platform. We explain Irish tax and personal finance in plain English, and give you calculators to try your own numbers, so you understand what is going on before you decide anything.",
    more: "More about us",
    note: "No sales pitches, no tracking cookies. Independent tax and finance education for individuals, landlords and founders across Ireland.",
    caption: "Revenue.ie calibrated · Calculators run in your browser",
    principles: [
      { label: "Public interest", title: "For everyone", note: "Every calculator, guide and template is available, and you don’t need an account to start." },
      { label: "Plain English", title: "Jargon-free", note: "The rules explained the way you’d explain them to a friend, without the confusing jargon." },
      { label: "Built on public sources", title: "Checked against Revenue", note: "The calculators use Revenue’s published rates and link to where each figure comes from." },
      { label: "Information, not advice", title: "Clear about limits", note: "We help you understand. For a decision that hinges on your situation, see a regulated adviser." },
    ],
  },

  calendar: {
    eyebrow: "Revenue.ie statutory schedule",
    title: "Irish Tax Calendar *{years}*",
    body: "Key statutory filing and payment deadlines for individuals, self-employed contractors, landlords and limited companies.",
    next: "Next statutory deadline",
    more: "View full calendar",
    less: "Show fewer dates",
    /* By kind, as lib/tax-calendar.ts lists them. {year} is the deadline's
       year, {prev} the one before. */
    kinds: {
      payFile: {
        audience: "Self-employed & landlords",
        title: "Pay and file",
        note: "File your {prev} return, pay any balance for {prev} and pay preliminary tax for {year}. The date for paper returns and payments made outside ROS.",
        link: "Deadline details",
      },
      rosExtension: {
        audience: "ROS extension · Self-employed & landlords",
        title: "Form 11 on ROS",
        note: "The later date when you both file your {prev} Form 11 and pay through ROS. It also covers CAT returns for gifts and inheritances valued in the year to 31 August.",
        link: "Revenue notice",
      },
      prelimCt: {
        audience: "Limited companies",
        title: "Preliminary corporation tax",
        note: "For a 31 December year end: a small company’s only payment, or a large company’s second instalment.",
        link: "Preliminary CT rules",
      },
      prelimCtFirst: {
        audience: "Large companies",
        title: "Preliminary CT, first instalment",
        note: "The first of two payments for a large company with a 31 December year end.",
        link: "Preliminary CT rules",
      },
      ct1: {
        audience: "Limited companies",
        title: "Form CT1 corporation tax",
        note: "File the CT1 and pay any balance for an accounting period that ended on 31 December {prev}.",
        link: "CT1 deadlines",
      },
      cgtInitial: {
        audience: "Anyone who sold an asset",
        title: "Capital gains tax",
        note: "Pay CGT on gains made from 1 January to 30 November {year}.",
        link: "CGT payment dates",
      },
      cgtLater: {
        audience: "Anyone who sold an asset",
        title: "Capital gains tax",
        note: "Pay CGT on gains made in December {prev}.",
        link: "CGT payment dates",
      },
    },
  },

  topics: {
    eyebrow: "Everything in one place",
    title: "Whatever you’re dealing with, there’s a tool and a guide.",
    lede: "Every calculator is calibrated against Revenue.ie statutory rules, {budget} and Central Bank prudential guidelines.",
    caption: "Your numbers. A clearer picture.",
    items: [
      {
        title: "Tax calculator hub",
        note: "Personal tax (PAYE, USC, PRSI), VAT, corporation tax, CGT and inheritance tax.",
        tags: ["Income tax", "VAT", "Corporation tax", "CGT", "CAT"],
      },
      {
        title: "Investing & ETFs",
        note: "Compare ways to save and invest after Irish tax, from exit tax to deemed disposal.",
        tags: ["ETF exit tax", "Deemed disposal"],
      },
      {
        title: "Property & mortgages",
        note: "The Central Bank 4x borrowing rule, lender rates, green mortgages and cashback.",
        tags: ["Mortgage calculator", "Lender rates", "Green mortgages"],
      },
      {
        title: "Starting a company",
        note: "Sole trader vs Ltd, VAT registration thresholds and the Form 11 walk-through.",
        tags: ["Sole trader vs Ltd", "VAT registration", "Form 11"],
      },
      {
        title: "Investment Account",
        note: "The new account from 1 July 2027: 1% a year on value above €50,000, and no deemed disposal.",
        tags: ["1% a year", "€12,000 a year in", "From July 2027"],
      },
      {
        title: "{budget} hub",
        note: "What changes for your pocket: band shifts, USC and the Rent Tax Credit.",
        tags: ["Budget changes", "Rates at a glance"],
      },
    ],
    footnote: "Calculators are learning tools. Check assumptions and sources on each tool page.",
  },

  budget: {
    /* {budget} is the Budget's label in this language, from header.tools. */
    eyebrow: "{budget} · Explained",
    title: "The Budget is big. Start with what *matters to you.*",
    body: "The 20% band rises to €46,500, the USC 2% band widens to €30,300 and the Rent Tax Credit goes up to €1,150. Renting, buying, saving for a pension or raising a family? Explore what changes for you.",
    cta: "Explore {budget}",
    cardEyebrow: "Your life. Your questions.",
    topics: ["Home & renting", "Work & income", "Family", "Saving & pensions"],
    caption: "A clearer view of what changes.",
  },

  learn: {
    eyebrow: "A clear path forward · Statutory methodology",
    title: "Learn. Calculate. *Take action.*",
    items: [
      { title: "Learn", note: "Read easy-to-understand statutory guides on income tax, USC brackets, PRSI and investment tax rules.", link: "Browse guides" },
      { title: "Calculate", note: "Simulate take-home pay, 4x Central Bank mortgage borrowing limits and capital gains tax.", link: "Open calculators" },
      { title: "Take action", note: "Execute Form 11 returns, claim rent tax credits, meet Revenue Pay & File deadlines and build tax-efficient wealth.", link: "View deadlines" },
    ],
  },

  faq: {
    eyebrow: "Straight answers",
    title: "The questions people actually ask.",
    /* An item's link pairs by index with faqLinks in sections.tsx. */
    items: [
      {
        question: "How is an ETF taxed in Ireland?",
        answer: "Most Irish-domiciled and European UCITS ETFs are taxed under exit tax, not capital gains tax (CGT): 38% in 2026, and 35% from 1 January 2027 under Budget 2027. Tax is due when you sell, and every 8 years under the deemed disposal rule. Losses cannot be set against gains on ordinary shares.",
        link: "Read the complete ETF guide",
      },
      {
        question: "When do I legally need to register for VAT in Ireland?",
        answer: "Once your turnover passes, or is likely to pass, {goods} for goods or {services} for services in any continuous 12 months. You can register earlier if you choose, for example to reclaim VAT on business costs.",
        link: "See the business setup track",
      },
      {
        question: "How much tax do I pay on Irish rental income?",
        answer: "Rental profit is added to your other income and taxed at your marginal rate (20% or 40%), with USC and PRSI on top. Profit is the rent less allowable costs, such as mortgage interest on a residential let, repairs, management fees and RTB registration.",
        link: "Revenue on rental income",
      },
      {
        question: "What is deemed disposal and when does it trigger?",
        answer: "Every 8 years, a fund or ETF you hold is taxed as if you had sold it and bought it back: exit tax is due on the gain so far, even though you sold nothing. The tax paid is credited against the tax due when you finally sell.",
        link: "Deemed disposal explained",
      },
      {
        question: "How much can I inherit tax-free under Capital Acquisitions Tax (CAT)?",
        answer: "It depends on your relationship to the person giving it. The lifetime tax-free thresholds are {a} from a parent to a child (Group A), {b} between siblings and to grandchildren, nieces or nephews (Group B), and {c} from anyone else (Group C). Anything above is taxed at {rate}.",
        link: "Try the inheritance calculator",
      },
      { question: "Do I need an account?", answer: "No account is needed to start exploring. Signing in lets you keep questions and answers in one place.", link: "" },
      { question: "Is this financial or tax advice?", answer: "No. The site provides general learning information. Speak with a suitably qualified adviser about decisions specific to your circumstances.", link: "" },
    ],
  },

  quote: {
    quote: "“Don’t work for money. *Make money work for you.*”",
    body: "In Ireland, building generational wealth starts with knowing how money moves: leveraging tax-efficient pensions, entrepreneur relief and Revenue-compliant compounding strategies.",
    link: "Explore Irish investment tax strategies",
  },

  trust: [
    "Reviewed by Chartered Accountants",
    "Sourced to public statutory rates",
    "Information, not regulated advice",
    "Updated every national Budget",
  ],

  cta: {
    title: "Ready to take control *of your finances?*",
    body: "Explore our tools and guides to make sense of Irish tax, plan ahead and build a brighter financial future.",
    explore: "Explore tools",
    account: "Create your account",
  },
};

type HomeMessages = typeof en;

const ga: HomeMessages = {
  hero: {
    eyebrow: "Foghlaim airgeadais · Éire",
    title: "Bí i gceannas ar do cháin. *Coigil, fás, bí rathúil.*",
    lede: "Áireamháin chánach reachtúla na hÉireann ({count}), rialacha morgáiste 4x an Bhainc Ceannais agus faisnéis airgeadais i dteanga shimplí. Gan buille faoi thuairim.",
    cta: "Tosaigh ag pleanáil",
    budget: "Mol {budget}",
    checks: ["Fiosraigh gan chuntas", "Ní gá cuntas chun tosú"],
    stats: {
      tools: "Áireamháin chánach",
      band: "Banda caighdeánach, {year}",
      languages: "Teangacha",
    },
  },

  finder: {
    eyebrow: "Treoir mhuiníne · Aimsitheoir 60 soicind",
    title: "Níl tú cinnte cá dtosófá?\nTreoróimid thú.",
    items: [
      { title: "Tuarastal agus Buiséad", note: "Glanphá, an banda caighdeánach {band} agus creidmheasanna cánach." },
      { title: "Scaireanna, maoin, crypto", note: "Cáin ghnóchan caipitiúil agus an díolúine bhliantúil {exemption}." },
      { title: "Teach a cheannach", note: "An teorainn iasachta 4x agus rátaí na n-iasachtóirí." },
      { title: "Gnó a bhunú", note: "Trádálaí aonair nó Teo, clárú CBL agus Foirm 11." },
    ],
  },

  who: {
    eyebrow: "Beagán fúinn",
    title: "Áit le foghlaim conas a oibríonn cáin agus airgead in Éirinn.",
    body: "Ardán foghlama é Irish Fintax. Mínímid cáin agus airgeadas pearsanta na hÉireann i dteanga shimplí, agus tugaimid áireamháin duit le d’fhigiúirí féin a thriail, ionas go dtuigfidh tú cad atá ar siúl sula socraíonn tú aon rud.",
    more: "Tuilleadh fúinn",
    note: "Gan bhrú díolacháin, gan fianáin rianaithe. Oideachas neamhspleách ar cháin agus airgeadas do dhaoine aonair, tiarnaí talún agus bunaitheoirí ar fud na hÉireann.",
    caption: "Bunaithe ar Revenue.ie · Ritheann na háireamháin i do bhrabhsálaí",
    principles: [
      { label: "Leas an phobail", title: "Do chách", note: "Tá gach áireamhán, treoir agus teimpléad ar fáil, agus ní gá cuntas chun tosú." },
      { label: "Teanga shimplí", title: "Gan bhéarlagair", note: "Na rialacha mínithe mar a mhíneofá do chara iad, gan an béarlagair mearbhallach." },
      { label: "Bunaithe ar fhoinsí poiblí", title: "Seiceáilte in aghaidh Revenue", note: "Úsáideann na háireamháin na rátaí a fhoilsíonn Revenue agus nascann siad leis an áit as a dtagann gach figiúr." },
      { label: "Eolas, ní comhairle", title: "Soiléir faoi theorainneacha", note: "Cabhraímid leat tuiscint a fháil. Maidir le cinneadh a bhraitheann ar do chás, téigh chuig comhairleoir rialáilte." },
    ],
  },

  calendar: {
    eyebrow: "Sceideal reachtúil Revenue.ie",
    title: "Féilire Cánach na hÉireann *{years}*",
    body: "Príomhdhátaí reachtúla comhdaithe agus íocaíochta do dhaoine aonair, conraitheoirí féinfhostaithe, tiarnaí talún agus comhlachtaí teoranta.",
    next: "An chéad spriocdháta reachtúil eile",
    more: "Féach an féilire iomlán",
    less: "Taispeáin níos lú dátaí",
    kinds: {
      payFile: {
        audience: "Féinfhostaithe agus tiarnaí talún",
        title: "Íoc agus comhdaigh",
        note: "Comhdaigh do thuairisceán do {prev}, íoc aon iarmhéid do {prev} agus íoc réamhcháin do {year}. An dáta do thuairisceáin pháipéir agus d’íocaíochtaí lasmuigh de ROS.",
        link: "Sonraí an spriocdháta",
      },
      rosExtension: {
        audience: "Síneadh ROS · Féinfhostaithe agus tiarnaí talún",
        title: "Foirm 11 ar ROS",
        note: "An dáta níos déanaí nuair a chomhdaíonn tú d’Fhoirm 11 do {prev} agus a íocann tú trí ROS araon. Clúdaíonn sé freisin tuairisceáin CFC ar bhronntanais agus oidhreachtaí a luacháladh sa bhliain go dtí an 31 Lúnasa.",
        link: "Fógra Revenue",
      },
      prelimCt: {
        audience: "Comhlachtaí teoranta",
        title: "Réamhcháin chorparáide",
        note: "Do bhliain a chríochnaíonn ar an 31 Nollaig: an t-aon íocaíocht amháin do chomhlacht beag, nó an dara tráthchuid do chomhlacht mór.",
        link: "Rialacha réamhcháin CC",
      },
      prelimCtFirst: {
        audience: "Comhlachtaí móra",
        title: "Réamhcháin CC, an chéad tráthchuid",
        note: "An chéad cheann de dhá íocaíocht do chomhlacht mór a gcríochnaíonn a bhliain ar an 31 Nollaig.",
        link: "Rialacha réamhcháin CC",
      },
      ct1: {
        audience: "Comhlachtaí teoranta",
        title: "Cáin chorparáide Foirm CT1",
        note: "Comhdaigh an CT1 agus íoc aon iarmhéid do thréimhse chuntasaíochta a chríochnaigh ar an 31 Nollaig {prev}.",
        link: "Spriocdhátaí CT1",
      },
      cgtInitial: {
        audience: "Aon duine a dhíol sócmhainn",
        title: "Cáin ghnóchan caipitiúil",
        note: "Íoc CGC ar ghnóchain a rinneadh ón 1 Eanáir go dtí an 30 Samhain {year}.",
        link: "Dátaí íocaíochta CGC",
      },
      cgtLater: {
        audience: "Aon duine a dhíol sócmhainn",
        title: "Cáin ghnóchan caipitiúil",
        note: "Íoc CGC ar ghnóchain a rinneadh i mí na Nollag {prev}.",
        link: "Dátaí íocaíochta CGC",
      },
    },
  },

  topics: {
    eyebrow: "Gach rud in aon áit amháin",
    title: "Is cuma cad atá romhat, tá uirlis agus treoir ann.",
    lede: "Tá gach áireamhán calabraithe in aghaidh rialacha reachtúla Revenue.ie, {budget} agus treoirlínte stuamachta an Bhainc Ceannais.",
    caption: "D’fhigiúirí féin. Pictiúr níos soiléire.",
    items: [
      {
        title: "Mol na n-áireamhán cánach",
        note: "Cáin phearsanta (ÍMAT, MSU, ÁSPC), CBL, cáin chorparáide, CGC agus cáin oidhreachta.",
        tags: ["Cáin ioncaim", "CBL", "Cáin chorparáide", "CGC", "CFC"],
      },
      {
        title: "Infheistíocht agus ETFanna",
        note: "Cuir bealaí coigilte agus infheistíochta i gcomparáid tar éis cháin na hÉireann, ó cháin scoir go diúscairt mheasta.",
        tags: ["Cáin scoir ETF", "Diúscairt mheasta"],
      },
      {
        title: "Maoin agus morgáistí",
        note: "Riail iasachta 4x an Bhainc Ceannais, rátaí na n-iasachtóirí, morgáistí glasa agus aisíoc airgid.",
        tags: ["Áireamhán morgáiste", "Rátaí iasachtóirí", "Morgáistí glasa"],
      },
      {
        title: "Comhlacht a bhunú",
        note: "Trádálaí aonair nó Teo, tairseacha clárúcháin CBL agus treoir chéim ar chéim d’Fhoirm 11.",
        tags: ["Trádálaí aonair nó Teo", "Clárú CBL", "Foirm 11"],
      },
      {
        title: "Cuntas Infheistíochta",
        note: "An cuntas nua ón 1 Iúil 2027: 1% sa bhliain ar luach os cionn €50,000, agus gan diúscairt mheasta.",
        tags: ["1% sa bhliain", "€12,000 isteach sa bhliain", "Ó Iúil 2027"],
      },
      {
        title: "Mol {budget}",
        note: "Cad a athraíonn i do phóca: bandaí, MSU agus an Creidmheas Cánach Cíosa.",
        tags: ["Athruithe an Bhuiséid", "Rátaí go hachomair"],
      },
    ],
    footnote: "Uirlisí foghlama iad na háireamháin. Seiceáil na toimhdí agus na foinsí ar leathanach gach uirlise.",
  },

  budget: {
    eyebrow: "{budget} · Mínithe",
    title: "Is mór an Buiséad. Tosaigh leis an méid *is tábhachtaí duitse.*",
    body: "Ardaíonn an banda 20% go €46,500, leathnaíonn banda 2% MSU go €30,300 agus téann an Creidmheas Cánach Cíosa suas go €1,150. Ar cíos, ag ceannach tí, ag coigilt do phinsean nó ag tógáil clainne? Féach cad a athraíonn duitse.",
    cta: "Fiosraigh {budget}",
    cardEyebrow: "Do shaol. Do cheisteanna.",
    topics: ["Teach agus cíos", "Obair agus ioncam", "Teaghlach", "Coigilt agus pinsin"],
    caption: "Léargas níos soiléire ar a n-athraíonn.",
  },

  learn: {
    eyebrow: "Cosán soiléir chun cinn · Modheolaíocht reachtúil",
    title: "Foghlaim. Áirigh. *Gníomhaigh.*",
    items: [
      { title: "Foghlaim", note: "Léigh treoracha soiléire ar cháin ioncaim, bandaí MSU, ÁSPC agus rialacha cánach ar infheistíocht.", link: "Brabhsáil na treoracha" },
      { title: "Áirigh", note: "Samhlaigh glanphá, teorainneacha iasachta morgáiste 4x an Bhainc Ceannais agus cáin ghnóchan caipitiúil.", link: "Oscail na háireamháin" },
      { title: "Gníomhaigh", note: "Comhdaigh tuairisceáin Fhoirm 11, éiligh creidmheasanna cánach cíosa, coinnigh spriocdhátaí Íoc agus Comhdaigh Revenue agus tóg saibhreas atá éifeachtach ó thaobh cánach de.", link: "Féach na spriocdhátaí" },
    ],
  },

  faq: {
    eyebrow: "Freagraí díreacha",
    title: "Na ceisteanna a chuireann daoine i ndáiríre.",
    items: [
      {
        question: "Conas a ghearrtar cáin ar ETF in Éirinn?",
        answer: "Gearrtar cáin scoir, ní cáin ghnóchan caipitiúil (CGC), ar fhormhór na ETFanna atá lonnaithe in Éirinn agus ar ETFanna Eorpacha UCITS: 38% in 2026, agus 35% ón 1 Eanáir 2027 faoi Bhuiséad 2027. Bíonn cáin dlite nuair a dhíolann tú, agus gach 8 mbliana faoin riail diúscartha measta. Ní féidir caillteanais a fhritháireamh in aghaidh gnóchan ar ghnáthscaireanna.",
        link: "Léigh an treoir iomlán ar ETFanna",
      },
      {
        question: "Cathain a chaithfidh mé clárú le haghaidh CBL in Éirinn?",
        answer: "Nuair a sháraíonn do láimhdeachas, nó nuair is dócha go sárófar é, {goods} d’earraí nó {services} do sheirbhísí in aon 12 mhí leanúnacha. Is féidir leat clárú níos luaithe más mian leat, mar shampla chun CBL ar chostais ghnó a éileamh ar ais.",
        link: "Féach an rian bunaithe gnó",
      },
      {
        question: "Cé mhéad cánach a íocaim ar ioncam cíosa in Éirinn?",
        answer: "Cuirtear brabús cíosa le d’ioncam eile agus gearrtar cáin air ag do ráta imeallach (20% nó 40%), le MSU agus ÁSPC sa bhreis. Is é an brabús an cíos lúide costais incheadaithe, mar ús morgáiste ar ligean cónaithe, deisiúcháin, táillí bainistíochta agus clárú leis an RTB.",
        link: "Revenue ar ioncam cíosa",
      },
      {
        question: "Cad is diúscairt mheasta ann agus cathain a tharlaíonn sí?",
        answer: "Gach 8 mbliana, gearrtar cáin ar chiste nó ar ETF atá agat amhail is gur dhíol tú é agus gur cheannaigh tú ar ais é: bíonn cáin scoir dlite ar an ngnóchan go dtí sin, cé nár dhíol tú faic. Déantar an cháin a íocadh a chreidiúnú in aghaidh na cánach a bheidh dlite nuair a dhíolann tú faoi dheireadh.",
        link: "Diúscairt mheasta mínithe",
      },
      {
        question: "Cé mhéad is féidir liom a oidhriú saor ó cháin faoi Cháin Fáltas Caipitiúil (CFC)?",
        answer: "Braitheann sé ar do ghaol leis an duine a thugann é. Is iad na tairseacha saolré saor ó cháin {a} ó thuismitheoir go leanbh (Grúpa A), {b} idir deartháireacha agus deirfiúracha agus chuig garpháistí, neachtanna nó nianna (Grúpa B), agus {c} ó dhuine ar bith eile (Grúpa C). Gearrtar {rate} ar aon rud os a gcionn.",
        link: "Bain triail as an áireamhán oidhreachta",
      },
      { question: "An gá dom cuntas a bheith agam?", answer: "Ní gá cuntas chun tosú. Má shíníonn tú isteach, is féidir leat ceisteanna agus freagraí a choinneáil in aon áit amháin.", link: "" },
      { question: "An comhairle airgeadais nó chánach é seo?", answer: "Ní hea. Is eolas foghlama ginearálta atá ar an suíomh. Labhair le comhairleoir cáilithe faoi chinntí a bhaineann go sonrach le do chúinsí féin.", link: "" },
    ],
  },

  quote: {
    quote: "“Ná hoibrigh ar son airgid. *Cuir an t-airgead ag obair duitse.*”",
    body: "In Éirinn, tosaíonn saibhreas do na glúnta atá romhainn le tuiscint ar conas a ghluaiseann airgead: pinsin atá éifeachtach ó thaobh cánach de, faoiseamh fiontraithe agus straitéisí ús iolraithe a chloíonn le rialacha Revenue.",
    link: "Fiosraigh straitéisí cánach infheistíochta na hÉireann",
  },

  trust: [
    "Athbhreithnithe ag Cuntasóirí Cairte",
    "Bunaithe ar rátaí reachtúla poiblí",
    "Eolas, ní comhairle rialáilte",
    "Nuashonraithe le gach Buiséad náisiúnta",
  ],

  cta: {
    title: "Réidh le smacht a ghlacadh *ar do chuid airgid?*",
    body: "Fiosraigh ár n-uirlisí agus ár dtreoracha chun ciall a bhaint as cáin na hÉireann, pleanáil roimh ré agus todhchaí airgeadais níos gile a thógáil.",
    explore: "Fiosraigh na huirlisí",
    account: "Cruthaigh do chuntas",
  },
};

const es: HomeMessages = {
  hero: {
    eyebrow: "Aprende finanzas · Irlanda",
    title: "Domina tus impuestos en Irlanda. *Ahorra, crece, prospera.*",
    lede: "{count} calculadoras fiscales irlandesas basadas en la ley, las reglas hipotecarias de 4x del Banco Central e información financiera con palabras sencillas. Sin conjeturas.",
    cta: "Empieza a planificar",
    budget: "Centro del {budget}",
    checks: ["Explora sin cuenta", "No necesitas cuenta para empezar"],
    stats: {
      tools: "Calculadoras fiscales",
      band: "Banda estándar, {year}",
      languages: "Idiomas",
    },
  },

  finder: {
    eyebrow: "Arquitectura de confianza · Buscador de 60 segundos",
    title: "¿No sabes por dónde empezar?\nTe orientamos.",
    items: [
      { title: "Salario y Presupuesto", note: "Sueldo neto, la banda estándar de {band} y los créditos fiscales." },
      { title: "Acciones, inmuebles, cripto", note: "El impuesto sobre ganancias de capital y la exención anual de {exemption}." },
      { title: "Comprar vivienda", note: "El límite de préstamo de 4x y los tipos de los bancos." },
      { title: "Crear un negocio", note: "Autónomo o sociedad (Ltd), alta en el IVA y el Form 11." },
    ],
  },

  who: {
    eyebrow: "Un poco sobre nosotros",
    title: "Un lugar para aprender cómo funcionan los impuestos y el dinero en Irlanda.",
    body: "Irish Fintax es una plataforma para aprender. Explicamos los impuestos y las finanzas personales en Irlanda con palabras sencillas y te damos calculadoras para probar tus propios números, para que entiendas qué pasa antes de decidir nada.",
    more: "Más sobre nosotros",
    note: "Sin discursos de venta, sin cookies de seguimiento. Formación independiente sobre impuestos y finanzas para particulares, arrendadores y emprendedores de toda Irlanda.",
    caption: "Calibrado con Revenue.ie · Las calculadoras funcionan en tu navegador",
    principles: [
      { label: "Interés público", title: "Para todos", note: "Todas las calculadoras, guías y plantillas están disponibles, y no necesitas cuenta para empezar." },
      { label: "Palabras sencillas", title: "Sin jerga", note: "Las normas explicadas como se las explicarías a un amigo, sin jerga confusa." },
      { label: "Basado en fuentes públicas", title: "Contrastado con Revenue", note: "Las calculadoras usan los tipos que publica Revenue y enlazan al origen de cada cifra." },
      { label: "Información, no asesoramiento", title: "Claros con los límites", note: "Te ayudamos a entender. Para una decisión que depende de tu situación, consulta a un asesor regulado." },
    ],
  },

  calendar: {
    eyebrow: "Calendario legal de Revenue.ie",
    title: "Calendario fiscal irlandés *{years}*",
    body: "Las principales fechas legales de presentación y pago para particulares, autónomos, arrendadores y sociedades limitadas.",
    next: "Próxima fecha límite",
    more: "Ver el calendario completo",
    less: "Mostrar menos fechas",
    kinds: {
      payFile: {
        audience: "Autónomos y arrendadores",
        title: "Pagar y presentar",
        note: "Presenta tu declaración de {prev}, paga el saldo pendiente de {prev} y el impuesto anticipado de {year}. Es la fecha para declaraciones en papel y pagos fuera de ROS.",
        link: "Detalles del plazo",
      },
      rosExtension: {
        audience: "Prórroga de ROS · Autónomos y arrendadores",
        title: "Form 11 en ROS",
        note: "La fecha posterior si presentas tu Form 11 de {prev} y además pagas a través de ROS. También cubre las declaraciones de CAT de donaciones y herencias valoradas en el año hasta el 31 de agosto.",
        link: "Aviso de Revenue",
      },
      prelimCt: {
        audience: "Sociedades limitadas",
        title: "Impuesto de sociedades anticipado",
        note: "Con cierre del ejercicio el 31 de diciembre: el único pago de una empresa pequeña o el segundo plazo de una grande.",
        link: "Normas del pago anticipado",
      },
      prelimCtFirst: {
        audience: "Grandes empresas",
        title: "Pago anticipado, primer plazo",
        note: "El primero de dos pagos para una gran empresa con cierre del ejercicio el 31 de diciembre.",
        link: "Normas del pago anticipado",
      },
      ct1: {
        audience: "Sociedades limitadas",
        title: "Impuesto de sociedades, Form CT1",
        note: "Presenta el CT1 y paga el saldo de un ejercicio cerrado el 31 de diciembre de {prev}.",
        link: "Plazos del CT1",
      },
      cgtInitial: {
        audience: "Quien haya vendido un bien",
        title: "Ganancias de capital",
        note: "Paga el CGT de las ganancias obtenidas del 1 de enero al 30 de noviembre de {year}.",
        link: "Fechas de pago del CGT",
      },
      cgtLater: {
        audience: "Quien haya vendido un bien",
        title: "Ganancias de capital",
        note: "Paga el CGT de las ganancias obtenidas en diciembre de {prev}.",
        link: "Fechas de pago del CGT",
      },
    },
  },

  topics: {
    eyebrow: "Todo en un mismo sitio",
    title: "Sea cual sea tu situación, hay una herramienta y una guía.",
    lede: "Cada calculadora se ajusta a las normas legales de Revenue.ie, al {budget} y a las directrices prudenciales del Banco Central.",
    caption: "Tus números. Una imagen más clara.",
    items: [
      {
        title: "Calculadoras de impuestos",
        note: "Impuestos personales (PAYE, USC, PRSI), IVA, impuesto de sociedades, CGT e impuesto de herencias.",
        tags: ["Renta", "IVA", "Sociedades", "CGT", "CAT"],
      },
      {
        title: "Inversión y ETF",
        note: "Compara formas de ahorrar e invertir después de impuestos en Irlanda, del exit tax a la venta presunta (deemed disposal).",
        tags: ["Exit tax de ETF", "Deemed disposal"],
      },
      {
        title: "Vivienda e hipotecas",
        note: "La regla de 4x del Banco Central, los tipos de los bancos, las hipotecas verdes y el cashback.",
        tags: ["Calculadora de hipotecas", "Tipos de los bancos", "Hipotecas verdes"],
      },
      {
        title: "Crear una empresa",
        note: "Autónomo o sociedad (Ltd), los umbrales de alta en el IVA y la guía paso a paso del Form 11.",
        tags: ["Autónomo o Ltd", "Alta en el IVA", "Form 11"],
      },
      {
        title: "Cuenta de Inversión",
        note: "La nueva cuenta desde el 1 de julio de 2027: 1% al año sobre el valor que supere 50.000 €, sin venta presunta.",
        tags: ["1% al año", "12.000 € al año", "Desde julio de 2027"],
      },
      {
        title: "Centro del {budget}",
        note: "Lo que cambia en tu bolsillo: las bandas, el USC y el crédito fiscal por alquiler.",
        tags: ["Cambios del Presupuesto", "Tipos de un vistazo"],
      },
    ],
    footnote: "Las calculadoras son herramientas de aprendizaje. Revisa los supuestos y las fuentes en la página de cada herramienta.",
  },

  budget: {
    eyebrow: "{budget} · Explicado",
    title: "El Presupuesto es enorme. Empieza por *lo que te importa.*",
    body: "La banda del 20% sube a 46.500 €, el tramo del 2% del USC se amplía hasta 30.300 € y el crédito fiscal por alquiler sube a 1.150 €. ¿Alquilas, compras, ahorras para la jubilación o estás formando una familia? Explora lo que cambia para ti.",
    cta: "Explora el {budget}",
    cardEyebrow: "Tu vida. Tus preguntas.",
    topics: ["Vivienda y alquiler", "Trabajo e ingresos", "Familia", "Ahorro y pensiones"],
    caption: "Una visión más clara de lo que cambia.",
  },

  learn: {
    eyebrow: "Un camino claro · Método basado en la ley",
    title: "Aprende. Calcula. *Actúa.*",
    items: [
      { title: "Aprende", note: "Lee guías fáciles de entender sobre el impuesto sobre la renta, los tramos del USC, el PRSI y la fiscalidad de las inversiones.", link: "Ver las guías" },
      { title: "Calcula", note: "Simula tu sueldo neto, los límites hipotecarios de 4x del Banco Central y el impuesto sobre ganancias de capital.", link: "Abrir las calculadoras" },
      { title: "Actúa", note: "Presenta el Form 11, solicita el crédito fiscal por alquiler, cumple los plazos de Pay & File de Revenue y construye un patrimonio eficiente en impuestos.", link: "Ver los plazos" },
    ],
  },

  faq: {
    eyebrow: "Respuestas claras",
    title: "Las preguntas que la gente hace de verdad.",
    items: [
      {
        question: "¿Cómo tributa un ETF en Irlanda?",
        answer: "La mayoría de los ETF domiciliados en Irlanda y de los ETF UCITS europeos tributan por exit tax, no por el impuesto sobre ganancias de capital (CGT): 38% en 2026 y 35% desde el 1 de enero de 2027 según el Presupuesto 2027. Se paga al vender y cada 8 años por la regla de la venta presunta (deemed disposal). Las pérdidas no se pueden compensar con ganancias en acciones normales.",
        link: "Lee la guía completa sobre ETF",
      },
      {
        question: "¿Cuándo tengo que darme de alta en el IVA en Irlanda?",
        answer: "Cuando tu facturación supera, o es probable que supere, {goods} en bienes o {services} en servicios en cualquier periodo continuo de 12 meses. Puedes darte de alta antes si quieres, por ejemplo para recuperar el IVA de los gastos del negocio.",
        link: "Ver la guía para crear un negocio",
      },
      {
        question: "¿Cuánto impuesto pago por las rentas de alquiler en Irlanda?",
        answer: "El beneficio del alquiler se suma a tus demás ingresos y tributa a tu tipo marginal (20% o 40%), más el USC y el PRSI. El beneficio es el alquiler menos los gastos deducibles, como los intereses hipotecarios de una vivienda alquilada, las reparaciones, los honorarios de gestión y el registro en la RTB.",
        link: "Revenue sobre las rentas de alquiler",
      },
      {
        question: "¿Qué es la venta presunta (deemed disposal) y cuándo se aplica?",
        answer: "Cada 8 años, un fondo o ETF que tienes tributa como si lo hubieras vendido y vuelto a comprar: se paga exit tax sobre la ganancia acumulada, aunque no hayas vendido nada. Lo pagado se descuenta del impuesto que debas cuando por fin vendas.",
        link: "La venta presunta, explicada",
      },
      {
        question: "¿Cuánto puedo heredar sin impuestos con el Capital Acquisitions Tax (CAT)?",
        answer: "Depende de tu relación con quien te lo da. Los umbrales exentos de por vida son {a} de un padre o una madre a un hijo (Grupo A), {b} entre hermanos y hacia nietos o sobrinos (Grupo B) y {c} de cualquier otra persona (Grupo C). Lo que supere el umbral tributa al {rate}.",
        link: "Prueba la calculadora de herencias",
      },
      { question: "¿Necesito una cuenta?", answer: "No hace falta una cuenta para empezar a explorar. Si inicias sesión, puedes guardar tus preguntas y respuestas en un mismo sitio.", link: "" },
      { question: "¿Esto es asesoramiento financiero o fiscal?", answer: "No. La web ofrece información general para aprender. Habla con un asesor debidamente cualificado sobre las decisiones que dependen de tu situación.", link: "" },
    ],
  },

  quote: {
    quote: "«No trabajes por dinero. *Haz que el dinero trabaje para ti.*»",
    body: "En Irlanda, construir un patrimonio para las próximas generaciones empieza por saber cómo se mueve el dinero: pensiones eficientes en impuestos, la desgravación para emprendedores (Entrepreneur Relief) y estrategias de interés compuesto que cumplen con Revenue.",
    link: "Explora estrategias fiscales de inversión en Irlanda",
  },

  trust: [
    "Revisado por Chartered Accountants",
    "Basado en tipos legales públicos",
    "Información, no asesoramiento regulado",
    "Actualizado con cada Presupuesto nacional",
  ],

  cta: {
    title: "¿Listo para tomar el control *de tus finanzas?*",
    body: "Explora nuestras herramientas y guías para entender los impuestos en Irlanda, planificar con tiempo y construir un futuro financiero mejor.",
    explore: "Explorar herramientas",
    account: "Crea tu cuenta",
  },
};

const pt: HomeMessages = {
  hero: {
    eyebrow: "Aprenda finanças · Irlanda",
    title: "Domine seus impostos na Irlanda. *Poupe, cresça, prospere.*",
    lede: "{count} calculadoras de impostos irlandeses baseadas na lei, as regras de financiamento de 4x do Banco Central e informação financeira em palavras simples. Sem achismos.",
    cta: "Comece a planejar",
    budget: "Central do {budget}",
    checks: ["Explore sem conta", "Não precisa de conta para começar"],
    stats: {
      tools: "Calculadoras de impostos",
      band: "Faixa padrão, {year}",
      languages: "Idiomas",
    },
  },

  finder: {
    eyebrow: "Arquitetura de confiança · Localizador de 60 segundos",
    title: "Não sabe por onde começar?\nA gente mostra o caminho.",
    items: [
      { title: "Salário e Orçamento", note: "Salário líquido, a faixa padrão de {band} e os créditos fiscais." },
      { title: "Ações, imóveis, cripto", note: "O imposto sobre ganho de capital e a isenção anual de {exemption}." },
      { title: "Comprar um imóvel", note: "O limite de empréstimo de 4x e as taxas dos bancos." },
      { title: "Abrir um negócio", note: "Autônomo ou empresa (Ltd), registro no IVA e o Form 11." },
    ],
  },

  who: {
    eyebrow: "Um pouco sobre nós",
    title: "Um lugar para aprender como funcionam os impostos e o dinheiro na Irlanda.",
    body: "A Irish Fintax é uma plataforma de aprendizado. Explicamos os impostos e as finanças pessoais na Irlanda em palavras simples e oferecemos calculadoras para você testar seus próprios números, para entender o que está acontecendo antes de decidir qualquer coisa.",
    more: "Mais sobre nós",
    note: "Sem papo de vendas, sem cookies de rastreamento. Educação independente sobre impostos e finanças para pessoas, proprietários de imóveis alugados e empreendedores em toda a Irlanda.",
    caption: "Calibrado com a Revenue.ie · As calculadoras rodam no seu navegador",
    principles: [
      { label: "Interesse público", title: "Para todos", note: "Todas as calculadoras, guias e modelos estão disponíveis, e você não precisa de conta para começar." },
      { label: "Palavras simples", title: "Sem jargão", note: "As regras explicadas do jeito que você explicaria a um amigo, sem jargão confuso." },
      { label: "Baseado em fontes públicas", title: "Conferido com a Revenue", note: "As calculadoras usam as taxas publicadas pela Revenue e mostram de onde vem cada número." },
      { label: "Informação, não aconselhamento", title: "Claros sobre os limites", note: "Ajudamos você a entender. Para uma decisão que depende da sua situação, procure um consultor regulamentado." },
    ],
  },

  calendar: {
    eyebrow: "Calendário legal da Revenue.ie",
    title: "Calendário fiscal irlandês *{years}*",
    body: "Os principais prazos legais de declaração e pagamento para pessoas físicas, autônomos, proprietários de imóveis alugados e empresas limitadas.",
    next: "Próximo prazo legal",
    more: "Ver o calendário completo",
    less: "Mostrar menos datas",
    kinds: {
      payFile: {
        audience: "Autônomos e proprietários",
        title: "Pagar e declarar",
        note: "Entregue sua declaração de {prev}, pague o saldo de {prev} e o imposto antecipado de {year}. É a data para declarações em papel e pagamentos feitos fora do ROS.",
        link: "Detalhes do prazo",
      },
      rosExtension: {
        audience: "Prorrogação do ROS · Autônomos e proprietários",
        title: "Form 11 no ROS",
        note: "A data posterior quando você entrega o Form 11 de {prev} e também paga pelo ROS. Vale ainda para declarações de CAT de doações e heranças avaliadas no ano até 31 de agosto.",
        link: "Aviso da Revenue",
      },
      prelimCt: {
        audience: "Empresas limitadas",
        title: "Imposto sobre empresas antecipado",
        note: "Com exercício encerrado em 31 de dezembro: o único pagamento de uma empresa pequena ou a segunda parcela de uma grande.",
        link: "Regras do pagamento antecipado",
      },
      prelimCtFirst: {
        audience: "Grandes empresas",
        title: "Pagamento antecipado, primeira parcela",
        note: "O primeiro de dois pagamentos para uma grande empresa com exercício encerrado em 31 de dezembro.",
        link: "Regras do pagamento antecipado",
      },
      ct1: {
        audience: "Empresas limitadas",
        title: "Imposto sobre empresas, Form CT1",
        note: "Entregue o CT1 e pague o saldo de um exercício encerrado em 31 de dezembro de {prev}.",
        link: "Prazos do CT1",
      },
      cgtInitial: {
        audience: "Quem vendeu um bem",
        title: "Ganho de capital",
        note: "Pague o CGT dos ganhos obtidos de 1º de janeiro a 30 de novembro de {year}.",
        link: "Datas de pagamento do CGT",
      },
      cgtLater: {
        audience: "Quem vendeu um bem",
        title: "Ganho de capital",
        note: "Pague o CGT dos ganhos obtidos em dezembro de {prev}.",
        link: "Datas de pagamento do CGT",
      },
    },
  },

  topics: {
    eyebrow: "Tudo em um só lugar",
    title: "Seja qual for a sua situação, há uma ferramenta e um guia.",
    lede: "Cada calculadora segue as regras legais da Revenue.ie, o {budget} e as diretrizes prudenciais do Banco Central.",
    caption: "Seus números. Uma imagem mais clara.",
    items: [
      {
        title: "Calculadoras de impostos",
        note: "Impostos pessoais (PAYE, USC, PRSI), IVA, imposto sobre empresas, CGT e imposto sobre heranças.",
        tags: ["Imposto de renda", "IVA", "Empresas", "CGT", "CAT"],
      },
      {
        title: "Investimentos e ETFs",
        note: "Compare formas de poupar e investir depois dos impostos irlandeses, do exit tax à venda presumida (deemed disposal).",
        tags: ["Exit tax de ETF", "Deemed disposal"],
      },
      {
        title: "Imóveis e financiamento",
        note: "A regra de 4x do Banco Central, as taxas dos bancos, os financiamentos verdes e o cashback.",
        tags: ["Calculadora de financiamento", "Taxas dos bancos", "Financiamento verde"],
      },
      {
        title: "Abrir uma empresa",
        note: "Autônomo ou empresa (Ltd), os limites de registro no IVA e o passo a passo do Form 11.",
        tags: ["Autônomo ou Ltd", "Registro no IVA", "Form 11"],
      },
      {
        title: "Conta de Investimento",
        note: "A nova conta a partir de 1º de julho de 2027: 1% ao ano sobre o valor acima de € 50.000, sem venda presumida.",
        tags: ["1% ao ano", "€ 12.000 por ano", "A partir de julho de 2027"],
      },
      {
        title: "Central do {budget}",
        note: "O que muda no seu bolso: as faixas, o USC e o crédito fiscal de aluguel.",
        tags: ["Mudanças do Orçamento", "Taxas num relance"],
      },
    ],
    footnote: "As calculadoras são ferramentas de aprendizado. Confira as premissas e as fontes na página de cada ferramenta.",
  },

  budget: {
    eyebrow: "{budget} · Explicado",
    title: "O Orçamento é grande. Comece pelo que *importa para você.*",
    body: "A faixa de 20% sobe para € 46.500, a faixa de 2% do USC vai até € 30.300 e o crédito fiscal de aluguel sobe para € 1.150. Mora de aluguel, vai comprar um imóvel, está juntando para a aposentadoria ou criando uma família? Veja o que muda para você.",
    cta: "Explore o {budget}",
    cardEyebrow: "Sua vida. Suas perguntas.",
    topics: ["Moradia e aluguel", "Trabalho e renda", "Família", "Poupança e aposentadoria"],
    caption: "Uma visão mais clara do que muda.",
  },

  learn: {
    eyebrow: "Um caminho claro · Método baseado na lei",
    title: "Aprenda. Calcule. *Aja.*",
    items: [
      { title: "Aprenda", note: "Leia guias fáceis de entender sobre imposto de renda, faixas do USC, PRSI e a tributação de investimentos.", link: "Ver os guias" },
      { title: "Calcule", note: "Simule o salário líquido, os limites de financiamento de 4x do Banco Central e o imposto sobre ganho de capital.", link: "Abrir as calculadoras" },
      { title: "Aja", note: "Entregue o Form 11, peça o crédito fiscal de aluguel, cumpra os prazos de Pay & File da Revenue e construa um patrimônio eficiente em impostos.", link: "Ver os prazos" },
    ],
  },

  faq: {
    eyebrow: "Respostas diretas",
    title: "As perguntas que as pessoas fazem de verdade.",
    items: [
      {
        question: "Como um ETF é tributado na Irlanda?",
        answer: "A maioria dos ETFs domiciliados na Irlanda e dos ETFs UCITS europeus paga exit tax, não o imposto sobre ganho de capital (CGT): 38% em 2026 e 35% a partir de 1º de janeiro de 2027, pelo Orçamento 2027. O imposto é devido quando você vende e a cada 8 anos pela regra da venda presumida (deemed disposal). Perdas não podem ser compensadas com ganhos em ações comuns.",
        link: "Leia o guia completo sobre ETFs",
      },
      {
        question: "Quando sou obrigado a me registrar no IVA na Irlanda?",
        answer: "Quando seu faturamento passa, ou deve passar, de {goods} em mercadorias ou {services} em serviços em qualquer período contínuo de 12 meses. Você pode se registrar antes se quiser, por exemplo para recuperar o IVA dos custos do negócio.",
        link: "Ver o guia para abrir um negócio",
      },
      {
        question: "Quanto imposto pago sobre renda de aluguel na Irlanda?",
        answer: "O lucro do aluguel é somado à sua outra renda e tributado pela sua alíquota marginal (20% ou 40%), com USC e PRSI por cima. O lucro é o aluguel menos os custos dedutíveis, como juros do financiamento de um imóvel residencial alugado, reparos, taxas de administração e o registro na RTB.",
        link: "A Revenue sobre renda de aluguel",
      },
      {
        question: "O que é a venda presumida (deemed disposal) e quando ela acontece?",
        answer: "A cada 8 anos, um fundo ou ETF que você tem é tributado como se você tivesse vendido e comprado de volta: o exit tax é devido sobre o ganho até ali, mesmo sem nenhuma venda. O imposto pago é abatido do imposto devido quando você finalmente vender.",
        link: "A venda presumida, explicada",
      },
      {
        question: "Quanto posso herdar sem imposto pelo Capital Acquisitions Tax (CAT)?",
        answer: "Depende da sua relação com quem dá. Os limites isentos ao longo da vida são {a} de pai ou mãe para filho (Grupo A), {b} entre irmãos e para netos ou sobrinhos (Grupo B) e {c} de qualquer outra pessoa (Grupo C). O que passar disso é tributado a {rate}.",
        link: "Teste a calculadora de heranças",
      },
      { question: "Preciso de uma conta?", answer: "Não precisa de conta para começar a explorar. Entrando na sua conta, você guarda perguntas e respostas em um só lugar.", link: "" },
      { question: "Isto é aconselhamento financeiro ou fiscal?", answer: "Não. O site oferece informação geral de aprendizado. Fale com um consultor devidamente qualificado sobre decisões específicas da sua situação.", link: "" },
    ],
  },

  quote: {
    quote: "“Não trabalhe por dinheiro. *Faça o dinheiro trabalhar para você.*”",
    body: "Na Irlanda, construir um patrimônio para as próximas gerações começa por saber como o dinheiro se move: aposentadorias eficientes em impostos, o alívio para empreendedores (Entrepreneur Relief) e estratégias de juros compostos dentro das regras da Revenue.",
    link: "Explore estratégias fiscais de investimento na Irlanda",
  },

  trust: [
    "Revisado por Chartered Accountants",
    "Baseado em taxas legais públicas",
    "Informação, não aconselhamento regulamentado",
    "Atualizado a cada Orçamento nacional",
  ],

  cta: {
    title: "Pronto para assumir o controle *das suas finanças?*",
    body: "Explore nossas ferramentas e guias para entender os impostos na Irlanda, planejar com antecedência e construir um futuro financeiro melhor.",
    explore: "Explorar ferramentas",
    account: "Crie sua conta",
  },
};

const ar: HomeMessages = {
  hero: {
    eyebrow: "تعلّم المال · أيرلندا",
    title: "أتقِن ضرائبك في أيرلندا. *ادّخر، انمُ، وازدهر.*",
    lede: "{count} حاسبات ضريبية أيرلندية مبنية على القانون، وقواعد الرهن العقاري للبنك المركزي (4 أضعاف الدخل)، ومعلومات مالية بلغة بسيطة. بلا تخمين.",
    cta: "ابدأ التخطيط",
    budget: "مركز {budget}",
    checks: ["استكشف دون حساب", "لا تحتاج إلى حساب لتبدأ"],
    stats: {
      tools: "حاسبات ضريبية",
      band: "الشريحة القياسية، {year}",
      languages: "لغات",
    },
  },

  finder: {
    eyebrow: "مرشد الثقة · دليل في 60 ثانية",
    title: "لست متأكدًا من أين تبدأ؟\nدعنا نرشدك.",
    items: [
      { title: "الراتب والميزانية", note: "صافي الأجر، والشريحة القياسية {band}، والإعفاءات الضريبية." },
      { title: "الأسهم والعقارات والعملات المشفّرة", note: "ضريبة الأرباح الرأسمالية والإعفاء السنوي {exemption}." },
      { title: "شراء منزل", note: "حدّ الاقتراض 4 أضعاف الدخل وأسعار المقرضين." },
      { title: "بدء نشاط تجاري", note: "تاجر فرد أم شركة محدودة، والتسجيل في ضريبة القيمة المضافة، ونموذج Form 11." },
    ],
  },

  who: {
    eyebrow: "نبذة عنا",
    title: "مكان لتتعلّم كيف تعمل الضرائب والمال في أيرلندا.",
    body: "Irish Fintax منصّة تعليمية. نشرح الضرائب والتمويل الشخصي في أيرلندا بلغة بسيطة، ونقدّم لك حاسبات تجرّب فيها أرقامك، لتفهم ما يجري قبل أن تتخذ أي قرار.",
    more: "المزيد عنا",
    note: "لا عروض بيع، ولا ملفات تعريف ارتباط للتتبّع. تعليم مستقل في الضرائب والمال للأفراد والمؤجّرين ورواد الأعمال في أنحاء أيرلندا.",
    caption: "مُعايَر وفق Revenue.ie · الحاسبات تعمل في متصفحك",
    principles: [
      { label: "للمصلحة العامة", title: "للجميع", note: "كل الحاسبات والأدلة والنماذج متاحة، ولا تحتاج إلى حساب لتبدأ." },
      { label: "لغة بسيطة", title: "بلا مصطلحات معقّدة", note: "القواعد مشروحة كما تشرحها لصديق، دون مصطلحات مربكة." },
      { label: "مبني على مصادر عامة", title: "مُراجَع وفق Revenue", note: "تستخدم الحاسبات الأسعار التي تنشرها Revenue وتربط بمصدر كل رقم." },
      { label: "معلومات، لا نصيحة", title: "واضحون بشأن الحدود", note: "نساعدك على الفهم. أما القرار الذي يتوقف على ظروفك فاستشر فيه مستشارًا مرخّصًا." },
    ],
  },

  calendar: {
    eyebrow: "الجدول القانوني من Revenue.ie",
    title: "التقويم الضريبي الأيرلندي *{years}*",
    body: "أهم المواعيد القانونية لتقديم الإقرارات والدفع للأفراد والعاملين لحسابهم والمؤجّرين والشركات المحدودة.",
    next: "الموعد القانوني التالي",
    more: "عرض التقويم كاملًا",
    less: "عرض تواريخ أقل",
    kinds: {
      payFile: {
        audience: "العاملون لحسابهم والمؤجّرون",
        title: "الدفع وتقديم الإقرار",
        note: "قدّم إقرارك عن {prev}، وادفع أي رصيد مستحق عن {prev}، وادفع الضريبة المسبقة عن {year}. هذا موعد الإقرارات الورقية والمدفوعات خارج ROS.",
        link: "تفاصيل الموعد",
      },
      rosExtension: {
        audience: "تمديد ROS · العاملون لحسابهم والمؤجّرون",
        title: "نموذج Form 11 عبر ROS",
        note: "الموعد الأبعد حين تقدّم نموذج Form 11 عن {prev} وتدفع عبر ROS معًا. ويشمل أيضًا إقرارات ضريبة الهبات والمواريث (CAT) لما قُيّم في السنة المنتهية في 31 أغسطس.",
        link: "إشعار Revenue",
      },
      prelimCt: {
        audience: "الشركات المحدودة",
        title: "ضريبة الشركات المسبقة",
        note: "لسنة مالية تنتهي في 31 ديسمبر: الدفعة الوحيدة للشركة الصغيرة، أو القسط الثاني للشركة الكبيرة.",
        link: "قواعد الضريبة المسبقة",
      },
      prelimCtFirst: {
        audience: "الشركات الكبيرة",
        title: "الضريبة المسبقة، القسط الأول",
        note: "الأولى من دفعتين لشركة كبيرة تنتهي سنتها المالية في 31 ديسمبر.",
        link: "قواعد الضريبة المسبقة",
      },
      ct1: {
        audience: "الشركات المحدودة",
        title: "ضريبة الشركات، نموذج CT1",
        note: "قدّم نموذج CT1 وادفع أي رصيد مستحق عن فترة محاسبية انتهت في 31 ديسمبر {prev}.",
        link: "مواعيد CT1",
      },
      cgtInitial: {
        audience: "كل من باع أصلًا",
        title: "ضريبة الأرباح الرأسمالية",
        note: "ادفع ضريبة الأرباح الرأسمالية (CGT) على الأرباح المحققة من 1 يناير إلى 30 نوفمبر {year}.",
        link: "مواعيد دفع CGT",
      },
      cgtLater: {
        audience: "كل من باع أصلًا",
        title: "ضريبة الأرباح الرأسمالية",
        note: "ادفع ضريبة الأرباح الرأسمالية (CGT) على الأرباح المحققة في ديسمبر {prev}.",
        link: "مواعيد دفع CGT",
      },
    },
  },

  topics: {
    eyebrow: "كل شيء في مكان واحد",
    title: "مهما كان ما تتعامل معه، هناك أداة ودليل.",
    lede: "كل حاسبة مُعايَرة وفق القواعد القانونية في Revenue.ie و{budget} والإرشادات الاحترازية للبنك المركزي.",
    caption: "أرقامك. صورة أوضح.",
    items: [
      {
        title: "مركز الحاسبات الضريبية",
        note: "الضرائب الشخصية (PAYE وUSC وPRSI)، وضريبة القيمة المضافة، وضريبة الشركات، وضريبة الأرباح الرأسمالية، وضريبة المواريث.",
        tags: ["ضريبة الدخل", "ضريبة القيمة المضافة", "ضريبة الشركات", "CGT", "CAT"],
      },
      {
        title: "الاستثمار وصناديق ETF",
        note: "قارن طرق الادخار والاستثمار بعد الضرائب الأيرلندية، من ضريبة الخروج إلى البيع الافتراضي.",
        tags: ["ضريبة الخروج على ETF", "البيع الافتراضي"],
      },
      {
        title: "العقارات والرهن العقاري",
        note: "قاعدة الاقتراض 4 أضعاف الدخل من البنك المركزي، وأسعار المقرضين، والرهون الخضراء، والاسترداد النقدي.",
        tags: ["حاسبة الرهن العقاري", "أسعار المقرضين", "الرهون الخضراء"],
      },
      {
        title: "تأسيس شركة",
        note: "تاجر فرد أم شركة محدودة، وحدود التسجيل في ضريبة القيمة المضافة، وشرح نموذج Form 11 خطوة بخطوة.",
        tags: ["تاجر فرد أم شركة", "التسجيل في الضريبة", "Form 11"],
      },
      {
        title: "حساب الاستثمار",
        note: "الحساب الجديد اعتبارًا من 1 يوليو 2027: 1% سنويًا على القيمة التي تتجاوز € 50,000، ودون بيع افتراضي.",
        tags: ["1% سنويًا", "€ 12,000 في السنة", "من يوليو 2027"],
      },
      {
        title: "مركز {budget}",
        note: "ما يتغيّر في جيبك: الشرائح وUSC والإعفاء الضريبي على الإيجار.",
        tags: ["تغييرات الميزانية", "الأسعار بنظرة سريعة"],
      },
    ],
    footnote: "الحاسبات أدوات للتعلّم. راجع الافتراضات والمصادر في صفحة كل أداة.",
  },

  budget: {
    eyebrow: "{budget} · شرح مبسّط",
    title: "الميزانية كبيرة. *ابدأ بما يهمّك.*",
    body: "ترتفع شريحة 20% إلى € 46,500، وتتّسع شريحة 2% من USC إلى € 30,300، ويرتفع الإعفاء الضريبي على الإيجار إلى € 1,150. هل تستأجر أو تشتري أو تدّخر للتقاعد أو تربّي أسرة؟ اكتشف ما يتغيّر بالنسبة إليك.",
    cta: "استكشف {budget}",
    cardEyebrow: "حياتك. أسئلتك.",
    topics: ["السكن والإيجار", "العمل والدخل", "الأسرة", "الادخار والمعاشات"],
    caption: "رؤية أوضح لما يتغيّر.",
  },

  learn: {
    eyebrow: "طريق واضح للأمام · منهجية قانونية",
    title: "تعلّم. احسب. *تصرّف.*",
    items: [
      { title: "تعلّم", note: "اقرأ أدلة سهلة الفهم عن ضريبة الدخل وشرائح USC وPRSI وقواعد ضرائب الاستثمار.", link: "تصفّح الأدلة" },
      { title: "احسب", note: "احسب صافي الأجر، وحدود الاقتراض العقاري 4 أضعاف الدخل من البنك المركزي، وضريبة الأرباح الرأسمالية.", link: "افتح الحاسبات" },
      { title: "تصرّف", note: "قدّم إقرارات Form 11، واطلب الإعفاء الضريبي على الإيجار، والتزم بمواعيد Pay & File لدى Revenue، وابنِ ثروة بكفاءة ضريبية.", link: "عرض المواعيد" },
    ],
  },

  faq: {
    eyebrow: "إجابات مباشرة",
    title: "الأسئلة التي يطرحها الناس فعلًا.",
    items: [
      {
        question: "كيف تُفرض الضريبة على صناديق ETF في أيرلندا؟",
        answer: "تخضع معظم صناديق ETF المسجّلة في أيرلندا وصناديق UCITS الأوروبية لضريبة الخروج، لا لضريبة الأرباح الرأسمالية (CGT): 38% في 2026، و35% اعتبارًا من 1 يناير 2027 بموجب ميزانية 2027. تُستحق الضريبة عند البيع، وكل 8 سنوات وفق قاعدة البيع الافتراضي. ولا يمكن مقاصّة الخسائر بأرباح الأسهم العادية.",
        link: "اقرأ الدليل الكامل عن ETF",
      },
      {
        question: "متى يجب عليّ قانونًا التسجيل في ضريبة القيمة المضافة في أيرلندا؟",
        answer: "حين يتجاوز رقم أعمالك، أو يُرجَّح أن يتجاوز، {goods} للسلع أو {services} للخدمات خلال أي 12 شهرًا متتالية. ويمكنك التسجيل قبل ذلك إن شئت، مثلًا لاسترداد الضريبة على تكاليف النشاط.",
        link: "اطّلع على مسار تأسيس النشاط",
      },
      {
        question: "كم ضريبة أدفع على دخل الإيجار في أيرلندا؟",
        answer: "يُضاف ربح الإيجار إلى دخلك الآخر ويُفرض عليه سعرك الحدّي (20% أو 40%)، مع USC وPRSI فوق ذلك. والربح هو الإيجار مطروحًا منه التكاليف المسموح بها، مثل فوائد الرهن على عقار سكني مؤجّر، والإصلاحات، ورسوم الإدارة، والتسجيل لدى RTB.",
        link: "Revenue عن دخل الإيجار",
      },
      {
        question: "ما البيع الافتراضي ومتى يُطبَّق؟",
        answer: "كل 8 سنوات، يُعامَل الصندوق أو ETF الذي تملكه ضريبيًا كأنك بعته واشتريته من جديد: تُستحق ضريبة الخروج على الربح حتى تلك اللحظة، رغم أنك لم تبع شيئًا. وتُخصم الضريبة المدفوعة من الضريبة المستحقة حين تبيع فعلًا.",
        link: "البيع الافتراضي بشرح مبسّط",
      },
      {
        question: "كم يمكنني أن أرث دون ضريبة وفق ضريبة الهبات والمواريث (CAT)؟",
        answer: "يتوقف ذلك على صلتك بمن يعطيك. حدود الإعفاء مدى الحياة هي {a} من أحد الوالدين إلى ابنه (المجموعة A)، و{b} بين الإخوة وإلى الأحفاد وأبناء الإخوة (المجموعة B)، و{c} من أي شخص آخر (المجموعة C). وما يزيد على ذلك يُفرض عليه {rate}.",
        link: "جرّب حاسبة المواريث",
      },
      { question: "هل أحتاج إلى حساب؟", answer: "لا تحتاج إلى حساب لتبدأ الاستكشاف. تسجيل الدخول يتيح لك الاحتفاظ بالأسئلة والإجابات في مكان واحد.", link: "" },
      { question: "هل هذه نصيحة مالية أو ضريبية؟", answer: "لا. يقدّم الموقع معلومات تعليمية عامة. تحدّث مع مستشار مؤهّل بشأن القرارات الخاصة بظروفك.", link: "" },
    ],
  },

  quote: {
    quote: "«لا تعمل من أجل المال. *اجعل المال يعمل من أجلك.*»",
    body: "في أيرلندا، يبدأ بناء ثروة تمتد عبر الأجيال بفهم كيف يتحرك المال: معاشات تقاعدية بكفاءة ضريبية، وإعفاء رواد الأعمال، واستراتيجيات نمو مركّب متوافقة مع قواعد Revenue.",
    link: "استكشف استراتيجيات ضرائب الاستثمار في أيرلندا",
  },

  trust: [
    "يراجعه محاسبون قانونيون معتمدون",
    "مبني على أسعار قانونية منشورة",
    "معلومات، لا نصيحة منظَّمة",
    "يُحدَّث مع كل ميزانية وطنية",
  ],

  cta: {
    title: "هل أنت مستعد للتحكم *في أموالك؟*",
    body: "استكشف أدواتنا وأدلتنا لتفهم الضرائب في أيرلندا، وتخطط مسبقًا، وتبني مستقبلًا ماليًا أفضل.",
    explore: "استكشف الأدوات",
    account: "أنشئ حسابك",
  },
};

const bn: HomeMessages = {
  hero: {
    eyebrow: "অর্থ শিক্ষা · আয়ারল্যান্ড",
    title: "আয়ারল্যান্ডের কর আয়ত্ত করুন। *সঞ্চয় করুন, বাড়ান, এগিয়ে যান।*",
    lede: "{count}টি আইনভিত্তিক আইরিশ কর ক্যালকুলেটর, সেন্ট্রাল ব্যাংকের 4x মর্টগেজ নিয়ম আর সহজ ভাষায় আর্থিক জ্ঞান। আন্দাজের কোনো জায়গা নেই।",
    cta: "পরিকল্পনা শুরু করুন",
    budget: "{budget} হাব",
    checks: ["অ্যাকাউন্ট ছাড়াই ঘুরে দেখুন", "শুরু করতে অ্যাকাউন্ট লাগে না"],
    stats: {
      tools: "কর ক্যালকুলেটর",
      band: "স্ট্যান্ডার্ড সীমা, {year}",
      languages: "ভাষা",
    },
  },

  finder: {
    eyebrow: "আত্মবিশ্বাসের কাঠামো · 60 সেকেন্ডের খোঁজ",
    title: "কোথা থেকে শুরু করবেন বুঝছেন না?\nআমরা পথ দেখাই।",
    items: [
      { title: "বেতন ও বাজেট", note: "হাতে পাওয়া বেতন, {band} স্ট্যান্ডার্ড ব্যান্ড আর ট্যাক্স ক্রেডিট।" },
      { title: "শেয়ার, সম্পত্তি, ক্রিপ্টো", note: "ক্যাপিটাল গেইনস ট্যাক্স আর বছরে {exemption} ছাড়।" },
      { title: "বাড়ি কেনা", note: "4x ধারের সীমা আর ঋণদাতাদের সুদের হার।" },
      { title: "ব্যবসা শুরু", note: "সোল ট্রেডার নাকি Ltd, ভ্যাট নিবন্ধন আর Form 11।" },
    ],
  },

  who: {
    eyebrow: "আমাদের সম্পর্কে একটু",
    title: "আয়ারল্যান্ডের কর আর টাকা-পয়সা কীভাবে চলে, তা শেখার জায়গা।",
    body: "Irish Fintax একটি শেখার প্ল্যাটফর্ম। আমরা আয়ারল্যান্ডের কর আর ব্যক্তিগত অর্থ সহজ ভাষায় বুঝিয়ে বলি, আর নিজের সংখ্যা দিয়ে যাচাই করার জন্য ক্যালকুলেটর দিই, যাতে কোনো সিদ্ধান্তের আগেই আপনি বোঝেন কী ঘটছে।",
    more: "আমাদের সম্পর্কে আরও",
    note: "বিক্রির চাপ নেই, ট্র্যাকিং কুকি নেই। আয়ারল্যান্ড জুড়ে ব্যক্তি, বাড়িওয়ালা আর উদ্যোক্তাদের জন্য স্বাধীন কর ও অর্থ শিক্ষা।",
    caption: "Revenue.ie অনুযায়ী মেলানো · ক্যালকুলেটর আপনার ব্রাউজারেই চলে",
    principles: [
      { label: "জনস্বার্থে", title: "সবার জন্য", note: "সব ক্যালকুলেটর, গাইড আর টেমপ্লেট পাওয়া যায়, আর শুরু করতে অ্যাকাউন্ট লাগে না।" },
      { label: "সহজ ভাষা", title: "জটিল শব্দ ছাড়া", note: "নিয়মগুলো এমনভাবে বোঝানো, যেভাবে আপনি একজন বন্ধুকে বোঝাতেন, বিভ্রান্তিকর পরিভাষা ছাড়াই।" },
      { label: "সরকারি উৎসের ওপর গড়া", title: "Revenue-এর সঙ্গে মেলানো", note: "ক্যালকুলেটরগুলো Revenue-এর প্রকাশিত হার ব্যবহার করে, আর প্রতিটি সংখ্যা কোথা থেকে এসেছে তার লিংক দেয়।" },
      { label: "তথ্য, পরামর্শ নয়", title: "সীমা নিয়ে স্পষ্ট", note: "আমরা বুঝতে সাহায্য করি। আপনার পরিস্থিতির ওপর নির্ভর করে এমন সিদ্ধান্তের জন্য একজন নিয়ন্ত্রিত উপদেষ্টার সঙ্গে কথা বলুন।" },
    ],
  },

  calendar: {
    eyebrow: "Revenue.ie-এর আইনি সময়সূচি",
    title: "আইরিশ কর ক্যালেন্ডার *{years}*",
    body: "ব্যক্তি, স্বনিযুক্ত কন্ট্রাক্টর, বাড়িওয়ালা আর লিমিটেড কোম্পানির জন্য রিটার্ন জমা ও কর পরিশোধের মূল আইনি তারিখ।",
    next: "পরবর্তী আইনি সময়সীমা",
    more: "পুরো ক্যালেন্ডার দেখুন",
    less: "কম তারিখ দেখান",
    kinds: {
      payFile: {
        audience: "স্বনিযুক্ত ও বাড়িওয়ালা",
        title: "পে অ্যান্ড ফাইল",
        note: "{prev} সালের রিটার্ন জমা দিন, {prev} সালের বকেয়া কর আর {year} সালের প্রিলিমিনারি ট্যাক্স পরিশোধ করুন। কাগজে রিটার্ন আর ROS-এর বাইরে পরিশোধের তারিখ।",
        link: "সময়সীমার বিস্তারিত",
      },
      rosExtension: {
        audience: "ROS-এর বাড়তি সময় · স্বনিযুক্ত ও বাড়িওয়ালা",
        title: "ROS-এ Form 11",
        note: "{prev} সালের Form 11 জমা আর পরিশোধ দুটোই ROS-এ করলে এই পরের তারিখ। 31 আগস্ট পর্যন্ত বছরে মূল্যায়িত উপহার ও উত্তরাধিকারের CAT রিটার্নেও এটি প্রযোজ্য।",
        link: "Revenue-এর নোটিশ",
      },
      prelimCt: {
        audience: "লিমিটেড কোম্পানি",
        title: "প্রিলিমিনারি কর্পোরেশন ট্যাক্স",
        note: "31 ডিসেম্বরে হিসাব-বছর শেষ হলে: ছোট কোম্পানির একমাত্র কিস্তি, বা বড় কোম্পানির দ্বিতীয় কিস্তি।",
        link: "প্রিলিমিনারি CT-র নিয়ম",
      },
      prelimCtFirst: {
        audience: "বড় কোম্পানি",
        title: "প্রিলিমিনারি CT, প্রথম কিস্তি",
        note: "31 ডিসেম্বরে হিসাব-বছর শেষ হয় এমন বড় কোম্পানির দুই কিস্তির প্রথমটি।",
        link: "প্রিলিমিনারি CT-র নিয়ম",
      },
      ct1: {
        audience: "লিমিটেড কোম্পানি",
        title: "কর্পোরেশন ট্যাক্স, Form CT1",
        note: "31 ডিসেম্বর {prev}-এ শেষ হওয়া হিসাব-বছরের CT1 জমা দিন আর বাকি কর পরিশোধ করুন।",
        link: "CT1-এর সময়সীমা",
      },
      cgtInitial: {
        audience: "যিনি কোনো সম্পদ বিক্রি করেছেন",
        title: "ক্যাপিটাল গেইনস ট্যাক্স",
        note: "1 জানুয়ারি থেকে 30 নভেম্বর {year}-এর মধ্যে করা লাভের CGT পরিশোধ করুন।",
        link: "CGT পরিশোধের তারিখ",
      },
      cgtLater: {
        audience: "যিনি কোনো সম্পদ বিক্রি করেছেন",
        title: "ক্যাপিটাল গেইনস ট্যাক্স",
        note: "ডিসেম্বর {prev}-এ করা লাভের CGT পরিশোধ করুন।",
        link: "CGT পরিশোধের তারিখ",
      },
    },
  },

  topics: {
    eyebrow: "সব কিছু এক জায়গায়",
    title: "যে বিষয়ই সামলান, তার জন্য আছে একটি টুল আর একটি গাইড।",
    lede: "প্রতিটি ক্যালকুলেটর Revenue.ie-এর আইনি নিয়ম, {budget} আর সেন্ট্রাল ব্যাংকের সতর্কতামূলক নির্দেশনার সঙ্গে মেলানো।",
    caption: "আপনার সংখ্যা। আরও স্পষ্ট চিত্র।",
    items: [
      {
        title: "কর ক্যালকুলেটর হাব",
        note: "ব্যক্তিগত কর (PAYE, USC, PRSI), ভ্যাট, কর্পোরেশন ট্যাক্স, CGT আর উত্তরাধিকার কর।",
        tags: ["আয়কর", "ভ্যাট", "কর্পোরেশন ট্যাক্স", "CGT", "CAT"],
      },
      {
        title: "বিনিয়োগ ও ETF",
        note: "আইরিশ করের পরে সঞ্চয় ও বিনিয়োগের পথ তুলনা করুন, এক্সিট ট্যাক্স থেকে ডিমড ডিসপোজাল পর্যন্ত।",
        tags: ["ETF এক্সিট ট্যাক্স", "ডিমড ডিসপোজাল"],
      },
      {
        title: "সম্পত্তি ও মর্টগেজ",
        note: "সেন্ট্রাল ব্যাংকের 4x ধারের নিয়ম, ঋণদাতাদের হার, গ্রিন মর্টগেজ আর ক্যাশব্যাক।",
        tags: ["মর্টগেজ ক্যালকুলেটর", "ঋণদাতাদের হার", "গ্রিন মর্টগেজ"],
      },
      {
        title: "কোম্পানি শুরু",
        note: "সোল ট্রেডার নাকি Ltd, ভ্যাট নিবন্ধনের সীমা আর ধাপে ধাপে Form 11।",
        tags: ["সোল ট্রেডার নাকি Ltd", "ভ্যাট নিবন্ধন", "Form 11"],
      },
      {
        title: "ইনভেস্টমেন্ট অ্যাকাউন্ট",
        note: "1 জুলাই 2027 থেকে নতুন অ্যাকাউন্ট: €50,000-এর বেশি মূল্যের ওপর বছরে 1%, আর কোনো ডিমড ডিসপোজাল নেই।",
        tags: ["বছরে 1%", "বছরে €12,000 জমা", "জুলাই 2027 থেকে"],
      },
      {
        title: "{budget} হাব",
        note: "আপনার পকেটে কী বদলাচ্ছে: ব্যান্ড, USC আর রেন্ট ট্যাক্স ক্রেডিট।",
        tags: ["বাজেটের পরিবর্তন", "এক নজরে হার"],
      },
    ],
    footnote: "ক্যালকুলেটরগুলো শেখার টুল। প্রতিটি টুলের পাতায় অনুমান ও উৎস মিলিয়ে নিন।",
  },

  budget: {
    eyebrow: "{budget} · সহজ ব্যাখ্যা",
    title: "বাজেট অনেক বড়। শুরু করুন *আপনার কাছে যা গুরুত্বপূর্ণ* তা দিয়ে।",
    body: "20% ব্যান্ড বেড়ে €46,500, USC-র 2% ধাপ বেড়ে €30,300 আর রেন্ট ট্যাক্স ক্রেডিট বেড়ে €1,150। ভাড়া থাকেন, বাড়ি কিনছেন, পেনশনের জন্য জমাচ্ছেন বা পরিবার সামলাচ্ছেন? দেখুন আপনার জন্য কী বদলাচ্ছে।",
    cta: "{budget} দেখুন",
    cardEyebrow: "আপনার জীবন। আপনার প্রশ্ন।",
    topics: ["বাড়ি ও ভাড়া", "কাজ ও আয়", "পরিবার", "সঞ্চয় ও পেনশন"],
    caption: "কী বদলাচ্ছে তার আরও স্পষ্ট চিত্র।",
  },

  learn: {
    eyebrow: "সামনে এগোনোর স্পষ্ট পথ · আইনভিত্তিক পদ্ধতি",
    title: "শিখুন। হিসাব করুন। *পদক্ষেপ নিন।*",
    items: [
      { title: "শিখুন", note: "আয়কর, USC-র ধাপ, PRSI আর বিনিয়োগ করের নিয়ম নিয়ে সহজে বোঝার মতো গাইড পড়ুন।", link: "গাইডগুলো দেখুন" },
      { title: "হিসাব করুন", note: "হাতে পাওয়া বেতন, সেন্ট্রাল ব্যাংকের 4x মর্টগেজ সীমা আর ক্যাপিটাল গেইনস ট্যাক্স হিসাব করে দেখুন।", link: "ক্যালকুলেটর খুলুন" },
      { title: "পদক্ষেপ নিন", note: "Form 11 রিটার্ন জমা দিন, রেন্ট ট্যাক্স ক্রেডিট দাবি করুন, Revenue-এর পে অ্যান্ড ফাইল সময়সীমা মানুন আর কর-সাশ্রয়ী সম্পদ গড়ুন।", link: "সময়সীমা দেখুন" },
    ],
  },

  faq: {
    eyebrow: "সোজাসাপ্টা উত্তর",
    title: "যে প্রশ্নগুলো মানুষ সত্যিই করে।",
    items: [
      {
        question: "আয়ারল্যান্ডে ETF-এর ওপর কীভাবে কর বসে?",
        answer: "আয়ারল্যান্ডে নিবন্ধিত বেশির ভাগ ETF আর ইউরোপীয় UCITS ETF-এর ওপর এক্সিট ট্যাক্স বসে, ক্যাপিটাল গেইনস ট্যাক্স (CGT) নয়: 2026 সালে 38%, আর বাজেট 2027 অনুযায়ী 1 জানুয়ারি 2027 থেকে 35%। বিক্রির সময় কর দিতে হয়, আর ডিমড ডিসপোজাল নিয়মে প্রতি 8 বছরেও। লোকসান সাধারণ শেয়ারের লাভের সঙ্গে সমন্বয় করা যায় না।",
        link: "ETF নিয়ে পুরো গাইড পড়ুন",
      },
      {
        question: "আয়ারল্যান্ডে কখন আইনত ভ্যাট নিবন্ধন করতেই হবে?",
        answer: "যখন টানা যেকোনো 12 মাসে আপনার টার্নওভার পণ্যের ক্ষেত্রে {goods} বা সেবার ক্ষেত্রে {services} ছাড়ায়, বা ছাড়ানোর সম্ভাবনা থাকে। চাইলে আগেও নিবন্ধন করতে পারেন, যেমন ব্যবসার খরচের ভ্যাট ফেরত পেতে।",
        link: "ব্যবসা শুরুর গাইড দেখুন",
      },
      {
        question: "আয়ারল্যান্ডে ভাড়ার আয়ে কত কর দিতে হয়?",
        answer: "ভাড়ার মুনাফা আপনার অন্য আয়ের সঙ্গে যোগ হয়ে আপনার প্রান্তিক হারে (20% বা 40%) করযোগ্য হয়, সঙ্গে USC আর PRSI। মুনাফা মানে ভাড়া থেকে অনুমোদিত খরচ বাদ দিয়ে যা থাকে, যেমন ভাড়া দেওয়া বসতবাড়ির মর্টগেজ সুদ, মেরামত, ব্যবস্থাপনা ফি আর RTB নিবন্ধন।",
        link: "ভাড়ার আয় নিয়ে Revenue",
      },
      {
        question: "ডিমড ডিসপোজাল কী, আর কখন এটি প্রযোজ্য হয়?",
        answer: "প্রতি 8 বছরে আপনার কাছে থাকা ফান্ড বা ETF-এর ওপর এমনভাবে কর বসে, যেন আপনি তা বিক্রি করে আবার কিনেছেন: কিছু বিক্রি না করলেও তখন পর্যন্ত লাভের ওপর এক্সিট ট্যাক্স দিতে হয়। শেষে যখন সত্যিই বিক্রি করবেন, তখনকার কর থেকে আগে দেওয়া কর বাদ যায়।",
        link: "ডিমড ডিসপোজাল, সহজ ব্যাখ্যা",
      },
      {
        question: "ক্যাপিটাল অ্যাকুইজিশনস ট্যাক্স (CAT)-এ করমুক্তভাবে কত উত্তরাধিকার পেতে পারি?",
        answer: "যিনি দিচ্ছেন তাঁর সঙ্গে আপনার সম্পর্কের ওপর নির্ভর করে। আজীবন করমুক্ত সীমা হলো বাবা-মা থেকে সন্তানকে {a} (গ্রুপ A), ভাইবোনের মধ্যে আর নাতি-নাতনি বা ভাইপো-ভাইঝিকে {b} (গ্রুপ B), আর অন্য যেকোনো কারও কাছ থেকে {c} (গ্রুপ C)। এর বেশি হলে {rate} হারে কর বসে।",
        link: "উত্তরাধিকার ক্যালকুলেটর ব্যবহার করুন",
      },
      { question: "অ্যাকাউন্ট কি লাগবে?", answer: "ঘুরে দেখা শুরু করতে কোনো অ্যাকাউন্ট লাগে না। সাইন ইন করলে প্রশ্ন ও উত্তর এক জায়গায় রাখতে পারবেন।", link: "" },
      { question: "এটা কি আর্থিক বা কর পরামর্শ?", answer: "না। এই সাইট শেখার জন্য সাধারণ তথ্য দেয়। আপনার নিজের পরিস্থিতির সিদ্ধান্তের জন্য একজন যথাযথ যোগ্য উপদেষ্টার সঙ্গে কথা বলুন।", link: "" },
    ],
  },

  quote: {
    quote: "“টাকার জন্য কাজ করবেন না। *টাকাকে আপনার জন্য কাজ করান।*”",
    body: "আয়ারল্যান্ডে প্রজন্মের পর প্রজন্ম টেকে এমন সম্পদ গড়া শুরু হয় টাকা কীভাবে চলে তা জানা থেকে: কর-সাশ্রয়ী পেনশন, এন্টারপ্রেনার রিলিফ আর Revenue-এর নিয়ম মেনে চক্রবৃদ্ধির কৌশল।",
    link: "আইরিশ বিনিয়োগ করের কৌশল দেখুন",
  },

  trust: [
    "চার্টার্ড অ্যাকাউন্ট্যান্টদের দ্বারা পর্যালোচিত",
    "সরকারি আইনি হারের ওপর ভিত্তি করে",
    "তথ্য, নিয়ন্ত্রিত পরামর্শ নয়",
    "প্রতিটি জাতীয় বাজেটে হালনাগাদ",
  ],

  cta: {
    title: "নিজের অর্থের *নিয়ন্ত্রণ নিতে প্রস্তুত?*",
    body: "আয়ারল্যান্ডের কর বুঝতে, আগে থেকে পরিকল্পনা করতে আর আরও উজ্জ্বল আর্থিক ভবিষ্যৎ গড়তে আমাদের টুল ও গাইড দেখুন।",
    explore: "টুলগুলো দেখুন",
    account: "আপনার অ্যাকাউন্ট খুলুন",
  },
};

const hi: HomeMessages = {
  hero: {
    eyebrow: "वित्तीय शिक्षा · आयरलैंड",
    title: "आयरलैंड के टैक्स पर पकड़ बनाएँ। *बचाएँ, बढ़ाएँ, आगे बढ़ें।*",
    lede: "{count} क़ानून-आधारित आयरिश टैक्स कैलकुलेटर, सेंट्रल बैंक के 4x मॉर्गेज नियम और आसान भाषा में वित्तीय जानकारी। अंदाज़े की कोई ज़रूरत नहीं।",
    cta: "योजना शुरू करें",
    budget: "{budget} हब",
    checks: ["बिना अकाउंट के देखें", "शुरू करने के लिए अकाउंट ज़रूरी नहीं"],
    stats: {
      tools: "टैक्स कैलकुलेटर",
      band: "स्टैंडर्ड सीमा, {year}",
      languages: "भाषाएँ",
    },
  },

  finder: {
    eyebrow: "भरोसे की रूपरेखा · 60 सेकंड में राह",
    title: "समझ नहीं आ रहा कहाँ से शुरू करें?\nहम राह दिखाते हैं।",
    items: [
      { title: "वेतन और बजट", note: "हाथ में आने वाली तनख़्वाह, {band} का स्टैंडर्ड बैंड और टैक्स क्रेडिट।" },
      { title: "शेयर, प्रॉपर्टी, क्रिप्टो", note: "कैपिटल गेन्स टैक्स और सालाना {exemption} की छूट।" },
      { title: "घर ख़रीदना", note: "4x उधार की सीमा और बैंकों की दरें।" },
      { title: "कारोबार शुरू करना", note: "सोल ट्रेडर या Ltd, VAT रजिस्ट्रेशन और Form 11।" },
    ],
  },

  who: {
    eyebrow: "हमारे बारे में थोड़ा",
    title: "यह सीखने की जगह कि आयरलैंड में टैक्स और पैसा कैसे काम करते हैं।",
    body: "Irish Fintax सीखने का एक प्लेटफ़ॉर्म है। हम आयरलैंड के टैक्स और निजी वित्त को आसान भाषा में समझाते हैं, और अपने आँकड़े आज़माने के लिए कैलकुलेटर देते हैं, ताकि कोई भी फ़ैसला लेने से पहले आप समझ लें कि क्या हो रहा है।",
    more: "हमारे बारे में और",
    note: "कोई बिक्री की बात नहीं, कोई ट्रैकिंग कुकी नहीं। पूरे आयरलैंड के लोगों, मकान-मालिकों और संस्थापकों के लिए स्वतंत्र टैक्स और वित्त शिक्षा।",
    caption: "Revenue.ie के अनुसार मिलाया गया · कैलकुलेटर आपके ब्राउज़र में ही चलते हैं",
    principles: [
      { label: "जनहित में", title: "सबके लिए", note: "हर कैलकुलेटर, गाइड और टेम्पलेट उपलब्ध है, और शुरू करने के लिए अकाउंट ज़रूरी नहीं।" },
      { label: "आसान भाषा", title: "बिना उलझे शब्दों के", note: "नियम वैसे समझाए गए जैसे आप किसी दोस्त को समझाते, बिना उलझाने वाली शब्दावली के।" },
      { label: "सार्वजनिक स्रोतों पर आधारित", title: "Revenue से मिलान किया गया", note: "कैलकुलेटर Revenue की प्रकाशित दरें इस्तेमाल करते हैं और हर आँकड़े के स्रोत का लिंक देते हैं।" },
      { label: "जानकारी, सलाह नहीं", title: "सीमाओं को लेकर साफ़", note: "हम समझने में मदद करते हैं। जो फ़ैसला आपकी परिस्थिति पर टिका हो, उसके लिए किसी विनियमित सलाहकार से मिलें।" },
    ],
  },

  calendar: {
    eyebrow: "Revenue.ie का क़ानूनी कैलेंडर",
    title: "आयरिश टैक्स कैलेंडर *{years}*",
    body: "व्यक्तियों, स्व-रोज़गार ठेकेदारों, मकान-मालिकों और लिमिटेड कंपनियों के लिए रिटर्न भरने और भुगतान की मुख्य क़ानूनी तारीख़ें।",
    next: "अगली क़ानूनी समय-सीमा",
    more: "पूरा कैलेंडर देखें",
    less: "कम तारीख़ें दिखाएँ",
    kinds: {
      payFile: {
        audience: "स्व-रोज़गार और मकान-मालिक",
        title: "पे एंड फ़ाइल",
        note: "{prev} का रिटर्न भरें, {prev} का बाक़ी टैक्स चुकाएँ और {year} का प्रारंभिक टैक्स दें। काग़ज़ी रिटर्न और ROS के बाहर भुगतान की तारीख़।",
        link: "समय-सीमा का विवरण",
      },
      rosExtension: {
        audience: "ROS की मोहलत · स्व-रोज़गार और मकान-मालिक",
        title: "ROS पर Form 11",
        note: "जब आप {prev} का Form 11 भरना और भुगतान, दोनों ROS से करें, तब की बाद वाली तारीख़। 31 अगस्त तक के साल में आँके गए उपहार और विरासत के CAT रिटर्न पर भी यही लागू है।",
        link: "Revenue की सूचना",
      },
      prelimCt: {
        audience: "लिमिटेड कंपनियाँ",
        title: "प्रारंभिक कॉर्पोरेशन टैक्स",
        note: "31 दिसंबर को ख़त्म होने वाले वित्त-वर्ष के लिए: छोटी कंपनी का इकलौता भुगतान, या बड़ी कंपनी की दूसरी किस्त।",
        link: "प्रारंभिक CT के नियम",
      },
      prelimCtFirst: {
        audience: "बड़ी कंपनियाँ",
        title: "प्रारंभिक CT, पहली किस्त",
        note: "31 दिसंबर को वित्त-वर्ष ख़त्म करने वाली बड़ी कंपनी के दो भुगतानों में से पहला।",
        link: "प्रारंभिक CT के नियम",
      },
      ct1: {
        audience: "लिमिटेड कंपनियाँ",
        title: "कॉर्पोरेशन टैक्स, Form CT1",
        note: "31 दिसंबर {prev} को ख़त्म हुई लेखा-अवधि का CT1 भरें और बाक़ी टैक्स चुकाएँ।",
        link: "CT1 की समय-सीमा",
      },
      cgtInitial: {
        audience: "जिसने कोई संपत्ति बेची हो",
        title: "कैपिटल गेन्स टैक्स",
        note: "1 जनवरी से 30 नवंबर {year} के बीच हुए मुनाफ़े पर CGT चुकाएँ।",
        link: "CGT भुगतान की तारीख़ें",
      },
      cgtLater: {
        audience: "जिसने कोई संपत्ति बेची हो",
        title: "कैपिटल गेन्स टैक्स",
        note: "दिसंबर {prev} में हुए मुनाफ़े पर CGT चुकाएँ।",
        link: "CGT भुगतान की तारीख़ें",
      },
    },
  },

  topics: {
    eyebrow: "सब कुछ एक जगह",
    title: "आप जिस भी चीज़ से जूझ रहे हों, उसके लिए एक टूल और एक गाइड है।",
    lede: "हर कैलकुलेटर Revenue.ie के क़ानूनी नियमों, {budget} और सेंट्रल बैंक के विवेकपूर्ण दिशानिर्देशों से मिलाया गया है।",
    caption: "आपके आँकड़े। साफ़ तस्वीर।",
    items: [
      {
        title: "टैक्स कैलकुलेटर हब",
        note: "निजी टैक्स (PAYE, USC, PRSI), VAT, कॉर्पोरेशन टैक्स, CGT और विरासत टैक्स।",
        tags: ["इनकम टैक्स", "VAT", "कॉर्पोरेशन टैक्स", "CGT", "CAT"],
      },
      {
        title: "निवेश और ETF",
        note: "आयरिश टैक्स के बाद बचत और निवेश के तरीक़ों की तुलना करें, एग्ज़िट टैक्स से डीम्ड डिस्पोज़ल तक।",
        tags: ["ETF एग्ज़िट टैक्स", "डीम्ड डिस्पोज़ल"],
      },
      {
        title: "प्रॉपर्टी और मॉर्गेज",
        note: "सेंट्रल बैंक का 4x उधार नियम, बैंकों की दरें, ग्रीन मॉर्गेज और कैशबैक।",
        tags: ["मॉर्गेज कैलकुलेटर", "बैंकों की दरें", "ग्रीन मॉर्गेज"],
      },
      {
        title: "कंपनी शुरू करना",
        note: "सोल ट्रेडर या Ltd, VAT रजिस्ट्रेशन की सीमाएँ और Form 11 की क़दम-दर-क़दम गाइड।",
        tags: ["सोल ट्रेडर या Ltd", "VAT रजिस्ट्रेशन", "Form 11"],
      },
      {
        title: "इन्वेस्टमेंट अकाउंट",
        note: "1 जुलाई 2027 से नया अकाउंट: €50,000 से ऊपर की वैल्यू पर सालाना 1%, और कोई डीम्ड डिस्पोज़ल नहीं।",
        tags: ["सालाना 1%", "साल में €12,000 तक जमा", "जुलाई 2027 से"],
      },
      {
        title: "{budget} हब",
        note: "आपकी जेब पर क्या बदलता है: बैंड, USC और रेंट टैक्स क्रेडिट।",
        tags: ["बजट के बदलाव", "एक नज़र में दरें"],
      },
    ],
    footnote: "कैलकुलेटर सीखने के टूल हैं। हर टूल के पेज पर मान्यताएँ और स्रोत जाँच लें।",
  },

  budget: {
    eyebrow: "{budget} · आसान भाषा में",
    title: "बजट बड़ा है। शुरुआत उससे करें जो *आपके लिए मायने रखता है।*",
    body: "20% वाला बैंड बढ़कर €46,500, USC का 2% वाला स्लैब बढ़कर €30,300 और रेंट टैक्स क्रेडिट बढ़कर €1,150 हो जाता है। किराये पर रहते हैं, घर ख़रीद रहे हैं, पेंशन के लिए बचा रहे हैं या परिवार सँभाल रहे हैं? देखें आपके लिए क्या बदलता है।",
    cta: "{budget} देखें",
    cardEyebrow: "आपकी ज़िंदगी। आपके सवाल।",
    topics: ["घर और किराया", "काम और आय", "परिवार", "बचत और पेंशन"],
    caption: "क्या बदल रहा है, इसकी साफ़ तस्वीर।",
  },

  learn: {
    eyebrow: "आगे का साफ़ रास्ता · क़ानून-आधारित तरीक़ा",
    title: "सीखें। हिसाब लगाएँ। *क़दम उठाएँ।*",
    items: [
      { title: "सीखें", note: "इनकम टैक्स, USC के स्लैब, PRSI और निवेश पर टैक्स के नियमों पर आसान गाइड पढ़ें।", link: "गाइड देखें" },
      { title: "हिसाब लगाएँ", note: "हाथ में आने वाली तनख़्वाह, सेंट्रल बैंक की 4x मॉर्गेज सीमा और कैपिटल गेन्स टैक्स का हिसाब लगाएँ।", link: "कैलकुलेटर खोलें" },
      { title: "क़दम उठाएँ", note: "Form 11 रिटर्न भरें, रेंट टैक्स क्रेडिट क्लेम करें, Revenue की पे एंड फ़ाइल समय-सीमाएँ निभाएँ और टैक्स-कुशल संपत्ति बनाएँ।", link: "समय-सीमाएँ देखें" },
    ],
  },

  faq: {
    eyebrow: "सीधे जवाब",
    title: "वे सवाल जो लोग सच में पूछते हैं।",
    items: [
      {
        question: "आयरलैंड में ETF पर टैक्स कैसे लगता है?",
        answer: "आयरलैंड में पंजीकृत ज़्यादातर ETF और यूरोपीय UCITS ETF पर एग्ज़िट टैक्स लगता है, कैपिटल गेन्स टैक्स (CGT) नहीं: 2026 में 38%, और बजट 2027 के तहत 1 जनवरी 2027 से 35%। टैक्स बेचने पर लगता है, और डीम्ड डिस्पोज़ल नियम के तहत हर 8 साल पर भी। घाटे को आम शेयरों के मुनाफ़े से नहीं घटाया जा सकता।",
        link: "ETF पर पूरी गाइड पढ़ें",
      },
      {
        question: "आयरलैंड में क़ानूनन VAT रजिस्ट्रेशन कब ज़रूरी है?",
        answer: "जब लगातार किसी भी 12 महीनों में आपका टर्नओवर सामान के लिए {goods} या सेवाओं के लिए {services} पार करे, या पार करने की संभावना हो। चाहें तो पहले भी रजिस्टर कर सकते हैं, जैसे कारोबार के ख़र्चों पर लगा VAT वापस पाने के लिए।",
        link: "कारोबार शुरू करने की गाइड देखें",
      },
      {
        question: "आयरलैंड में किराये की आय पर कितना टैक्स लगता है?",
        answer: "किराये का मुनाफ़ा आपकी बाक़ी आय में जुड़ता है और आपकी मार्जिनल दर (20% या 40%) पर टैक्स लगता है, ऊपर से USC और PRSI। मुनाफ़ा यानी किराये में से मान्य ख़र्च घटाकर बचा हिस्सा, जैसे किराये पर दिए रिहायशी घर का मॉर्गेज ब्याज, मरम्मत, मैनेजमेंट फ़ीस और RTB रजिस्ट्रेशन।",
        link: "किराये की आय पर Revenue",
      },
      {
        question: "डीम्ड डिस्पोज़ल क्या है और यह कब लागू होता है?",
        answer: "हर 8 साल पर आपके पास रखे फ़ंड या ETF पर ऐसे टैक्स लगता है, जैसे आपने उसे बेचकर दोबारा ख़रीदा हो: कुछ न बेचने पर भी तब तक के मुनाफ़े पर एग्ज़िट टैक्स देना होता है। आख़िर में असल बिक्री पर बनने वाले टैक्स में से पहले दिया गया टैक्स घट जाता है।",
        link: "डीम्ड डिस्पोज़ल, आसान भाषा में",
      },
      {
        question: "कैपिटल एक्विज़िशन्स टैक्स (CAT) में कितनी विरासत टैक्स-फ़्री मिल सकती है?",
        answer: "यह देने वाले से आपके रिश्ते पर निर्भर है। जीवन भर की टैक्स-फ़्री सीमाएँ हैं: माता-पिता से संतान को {a} (ग्रुप A), भाई-बहनों के बीच और पोते-पोतियों, भतीजे-भतीजियों या भांजे-भांजियों को {b} (ग्रुप B), और किसी और से {c} (ग्रुप C)। इससे ऊपर की रक़म पर {rate} टैक्स लगता है।",
        link: "विरासत कैलकुलेटर आज़माएँ",
      },
      { question: "क्या मुझे अकाउंट चाहिए?", answer: "देखना शुरू करने के लिए किसी अकाउंट की ज़रूरत नहीं। साइन इन करने पर आप सवाल और जवाब एक जगह रख सकते हैं।", link: "" },
      { question: "क्या यह वित्तीय या टैक्स सलाह है?", answer: "नहीं। यह साइट सीखने के लिए सामान्य जानकारी देती है। अपनी परिस्थितियों से जुड़े फ़ैसलों के लिए किसी उपयुक्त योग्य सलाहकार से बात करें।", link: "" },
    ],
  },

  quote: {
    quote: "“पैसे के लिए काम मत करो। *पैसे को अपने लिए काम करने दो।*”",
    body: "आयरलैंड में पीढ़ियों तक चलने वाली संपत्ति बनाना यह जानने से शुरू होता है कि पैसा कैसे चलता है: टैक्स-कुशल पेंशन, एंटरप्रेन्योर रिलीफ़ और Revenue के नियमों के मुताबिक़ चक्रवृद्धि की रणनीतियाँ।",
    link: "आयरलैंड में निवेश टैक्स की रणनीतियाँ देखें",
  },

  trust: [
    "चार्टर्ड अकाउंटेंट्स द्वारा समीक्षित",
    "सार्वजनिक क़ानूनी दरों पर आधारित",
    "जानकारी, विनियमित सलाह नहीं",
    "हर राष्ट्रीय बजट के साथ अपडेट",
  ],

  cta: {
    title: "अपने पैसों पर *नियंत्रण के लिए तैयार?*",
    body: "आयरलैंड के टैक्स को समझने, पहले से योजना बनाने और बेहतर वित्तीय भविष्य बनाने के लिए हमारे टूल और गाइड देखें।",
    explore: "टूल देखें",
    account: "अपना अकाउंट बनाएँ",
  },
};

export const homeMessages: Translations<HomeMessages> = { en, ga, es, pt, ar, bn, hi };
