import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Spanish (neutral, tú). USC, PRSI, CGT and CAT stay as Revenue writes them:
   they are the names on Irish payslips and forms. */
export const es: Messages = {
  meta: {
    title: "Irish Fintax: aprende sobre impuestos y dinero",
    description:
      "Calculadoras, guías y plantillas que explican los impuestos y las finanzas personales en Irlanda con palabras sencillas: impuesto sobre la renta, IVA, CGT, hipotecas, inversiones y cómo crear una empresa.",
  },

  header: {
    taxHub: "Calculadoras",
    calculatorsHeading: "Calculadoras para Irlanda",
    openCalculators: "Abrir las calculadoras",
    accounts: "Contabilidad",
    founderHeading: "Recursos para emprendedores",
    browseAccounts: "Ver el Centro de contabilidad",
    founderResources: [
      { label: "Notas", desc: "Notas técnicas sobre dudas frecuentes" },
      { label: "Plantillas", desc: "Estados, cálculos y listas de control" },
      { label: "Formularios fiscales", desc: "Guías de los formularios de Revenue" },
      { label: "Formularios de IVA", desc: "Alta y el ciclo de declaraciones" },
      { label: "Guías para empezar", desc: "Crear y gestionar una empresa" },
    ],
    personal: "Finanzas personales",
    personalHeading: "Finanzas personales",
    openPersonal: "Abrir Finanzas personales",
    budget: "Presupuesto",
    blog: "Análisis",
    about: "Quiénes somos",
    investmentAccount: "Cuenta de inversión IE",
    adminDashboard: "Panel de administración",
    myDashboard: "Mi panel",
    account: "Cuenta",
    signIn: "Iniciar sesión",
    ask: "Haz una pregunta",
    openMenu: "Abrir menú",
    submenu: "Menú de {label}",
    skip: "Saltar al contenido",
    closeMenu: "Cerrar menú",
    language: "Idioma",
    tools: toolNames.es,
  },

  footer: {
    blurb:
      "Calculadoras, guías y plantillas que explican los impuestos y las finanzas personales en Irlanda con palabras sencillas.",
    getInTouch: "Contacto",
    language: "Idioma",
    suite: "Impuestos",
    resources: "Recursos",
    company: "Empresa",
    links: {
      incomeTax: "Renta y PAYE",
      corporationTax: "Impuesto de sociedades (12,5%)",
      cgt: "Ganancias de capital",
      cat: "Donaciones y herencias (CAT)",
      rd: "Créditos de I+D, sección 766",
      mortgage: "Hipoteca y préstamo",
      investment: "Inversión y venta presunta",
      budget: "Centro del {budget}",
      calendar: "Calendario fiscal",
      about: "Quiénes somos",
      news: "Noticias y novedades",
      contact: "Contacto",
      method: "Método y estándares",
      report: "Informar de un error",
    },
    disclaimer: "Solo información general, no es asesoramiento financiero, fiscal ni legal.",
    sources: "Fuentes: Revenue.ie, la CCPC y el Banco Central de Irlanda.",
    privacy: "Privacidad de datos",
    sitemap: "Mapa del sitio XML",
  },

  cta: {
    eyebrow: "No existen las preguntas básicas",
    title: "¿Todavía intentando entenderlo? *Empecemos por tu pregunta.*",
    body: "Pregunta sobre impuestos o dinero con tus propias palabras.",
    button: "Haz una pregunta",
  },
};
