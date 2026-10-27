import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Spanish (neutral, tú). USC, PRSI, CGT and CAT stay as Revenue writes them:
   they are the names on Irish payslips and forms. */
export const es: Messages = {
  meta: {
    title: "Irish Fintax: aprende gratis sobre impuestos y dinero",
    description:
      "Calculadoras, guías y plantillas gratuitas que explican los impuestos y las finanzas personales en Irlanda con palabras sencillas: impuesto sobre la renta, IVA, CGT, hipotecas, inversiones y cómo crear una empresa.",
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
    skip: "Saltar al contenido",
    closeMenu: "Cerrar menú",
    language: "Idioma",
    tools: toolNames.es,
  },

  footer: {
    blurb:
      "Calculadoras, guías y plantillas gratuitas que explican los impuestos y las finanzas personales en Irlanda con palabras sencillas.",
    explore: "Explorar",
    links: {
      budget: "Presupuesto",
      calculators: "Calculadoras de impuestos",
      personal: "Finanzas personales",
      accounts: "Centro de contabilidad",
      blog: "Análisis",
      about: "Quiénes somos",
      faq: "Preguntas frecuentes",
      ask: "Haz una pregunta",
    },
    getInTouch: "Contacto",
    language: "Idioma",
    rights: "Todos los derechos reservados.",
    disclaimer: "Solo información general, no es asesoramiento financiero, fiscal ni legal.",
  },

  hero: {
    eyebrow: "Aprende finanzas gratis · Irlanda",
    title: "Entiende los impuestos y el dinero, *con palabras sencillas.*",
    lede:
      "Calculadoras, guías y plantillas gratuitas sobre impuestos en Irlanda, hipotecas, inversiones y cómo crear una empresa. Aprende cómo funciona y luego haz tus propios números.",
    cta: "Prueba las calculadoras",
    ask: "Haz una pregunta",
  },

  quickEntries: [
    { title: "Calculadoras de impuestos", note: "Impuesto sobre la renta, IVA, CGT, CAT y más, para Irlanda." },
    { title: "Finanzas personales", note: "Calcula una hipoteca y compara formas de invertir." },
    { title: "Crear una empresa", note: "Notas, plantillas y guías para emprendedores." },
    { title: "Haz una pregunta", note: "¿Te has atascado? Pregunta y te lo explicamos." },
  ],

  who: {
    eyebrow: "Un poco sobre nosotros",
    title: "Primero entender. Después decidir.",
    body: "Irish Fintax es una web gratuita para aprender sobre impuestos y finanzas personales. Lee una explicación clara, explora las herramientas y aprende a tu propio ritmo.",
    more: "Conoce Irish Fintax",
    caption: "Haz sitio para ver las cosas más claras.",
    principles: [
      { title: "Gratis para explorar", note: "No hace falta pagar ni crear una cuenta para empezar." },
      { title: "Palabras sencillas", note: "La explicación de todos los días, con los términos técnicos cuando ayudan." },
      { title: "Fuentes que puedes seguir", note: "Consulta las fuentes públicas que hay detrás de las normas." },
      { title: "Aprender, no asesorar", note: "Para decisiones personales, habla con un asesor regulado." },
    ],
  },

  budget: {
    eyebrow: "{budget} · Explicado",
    title: "El Presupuesto es enorme. Empieza por *lo que te importa.*",
    body: "¿Alquilas, compras, ahorras para la jubilación o estás formando una familia? Explora los cambios del Presupuesto que tienen que ver con tu situación.",
    cta: "Explora el {budget}",
    cardEyebrow: "Tu vida. Tus preguntas.",
    topics: ["Vivienda y alquiler", "Trabajo e ingresos", "Familia", "Ahorro y pensiones"],
    caption: "Una visión más clara de lo que cambia.",
  },

  calculators: {
    eyebrow: "Herramientas gratuitas para pensar con claridad",
    title: "Convierte tus preguntas en números.",
    lede: "Elige una calculadora. Cambia los datos. Entiende qué se mueve.",
    caption: "Tus números. Una imagen más clara.",
    items: [
      { name: "Impuesto sobre la renta", note: "Explora tu sueldo neto." },
      { name: "IVA", note: "Entiende el IVA a pagar o a devolver." },
      { name: "Impuesto de sociedades", note: "Explora el impuesto sobre los beneficios de una empresa." },
      { name: "Ganancias de capital", note: "Entiende el impuesto cuando vendes un bien." },
      { name: "Donaciones y herencias", note: "Explora el Capital Acquisitions Tax (CAT)." },
      { name: "Hipoteca", note: "Compara cuotas antes de decidir." },
    ],
    footnote: "Las calculadoras son herramientas de aprendizaje. Revisa los supuestos y las fuentes en la página de cada herramienta.",
  },

  learn: {
    eyebrow: "Una forma sencilla de aprender",
    title: "De “¿qué significa eso?” a “*ahora lo entiendo*.”",
    items: [
      { title: "Aprende lo básico", note: "Empieza con guías y notas que explican las normas con palabras de todos los días.", link: "Explora las guías" },
      { title: "Prueba tus números", note: "Usa las calculadoras para ver cómo distintas cifras cambian el resultado.", link: "Busca una calculadora" },
      { title: "Pregunta lo que no esté claro", note: "Envía tu pregunta con tus propias palabras. No necesitas los términos técnicos.", link: "Haz una pregunta" },
    ],
  },

  faq: {
    eyebrow: "Antes de empezar",
    title: "Algunas cosas que quizá te preguntes.",
    items: [
      { question: "¿Irish Fintax es gratis de verdad?", answer: "Sí. Puedes explorar calculadoras, guías y plantillas sin pagar, y hacer una pregunta también es gratis." },
      { question: "¿Necesito una cuenta?", answer: "No hace falta una cuenta para empezar a explorar. Si inicias sesión, puedes guardar tus preguntas y respuestas en un mismo sitio." },
      { question: "¿Esto es asesoramiento financiero o fiscal?", answer: "No. La web ofrece información general para aprender. Habla con un asesor debidamente cualificado sobre las decisiones que dependen de tu situación." },
      { question: "¿Por dónde empiezo?", answer: "Empieza por una calculadora si tienes cifras que explorar, por el Centro de contabilidad si buscas guías, o haz una pregunta si necesitas ayuda para entender un tema." },
    ],
  },

  cta: {
    eyebrow: "No existen las preguntas básicas",
    title: "¿Todavía intentando entenderlo? *Empecemos por tu pregunta.*",
    body: "Pregunta sobre impuestos o dinero con tus propias palabras.",
    button: "Haz una pregunta",
  },
};
