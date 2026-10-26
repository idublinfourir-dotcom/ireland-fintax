import type { Messages } from "./en.ts";
import { toolNames } from "./tool-names.ts";

/* Portuguese (Brazilian, você): the larger Portuguese-speaking community in
   Ireland. USC, PRSI, CGT and CAT stay as Revenue writes them. */
export const pt: Messages = {
  meta: {
    title: "Irish Fintax: aprenda grátis sobre impostos e dinheiro",
    description:
      "Calculadoras, guias e modelos gratuitos que explicam impostos e finanças pessoais na Irlanda em palavras simples: imposto de renda, IVA, CGT, financiamento imobiliário, investimentos e como abrir uma empresa.",
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
    skip: "Pular para o conteúdo",
    closeMenu: "Fechar menu",
    language: "Idioma",
    tools: toolNames.pt,
  },

  footer: {
    blurb:
      "Calculadoras, guias e modelos gratuitos que explicam impostos e finanças pessoais na Irlanda em palavras simples.",
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
    disclaimer: "Apenas informação geral, não é aconselhamento financeiro, fiscal ou jurídico.",
  },

  hero: {
    eyebrow: "Aprenda finanças grátis · Irlanda",
    title: "Entenda impostos e dinheiro, *em palavras simples.*",
    lede:
      "Calculadoras, guias e modelos gratuitos sobre impostos na Irlanda, financiamento imobiliário, investimentos e como abrir uma empresa. Aprenda como funciona e depois faça suas próprias contas.",
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
    eyebrow: "Quem somos",
    title: "Um lugar gratuito para aprender como funcionam os impostos e o dinheiro na Irlanda.",
    body: [
      "A Irish Fintax é uma plataforma de aprendizado gratuita. Explicamos impostos e finanças pessoais na Irlanda em palavras simples e oferecemos calculadoras para você testar seus próprios números, para entender o que está acontecendo antes de decidir qualquer coisa.",
      "Sem taxas, nada para vender e sem cadastro para começar.",
    ],
    more: "Mais sobre nós",
    principles: [
      { title: "Grátis, para todos", note: "Todas as calculadoras, guias e modelos são gratuitos, e você não precisa de conta para começar." },
      { title: "Palavras simples", note: "As regras explicadas do jeito que você explicaria a um amigo, sem jargão." },
      { title: "Baseado em fontes públicas", note: "As calculadoras usam as alíquotas publicadas pela Revenue e indicam a origem de cada número." },
      { title: "Informação, não aconselhamento", note: "Ajudamos você a entender. Para uma decisão que depende da sua situação, procure um consultor regulamentado." },
    ],
  },

  promos: {
    budget: {
      title: "O que o {budget} muda para você?",
      body: "Marque o que se aplica a você, de alugar ou comprar o primeiro imóvel a uma aposentadoria, um carro ou uma família, e veja só as mudanças que afetam você, em euros quando as regras permitem um valor exato. Feito com os números oficiais e calculado no seu navegador.",
      cta: "Veja o que muda para você",
    },
    calculators: {
      eyebrow: "Calculadoras",
      title: "Não fique só na leitura. Faça suas próprias contas.",
      body: "Imposto de renda, IVA, CGT, CAT, imposto sobre empresas e mais, tudo com as alíquotas irlandesas. Mude um número e veja o que acontece: é o jeito mais rápido de entender como um imposto funciona de verdade.",
      cta: "Experimente as calculadoras",
    },
    company: {
      eyebrow: "Central de contabilidade",
      title: "Vai abrir uma empresa? Comece aqui.",
      body: "Notas, modelos, formulários de impostos e de IVA e guias passo a passo para a Irlanda e o Reino Unido. Tudo grátis: diga qual você precisa e enviamos por e-mail.",
      cta: "Ver a Central de contabilidade",
    },
  },

  learn: {
    eyebrow: "Como aprender aqui",
    title: "Aprenda, experimente, *pergunte.*",
    lede: "Comece por onde preferir. A maioria lê um pouco, faz as próprias contas e só pergunta quando alguma coisa ainda não fecha.",
    items: [
      { title: "Aprenda", note: "Notas e guias em palavras simples sobre o que realmente costuma gerar dúvida." },
      { title: "Experimente", note: "Coloque seus próprios números nas calculadoras e veja o que muda." },
      { title: "Pergunte", note: "Ainda com dúvida? Pergunte com suas palavras e receba a resposta por e-mail." },
    ],
  },

  audiences: {
    eyebrow: "Para quem é",
    title: "Seja qual for a sua situação, comece aqui.",
    lede: "Dúvidas sobre impostos e dinheiro costumam surgir com as mudanças da vida. Estas são as que o site cobre hoje.",
    items: [
      { name: "Empregados", note: "Veja seu salário líquido e o que as mudanças do Orçamento significam para ele." },
      { name: "Autônomos", note: "Quando se registrar no IVA, qual alíquota se aplica e o ciclo de declarações." },
      { name: "Fundadores de empresas", note: "Imposto sobre empresas, o crédito de P&D, depreciação fiscal e guias para começar." },
      { name: "Investidores e proprietários", note: "Ganho de capital em ações ou imóveis, e opções de investimento comparadas." },
      { name: "Famílias", note: "Doações e heranças, e os limites de isenção que se aplicam." },
      { name: "Quem vai comprar imóvel", note: "Simule um financiamento antes de falar com um banco." },
    ],
  },

  process: {
    eyebrow: "Faça uma pergunta",
    title: "Tem uma pergunta? Veja como funciona.",
    lede: "Se as calculadoras e os guias não cobrem, pergunte. É grátis, e nenhuma pergunta é básica demais.",
    steps: [
      { title: "Escolha um tema", description: "Imposto de renda, IVA, um financiamento, abrir uma empresa: seja o que for." },
      { title: "Pergunte com suas palavras", description: "Sem jargão. Pergunte do jeito que perguntaria a um amigo." },
      { title: "Receba uma resposta clara", description: "Uma pessoa de verdade lê e responde por e-mail." },
      { title: "Tudo em um só lugar", description: "Pergunte com a sessão iniciada e cada resposta fica na sua conta gratuita." },
    ],
  },

  faq: {
    eyebrow: "Perguntas frequentes",
    title: "Perguntas, respostas diretas.",
    items: [
      { question: "É grátis mesmo?", answer: "Sim. Todas as calculadoras, guias e modelos são de uso gratuito, e fazer uma pergunta também." },
      { question: "Isto é aconselhamento financeiro ou fiscal?", answer: "Não. Tudo aqui é informação geral para ajudar você a entender como as coisas funcionam. Alíquotas e regras mudam e a sua situação importa, então confirme com a Revenue ou com um consultor qualificado e regulamentado antes de tomar uma decisão importante." },
      { question: "Preciso de uma conta?", answer: "Não. As calculadoras e os guias estão abertos a todos. Uma conta gratuita só é útil para perguntas: pergunte com a sessão iniciada e suas perguntas e nossas respostas ficam juntas em um só lugar." },
      { question: "É só sobre a Irlanda?", answer: "Quase sempre. As calculadoras usam as alíquotas e regras da Irlanda, e alguns recursos para empreendedores também cobrem o Reino Unido." },
    ],
  },

  cta: {
    eyebrow: "Faça uma pergunta",
    title: "Travou em alguma coisa?",
    body: "Pergunte sobre impostos ou dinheiro do jeito que perguntaria a um amigo, e responderemos por e-mail com uma explicação clara. É grátis.",
    button: "Faça uma pergunta",
  },
};
