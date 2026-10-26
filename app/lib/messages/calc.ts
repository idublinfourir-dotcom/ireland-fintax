import type { Translations } from "../i18n";

/* The chrome every calculator page shares: tab headings, breadcrumbs, the
   rate stamp and disclaimer, and the line pointing at the newest Budget.
   {date} and {budget} are filled in at runtime. */

const en = {
  calculatorsHeading: "Tax Calculators",
  personalHeading: "Personal Finance",
  home: "Home",
  tools: "Tools",
  personal: "Personal",
  ratesAsOf: "Rates current as of {date}.",
  figuresAsOf: "Figures current as of {date}.",
  source: "Source: revenue.ie",
  disclaimer:
    "This is an indicative estimate only, not tax advice. Figures are general and may not reflect reliefs, exemptions or your specific circumstances. Confirm any figure with a qualified adviser or {link} before acting on it.",
  noAmount: "No amount entered yet",
  budgetLink: "See what {budget} changes for you →",
  /* Screen-reader names for the breadcrumb, the main menu and the back-to-top button. */
  breadcrumb: "Breadcrumb",
  mainNav: "Main",
  backToTop: "Back to top",
};

export type CalcMessages = typeof en;

export const calcMessages: Translations<CalcMessages> = {
  en,
  es: {
    calculatorsHeading: "Calculadoras de impuestos",
    personalHeading: "Finanzas personales",
    home: "Inicio",
    tools: "Herramientas",
    personal: "Personal",
    ratesAsOf: "Tipos vigentes a {date}.",
    figuresAsOf: "Cifras vigentes a {date}.",
    source: "Fuente: revenue.ie",
    disclaimer:
      "Esto es solo una estimación orientativa, no asesoramiento fiscal. Las cifras son generales y puede que no reflejen deducciones, exenciones ni tus circunstancias concretas. Confirma cualquier cifra con un asesor cualificado o en {link} antes de actuar.",
    noAmount: "Aún no has introducido ninguna cantidad",
    budgetLink: "Mira qué cambia para ti el {budget} →",
    breadcrumb: "Ruta de navegación",
    mainNav: "Principal",
    backToTop: "Volver arriba",
  },
  pt: {
    calculatorsHeading: "Calculadoras de impostos",
    personalHeading: "Finanças pessoais",
    home: "Início",
    tools: "Ferramentas",
    personal: "Pessoal",
    ratesAsOf: "Alíquotas vigentes em {date}.",
    figuresAsOf: "Números vigentes em {date}.",
    source: "Fonte: revenue.ie",
    disclaimer:
      "Esta é apenas uma estimativa indicativa, não aconselhamento fiscal. Os números são gerais e podem não refletir isenções, deduções ou a sua situação específica. Confirme qualquer número com um consultor qualificado ou em {link} antes de agir.",
    noAmount: "Nenhum valor informado ainda",
    budgetLink: "Veja o que o {budget} muda para você →",
    breadcrumb: "Trilha de navegação",
    mainNav: "Principal",
    backToTop: "Voltar ao topo",
  },
  ga: {
    calculatorsHeading: "Áireamháin chánach",
    personalHeading: "Airgeadas pearsanta",
    home: "Baile",
    tools: "Uirlisí",
    personal: "Pearsanta",
    ratesAsOf: "Rátaí reatha amhail {date}.",
    figuresAsOf: "Figiúirí reatha amhail {date}.",
    source: "Foinse: revenue.ie",
    disclaimer:
      "Meastachán táscach amháin é seo, ní comhairle chánach. Is figiúirí ginearálta iad agus b’fhéidir nach léiríonn siad faoisimh, díolúintí ná do chúinsí féin. Deimhnigh aon fhigiúr le comhairleoir cáilithe nó ar {link} sula ngníomhaíonn tú air.",
    noAmount: "Níl aon mhéid curtha isteach fós",
    budgetLink: "Féach cad a athraíonn {budget} duit →",
    breadcrumb: "Rian nascleanúna",
    mainNav: "Príomh",
    backToTop: "Ar ais go barr",
  },
  ar: {
    calculatorsHeading: "حاسبات الضرائب",
    personalHeading: "التمويل الشخصي",
    home: "الرئيسية",
    tools: "الأدوات",
    personal: "شخصي",
    ratesAsOf: "المعدلات سارية حتى {date}.",
    figuresAsOf: "الأرقام سارية حتى {date}.",
    source: "المصدر: revenue.ie",
    disclaimer:
      "هذا تقدير إرشادي فقط، وليس نصيحة ضريبية. الأرقام عامة وقد لا تعكس الإعفاءات أو الاستثناءات أو ظروفك الخاصة. تحقق من أي رقم مع مستشار مؤهل أو {link} قبل أن تتصرف بناءً عليه.",
    noAmount: "لم يُدخل أي مبلغ بعد",
    budgetLink: "اعرف ما الذي تغيّره {budget} بالنسبة لك ←",
    breadcrumb: "مسار التنقل",
    mainNav: "الرئيسية",
    backToTop: "العودة إلى الأعلى",
  },
  bn: {
    calculatorsHeading: "কর ক্যালকুলেটর",
    personalHeading: "ব্যক্তিগত অর্থ",
    home: "হোম",
    tools: "টুলস",
    personal: "ব্যক্তিগত",
    ratesAsOf: "হারগুলো {date} অনুযায়ী হালনাগাদ।",
    figuresAsOf: "অঙ্কগুলো {date} অনুযায়ী হালনাগাদ।",
    source: "উৎস: revenue.ie",
    disclaimer:
      "এটি শুধু একটি আনুমানিক হিসাব, কর পরামর্শ নয়। অঙ্কগুলো সাধারণ, এবং এতে ছাড়, অব্যাহতি বা আপনার নির্দিষ্ট পরিস্থিতি প্রতিফলিত নাও হতে পারে। কোনো অঙ্কের ওপর ভিত্তি করে কিছু করার আগে একজন যোগ্য উপদেষ্টা বা {link}-এর সঙ্গে মিলিয়ে নিন।",
    noAmount: "এখনও কোনো অঙ্ক দেওয়া হয়নি",
    budgetLink: "{budget} আপনার জন্য কী বদলায় দেখুন →",
    breadcrumb: "ব্রেডক্রাম্ব",
    mainNav: "প্রধান",
    backToTop: "ওপরে ফিরে যান",
  },
  hi: {
    calculatorsHeading: "टैक्स कैलकुलेटर",
    personalHeading: "निजी वित्त",
    home: "होम",
    tools: "टूल्स",
    personal: "निजी",
    ratesAsOf: "दरें {date} तक की हैं।",
    figuresAsOf: "आँकड़े {date} तक के हैं।",
    source: "स्रोत: revenue.ie",
    disclaimer:
      "यह केवल एक अनुमान है, टैक्स सलाह नहीं। आँकड़े सामान्य हैं और हो सकता है इनमें राहतें, छूटें या आपकी ख़ास स्थिति शामिल न हो। किसी भी आँकड़े पर अमल करने से पहले किसी योग्य सलाहकार या {link} से पुष्टि कर लें।",
    noAmount: "अभी कोई राशि नहीं डाली गई",
    budgetLink: "देखें {budget} आपके लिए क्या बदलता है →",
    breadcrumb: "ब्रेडक्रम्ब",
    mainNav: "मुख्य",
    backToTop: "ऊपर जाएँ",
  },
};
