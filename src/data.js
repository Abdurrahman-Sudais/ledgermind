// Fictional books for the prototype: one small company's October bank statement, its ledger and a few receipts.
// Amounts are in Naira (₦). All names and numbers are invented.

export const COMPANY = {name: 'Bluefin Studio Ltd', period: 'October 2026', opening: 4_850_000};
export const naira = (v) => `${v < 0 ? '−' : ''}₦${Math.abs(Math.round(v)).toLocaleString('en-NG')}`;
export const day = (d) => `${d} Oct`;

export const CATEGORIES = ['Sales income', 'Salaries', 'Rent', 'Software', 'Utilities', 'Telecoms', 'Travel', 'Office supplies', 'Bank charges', 'Professional fees', 'Uncategorised'];

// Bank statement lines: [id, day, description, amount (+ in, − out)]
const B = (id, d, desc, amount) => ({id, day: d, desc, amount});
export const bank = [
  B('B01', 1, 'TRF FROM KOLA FOODS LTD INV-1042', 1_250_000),
  B('B02', 2, 'POS SHOPRITE LEKKI', -38_400),
  B('B03', 3, 'AWS EMEA SARL', -96_200),
  B('B04', 3, 'MTN BUNDLE AUTO RENEW', -15_000),
  B('B05', 5, 'RENT OCT ADEOLA PROPERTIES', -650_000),
  B('B06', 6, 'BOLT RIDE 4471', -6_800),
  B('B07', 8, 'TRF FROM HARBOUR CAPITAL INV-1045', 980_000),
  B('B08', 9, 'IKEDC PREPAID TOKEN', -45_000),
  B('B09', 10, 'FIGMA INC', -28_500),
  B('B10', 12, 'SMS ALERT CHARGES', -1_250),
  B('B11', 14, 'TRF FROM NOVA RETAIL INV-1047', 640_000),
  B('B12', 15, 'POS JUMIA OFFICE CHAIRS', -184_000),
  B('B13', 16, 'UBER TRIP LAGOS', -9_400),
  B('B14', 18, 'ACCOUNT MAINTENANCE FEE', -3_500),
  B('B15', 20, 'TRF TO ADEBAYO & CO LEGAL', -250_000),
  B('B16', 21, 'TRF FROM KOLA FOODS LTD INV-1049', 1_310_000),
  B('B17', 22, 'GOOGLE WORKSPACE', -22_800),
  B('B18', 22, 'GOOGLE WORKSPACE', -22_800),
  B('B19', 24, 'TRF FROM BRIGHTPATH CLINICS', 455_000),
  B('B20', 25, 'SALARIES OCT BATCH', -2_480_000),
  B('B21', 27, 'POS CHICKEN REPUBLIC VI', -18_600),
  B('B22', 28, 'AIRTEL DATA', -12_000),
  B('B23', 29, 'TRF TO TEMI DESIGNS', -120_000),
  B('B24', 30, 'IKEDC PREPAID TOKEN', -45_000),
];

// Ledger entries as booked by the team: [id, day, description, amount, category]
const L = (id, d, desc, amount, category) => ({id, day: d, desc, amount, category});
export const ledger = [
  L('L01', 1, 'Kola Foods — INV-1042', 1_250_000, 'Sales income'),
  L('L02', 3, 'AWS hosting', -96_200, 'Software'),
  L('L03', 3, 'MTN data bundle', -15_000, 'Telecoms'),
  L('L04', 5, 'Office rent October', -650_000, 'Rent'),
  L('L05', 7, 'Harbour Capital — INV-1045', 980_000, 'Sales income'),
  L('L06', 9, 'Electricity token', -45_000, 'Utilities'),
  L('L07', 10, 'Figma subscription', -28_500, 'Software'),
  L('L08', 14, 'Nova Retail — INV-1047', 640_000, 'Sales income'),
  L('L09', 15, 'Office chairs (Jumia)', -148_000, 'Office supplies'),
  L('L10', 20, 'Adebayo & Co — contract review', -250_000, 'Professional fees'),
  L('L11', 21, 'Kola Foods — INV-1049', 1_310_000, 'Sales income'),
  L('L12', 22, 'Google Workspace', -22_800, 'Software'),
  L('L13', 25, 'October salaries', -2_480_000, 'Salaries'),
  L('L14', 26, 'Seyi Okon — freelance illustration', -85_000, 'Professional fees'),
  L('L15', 28, 'Airtel data', -12_000, 'Telecoms'),
];

/** Receipts uploaded by staff, with fields as extracted (and a confidence for each document). */
export const receipts = [
  {id: 'R1', day: 2, supplier: 'Shoprite Lekki', total: 38_400, confidence: 0.96},
  {id: 'R2', day: 15, supplier: 'Jumia', total: 184_000, confidence: 0.93},
  {id: 'R3', day: 27, supplier: 'Chicken Republic', total: 18_600, confidence: 0.71},
];

/** Recurring items used for the forecast: [label, amount, every n weeks or 'monthly', next due week]. */
export const recurring = [
  {label: 'Salaries', amount: -2_480_000, monthly: true, dueDay: 25},
  {label: 'Rent', amount: -650_000, monthly: true, dueDay: 5},
  {label: 'Software subscriptions', amount: -147_500, monthly: true, dueDay: 10},
  {label: 'Utilities and data', amount: -117_000, monthly: true, dueDay: 15},
];
/** Expected customer receipts from open invoices: [customer, amount, expected week from today]. */
export const receivables = [
  {customer: 'Nova Retail — INV-1051', amount: 720_000, week: 1},
  {customer: 'Harbour Capital — INV-1052', amount: 980_000, week: 3},
  {customer: 'Kola Foods — INV-1053', amount: 1_310_000, week: 4},
  {customer: 'Brightpath Clinics — INV-1054', amount: 455_000, week: 7},
  {customer: 'Kola Foods — INV-1057', amount: 1_310_000, week: 8},
];

export const roles = [
  {id: 'accountant', label: 'Accountant', can: ['approve', 'adjust', 'export']},
  {id: 'manager', label: 'Finance Manager', can: ['approve', 'export']},
  {id: 'owner', label: 'Business Owner', can: ['view']},
  {id: 'viewer', label: 'Viewer', can: []},
];
export const people = {accountant: 'Ifeoma Nwosu', manager: 'Kunle Bakare', owner: 'Tola Bluefin', viewer: 'Guest'};
