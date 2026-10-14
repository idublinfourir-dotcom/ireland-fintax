import type { Translations } from "../i18n";

/* Every tool's name and one-line description, by href, in every language.
   The header menus, the calculator tabs and the contact form's topics all
   read it. An href a language lacks (a new Budget year, say) falls back to
   the English label in calculator-tabs / personal-tabs / budgets.ts. */
export type ToolNames = Record<string, { label: string; desc: string }>;

export const toolNames: Translations<ToolNames> = {
  en: {
    "/tools/ireland-income-tax": { label: "Income tax", desc: "Income tax, USC & PRSI: 2026 vs 2025" },
    "/tools/ireland-vat": { label: "VAT", desc: "Net VAT position: payable or receivable" },
    "/tools/ireland-corporation-tax": { label: "Corporation tax", desc: "12.5% trading, 25% passive: total tax due" },
    "/tools/ireland-rd-tax-credit": { label: "R&D credit", desc: "35% credit on qualifying R&D spend" },
    "/tools/ireland-capital-allowances": { label: "Capital allowances", desc: "Capital allowances (tax) + working capital" },
    "/tools/ireland-cgt": { label: "CGT", desc: "Capital gains tax with indexation relief" },
    "/tools/ireland-cat": { label: "CAT", desc: "Gift & inheritance tax: thresholds & reliefs" },
    "/personal/mortgage": { label: "Mortgage", desc: "Compare repayments across Irish lenders" },
    "/personal/investment": { label: "Personal investment", desc: "Compare options by return after Irish tax" },
    "/budget/2027": { label: "Budget 2027", desc: "Announced 6 October 2026. See what changes for you." },
  },
  ga: {
    "/tools/ireland-income-tax": { label: "Cáin ioncaim", desc: "Cáin ioncaim, MSU agus ÁSPC: 2026 i gcomparáid le 2025" },
    "/tools/ireland-vat": { label: "CBL", desc: "Glanstaid CBL: iníoctha nó infhaighte" },
    "/tools/ireland-corporation-tax": { label: "Cáin chorparáide", desc: "12.5% trádála, 25% éighníomhach: an cháin iomlán dlite" },
    "/tools/ireland-rd-tax-credit": { label: "Creidmheas T&F", desc: "Creidmheas 35% ar chaiteachas incháilithe T&F" },
    "/tools/ireland-capital-allowances": { label: "Liúntais chaipitiúla", desc: "Liúntais chaipitiúla (cáin) + caipiteal oibre" },
    "/tools/ireland-cgt": { label: "CGC", desc: "Cáin ghnóchan caipitiúil le faoiseamh innéacsaithe" },
    "/tools/ireland-cat": { label: "CFC", desc: "Cáin bhronntanais agus oidhreachta: tairseacha agus faoisimh" },
    "/personal/mortgage": { label: "Morgáiste", desc: "Cuir aisíocaíochtaí iasachtóirí na hÉireann i gcomparáid" },
    "/personal/investment": { label: "Infheistíocht phearsanta", desc: "Cuir roghanna i gcomparáid de réir toraidh tar éis cánach" },
    "/budget/2027": { label: "Buiséad 2027", desc: "Fógraíodh é ar 6 Deireadh Fómhair 2026. Féach cad a athraíonn duit." },
  },
  es: {
    "/tools/ireland-income-tax": { label: "Impuesto sobre la renta", desc: "Impuesto sobre la renta, USC y PRSI: 2026 frente a 2025" },
    "/tools/ireland-vat": { label: "IVA", desc: "Saldo de IVA: a pagar o a devolver" },
    "/tools/ireland-corporation-tax": { label: "Impuesto de sociedades", desc: "12,5 % actividad comercial, 25 % pasiva: impuesto total" },
    "/tools/ireland-rd-tax-credit": { label: "Crédito por I+D", desc: "Crédito del 35 % sobre el gasto en I+D que cumple los requisitos" },
    "/tools/ireland-capital-allowances": { label: "Amortizaciones fiscales", desc: "Amortizaciones fiscales (capital allowances) y capital circulante" },
    "/tools/ireland-cgt": { label: "Ganancias de capital (CGT)", desc: "Impuesto sobre ganancias de capital con ajuste por inflación" },
    "/tools/ireland-cat": { label: "Donaciones y herencias (CAT)", desc: "Impuesto sobre donaciones y herencias: umbrales y deducciones" },
    "/personal/mortgage": { label: "Hipoteca", desc: "Compara cuotas entre bancos irlandeses" },
    "/personal/investment": { label: "Inversión personal", desc: "Compara opciones por rentabilidad tras impuestos irlandeses" },
    "/budget/2027": { label: "Presupuesto 2027", desc: "Anunciado el 6 de octubre de 2026. Mira qué cambia para ti." },
  },
  pt: {
    "/tools/ireland-income-tax": { label: "Imposto de renda", desc: "Imposto de renda, USC e PRSI: 2026 x 2025" },
    "/tools/ireland-vat": { label: "IVA", desc: "Saldo de IVA: a pagar ou a receber" },
    "/tools/ireland-corporation-tax": { label: "Imposto sobre empresas", desc: "12,5% atividade comercial, 25% passiva: imposto total" },
    "/tools/ireland-rd-tax-credit": { label: "Crédito de P&D", desc: "Crédito de 35% sobre gastos qualificados de P&D" },
    "/tools/ireland-capital-allowances": { label: "Depreciação fiscal", desc: "Depreciação fiscal (capital allowances) e capital de giro" },
    "/tools/ireland-cgt": { label: "Ganho de capital (CGT)", desc: "Imposto sobre ganho de capital com correção pela inflação" },
    "/tools/ireland-cat": { label: "Doações e heranças (CAT)", desc: "Imposto sobre doações e heranças: limites e isenções" },
    "/personal/mortgage": { label: "Financiamento imobiliário", desc: "Compare parcelas entre bancos irlandeses" },
    "/personal/investment": { label: "Investimento pessoal", desc: "Compare opções pelo retorno após impostos irlandeses" },
    "/budget/2027": { label: "Orçamento 2027", desc: "Anunciado em 6 de outubro de 2026. Veja o que muda para você." },
  },
};
