// LedgerMind — site facts used by the pages, the prerender step and the tests.
// A proposed product: features, integrations and AWS services are planned until implemented and verified.
const site = {
  name: 'LedgerMind',
  slug: 'ledgermind',
  tagline: 'Intelligent accounting. Clearer financial decisions.',
  about: 'LedgerMind is a proposed AI-powered financial management platform that helps businesses automate bookkeeping, reconcile transactions, monitor expenses and understand their financial performance — with accountants reviewing every flagged discrepancy.',
  url: 'https://ledgermind.top',
  email: 'daniel@ledgermind.top',
  team: [
    {name: 'Daniel Chukwudi', role: 'Founder', initials: 'DC', bio: 'Daniel founded LedgerMind to give accountants and finance teams one workflow from bank line to cash-flow forecast — so month-end is spent on judgement, not matching rows in spreadsheets. Daniel leads product, customers and every pilot.', focus: ['Product', 'Accounting workflows', 'Customer pilots']},
    {name: "Funmilayo Ajayi", role: "Co-founder", initials: "FA", bio: "Funmilayo leads accounting-firm partnerships and customer success at LedgerMind: onboarding pilot practices, shaping the month-end workflow with bookkeepers and turning reviewer feedback into product changes.", focus: ["Accounting partnerships", "Pilot onboarding", "Month-end workflow"]},
    {name: "Obinna Nwachukwu", role: "CTO", initials: "ON", bio: "Obinna leads engineering: bank and ledger imports, transaction categorisation, the reconciliation and discrepancy rules, cash-flow forecasting and the AWS platform it runs on.", focus: ["Platform architecture", "Reconciliation engine", "AWS infrastructure"]},
  ],
  app: {
    title: 'Month-end workspace',
    subtitle: 'Categorise a fictional company’s October transactions, reconcile the bank, review discrepancies and see a 13-week cash-flow forecast.',
  },
};
export default site;
