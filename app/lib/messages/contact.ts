import type { Translations } from "../i18n";

/* The contact page, its question wizard and the action's errors.
   `faqs` pairs by index with CONTACT_FAQS (lib/contact-faqs.ts), which keeps
   the hrefs; each language matches its own keywords against what is typed.
   Topic chips submit the ENGLISH label (the admin inbox reads it); `topics`
   only changes what is shown, keyed by that English label. */

const en = {
  meta: {
    title: "Ask a question",
    description:
      "Ask a question about Irish tax or personal finance and get a plain-English answer by email. Free.",
  },
  hero: {
    eyebrow: "Ask a question",
    title: "Ask us anything about tax and money.",
    lede: "No question is too basic. Ask it the way you’d ask a friend and we’ll explain it in plain English. It’s free.",
  },
  nextHeading: "What happens next",
  nextSteps: [
    "Pick a topic and ask it in your own words.",
    "A real person reads it and replies by email, in plain English.",
    "Ask while signed in and your questions and answers stay in your account.",
  ],
  preferEmail: "Prefer email?",

  form: {
    steps: [
      { title: "Topic", prompt: "What's your question about?", sub: "Pick the closest topic: you can ask your question next." },
      { title: "Your question", prompt: "What would you like to know?", sub: "A sentence or two is plenty. Ask it the way you'd ask a friend." },
      { title: "Your details", prompt: "Where should we send the answer?", sub: "A real person reads every question and replies by email." },
    ],
    stepOf: "Step {n} of {total}",
    notSure: "Not sure yet",
    startingCompany: "Starting a company",
    chooseTopic: "Choose a topic",
    askLegend: "Ask your question",
    questionLabel: "Your question",
    questionPlaceholder: "e.g. How is capital gains tax worked out when I sell shares?",
    mightHelp: "While you’re here, this might help",
    detailsLegend: "Your contact details",
    nameLabel: "Your name",
    namePlaceholder: "Jane Smith",
    emailLabel: "Email",
    emailPlaceholder: "jane@company.co",
    companyLabel: "Company",
    optional: "(optional)",
    companyPlaceholder: "Company Ltd",
    back: "Back",
    next: "Next",
    sending: "Sending…",
    send: "Send question",
    footnote: "Free. We reply by email: no newsletters, no spam.",
    successTitle: "Thank you, we’ve got it.",
    successBody: "Your question is in. A real person, not an autoresponder, will reply by email.",
    successSpam: "We’ve emailed you a confirmation. If it isn’t in your inbox, check your spam or junk folder.",
  },

  errors: {
    name: "Please tell us your name.",
    email: "Please enter a valid email address.",
    message: "Tell us a little more: a sentence or two is plenty.",
    rateLimited: "Too many questions have been sent recently. Please wait an hour or email us.",
  },

  faqs: [
    {
      q: "Do I have to register for VAT?",
      a: "The thresholds are €85,000 for goods and €42,500 for services in any 12 months. Our VAT tool shows your net position.",
      keywords: ["vat", "register for vat", "vat3", "threshold"],
    },
    {
      q: "How much Capital Gains Tax will I pay?",
      a: "CGT is 31% on disposals from 7 October 2026 (33% before), with indexation relief on older assets. Estimate it with the CGT calculator.",
      keywords: ["capital gains", "cgt", "selling", "sold", "disposal", "shares"],
    },
    {
      q: "Is a gift or inheritance taxable?",
      a: "Capital Acquisitions Tax at 33% above your group threshold, with agricultural and business relief. Try the CAT calculator.",
      keywords: ["gift", "inheritance", "inherit", "cat", "estate", "family farm", "bequest"],
    },
    {
      q: "What Corporation Tax rate applies?",
      a: "12.5% on trading profits, 25% on passive income. The corporation tax tool totals it for you.",
      keywords: ["corporation tax", "corporate tax", "trading profit", "12.5", "company tax"],
    },
  ],
};

export type ContactMessages = typeof en;

export const contactMessages: Translations<ContactMessages> = {
  en,

  es: {
    meta: {
      title: "Haz una pregunta",
      description:
        "Haz una pregunta sobre impuestos o finanzas personales en Irlanda y recibe por correo una respuesta clara. Gratis.",
    },
    hero: {
      eyebrow: "Haz una pregunta",
      title: "Pregúntanos lo que quieras sobre impuestos y dinero.",
      lede: "Ninguna pregunta es demasiado básica. Pregúntalo como se lo preguntarías a un amigo y te lo explicaremos con palabras sencillas. Es gratis.",
    },
    nextHeading: "Qué pasa después",
    nextSteps: [
      "Elige un tema y pregunta con tus propias palabras.",
      "Una persona real lo lee y responde por correo, con palabras sencillas.",
      "Pregunta con la sesión iniciada y tus preguntas y respuestas se quedan en tu cuenta.",
    ],
    preferEmail: "¿Prefieres el correo?",
    form: {
      steps: [
        { title: "Tema", prompt: "¿Sobre qué es tu pregunta?", sub: "Elige el tema más cercano: después podrás hacer tu pregunta." },
        { title: "Tu pregunta", prompt: "¿Qué te gustaría saber?", sub: "Con una o dos frases basta. Pregúntalo como se lo preguntarías a un amigo." },
        { title: "Tus datos", prompt: "¿Dónde te enviamos la respuesta?", sub: "Una persona real lee cada pregunta y responde por correo." },
      ],
      stepOf: "Paso {n} de {total}",
      notSure: "Aún no lo sé",
      startingCompany: "Crear una empresa",
      chooseTopic: "Elige un tema",
      askLegend: "Haz tu pregunta",
      questionLabel: "Tu pregunta",
      questionPlaceholder: "p. ej., ¿Cómo se calcula el impuesto sobre ganancias de capital cuando vendo acciones?",
      mightHelp: "Ya que estás aquí, esto puede ayudarte",
      detailsLegend: "Tus datos de contacto",
      nameLabel: "Tu nombre",
      namePlaceholder: "Ana García",
      emailLabel: "Correo electrónico",
      emailPlaceholder: "ana@empresa.com",
      companyLabel: "Empresa",
      optional: "(opcional)",
      companyPlaceholder: "Empresa S.L.",
      back: "Atrás",
      next: "Siguiente",
      sending: "Enviando…",
      send: "Enviar pregunta",
      footnote: "Gratis. Respondemos por correo: sin boletines ni spam.",
      successTitle: "Gracias, la hemos recibido.",
      successBody: "Tu pregunta ha llegado. Te responderá por correo una persona real, no una respuesta automática.",
      successSpam: "Te hemos enviado una confirmación por correo. Si no está en tu bandeja de entrada, revisa la carpeta de spam o correo no deseado.",
    },
    errors: {
      name: "Dinos tu nombre, por favor.",
      email: "Introduce una dirección de correo válida.",
      message: "Cuéntanos un poco más: con una o dos frases basta.",
      rateLimited: "Se han enviado demasiadas preguntas recientemente. Espera una hora o escríbenos por correo.",
    },
    faqs: [
      {
        q: "¿Tengo que darme de alta en el IVA?",
        a: "Los umbrales son 85.000 € para bienes y 42.500 € para servicios en cualquier periodo de 12 meses. Nuestra herramienta de IVA muestra tu saldo.",
        keywords: ["iva", "alta", "umbral", "vat"],
      },
      {
        q: "¿Cuánto pagaré de impuesto sobre ganancias de capital?",
        a: "El CGT es del 31 % en las ventas desde el 7 de octubre de 2026 (antes, 33 %), con ajuste por inflación en activos antiguos. Calcúlalo con la calculadora de CGT.",
        keywords: ["ganancia", "plusvalía", "cgt", "vender", "vendí", "venta", "acciones"],
      },
      {
        q: "¿Tributa una donación o una herencia?",
        a: "El impuesto sobre adquisiciones de capital (CAT) es del 33 % por encima del umbral de tu grupo, con deducciones agrarias y empresariales. Prueba la calculadora de CAT.",
        keywords: ["donación", "regalo", "herencia", "heredar", "heredé", "cat", "granja familiar"],
      },
      {
        q: "¿Qué tipo del impuesto de sociedades se aplica?",
        a: "12,5 % sobre los beneficios comerciales y 25 % sobre los ingresos pasivos. La herramienta del impuesto de sociedades lo suma por ti.",
        keywords: ["impuesto de sociedades", "sociedades", "beneficio", "12,5", "empresa"],
      },
    ],
  },

  pt: {
    meta: {
      title: "Faça uma pergunta",
      description:
        "Faça uma pergunta sobre impostos ou finanças pessoais na Irlanda e receba por e-mail uma resposta clara. Grátis.",
    },
    hero: {
      eyebrow: "Faça uma pergunta",
      title: "Pergunte o que quiser sobre impostos e dinheiro.",
      lede: "Nenhuma pergunta é básica demais. Pergunte do jeito que perguntaria a um amigo e explicamos em palavras simples. É grátis.",
    },
    nextHeading: "O que acontece depois",
    nextSteps: [
      "Escolha um tema e pergunte com suas palavras.",
      "Uma pessoa de verdade lê e responde por e-mail, em palavras simples.",
      "Pergunte com a sessão iniciada e suas perguntas e respostas ficam na sua conta.",
    ],
    preferEmail: "Prefere e-mail?",
    form: {
      steps: [
        { title: "Tema", prompt: "Sobre o que é a sua pergunta?", sub: "Escolha o tema mais próximo: depois você faz a pergunta." },
        { title: "Sua pergunta", prompt: "O que você gostaria de saber?", sub: "Uma ou duas frases bastam. Pergunte do jeito que perguntaria a um amigo." },
        { title: "Seus dados", prompt: "Para onde enviamos a resposta?", sub: "Uma pessoa de verdade lê cada pergunta e responde por e-mail." },
      ],
      stepOf: "Etapa {n} de {total}",
      notSure: "Ainda não sei",
      startingCompany: "Abrir uma empresa",
      chooseTopic: "Escolha um tema",
      askLegend: "Faça sua pergunta",
      questionLabel: "Sua pergunta",
      questionPlaceholder: "ex.: Como é calculado o imposto sobre ganho de capital quando vendo ações?",
      mightHelp: "Já que você está aqui, isto pode ajudar",
      detailsLegend: "Seus dados de contato",
      nameLabel: "Seu nome",
      namePlaceholder: "Ana Souza",
      emailLabel: "E-mail",
      emailPlaceholder: "ana@empresa.com",
      companyLabel: "Empresa",
      optional: "(opcional)",
      companyPlaceholder: "Empresa Ltda.",
      back: "Voltar",
      next: "Próximo",
      sending: "Enviando…",
      send: "Enviar pergunta",
      footnote: "Grátis. Respondemos por e-mail: sem newsletters, sem spam.",
      successTitle: "Obrigado, recebemos.",
      successBody: "Sua pergunta chegou. Uma pessoa de verdade, não uma resposta automática, vai responder por e-mail.",
      successSpam: "Enviamos uma confirmação por e-mail. Se não estiver na sua caixa de entrada, confira a pasta de spam ou lixo eletrônico.",
    },
    errors: {
      name: "Por favor, diga seu nome.",
      email: "Informe um endereço de e-mail válido.",
      message: "Conte um pouco mais: uma ou duas frases bastam.",
      rateLimited: "Muitas perguntas foram enviadas recentemente. Aguarde uma hora ou envie um e-mail.",
    },
    faqs: [
      {
        q: "Preciso me registrar no IVA?",
        a: "Os limites são € 85.000 para mercadorias e € 42.500 para serviços em qualquer período de 12 meses. Nossa ferramenta de IVA mostra seu saldo.",
        keywords: ["iva", "registrar", "registro", "limite", "vat"],
      },
      {
        q: "Quanto vou pagar de imposto sobre ganho de capital?",
        a: "O CGT é de 31% nas vendas a partir de 7 de outubro de 2026 (antes, 33%), com correção pela inflação para bens mais antigos. Estime com a calculadora de CGT.",
        keywords: ["ganho de capital", "cgt", "vender", "vendi", "venda", "ações"],
      },
      {
        q: "Doação ou herança paga imposto?",
        a: "O imposto sobre aquisições de capital (CAT) é de 33% acima do limite do seu grupo, com isenções agrícolas e empresariais. Experimente a calculadora de CAT.",
        keywords: ["doação", "presente", "herança", "herdar", "herdei", "cat", "fazenda"],
      },
      {
        q: "Qual alíquota do imposto sobre empresas se aplica?",
        a: "12,5% sobre lucros comerciais e 25% sobre rendimentos passivos. A ferramenta do imposto sobre empresas soma para você.",
        keywords: ["imposto sobre empresas", "imposto corporativo", "lucro", "12,5", "empresa"],
      },
    ],
  },

  ga: {
    meta: {
      title: "Cuir ceist",
      description:
        "Cuir ceist faoi cháin nó airgeadas pearsanta in Éirinn agus faigh freagra soiléir ar ríomhphost. Saor in aisce.",
    },
    hero: {
      eyebrow: "Cuir ceist",
      title: "Cuir ceist orainn faoi cháin agus airgead.",
      lede: "Níl aon cheist ró-bhunúsach. Cuir í mar a chuirfeá ar chara í agus míneoimid i dteanga shimplí í. Tá sé saor in aisce.",
    },
    nextHeading: "Cad a tharlóidh ansin",
    nextSteps: [
      "Roghnaigh ábhar agus cuir do cheist i d’fhocail féin.",
      "Léann duine í agus freagraíonn sé ar ríomhphost, i dteanga shimplí.",
      "Cuir ceist agus tú sínithe isteach agus fanfaidh do cheisteanna agus na freagraí i do chuntas.",
    ],
    preferEmail: "B’fhearr leat ríomhphost?",
    form: {
      steps: [
        { title: "Ábhar", prompt: "Cad faoi a bhfuil do cheist?", sub: "Roghnaigh an t-ábhar is gaire: is féidir leat do cheist a chur ina dhiaidh sin." },
        { title: "Do cheist", prompt: "Cad ba mhaith leat a fháil amach?", sub: "Is leor abairt nó dhó. Cuir í mar a chuirfeá ar chara í." },
        { title: "Do shonraí", prompt: "Cá seolfaimid an freagra?", sub: "Léann duine gach ceist agus freagraíonn sé ar ríomhphost." },
      ],
      stepOf: "Céim {n} de {total}",
      notSure: "Níl a fhios agam fós",
      startingCompany: "Comhlacht a bhunú",
      chooseTopic: "Roghnaigh ábhar",
      askLegend: "Cuir do cheist",
      questionLabel: "Do cheist",
      questionPlaceholder: "m.sh. Conas a oibrítear amach cáin ghnóchan caipitiúil nuair a dhíolaim scaireanna?",
      mightHelp: "Ós rud é go bhfuil tú anseo, b’fhéidir go gcabhródh sé seo",
      detailsLegend: "Do shonraí teagmhála",
      nameLabel: "D’ainm",
      namePlaceholder: "Síle Ní Bhriain",
      emailLabel: "Ríomhphost",
      emailPlaceholder: "sile@comhlacht.ie",
      companyLabel: "Comhlacht",
      optional: "(roghnach)",
      companyPlaceholder: "Comhlacht Teo.",
      back: "Siar",
      next: "Ar aghaidh",
      sending: "Á sheoladh…",
      send: "Seol an cheist",
      footnote: "Saor in aisce. Freagraímid ar ríomhphost: gan nuachtlitreacha, gan turscar.",
      successTitle: "Go raibh maith agat, fuaireamar í.",
      successBody: "Tá do cheist faighte againn. Freagróidh duine ar ríomhphost, ní freagróir uathoibríoch.",
      successSpam: "Sheolamar dearbhú chugat ar ríomhphost. Mura bhfuil sé i do bhosca isteach, féach i d’fhillteán turscair.",
    },
    errors: {
      name: "Inis d’ainm dúinn, le do thoil.",
      email: "Cuir isteach seoladh ríomhphoist bailí.",
      message: "Inis beagán eile dúinn: is leor abairt nó dhó.",
      rateLimited: "Seoladh an iomarca ceisteanna le déanaí. Fan uair an chloig nó seol ríomhphost chugainn.",
    },
    faqs: [
      {
        q: "An gá dom clárú le haghaidh CBL?",
        a: "Is iad na tairseacha €85,000 d’earraí agus €42,500 do sheirbhísí in aon 12 mhí. Taispeánann ár n-uirlis CBL do ghlanstaid.",
        keywords: ["cbl", "cáin bhreisluacha", "clárú", "tairseach", "vat"],
      },
      {
        q: "Cé mhéad cánach gnóchan caipitiúil a íocfaidh mé?",
        a: "Tá CGC 31% ar dhiúscairtí ó 7 Deireadh Fómhair 2026 (33% roimhe sin), le faoiseamh innéacsaithe ar shócmhainní níos sine. Meas é leis an áireamhán CGC.",
        keywords: ["gnóchan", "cgc", "cgt", "díol", "dhíol", "scaireanna"],
      },
      {
        q: "An bhfuil cáin ar bhronntanas nó ar oidhreacht?",
        a: "Cáin Fháltas Caipitiúil ag 33% os cionn tairseach do ghrúpa, le faoiseamh talmhaíochta agus gnó. Bain triail as an áireamhán CFC.",
        keywords: ["bronntanas", "oidhreacht", "cfc", "cat", "eastát", "feirm"],
      },
      {
        q: "Cén ráta cánach corparáide a bhaineann leis?",
        a: "12.5% ar bhrabúis trádála, 25% ar ioncam éighníomhach. Áiríonn an uirlis cánach corparáide an t-iomlán duit.",
        keywords: ["cáin chorparáide", "corparáid", "brabús", "12.5", "comhlacht"],
      },
    ],
  },
};
