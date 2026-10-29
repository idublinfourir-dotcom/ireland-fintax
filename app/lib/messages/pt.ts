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
    getInTouch: "Contato",
    language: "Idioma",
    suite: "Impostos",
    resources: "Recursos",
    company: "Empresa",
    links: {
      incomeTax: "Imposto de renda e PAYE",
      corporationTax: "Imposto sobre empresas (12,5%)",
      cgt: "Ganho de capital",
      cat: "Doações e heranças (CAT)",
      rd: "Créditos de P&D, seção 766",
      mortgage: "Financiamento e empréstimo",
      investment: "Investimento e alienação presumida",
      budget: "Central do {budget}",
      calendar: "Calendário fiscal",
      about: "Sobre nós",
      news: "Notícias e novidades",
      contact: "Contato",
      method: "Metodologia e padrões",
      report: "Relatar um problema",
    },
    disclaimer: "Apenas informação geral, não é aconselhamento financeiro, fiscal ou jurídico.",
    sources: "Fontes: Revenue.ie, a CCPC e o Banco Central da Irlanda.",
    reviewed: "Conteúdo revisado por {reviewer} e por um grupo de profissionais de finanças baseados na Irlanda que querem tornar a educação financeira mais fácil para as pessoas na Irlanda. Tradução revisada pela equipe da Irish Fintax.",
    privacy: "Privacidade de dados",
    sitemap: "Mapa do site XML",
  },

  cta: {
    eyebrow: "Não existe pergunta básica",
    title: "Ainda tentando entender? *Vamos começar pela sua pergunta.*",
    body: "Pergunte sobre impostos ou dinheiro com suas palavras.",
    button: "Faça uma pergunta",
  },
};
