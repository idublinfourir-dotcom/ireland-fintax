import type { Translations } from "../i18n";

/* The Investment Account page (app/investment-account/page.tsx) and its
   calculator (components/investment-account-tools.tsx). Every euro amount is
   a {placeholder} filled from lib/ireland-investment-account.ts, so a figure
   lives in one place and each language formats it its own way: {limit} the
   yearly limit, {threshold} the tax-free value, {age} the minimum age, and
   the rest worked examples. Lists of objects pair by index with the page's
   hrefs and dates. Official titles (the Bill, the sources) stay English. */

const en = {
  meta: {
    title: "Irish Investment Account: how the 1% tax works",
    description:
      "The Investment Account announced in Budget 2027 for 1 July 2027, in the Finance Bill and not yet law: who can open one, what can go in, how the 1% tax on value above {threshold} works, with a calculator that follows the Finance Bill day by day.",
  },
  home: "Home",
  crumb: "Investment Account",
  title: "Irish Investment Account",
  lede: "A new account for shares, bonds and funds, due from 1 July 2027. Instead of CGT or exit tax, you pay 1% a year on whatever it is worth above {threshold}, and the provider deals with Revenue.",
  status: "In the Finance Bill. Not law yet.",
  statusBody:
    "Finance (No. 2) Bill 2026 published 19 October 2026. Becomes law with the Finance Act, then starts by ministerial order. Last checked {date}.",
  canOpen: "Can I open one?",
  workOut: "Work out the tax",
  rulesTitle: "The rules in short",
  rules: [
    {
      term: "Paying in",
      def: "Up to {limit} a year, in money only. There is no minimum, and taking money out doesn't give you any of that year's limit back.",
    },
    {
      term: "The tax",
      def: "1% a year on the account's average value above {threshold}. Below that, nothing. Inside the account there is no CGT, dividend withholding tax, exit tax or 8-year deemed disposal, and nothing is due when you take money out.",
    },
    {
      term: "The average",
      def: "The account is valued at the close of every day it is open, and the tax uses the average of those values for the year.",
    },
    {
      term: "Paperwork",
      def: "None for you. The provider works out the tax, pays it to Revenue from the account and sends you a yearly statement.",
    },
  ],
  howTitle: "How the tax is worked out",
  formula: "(average value − {threshold}) × 1%",
  speech:
    "The {speech} used an account averaging {avg}: that is {over} over the threshold, so the tax is {tax}. A few more cases:",
  speechLink: "Budget speech",
  cases: [
    "Paying in the full {limit} for four years gives {four} before growth, still under the threshold, so no tax yet.",
    "An account that lost money over the year but still averaged {avg} owes {tax}. The tax follows value, not profit.",
    "Money paid in on 1 December is there for 31 of the year's 365 days, so only about a twelfth of it counts toward that year's average.",
  ],
  partYear:
    "The average covers only the days the account was open. If you close it partway through a year, that part of the year is taxed when it closes.",
  whoTitle: "Who can open one",
  whoBody:
    "Anyone {age} or over who is resident in Ireland for tax and has a PPS number. You get one account, in your own name. If you close it during a year, you can't open another until the next year. Providers check all of this when you apply.",
  whatTitle: "What can go in",
  allowedTitle: "Allowed",
  allowed: [
    "Shares traded on a regulated market in the EEA, or on an equivalent market elsewhere",
    "Bonds traded the same way",
    "UCITS funds, which covers most ETFs sold in Europe",
    "Insurance-based investment products",
  ],
  notAllowedTitle: "Not allowed",
  notAllowed: [
    "Anything else, such as crypto assets and derivatives",
    "Funds that aren't UCITS, such as US-domiciled ETFs, and structured UCITS",
    "Personal portfolio funds and personal portfolio life policies",
    "Shares from an employee share scheme",
    "Cash as savings: it can sit there only while waiting to be invested, and earns no interest",
  ],
  calcTitle: "Calculator",
  calcIntro:
    "Pick when you open it, what you pay in and a growth rate. It values the account every day it is open, averages those values and takes 1% of anything over {threshold}, as the Finance Bill sets out.",
  notFitTitle: "When it may not suit you",
  notFit: [
    "Money you might need in the next few years. Investments can fall just when you need them, so an emergency fund belongs in a deposit account first, and investing generally suits goals five or more years away.",
    "Low expected returns. The 1% is charged on value, not profit: on an average of {avg} the tax is {tax} whether the account grew by {grew} that year or not at all.",
    "Unused pension room. Pension contributions get income tax relief, within age-related limits, and this account gets none on the way in. Pension money is locked away until retirement, though, and this account can be emptied at any time.",
  ],
  openTitle: "Not decided yet",
  openIntro: "The Bill answers most questions, but not these, and the Bill itself can still change.",
  openQs: [
    {
      q: "When will accounts open?",
      said: "The Bill allows accounts from 1 January 2027, with the start set by ministerial order. The Government says providers will begin offering them from 1 July 2027.",
    },
    {
      q: "Will it count as savings for means-tested welfare payments?",
      said: "The Finance Bill doesn't cover it and nothing has been said yet.",
    },
    {
      q: "What will it cost?",
      said: "There is no fee cap. Industry sources expect about 0.5% a year all-in without advice and up to 1.5% with it. No provider has published prices.",
    },
    {
      q: "How will investments be valued each day?",
      said: "Revenue will set the price sources and currency rules in regulations.",
    },
    {
      q: "Will children's accounts be allowed?",
      said: "Not at launch. The Minister says they will be considered in future Finance Bills.",
    },
    {
      q: "Will the Bill change?",
      said: "It went to Select Committee after the Dáil's Second Stage debate on 20 October and can be amended at Committee and Report Stages.",
    },
  ],
  timelineTitle: "Where it stands",
  timeline: [
    { what: "Minister announces plans for a savings and investment scheme" },
    { what: "Savings and Investment Forum sets the principles" },
    { what: "Retail Investment Roadmap gives the design" },
    { what: "Budget 2027 sets {limit}, {threshold} and 1%" },
    { what: "Finance (No. 2) Bill published with the account's legal rules" },
    { what: "Dáil Second Stage debate; the Bill goes to Select Committee" },
    { what: "Committee and Report Stages (expected)" },
    { what: "Finance Act signed into law (expected)" },
    { what: "Ministerial order starts the account rules" },
    { what: "Providers start offering accounts (Government plan; the Bill allows 1 January 2027)" },
  ],
  afterAct: "After the Act",
  providersTitle: "Who can offer it",
  providersBody:
    "Only regulated firms: investment firms and brokers authorised under MiFID, banks with investment permissions, fund management companies, and insurers for insurance-based products. Firms elsewhere in the EEA can offer it too, as long as they run the Irish tax for you. Each provider must register with Revenue, which will publish the list. Credit unions want to take part but aren't among the types named in the Bill.",
  noBrands: "We don't name brands. None has published prices yet, and a list would read as a recommendation.",
  faqTitle: "Questions",
  faqs: [
    {
      q: "Is my money guaranteed?",
      a: "No. The account is a tax treatment, not a State savings product. It holds shares, bonds and funds, which can fall, and you could get back less than you put in. The 1% can still be due in a year the account loses money, if its average value is above {threshold}.",
    },
    {
      q: "Can I take money out?",
      a: "Yes, at any time, with no lock-in and no tax on withdrawal. Money taken out does not free up any of that year's {limit}: the limit counts everything paid in.",
    },
    {
      q: "Can I move shares or ETFs I already own into it?",
      a: "No. Only money can be paid in, so you would have to sell them first, which can be a taxable disposal outside the account.",
    },
    {
      q: "What if I pay in more than {limit} in a year?",
      a: "The excess is charged 1% a month until you take it out, even into later years, and the provider faces a penalty, so providers are likely to stop you going over.",
    },
    {
      q: "Can a couple share one?",
      a: "No, joint accounts aren't allowed. Each adult can have their own, so a couple has {double} of tax-free room between them.",
    },
    {
      q: "What if I move abroad?",
      a: "Tell your provider. The account stays open, but you cannot pay in or move it to another provider while you are not resident.",
    },
    {
      q: "What happens when someone dies?",
      a: "Their personal representatives take it over. Nothing more can be paid in, and the investments must be sold within a year of the grant of probate or administration, or by the third anniversary of the death, whichever comes first. Anything not sold by then is treated as sold at market value.",
    },
    {
      q: "Is it the same as a UK ISA?",
      a: "No. It is closer to Sweden's ISK: a small yearly tax on the value, instead of a fully tax-free wrapper with a larger limit.",
    },
  ],
  seeAlso: "See also",
  related: [
    { label: "Investment planner", body: "compare 32 Irish options by return after tax" },
    { label: "CGT calculator", body: "tax on selling shares outside the account, at 31%" },
    { label: "Budget 2027", body: "the other changes" },
    { label: "How savings and investments are taxed", body: "the longer guide" },
  ],
  ccpc: { label: "CCPC Investment Readiness Tool", body: "a short check on whether you are ready to invest" },
  sourcesTitle: "Sources",
  disclaimer:
    "General information only, not financial, tax or legal advice. Rules are as set out in the Finance (No. 2) Bill 2026, published on 19 October 2026, and may change before it becomes law. The account is not a State guarantee: investments can fall as well as rise.",
  calc: {
    opens: "Account opens on",
    first: "Paid in when it opens",
    monthly: "Each month",
    monthlyHint: "On the 1st, from the month it opens.",
    yearly: "Extra each January",
    yearlyHint: "From the second year on.",
    until: "Keep it until 31 December",
    growth: "Growth a year (your assumption)",
    growthHint:
      "Not a forecast. Growth of the investments after their own fund charges. Real returns go up and down, and can be negative.",
    fee: "Provider fee a year",
    feeHint: "No provider has published prices. Industry sources expect about 0.5% without advice, up to 1.5% with it.",
    paid: "You pay in",
    growthTile: "Growth",
    growthAfterFees: "Growth, after fees",
    taxTile: "1% tax, all years",
    valueOn: "Value on 31 December {year}",
    noTax: "The average value never goes over {threshold} in a year, so no tax is due.",
    firstTax: "The 1% first applies in {year}, the first year the average value goes over {threshold}.",
    share: "Over the whole period the tax comes to {share} of the growth.",
    noWithdrawalTax: "Taking money out is not taxed.",
    refused:
      "{refused} of what you planned to pay in is over the {limit} limit for its calendar year, so it is left out. Providers are expected to refuse it: money over the limit is charged 1% a month until it is taken out.",
    cols: {
      year: "Year",
      days: "Days open",
      paidIn: "Paid in",
      growth: "Growth",
      average: "Average value",
      tax: "1% tax",
      end: "Value at 31 Dec",
    },
    how: "How it is worked out",
    howItems: [
      "The account is valued at the close of every calendar day it is open, weekends included. The average value is those daily values added up and divided by the number of days (section 747Q(5)).",
      "Tax for the year: (average value − {threshold}) × 1%, nil if that is below zero (747Q(4) and (7)). In the year it opens, the average covers only the days it was open, and the {threshold} is not reduced.",
      "The tax is taken from the account on 31 December here. The law lets the provider take it from the account or another way you agree, and pay it to Revenue by 14 April (747Q(6), 747T).",
      "At most {limit} is paid in each calendar year, whatever is taken out (747H, 747L). Payments are made on the 1st of the month.",
      "Growth and the provider fee are spread evenly over the days, so a full year grows by exactly the rate you chose, less the fee. Growth is shown after fees and before this tax.",
      "Nothing else is taxed: no exit tax, CGT, dividend withholding tax or deemed disposal inside the account, and nothing when you take money out (747P, Finance Bill s.27).",
    ],
    source: "Source:",
    sourceLink: "Finance (No. 2) Bill 2026, section 26, new Part 27A",
    illustration:
      "Illustration only, not advice. It assumes one steady return every year; real returns vary and can be negative. Rules are as in the Finance (No. 2) Bill 2026 and may change before it becomes law.",
  },
};

export type InvestmentAccountMessages = typeof en;

export const investmentAccountMessages: Translations<InvestmentAccountMessages> = {
  en,

  es: {
    meta: {
      title: "Cuenta de inversión irlandesa: cómo funciona el impuesto del 1%",
      description:
        "La cuenta de inversión anunciada en el Presupuesto 2027 para el 1 de julio de 2027, incluida en el Finance Bill y todavía no es ley: quién puede abrirla, qué puede contener, cómo funciona el impuesto del 1% sobre el valor que supera {threshold}, con una calculadora que sigue el Finance Bill día a día.",
    },
    home: "Inicio",
    crumb: "Cuenta de inversión",
    title: "Cuenta de inversión irlandesa",
    lede: "Una cuenta nueva para acciones, bonos y fondos, prevista a partir del 1 de julio de 2027. En lugar de CGT o impuesto de salida, pagas un 1% al año sobre lo que valga por encima de {threshold}, y el proveedor se ocupa de Revenue.",
    status: "En el Finance Bill. Todavía no es ley.",
    statusBody:
      "El Finance (No. 2) Bill 2026 se publicó el 19 de octubre de 2026. Se convierte en ley con la Finance Act y después entra en vigor por orden ministerial. Última comprobación: {date}.",
    canOpen: "¿Puedo abrir una?",
    workOut: "Calcula el impuesto",
    rulesTitle: "Las reglas, en resumen",
    rules: [
      {
        term: "Aportaciones",
        def: "Hasta {limit} al año, solo en dinero. No hay mínimo, y sacar dinero no te devuelve nada del límite de ese año.",
      },
      {
        term: "El impuesto",
        def: "Un 1% al año sobre el valor medio de la cuenta por encima de {threshold}. Por debajo, nada. Dentro de la cuenta no hay CGT, retención sobre dividendos, impuesto de salida ni transmisión ficticia a los 8 años, y no se debe nada al sacar dinero.",
      },
      {
        term: "La media",
        def: "La cuenta se valora al cierre de cada día que está abierta, y el impuesto usa la media de esos valores del año.",
      },
      {
        term: "Trámites",
        def: "Ninguno para ti. El proveedor calcula el impuesto, lo paga a Revenue desde la cuenta y te envía un extracto anual.",
      },
    ],
    howTitle: "Cómo se calcula el impuesto",
    formula: "(valor medio − {threshold}) × 1%",
    speech:
      "El {speech} usó una cuenta con un valor medio de {avg}: eso son {over} por encima del umbral, así que el impuesto es {tax}. Algunos casos más:",
    speechLink: "discurso del Presupuesto",
    cases: [
      "Aportar los {limit} completos durante cuatro años da {four} antes del crecimiento, todavía por debajo del umbral, así que aún no hay impuesto.",
      "Una cuenta que perdió dinero durante el año pero aun así tuvo un valor medio de {avg} debe {tax}. El impuesto sigue al valor, no al beneficio.",
      "El dinero aportado el 1 de diciembre está en la cuenta 31 de los 365 días del año, así que solo cuenta aproximadamente una doceava parte para la media de ese año.",
    ],
    partYear:
      "La media cubre solo los días en que la cuenta estuvo abierta. Si la cierras a mitad de año, esa parte del año tributa al cerrarla.",
    whoTitle: "Quién puede abrirla",
    whoBody:
      "Cualquier persona de {age} años o más que sea residente fiscal en Irlanda y tenga número PPS. Tienes una sola cuenta, a tu nombre. Si la cierras durante un año, no puedes abrir otra hasta el año siguiente. Los proveedores lo comprueban todo cuando la solicitas.",
    whatTitle: "Qué puede contener",
    allowedTitle: "Permitido",
    allowed: [
      "Acciones negociadas en un mercado regulado del EEE, o en un mercado equivalente de otro lugar",
      "Bonos negociados de la misma forma",
      "Fondos UCITS, que incluyen la mayoría de los ETF que se venden en Europa",
      "Productos de inversión basados en seguros",
    ],
    notAllowedTitle: "No permitido",
    notAllowed: [
      "Todo lo demás, como criptoactivos y derivados",
      "Fondos que no son UCITS, como los ETF domiciliados en EE. UU., y los UCITS estructurados",
      "Fondos de cartera personal y pólizas de vida de cartera personal",
      "Acciones de un plan de acciones para empleados",
      "Efectivo como ahorro: solo puede estar ahí mientras espera a invertirse, y no genera intereses",
    ],
    calcTitle: "Calculadora",
    calcIntro:
      "Elige cuándo la abres, cuánto aportas y una tasa de crecimiento. Valora la cuenta cada día que está abierta, calcula la media de esos valores y toma el 1% de lo que supere {threshold}, como establece el Finance Bill.",
    notFitTitle: "Cuándo puede no convenirte",
    notFit: [
      "Dinero que podrías necesitar en los próximos años. Las inversiones pueden bajar justo cuando las necesitas, así que un fondo de emergencia va primero en una cuenta de depósito, y la inversión suele convenir para objetivos a cinco años o más.",
      "Rentabilidades esperadas bajas. El 1% se cobra sobre el valor, no sobre el beneficio: con un valor medio de {avg}, el impuesto es {tax} tanto si la cuenta creció {grew} ese año como si no creció nada.",
      "Margen de pensión sin usar. Las aportaciones a pensiones tienen deducción en el impuesto sobre la renta, dentro de límites según la edad, y esta cuenta no tiene ninguna al aportar. Eso sí, el dinero de la pensión queda bloqueado hasta la jubilación, y esta cuenta se puede vaciar en cualquier momento.",
    ],
    openTitle: "Aún sin decidir",
    openIntro: "El proyecto de ley responde a la mayoría de las preguntas, pero no a estas, y el propio proyecto aún puede cambiar.",
    openQs: [
      {
        q: "¿Cuándo se abrirán las cuentas?",
        said: "El proyecto permite cuentas desde el 1 de enero de 2027, con el inicio fijado por orden ministerial. El Gobierno dice que los proveedores empezarán a ofrecerlas a partir del 1 de julio de 2027.",
      },
      {
        q: "¿Contará como ahorro para las prestaciones sociales sujetas a prueba de recursos?",
        said: "El Finance Bill no lo trata y todavía no se ha dicho nada.",
      },
      {
        q: "¿Cuánto costará?",
        said: "No hay límite de comisiones. Fuentes del sector esperan alrededor de un 0,5% al año en total sin asesoramiento y hasta un 1,5% con él. Ningún proveedor ha publicado precios.",
      },
      {
        q: "¿Cómo se valorarán las inversiones cada día?",
        said: "Revenue fijará en un reglamento las fuentes de precios y las reglas de divisas.",
      },
      {
        q: "¿Se permitirán cuentas para menores?",
        said: "No al principio. El ministro dice que se estudiarán en futuros Finance Bills.",
      },
      {
        q: "¿Cambiará el proyecto de ley?",
        said: "Pasó a la Select Committee tras el debate de Second Stage en el Dáil el 20 de octubre y se puede enmendar en las fases de Committee y Report.",
      },
    ],
    timelineTitle: "En qué punto está",
    timeline: [
      { what: "El ministro anuncia planes para un régimen de ahorro e inversión" },
      { what: "El Savings and Investment Forum fija los principios" },
      { what: "La Retail Investment Roadmap presenta el diseño" },
      { what: "El Presupuesto 2027 fija {limit}, {threshold} y el 1%" },
      { what: "Se publica el Finance (No. 2) Bill con las reglas legales de la cuenta" },
      { what: "Debate de Second Stage en el Dáil; el proyecto pasa a la Select Committee" },
      { what: "Fases de Committee y Report (previstas)" },
      { what: "La Finance Act se convierte en ley (previsto)" },
      { what: "Una orden ministerial pone en marcha las reglas de la cuenta" },
      { what: "Los proveedores empiezan a ofrecer cuentas (plan del Gobierno; el proyecto permite el 1 de enero de 2027)" },
    ],
    afterAct: "Tras la Finance Act",
    providersTitle: "Quién puede ofrecerla",
    providersBody:
      "Solo empresas reguladas: empresas de inversión y brókers autorizados bajo MiFID, bancos con permisos de inversión, gestoras de fondos y aseguradoras para los productos basados en seguros. Las empresas de otros países del EEE también pueden ofrecerla, siempre que gestionen por ti el impuesto irlandés. Cada proveedor debe registrarse en Revenue, que publicará la lista. Las credit unions quieren participar, pero no están entre los tipos que nombra el proyecto.",
    noBrands: "No nombramos marcas. Ninguna ha publicado precios todavía, y una lista se leería como una recomendación.",
    faqTitle: "Preguntas",
    faqs: [
      {
        q: "¿Está garantizado mi dinero?",
        a: "No. La cuenta es un tratamiento fiscal, no un producto de ahorro del Estado. Contiene acciones, bonos y fondos, que pueden bajar, y podrías recuperar menos de lo que pusiste. El 1% puede deberse incluso en un año en que la cuenta pierde dinero, si su valor medio supera {threshold}.",
      },
      {
        q: "¿Puedo sacar dinero?",
        a: "Sí, en cualquier momento, sin permanencia ni impuesto al retirar. El dinero que sacas no libera nada de los {limit} de ese año: el límite cuenta todo lo aportado.",
      },
      {
        q: "¿Puedo pasar a la cuenta acciones o ETF que ya tengo?",
        a: "No. Solo se puede aportar dinero, así que tendrías que venderlos primero, lo que puede ser una transmisión sujeta a impuesto fuera de la cuenta.",
      },
      {
        q: "¿Y si aporto más de {limit} en un año?",
        a: "El exceso paga un 1% al mes hasta que lo saques, incluso en años posteriores, y el proveedor se expone a una sanción, así que es probable que los proveedores no te dejen pasarte.",
      },
      {
        q: "¿Puede compartirla una pareja?",
        a: "No, no se permiten cuentas conjuntas. Cada adulto puede tener la suya, así que una pareja tiene {double} de margen libre de impuestos entre los dos.",
      },
      {
        q: "¿Y si me mudo al extranjero?",
        a: "Avisa a tu proveedor. La cuenta sigue abierta, pero no puedes aportar ni trasladarla a otro proveedor mientras no seas residente.",
      },
      {
        q: "¿Qué pasa cuando alguien fallece?",
        a: "Sus representantes legales se hacen cargo de ella. No se puede aportar nada más, y las inversiones deben venderse en el plazo de un año desde la concesión de la sucesión (probate o administration), o antes del tercer aniversario del fallecimiento, lo que ocurra primero. Lo que no se haya vendido para entonces se trata como vendido a valor de mercado.",
      },
      {
        q: "¿Es lo mismo que una ISA del Reino Unido?",
        a: "No. Se parece más a la ISK de Suecia: un pequeño impuesto anual sobre el valor, en lugar de un envoltorio totalmente libre de impuestos con un límite mayor.",
      },
    ],
    seeAlso: "Ver también",
    related: [
      { label: "Planificador de inversiones", body: "compara 32 opciones irlandesas por rentabilidad después de impuestos" },
      { label: "Calculadora de CGT", body: "el impuesto al vender acciones fuera de la cuenta, al 31%" },
      { label: "Presupuesto 2027", body: "los demás cambios" },
      { label: "Cómo tributan el ahorro y las inversiones", body: "la guía más larga, en inglés" },
    ],
    ccpc: { label: "CCPC Investment Readiness Tool", body: "una comprobación breve de si estás preparado para invertir (en inglés)" },
    sourcesTitle: "Fuentes",
    disclaimer:
      "Solo información general, no asesoramiento financiero, fiscal ni jurídico. Las reglas son las del Finance (No. 2) Bill 2026, publicado el 19 de octubre de 2026, y pueden cambiar antes de que sea ley. La cuenta no tiene garantía del Estado: las inversiones pueden bajar además de subir.",
    calc: {
      opens: "La cuenta se abre el",
      first: "Aportación al abrirla",
      monthly: "Cada mes",
      monthlyHint: "El día 1, desde el mes en que se abre.",
      yearly: "Extra cada enero",
      yearlyHint: "Desde el segundo año.",
      until: "Mantenerla hasta el 31 de diciembre del año",
      growth: "Crecimiento anual (tu supuesto)",
      growthHint:
        "No es una previsión. Crecimiento de las inversiones después de sus propias comisiones de fondo. Las rentabilidades reales suben y bajan, y pueden ser negativas.",
      fee: "Comisión anual del proveedor",
      feeHint: "Ningún proveedor ha publicado precios. Fuentes del sector esperan alrededor de un 0,5% sin asesoramiento y hasta un 1,5% con él.",
      paid: "Aportas",
      growthTile: "Crecimiento",
      growthAfterFees: "Crecimiento, tras comisiones",
      taxTile: "Impuesto del 1%, todos los años",
      valueOn: "Valor el 31 de diciembre de {year}",
      noTax: "El valor medio nunca supera {threshold} en un año, así que no se debe impuesto.",
      firstTax: "El 1% se aplica por primera vez en {year}, el primer año en que el valor medio supera {threshold}.",
      share: "En todo el periodo, el impuesto equivale al {share} del crecimiento.",
      noWithdrawalTax: "Sacar dinero no tributa.",
      refused:
        "{refused} de lo que pensabas aportar supera el límite de {limit} de su año natural, así que se deja fuera. Se espera que los proveedores lo rechacen: el dinero por encima del límite paga un 1% al mes hasta que se saca.",
      cols: {
        year: "Año",
        days: "Días abierta",
        paidIn: "Aportado",
        growth: "Crecimiento",
        average: "Valor medio",
        tax: "Impuesto del 1%",
        end: "Valor a 31 dic.",
      },
      how: "Cómo se calcula",
      howItems: [
        "La cuenta se valora al cierre de cada día natural que está abierta, fines de semana incluidos. El valor medio es la suma de esos valores diarios dividida entre el número de días (sección 747Q(5)).",
        "Impuesto del año: (valor medio − {threshold}) × 1%, cero si eso es negativo (747Q(4) y (7)). En el año de apertura, la media cubre solo los días en que estuvo abierta, y los {threshold} no se reducen.",
        "Aquí el impuesto se toma de la cuenta el 31 de diciembre. La ley permite al proveedor tomarlo de la cuenta o de otra forma que acordéis, y pagarlo a Revenue antes del 14 de abril (747Q(6), 747T).",
        "Se aportan como máximo {limit} cada año natural, se saque lo que se saque (747H, 747L). Las aportaciones se hacen el día 1 del mes.",
        "El crecimiento y la comisión del proveedor se reparten por igual entre los días, así que un año completo crece exactamente la tasa que elegiste, menos la comisión. El crecimiento se muestra después de comisiones y antes de este impuesto.",
        "Nada más tributa: ni impuesto de salida, ni CGT, ni retención sobre dividendos, ni transmisión ficticia dentro de la cuenta, y nada al sacar dinero (747P, Finance Bill s.27).",
      ],
      source: "Fuente:",
      sourceLink: "Finance (No. 2) Bill 2026, sección 26, nueva Part 27A",
      illustration:
        "Solo es una ilustración, no asesoramiento. Supone una rentabilidad constante cada año; las rentabilidades reales varían y pueden ser negativas. Las reglas son las del Finance (No. 2) Bill 2026 y pueden cambiar antes de que sea ley.",
    },
  },

  pt: {
    meta: {
      title: "Conta de investimento irlandesa: como funciona o imposto de 1%",
      description:
        "A conta de investimento anunciada no Orçamento 2027 para 1 de julho de 2027, no Finance Bill e ainda não é lei: quem pode abrir, o que pode ter dentro, como funciona o imposto de 1% sobre o valor acima de {threshold}, com uma calculadora que segue o Finance Bill dia a dia.",
    },
    home: "Início",
    crumb: "Conta de investimento",
    title: "Conta de investimento irlandesa",
    lede: "Uma conta nova para ações, títulos e fundos, prevista a partir de 1 de julho de 2027. Em vez de CGT ou imposto de saída, você paga 1% ao ano sobre o que ela valer acima de {threshold}, e o provedor trata com a Revenue.",
    status: "No Finance Bill. Ainda não é lei.",
    statusBody:
      "O Finance (No. 2) Bill 2026 foi publicado em 19 de outubro de 2026. Torna-se lei com a Finance Act e depois entra em vigor por ordem ministerial. Última verificação: {date}.",
    canOpen: "Posso abrir uma?",
    workOut: "Calcule o imposto",
    rulesTitle: "As regras, em resumo",
    rules: [
      {
        term: "Aportes",
        def: "Até {limit} por ano, só em dinheiro. Não há mínimo, e retirar dinheiro não devolve nada do limite daquele ano.",
      },
      {
        term: "O imposto",
        def: "1% ao ano sobre o valor médio da conta acima de {threshold}. Abaixo disso, nada. Dentro da conta não há CGT, retenção sobre dividendos, imposto de saída nem alienação presumida a cada 8 anos, e nada é devido ao retirar dinheiro.",
      },
      {
        term: "A média",
        def: "A conta é avaliada no fecho de cada dia em que está aberta, e o imposto usa a média desses valores no ano.",
      },
      {
        term: "Burocracia",
        def: "Nenhuma para você. O provedor calcula o imposto, paga-o à Revenue a partir da conta e envia-lhe um extrato anual.",
      },
    ],
    howTitle: "Como o imposto é calculado",
    formula: "(valor médio − {threshold}) × 1%",
    speech:
      "O {speech} usou uma conta com valor médio de {avg}: são {over} acima do limite de isenção, então o imposto é {tax}. Mais alguns casos:",
    speechLink: "discurso do Orçamento",
    cases: [
      "Aportar os {limit} completos durante quatro anos dá {four} antes do crescimento, ainda abaixo do limite de isenção, então ainda não há imposto.",
      "Uma conta que perdeu dinheiro no ano mas ainda teve valor médio de {avg} deve {tax}. O imposto segue o valor, não o lucro.",
      "O dinheiro aportado em 1 de dezembro fica na conta 31 dos 365 dias do ano, então só cerca de um doze avos dele conta para a média daquele ano.",
    ],
    partYear:
      "A média cobre só os dias em que a conta esteve aberta. Se a fechar a meio do ano, essa parte do ano é tributada quando ela fecha.",
    whoTitle: "Quem pode abrir",
    whoBody:
      "Qualquer pessoa com {age} anos ou mais que seja residente fiscal na Irlanda e tenha número PPS. Você tem uma única conta, em seu nome. Se a fechar durante um ano, não pode abrir outra até o ano seguinte. Os provedores verificam tudo isto quando você se candidata.",
    whatTitle: "O que pode ter dentro",
    allowedTitle: "Permitido",
    allowed: [
      "Ações negociadas num mercado regulamentado do EEE, ou num mercado equivalente noutro lugar",
      "Títulos negociados da mesma forma",
      "Fundos UCITS, o que inclui a maioria dos ETFs vendidos na Europa",
      "Produtos de investimento baseados em seguros",
    ],
    notAllowedTitle: "Não permitido",
    notAllowed: [
      "Tudo o resto, como criptoativos e derivativos",
      "Fundos que não são UCITS, como ETFs domiciliados nos EUA, e UCITS estruturados",
      "Fundos de carteira pessoal e apólices de vida de carteira pessoal",
      "Ações de um plano de ações para funcionários",
      "Dinheiro como poupança: só pode ficar lá enquanto espera para ser investido, e não rende juros",
    ],
    calcTitle: "Calculadora",
    calcIntro:
      "Escolha quando a abre, quanto aporta e uma taxa de crescimento. Ela avalia a conta em cada dia em que está aberta, calcula a média desses valores e tira 1% do que passar de {threshold}, como define o Finance Bill.",
    notFitTitle: "Quando pode não ser para você",
    notFit: [
      "Dinheiro de que pode precisar nos próximos anos. Os investimentos podem cair justamente quando precisa deles, por isso um fundo de emergência vai primeiro para uma conta de depósito, e investir costuma servir para objetivos a cinco anos ou mais.",
      "Retornos esperados baixos. O 1% é cobrado sobre o valor, não sobre o lucro: com um valor médio de {avg}, o imposto é {tax} quer a conta tenha crescido {grew} naquele ano, quer não tenha crescido nada.",
      "Margem de previdência por usar. As contribuições para a previdência têm alívio no imposto de renda, dentro de limites por idade, e esta conta não tem nenhum na entrada. Por outro lado, o dinheiro da previdência fica preso até a reforma, e esta conta pode ser esvaziada a qualquer momento.",
    ],
    openTitle: "Ainda por decidir",
    openIntro: "O projeto de lei responde à maioria das perguntas, mas não a estas, e o próprio projeto ainda pode mudar.",
    openQs: [
      {
        q: "Quando as contas vão abrir?",
        said: "O projeto permite contas a partir de 1 de janeiro de 2027, com o início fixado por ordem ministerial. O Governo diz que os provedores começarão a oferecê-las a partir de 1 de julho de 2027.",
      },
      {
        q: "Vai contar como poupança para os benefícios sociais sujeitos a prova de rendimentos?",
        said: "O Finance Bill não trata disso e nada foi dito ainda.",
      },
      {
        q: "Quanto vai custar?",
        said: "Não há teto para as comissões. Fontes do setor esperam cerca de 0,5% ao ano no total sem aconselhamento e até 1,5% com ele. Nenhum provedor publicou preços.",
      },
      {
        q: "Como os investimentos serão avaliados todos os dias?",
        said: "A Revenue vai fixar em regulamento as fontes de preços e as regras de câmbio.",
      },
      {
        q: "Serão permitidas contas para crianças?",
        said: "Não no lançamento. O ministro diz que serão consideradas em futuros Finance Bills.",
      },
      {
        q: "O projeto de lei vai mudar?",
        said: "Seguiu para a Select Committee depois do debate de Second Stage no Dáil em 20 de outubro e pode ser alterado nas fases de Committee e Report.",
      },
    ],
    timelineTitle: "Em que ponto está",
    timeline: [
      { what: "O ministro anuncia planos para um regime de poupança e investimento" },
      { what: "O Savings and Investment Forum define os princípios" },
      { what: "O Retail Investment Roadmap apresenta o desenho" },
      { what: "O Orçamento 2027 fixa {limit}, {threshold} e 1%" },
      { what: "Publicado o Finance (No. 2) Bill com as regras legais da conta" },
      { what: "Debate de Second Stage no Dáil; o projeto segue para a Select Committee" },
      { what: "Fases de Committee e Report (previstas)" },
      { what: "A Finance Act torna-se lei (previsto)" },
      { what: "Uma ordem ministerial põe em vigor as regras da conta" },
      { what: "Os provedores começam a oferecer contas (plano do Governo; o projeto permite 1 de janeiro de 2027)" },
    ],
    afterAct: "Depois da Finance Act",
    providersTitle: "Quem pode oferecer",
    providersBody:
      "Só empresas regulamentadas: empresas de investimento e corretoras autorizadas ao abrigo da MiFID, bancos com autorização para investimentos, gestoras de fundos e seguradoras para os produtos baseados em seguros. Empresas de outros países do EEE também podem oferecer, desde que tratem do imposto irlandês por você. Cada provedor tem de se registar na Revenue, que vai publicar a lista. As credit unions querem participar, mas não estão entre os tipos nomeados no projeto.",
    noBrands: "Não nomeamos marcas. Nenhuma publicou preços ainda, e uma lista seria lida como uma recomendação.",
    faqTitle: "Perguntas",
    faqs: [
      {
        q: "O meu dinheiro está garantido?",
        a: "Não. A conta é um tratamento fiscal, não um produto de poupança do Estado. Tem ações, títulos e fundos, que podem cair, e você pode receber menos do que pôs. O 1% pode ser devido mesmo num ano em que a conta perde dinheiro, se o valor médio estiver acima de {threshold}.",
      },
      {
        q: "Posso retirar dinheiro?",
        a: "Sim, a qualquer momento, sem prazo mínimo e sem imposto na retirada. O dinheiro retirado não liberta nada dos {limit} daquele ano: o limite conta tudo o que foi aportado.",
      },
      {
        q: "Posso passar para a conta ações ou ETFs que já tenho?",
        a: "Não. Só se pode aportar dinheiro, por isso teria de os vender primeiro, o que pode ser uma alienação tributável fora da conta.",
      },
      {
        q: "E se eu aportar mais de {limit} num ano?",
        a: "O excesso paga 1% ao mês até ser retirado, mesmo em anos seguintes, e o provedor sofre uma penalização, por isso é provável que os provedores não deixem passar do limite.",
      },
      {
        q: "Um casal pode partilhar uma?",
        a: "Não, contas conjuntas não são permitidas. Cada adulto pode ter a sua, então um casal tem {double} de margem isenta de imposto entre os dois.",
      },
      {
        q: "E se eu me mudar para o estrangeiro?",
        a: "Avise o seu provedor. A conta continua aberta, mas não pode aportar nem transferi-la para outro provedor enquanto não for residente.",
      },
      {
        q: "O que acontece quando alguém morre?",
        a: "Os seus representantes legais assumem a conta. Não se pode aportar mais nada, e os investimentos têm de ser vendidos no prazo de um ano após a concessão da sucessão (probate ou administration), ou até o terceiro aniversário da morte, o que ocorrer primeiro. O que não tiver sido vendido até lá é tratado como vendido a valor de mercado.",
      },
      {
        q: "É o mesmo que uma ISA do Reino Unido?",
        a: "Não. É mais parecida com a ISK da Suécia: um pequeno imposto anual sobre o valor, em vez de uma estrutura totalmente isenta de impostos com um limite maior.",
      },
    ],
    seeAlso: "Veja também",
    related: [
      { label: "Planejador de investimentos", body: "compare 32 opções irlandesas pelo retorno depois de impostos" },
      { label: "Calculadora de CGT", body: "o imposto ao vender ações fora da conta, a 31%" },
      { label: "Orçamento 2027", body: "as outras mudanças" },
      { label: "Como a poupança e os investimentos são tributados", body: "o guia mais longo, em inglês" },
    ],
    ccpc: { label: "CCPC Investment Readiness Tool", body: "uma verificação rápida de se está pronto para investir (em inglês)" },
    sourcesTitle: "Fontes",
    disclaimer:
      "Apenas informação geral, não aconselhamento financeiro, fiscal ou jurídico. As regras são as do Finance (No. 2) Bill 2026, publicado em 19 de outubro de 2026, e podem mudar antes de se tornar lei. A conta não tem garantia do Estado: os investimentos podem cair, além de subir.",
    calc: {
      opens: "A conta abre em",
      first: "Aporte na abertura",
      monthly: "Todo mês",
      monthlyHint: "No dia 1, a partir do mês em que abre.",
      yearly: "Extra todo janeiro",
      yearlyHint: "A partir do segundo ano.",
      until: "Manter até 31 de dezembro do ano",
      growth: "Crescimento anual (a sua hipótese)",
      growthHint:
        "Não é uma previsão. Crescimento dos investimentos depois das comissões dos próprios fundos. Os retornos reais sobem e descem, e podem ser negativos.",
      fee: "Comissão anual do provedor",
      feeHint: "Nenhum provedor publicou preços. Fontes do setor esperam cerca de 0,5% sem aconselhamento e até 1,5% com ele.",
      paid: "Você aporta",
      growthTile: "Crescimento",
      growthAfterFees: "Crescimento, após comissões",
      taxTile: "Imposto de 1%, todos os anos",
      valueOn: "Valor em 31 de dezembro de {year}",
      noTax: "O valor médio nunca passa de {threshold} num ano, então não há imposto a pagar.",
      firstTax: "O 1% aplica-se pela primeira vez em {year}, o primeiro ano em que o valor médio passa de {threshold}.",
      share: "No período todo, o imposto equivale a {share} do crescimento.",
      noWithdrawalTax: "Retirar dinheiro não é tributado.",
      refused:
        "{refused} do que planejava aportar passa do limite de {limit} do seu ano civil, por isso fica de fora. Espera-se que os provedores o recusem: o dinheiro acima do limite paga 1% ao mês até ser retirado.",
      cols: {
        year: "Ano",
        days: "Dias aberta",
        paidIn: "Aportado",
        growth: "Crescimento",
        average: "Valor médio",
        tax: "Imposto de 1%",
        end: "Valor em 31 dez.",
      },
      how: "Como é calculado",
      howItems: [
        "A conta é avaliada no fecho de cada dia de calendário em que está aberta, fins de semana incluídos. O valor médio é a soma desses valores diários dividida pelo número de dias (secção 747Q(5)).",
        "Imposto do ano: (valor médio − {threshold}) × 1%, zero se der negativo (747Q(4) e (7)). No ano de abertura, a média cobre só os dias em que esteve aberta, e os {threshold} não são reduzidos.",
        "Aqui o imposto é tirado da conta em 31 de dezembro. A lei deixa o provedor tirá-lo da conta ou de outra forma que combinem, e pagá-lo à Revenue até 14 de abril (747Q(6), 747T).",
        "No máximo {limit} são aportados em cada ano civil, seja o que for retirado (747H, 747L). Os aportes são feitos no dia 1 do mês.",
        "O crescimento e a comissão do provedor são distribuídos por igual pelos dias, então um ano completo cresce exatamente a taxa que escolheu, menos a comissão. O crescimento é mostrado depois das comissões e antes deste imposto.",
        "Nada mais é tributado: nem imposto de saída, nem CGT, nem retenção sobre dividendos, nem alienação presumida dentro da conta, e nada ao retirar dinheiro (747P, Finance Bill s.27).",
      ],
      source: "Fonte:",
      sourceLink: "Finance (No. 2) Bill 2026, secção 26, nova Part 27A",
      illustration:
        "Apenas uma ilustração, não aconselhamento. Supõe um retorno constante todos os anos; os retornos reais variam e podem ser negativos. As regras são as do Finance (No. 2) Bill 2026 e podem mudar antes de se tornar lei.",
    },
  },

  ga: {
    meta: {
      title: "Cuntas Infheistíochta na hÉireann: conas a oibríonn an cháin 1%",
      description:
        "An Cuntas Infheistíochta a fógraíodh i mBuiséad 2027 do 1 Iúil 2027, sa Bhille Airgeadais agus nach dlí fós é: cé a fhéadfaidh ceann a oscailt, cad is féidir a chur ann, conas a oibríonn an cháin 1% ar luach os cionn {threshold}, le háireamhán a leanann an Bille Airgeadais lá ar lá.",
    },
    home: "Baile",
    crumb: "Cuntas Infheistíochta",
    title: "Cuntas Infheistíochta na hÉireann",
    lede: "Cuntas nua do scaireanna, bannaí agus cistí, le teacht ó 1 Iúil 2027. In ionad CGT nó cáin imeachta, íocann tú 1% sa bhliain ar a luach os cionn {threshold}, agus déileálann an soláthraí le Revenue.",
    status: "Sa Bhille Airgeadais. Ní dlí fós é.",
    statusBody:
      "Foilsíodh Finance (No. 2) Bill 2026 ar 19 Deireadh Fómhair 2026. Beidh sé ina dhlí leis an Acht Airgeadais, agus ansin tosóidh sé le hordú aire. Seiceáilte go deireanach {date}.",
    canOpen: "An féidir liom ceann a oscailt?",
    workOut: "Oibrigh amach an cháin",
    rulesTitle: "Na rialacha go hachomair",
    rules: [
      {
        term: "Íocaíochtaí isteach",
        def: "Suas le {limit} sa bhliain, in airgead amháin. Níl aon íosmhéid ann, agus ní thugann airgead a bhaint amach aon chuid de theorainn na bliana sin ar ais duit.",
      },
      {
        term: "An cháin",
        def: "1% sa bhliain ar mheánluach an chuntais os cionn {threshold}. Faoi bhun sin, dada. Taobh istigh den chuntas níl aon CGT, cáin choinneála ar dhíbhinní, cáin imeachta ná diúscairt mheasta 8 mbliana, agus níl aon rud dlite nuair a bhaineann tú airgead amach.",
      },
      {
        term: "An meán",
        def: "Luacháiltear an cuntas ag deireadh gach lae a bhíonn sé oscailte, agus úsáideann an cháin meán na luachanna sin don bhliain.",
      },
      {
        term: "Páipéarachas",
        def: "Dada duitse. Oibríonn an soláthraí amach an cháin, íocann sé le Revenue í ón gcuntas agus seolann sé ráiteas bliantúil chugat.",
      },
    ],
    howTitle: "Conas a oibrítear amach an cháin",
    formula: "(meánluach − {threshold}) × 1%",
    speech:
      "D’úsáid an {speech} cuntas ar mheánluach {avg}: is é sin {over} os cionn na tairsí, mar sin is é {tax} an cháin. Cúpla cás eile:",
    speechLink: "óráid Buiséid",
    cases: [
      "Má íoctar an {limit} iomlán isteach ar feadh ceithre bliana, tugann sé sin {four} roimh fhás, fós faoi bhun na tairsí, mar sin níl aon cháin fós.",
      "Cuntas a chaill airgead i rith na bliana ach a raibh meánluach {avg} aige fós, tá {tax} dlite air. Leanann an cháin an luach, ní an brabús.",
      "Bíonn airgead a íoctar isteach ar 1 Nollaig ann ar feadh 31 de 365 lá na bliana, mar sin ní áirítear ach thart ar an dara cuid déag de i meán na bliana sin.",
    ],
    partYear:
      "Ní chlúdaíonn an meán ach na laethanta a raibh an cuntas oscailte. Má dhúnann tú é i lár na bliana, gearrtar cáin ar an gcuid sin den bhliain nuair a dhúntar é.",
    whoTitle: "Cé a fhéadfaidh ceann a oscailt",
    whoBody:
      "Aon duine {age} bliain d’aois nó níos sine atá cónaitheach in Éirinn chun críocha cánach agus a bhfuil uimhir PSP aige nó aici. Faigheann tú cuntas amháin, i d’ainm féin. Má dhúnann tú é i rith bliana, ní féidir leat ceann eile a oscailt go dtí an bhliain dar gcionn. Seiceálann soláthraithe é seo go léir nuair a dhéanann tú iarratas.",
    whatTitle: "Cad is féidir a chur ann",
    allowedTitle: "Ceadaithe",
    allowed: [
      "Scaireanna a thrádáiltear ar mhargadh rialáilte sa LEE, nó ar mhargadh coibhéiseach in áit eile",
      "Bannaí a thrádáiltear ar an mbealach céanna",
      "Cistí UCITS, a chlúdaíonn formhór na ETFanna a dhíoltar san Eoraip",
      "Táirgí infheistíochta bunaithe ar árachas",
    ],
    notAllowedTitle: "Gan cead",
    notAllowed: [
      "Aon rud eile, ar nós sócmhainní cripte agus díorthach",
      "Cistí nach UCITS iad, ar nós ETFanna sainchónaithe sna Stáit Aontaithe, agus UCITS struchtúrtha",
      "Cistí punainne pearsanta agus polasaithe saoil punainne pearsanta",
      "Scaireanna ó scéim scaireanna fostaithe",
      "Airgead tirim mar choigilteas: ní féidir leis fanacht ann ach fad is atá sé ag fanacht le hinfheistiú, agus ní thuilleann sé ús",
    ],
    calcTitle: "Áireamhán",
    calcIntro:
      "Roghnaigh cathain a osclaíonn tú é, cad a íocann tú isteach agus ráta fáis. Luacháileann sé an cuntas gach lá a bhíonn sé oscailte, faigheann sé meán na luachanna sin agus tógann sé 1% d’aon rud os cionn {threshold}, mar a leagann an Bille Airgeadais amach.",
    notFitTitle: "Nuair nach n-oirfeadh sé duit",
    notFit: [
      "Airgead a d’fhéadfadh a bheith de dhíth ort sna blianta beaga amach romhainn. Is féidir le hinfheistíochtaí titim díreach nuair a bhíonn siad uait, mar sin is i gcuntas taisce is fearr ciste éigeandála ar dtús, agus is gnách go n-oireann infheistíocht do spriocanna cúig bliana nó níos faide uainn.",
      "Torthaí ionchais ísle. Gearrtar an 1% ar luach, ní ar bhrabús: ar mheánluach {avg} is é {tax} an cháin cibé ar fhás an cuntas {grew} an bhliain sin nó nár fhás sé ar chor ar bith.",
      "Spás pinsin nár úsáideadh. Faigheann ranníocaíochtaí pinsin faoiseamh ó cháin ioncaim, laistigh de theorainneacha a bhraitheann ar aois, agus ní fhaigheann an cuntas seo aon cheann ag dul isteach. Bíonn airgead pinsin faoi ghlas go dtí an scor, áfach, agus is féidir an cuntas seo a fholmhú am ar bith.",
    ],
    openTitle: "Gan socrú fós",
    openIntro: "Freagraíonn an Bille formhór na gceisteanna, ach ní na cinn seo, agus is féidir leis an mBille féin athrú fós.",
    openQs: [
      {
        q: "Cathain a osclófar cuntais?",
        said: "Ceadaíonn an Bille cuntais ó 1 Eanáir 2027, agus socraítear an tús le hordú aire. Deir an Rialtas go dtosóidh soláthraithe á dtairiscint ó 1 Iúil 2027.",
      },
      {
        q: "An gcomhaireofar é mar choigilteas d’íocaíochtaí leasa shóisialaigh faoi thástáil acmhainne?",
        said: "Ní phléann an Bille Airgeadais é agus níl aon rud ráite fós.",
      },
      {
        q: "Cé mhéad a chosnóidh sé?",
        said: "Níl aon uasteorainn ar tháillí. Tá foinsí sa tionscal ag súil le thart ar 0.5% sa bhliain san iomlán gan chomhairle agus suas le 1.5% le comhairle. Níl praghsanna foilsithe ag aon soláthraí.",
      },
      {
        q: "Conas a luacháilfear infheistíochtaí gach lá?",
        said: "Socróidh Revenue na foinsí praghsanna agus na rialacha airgeadra i rialacháin.",
      },
      {
        q: "An gceadófar cuntais do pháistí?",
        said: "Ní ag an tús. Deir an tAire go ndéanfar iad a mheas i mBillí Airgeadais amach anseo.",
      },
      {
        q: "An athróidh an Bille?",
        said: "Chuaigh sé chuig Roghchoiste tar éis díospóireacht an Dara Céim sa Dáil ar 20 Deireadh Fómhair agus is féidir é a leasú ag Céim an Choiste agus ag Céim na Tuarascála.",
      },
    ],
    timelineTitle: "Cá bhfuil sé anois",
    timeline: [
      { what: "Fógraíonn an tAire pleananna do scéim choigiltis agus infheistíochta" },
      { what: "Leagann an Fóram Coigiltis agus Infheistíochta na prionsabail síos" },
      { what: "Tugann an Treochlár Infheistíochta Miondíola an dearadh" },
      { what: "Socraíonn Buiséad 2027 {limit}, {threshold} agus 1%" },
      { what: "Foilsítear Finance (No. 2) Bill le rialacha dlí an chuntais" },
      { what: "Díospóireacht an Dara Céim sa Dáil; téann an Bille chuig Roghchoiste" },
      { what: "Céim an Choiste agus Céim na Tuarascála (súil leo)" },
      { what: "An tAcht Airgeadais sínithe ina dhlí (súil leis)" },
      { what: "Cuireann ordú aire tús le rialacha an chuntais" },
      { what: "Tosaíonn soláthraithe ag tairiscint cuntas (plean an Rialtais; ceadaíonn an Bille 1 Eanáir 2027)" },
    ],
    afterAct: "Tar éis an Achta",
    providersTitle: "Cé a fhéadfaidh é a thairiscint",
    providersBody:
      "Gnólachtaí rialáilte amháin: gnólachtaí infheistíochta agus bróicéirí atá údaraithe faoi MiFID, bainc a bhfuil ceadanna infheistíochta acu, cuideachtaí bainistíochta cistí, agus árachóirí do tháirgí bunaithe ar árachas. Is féidir le gnólachtaí in áiteanna eile sa LEE é a thairiscint freisin, fad is a reáchtálann siad an cháin Éireannach duit. Caithfidh gach soláthraí clárú le Revenue, a fhoilseoidh an liosta. Ba mhaith le comhar creidmheasa páirt a ghlacadh ach níl siad i measc na gcineálacha a ainmnítear sa Bhille.",
    noBrands: "Ní ainmnímid brandaí. Níl praghsanna foilsithe ag aon cheann acu fós, agus léifí liosta mar mholadh.",
    faqTitle: "Ceisteanna",
    faqs: [
      {
        q: "An bhfuil m’airgead ráthaithe?",
        a: "Níl. Is cóireáil chánach é an cuntas, ní táirge coigiltis Stáit. Coinníonn sé scaireanna, bannaí agus cistí, ar féidir leo titim, agus d’fhéadfá níos lú ná mar a chuir tú isteach a fháil ar ais. Is féidir an 1% a bheith dlite fós i mbliain a gcailleann an cuntas airgead, má tá a mheánluach os cionn {threshold}.",
      },
      {
        q: "An féidir liom airgead a bhaint amach?",
        a: "Is féidir, am ar bith, gan ghlas agus gan cháin ar aistarraingt. Ní scaoileann airgead a bhaintear amach aon chuid de {limit} na bliana sin: áirítear gach rud a íocadh isteach sa teorainn.",
      },
      {
        q: "An féidir liom scaireanna nó ETFanna atá agam cheana a aistriú isteach ann?",
        a: "Ní féidir. Ní féidir ach airgead a íoc isteach, mar sin bheadh ort iad a dhíol ar dtús, rud a d’fhéadfadh a bheith ina dhiúscairt inchánach lasmuigh den chuntas.",
      },
      {
        q: "Cad a tharlóidh má íocaim níos mó ná {limit} isteach i mbliain?",
        a: "Gearrtar 1% sa mhí ar an mbreis go dtí go mbaineann tú amach í, fiú isteach i mblianta níos déanaí, agus gearrtar pionós ar an soláthraí, mar sin is dócha go stopfaidh soláthraithe thú ó dhul thar an teorainn.",
      },
      {
        q: "An féidir le lánúin ceann a roinnt?",
        a: "Ní féidir, ní cheadaítear comhchuntais. Is féidir le gach duine fásta cuntas dá chuid féin a bheith aige, mar sin tá {double} de spás saor ó cháin idir lánúin.",
      },
      {
        q: "Cad a tharlóidh má bhogaim thar lear?",
        a: "Inis do do sholáthraí. Fanann an cuntas oscailte, ach ní féidir leat íoc isteach ann ná é a aistriú chuig soláthraí eile fad is nach bhfuil tú cónaitheach.",
      },
      {
        q: "Cad a tharlaíonn nuair a fhaigheann duine bás?",
        a: "Glacann a n-ionadaithe pearsanta seilbh air. Ní féidir aon rud eile a íoc isteach, agus ní mór na hinfheistíochtaí a dhíol laistigh de bhliain ó dheonú probháide nó riaracháin, nó faoin tríú comóradh ar an mbás, cibé acu is luaithe. Aon rud nach ndíoltar faoin am sin, caitear leis amhail is gur díoladh é ar luach an mhargaidh.",
      },
      {
        q: "An ionann é agus ISA sa Ríocht Aontaithe?",
        a: "Ní hionann. Is cosúla é le ISK na Sualainne: cáin bheag bhliantúil ar an luach, in ionad clúdach atá saor ó cháin go hiomlán le teorainn níos mó.",
      },
    ],
    seeAlso: "Féach freisin",
    related: [
      { label: "Pleanálaí infheistíochta", body: "déan comparáid idir 32 rogha in Éirinn de réir toraidh tar éis cánach" },
      { label: "Áireamhán CGT", body: "cáin ar scaireanna a dhíol lasmuigh den chuntas, ag 31%" },
      { label: "Buiséad 2027", body: "na hathruithe eile" },
      { label: "Conas a ghearrtar cáin ar choigilteas agus infheistíochtaí", body: "an treoir níos faide, i mBéarla" },
    ],
    ccpc: { label: "CCPC Investment Readiness Tool", body: "seiceáil ghearr an bhfuil tú réidh le hinfheistiú (i mBéarla)" },
    sourcesTitle: "Foinsí",
    disclaimer:
      "Faisnéis ghinearálta amháin, ní comhairle airgeadais, chánach ná dlí. Is iad na rialacha atá leagtha amach in Finance (No. 2) Bill 2026, a foilsíodh ar 19 Deireadh Fómhair 2026, agus d’fhéadfaidís athrú sula mbeidh sé ina dhlí. Níl ráthaíocht Stáit ar an gcuntas: is féidir le hinfheistíochtaí titim chomh maith le hardú.",
    calc: {
      opens: "Osclaíonn an cuntas ar",
      first: "Íoctha isteach nuair a osclaítear é",
      monthly: "Gach mí",
      monthlyHint: "Ar an 1ú lá, ón mí a osclaítear é.",
      yearly: "Breis gach Eanáir",
      yearlyHint: "Ón dara bliain ar aghaidh.",
      until: "Coinnigh é go dtí 31 Nollaig na bliana",
      growth: "Fás sa bhliain (do thoimhde)",
      growthHint:
        "Ní réamhaisnéis é. Fás na n-infheistíochtaí tar éis a dtáillí ciste féin. Téann fíorthorthaí suas agus síos, agus is féidir leo a bheith diúltach.",
      fee: "Táille soláthraí sa bhliain",
      feeHint: "Níl praghsanna foilsithe ag aon soláthraí. Tá foinsí sa tionscal ag súil le thart ar 0.5% gan chomhairle, suas le 1.5% le comhairle.",
      paid: "Íocann tú isteach",
      growthTile: "Fás",
      growthAfterFees: "Fás, tar éis táillí",
      taxTile: "Cáin 1%, gach bliain",
      valueOn: "Luach ar 31 Nollaig {year}",
      noTax: "Ní théann an meánluach os cionn {threshold} riamh i mbliain, mar sin níl aon cháin dlite.",
      firstTax: "Baineann an 1% den chéad uair in {year}, an chéad bhliain a théann an meánluach os cionn {threshold}.",
      share: "Thar an tréimhse ar fad, is ionann an cháin agus {share} den fhás.",
      noWithdrawalTax: "Ní ghearrtar cáin ar airgead a bhaint amach.",
      refused:
        "Tá {refused} den mhéid a bhí beartaithe agat a íoc isteach os cionn na teorann {limit} dá bhliain féilire, mar sin fágtar amach é. Táthar ag súil go ndiúltóidh soláthraithe dó: gearrtar 1% sa mhí ar airgead os cionn na teorann go dtí go mbaintear amach é.",
      cols: {
        year: "Bliain",
        days: "Laethanta oscailte",
        paidIn: "Íoctha isteach",
        growth: "Fás",
        average: "Meánluach",
        tax: "Cáin 1%",
        end: "Luach ar 31 Noll",
      },
      how: "Conas a oibrítear amach é",
      howItems: [
        "Luacháiltear an cuntas ag deireadh gach lá féilire a bhíonn sé oscailte, deireadh seachtaine san áireamh. Is é an meánluach suim na luachanna laethúla sin roinnte ar líon na laethanta (alt 747Q(5)).",
        "Cáin na bliana: (meánluach − {threshold}) × 1%, náid má tá sé sin faoi bhun nialais (747Q(4) agus (7)). Sa bhliain a osclaítear é, ní chlúdaíonn an meán ach na laethanta a bhí sé oscailte, agus ní laghdaítear an {threshold}.",
        "Tógtar an cháin ón gcuntas ar 31 Nollaig anseo. Ligeann an dlí don soláthraí í a thógáil ón gcuntas nó ar bhealach eile a aontaíonn sibh, agus í a íoc le Revenue faoin 14 Aibreán (747Q(6), 747T).",
        "Íoctar {limit} ar a mhéad isteach gach bliain féilire, is cuma cad a bhaintear amach (747H, 747L). Déantar íocaíochtaí ar an 1ú lá den mhí.",
        "Scaiptear an fás agus táille an tsoláthraí go cothrom thar na laethanta, mar sin fásann bliain iomlán go díreach de réir an ráta a roghnaigh tú, lúide an táille. Taispeántar an fás tar éis táillí agus roimh an gcáin seo.",
        "Ní ghearrtar cáin ar aon rud eile: gan cháin imeachta, CGT, cáin choinneála ar dhíbhinní ná diúscairt mheasta taobh istigh den chuntas, agus dada nuair a bhaineann tú airgead amach (747P, Finance Bill s.27).",
      ],
      source: "Foinse:",
      sourceLink: "Finance (No. 2) Bill 2026, alt 26, Part 27A nua",
      illustration:
        "Léiriú amháin, ní comhairle. Glacann sé leis go bhfuil toradh seasta amháin gach bliain; athraíonn fíorthorthaí agus is féidir leo a bheith diúltach. Is iad na rialacha atá in Finance (No. 2) Bill 2026, agus d’fhéadfaidís athrú sula mbeidh sé ina dhlí.",
    },
  },

  ar: {
    meta: {
      title: "حساب الاستثمار الأيرلندي: كيف تعمل ضريبة 1%",
      description:
        "حساب الاستثمار المعلن في ميزانية 2027 ليبدأ في 1 يوليو 2027، وهو في مشروع قانون المالية ولم يصبح قانونًا بعد: من يمكنه فتح حساب، وما الذي يمكن وضعه فيه، وكيف تعمل ضريبة 1% على القيمة فوق {threshold}، مع حاسبة تتبع مشروع قانون المالية يومًا بيوم.",
    },
    home: "الرئيسية",
    crumb: "حساب الاستثمار",
    title: "حساب الاستثمار الأيرلندي",
    lede: "حساب جديد للأسهم والسندات والصناديق، متوقع اعتبارًا من 1 يوليو 2027. بدلًا من CGT أو ضريبة الخروج، تدفع 1% سنويًا على قيمته فوق {threshold}، ويتولى المزوّد التعامل مع Revenue.",
    status: "في مشروع قانون المالية. ليس قانونًا بعد.",
    statusBody:
      "نُشر Finance (No. 2) Bill 2026 في 19 أكتوبر 2026. يصبح قانونًا مع قانون المالية، ثم يبدأ العمل به بأمر وزاري. آخر تحقق: {date}.",
    canOpen: "هل يمكنني فتح حساب؟",
    workOut: "احسب الضريبة",
    rulesTitle: "القواعد باختصار",
    rules: [
      {
        term: "الإيداع",
        def: "حتى {limit} سنويًا، نقدًا فقط. لا يوجد حد أدنى، وسحب المال لا يعيد إليك أي جزء من حد تلك السنة.",
      },
      {
        term: "الضريبة",
        def: "‏1% سنويًا على متوسط قيمة الحساب فوق {threshold}. وما دون ذلك، لا شيء. داخل الحساب لا توجد CGT ولا ضريبة استقطاع على الأرباح الموزعة ولا ضريبة خروج ولا تصرف افتراضي كل 8 سنوات، ولا يُستحق شيء عند سحب المال.",
      },
      {
        term: "المتوسط",
        def: "يُقيَّم الحساب عند إغلاق كل يوم يكون فيه مفتوحًا، وتستخدم الضريبة متوسط تلك القيم خلال السنة.",
      },
      {
        term: "الأوراق",
        def: "لا شيء عليك. يحسب المزوّد الضريبة، ويدفعها إلى Revenue من الحساب، ويرسل إليك كشفًا سنويًا.",
      },
    ],
    howTitle: "كيف تُحسب الضريبة",
    formula: "(متوسط القيمة − {threshold}) × 1%",
    speech:
      "استخدم {speech} حسابًا متوسط قيمته {avg}: أي {over} فوق الحد، فتكون الضريبة {tax}. وبعض الحالات الأخرى:",
    speechLink: "خطاب الميزانية",
    cases: [
      "إيداع {limit} كاملة لمدة أربع سنوات يعطي {four} قبل النمو، وهو ما زال تحت الحد، فلا ضريبة بعد.",
      "حساب خسر مالًا خلال السنة لكن متوسط قيمته بقي {avg} تُستحق عليه {tax}. الضريبة تتبع القيمة لا الربح.",
      "المال المودَع في 1 ديسمبر يبقى في الحساب 31 يومًا من أيام السنة الـ365، لذا لا يُحتسب منه في متوسط تلك السنة إلا نحو جزء من اثني عشر.",
    ],
    partYear:
      "يغطي المتوسط الأيام التي كان فيها الحساب مفتوحًا فقط. وإذا أغلقته في منتصف السنة، يُفرض على ذلك الجزء من السنة ضريبة عند الإغلاق.",
    whoTitle: "من يمكنه فتح حساب",
    whoBody:
      "أي شخص عمره {age} عامًا أو أكثر، مقيم في أيرلندا لأغراض الضريبة، ولديه رقم PPS. تحصل على حساب واحد باسمك. وإذا أغلقته خلال سنة، لا يمكنك فتح آخر حتى السنة التالية. يتحقق المزوّدون من كل ذلك عند التقديم.",
    whatTitle: "ما الذي يمكن وضعه فيه",
    allowedTitle: "مسموح",
    allowed: [
      "أسهم متداولة في سوق منظمة في المنطقة الاقتصادية الأوروبية، أو في سوق مماثلة في مكان آخر",
      "سندات متداولة بالطريقة نفسها",
      "صناديق UCITS، وتشمل معظم صناديق ETF التي تُباع في أوروبا",
      "منتجات الاستثمار القائمة على التأمين",
    ],
    notAllowedTitle: "غير مسموح",
    notAllowed: [
      "أي شيء آخر، مثل الأصول المشفرة والمشتقات",
      "الصناديق غير الخاضعة لـ UCITS، مثل صناديق ETF المسجلة في الولايات المتحدة، وصناديق UCITS المهيكلة",
      "صناديق المحافظ الشخصية ووثائق التأمين على الحياة ذات المحافظ الشخصية",
      "أسهم من خطة أسهم للموظفين",
      "النقد كادخار: لا يمكن أن يبقى فيه إلا وهو ينتظر الاستثمار، ولا يدرّ فائدة",
    ],
    calcTitle: "الحاسبة",
    calcIntro:
      "اختر متى تفتحه، وكم تودع، ومعدل نمو. تقيّم الحاسبة الحساب كل يوم يكون فيه مفتوحًا، وتأخذ متوسط تلك القيم، وتأخذ 1% من أي مبلغ فوق {threshold}، كما ينص مشروع قانون المالية.",
    notFitTitle: "متى قد لا يناسبك",
    notFit: [
      "مال قد تحتاجه في السنوات القليلة القادمة. قد تنخفض الاستثمارات تمامًا حين تحتاجها، لذا مكان صندوق الطوارئ أولًا هو حساب ودائع، والاستثمار يناسب عمومًا الأهداف التي تبعد خمس سنوات أو أكثر.",
      "عوائد متوقعة منخفضة. تُفرض نسبة 1% على القيمة لا على الربح: على متوسط {avg} تكون الضريبة {tax} سواء نما الحساب بمقدار {grew} في تلك السنة أم لم ينمُ إطلاقًا.",
      "حيز تقاعدي غير مستخدم. مساهمات التقاعد تحصل على إعفاء من ضريبة الدخل، ضمن حدود تتعلق بالعمر، وهذا الحساب لا يحصل على أي إعفاء عند الإيداع. لكن أموال التقاعد تبقى مقفلة حتى التقاعد، بينما يمكن إفراغ هذا الحساب في أي وقت.",
    ],
    openTitle: "لم يُحسم بعد",
    openIntro: "يجيب مشروع القانون عن معظم الأسئلة، لكن ليس عن هذه، ويمكن أن يتغير مشروع القانون نفسه.",
    openQs: [
      {
        q: "متى ستُفتح الحسابات؟",
        said: "يسمح مشروع القانون بالحسابات من 1 يناير 2027، ويُحدَّد البدء بأمر وزاري. وتقول الحكومة إن المزوّدين سيبدؤون تقديمها اعتبارًا من 1 يوليو 2027.",
      },
      {
        q: "هل سيُحتسب ادخارًا في مدفوعات الرعاية الاجتماعية الخاضعة لاختبار الدخل؟",
        said: "لا يتناول مشروع قانون المالية ذلك، ولم يُقل شيء بعد.",
      },
      {
        q: "كم سيكلّف؟",
        said: "لا يوجد سقف للرسوم. تتوقع مصادر في القطاع نحو 0.5% سنويًا إجمالًا دون مشورة وحتى 1.5% معها. لم ينشر أي مزوّد أسعارًا.",
      },
      {
        q: "كيف ستُقيَّم الاستثمارات كل يوم؟",
        said: "ستحدد Revenue مصادر الأسعار وقواعد العملات في لوائح.",
      },
      {
        q: "هل ستُسمح حسابات للأطفال؟",
        said: "ليس عند الإطلاق. ويقول الوزير إنها ستُدرس في مشاريع قوانين مالية مستقبلية.",
      },
      {
        q: "هل سيتغير مشروع القانون؟",
        said: "أُحيل إلى لجنة مختارة بعد نقاش المرحلة الثانية في الـDáil في 20 أكتوبر، ويمكن تعديله في مرحلتي اللجنة والتقرير.",
      },
    ],
    timelineTitle: "أين وصل",
    timeline: [
      { what: "الوزير يعلن خططًا لبرنامج ادخار واستثمار" },
      { what: "منتدى الادخار والاستثمار يضع المبادئ" },
      { what: "خارطة طريق استثمار التجزئة تقدّم التصميم" },
      { what: "ميزانية 2027 تحدد {limit} و{threshold} و1%" },
      { what: "نشر Finance (No. 2) Bill بالقواعد القانونية للحساب" },
      { what: "نقاش المرحلة الثانية في الـDáil؛ يُحال مشروع القانون إلى لجنة مختارة" },
      { what: "مرحلتا اللجنة والتقرير (متوقع)" },
      { what: "توقيع قانون المالية ليصبح قانونًا (متوقع)" },
      { what: "أمر وزاري يبدأ العمل بقواعد الحساب" },
      { what: "المزوّدون يبدؤون تقديم الحسابات (خطة الحكومة؛ ومشروع القانون يسمح بـ1 يناير 2027)" },
    ],
    afterAct: "بعد صدور القانون",
    providersTitle: "من يمكنه تقديمه",
    providersBody:
      "الشركات المنظمة فقط: شركات الاستثمار والوسطاء المرخّصون بموجب MiFID، والبنوك التي لديها تراخيص استثمار، وشركات إدارة الصناديق، وشركات التأمين للمنتجات القائمة على التأمين. ويمكن لشركات في دول أخرى من المنطقة الاقتصادية الأوروبية تقديمه أيضًا، ما دامت تتولى الضريبة الأيرلندية عنك. على كل مزوّد التسجيل لدى Revenue، التي ستنشر القائمة. وتريد الاتحادات الائتمانية المشاركة، لكنها ليست من الأنواع المذكورة في مشروع القانون.",
    noBrands: "لا نذكر أسماء شركات. لم تنشر أي منها أسعارًا بعد، وستُقرأ القائمة على أنها توصية.",
    faqTitle: "أسئلة",
    faqs: [
      {
        q: "هل مالي مضمون؟",
        a: "لا. الحساب معاملة ضريبية، وليس منتج ادخار حكوميًا. يحتوي على أسهم وسندات وصناديق يمكن أن تنخفض، وقد تسترد أقل مما وضعت. ويمكن أن تُستحق نسبة 1% حتى في سنة يخسر فيها الحساب مالًا، إذا كان متوسط قيمته فوق {threshold}.",
      },
      {
        q: "هل يمكنني سحب المال؟",
        a: "نعم، في أي وقت، دون تقييد ودون ضريبة على السحب. المال المسحوب لا يحرر أي جزء من {limit} لتلك السنة: الحد يحتسب كل ما أُودع.",
      },
      {
        q: "هل يمكنني نقل أسهم أو صناديق ETF أملكها بالفعل إليه؟",
        a: "لا. لا يمكن إيداع إلا المال، لذا عليك بيعها أولًا، وقد يكون ذلك تصرفًا خاضعًا للضريبة خارج الحساب.",
      },
      {
        q: "ماذا لو أودعت أكثر من {limit} في سنة؟",
        a: "يُفرض على الزيادة 1% شهريًا حتى تسحبها، حتى في السنوات اللاحقة، ويتعرض المزوّد لعقوبة، لذا من المرجح أن يمنعك المزوّدون من تجاوز الحد.",
      },
      {
        q: "هل يمكن لزوجين مشاركة حساب واحد؟",
        a: "لا، الحسابات المشتركة غير مسموحة. يمكن لكل بالغ أن يكون له حسابه الخاص، فيكون للزوجين معًا {double} من الحيز المعفى من الضريبة.",
      },
      {
        q: "ماذا لو انتقلت إلى الخارج؟",
        a: "أخبر مزوّدك. يبقى الحساب مفتوحًا، لكن لا يمكنك الإيداع فيه أو نقله إلى مزوّد آخر ما دمت غير مقيم.",
      },
      {
        q: "ماذا يحدث عند وفاة صاحبه؟",
        a: "يتولاه ممثلوه الشخصيون. لا يمكن إيداع المزيد، ويجب بيع الاستثمارات خلال سنة من صدور منح الوصاية أو الإدارة (probate أو administration)، أو بحلول الذكرى الثالثة للوفاة، أيهما أسبق. وما لم يُبع بحلول ذلك الوقت يُعامل كأنه بيع بقيمة السوق.",
      },
      {
        q: "هل هو مثل حساب ISA في المملكة المتحدة؟",
        a: "لا. هو أقرب إلى حساب ISK في السويد: ضريبة سنوية صغيرة على القيمة، بدلًا من إطار معفى تمامًا من الضريبة بحد أكبر.",
      },
    ],
    seeAlso: "انظر أيضًا",
    related: [
      { label: "مخطط الاستثمار", body: "قارن 32 خيارًا في أيرلندا حسب العائد بعد الضريبة" },
      { label: "حاسبة CGT", body: "الضريبة على بيع الأسهم خارج الحساب، بنسبة 31%" },
      { label: "ميزانية 2027", body: "التغييرات الأخرى" },
      { label: "كيف تُفرض الضريبة على المدخرات والاستثمارات", body: "الدليل الأطول، بالإنجليزية" },
    ],
    ccpc: { label: "CCPC Investment Readiness Tool", body: "اختبار قصير لمعرفة ما إذا كنت مستعدًا للاستثمار (بالإنجليزية)" },
    sourcesTitle: "المصادر",
    disclaimer:
      "معلومات عامة فقط، وليست نصيحة مالية أو ضريبية أو قانونية. القواعد كما وردت في Finance (No. 2) Bill 2026، المنشور في 19 أكتوبر 2026، وقد تتغير قبل أن يصبح قانونًا. الحساب ليس مضمونًا من الدولة: يمكن أن تنخفض الاستثمارات كما يمكن أن ترتفع.",
    calc: {
      opens: "يُفتح الحساب في",
      first: "المبلغ المودَع عند الفتح",
      monthly: "كل شهر",
      monthlyHint: "في اليوم الأول، من شهر الفتح.",
      yearly: "مبلغ إضافي كل يناير",
      yearlyHint: "من السنة الثانية فصاعدًا.",
      until: "الاحتفاظ به حتى 31 ديسمبر من سنة",
      growth: "النمو السنوي (افتراضك)",
      growthHint:
        "ليس توقعًا. نمو الاستثمارات بعد رسوم صناديقها. العوائد الفعلية ترتفع وتنخفض، ويمكن أن تكون سالبة.",
      fee: "رسوم المزوّد السنوية",
      feeHint: "لم ينشر أي مزوّد أسعارًا. تتوقع مصادر في القطاع نحو 0.5% دون مشورة، وحتى 1.5% معها.",
      paid: "ما تودعه",
      growthTile: "النمو",
      growthAfterFees: "النمو بعد الرسوم",
      taxTile: "ضريبة 1%، كل السنوات",
      valueOn: "القيمة في 31 ديسمبر {year}",
      noTax: "لا يتجاوز متوسط القيمة {threshold} في أي سنة، فلا تُستحق ضريبة.",
      firstTax: "تُطبَّق نسبة 1% أول مرة في {year}، أول سنة يتجاوز فيها متوسط القيمة {threshold}.",
      share: "على مدى الفترة كلها، تبلغ الضريبة {share} من النمو.",
      noWithdrawalTax: "سحب المال لا تُفرض عليه ضريبة.",
      refused:
        "{refused} مما خططت لإيداعه يتجاوز حد {limit} لسنته الميلادية، لذا يُستبعد. ويُتوقع أن يرفضه المزوّدون: المال فوق الحد تُفرض عليه 1% شهريًا حتى يُسحب.",
      cols: {
        year: "السنة",
        days: "أيام الفتح",
        paidIn: "المودَع",
        growth: "النمو",
        average: "متوسط القيمة",
        tax: "ضريبة 1%",
        end: "القيمة في 31 ديسمبر",
      },
      how: "كيف تُحسب",
      howItems: [
        "يُقيَّم الحساب عند إغلاق كل يوم تقويمي يكون فيه مفتوحًا، بما في ذلك عطلات نهاية الأسبوع. متوسط القيمة هو مجموع تلك القيم اليومية مقسومًا على عدد الأيام (المادة 747Q(5)).",
        "ضريبة السنة: (متوسط القيمة − {threshold}) × 1%، وصفر إذا كان الناتج أقل من الصفر (747Q(4) و(7)). في سنة الفتح، يغطي المتوسط الأيام التي كان فيها مفتوحًا فقط، ولا يُخفَّض مبلغ {threshold}.",
        "هنا تؤخذ الضريبة من الحساب في 31 ديسمبر. ويسمح القانون للمزوّد بأخذها من الحساب أو بطريقة أخرى تتفقان عليها، ودفعها إلى Revenue بحلول 14 أبريل (747Q(6)، 747T).",
        "يُودع {limit} كحد أقصى في كل سنة ميلادية، أيًا كان ما يُسحب (747H، 747L). وتُدفع المبالغ في اليوم الأول من الشهر.",
        "يُوزَّع النمو ورسوم المزوّد بالتساوي على الأيام، فتنمو السنة الكاملة بالمعدل الذي اخترته تمامًا ناقص الرسوم. ويُعرض النمو بعد الرسوم وقبل هذه الضريبة.",
        "لا تُفرض ضريبة على أي شيء آخر: لا ضريبة خروج ولا CGT ولا ضريبة استقطاع على الأرباح الموزعة ولا تصرف افتراضي داخل الحساب، ولا شيء عند سحب المال (747P، Finance Bill s.27).",
      ],
      source: "المصدر:",
      sourceLink: "Finance (No. 2) Bill 2026، المادة 26، الجزء الجديد Part 27A",
      illustration:
        "توضيح فقط، وليس نصيحة. يفترض عائدًا ثابتًا واحدًا كل سنة؛ العوائد الفعلية تتغير ويمكن أن تكون سالبة. القواعد كما في Finance (No. 2) Bill 2026 وقد تتغير قبل أن يصبح قانونًا.",
    },
  },

  bn: {
    meta: {
      title: "আইরিশ Investment Account: 1% কর কীভাবে কাজ করে",
      description:
        "বাজেট 2027-এ 1 জুলাই 2027 থেকে চালুর ঘোষিত Investment Account, যা Finance Bill-এ রয়েছে এবং এখনও আইন হয়নি: কে খুলতে পারবেন, কী রাখা যাবে, {threshold}-এর ওপর 1% কর কীভাবে কাজ করে, সাথে Finance Bill-এর নিয়ম অনুযায়ী তৈরি ক্যালকুলেটর।",
    },
    home: "হোম",
    crumb: "Investment Account",
    title: "আইরিশ Investment Account",
    lede: "শেয়ার, বন্ড ও ফান্ডের জন্য একটি নতুন অ্যাকাউন্ট, যা 1 জুলাই 2027 থেকে কার্যকর হতে যাচ্ছে। CGT বা এক্সিট ট্যাক্সের পরিবর্তে, {threshold}-এর অতিরিক্ত মোট মূল্যের ওপর আপনি বছরে 1% কর দেবেন, আর সেবাদাতা প্রতিষ্ঠান সরাসরি Revenue-র সাথে এটি নিষ্পত্তি করবে।",
    status: "Finance Bill-এ প্রস্তাবিত। এখনও আইন হিসেবে পাস হয়নি।",
    statusBody:
      "Finance (No. 2) Bill 2026 19 অক্টোবর 2026-এ প্রকাশিত হয়েছে। Finance Act পাসের মাধ্যমে এটি আইনে পরিণত হবে, তারপর মন্ত্রণালয়ের আদেশে কার্যকর হবে। সর্বশেষ যাচাই {date}।",
    canOpen: "আমি কি অ্যাকাউন্ট খুলতে পারব?",
    workOut: "কর হিসাব করুন",
    rulesTitle: "নিয়মাবলী সংক্ষেপে",
    rules: [
      {
        term: "টাকা জমা দেওয়া",
        def: "বছরে সর্বোচ্চ {limit}, কেবল নগদ অর্থে। কোনো সর্বনিম্ন সীমা নেই এবং টাকা তুলে নিলে সেই বছরের সীমার কোনো অংশ ফেরত পাওয়া যায় না।",
      },
      {
        term: "কর",
        def: "অ্যাকাউন্টের {threshold}-এর অতিরিক্ত গড় মূল্যের ওপর বছরে 1% কর। এর নিচে কোনো কর নেই। অ্যাকাউন্টের ভেতরে কোনো CGT, লভ্যাংশ কর কর্তন, এক্সিট ট্যাক্স বা 8 বছরের ডিমড ডিসপোজাল নেই এবং টাকা তোলার সময়ও কোনো কর দিতে হয় না।",
      },
      {
        term: "গড় হিসাব",
        def: "অ্যাকাউন্ট চালু থাকা প্রতিটি দিনের শেষে এর মূল্যায়ন করা হয় এবং কর নির্ধারণে বছরের সেই দৈনিক মূল্যের গড় ব্যবহার করা হয়।",
      },
      {
        term: "কাগজপত্রের ঝামেলা",
        def: "আপনার জন্য কোনো ঝামেলা নেই। সেবাদাতা প্রতিষ্ঠান কর হিসাব করে অ্যাকাউন্ট থেকে Revenue-কে পরিশোধ করবে এবং আপনাকে একটি বার্ষিক বিবরণী পাঠাবে।",
      },
    ],
    howTitle: "কর কীভাবে হিসাব করা হয়",
    formula: "(গড় মূল্য − {threshold}) × 1%",
    speech:
      "{speech}-এ গড়ে {avg} মূল্যের একটি অ্যাকাউন্টের উদাহরণ দেওয়া হয়েছিল: যা করমুক্ত সীমার চেয়ে {over} বেশি, ফলে কর আসে {tax}। আরও কয়েকটি উদাহরণ:",
    speechLink: "বাজেট বক্তৃতা",
    cases: [
      "চার বছর ধরে পুরো {limit} জমা করলে বৃদ্ধির পূর্বে মোট জমা হবে {four}, যা এখনও সীমার নিচে, ফলে কোনো কর নেই।",
      "যে অ্যাকাউন্ট বছরে লোকসান করেছে কিন্তু গড় মূল্য ছিল {avg}, সেটিরও {tax} কর প্রদেয় হবে। কর লাভের ওপর নয়, মূল্যের ওপর ধার্য হয়।",
      "1 ডিসেম্বরে জমা করা অর্থ বছরের 365 দিনের মধ্যে 31 দিন থাকে, ফলে সেই বছরের গড়ের ক্ষেত্রে এর মাত্র বারো ভাগের এক ভাগ গণনা করা হয়।",
    ],
    partYear:
      "গড় হিসাব কেবল অ্যাকাউন্ট চালু থাকার দিনগুলোর জন্য প্রযোজ্য। আপনি যদি বছরের মাঝামাঝি এটি বন্ধ করেন, তবে বন্ধ করার সময় সেই আংশিক বছরের কর ধার্য হবে।",
    whoTitle: "কারা অ্যাকাউন্ট খুলতে পারবেন",
    whoBody:
      "{age} বা তদূর্ধ্ব বয়সী যেকোনো ব্যক্তি যিনি আয়ারল্যান্ডের কর বাসিন্দা এবং যাঁর একটি PPS নম্বর রয়েছে। আপনি নিজের নামে একটিমাত্র অ্যাকাউন্ট খুলতে পারবেন। কোনো বছরে অ্যাকাউন্ট বন্ধ করলে পরবর্তী বছরের আগে আরেকটি অ্যাকাউন্ট খুলতে পারবেন না। আবেদনের সময় সেবাদাতারা এগুলো যাচাই করবেন।",
    whatTitle: "কী কী রাখা যাবে",
    allowedTitle: "অনুমোদিত",
    allowed: [
      "EEA-এর নিয়ন্ত্রিত বাজারে বা বিশ্বের সমমানের বাজারে লেনদেন হওয়া শেয়ার",
      "একইভাবে লেনদেন হওয়া বন্ড",
      "UCITS ফান্ড, যার আওতায় ইউরোপে বিক্রিত বেশিরভাগ ETF অন্তর্ভুক্ত",
      "বীমাভিত্তিক বিনিয়োগ প্রোডাক্ট",
    ],
    notAllowedTitle: "অনুমোদিত নয়",
    notAllowed: [
      "অন্য যেকোনো কিছু, যেমন ক্রিপ্টো সম্পদ এবং ডেরিভেটিভস",
      "যে ফান্ডগুলো UCITS নয়, যেমন যুক্তরাষ্ট্রে নথিভুক্ত ETF এবং স্ট্রাকচার্ড UCITS",
      "ব্যক্তিগত পোর্টফোলিও ফান্ড এবং ব্যক্তিগত পোর্টফোলিও লাইফ পলিসি",
      "কর্মচারী শেয়ার স্কিম থেকে প্রাপ্ত শেয়ার",
      "সঞ্চয় হিসেবে নগদ টাকা: এটি কেবল বিনিয়োগের অপেক্ষায় থাকা অবস্থায় রাখা যাবে এবং এতে কোনো সুদ পাওয়া যাবে না",
    ],
    calcTitle: "ক্যালকুলেটর",
    calcIntro:
      "কখন অ্যাকাউন্ট খুলবেন, কত জমা দেবেন এবং একটি আনুমানিক প্রবৃদ্ধির হার বেছে নিন। Finance Bill-এর নিয়ম অনুযায়ী এটি অ্যাকাউন্ট চালু থাকার প্রতিটি দিনের মূল্যায়ন করে, তার গড় হিসাব করে এবং {threshold}-এর অতিরিক্ত মূল্যের ওপর 1% কর নির্ধারণ করে।",
    notFitTitle: "কখন এটি আপনার জন্য উপযোগী নাও হতে পারে",
    notFit: [
      "যে অর্থ আগামী কয়েক বছরের মধ্যে প্রয়োজন হতে পারে। ঠিক যখন প্রয়োজন তখনই বিনিয়োগের মূল্য কমে যেতে পারে, তাই জরুরি তহবিল প্রথমে ডিপোজিট অ্যাকাউন্টে রাখা উচিত এবং বিনিয়োগ সাধারণত পাঁচ বা তদূর্ধ্ব বছরের লক্ষ্যের জন্য উপযুক্ত।",
      "কম প্রত্যাশিত রিটার্ন। 1% কর লাভের ওপর নয়, মোট মূল্যের ওপর ধার্য হয়: গড়ে {avg} মূল্যের ক্ষেত্রে কর {tax}, তা অ্যাকাউন্টটি বছরে {grew} বাড়ুক বা একেবারেই না বাড়ুক।",
      "অব্যবহৃত পেনশনের সুযোগ থাকলে। পেনশনে জমার ওপর বয়সভিত্তিক সীমার মধ্যে আয়কর ছাড় পাওয়া যায়, আর এই অ্যাকাউন্টে জমার সময় কোনো কর ছাড় নেই। তবে পেনশনের অর্থ অবসর পর্যন্ত লকড থাকে, আর এই অ্যাকাউন্ট যেকোনো সময় খালি করা যায়।",
    ],
    openTitle: "এখনও যা চূড়ান্ত হয়নি",
    openIntro: "বিলটিতে বেশিরভাগ প্রশ্নের উত্তর রয়েছে, তবে এগুলোর নিষ্পত্তি এখনও হয়নি এবং বিলটি এখনও পরিবর্তিত হতে পারে।",
    openQs: [
      {
        q: "অ্যাকাউন্ট কখন চালু হবে?",
        said: "বিলটি 1 জানুয়ারি 2027 থেকে অ্যাকাউন্ট খোলার অনুমোদন দেয়, যার সূচনা হবে মন্ত্রণালয়ের আদেশের মাধ্যমে। সরকার জানিয়েছে যে সেবাদাতা প্রতিষ্ঠানগুলো 1 জুলাই 2027 থেকে এটি চালু করবে।",
      },
      {
        q: "এটি কি সরকারি সমাজকল্যাণ ভাতার জন্য সঞ্চয় হিসেবে গণ্য হবে?",
        said: "Finance Bill-এ এটি অন্তর্ভুক্ত নেই এবং এ বিষয়ে এখনও কিছু জানানো হয়নি।",
      },
      {
        q: "এতে খরচ কেমন হবে?",
        said: "কোনো নির্দিষ্ট ফি ক্যাপ বা সর্বোচ্চ সীমা নেই। শিল্প সূত্রের ধারণা, পরামর্শ ছাড়া বছরে প্রায় 0.5% এবং পরামর্শসহ সর্বোচ্চ 1.5% হতে পারে। কোনো প্রতিষ্ঠান এখনও মূল্যতালিকা প্রকাশ করেনি।",
      },
      {
        q: "প্রতিদিন বিনিয়োগের মূল্যায়ন কীভাবে হবে?",
        said: "Revenue বিধিমালার মাধ্যমে মূল্যের উৎস এবং মুদ্রা সংক্রান্ত নিয়ম নির্ধারণ করবে।",
      },
      {
        q: "শিশুদের অ্যাকাউন্ট কি অনুমোদিত হবে?",
        said: "শুরুতে নয়। অর্থমন্ত্রী জানিয়েছেন যে ভবিষ্যতের Finance Bill-এ এটি বিবেচনা করা হবে।",
      },
      {
        q: "বিলটিতে কি কোনো পরিবর্তন আসতে পারে?",
        said: "20 অক্টোবর Dáil-এর দ্বিতীয় পর্যায়ের বিতর্কের পর এটি সিলেক্ট কমিটিতে পাঠানো হয়েছে এবং কমিটি ও রিপোর্ট পর্যায়ে এতে সংশোধনী আনা হতে পারে।",
      },
    ],
    timelineTitle: "বর্তমান অগ্রগতি",
    timeline: [
      { what: "অর্থমন্ত্রী সঞ্চয় ও বিনিয়োগ স্কিমের পরিকল্পনা ঘোষণা করেন" },
      { what: "Savings and Investment Forum মূল নীতিমালা নির্ধারণ করে" },
      { what: "Retail Investment Roadmap অ্যাকাউন্টের রূপরেখা প্রদান করে" },
      { what: "বাজেট 2027-এ {limit}, {threshold} এবং 1% কর নির্ধারণ করা হয়" },
      { what: "অ্যাকাউন্টের আইনি নিয়মাবলীসহ Finance (No. 2) Bill প্রকাশিত হয়" },
      { what: "Dáil-এ দ্বিতীয় পর্যায়ের বিতর্ক; বিলটি সিলেক্ট কমিটিতে পাঠানো হয়" },
      { what: "কমিটি ও রিপোর্ট পর্যায় (প্রত্যাশিত)" },
      { what: "Finance Act স্বাক্ষরিত হয়ে আইনে পরিণত হওয়া (প্রত্যাশিত)" },
      { what: "মন্ত্রণালয়ের আদেশে অ্যাকাউন্টের নিয়মাবলী কার্যকর হওয়া" },
      { what: "সেবাদাতারা অ্যাকাউন্ট অফার করা শুরু করবেন (সরকারি পরিকল্পনা; বিল অনুযায়ী 1 জানুয়ারি 2027 থেকে অনুমোদিত)" },
    ],
    afterAct: "আইন পাসের পর",
    providersTitle: "কারা এটি অফার করতে পারবে",
    providersBody:
      "কেবলমাত্র নিয়ন্ত্রিত প্রতিষ্ঠান: MiFID-এর অধীনে অনুমোদিত বিনিয়োগ প্রতিষ্ঠান ও ব্রোকার, বিনিয়োগের অনুমতিপ্রাপ্ত ব্যাংক, ফান্ড ম্যানেজমেন্ট কোম্পানি এবং বীমাভিত্তিক প্রোডাক্টের জন্য বীমাকারী প্রতিষ্ঠান। EEA-এর অন্যান্য প্রতিষ্ঠানও এটি অফার করতে পারবে, যদি তারা আপনার পক্ষে আইরিশ কর পরিচালনা করে। প্রতিটি সেবাদাতাকে Revenue-তে নিবন্ধিত হতে হবে, যারা তালিকা প্রকাশ করবে। ক্রেডিট ইউনিয়ন অংশ নিতে চাইলেও বিলে তাদের নাম উল্লেখ নেই।",
    noBrands: "আমরা কোনো ব্র্যান্ডের নাম উল্লেখ করি না। কেউই এখনও মূল্য প্রকাশ করেনি এবং এমন কোনো তালিকা সুপারিশ হিসেবে বিবেচিত হতে পারে।",
    faqTitle: "সাধারণ জিজ্ঞাসা",
    faqs: [
      {
        q: "আমার মূলধনের কি কোনো নিশ্চয়তা বা গ্যারান্টি আছে?",
        a: "না। এই অ্যাকাউন্টটি একটি কর কাঠামো, কোনো রাষ্ট্রীয় সঞ্চয় প্রোডাক্ট নয়। এতে শেয়ার, বন্ড ও ফান্ড থাকে যার দাম কমতে পারে এবং আপনি জমার চেয়ে কম অর্থ ফেরত পেতে পারেন। এমনকি অ্যাকাউন্ট লোকসান করলেও 1% কর প্রদেয় হতে পারে, যদি এর গড় মূল্য {threshold}-এর বেশি হয়।",
      },
      {
        q: "আমি কি যেকোনো সময় টাকা তুলতে পারব?",
        a: "হ্যাঁ, যেকোনো সময়, কোনো লক-ইন নেই এবং টাকা তোলার ওপর কোনো কর নেই। টাকা তুলে নিলেও সেই বছরের {limit} সীমার কোনো অংশ খালি হয় না: সীমাটি জমা করা মোট অর্থের ওপর হিসাব করা হয়।",
      },
      {
        q: "আমার বর্তমান শেয়ার বা ETF কি এতে স্থানান্তর করতে পারব?",
        a: "না। এতে কেবল নগদ অর্থ জমা করা যায়, তাই আপনাকে প্রথমে সেগুলো বিক্রি করতে হবে, যা অ্যাকাউন্টের বাইরে করযোগ্য হস্তান্তর হতে পারে।",
      },
      {
        q: "বছরে {limit}-এর বেশি জমা দিলে কী হবে?",
        a: "টাকা তুলে না নেওয়া পর্যন্ত অতিরিক্ত অংশের ওপর প্রতি মাসে 1% হারে কর ধার্য হবে, এমনকি পরবর্তী বছরগুলোতেও; সাথে সেবাদাতার ওপর জরিমানা প্রযোজ্য হবে, ফলে সেবাদাতারা আপনাকে সীমার বেশি জমা দিতে বাধা দেবে।",
      },
      {
        q: "দম্পতিরা কি যৌথ অ্যাকাউন্ট খুলতে পারবেন?",
        a: "না, যৌথ অ্যাকাউন্টের অনুমতি নেই। প্রত্যেক প্রাপ্তবয়স্ক নিজস্ব অ্যাকাউন্ট রাখতে পারেন, ফলে একটি দম্পতি মিলে মোট {double} করমুক্ত সুবিধা পাবেন।",
      },
      {
        q: "আমি বিদেশে চলে গেলে কী হবে?",
        a: "আপনার সেবাদাতাকে জানান। অ্যাকাউন্টটি চালু থাকবে, তবে অনাবাসী থাকা অবস্থায় আপনি এতে নতুন অর্থ জমা করতে বা অন্য সেবাদাতায় স্থানান্তর করতে পারবেন না।",
      },
      {
        q: "অ্যাকাউন্টধারী মারা গেলে কী হবে?",
        a: "তাঁর আইনি প্রতিনিধিরা অ্যাকাউন্টের দায়িত্ব নেবেন। নতুন কোনো অর্থ জমা দেওয়া যাবে না এবং প্রোবেট বা প্রশাসনের অনুমোদনের এক বছরের মধ্যে অথবা মৃত্যুর তৃতীয় বার্ষিকীর মধ্যে (যেটি আগে আসে) বিনিয়োগগুলো বিক্রি করতে হবে। সেই সময়ের মধ্যে বিক্রি না করা সম্পদ বাজারমূল্যে বিক্রি হিসেবে গণ্য হবে।",
      },
      {
        q: "এটি কি যুক্তরাজ্যের ISA-এর মতো?",
        a: "না। এটি সুইডেনের ISK-এর কাছাকাছি: বড় সীমার সম্পূর্ণ করমুক্ত অ্যাকাউন্টের বদলে মোট মূল্যের ওপর একটি ছোট বার্ষিক কর ব্যবস্থা।",
      },
    ],
    seeAlso: "আরও দেখুন",
    related: [
      { label: "ইনভেস্টমেন্ট প্ল্যানার", body: "কর কাটার পর রিটার্নের ভিত্তিতে 32টি আইরিশ বিকল্পের তুলনা করুন" },
      { label: "CGT ক্যালকুলেটর", body: "অ্যাকাউন্টের বাইরে শেয়ার বিক্রির ওপর 31% হারে কর" },
      { label: "বাজেট 2027", body: "অন্যান্য পরিবর্তনগুলো" },
      { label: "সঞ্চয় ও বিনিয়োগে যেভাবে কর ধার্য হয়", body: "বিস্তারিত নির্দেশিকা" },
    ],
    ccpc: { label: "CCPC Investment Readiness Tool", body: "আপনি বিনিয়োগের জন্য প্রস্তুত কি না তা যাচাই করার একটি সংক্ষিপ্ত পরীক্ষা" },
    sourcesTitle: "উৎস",
    disclaimer:
      "শুধুমাত্র সাধারণ তথ্য, কোনো আর্থিক, কর বা আইনি পরামর্শ নয়। নিয়মাবলী 19 অক্টোবর 2026-এ প্রকাশিত Finance (No. 2) Bill 2026 অনুযায়ী এবং আইনে পরিণত হওয়ার আগে পরিবর্তিত হতে পারে। অ্যাকাউন্টটি কোনো রাষ্ট্রীয় গ্যারান্টি নয়: বিনিয়োগের মূল্য বাড়ার পাশাপাশি কমতেও পারে।",
    calc: {
      opens: "অ্যাকাউন্ট খোলার তারিখ",
      first: "খোলার সময় জমা",
      monthly: "প্রতি মাসে",
      monthlyHint: "অ্যাকাউন্ট খোলার মাস থেকে প্রতি মাসের 1 তারিখে।",
      yearly: "প্রতি জানুয়ারিতে অতিরিক্ত জমা",
      yearlyHint: "দ্বিতীয় বছর থেকে শুরু করে।",
      until: "31 ডিসেম্বর পর্যন্ত বহাল রাখুন",
      growth: "বার্ষিক প্রবৃদ্ধি (আপনার অনুমান)",
      growthHint:
        "কোনো পূর্বাভাস নয়। ফান্ডের নিজস্ব চার্জ বাদ দেওয়ার পর বিনিয়োগের প্রবৃদ্ধি। প্রকৃত রিটার্ন ওঠানামা করে এবং নেতিবাচকও হতে পারে।",
      fee: "সেবাদাতার বার্ষিক ফি",
      feeHint: "কোনো সেবাদাতা এখনও মূল্য প্রকাশ করেনি। শিল্পের ধারণা, পরামর্শ ছাড়া প্রায় 0.5% এবং পরামর্শসহ সর্বোচ্চ 1.5%।",
      paid: "আপনার মোট জমা",
      growthTile: "প্রবৃদ্ধি",
      growthAfterFees: "ফি কাটার পর প্রবৃদ্ধি",
      taxTile: "সব বছর মিলিয়ে 1% কর",
      valueOn: "31 ডিসেম্বর {year}-এ মোট মূল্য",
      noTax: "বছরে গড় মূল্য কখনই {threshold}-এর বেশি হয় না, ফলে কোনো কর প্রদেয় নয়।",
      firstTax: "1% কর প্রথমবার {year} সালে প্রযোজ্য হয়, যে বছর প্রথম গড় মূল্য {threshold} অতিক্রম করে।",
      share: "সমগ্র মেয়াদের মোট কর অর্জিত প্রবৃদ্ধির {share} অংশ।",
      noWithdrawalTax: "টাকা তোলার ওপর কোনো কর নেই।",
      refused:
        "আপনি যা জমা দিতে চেয়েছিলেন তার মধ্যে {refused} ক্যালেন্ডার বছরের {limit} সীমা অতিক্রম করে, তাই তা বাদ দেওয়া হয়েছে। সেবাদাতারা এটি প্রত্যাখ্যান করবে বলে প্রত্যাশিত: সীমার অতিরিক্ত অর্থের ওপর অর্থ তুলে না নেওয়া পর্যন্ত প্রতি মাসে 1% কর ধার্য হয়।",
      cols: {
        year: "বছর",
        days: "চালু দিন",
        paidIn: "জমা",
        growth: "প্রবৃদ্ধি",
        average: "গড় মূল্য",
        tax: "1% কর",
        end: "31 ডিসেম্বরে মূল্য",
      },
      how: "কীভাবে হিসাব করা হয়",
      howItems: [
        "ছুটির দিনসহ অ্যাকাউন্ট চালু থাকা প্রতিটি ক্যালেন্ডার দিনের শেষে এর মূল্যায়ন করা হয়। দৈনিক মানগুলো যোগ করে মোট দিন দিয়ে ভাগ করে গড় মূল্য পাওয়া যায় (ধারা 747Q(5))।",
        "বছরের কর: (গড় মূল্য − {threshold}) × 1%, যদি তা শূন্যের নিচে হয় তবে কর শূন্য (747Q(4) এবং (7))। খোলার বছরে গড় হিসাব কেবল চালুর দিনগুলো কাভার করে এবং {threshold} কমানো হয় না।",
        "এখানে 31 ডিসেম্বরে অ্যাকাউন্ট থেকে কর কেটে নেওয়া হয়। আইন সেবাদাতাকে অ্যাকাউন্ট থেকে বা আপনার সম্মতিতে অন্য উপায়ে কর কেটে 14 এপ্রিলের মধ্যে Revenue-কে পরিশোধ করার অনুমতি দেয় (747Q(6), 747T)।",
        "টাকা তুলে নেওয়া নির্বিশেষে প্রতিটি ক্যালেন্ডার বছরে সর্বোচ্চ {limit} জমা দেওয়া যায় (747H, 747L)। প্রতি মাসের 1 তারিখে জমা সম্পন্ন হয়।",
        "প্রবৃদ্ধি এবং সেবাদাতার ফি দিনগুলোতে সমানভাবে বণ্টন করা হয়, ফলে একটি পূর্ণ বছরে ঠিক আপনার নির্বাচিত হারে ফি বাদ দিয়ে প্রবৃদ্ধি ঘটে। প্রবৃদ্ধি ফি কাটার পর এবং এই করের পূর্বে দেখানো হয়েছে।",
        "অন্য কোনো কর নেই: অ্যাকাউন্টের ভেতরে কোনো এক্সিট ট্যাক্স, CGT, লভ্যাংশ কর কর্তন বা ডিমড ডিসপোজাল নেই এবং টাকা তোলার সময়ও কোনো কর নেই (747P, Finance Bill s.27)।",
      ],
      source: "উৎস:",
      sourceLink: "Finance (No. 2) Bill 2026, ধারা 26, নতুন Part 27A",
      illustration:
        "শুধুমাত্র দৃষ্টান্তমূলক হিসাব, কোনো পরামর্শ নয়। এটি প্রতি বছর একটি নির্দিষ্ট রিটার্ন ধরে হিসাব করে; কিন্তু প্রকৃত রিটার্ন পরিবর্তিত হয় এবং নেতিবাচক হতে পারে। নিয়মাবলী Finance (No. 2) Bill 2026 অনুযায়ী এবং আইনে পরিণত হওয়ার আগে পরিবর্তিত হতে পারে।",
    },
  },

  hi: {
    meta: {
      title: "आयरिश इन्वेस्टमेंट अकाउंट: 1% टैक्स कैसे काम करता है",
      description:
        "बजट 2027 में 1 जुलाई 2027 से शुरू करने के लिए घोषित इन्वेस्टमेंट अकाउंट, जो Finance Bill में है पर अभी क़ानून नहीं है: कौन खोल सकता है, इसमें क्या रखा जा सकता है, {threshold} से ऊपर के मूल्य पर 1% टैक्स कैसे काम करता है, और एक कैलकुलेटर जो दिन-ब-दिन Finance Bill का पालन करता है।",
    },
    home: "होम",
    crumb: "इन्वेस्टमेंट अकाउंट",
    title: "आयरिश इन्वेस्टमेंट अकाउंट",
    lede: "शेयर, बॉन्ड और फ़ंड के लिए एक नया अकाउंट, 1 जुलाई 2027 से आने वाला। CGT या एग्ज़िट टैक्स की जगह आप इसके मूल्य के {threshold} से ऊपर के हिस्से पर साल में 1% देते हैं, और Revenue से जुड़ा काम प्रदाता सँभालता है।",
    status: "Finance Bill में है। अभी क़ानून नहीं।",
    statusBody:
      "Finance (No. 2) Bill 2026 19 अक्टूबर 2026 को प्रकाशित हुआ। Finance Act के साथ यह क़ानून बनेगा, फिर मंत्री के आदेश से शुरू होगा। पिछली जाँच: {date}।",
    canOpen: "क्या मैं खोल सकता हूँ?",
    workOut: "टैक्स निकालें",
    rulesTitle: "नियम संक्षेप में",
    rules: [
      {
        term: "जमा करना",
        def: "साल में अधिकतम {limit}, सिर्फ़ पैसे के रूप में। कोई न्यूनतम राशि नहीं है, और पैसा निकालने से उस साल की सीमा का कुछ भी वापस नहीं मिलता।",
      },
      {
        term: "टैक्स",
        def: "अकाउंट के औसत मूल्य के {threshold} से ऊपर के हिस्से पर साल में 1%। उससे नीचे कुछ नहीं। अकाउंट के अंदर CGT, डिविडेंड विदहोल्डिंग टैक्स, एग्ज़िट टैक्स या 8 साल का डीम्ड डिस्पोज़ल नहीं है, और पैसा निकालने पर कुछ नहीं देना होता।",
      },
      {
        term: "औसत",
        def: "अकाउंट जितने दिन खुला रहता है, हर दिन के अंत में उसका मूल्य लगाया जाता है, और टैक्स साल भर के उन मूल्यों के औसत पर लगता है।",
      },
      {
        term: "काग़ज़ी काम",
        def: "आपके लिए कुछ नहीं। प्रदाता टैक्स निकालता है, अकाउंट से Revenue को चुकाता है और आपको सालाना विवरण भेजता है।",
      },
    ],
    howTitle: "टैक्स कैसे निकाला जाता है",
    formula: "(औसत मूल्य − {threshold}) × 1%",
    speech:
      "{speech} में औसतन {avg} मूल्य वाले अकाउंट का उदाहरण दिया गया: यह सीमा से {over} ज़्यादा है, इसलिए टैक्स {tax} है। कुछ और उदाहरण:",
    speechLink: "बजट भाषण",
    cases: [
      "चार साल तक पूरे {limit} जमा करने पर बढ़त से पहले {four} होते हैं, जो अब भी सीमा से नीचे है, इसलिए अभी कोई टैक्स नहीं।",
      "जिस अकाउंट में साल भर में नुक़सान हुआ पर औसत मूल्य फिर भी {avg} रहा, उस पर {tax} बनता है। टैक्स मूल्य पर चलता है, मुनाफ़े पर नहीं।",
      "1 दिसंबर को जमा किया पैसा साल के 365 में से 31 दिन रहता है, इसलिए उस साल के औसत में उसका लगभग बारहवाँ हिस्सा ही गिना जाता है।",
    ],
    partYear:
      "औसत में सिर्फ़ वे दिन आते हैं जब अकाउंट खुला था। अगर आप साल के बीच में इसे बंद करते हैं, तो साल के उस हिस्से पर टैक्स बंद होने पर लगता है।",
    whoTitle: "कौन खोल सकता है",
    whoBody:
      "{age} साल या उससे ज़्यादा उम्र का कोई भी व्यक्ति जो टैक्स के लिए आयरलैंड का निवासी है और जिसके पास PPS नंबर है। आपको अपने नाम पर एक ही अकाउंट मिलता है। अगर आप साल के दौरान इसे बंद करते हैं, तो अगले साल तक दूसरा नहीं खोल सकते। आवेदन के समय प्रदाता यह सब जाँचते हैं।",
    whatTitle: "इसमें क्या रखा जा सकता है",
    allowedTitle: "अनुमति है",
    allowed: [
      "EEA के किसी विनियमित बाज़ार, या कहीं और के समकक्ष बाज़ार में ट्रेड होने वाले शेयर",
      "इसी तरह ट्रेड होने वाले बॉन्ड",
      "UCITS फ़ंड, जिनमें यूरोप में बिकने वाले ज़्यादातर ETF आते हैं",
      "बीमा-आधारित निवेश प्रोडक्ट",
    ],
    notAllowedTitle: "अनुमति नहीं है",
    notAllowed: [
      "बाक़ी सब कुछ, जैसे क्रिप्टो एसेट और डेरिवेटिव",
      "जो फ़ंड UCITS नहीं हैं, जैसे अमेरिका में पंजीकृत ETF, और स्ट्रक्चर्ड UCITS",
      "पर्सनल पोर्टफ़ोलियो फ़ंड और पर्सनल पोर्टफ़ोलियो लाइफ़ पॉलिसी",
      "कर्मचारी शेयर योजना से मिले शेयर",
      "बचत के रूप में नक़द: यह सिर्फ़ निवेश होने के इंतज़ार में वहाँ रह सकता है, और इस पर ब्याज नहीं मिलता",
    ],
    calcTitle: "कैलकुलेटर",
    calcIntro:
      "चुनें कि कब खोलेंगे, कितना जमा करेंगे और बढ़त की दर। यह अकाउंट के खुले रहने के हर दिन उसका मूल्य लगाता है, उन मूल्यों का औसत निकालता है और {threshold} से ऊपर की राशि का 1% लेता है, जैसा Finance Bill में तय है।",
    notFitTitle: "कब यह आपके लिए ठीक न हो",
    notFit: [
      "वह पैसा जिसकी अगले कुछ सालों में ज़रूरत पड़ सकती है। ठीक ज़रूरत के समय निवेश गिर सकते हैं, इसलिए आपातकालीन फ़ंड पहले डिपॉज़िट अकाउंट में रखें, और निवेश आम तौर पर पाँच या ज़्यादा साल दूर के लक्ष्यों के लिए ठीक रहता है।",
      "कम अपेक्षित रिटर्न। 1% मूल्य पर लगता है, मुनाफ़े पर नहीं: {avg} के औसत पर टैक्स {tax} है, चाहे उस साल अकाउंट {grew} बढ़ा हो या बिल्कुल न बढ़ा हो।",
      "पेंशन में बची गुंजाइश। पेंशन योगदान पर उम्र के हिसाब से तय सीमा में इनकम टैक्स राहत मिलती है, और इस अकाउंट में जमा पर कोई राहत नहीं। हालाँकि पेंशन का पैसा रिटायरमेंट तक बंद रहता है, और यह अकाउंट कभी भी ख़ाली किया जा सकता है।",
    ],
    openTitle: "अभी तय नहीं",
    openIntro: "बिल ज़्यादातर सवालों के जवाब देता है, पर इनके नहीं, और बिल ख़ुद भी अभी बदल सकता है।",
    openQs: [
      {
        q: "अकाउंट कब खुलेंगे?",
        said: "बिल 1 जनवरी 2027 से अकाउंट की अनुमति देता है, शुरुआत मंत्री के आदेश से तय होगी। सरकार का कहना है कि प्रदाता 1 जुलाई 2027 से इन्हें देना शुरू करेंगे।",
      },
      {
        q: "क्या आय-जाँच वाले सरकारी भुगतानों में इसे बचत माना जाएगा?",
        said: "Finance Bill में इसका ज़िक्र नहीं है और अभी कुछ कहा नहीं गया है।",
      },
      {
        q: "इसकी लागत कितनी होगी?",
        said: "फ़ीस की कोई ऊपरी सीमा नहीं है। उद्योग के सूत्र बिना सलाह के कुल मिलाकर साल में लगभग 0.5% और सलाह के साथ 1.5% तक की उम्मीद करते हैं। किसी प्रदाता ने क़ीमतें प्रकाशित नहीं की हैं।",
      },
      {
        q: "हर दिन निवेश का मूल्य कैसे लगाया जाएगा?",
        said: "Revenue नियमों में क़ीमत के स्रोत और मुद्रा के नियम तय करेगा।",
      },
      {
        q: "क्या बच्चों के अकाउंट की अनुमति होगी?",
        said: "शुरुआत में नहीं। मंत्री का कहना है कि आगे के Finance Bill में इस पर विचार किया जाएगा।",
      },
      {
        q: "क्या बिल बदलेगा?",
        said: "20 अक्टूबर को Dáil में Second Stage बहस के बाद यह Select Committee को गया, और Committee व Report Stage में इसमें संशोधन हो सकता है।",
      },
    ],
    timelineTitle: "अभी कहाँ है",
    timeline: [
      { what: "मंत्री ने बचत और निवेश योजना की घोषणा की" },
      { what: "Savings and Investment Forum ने सिद्धांत तय किए" },
      { what: "Retail Investment Roadmap ने ढाँचा दिया" },
      { what: "बजट 2027 ने {limit}, {threshold} और 1% तय किया" },
      { what: "अकाउंट के क़ानूनी नियमों के साथ Finance (No. 2) Bill प्रकाशित" },
      { what: "Dáil में Second Stage बहस; बिल Select Committee को गया" },
      { what: "Committee और Report Stage (अपेक्षित)" },
      { what: "Finance Act पर हस्ताक्षर होकर क़ानून बनेगा (अपेक्षित)" },
      { what: "मंत्री का आदेश अकाउंट के नियम शुरू करेगा" },
      { what: "प्रदाता अकाउंट देना शुरू करेंगे (सरकार की योजना; बिल 1 जनवरी 2027 की अनुमति देता है)" },
    ],
    afterAct: "Act के बाद",
    providersTitle: "कौन इसे दे सकता है",
    providersBody:
      "सिर्फ़ विनियमित कंपनियाँ: MiFID के तहत अधिकृत निवेश कंपनियाँ और ब्रोकर, निवेश की अनुमति वाले बैंक, फ़ंड मैनेजमेंट कंपनियाँ, और बीमा-आधारित प्रोडक्ट के लिए बीमा कंपनियाँ। EEA के दूसरे देशों की कंपनियाँ भी इसे दे सकती हैं, बशर्ते वे आपके लिए आयरिश टैक्स सँभालें। हर प्रदाता को Revenue में पंजीकरण कराना होगा, जो सूची प्रकाशित करेगा। क्रेडिट यूनियन इसमें शामिल होना चाहती हैं, पर बिल में बताए गए प्रकारों में वे नहीं हैं।",
    noBrands: "हम किसी ब्रांड का नाम नहीं लेते। अभी किसी ने क़ीमतें प्रकाशित नहीं की हैं, और सूची सिफ़ारिश जैसी लगेगी।",
    faqTitle: "सवाल",
    faqs: [
      {
        q: "क्या मेरा पैसा गारंटीशुदा है?",
        a: "नहीं। यह अकाउंट एक टैक्स व्यवस्था है, कोई सरकारी बचत योजना नहीं। इसमें शेयर, बॉन्ड और फ़ंड होते हैं, जो गिर सकते हैं, और आपको जमा से कम वापस मिल सकता है। जिस साल अकाउंट में नुक़सान हो, उस साल भी औसत मूल्य {threshold} से ऊपर हो तो 1% देना पड़ सकता है।",
      },
      {
        q: "क्या मैं पैसा निकाल सकता हूँ?",
        a: "हाँ, कभी भी, बिना लॉक-इन और बिना निकासी पर टैक्स के। निकाला गया पैसा उस साल के {limit} में से कुछ भी ख़ाली नहीं करता: सीमा में सारा जमा गिना जाता है।",
      },
      {
        q: "क्या मैं अपने मौजूदा शेयर या ETF इसमें डाल सकता हूँ?",
        a: "नहीं। सिर्फ़ पैसा जमा किया जा सकता है, इसलिए आपको पहले उन्हें बेचना होगा, जो अकाउंट के बाहर टैक्स योग्य बिक्री हो सकती है।",
      },
      {
        q: "अगर मैं एक साल में {limit} से ज़्यादा जमा कर दूँ तो?",
        a: "अतिरिक्त राशि पर निकालने तक, आगे के सालों में भी, हर महीने 1% लगता है, और प्रदाता पर जुर्माना लगता है, इसलिए प्रदाता शायद आपको सीमा पार नहीं करने देंगे।",
      },
      {
        q: "क्या कोई दंपती एक अकाउंट साझा कर सकता है?",
        a: "नहीं, संयुक्त अकाउंट की अनुमति नहीं है। हर वयस्क अपना अलग रख सकता है, इसलिए दंपती के पास दोनों को मिलाकर {double} की टैक्स-मुक्त गुंजाइश होती है।",
      },
      {
        q: "अगर मैं विदेश चला जाऊँ तो?",
        a: "अपने प्रदाता को बताएँ। अकाउंट खुला रहता है, पर निवासी न रहने तक आप इसमें जमा नहीं कर सकते या इसे दूसरे प्रदाता के पास नहीं ले जा सकते।",
      },
      {
        q: "किसी की मृत्यु होने पर क्या होता है?",
        a: "उनके क़ानूनी प्रतिनिधि इसे सँभालते हैं। आगे कुछ जमा नहीं हो सकता, और प्रोबेट या एडमिनिस्ट्रेशन मिलने के एक साल के भीतर, या मृत्यु की तीसरी बरसी तक, जो भी पहले हो, निवेश बेचने होते हैं। तब तक जो नहीं बिका, उसे बाज़ार मूल्य पर बिका हुआ माना जाता है।",
      },
      {
        q: "क्या यह ब्रिटेन के ISA जैसा है?",
        a: "नहीं। यह स्वीडन के ISK के ज़्यादा क़रीब है: बड़ी सीमा वाले पूरी तरह टैक्स-मुक्त ढाँचे की जगह मूल्य पर छोटा सालाना टैक्स।",
      },
    ],
    seeAlso: "यह भी देखें",
    related: [
      { label: "निवेश प्लानर", body: "टैक्स के बाद के रिटर्न के हिसाब से आयरलैंड के 32 विकल्पों की तुलना करें" },
      { label: "CGT कैलकुलेटर", body: "अकाउंट के बाहर शेयर बेचने पर टैक्स, 31% की दर से" },
      { label: "बजट 2027", body: "बाक़ी बदलाव" },
      { label: "बचत और निवेश पर टैक्स कैसे लगता है", body: "विस्तृत गाइड, अंग्रेज़ी में" },
    ],
    ccpc: { label: "CCPC Investment Readiness Tool", body: "आप निवेश के लिए तैयार हैं या नहीं, इसकी छोटी जाँच (अंग्रेज़ी में)" },
    sourcesTitle: "स्रोत",
    disclaimer:
      "केवल सामान्य जानकारी, वित्तीय, टैक्स या क़ानूनी सलाह नहीं। नियम 19 अक्टूबर 2026 को प्रकाशित Finance (No. 2) Bill 2026 के अनुसार हैं, और क़ानून बनने से पहले बदल सकते हैं। यह अकाउंट सरकारी गारंटी नहीं है: निवेश बढ़ भी सकते हैं और घट भी सकते हैं।",
    calc: {
      opens: "अकाउंट खुलने की तारीख़",
      first: "खुलते समय जमा",
      monthly: "हर महीने",
      monthlyHint: "महीने की 1 तारीख़ को, खुलने वाले महीने से।",
      yearly: "हर जनवरी अतिरिक्त",
      yearlyHint: "दूसरे साल से।",
      until: "किस साल की 31 दिसंबर तक रखें",
      growth: "सालाना बढ़त (आपका अनुमान)",
      growthHint:
        "यह पूर्वानुमान नहीं है। फ़ंड के अपने शुल्क के बाद निवेश की बढ़त। असली रिटर्न ऊपर-नीचे होते हैं, और नकारात्मक भी हो सकते हैं।",
      fee: "प्रदाता की सालाना फ़ीस",
      feeHint: "किसी प्रदाता ने क़ीमतें प्रकाशित नहीं की हैं। उद्योग के सूत्र बिना सलाह के लगभग 0.5% और सलाह के साथ 1.5% तक की उम्मीद करते हैं।",
      paid: "आपकी जमा",
      growthTile: "बढ़त",
      growthAfterFees: "बढ़त, फ़ीस के बाद",
      taxTile: "1% टैक्स, सभी साल",
      valueOn: "31 दिसंबर {year} को मूल्य",
      noTax: "किसी भी साल औसत मूल्य {threshold} से ऊपर नहीं जाता, इसलिए कोई टैक्स नहीं बनता।",
      firstTax: "1% पहली बार {year} में लगता है, पहला साल जब औसत मूल्य {threshold} से ऊपर जाता है।",
      share: "पूरी अवधि में टैक्स बढ़त का {share} बनता है।",
      noWithdrawalTax: "पैसा निकालने पर टैक्स नहीं लगता।",
      refused:
        "आपकी योजना की जमा में से {refused} अपने कैलेंडर साल की {limit} सीमा से ऊपर है, इसलिए छोड़ दिया गया है। उम्मीद है कि प्रदाता इसे लौटा देंगे: सीमा से ऊपर के पैसे पर निकालने तक हर महीने 1% लगता है।",
      cols: {
        year: "साल",
        days: "खुले दिन",
        paidIn: "जमा",
        growth: "बढ़त",
        average: "औसत मूल्य",
        tax: "1% टैक्स",
        end: "31 दिसं. को मूल्य",
      },
      how: "यह कैसे निकाला जाता है",
      howItems: [
        "अकाउंट के खुले रहने के हर कैलेंडर दिन के अंत में, सप्ताहांत समेत, उसका मूल्य लगाया जाता है। औसत मूल्य उन दैनिक मूल्यों का जोड़ दिनों की संख्या से भाग देकर निकलता है (धारा 747Q(5))।",
        "साल का टैक्स: (औसत मूल्य − {threshold}) × 1%, शून्य से कम हो तो शून्य (747Q(4) और (7))। खुलने वाले साल में औसत में सिर्फ़ खुले रहने के दिन आते हैं, और {threshold} कम नहीं किया जाता।",
        "यहाँ टैक्स 31 दिसंबर को अकाउंट से काटा जाता है। क़ानून प्रदाता को इसे अकाउंट से या आपकी सहमति से किसी और तरीक़े से लेने और 14 अप्रैल तक Revenue को चुकाने देता है (747Q(6), 747T)।",
        "हर कैलेंडर साल में अधिकतम {limit} जमा होता है, चाहे जितना निकाला जाए (747H, 747L)। जमा महीने की 1 तारीख़ को होती है।",
        "बढ़त और प्रदाता की फ़ीस दिनों में बराबर बाँटी जाती है, इसलिए पूरे साल में ठीक आपकी चुनी दर से बढ़त होती है, फ़ीस घटाकर। बढ़त फ़ीस के बाद और इस टैक्स से पहले दिखाई जाती है।",
        "और किसी चीज़ पर टैक्स नहीं: अकाउंट के अंदर एग्ज़िट टैक्स, CGT, डिविडेंड विदहोल्डिंग टैक्स या डीम्ड डिस्पोज़ल नहीं, और पैसा निकालने पर भी कुछ नहीं (747P, Finance Bill s.27)।",
      ],
      source: "स्रोत:",
      sourceLink: "Finance (No. 2) Bill 2026, धारा 26, नया Part 27A",
      illustration:
        "सिर्फ़ उदाहरण, सलाह नहीं। यह हर साल एक ही स्थिर रिटर्न मानता है; असली रिटर्न बदलते हैं और नकारात्मक हो सकते हैं। नियम Finance (No. 2) Bill 2026 के अनुसार हैं और क़ानून बनने से पहले बदल सकते हैं।",
    },
  },
};
