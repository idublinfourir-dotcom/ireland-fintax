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
    { title: "Tax Calculators", description: "Calculators for income tax, VAT, corporation tax, the R&D credit, capital allowances, CGT and CAT, using Irish rates." },
    { title: "Personal Finance", description: "Work out a mortgage, and compare investment options side by side on risk, tax and access to your money." },
    { title: "Accounting Hub", description: "Memos, templates, tax and VAT forms and setup guides for starting and running a company." },
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
      { title: "Centro de contabilidad", description: "Notas, plantillas, formularios de impuestos y de IVA y guías para crear y gestionar una empresa." },
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
      { title: "Central de contabilidade", description: "Notas, modelos, formulários de impostos e de IVA e guias para abrir e administrar uma empresa." },
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
      { title: "Mol Cuntasaíochta", description: "Meabhráin, teimpléid, foirmeacha cánach agus CBL agus treoracha chun comhlacht a bhunú agus a reáchtáil." },
      { title: "Cuir ceist", description: "Rud éigin nach gclúdaíonn na huirlisí? Cuir ceist i d’fhocail féin agus faigh freagra soiléir ar ríomhphost." },
    ],
    notFound: {
      title: "Níl aon rud anseo.",
      body: "Bogadh an leathanach atá á lorg agat, nó ní raibh sé riamh ann. Fillimis ar thalamh slán.",
      home: "Ar ais abhaile",
      contact: "Déan teagmháil linn",
    },
  },

  ar: {
    meta: {
      title: "من نحن",
      description:
        "Irish Fintax مكان مجاني لتتعلم كيف تعمل الضرائب والتمويل الشخصي في أيرلندا، مع حاسبات وأدلة ونماذج بلغة بسيطة.",
    },
    hero: {
      eyebrow: "من نحن",
      title: "تعلّم كيف يعمل جانب المال.",
      lede: "Irish Fintax منصة تعليمية مجانية للضرائب والتمويل الشخصي في أيرلندا: شروح بلغة بسيطة وحاسبات يمكنك تشغيلها بنفسك.",
    },
    whyEyebrow: "لماذا وُجد",
    whyTitle: "لا ينبغي أن تحتاج الضرائب إلى مترجم.",
    body: [
      "يواجه معظم الناس أسئلة الضرائب والمال في أسوأ لحظة: أول قسيمة راتب، بيع أسهم، شراء منزل، تأسيس شركة. القواعد علنية، لكنها مكتوبة للمتخصصين.",
      "يعرضها هذا الموقع بلغة بسيطة ويتيح لك تجربة أرقامك، لتفهم ما يجري قبل أن تتخذ أي قرار. كل شيء هنا مجاني.",
      "إنها معلومات عامة، وليست نصيحة. المعدلات والقواعد تتغير ووضعك الخاص مهم، لذا تحقق مع Revenue أو مع مستشار مؤهل ومرخّص قبل أن تتخذ قرارًا كبيرًا.",
    ],
    sections: [
      { title: "حاسبات الضرائب", description: "حاسبات لضريبة الدخل وضريبة القيمة المضافة وضريبة الشركات وائتمان البحث والتطوير والخصومات الرأسمالية وCGT وCAT، بالمعدلات الأيرلندية." },
      { title: "التمويل الشخصي", description: "احسب الرهن العقاري، وقارن خيارات الاستثمار جنبًا إلى جنب من حيث المخاطر والضريبة وإمكانية الوصول إلى أموالك." },
      { title: "مركز المحاسبة", description: "مذكرات ونماذج ونماذج ضريبية ونماذج ضريبة القيمة المضافة وأدلة لتأسيس شركة وإدارتها." },
      { title: "اطرح سؤالًا", description: "عالق في شيء لا تغطيه الأدوات؟ اسأل بكلماتك واحصل على إجابة بلغة بسيطة بالبريد الإلكتروني." },
    ],
    notFound: {
      title: "هذا الحقل فارغ.",
      body: "الصفحة التي تبحث عنها نُقلت أو حُصدت أو لم تُزرع قط. لنُعِدك إلى أرض صلبة.",
      home: "العودة إلى الرئيسية",
      contact: "تواصل معنا",
    },
  },
  bn: {
    meta: {
      title: "আমাদের সম্পর্কে",
      description:
        "Irish Fintax আয়ারল্যান্ডের কর ও ব্যক্তিগত অর্থব্যবস্থা কীভাবে কাজ করে তা শেখার একটি বিনামূল্যের জায়গা, সহজ ভাষায় ক্যালকুলেটর, গাইড ও টেমপ্লেটসহ।",
    },
    hero: {
      eyebrow: "আমাদের সম্পর্কে",
      title: "টাকা-পয়সার দিকটা কীভাবে চলে, শিখুন।",
      lede: "Irish Fintax আয়ারল্যান্ডের কর ও ব্যক্তিগত অর্থব্যবস্থা শেখার একটি বিনামূল্যের প্ল্যাটফর্ম: সহজ ভাষায় ব্যাখ্যা, আর এমন ক্যালকুলেটর যা আপনি নিজেই চালাতে পারেন।",
    },
    whyEyebrow: "কেন এই সাইট",
    whyTitle: "কর বুঝতে অনুবাদক লাগা উচিত নয়।",
    body: [
      "বেশিরভাগ মানুষ কর আর টাকা-পয়সার প্রশ্নের মুখোমুখি হন সবচেয়ে কঠিন সময়ে: প্রথম বেতনের স্লিপ, শেয়ার বিক্রি, বাড়ি কেনা, কোম্পানি শুরু করা। নিয়মগুলো প্রকাশ্য, কিন্তু সেগুলো লেখা হয় বিশেষজ্ঞদের জন্য।",
      "এই সাইট সেগুলো সহজ ভাষায় তুলে ধরে এবং আপনাকে নিজের অঙ্ক দিয়ে চেষ্টা করতে দেয়, যাতে কোনো সিদ্ধান্ত নেওয়ার আগে আপনি বোঝেন কী হচ্ছে। এখানকার সবকিছু বিনামূল্যে।",
      "এটি সাধারণ তথ্য, পরামর্শ নয়। হার ও নিয়ম বদলায়, আর আপনার নিজের পরিস্থিতিও গুরুত্বপূর্ণ, তাই বড় কোনো সিদ্ধান্ত নেওয়ার আগে Revenue বা একজন যোগ্য, নিয়ন্ত্রিত উপদেষ্টার সঙ্গে মিলিয়ে নিন।",
    ],
    sections: [
      { title: "কর ক্যালকুলেটর", description: "আয়ারল্যান্ডের হারে আয়কর, ভ্যাট, কর্পোরেশন ট্যাক্স, R&D ক্রেডিট, মূলধনী ভাতা, CGT ও CAT-এর ক্যালকুলেটর।" },
      { title: "ব্যক্তিগত অর্থ", description: "মর্টগেজের হিসাব করুন, আর ঝুঁকি, কর ও টাকা তোলার সুবিধা অনুযায়ী বিনিয়োগের বিকল্পগুলো পাশাপাশি তুলনা করুন।" },
      { title: "অ্যাকাউন্টিং হাব", description: "কোম্পানি শুরু ও পরিচালনার জন্য মেমো, টেমপ্লেট, কর ও ভ্যাটের ফর্ম এবং শুরু করার গাইড।" },
      { title: "প্রশ্ন করুন", description: "টুলগুলোতে নেই এমন কিছুতে আটকে গেছেন? নিজের ভাষায় জিজ্ঞেস করুন, ইমেইলে সহজ ভাষায় উত্তর পাবেন।" },
    ],
    notFound: {
      title: "এই মাঠটা খালি।",
      body: "আপনি যে পাতাটি খুঁজছেন সেটি সরানো হয়েছে, ফসল তুলে নেওয়া হয়েছে, অথবা কখনো বোনাই হয়নি। চলুন আপনাকে শক্ত মাটিতে ফিরিয়ে নিই।",
      home: "হোমে ফিরে যান",
      contact: "যোগাযোগ করুন",
    },
  },
  hi: {
    meta: {
      title: "हमारे बारे में",
      description:
        "Irish Fintax यह सीखने की एक मुफ़्त जगह है कि आयरलैंड में टैक्स और निजी वित्त कैसे काम करते हैं, आसान भाषा में कैलकुलेटर, गाइड और टेम्पलेट के साथ।",
    },
    hero: {
      eyebrow: "हमारे बारे में",
      title: "सीखें कि पैसे का पहलू कैसे काम करता है।",
      lede: "Irish Fintax आयरलैंड के टैक्स और निजी वित्त के लिए एक मुफ़्त शिक्षा मंच है: आसान भाषा में व्याख्या, और ऐसे कैलकुलेटर जिन्हें आप ख़ुद चला सकते हैं।",
    },
    whyEyebrow: "यह क्यों है",
    whyTitle: "टैक्स समझने के लिए अनुवादक की ज़रूरत नहीं होनी चाहिए।",
    body: [
      "ज़्यादातर लोगों के सामने टैक्स और पैसे के सवाल सबसे मुश्किल वक़्त पर आते हैं: पहली सैलरी स्लिप, शेयर बेचना, घर ख़रीदना, कंपनी शुरू करना। नियम सार्वजनिक हैं, लेकिन वे विशेषज्ञों के लिए लिखे जाते हैं।",
      "यह साइट उन्हें आसान भाषा में रखती है और आपको अपने आँकड़े आज़माने देती है, ताकि कोई फ़ैसला लेने से पहले आप समझें कि क्या हो रहा है। यहाँ सब कुछ मुफ़्त है।",
      "यह सामान्य जानकारी है, सलाह नहीं। दरें और नियम बदलते रहते हैं और आपकी अपनी स्थिति मायने रखती है, इसलिए कोई बड़ा फ़ैसला लेने से पहले Revenue या किसी योग्य, विनियमित सलाहकार से पुष्टि कर लें।",
    ],
    sections: [
      { title: "टैक्स कैलकुलेटर", description: "आयरलैंड की दरों पर आयकर, वैट, कॉर्पोरेशन टैक्स, R&D क्रेडिट, पूंजीगत भत्ते, CGT और CAT के कैलकुलेटर।" },
      { title: "निजी वित्त", description: "मॉर्टगेज का हिसाब लगाएँ, और जोखिम, टैक्स और पैसे तक पहुँच के आधार पर निवेश के विकल्पों की आमने-सामने तुलना करें।" },
      { title: "अकाउंटिंग हब", description: "कंपनी शुरू करने और चलाने के लिए मेमो, टेम्पलेट, टैक्स और वैट फ़ॉर्म, और शुरुआत की गाइड।" },
      { title: "सवाल पूछें", description: "किसी ऐसी चीज़ पर अटके हैं जो टूल्स में नहीं है? अपने शब्दों में पूछें और ईमेल पर आसान भाषा में जवाब पाएँ।" },
    ],
    notFound: {
      title: "यह खेत ख़ाली है।",
      body: "आप जो पेज ढूँढ रहे हैं वह हटा दिया गया है, उसकी फ़सल कट चुकी है, या वह कभी बोया ही नहीं गया। चलिए आपको पक्की ज़मीन पर वापस ले चलें।",
      home: "होम पर वापस जाएँ",
      contact: "संपर्क करें",
    },
  },
};
