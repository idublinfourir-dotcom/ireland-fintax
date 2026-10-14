import type { Translations } from "../i18n";

/* The chrome every calculator page shares: tab headings, breadcrumbs, the
   rate stamp and disclaimer, and the line pointing at the newest Budget.
   {date} and {budget} are filled in at runtime. */

const en = {
  calculatorsHeading: "Ireland calculators",
  personalHeading: "Personal Finance Tools",
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
    calculatorsHeading: "Calculadoras para Irlanda",
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
    calculatorsHeading: "Calculadoras para a Irlanda",
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
    calculatorsHeading: "Áireamháin d’Éirinn",
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
};
