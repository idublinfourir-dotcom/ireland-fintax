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

  ar: {
    meta: {
      title: "اطرح سؤالًا",
      description:
        "اطرح سؤالًا عن الضرائب أو التمويل الشخصي في أيرلندا واحصل على إجابة بلغة بسيطة بالبريد الإلكتروني. مجانًا.",
    },
    hero: {
      eyebrow: "اطرح سؤالًا",
      title: "اسألنا أي شيء عن الضرائب والمال.",
      lede: "لا يوجد سؤال بسيط أكثر من اللازم. اسأله كما تسأل صديقًا وسنشرحه لك بلغة بسيطة. إنه مجاني.",
    },
    nextHeading: "ماذا يحدث بعد ذلك",
    nextSteps: [
      "اختر موضوعًا واسأل بكلماتك.",
      "يقرأه شخص حقيقي ويرد بالبريد الإلكتروني بلغة بسيطة.",
      "اسأل وأنت مسجّل الدخول وستبقى أسئلتك وإجاباتك في حسابك.",
    ],
    preferEmail: "تفضّل البريد الإلكتروني؟",

    form: {
      steps: [
        { title: "الموضوع", prompt: "عمّ يدور سؤالك؟", sub: "اختر أقرب موضوع: يمكنك طرح سؤالك في الخطوة التالية." },
        { title: "سؤالك", prompt: "ماذا تريد أن تعرف؟", sub: "جملة أو جملتان تكفيان. اسأله كما تسأل صديقًا." },
        { title: "بياناتك", prompt: "إلى أين نرسل الإجابة؟", sub: "يقرأ شخص حقيقي كل سؤال ويرد بالبريد الإلكتروني." },
      ],
      stepOf: "الخطوة {n} من {total}",
      notSure: "لست متأكدًا بعد",
      startingCompany: "تأسيس شركة",
      chooseTopic: "اختر موضوعًا",
      askLegend: "اطرح سؤالك",
      questionLabel: "سؤالك",
      questionPlaceholder: "مثلًا: كيف تُحسب ضريبة الأرباح الرأسمالية عندما أبيع أسهمًا؟",
      mightHelp: "ما دمت هنا، قد يفيدك هذا",
      detailsLegend: "بيانات التواصل",
      nameLabel: "اسمك",
      namePlaceholder: "سارة أحمد",
      emailLabel: "البريد الإلكتروني",
      emailPlaceholder: "sara@company.co",
      companyLabel: "الشركة",
      optional: "(اختياري)",
      companyPlaceholder: "Company Ltd",
      back: "رجوع",
      next: "التالي",
      sending: "جارٍ الإرسال…",
      send: "أرسل السؤال",
      footnote: "مجاني. نرد بالبريد الإلكتروني: لا نشرات إخبارية ولا رسائل مزعجة.",
      successTitle: "شكرًا لك، وصلنا سؤالك.",
      successBody: "تم استلام سؤالك. سيرد عليك شخص حقيقي، لا رد آلي، بالبريد الإلكتروني.",
      successSpam: "أرسلنا إليك تأكيدًا بالبريد الإلكتروني. إن لم تجده في صندوق الوارد، فتحقق من مجلد الرسائل المزعجة.",
    },

    errors: {
      name: "يُرجى إخبارنا باسمك.",
      email: "يُرجى إدخال عنوان بريد إلكتروني صالح.",
      message: "أخبرنا بالمزيد قليلًا: جملة أو جملتان تكفيان.",
      rateLimited: "أُرسل عدد كبير جدًا من الأسئلة مؤخرًا. يُرجى الانتظار ساعة أو مراسلتنا بالبريد الإلكتروني.",
    },

    faqs: [
      {
        q: "هل يجب أن أسجل في ضريبة القيمة المضافة؟",
        a: "الحدود هي 85,000 يورو للسلع و42,500 يورو للخدمات خلال أي 12 شهرًا. تعرض أداة ضريبة القيمة المضافة وضعك الصافي.",
        keywords: ["ضريبة القيمة المضافة", "القيمة المضافة", "تسجيل", "vat", "vat3", "الحد"],
      },
      {
        q: "كم سأدفع من ضريبة الأرباح الرأسمالية؟",
        a: "CGT بنسبة 31% على عمليات التصرف اعتبارًا من 7 أكتوبر 2026 (33% قبل ذلك)، مع إعفاء التعديل بالتضخم للأصول الأقدم. قدّرها بحاسبة CGT.",
        keywords: ["الأرباح الرأسمالية", "أرباح رأسمالية", "cgt", "بيع", "بعت", "أسهم", "التصرف"],
      },
      {
        q: "هل تخضع الهبة أو الميراث للضريبة؟",
        a: "ضريبة الاقتناء الرأسمالي بنسبة 33% فوق حد مجموعتك، مع الإعفاء الزراعي وإعفاء الأعمال. جرّب حاسبة CAT.",
        keywords: ["هبة", "هدية", "ميراث", "إرث", "ورثت", "cat", "تركة", "مزرعة عائلية"],
      },
      {
        q: "ما معدل ضريبة الشركات المطبق؟",
        a: "12.5% على الأرباح التجارية، و25% على الدخل السلبي. تجمعها لك أداة ضريبة الشركات.",
        keywords: ["ضريبة الشركات", "شركة", "شركات", "الربح التجاري", "12.5"],
      },
    ],
  },

  bn: {
    meta: {
      title: "প্রশ্ন করুন",
      description:
        "আয়ারল্যান্ডের কর বা ব্যক্তিগত অর্থ নিয়ে প্রশ্ন করুন এবং ইমেইলে সহজ ভাষায় উত্তর পান। বিনামূল্যে।",
    },
    hero: {
      eyebrow: "প্রশ্ন করুন",
      title: "কর আর টাকা-পয়সা নিয়ে যা খুশি জিজ্ঞেস করুন।",
      lede: "কোনো প্রশ্নই খুব সাধারণ নয়। বন্ধুকে যেভাবে জিজ্ঞেস করতেন সেভাবেই করুন, আমরা সহজ ভাষায় বুঝিয়ে দেব। এটি বিনামূল্যে।",
    },
    nextHeading: "এরপর কী হয়",
    nextSteps: [
      "একটি বিষয় বেছে নিন আর নিজের ভাষায় জিজ্ঞেস করুন।",
      "একজন সত্যিকারের মানুষ এটি পড়েন এবং ইমেইলে সহজ ভাষায় উত্তর দেন।",
      "সাইন ইন করে জিজ্ঞেস করলে আপনার প্রশ্ন ও উত্তর আপনার অ্যাকাউন্টে থেকে যায়।",
    ],
    preferEmail: "ইমেইল পছন্দ করেন?",

    form: {
      steps: [
        { title: "বিষয়", prompt: "আপনার প্রশ্ন কোন বিষয়ে?", sub: "সবচেয়ে কাছের বিষয়টি বেছে নিন: এরপর প্রশ্নটি লিখতে পারবেন।" },
        { title: "আপনার প্রশ্ন", prompt: "আপনি কী জানতে চান?", sub: "এক-দুই বাক্যই যথেষ্ট। বন্ধুকে যেভাবে জিজ্ঞেস করতেন সেভাবে লিখুন।" },
        { title: "আপনার তথ্য", prompt: "উত্তর কোথায় পাঠাব?", sub: "একজন সত্যিকারের মানুষ প্রতিটি প্রশ্ন পড়েন এবং ইমেইলে উত্তর দেন।" },
      ],
      stepOf: "ধাপ {n} / {total}",
      notSure: "এখনও নিশ্চিত নই",
      startingCompany: "কোম্পানি শুরু করা",
      chooseTopic: "একটি বিষয় বেছে নিন",
      askLegend: "আপনার প্রশ্ন লিখুন",
      questionLabel: "আপনার প্রশ্ন",
      questionPlaceholder: "যেমন: শেয়ার বিক্রি করলে মূলধনী মুনাফা কর কীভাবে হিসাব হয়?",
      mightHelp: "এই ফাঁকে এটি কাজে লাগতে পারে",
      detailsLegend: "আপনার যোগাযোগের তথ্য",
      nameLabel: "আপনার নাম",
      namePlaceholder: "যেমন: রহিম আহমেদ",
      emailLabel: "ইমেইল",
      emailPlaceholder: "rahim@company.co",
      companyLabel: "কোম্পানি",
      optional: "(ঐচ্ছিক)",
      companyPlaceholder: "Company Ltd",
      back: "পেছনে",
      next: "পরবর্তী",
      sending: "পাঠানো হচ্ছে…",
      send: "প্রশ্ন পাঠান",
      footnote: "বিনামূল্যে। আমরা ইমেইলে উত্তর দিই: কোনো নিউজলেটার নয়, কোনো স্প্যাম নয়।",
      successTitle: "ধন্যবাদ, আমরা পেয়েছি।",
      successBody: "আপনার প্রশ্ন পৌঁছেছে। কোনো স্বয়ংক্রিয় উত্তর নয়, একজন সত্যিকারের মানুষ ইমেইলে উত্তর দেবেন।",
      successSpam: "আমরা আপনাকে একটি নিশ্চিতকরণ ইমেইল পাঠিয়েছি। ইনবক্সে না পেলে স্প্যাম বা জাঙ্ক ফোল্ডার দেখুন।",
    },

    errors: {
      name: "অনুগ্রহ করে আপনার নাম লিখুন।",
      email: "অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন।",
      message: "আরেকটু বিস্তারিত লিখুন: এক-দুই বাক্যই যথেষ্ট।",
      rateLimited: "সম্প্রতি অনেক বেশি প্রশ্ন পাঠানো হয়েছে। অনুগ্রহ করে এক ঘণ্টা অপেক্ষা করুন অথবা আমাদের ইমেইল করুন।",
    },

    faqs: [
      {
        q: "আমাকে কি ভ্যাট নিবন্ধন করতে হবে?",
        a: "যেকোনো 12 মাসে পণ্যের জন্য সীমা €85,000 আর সেবার জন্য €42,500। আমাদের ভ্যাট টুল আপনার নিট অবস্থান দেখায়।",
        keywords: ["ভ্যাট", "মূসক", "নিবন্ধন", "রেজিস্ট্রেশন", "vat", "vat3", "সীমা"],
      },
      {
        q: "আমাকে কত মূলধনী মুনাফা কর দিতে হবে?",
        a: "7 অক্টোবর 2026 থেকে বিক্রিতে CGT 31% (আগে 33%), পুরোনো সম্পদে ইনডেক্সেশন ছাড়সহ। CGT ক্যালকুলেটর দিয়ে হিসাব করুন।",
        keywords: ["মূলধনী মুনাফা", "মুনাফা কর", "cgt", "বিক্রি", "বিক্রি করেছি", "শেয়ার", "capital gains"],
      },
      {
        q: "উপহার বা উত্তরাধিকারে কি কর লাগে?",
        a: "আপনার গ্রুপের করমুক্ত সীমার ওপরে 33% হারে Capital Acquisitions Tax, কৃষি ও ব্যবসায়িক ছাড়সহ। CAT ক্যালকুলেটর ব্যবহার করে দেখুন।",
        keywords: ["উপহার", "উত্তরাধিকার", "উত্তরাধিকারী", "ওয়ারিশ", "সম্পত্তি পেয়েছি", "cat", "পারিবারিক খামার", "gift", "inheritance"],
      },
      {
        q: "কোন কর্পোরেশন ট্যাক্স হার প্রযোজ্য?",
        a: "ব্যবসায়িক মুনাফায় 12.5%, প্যাসিভ আয়ে 25%। কর্পোরেশন ট্যাক্স টুল আপনার জন্য মোট হিসাব করে দেয়।",
        keywords: ["কর্পোরেশন ট্যাক্স", "কোম্পানির কর", "কোম্পানি", "ব্যবসায়িক মুনাফা", "12.5", "corporation tax"],
      },
    ],
  },

  hi: {
    meta: {
      title: "सवाल पूछें",
      description:
        "आयरलैंड के टैक्स या निजी वित्त के बारे में सवाल पूछें और ईमेल पर आसान भाषा में जवाब पाएँ। मुफ़्त।",
    },
    hero: {
      eyebrow: "सवाल पूछें",
      title: "टैक्स और पैसे के बारे में हमसे कुछ भी पूछें।",
      lede: "कोई सवाल बहुत बुनियादी नहीं होता। वैसे ही पूछें जैसे किसी दोस्त से पूछते, हम आसान भाषा में समझा देंगे। यह मुफ़्त है।",
    },
    nextHeading: "आगे क्या होता है",
    nextSteps: [
      "विषय चुनें और अपने शब्दों में पूछें।",
      "एक असली इंसान इसे पढ़ता है और ईमेल पर आसान भाषा में जवाब देता है।",
      "साइन इन करके पूछें, तो आपके सवाल और जवाब आपके अकाउंट में रहते हैं।",
    ],
    preferEmail: "ईमेल पसंद है?",

    form: {
      steps: [
        { title: "विषय", prompt: "आपका सवाल किस बारे में है?", sub: "सबसे क़रीबी विषय चुनें: अगले क़दम में आप अपना सवाल लिख सकते हैं।" },
        { title: "आपका सवाल", prompt: "आप क्या जानना चाहते हैं?", sub: "एक-दो वाक्य काफ़ी हैं। वैसे ही पूछें जैसे किसी दोस्त से पूछते।" },
        { title: "आपकी जानकारी", prompt: "जवाब कहाँ भेजें?", sub: "एक असली इंसान हर सवाल पढ़ता है और ईमेल पर जवाब देता है।" },
      ],
      stepOf: "क़दम {n} / {total}",
      notSure: "अभी पक्का नहीं",
      startingCompany: "कंपनी शुरू करना",
      chooseTopic: "विषय चुनें",
      askLegend: "अपना सवाल पूछें",
      questionLabel: "आपका सवाल",
      questionPlaceholder: "जैसे: शेयर बेचने पर पूंजीगत लाभ कर कैसे निकाला जाता है?",
      mightHelp: "इस बीच, यह काम आ सकता है",
      detailsLegend: "आपकी संपर्क जानकारी",
      nameLabel: "आपका नाम",
      namePlaceholder: "जैसे: प्रिया शर्मा",
      emailLabel: "ईमेल",
      emailPlaceholder: "priya@company.co",
      companyLabel: "कंपनी",
      optional: "(वैकल्पिक)",
      companyPlaceholder: "Company Ltd",
      back: "पीछे",
      next: "आगे",
      sending: "भेजा जा रहा है…",
      send: "सवाल भेजें",
      footnote: "मुफ़्त। हम ईमेल पर जवाब देते हैं: कोई न्यूज़लेटर नहीं, कोई स्पैम नहीं।",
      successTitle: "धन्यवाद, हमें मिल गया।",
      successBody: "आपका सवाल पहुँच गया है। कोई ऑटो-रिप्लाई नहीं, एक असली इंसान ईमेल पर जवाब देगा।",
      successSpam: "हमने आपको पुष्टि का ईमेल भेजा है। अगर वह इनबॉक्स में नहीं है, तो स्पैम या जंक फ़ोल्डर देखें।",
    },

    errors: {
      name: "कृपया अपना नाम बताएँ।",
      email: "कृपया एक सही ईमेल पता डालें।",
      message: "थोड़ा और बताएँ: एक-दो वाक्य काफ़ी हैं।",
      rateLimited: "हाल ही में बहुत ज़्यादा सवाल भेजे गए हैं। कृपया एक घंटा रुकें या हमें ईमेल करें।",
    },

    faqs: [
      {
        q: "क्या मुझे वैट के लिए पंजीकरण कराना होगा?",
        a: "किसी भी 12 महीने में सामान के लिए सीमा €85,000 और सेवाओं के लिए €42,500 है। हमारा वैट टूल आपकी शुद्ध स्थिति दिखाता है।",
        keywords: ["वैट", "पंजीकरण", "रजिस्ट्रेशन", "vat", "vat3", "सीमा"],
      },
      {
        q: "मुझे कितना पूंजीगत लाभ कर देना होगा?",
        a: "7 अक्टूबर 2026 से बिक्री पर CGT 31% है (पहले 33%), पुरानी संपत्तियों पर इंडेक्सेशन राहत के साथ। CGT कैलकुलेटर से अनुमान लगाएँ।",
        keywords: ["पूंजीगत लाभ", "कैपिटल गेन", "cgt", "बेचना", "बेचा", "बिक्री", "शेयर", "capital gains"],
      },
      {
        q: "क्या उपहार या विरासत पर टैक्स लगता है?",
        a: "आपके समूह की कर-मुक्त सीमा से ऊपर 33% पर Capital Acquisitions Tax, कृषि और व्यवसाय राहत के साथ। CAT कैलकुलेटर आज़माएँ।",
        keywords: ["उपहार", "तोहफ़ा", "विरासत", "वसीयत", "जायदाद", "cat", "पारिवारिक खेत", "gift", "inheritance"],
      },
      {
        q: "कौन-सी कॉर्पोरेशन टैक्स दर लागू होती है?",
        a: "व्यापारिक लाभ पर 12.5%, निष्क्रिय आय पर 25%। कॉर्पोरेशन टैक्स टूल आपके लिए कुल जोड़ देता है।",
        keywords: ["कॉर्पोरेशन टैक्स", "कंपनी टैक्स", "कंपनी", "व्यापारिक लाभ", "12.5", "corporation tax"],
      },
    ],
  },
};
