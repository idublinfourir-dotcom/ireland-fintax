import type { Translations } from "../i18n";

/* The about page and the 404 page. `sections` pairs by index with the hrefs
   in about/page.tsx. */

const en = {
  meta: {
    title: "About",
    description:
      "Irish Fintax is a free place to learn how Irish tax and personal finance work, with calculators, guides and templates in plain English.",
  },
  hero: {
    eyebrow: "About",
    title: "Learn how the money side works.",
    lede: "Irish Fintax is a free learning platform for Irish tax and personal finance: plain-English explanations and calculators you can run yourself.",
  },
  whyEyebrow: "Why it exists",
  whyTitle: "Tax shouldn’t need a translator.",
  body: [
    "Most people meet tax and money questions at the worst moment: a first payslip, selling shares, buying a home, starting a company. The rules are public, but they are written for specialists.",
    "This site puts them in plain English and lets you try your own numbers, so you understand what is going on before you decide anything. Everything here is free.",
    "It is general information, not advice. Rates and rules change and your own situation matters, so check with Revenue or a qualified, regulated adviser before acting on a big decision.",
  ],
  sections: [
    { title: "Tax Calculation Hub", description: "Calculators for income tax, VAT, corporation tax, the R&D credit, capital allowances, CGT and CAT, using Irish rates." },
    { title: "Personal Finance Tools", description: "Work out a mortgage, and compare investment options side by side on risk, tax and access to your money." },
    { title: "Accounts and Finance", description: "Memos, templates, tax and VAT forms and setup guides for starting and running a company." },
    { title: "Ask a question", description: "Stuck on something the tools don’t cover? Ask it in your own words and get a plain-English answer by email." },
  ],
  notFound: {
    title: "This field is empty.",
    body: "The page you are looking for has been moved, harvested or never planted. Let’s get you back to solid ground.",
    home: "Back to home",
    contact: "Contact us",
  },
};

export const aboutMessages: Translations<typeof en> = {
  en,

  es: {
    meta: {
      title: "Quiénes somos",
      description:
        "Irish Fintax es un lugar gratuito para aprender cómo funcionan los impuestos y las finanzas personales en Irlanda, con calculadoras, guías y plantillas en palabras sencillas.",
    },
    hero: {
      eyebrow: "Quiénes somos",
      title: "Aprende cómo funciona la parte del dinero.",
      lede: "Irish Fintax es una plataforma de aprendizaje gratuita sobre impuestos y finanzas personales en Irlanda: explicaciones sencillas y calculadoras que puedes usar tú mismo.",
    },
    whyEyebrow: "Por qué existe",
    whyTitle: "Los impuestos no deberían necesitar un traductor.",
    body: [
      "La mayoría de la gente se encuentra con dudas sobre impuestos y dinero en el peor momento: la primera nómina, vender acciones, comprar una casa, crear una empresa. Las normas son públicas, pero están escritas para especialistas.",
      "Esta web las explica con palabras sencillas y te deja probar tus propios números, para que entiendas lo que pasa antes de decidir nada. Todo es gratis.",
      "Es información general, no asesoramiento. Los tipos y las normas cambian y tu situación importa, así que consulta con Revenue o con un asesor cualificado y regulado antes de tomar una decisión importante.",
    ],
    sections: [
      { title: "Calculadoras de impuestos", description: "Calculadoras del impuesto sobre la renta, IVA, impuesto de sociedades, crédito por I+D, amortizaciones fiscales, CGT y CAT, con los tipos irlandeses." },
      { title: "Finanzas personales", description: "Calcula una hipoteca y compara opciones de inversión una al lado de otra según riesgo, impuestos y acceso a tu dinero." },
      { title: "Contabilidad y finanzas", description: "Notas, plantillas, formularios de impuestos y de IVA y guías para crear y gestionar una empresa." },
      { title: "Haz una pregunta", description: "¿Te has atascado con algo que las herramientas no cubren? Pregúntalo con tus palabras y recibe por correo una respuesta clara." },
    ],
    notFound: {
      title: "Aquí no hay nada.",
      body: "La página que buscas se ha movido o nunca ha existido. Volvamos a terreno firme.",
      home: "Volver al inicio",
      contact: "Contacto",
    },
  },

  pt: {
    meta: {
      title: "Sobre nós",
      description:
        "A Irish Fintax é um lugar gratuito para aprender como funcionam os impostos e as finanças pessoais na Irlanda, com calculadoras, guias e modelos em palavras simples.",
    },
    hero: {
      eyebrow: "Sobre nós",
      title: "Aprenda como funciona o lado do dinheiro.",
      lede: "A Irish Fintax é uma plataforma de aprendizado gratuita sobre impostos e finanças pessoais na Irlanda: explicações simples e calculadoras que você mesmo pode usar.",
    },
    whyEyebrow: "Por que existe",
    whyTitle: "Imposto não deveria precisar de tradutor.",
    body: [
      "A maioria das pessoas se depara com dúvidas sobre impostos e dinheiro na pior hora: o primeiro contracheque, a venda de ações, a compra de um imóvel, a abertura de uma empresa. As regras são públicas, mas são escritas para especialistas.",
      "Este site as explica em palavras simples e deixa você testar seus próprios números, para entender o que está acontecendo antes de decidir qualquer coisa. Tudo aqui é gratuito.",
      "É informação geral, não aconselhamento. Alíquotas e regras mudam e a sua situação importa, então confirme com a Revenue ou com um consultor qualificado e regulamentado antes de tomar uma decisão importante.",
    ],
    sections: [
      { title: "Calculadoras de impostos", description: "Calculadoras de imposto de renda, IVA, imposto sobre empresas, crédito de P&D, depreciação fiscal, CGT e CAT, com as alíquotas irlandesas." },
      { title: "Finanças pessoais", description: "Simule um financiamento e compare opções de investimento lado a lado por risco, imposto e acesso ao seu dinheiro." },
      { title: "Contabilidade e finanças", description: "Notas, modelos, formulários de impostos e de IVA e guias para abrir e administrar uma empresa." },
      { title: "Faça uma pergunta", description: "Travou em algo que as ferramentas não cobrem? Pergunte com suas palavras e receba por e-mail uma resposta clara." },
    ],
    notFound: {
      title: "Não há nada aqui.",
      body: "A página que você procura foi movida ou nunca existiu. Vamos voltar para terreno firme.",
      home: "Voltar ao início",
      contact: "Fale conosco",
    },
  },

  ga: {
    meta: {
      title: "Fúinn",
      description:
        "Is áit saor in aisce é Irish Fintax le foghlaim conas a oibríonn cáin agus airgeadas pearsanta in Éirinn, le háireamháin, treoracha agus teimpléid i dteanga shimplí.",
    },
    hero: {
      eyebrow: "Fúinn",
      title: "Foghlaim conas a oibríonn taobh an airgid.",
      lede: "Is ardán foghlama saor in aisce é Irish Fintax do cháin agus airgeadas pearsanta na hÉireann: mínithe simplí agus áireamháin is féidir leat féin a úsáid.",
    },
    whyEyebrow: "Cén fáth a bhfuil sé ann",
    whyTitle: "Níor cheart go mbeadh aistritheoir ag teastáil le haghaidh cánach.",
    body: [
      "Buaileann formhór na ndaoine le ceisteanna faoi cháin agus airgead ag an am is measa: an chéad duillín pá, scaireanna a dhíol, teach a cheannach, comhlacht a bhunú. Tá na rialacha poiblí, ach scríobhadh iad do speisialtóirí.",
      "Míníonn an suíomh seo i dteanga shimplí iad agus ligeann sé duit d’uimhreacha féin a thriail, ionas go dtuigfidh tú cad atá ar siúl sula socraíonn tú aon rud. Tá gach rud anseo saor in aisce.",
      "Is eolas ginearálta é, ní comhairle. Athraíonn rátaí agus rialacha agus tá tábhacht le do chás féin, mar sin déan seiceáil leis na Coimisinéirí Ioncaim nó le comhairleoir cáilithe rialáilte sula ndéanann tú cinneadh mór.",
    ],
    sections: [
      { title: "Áireamháin chánach", description: "Áireamháin do cháin ioncaim, CBL, cáin chorparáide, an creidmheas T&F, liúntais chaipitiúla, CGC agus CFC, le rátaí na hÉireann." },
      { title: "Airgeadas pearsanta", description: "Oibrigh amach morgáiste, agus cuir roghanna infheistíochta i gcomparáid taobh le taobh de réir riosca, cánach agus rochtana ar d’airgead." },
      { title: "Cuntais agus Airgeadas", description: "Meabhráin, teimpléid, foirmeacha cánach agus CBL agus treoracha chun comhlacht a bhunú agus a reáchtáil." },
      { title: "Cuir ceist", description: "Rud éigin nach gclúdaíonn na huirlisí? Cuir ceist i d’fhocail féin agus faigh freagra soiléir ar ríomhphost." },
    ],
    notFound: {
      title: "Níl aon rud anseo.",
      body: "Bogadh an leathanach atá á lorg agat, nó ní raibh sé riamh ann. Fillimis ar thalamh slán.",
      home: "Ar ais abhaile",
      contact: "Déan teagmháil linn",
    },
  },
};
