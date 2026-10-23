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
    taxHub: "Calculadoras de impuestos",
    calculatorsHeading: "Calculadoras para Irlanda",
    openCalculators: "Abrir las calculadoras",
    accounts: "Centro de contabilidad",
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
    budget: "El Presupuesto explicado",
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
    eyebrow: "Quiénes somos",
    title: "Un lugar gratuito para aprender cómo funcionan los impuestos y el dinero en Irlanda.",
    body: [
      "Irish Fintax es una plataforma de aprendizaje gratuita. Explicamos los impuestos y las finanzas personales en Irlanda con palabras sencillas y te damos calculadoras para probar tus propios números, para que entiendas lo que pasa antes de decidir nada.",
      "Sin cuotas, nada que venderte y sin registro para empezar.",
    ],
    more: "Más sobre nosotros",
    principles: [
      { title: "Gratis, para todos", note: "Todas las calculadoras, guías y plantillas son gratuitas, y no necesitas una cuenta para empezar." },
      { title: "Palabras sencillas", note: "Las normas explicadas como se las explicarías a un amigo, sin jerga." },
      { title: "Basado en fuentes públicas", note: "Las calculadoras usan los tipos publicados por Revenue y enlazan al origen de cada cifra." },
      { title: "Información, no asesoramiento", note: "Te ayudamos a entender. Para una decisión que depende de tu situación, consulta a un asesor regulado." },
    ],
  },

  promos: {
    budget: {
      title: "¿Qué cambia para ti el {budget}?",
      body: "Marca lo que se aplica a tu caso, desde alquilar o comprar tu primera vivienda hasta una pensión, un coche o una familia, y ve solo los cambios que te afectan, en euros cuando las normas permiten calcularlo con exactitud. Basado en las cifras oficiales y calculado en tu navegador.",
      cta: "Mira qué cambia para ti",
    },
    calculators: {
      eyebrow: "Calculadoras",
      title: "No te quedes en la teoría. Haz tus propios números.",
      body: "Impuesto sobre la renta, IVA, CGT, CAT, impuesto de sociedades y más, todo con los tipos irlandeses. Cambia una cifra y mira qué pasa: es la forma más rápida de entender cómo funciona de verdad un impuesto.",
      cta: "Prueba las calculadoras",
    },
    company: {
      eyebrow: "Centro de contabilidad",
      title: "¿Vas a crear una empresa? Empieza aquí.",
      body: "Notas, plantillas, formularios de impuestos e IVA y guías paso a paso para Irlanda y el Reino Unido. Todo gratis: dinos cuál necesitas y te lo enviamos por correo.",
      cta: "Ver el Centro de contabilidad",
    },
  },

  learn: {
    eyebrow: "Cómo aprender aquí",
    title: "Apréndelo, pruébalo, *pregunta.*",
    lede: "Empieza por donde prefieras. La mayoría lee un poco, hace sus propios números y solo pregunta cuando algo todavía no cuadra.",
    items: [
      { title: "Aprende", note: "Notas y guías con palabras sencillas sobre lo que de verdad cuesta entender." },
      { title: "Prueba", note: "Pon tus propias cifras en las calculadoras y mira qué cambia." },
      { title: "Pregunta", note: "¿Sigues con dudas? Pregunta con tus propias palabras y recibe la respuesta por correo." },
    ],
  },

  audiences: {
    eyebrow: "Para quién es",
    title: "Sea lo que sea, empieza aquí.",
    lede: "Las dudas sobre impuestos y dinero suelen llegar con los cambios de la vida. Estos son los que cubre hoy la web.",
    items: [
      { name: "Empleados", note: "Mira tu sueldo neto y qué significan para él los cambios del Presupuesto." },
      { name: "Autónomos", note: "Cuándo darte de alta en el IVA, qué tipo se aplica y el ciclo de declaraciones." },
      { name: "Fundadores de empresas", note: "Impuesto de sociedades, el crédito por I+D, amortizaciones fiscales y guías para empezar." },
      { name: "Inversores y caseros", note: "Ganancias de capital en acciones o inmuebles, y opciones de inversión comparadas." },
      { name: "Familias", note: "Donaciones y herencias, y los umbrales exentos que se aplican." },
      { name: "Compradores de vivienda", note: "Calcula una hipoteca antes de hablar con un banco." },
    ],
  },

  process: {
    eyebrow: "Haz una pregunta",
    title: "¿Tienes una pregunta? Así funciona.",
    lede: "Si las calculadoras y las guías no lo cubren, pregunta. Es gratis, y ninguna pregunta es demasiado básica.",
    steps: [
      { title: "Elige un tema", description: "Impuesto sobre la renta, IVA, una hipoteca, crear una empresa: lo que sea." },
      { title: "Pregunta con tus palabras", description: "Sin jerga. Pregúntalo como se lo preguntarías a un amigo." },
      { title: "Recibe una respuesta clara", description: "Una persona real la lee y responde por correo." },
      { title: "Todo en un mismo sitio", description: "Pregunta con la sesión iniciada y cada respuesta se queda en tu cuenta gratuita." },
    ],
  },

  faq: {
    eyebrow: "Preguntas frecuentes",
    title: "Preguntas, respuestas directas.",
    items: [
      { question: "¿De verdad es gratis?", answer: "Sí. Todas las calculadoras, guías y plantillas son de uso gratuito, y hacer una pregunta también." },
      { question: "¿Esto es asesoramiento financiero o fiscal?", answer: "No. Todo lo que hay aquí es información general para ayudarte a entender cómo funcionan las cosas. Los tipos y las normas cambian y tu situación importa, así que consulta con Revenue o con un asesor cualificado y regulado antes de tomar una decisión importante." },
      { question: "¿Necesito una cuenta?", answer: "No. Las calculadoras y las guías están abiertas a todos. Una cuenta gratuita solo sirve para las preguntas: si preguntas con la sesión iniciada, tus preguntas y nuestras respuestas quedan juntas en un mismo sitio." },
      { question: "¿Solo trata de Irlanda?", answer: "Casi siempre. Las calculadoras usan los tipos y las normas de Irlanda, y algunos recursos para emprendedores también cubren el Reino Unido." },
    ],
  },

  cta: {
    eyebrow: "Haz una pregunta",
    title: "¿Te has atascado con algo?",
    body: "Pregunta sobre impuestos o dinero como se lo preguntarías a un amigo y te responderemos por correo con una explicación clara. Es gratis.",
    button: "Haz una pregunta",
  },
};
