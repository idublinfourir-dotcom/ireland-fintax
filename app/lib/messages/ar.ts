import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Arabic (Modern Standard Arabic), for the Arabic-speaking community in
   Ireland. Written right to left: the root layout sets dir="rtl". USC, PRSI,
   CGT and CAT stay as Revenue writes them, with the Arabic name beside them
   where the reader needs it. */
export const ar: Messages = {
  meta: {
    title: "Irish Fintax: تعلّم الضرائب والمال",
    description:
      "حاسبات وأدلة ونماذج تشرح الضرائب والتمويل الشخصي في أيرلندا بلغة بسيطة: ضريبة الدخل وضريبة القيمة المضافة وضريبة الأرباح الرأسمالية والرهن العقاري والاستثمار وتأسيس شركة.",
  },

  header: {
    taxHub: "حاسبات الضرائب",
    calculatorsHeading: "حاسبات أيرلندا",
    openCalculators: "افتح الحاسبات",
    accounts: "مركز المحاسبة",
    founderHeading: "موارد لروّاد الأعمال",
    browseAccounts: "تصفّح مركز المحاسبة",
    founderResources: [
      { label: "مذكرات", desc: "ملاحظات فنية حول الأسئلة الشائعة" },
      { label: "نماذج", desc: "كشوفات وحسابات وقوائم تحقق" },
      { label: "النماذج الضريبية", desc: "شرح نماذج Revenue خطوة بخطوة" },
      { label: "نماذج ضريبة القيمة المضافة", desc: "التسجيل ودورة الإقرارات" },
      { label: "أدلة التأسيس", desc: "تأسيس شركة وإدارتها" },
    ],
    personal: "التمويل الشخصي",
    personalHeading: "التمويل الشخصي",
    openPersonal: "افتح التمويل الشخصي",
    budget: "شرح الميزانية",
    blog: "مقالات",
    about: "من نحن",
    investmentAccount: "حساب الاستثمار الأيرلندي",
    adminDashboard: "لوحة الإدارة",
    myDashboard: "لوحتي",
    account: "الحساب",
    signIn: "تسجيل الدخول",
    ask: "اطرح سؤالًا",
    openMenu: "افتح القائمة",
    submenu: "قائمة {label}",
    skip: "انتقل إلى المحتوى",
    closeMenu: "أغلق القائمة",
    language: "اللغة",
    tools: toolNames.ar,
  },

  footer: {
    blurb:
      "حاسبات وأدلة ونماذج تشرح الضرائب والتمويل الشخصي في أيرلندا بلغة بسيطة.",
    getInTouch: "تواصل معنا",
    language: "اللغة",
    suite: "الضرائب القانونية",
    resources: "موارد",
    company: "المنصّة",
    links: {
      incomeTax: "ضريبة الدخل وPAYE",
      corporationTax: "ضريبة الشركات (12.5%)",
      cgt: "ضريبة الأرباح الرأسمالية",
      cat: "ضريبة الهبات والمواريث (CAT)",
      rd: "إعفاءات البحث والتطوير، المادة 766",
      mortgage: "الرهن العقاري والاقتراض",
      investment: "الاستثمار والبيع الافتراضي",
      budget: "مركز {budget}",
      calendar: "التقويم الضريبي",
      about: "من نحن",
      news: "الأخبار والمستجدات",
      contact: "اتصل بنا",
      method: "المنهجية والمعايير",
      report: "أبلغ عن مشكلة",
    },
    disclaimer: "معلومات عامة فقط، وليست نصيحة مالية أو ضريبية أو قانونية.",
    sources: "المصادر: Revenue.ie وCCPC والبنك المركزي الأيرلندي.",
    privacy: "خصوصية البيانات",
    sitemap: "خريطة الموقع XML",
  },

  cta: {
    eyebrow: "لا يوجد سؤال بسيط أكثر من اللازم",
    title: "ما زلت تحاول فهم الأمر؟ *لنبدأ بسؤالك.*",
    body: "اسأل عن الضرائب أو المال بكلماتك.",
    button: "اطرح سؤالًا",
  },
};
