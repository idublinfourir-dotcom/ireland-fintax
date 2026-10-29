import type { PluralForms, Translations } from "../i18n";

/* The privacy notice (GDPR Art. 13), app/privacy/page.tsx. Every statement
   is checked against the code: change it, in every language, with any change
   to what is collected, who processes it or how long it is kept (see the
   page's header comment). The English notice is the one that applies; the
   others say so (`translation`). {ask} is the link to the question form,
   {name} the processor's name in bold, {years} the retention period. */

const en = {
  meta: {
    title: "Privacy",
    description: "What Irish Fintax collects, why, who handles it and how long it is kept.",
  },
  hero: {
    eyebrow: "Privacy",
    title: "Your data on Irish Fintax.",
    lede: "What the site collects, why, who handles it and how long it is kept.",
  },
  updated: "Last updated {date}.",
  translation: "This is a translation. If it differs from the {english}, the English one applies.",
  englishLink: "English notice",
  ask: "Ask a question",
  who: {
    title: "Who is responsible",
    body: "Irish Fintax (irishfintax.ie) is a site for learning about Irish tax and personal finance. Irish Fintax decides how the personal data described here is used. For anything about your data, send a message through {ask}.",
  },
  calculators: {
    title: "The calculators",
    body: "The calculators work in your browser. The figures you type are not sent to us or stored, and you do not need an account to use them.",
  },
  collect: {
    title: "What we collect, and why",
    items: [
      {
        label: "When you ask a question:",
        body: "your name, email address, company if you give one, the topic you pick, your message and our replies. We use them to answer you. If you have an account with the same confirmed email address, the question also appears in your account.",
      },
      {
        label: "When you create an account:",
        body: "your name, email address and password. The password is stored only in a scrambled form (a one-way hash) that cannot be turned back into the password. If you sign in with Google, Google gives us your name, email address and the address of your profile picture instead.",
      },
      {
        label: "When you request a resource from the Accounting Hub:",
        body: "your name, phone number, email address, website and what you need it for. We use them to send you the resource.",
      },
      {
        label: "When you visit a page:",
        body: "Vercel Web Analytics counts the visit. It records the page address (without anything after a “?”), the site you came from, your country and city, and your device, browser and operating system. It sets no cookies and does not identify you: visits are told apart by a scrambled value worked out from the request, which is thrown away after 24 hours. Sign-in, account and admin pages are not counted. We use the totals to see which pages are useful.",
      },
      {
        label: "To stop abuse:",
        body: "the site counts sign-in and form attempts. It keeps only a scrambled form of your IP address and email address, never the addresses themselves.",
      },
      {
        label: "Emails we send:",
        body: "a link to confirm your address, codes to reset your password, an acknowledgement when you ask a question, and our replies.",
      },
    ],
    basis:
      "We use this data to do what you asked for (answer your question, run your account, send a resource), and to keep the site secure and see which pages are used, which is in our legitimate interest.",
  },
  processors: {
    title: "Who handles it for us",
    items: [
      "{name} hosts the site, on servers in Dublin, and counts visits (Web Analytics, above). Like any host it keeps short-lived request logs (time, page and IP address).",
      "{name} stores the database, on Amazon Web Services in Dublin.",
      "{name} delivers the emails we send.",
      "{name}, only if you choose to sign in with Google.",
      "{name} serves some of the photos, so your browser fetches them from Unsplash's servers, as it does for any image hosted elsewhere.",
    ],
    outside:
      "Some of these companies are based outside the EU and may handle data there under the safeguards in their own terms. We do not sell your data or use it for advertising.",
  },
  cookies: {
    title: "Cookies",
    body: "Only the cookies needed to sign in: one keeps you signed in, one protects the sign-in form, and one remembers which page to return to. Visits are counted without cookies, and there are no advertising cookies, so there is nothing to accept or decline.",
  },
  keep: {
    title: "How long we keep it",
    questions: "Questions and our replies: deleted automatically {years} after the last message.",
    resources: "Resource requests: deleted automatically {years} after the request.",
    accounts:
      "Accounts: kept until you delete yours (Settings, then Delete my account) or ask us to. Deleting an account also deletes your questions and our replies.",
    links:
      "Email confirmation links expire after 24 hours and password reset codes after 15 minutes; both are then deleted.",
    abuse: "Abuse-prevention counts: deleted after 8 days.",
    visits: "Visit counts: kept by Vercel as totals; the value that tells visits apart is thrown away after 24 hours.",
  },
  years: { one: "{n} year", other: "{n} years" } as PluralForms,
  rights: {
    title: "Your rights",
    body: "You can ask to see the data we hold about you, have it corrected or deleted, or object to how we use it. Send a message through {ask} saying what you need, and we will reply within one month.",
    complain:
      "If you are not happy with our answer, you can complain to the Data Protection Commission at {dpc}.",
  },
  changes: {
    title: "Changes",
    body: "When this notice changes, the date at the top changes with it.",
  },
};

export type PrivacyMessages = typeof en;

export const privacyMessages: Translations<PrivacyMessages> = {
  en,

  es: {
    meta: {
      title: "Privacidad",
      description: "Qué recoge Irish Fintax, por qué, quién lo trata y cuánto tiempo se conserva.",
    },
    hero: {
      eyebrow: "Privacidad",
      title: "Tus datos en Irish Fintax.",
      lede: "Qué recoge el sitio, por qué, quién lo trata y cuánto tiempo se conserva.",
    },
    updated: "Última actualización: {date}.",
    translation: "Esto es una traducción. Si difiere del {english}, se aplica la versión en inglés.",
    englishLink: "aviso en inglés",
    ask: "Haz una pregunta",
    who: {
      title: "Quién es responsable",
      body: "Irish Fintax (irishfintax.ie) es un sitio para aprender sobre impuestos y finanzas personales en Irlanda. Irish Fintax decide cómo se usan los datos personales descritos aquí. Para cualquier asunto sobre tus datos, envía un mensaje a través de {ask}.",
    },
    calculators: {
      title: "Las calculadoras",
      body: "Las calculadoras funcionan en tu navegador. Las cifras que escribes no se nos envían ni se guardan, y no necesitas una cuenta para usarlas.",
    },
    collect: {
      title: "Qué recogemos y por qué",
      items: [
        {
          label: "Cuando haces una pregunta:",
          body: "tu nombre, tu correo electrónico, tu empresa si la indicas, el tema que eliges, tu mensaje y nuestras respuestas. Los usamos para responderte. Si tienes una cuenta con la misma dirección de correo confirmada, la pregunta también aparece en tu cuenta.",
        },
        {
          label: "Cuando creas una cuenta:",
          body: "tu nombre, tu correo electrónico y tu contraseña. La contraseña solo se guarda de forma cifrada (un hash de un solo sentido) que no se puede convertir de nuevo en la contraseña. Si inicias sesión con Google, Google nos da en su lugar tu nombre, tu correo electrónico y la dirección de tu foto de perfil.",
        },
        {
          label: "Cuando pides un recurso del Accounting Hub:",
          body: "tu nombre, tu teléfono, tu correo electrónico, tu sitio web y para qué lo necesitas. Los usamos para enviarte el recurso.",
        },
        {
          label: "Cuando visitas una página:",
          body: "Vercel Web Analytics cuenta la visita. Registra la dirección de la página (sin nada de lo que va después de un “?”), el sitio del que vienes, tu país y ciudad, y tu dispositivo, navegador y sistema operativo. No instala cookies ni te identifica: las visitas se distinguen por un valor cifrado calculado a partir de la solicitud, que se descarta a las 24 horas. Las páginas de inicio de sesión, de cuenta y de administración no se cuentan. Usamos los totales para ver qué páginas son útiles.",
        },
        {
          label: "Para evitar abusos:",
          body: "el sitio cuenta los intentos de inicio de sesión y de envío de formularios. Solo guarda una forma cifrada de tu dirección IP y de tu correo electrónico, nunca las direcciones en sí.",
        },
        {
          label: "Correos que enviamos:",
          body: "un enlace para confirmar tu dirección, códigos para restablecer tu contraseña, un acuse de recibo cuando haces una pregunta y nuestras respuestas.",
        },
      ],
      basis:
        "Usamos estos datos para hacer lo que nos pediste (responder a tu pregunta, gestionar tu cuenta, enviarte un recurso) y para mantener el sitio seguro y ver qué páginas se usan, lo cual es de nuestro interés legítimo.",
    },
    processors: {
      title: "Quién los trata por nosotros",
      items: [
        "{name} aloja el sitio, en servidores en Dublín, y cuenta las visitas (Web Analytics, arriba). Como cualquier proveedor de alojamiento, guarda registros de solicitudes de corta duración (hora, página y dirección IP).",
        "{name} guarda la base de datos, en Amazon Web Services en Dublín.",
        "{name} entrega los correos que enviamos.",
        "{name}, solo si eliges iniciar sesión con Google.",
        "{name} sirve algunas de las fotos, así que tu navegador las descarga de los servidores de Unsplash, como hace con cualquier imagen alojada en otro sitio.",
      ],
      outside:
        "Algunas de estas empresas tienen su sede fuera de la UE y pueden tratar datos allí con las garantías de sus propias condiciones. No vendemos tus datos ni los usamos para publicidad.",
    },
    cookies: {
      title: "Cookies",
      body: "Solo las cookies necesarias para iniciar sesión: una mantiene tu sesión abierta, otra protege el formulario de inicio de sesión y otra recuerda a qué página volver. Las visitas se cuentan sin cookies y no hay cookies publicitarias, así que no hay nada que aceptar ni rechazar.",
    },
    keep: {
      title: "Cuánto tiempo los conservamos",
      questions: "Preguntas y nuestras respuestas: se borran automáticamente {years} después del último mensaje.",
      resources: "Solicitudes de recursos: se borran automáticamente {years} después de la solicitud.",
      accounts:
        "Cuentas: se conservan hasta que borres la tuya (Ajustes y luego Eliminar mi cuenta) o nos lo pidas. Al borrar una cuenta también se borran tus preguntas y nuestras respuestas.",
      links:
        "Los enlaces de confirmación de correo caducan a las 24 horas y los códigos para restablecer la contraseña a los 15 minutos; después se borran.",
      abuse: "Recuentos para evitar abusos: se borran a los 8 días.",
      visits:
        "Recuentos de visitas: Vercel los conserva como totales; el valor que distingue las visitas se descarta a las 24 horas.",
    },
    years: { one: "{n} año", other: "{n} años" },
    rights: {
      title: "Tus derechos",
      body: "Puedes pedir ver los datos que tenemos sobre ti, que se corrijan o se borren, u oponerte a cómo los usamos. Envía un mensaje a través de {ask} diciendo lo que necesitas y te responderemos en el plazo de un mes.",
      complain:
        "Si no estás conforme con nuestra respuesta, puedes presentar una reclamación ante la Data Protection Commission (la autoridad irlandesa de protección de datos) en {dpc}.",
    },
    changes: {
      title: "Cambios",
      body: "Cuando cambie este aviso, cambiará también la fecha de arriba.",
    },
  },

  pt: {
    meta: {
      title: "Privacidade",
      description: "O que a Irish Fintax recolhe, por quê, quem trata os dados e por quanto tempo são guardados.",
    },
    hero: {
      eyebrow: "Privacidade",
      title: "Os seus dados na Irish Fintax.",
      lede: "O que o site recolhe, por quê, quem trata os dados e por quanto tempo são guardados.",
    },
    updated: "Última atualização: {date}.",
    translation: "Esta é uma tradução. Se divergir do {english}, vale a versão em inglês.",
    englishLink: "aviso em inglês",
    ask: "Faça uma pergunta",
    who: {
      title: "Quem é o responsável",
      body: "A Irish Fintax (irishfintax.ie) é um site para aprender sobre impostos e finanças pessoais na Irlanda. A Irish Fintax decide como são usados os dados pessoais descritos aqui. Para qualquer assunto sobre os seus dados, envie uma mensagem por {ask}.",
    },
    calculators: {
      title: "As calculadoras",
      body: "As calculadoras funcionam no seu navegador. Os números que você digita não são enviados para nós nem guardados, e você não precisa de uma conta para usá-las.",
    },
    collect: {
      title: "O que recolhemos e por quê",
      items: [
        {
          label: "Quando você faz uma pergunta:",
          body: "o seu nome, e-mail, empresa se a indicar, o tema escolhido, a sua mensagem e as nossas respostas. Usamos esses dados para lhe responder. Se tiver uma conta com o mesmo e-mail confirmado, a pergunta aparece também na sua conta.",
        },
        {
          label: "Quando você cria uma conta:",
          body: "o seu nome, e-mail e senha. A senha é guardada apenas numa forma embaralhada (um hash de sentido único) que não pode ser convertida de volta na senha. Se entrar com o Google, o Google nos dá em vez disso o seu nome, e-mail e o endereço da sua foto de perfil.",
        },
        {
          label: "Quando você pede um recurso do Accounting Hub:",
          body: "o seu nome, telefone, e-mail, site e para que precisa dele. Usamos esses dados para lhe enviar o recurso.",
        },
        {
          label: "Quando você visita uma página:",
          body: "o Vercel Web Analytics conta a visita. Ele registra o endereço da página (sem nada do que vem depois de um “?”), o site de onde você veio, o seu país e cidade, e o seu dispositivo, navegador e sistema operacional. Não define cookies nem identifica você: as visitas são distinguidas por um valor embaralhado calculado a partir do pedido, que é descartado após 24 horas. As páginas de login, de conta e de administração não são contadas. Usamos os totais para ver que páginas são úteis.",
        },
        {
          label: "Para impedir abusos:",
          body: "o site conta as tentativas de login e de envio de formulários. Guarda apenas uma forma embaralhada do seu endereço IP e do seu e-mail, nunca os endereços em si.",
        },
        {
          label: "E-mails que enviamos:",
          body: "um link para confirmar o seu endereço, códigos para redefinir a senha, uma confirmação de receção quando faz uma pergunta e as nossas respostas.",
        },
      ],
      basis:
        "Usamos estes dados para fazer o que você pediu (responder à sua pergunta, manter a sua conta, enviar um recurso) e para manter o site seguro e ver que páginas são usadas, o que é do nosso interesse legítimo.",
    },
    processors: {
      title: "Quem trata os dados por nós",
      items: [
        "A {name} hospeda o site, em servidores em Dublin, e conta as visitas (Web Analytics, acima). Como qualquer serviço de hospedagem, guarda registos de pedidos de curta duração (hora, página e endereço IP).",
        "O {name} guarda a base de dados, na Amazon Web Services em Dublin.",
        "A {name} entrega os e-mails que enviamos.",
        "O {name}, apenas se escolher entrar com o Google.",
        "O {name} fornece algumas das fotos, por isso o seu navegador as busca nos servidores do Unsplash, como faz com qualquer imagem hospedada noutro lugar.",
      ],
      outside:
        "Algumas destas empresas têm sede fora da UE e podem tratar dados lá, com as garantias dos seus próprios termos. Não vendemos os seus dados nem os usamos para publicidade.",
    },
    cookies: {
      title: "Cookies",
      body: "Apenas os cookies necessários para entrar: um mantém a sua sessão iniciada, um protege o formulário de login e um lembra para que página voltar. As visitas são contadas sem cookies, e não há cookies de publicidade, por isso não há nada para aceitar ou recusar.",
    },
    keep: {
      title: "Por quanto tempo guardamos",
      questions: "Perguntas e as nossas respostas: apagadas automaticamente {years} após a última mensagem.",
      resources: "Pedidos de recursos: apagados automaticamente {years} após o pedido.",
      accounts:
        "Contas: guardadas até você apagar a sua (Configurações, depois Excluir minha conta) ou nos pedir. Apagar uma conta apaga também as suas perguntas e as nossas respostas.",
      links:
        "Os links de confirmação de e-mail expiram após 24 horas e os códigos de redefinição de senha após 15 minutos; depois disso, são apagados.",
      abuse: "Contagens para prevenir abusos: apagadas após 8 dias.",
      visits:
        "Contagens de visitas: guardadas pela Vercel como totais; o valor que distingue as visitas é descartado após 24 horas.",
    },
    years: { one: "{n} ano", other: "{n} anos" },
    rights: {
      title: "Os seus direitos",
      body: "Você pode pedir para ver os dados que temos sobre você, corrigi-los ou apagá-los, ou opor-se à forma como os usamos. Envie uma mensagem por {ask} dizendo o que precisa, e responderemos no prazo de um mês.",
      complain:
        "Se não ficar satisfeito com a nossa resposta, pode apresentar uma reclamação à Data Protection Commission (a autoridade irlandesa de proteção de dados) em {dpc}.",
    },
    changes: {
      title: "Alterações",
      body: "Quando este aviso mudar, a data no topo muda com ele.",
    },
  },

  ga: {
    meta: {
      title: "Príobháideacht",
      description: "Cad a bhailíonn Irish Fintax, cén fáth, cé a láimhseálann é agus cá fhad a choinnítear é.",
    },
    hero: {
      eyebrow: "Príobháideacht",
      title: "Do shonraí ar Irish Fintax.",
      lede: "Cad a bhailíonn an suíomh, cén fáth, cé a láimhseálann é agus cá fhad a choinnítear é.",
    },
    updated: "Nuashonraithe go deireanach {date}.",
    translation: "Aistriúchán é seo. Má tá difríocht idir é agus an {english}, is é an leagan Béarla atá i bhfeidhm.",
    englishLink: "fógra Béarla",
    ask: "Cuir ceist",
    who: {
      title: "Cé atá freagrach",
      body: "Is suíomh é Irish Fintax (irishfintax.ie) chun foghlaim faoi cháin agus airgeadas pearsanta in Éirinn. Is é Irish Fintax a shocraíonn conas a úsáidtear na sonraí pearsanta a ndéantar cur síos orthu anseo. Maidir le haon rud faoi do shonraí, seol teachtaireacht trí {ask}.",
    },
    calculators: {
      title: "Na háireamháin",
      body: "Oibríonn na háireamháin i do bhrabhsálaí. Ní sheoltar chugainn na figiúirí a chlóscríobhann tú agus ní stóráiltear iad, agus níl cuntas de dhíth ort chun iad a úsáid.",
    },
    collect: {
      title: "Cad a bhailímid, agus cén fáth",
      items: [
        {
          label: "Nuair a chuireann tú ceist:",
          body: "d’ainm, do sheoladh ríomhphoist, do chomhlacht má thugann tú é, an t-ábhar a roghnaíonn tú, do theachtaireacht agus ár bhfreagraí. Úsáidimid iad chun freagra a thabhairt ort. Má tá cuntas agat leis an seoladh ríomhphoist deimhnithe céanna, beidh an cheist le feiceáil i do chuntas freisin.",
        },
        {
          label: "Nuair a chruthaíonn tú cuntas:",
          body: "d’ainm, do sheoladh ríomhphoist agus do phasfhocal. Ní stóráiltear an pasfhocal ach i bhfoirm scrofa (haisc aontreo) nach féidir a iompú ar ais ina phasfhocal. Má shíníonn tú isteach le Google, tugann Google d’ainm, do sheoladh ríomhphoist agus seoladh do phictiúir phróifíle dúinn ina ionad sin.",
        },
        {
          label: "Nuair a iarrann tú acmhainn ón Accounting Hub:",
          body: "d’ainm, d’uimhir theileafóin, do sheoladh ríomhphoist, do shuíomh gréasáin agus cad chuige a bhfuil sé uait. Úsáidimid iad chun an acmhainn a sheoladh chugat.",
        },
        {
          label: "Nuair a thugann tú cuairt ar leathanach:",
          body: "comhaireann Vercel Web Analytics an chuairt. Taifeadann sé seoladh an leathanaigh (gan aon rud i ndiaidh “?”), an suíomh as ar tháinig tú, do thír agus do chathair, agus do ghléas, do bhrabhsálaí agus do chóras oibriúcháin. Ní shocraíonn sé fianáin agus ní aithníonn sé thú: déantar idirdhealú idir cuairteanna le luach scrofa a oibrítear amach ón iarratas, agus caitear é sin i leataobh tar éis 24 uair an chloig. Ní chomhairtear leathanaigh síniú isteach, cuntais ná riaracháin. Úsáidimid na hiomláin chun a fheiceáil cé na leathanaigh atá úsáideach.",
        },
        {
          label: "Chun mí-úsáid a stopadh:",
          body: "comhaireann an suíomh iarrachtaí síniú isteach agus foirmeacha. Ní choinníonn sé ach foirm scrofa de do sheoladh IP agus de do sheoladh ríomhphoist, riamh na seoltaí féin.",
        },
        {
          label: "Ríomhphoist a sheolaimid:",
          body: "nasc chun do sheoladh a dhearbhú, cóid chun do phasfhocal a athshocrú, admháil nuair a chuireann tú ceist, agus ár bhfreagraí.",
        },
      ],
      basis:
        "Úsáidimid na sonraí seo chun an rud a d’iarr tú a dhéanamh (do cheist a fhreagairt, do chuntas a reáchtáil, acmhainn a sheoladh), agus chun an suíomh a choinneáil slán agus a fheiceáil cé na leathanaigh a úsáidtear, rud atá ar mhaithe lenár leas dlisteanach.",
    },
    processors: {
      title: "Cé a láimhseálann é dúinn",
      items: [
        "Óstálann {name} an suíomh, ar fhreastalaithe i mBaile Átha Cliath, agus comhaireann sé cuairteanna (Web Analytics, thuas). Cosúil le haon óstach, coinníonn sé logaí iarratas gearrshaolacha (am, leathanach agus seoladh IP).",
        "Stórálann {name} an bunachar sonraí, ar Amazon Web Services i mBaile Átha Cliath.",
        "Seachadann {name} na ríomhphoist a sheolaimid.",
        "{name}, ach amháin má roghnaíonn tú síniú isteach le Google.",
        "Soláthraíonn {name} cuid de na grianghraif, mar sin faigheann do bhrabhsálaí iad ó fhreastalaithe Unsplash, mar a dhéanann sé le haon íomhá a óstáiltear in áit eile.",
      ],
      outside:
        "Tá cuid de na comhlachtaí seo lonnaithe lasmuigh den AE agus féadfaidh siad sonraí a láimhseáil ansin faoi na cosaintí ina dtéarmaí féin. Ní dhíolaimid do shonraí agus ní úsáidimid iad le haghaidh fógraíochta.",
    },
    cookies: {
      title: "Fianáin",
      body: "Na fianáin atá riachtanach chun síniú isteach amháin: coinníonn ceann amháin sínithe isteach thú, cosnaíonn ceann eile an fhoirm síniú isteach, agus cuimhníonn ceann eile ar an leathanach le filleadh air. Comhairtear cuairteanna gan fianáin, agus níl aon fhianáin fógraíochta ann, mar sin níl aon rud le glacadh leis ná le diúltú dó.",
    },
    keep: {
      title: "Cá fhad a choinnímid é",
      questions: "Ceisteanna agus ár bhfreagraí: scriostar iad go huathoibríoch {years} tar éis na teachtaireachta deireanaí.",
      resources: "Iarratais ar acmhainní: scriostar iad go huathoibríoch {years} tar éis an iarratais.",
      accounts:
        "Cuntais: coinnítear iad go dtí go scriosann tú do chuntas (Socruithe, ansin Scrios mo chuntas) nó go n-iarrann tú orainn é a dhéanamh. Nuair a scriostar cuntas, scriostar do cheisteanna agus ár bhfreagraí freisin.",
      links:
        "Téann naisc dearbhaithe ríomhphoist in éag tar éis 24 uair an chloig agus cóid athshocraithe pasfhocail tar éis 15 nóiméad; scriostar iad ansin.",
      abuse: "Comhairimh chun mí-úsáid a chosc: scriostar iad tar éis 8 lá.",
      visits:
        "Comhairimh cuairteanna: coinníonn Vercel iad mar iomláin; caitear an luach a dhéanann idirdhealú idir cuairteanna i leataobh tar éis 24 uair an chloig.",
    },
    years: { one: "{n} bhliain", two: "{n} bhliain", few: "{n} bliana", many: "{n} mbliana", other: "{n} bliain" },
    rights: {
      title: "Do chearta",
      body: "Is féidir leat iarraidh na sonraí atá againn fút a fheiceáil, iad a cheartú nó a scriosadh, nó agóid a dhéanamh i gcoinne an chaoi a n-úsáidimid iad. Seol teachtaireacht trí {ask} ag rá cad atá uait, agus tabharfaimid freagra laistigh de mhí.",
      complain:
        "Mura bhfuil tú sásta lenár bhfreagra, is féidir leat gearán a dhéanamh leis an gCoimisiún um Chosaint Sonraí ag {dpc}.",
    },
    changes: {
      title: "Athruithe",
      body: "Nuair a athraíonn an fógra seo, athraíonn an dáta ag an mbarr leis.",
    },
  },

  ar: {
    meta: {
      title: "الخصوصية",
      description: "ما الذي يجمعه Irish Fintax، ولماذا، ومن يتعامل معه، وكم من الوقت يُحتفظ به.",
    },
    hero: {
      eyebrow: "الخصوصية",
      title: "بياناتك على Irish Fintax.",
      lede: "ما الذي يجمعه الموقع، ولماذا، ومن يتعامل معه، وكم من الوقت يُحتفظ به.",
    },
    updated: "آخر تحديث: {date}.",
    translation: "هذه ترجمة. إذا اختلفت عن {english}، فإن النسخة الإنجليزية هي التي تسري.",
    englishLink: "الإشعار باللغة الإنجليزية",
    ask: "اطرح سؤالًا",
    who: {
      title: "الجهة المسؤولة",
      body: "Irish Fintax (irishfintax.ie) موقع لتعلّم الضرائب والتمويل الشخصي في أيرلندا. ويحدد Irish Fintax كيفية استخدام البيانات الشخصية الموصوفة هنا. لأي أمر يتعلق ببياناتك، أرسل رسالة عبر {ask}.",
    },
    calculators: {
      title: "الحاسبات",
      body: "تعمل الحاسبات في متصفحك. الأرقام التي تكتبها لا تُرسل إلينا ولا تُخزَّن، ولا تحتاج إلى حساب لاستخدامها.",
    },
    collect: {
      title: "ما الذي نجمعه ولماذا",
      items: [
        {
          label: "عندما تطرح سؤالًا:",
          body: "اسمك، وبريدك الإلكتروني، واسم شركتك إن ذكرته، والموضوع الذي تختاره، ورسالتك وردودنا. نستخدمها للرد عليك. وإذا كان لديك حساب بعنوان البريد الإلكتروني المؤكد نفسه، يظهر السؤال في حسابك أيضًا.",
        },
        {
          label: "عندما تنشئ حسابًا:",
          body: "اسمك، وبريدك الإلكتروني، وكلمة المرور. تُخزَّن كلمة المرور بصيغة مشفّرة فقط (تجزئة أحادية الاتجاه) لا يمكن إرجاعها إلى كلمة المرور. وإذا سجّلت الدخول عبر Google، يعطينا Google بدلًا من ذلك اسمك، وبريدك الإلكتروني، وعنوان صورة ملفك الشخصي.",
        },
        {
          label: "عندما تطلب موردًا من Accounting Hub:",
          body: "اسمك، ورقم هاتفك، وبريدك الإلكتروني، وموقعك الإلكتروني، والغرض الذي تحتاجه من أجله. نستخدمها لإرسال المورد إليك.",
        },
        {
          label: "عندما تزور صفحة:",
          body: "يحسب Vercel Web Analytics الزيارة. يسجل عنوان الصفحة (دون أي شيء بعد علامة “?”)، والموقع الذي جئت منه، وبلدك ومدينتك، وجهازك ومتصفحك ونظام التشغيل. لا يضع ملفات تعريف ارتباط ولا يحدد هويتك: تُميَّز الزيارات بقيمة مشفّرة تُحسب من الطلب، وتُحذف بعد 24 ساعة. لا تُحسب صفحات تسجيل الدخول والحساب والإدارة. نستخدم المجاميع لنعرف أي الصفحات مفيدة.",
        },
        {
          label: "لمنع إساءة الاستخدام:",
          body: "يحسب الموقع محاولات تسجيل الدخول وإرسال النماذج. ولا يحتفظ إلا بصيغة مشفّرة من عنوان IP الخاص بك وبريدك الإلكتروني، وليس العناوين نفسها أبدًا.",
        },
        {
          label: "الرسائل التي نرسلها:",
          body: "رابط لتأكيد عنوانك، ورموز لإعادة تعيين كلمة المرور، وإشعار بالاستلام عندما تطرح سؤالًا، وردودنا.",
        },
      ],
      basis:
        "نستخدم هذه البيانات لتنفيذ ما طلبته (الرد على سؤالك، وتشغيل حسابك، وإرسال مورد)، وللحفاظ على أمان الموقع ومعرفة الصفحات المستخدمة، وهذا من مصلحتنا المشروعة.",
    },
    processors: {
      title: "من يتعامل معها نيابة عنا",
      items: [
        "تستضيف {name} الموقع على خوادم في دبلن، وتحسب الزيارات (Web Analytics، أعلاه). ومثل أي مستضيف، تحتفظ بسجلات طلبات قصيرة الأجل (الوقت والصفحة وعنوان IP).",
        "يخزّن {name} قاعدة البيانات على Amazon Web Services في دبلن.",
        "تتولى {name} توصيل الرسائل التي نرسلها.",
        "{name}، فقط إذا اخترت تسجيل الدخول عبر Google.",
        "يقدّم {name} بعض الصور، لذا يجلبها متصفحك من خوادم Unsplash، كما يفعل مع أي صورة مستضافة في مكان آخر.",
      ],
      outside:
        "بعض هذه الشركات مقرها خارج الاتحاد الأوروبي وقد تتعامل مع البيانات هناك وفق الضمانات الواردة في شروطها. نحن لا نبيع بياناتك ولا نستخدمها للإعلانات.",
    },
    cookies: {
      title: "ملفات تعريف الارتباط",
      body: "فقط ملفات تعريف الارتباط اللازمة لتسجيل الدخول: واحد يبقيك مسجّل الدخول، وواحد يحمي نموذج تسجيل الدخول، وواحد يتذكر الصفحة التي تعود إليها. تُحسب الزيارات دون ملفات تعريف ارتباط، ولا توجد ملفات تعريف ارتباط إعلانية، لذا لا يوجد ما تقبله أو ترفضه.",
    },
    keep: {
      title: "كم من الوقت نحتفظ بها",
      questions: "الأسئلة وردودنا: تُحذف تلقائيًا بعد {years} من آخر رسالة.",
      resources: "طلبات الموارد: تُحذف تلقائيًا بعد {years} من الطلب.",
      accounts:
        "الحسابات: نحتفظ بها حتى تحذف حسابك (الإعدادات، ثم احذف حسابي) أو تطلب منا ذلك. وحذف الحساب يحذف أيضًا أسئلتك وردودنا.",
      links:
        "تنتهي صلاحية روابط تأكيد البريد الإلكتروني بعد 24 ساعة، ورموز إعادة تعيين كلمة المرور بعد 15 دقيقة، ثم تُحذف كلتاهما.",
      abuse: "عدّادات منع إساءة الاستخدام: تُحذف بعد 8 أيام.",
      visits: "عدّادات الزيارات: تحتفظ بها Vercel كمجاميع، وتُحذف القيمة التي تميّز الزيارات بعد 24 ساعة.",
    },
    years: { zero: "{n} سنة", one: "سنة واحدة", two: "سنتين", few: "{n} سنوات", many: "{n} سنة", other: "{n} سنة" },
    rights: {
      title: "حقوقك",
      body: "يمكنك أن تطلب الاطلاع على البيانات التي نحتفظ بها عنك، أو تصحيحها أو حذفها، أو الاعتراض على طريقة استخدامنا لها. أرسل رسالة عبر {ask} تذكر فيها ما تحتاجه، وسنرد في غضون شهر واحد.",
      complain:
        "إذا لم تكن راضيًا عن ردنا، يمكنك تقديم شكوى إلى Data Protection Commission (هيئة حماية البيانات في أيرلندا) على {dpc}.",
    },
    changes: {
      title: "التغييرات",
      body: "عندما يتغير هذا الإشعار، يتغير التاريخ في الأعلى معه.",
    },
  },

  bn: {
    meta: {
      title: "গোপনীয়তা নীতি",
      description: "Irish Fintax কী তথ্য সংগ্রহ করে, কেন করে, কারা এটি পরিচালনা করে আর কতদিন তা সংরক্ষণ করা হয়।",
    },
    hero: {
      eyebrow: "গোপনীয়তা",
      title: "Irish Fintax-এ আপনার তথ্য।",
      lede: "এই সাইট কী তথ্য সংগ্রহ করে, কেন করে, কারা এটি পরিচালনা করে আর কতদিন তা সংরক্ষণ করা হয়।",
    },
    updated: "সর্বশেষ হালনাগাদ {date}।",
    translation: "এটি একটি অনুবাদ। {english}-এর সাথে কোনো অমিল দেখা দিলে ইংরেজি সংস্করণটিই কার্যকর হবে।",
    englishLink: "ইংরেজি নোটিশ",
    ask: "একটি প্রশ্ন করুন",
    who: {
      title: "কারা দায়িত্বে রয়েছে",
      body: "Irish Fintax (irishfintax.ie) আইরিশ কর ও ব্যক্তিগত অর্থব্যবস্থা শেখার একটি প্ল্যাটফর্ম। এখানে বর্ণিত ব্যক্তিগত তথ্য কীভাবে ব্যবহৃত হবে তা Irish Fintax নির্ধারণ করে। আপনার তথ্যের বিষয়ে যেকোনো তথ্যের জন্য {ask}-এর মাধ্যমে বার্তা পাঠান।",
    },
    calculators: {
      title: "ক্যালকুলেটরসমূহ",
      body: "ক্যালকুলেটরগুলো আপনার ব্রাউজারেই চলে। আপনি যেসব সংখ্যা টাইপ করেন তা আমাদের কাছে পাঠানো হয় না বা সংরক্ষণ করা হয় না, এবং এগুলো ব্যবহার করার জন্য কোনো অ্যাকাউন্টের প্রয়োজন নেই।",
    },
    collect: {
      title: "আমরা কী সংগ্রহ করি, আর কেন করি",
      items: [
        {
          label: "যখন আপনি কোনো প্রশ্ন করেন:",
          body: "আপনার নাম, ইমেইল ঠিকানা, উল্লেখ করলে কোম্পানির নাম, নির্বাচিত বিষয়, আপনার বার্তা এবং আমাদের উত্তর। আমরা আপনাকে উত্তর দেওয়ার জন্য এগুলো ব্যবহার করি। একই নিশ্চিতকৃত ইমেইল ঠিকানায় আপনার অ্যাকাউন্ট থাকলে প্রশ্নটি আপনার অ্যাকাউন্টেও প্রদর্শিত হয়।",
        },
        {
          label: "যখন আপনি একটি অ্যাকাউন্ট তৈরি করেন:",
          body: "আপনার নাম, ইমেইল ঠিকানা এবং পাসওয়ার্ড। পাসওয়ার্ডটি কেবল ক্রিপ্টোগ্রাফিক হ্যাশ (একমুখী হ্যাশ) হিসেবে সংরক্ষিত থাকে যা থেকে মূল পাসওয়ার্ড উদ্ধার করা সম্ভব নয়। আপনি যদি Google দিয়ে সাইন ইন করেন, তবে Google আমাদের আপনার নাম, ইমেইল ঠিকানা এবং প্রোফাইল ছবির ঠিকানা সরবরাহ করে।",
        },
        {
          label: "যখন আপনি Accounting Hub থেকে কোনো রিসোর্সের অনুরোধ করেন:",
          body: "আপনার নাম, ফোন নম্বর, ইমেইল ঠিকানা, ওয়েবসাইট এবং এটি আপনার কী কাজে লাগবে। আমরা আপনাকে রিসোর্সটি পাঠানোর জন্য এগুলো ব্যবহার করি।",
        },
        {
          label: "যখন আপনি কোনো পৃষ্ঠা পরিদর্শন করেন:",
          body: "Vercel Web Analytics ভিজিটের সংখ্যা গণনা করে। এটি পেজের ঠিকানা (\"?\"-এর পরের অংশ ছাড়া), যে সাইট থেকে এসেছেন, দেশ ও শহর এবং আপনার ডিভাইস, ব্রাউজার ও অপারেটিং সিস্টেম রেকর্ড করে। এটি কোনো কুকি সেট করে না এবং আপনাকে ব্যক্তিগতভাবে শনাক্ত করে না: রিকোয়েস্ট থেকে তৈরি একটি এনক্রিপ্টেড মানের মাধ্যমে বিভিন্ন ভিজিট আলাদা করা হয়, যা 24 ঘণ্টা পর মুছে ফেলা হয়। সাইন-ইন, অ্যাকাউন্ট এবং অ্যাডমিন পেজ গণনা করা হয় না। কোন পৃষ্ঠাগুলো মানুষের কাজে লাগছে তা দেখার জন্য আমরা এই মোট পরিসংখ্যান ব্যবহার করি।",
        },
        {
          label: "অপব্যবহার রোধ করতে:",
          body: "সাইটটি সাইন-ইন এবং ফরম জমা দেওয়ার চেষ্টার সংখ্যা গণনা করে। এটি কেবল আপনার আইপি ঠিকানা ও ইমেইল ঠিকানার একটি এনক্রিপ্ট করা রূপ সংরক্ষণ করে, কখনই মূল ঠিকানাগুলো নয়।",
        },
        {
          label: "আমাদের পাঠানো ইমেইলসমূহ:",
          body: "আপনার ঠিকানা নিশ্চিত করার লিংক, পাসওয়ার্ড রিসেট কোড, প্রশ্ন জমা দেওয়ার প্রাপ্তিস্বীকার এবং আমাদের উত্তর।",
        },
      ],
      basis:
        "আপনি যা চেয়েছেন তা সম্পন্ন করতে (প্রশ্নের উত্তর দেওয়া, অ্যাকাউন্ট পরিচালনা, রিসোর্স পাঠানো), সাইট নিরাপদ রাখতে এবং কোন পৃষ্ঠাগুলো ব্যবহৃত হচ্ছে তা দেখতে আমরা এই তথ্য ব্যবহার করি, যা আমাদের বৈধ স্বার্থের অন্তর্ভুক্ত।",
    },
    processors: {
      title: "আমাদের পক্ষে কারা এটি পরিচালনা করে",
      items: [
        "{name} ডাবলিনের সার্ভারে সাইট হোস্ট করে এবং ভিজিট গণনা করে (উপরে উল্লিখিত Web Analytics)। যেকোনো হোস্টের মতো এটিও স্বল্পস্থায়ী রিকোয়েস্ট লগ (সময়, পেজ এবং আইপি ঠিকানা) রাখে।",
        "{name} ডাবলিনে Amazon Web Services-এ ডাটাবেস সংরক্ষণ করে।",
        "{name} আমাদের পাঠানো ইমেইলগুলো পৌঁছে দেয়।",
        "{name}, কেবলমাত্র আপনি যদি Google দিয়ে সাইন ইন করতে চান।",
        "{name} কিছু ছবি সরবরাহ করে, ফলে অন্য কোথাও হোস্ট করা ছবির মতো আপনার ব্রাউজার Unsplash-এর সার্ভার থেকে সেগুলো সংগ্রহ করে।",
      ],
      outside:
        "এই কোম্পানিগুলোর কয়েকটি ইইউ-এর বাইরে অবস্থিত এবং তাদের নিজস্ব শর্তাবলীর সুরক্ষার অধীনে সেখানে তথ্য প্রক্রিয়া করতে পারে। আমরা আপনার তথ্য বিক্রি করি না বা বিজ্ঞাপনের জন্য ব্যবহার করি না।",
    },
    cookies: {
      title: "কুকিজ",
      body: "লগইন করার জন্য কেবলমাত্র প্রয়োজনীয় কুকিজ: একটি আপনাকে সাইন-ইন রাখে, একটি সাইন-ইন ফরম সুরক্ষিত রাখে এবং অন্যটি মনে রাখে কোন পৃষ্ঠায় ফিরে যেতে হবে। ভিজিট গণনায় কোনো কুকি ব্যবহৃত হয় না এবং কোনো বিজ্ঞাপন কুকিজ নেই, তাই গ্রহণ বা প্রত্যাখ্যান করার মতো কিছু নেই।",
    },
    keep: {
      title: "আমরা কতদিন তথ্য সংরক্ষণ করি",
      questions: "প্রশ্ন এবং আমাদের উত্তর: সর্বশেষ বার্তার {years} পর স্বয়ংক্ৰিয়ভাবে মুছে ফেলা হয়।",
      resources: "রিসোর্সের অনুরোধ: অনুরোধের {years} পর স্বয়ংক্ৰিয়ভাবে মুছে ফেলা হয়।",
      accounts:
        "অ্যাকাউন্ট: আপনি নিজের অ্যাকাউন্ট মুছে না ফেলা পর্যন্ত (সেটিংস, তারপর 'আমার অ্যাকাউন্ট মুছে ফেলুন') অথবা আমাদের তা করতে না বলা পর্যন্ত সংরক্ষিত থাকে। অ্যাকাউন্ট মুছে ফেললে আপনার প্রশ্ন ও আমাদের উত্তরও মুছে যায়।",
      links:
        "ইমেইল নিশ্চিতকরণ লিংক 24 ঘণ্টা পর এবং পাসওয়ার্ড রিসেট কোড 15 মিনিট পর মেয়াদোত্তীর্ণ হয়; উভয়ই তখন মুছে ফেলা হয়।",
      abuse: "অপব্যবহার প্রতিরোধ গণনা: 8 দিন পর মুছে ফেলা হয়।",
      visits:
        "ভিজিট গণনা: Vercel মোট সংখ্যা হিসেবে সংরক্ষণ করে; ভিজিট আলাদা করার মানটি 24 ঘণ্টা পর বাতিল করা হয়।",
    },
    years: { one: "{n} বছর", other: "{n} বছর" },
    rights: {
      title: "আপনার অধিকারসমূহ",
      body: "আপনার সম্পর্কে আমাদের কাছে থাকা তথ্য দেখতে চাওয়া, তা সংশোধন বা মুছে ফেলার অনুরোধ করা, অথবা আমরা কীভাবে এটি ব্যবহার করছি সে বিষয়ে আপত্তি জানানোর অধিকার আপনার রয়েছে। আপনার কী প্রয়োজন তা জানিয়ে {ask}-এর মাধ্যমে বার্তা পাঠান, আমরা এক মাসের মধ্যে উত্তর দেব।",
      complain:
        "আমাদের উত্তরে সন্তুষ্ট না হলে আপনি Data Protection Commission-এ {dpc} অভিযোগ করতে পারেন।",
    },
    changes: {
      title: "পরিবর্তন",
      body: "এই নোটিশে কোনো পরিবর্তন আনা হলে পৃষ্ঠার শীর্ষের তারিখটিও পরিবর্তিত হয়।",
    },
  },

  hi: {
    meta: {
      title: "निजता",
      description: "Irish Fintax क्या इकट्ठा करता है, क्यों, उसे कौन सँभालता है और उसे कितने समय तक रखा जाता है।",
    },
    hero: {
      eyebrow: "निजता",
      title: "Irish Fintax पर आपका डेटा।",
      lede: "साइट क्या इकट्ठा करती है, क्यों, उसे कौन सँभालता है और उसे कितने समय तक रखा जाता है।",
    },
    updated: "पिछला अपडेट: {date}।",
    translation: "यह एक अनुवाद है। अगर यह {english} से अलग हो, तो अंग्रेज़ी संस्करण ही लागू होता है।",
    englishLink: "अंग्रेज़ी नोटिस",
    ask: "सवाल पूछें",
    who: {
      title: "ज़िम्मेदार कौन है",
      body: "Irish Fintax (irishfintax.ie) आयरलैंड के टैक्स और निजी वित्त के बारे में सीखने की एक साइट है। यहाँ बताए गए निजी डेटा का इस्तेमाल कैसे होगा, यह Irish Fintax तय करता है। अपने डेटा से जुड़ी किसी भी बात के लिए {ask} के ज़रिए संदेश भेजें।",
    },
    calculators: {
      title: "कैलकुलेटर",
      body: "कैलकुलेटर आपके ब्राउज़र में चलते हैं। आप जो आँकड़े लिखते हैं, वे न हमें भेजे जाते हैं न सहेजे जाते हैं, और इन्हें इस्तेमाल करने के लिए अकाउंट की ज़रूरत नहीं है।",
    },
    collect: {
      title: "हम क्या इकट्ठा करते हैं, और क्यों",
      items: [
        {
          label: "जब आप सवाल पूछते हैं:",
          body: "आपका नाम, ईमेल पता, कंपनी अगर आप बताएँ, आपका चुना हुआ विषय, आपका संदेश और हमारे जवाब। आपको जवाब देने के लिए हम इनका इस्तेमाल करते हैं। अगर उसी पुष्ट ईमेल पते से आपका अकाउंट है, तो सवाल आपके अकाउंट में भी दिखता है।",
        },
        {
          label: "जब आप अकाउंट बनाते हैं:",
          body: "आपका नाम, ईमेल पता और पासवर्ड। पासवर्ड सिर्फ़ एक बदले हुए रूप (वन-वे हैश) में सहेजा जाता है, जिसे वापस पासवर्ड में नहीं बदला जा सकता। अगर आप Google से साइन इन करते हैं, तो Google इसकी जगह हमें आपका नाम, ईमेल पता और आपकी प्रोफ़ाइल तस्वीर का पता देता है।",
        },
        {
          label: "जब आप Accounting Hub से कोई संसाधन माँगते हैं:",
          body: "आपका नाम, फ़ोन नंबर, ईमेल पता, वेबसाइट और आपको इसकी ज़रूरत किसलिए है। संसाधन भेजने के लिए हम इनका इस्तेमाल करते हैं।",
        },
        {
          label: "जब आप कोई पेज देखते हैं:",
          body: "Vercel Web Analytics विज़िट गिनता है। यह पेज का पता (“?” के बाद का कुछ भी छोड़कर), आप किस साइट से आए, आपका देश और शहर, और आपका डिवाइस, ब्राउज़र और ऑपरेटिंग सिस्टम दर्ज करता है। यह कोई कुकी नहीं लगाता और आपकी पहचान नहीं करता: विज़िट को अनुरोध से निकाले गए एक बदले हुए मान से अलग पहचाना जाता है, जिसे 24 घंटे बाद हटा दिया जाता है। साइन-इन, अकाउंट और एडमिन पेज नहीं गिने जाते। कौन से पेज उपयोगी हैं, यह देखने के लिए हम कुल संख्याओं का इस्तेमाल करते हैं।",
        },
        {
          label: "दुरुपयोग रोकने के लिए:",
          body: "साइट साइन-इन और फ़ॉर्म भेजने की कोशिशें गिनती है। यह आपके IP पते और ईमेल पते का सिर्फ़ एक बदला हुआ रूप रखती है, पते ख़ुद कभी नहीं।",
        },
        {
          label: "हम जो ईमेल भेजते हैं:",
          body: "आपका पता पुष्ट करने का लिंक, पासवर्ड रीसेट करने के कोड, सवाल पूछने पर पावती, और हमारे जवाब।",
        },
      ],
      basis:
        "आपने जो माँगा वह करने के लिए (आपके सवाल का जवाब देना, आपका अकाउंट चलाना, संसाधन भेजना), और साइट को सुरक्षित रखने और यह देखने के लिए कि कौन से पेज इस्तेमाल होते हैं, हम इस डेटा का इस्तेमाल करते हैं, जो हमारे वैध हित में है।",
    },
    processors: {
      title: "हमारी ओर से इसे कौन सँभालता है",
      items: [
        "{name} डबलिन के सर्वरों पर साइट होस्ट करता है और विज़िट गिनता है (Web Analytics, ऊपर देखें)। किसी भी होस्ट की तरह यह कम समय के अनुरोध लॉग रखता है (समय, पेज और IP पता)।",
        "{name} डबलिन में Amazon Web Services पर डेटाबेस रखता है।",
        "{name} हमारे भेजे ईमेल पहुँचाता है।",
        "{name}, सिर्फ़ तब जब आप Google से साइन इन करना चुनें।",
        "{name} कुछ तस्वीरें देता है, इसलिए आपका ब्राउज़र उन्हें Unsplash के सर्वरों से लाता है, जैसे कहीं और रखी किसी भी तस्वीर के साथ होता है।",
      ],
      outside:
        "इनमें से कुछ कंपनियाँ EU के बाहर स्थित हैं और अपनी शर्तों में दी गई सुरक्षा के तहत वहाँ डेटा सँभाल सकती हैं। हम आपका डेटा न बेचते हैं, न विज्ञापन के लिए इस्तेमाल करते हैं।",
    },
    cookies: {
      title: "कुकी",
      body: "सिर्फ़ साइन इन के लिए ज़रूरी कुकी: एक आपको साइन इन रखती है, एक साइन-इन फ़ॉर्म की सुरक्षा करती है, और एक याद रखती है कि किस पेज पर लौटना है। विज़िट बिना कुकी के गिनी जाती हैं, और कोई विज्ञापन कुकी नहीं है, इसलिए स्वीकार या अस्वीकार करने को कुछ नहीं है।",
    },
    keep: {
      title: "हम इसे कितने समय तक रखते हैं",
      questions: "सवाल और हमारे जवाब: आख़िरी संदेश के {years} बाद अपने-आप हटा दिए जाते हैं।",
      resources: "संसाधन के अनुरोध: अनुरोध के {years} बाद अपने-आप हटा दिए जाते हैं।",
      accounts:
        "अकाउंट: तब तक रखे जाते हैं जब तक आप अपना अकाउंट न हटाएँ (सेटिंग्स, फिर मेरा अकाउंट हटाएँ) या हमसे न कहें। अकाउंट हटाने पर आपके सवाल और हमारे जवाब भी हट जाते हैं।",
      links:
        "ईमेल पुष्टि के लिंक 24 घंटे बाद और पासवर्ड रीसेट के कोड 15 मिनट बाद समाप्त हो जाते हैं; फिर दोनों हटा दिए जाते हैं।",
      abuse: "दुरुपयोग रोकने की गिनती: 8 दिन बाद हटा दी जाती है।",
      visits:
        "विज़िट की गिनती: Vercel कुल संख्या के रूप में रखता है; विज़िट को अलग पहचानने वाला मान 24 घंटे बाद हटा दिया जाता है।",
    },
    years: { one: "{n} साल", other: "{n} साल" },
    rights: {
      title: "आपके अधिकार",
      body: "आप हमसे अपने बारे में रखा गया डेटा देखने, उसे सुधारने या हटाने, या हमारे इस्तेमाल पर आपत्ति करने के लिए कह सकते हैं। आपको क्या चाहिए, यह बताते हुए {ask} के ज़रिए संदेश भेजें, और हम एक महीने के भीतर जवाब देंगे।",
      complain:
        "अगर आप हमारे जवाब से संतुष्ट नहीं हैं, तो आप {dpc} पर Data Protection Commission (आयरलैंड का डेटा सुरक्षा प्राधिकरण) से शिकायत कर सकते हैं।",
    },
    changes: {
      title: "बदलाव",
      body: "जब यह नोटिस बदलता है, तो ऊपर की तारीख़ भी उसके साथ बदल जाती है।",
    },
  },
};
