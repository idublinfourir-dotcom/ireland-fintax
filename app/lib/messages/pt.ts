import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Portuguese (Brazilian, você): the larger Portuguese-speaking community in
   Ireland. USC, PRSI, CGT and CAT stay as Revenue writes them. */
export const pt: Messages = {
  meta: {
    title: "Irish Fintax: aprenda sobre impostos e dinheiro",
    description:
      "Calculadoras, guias e modelos que explicam impostos e finanças pessoais na Irlanda em palavras simples: imposto de renda, IVA, CGT, financiamento imobiliário, investimentos e como abrir uma empresa.",
  },

  header: {
    taxHub: "Calculadoras",
    calculatorsHeading: "Calculadoras para a Irlanda",
    openCalculators: "Abrir as calculadoras",
    accounts: "Contabilidade",
    founderHeading: "Recursos para empreendedores",
    browseAccounts: "Ver a Central de contabilidade",
    founderResources: [
      { label: "Notas", desc: "Notas técnicas sobre dúvidas comuns" },
      { label: "Modelos", desc: "Demonstrativos, cálculos e checklists" },
      { label: "Formulários fiscais", desc: "Guias dos formulários da Revenue" },
      { label: "Formulários de IVA", desc: "Registro e o ciclo de declarações" },
      { label: "Guias para começar", desc: "Abrir e administrar uma empresa" },
    ],
    personal: "Finanças pessoais",
    personalHeading: "Finanças pessoais",
    openPersonal: "Abrir Finanças pessoais",
    budget: "Orçamento",
    blog: "Análises",
    about: "Sobre nós",
    investmentAccount: "Conta de investimento IE",
    adminDashboard: "Painel de administração",
    myDashboard: "Meu painel",
    account: "Conta",
    signIn: "Entrar",
    ask: "Faça uma pergunta",
    openMenu: "Abrir menu",
    submenu: "Menu de {label}",
    skip: "Pular para o conteúdo",
    closeMenu: "Fechar menu",
    language: "Idioma",
    tools: toolNames.pt,
  },

  footer: {
    blurb:
      "Calculadoras, guias e modelos que explicam impostos e finanças pessoais na Irlanda em palavras simples.",
    explore: "Explorar",
    links: {
      budget: "Orçamento",
      calculators: "Calculadoras de impostos",
      personal: "Finanças pessoais",
      accounts: "Central de contabilidade",
      blog: "Análises",
      about: "Sobre nós",
      faq: "Perguntas frequentes",
      ask: "Faça uma pergunta",
    },
    getInTouch: "Contato",
    language: "Idioma",
    rights: "Todos os direitos reservados.",
    privacy: "Privacidade",
    disclaimer: "Apenas informação geral, não é aconselhamento financeiro, fiscal ou jurídico.",
  },

  hero: {
    eyebrow: "Aprenda finanças · Irlanda",
    title: "Entenda impostos e dinheiro, *em palavras simples.*",
    lede:
      "Calculadoras, guias e modelos sobre impostos na Irlanda, financiamento imobiliário, investimentos e como abrir uma empresa. Aprenda como funciona e depois faça suas próprias contas.",
    cta: "Experimente as calculadoras",
    ask: "Faça uma pergunta",
  },

  quickEntries: [
    { title: "Calculadoras de impostos", note: "Imposto de renda, IVA, CGT, CAT e mais, para a Irlanda." },
    { title: "Finanças pessoais", note: "Simule um financiamento e compare formas de investir." },
    { title: "Abrir uma empresa", note: "Notas, modelos e guias para empreendedores." },
    { title: "Faça uma pergunta", note: "Travou em alguma coisa? Pergunte e a gente explica." },
  ],

  who: {
    eyebrow: "Um pouco sobre nós",
    title: "Primeiro entender. Depois decidir.",
    body: "A Irish Fintax é um site para aprender sobre impostos e finanças pessoais. Leia uma explicação clara, explore as ferramentas e aprenda no seu ritmo.",
    more: "Conheça a Irish Fintax",
    caption: "Abra espaço para uma visão mais clara.",
    principles: [
      { title: "Comece já", note: "Não precisa criar conta para começar." },
      { title: "Palavras simples", note: "A explicação do dia a dia, com os termos técnicos quando ajudam." },
      { title: "Fontes que você pode conferir", note: "Veja as fontes públicas por trás das regras." },
      { title: "Aprendizado, não aconselhamento", note: "Para decisões pessoais, fale com um consultor regulamentado." },
    ],
  },

  budget: {
    eyebrow: "{budget} · Explicado",
    title: "O Orçamento é grande. Comece pelo que *importa para você.*",
    body: "Mora de aluguel, vai comprar um imóvel, está juntando para a aposentadoria ou criando uma família? Explore as mudanças do Orçamento ligadas à sua situação.",
    cta: "Explore o {budget}",
    cardEyebrow: "Sua vida. Suas perguntas.",
    topics: ["Moradia e aluguel", "Trabalho e renda", "Família", "Poupança e aposentadoria"],
    caption: "Uma visão mais clara do que muda.",
  },

  calculators: {
    eyebrow: "Ferramentas para pensar com clareza",
    title: "Transforme suas perguntas em números.",
    lede: "Escolha uma calculadora. Mude os dados. Entenda o que se move.",
    caption: "Seus números. Uma imagem mais clara.",
    items: [
      { name: "Imposto de renda", note: "Explore seu salário líquido." },
      { name: "IVA", note: "Entenda o IVA a pagar ou a receber." },
      { name: "Imposto sobre empresas", note: "Explore o imposto sobre o lucro de uma empresa." },
      { name: "Ganho de capital", note: "Entenda o imposto quando você vende um bem." },
      { name: "Doações e heranças", note: "Explore o Capital Acquisitions Tax (CAT)." },
      { name: "Financiamento imobiliário", note: "Compare parcelas antes de decidir." },
    ],
    footnote: "As calculadoras são ferramentas de aprendizado. Confira as premissas e as fontes na página de cada ferramenta.",
  },

  learn: {
    eyebrow: "Um jeito simples de aprender",
    title: "De “o que isso quer dizer?” a “*agora eu entendi*.”",
    items: [
      { title: "Aprenda o básico", note: "Comece com guias e notas que explicam as regras em linguagem do dia a dia.", link: "Explore os guias" },
      { title: "Teste seus números", note: "Use as calculadoras para ver como números diferentes mudam o resultado.", link: "Encontre uma calculadora" },
      { title: "Pergunte o que não ficou claro", note: "Envie sua pergunta com suas palavras. Você não precisa dos termos técnicos.", link: "Faça uma pergunta" },
    ],
  },

  faq: {
    eyebrow: "Antes de começar",
    title: "Algumas coisas que você pode estar se perguntando.",
    items: [
      { question: "Preciso de uma conta?", answer: "Não precisa de conta para começar a explorar. Entrando na sua conta, você guarda perguntas e respostas em um só lugar." },
      { question: "Isto é aconselhamento financeiro ou fiscal?", answer: "Não. O site oferece informação geral de aprendizado. Fale com um consultor devidamente qualificado sobre decisões específicas da sua situação." },
      { question: "Por onde começo?", answer: "Comece por uma calculadora se tiver números para explorar, pela Central de contabilidade para guias, ou faça uma pergunta se precisar de ajuda para entender um tema." },
    ],
  },

  cta: {
    eyebrow: "Não existe pergunta básica",
    title: "Ainda tentando entender? *Vamos começar pela sua pergunta.*",
    body: "Pergunte sobre impostos ou dinheiro com suas palavras.",
    button: "Faça uma pergunta",
  },
};
