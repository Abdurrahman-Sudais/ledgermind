// LedgerMind rules: suggest a category for every bank line, match bank lines to ledger entries, list the
// discrepancies that need an accountant, and project cash flow for 13 weeks. Nothing is posted without approval.
import {COMPANY, naira} from './data.js';

export const can = (roles, roleId, perm) => !!roles.find((r) => r.id === roleId)?.can.includes(perm);

const RULES = [
  [/TRF FROM|INV-/, 'Sales income', 0.93], [/SALAR/, 'Salaries', 0.97], [/RENT/, 'Rent', 0.95],
  [/AWS|FIGMA|GOOGLE WORKSPACE/, 'Software', 0.94], [/IKEDC|ELECTRIC/, 'Utilities', 0.92], [/MTN|AIRTEL|GLO|DATA/, 'Telecoms', 0.9],
  [/BOLT|UBER/, 'Travel', 0.91], [/SHOPRITE|JUMIA|OFFICE/, 'Office supplies', 0.74], [/FEE|CHARGES/, 'Bank charges', 0.88],
  [/LEGAL|& CO/, 'Professional fees', 0.82], [/CHICKEN|RESTAURANT/, 'Travel', 0.48],
];

/** Suggested category with a confidence. Low confidence goes to review. */
export function categorise(line) {
  for (const [re, cat, conf] of RULES) if (re.test(line.desc)) return {category: cat, confidence: conf};
  return {category: 'Uncategorised', confidence: 0.3};
}

const tokens = (s) => new Set(s.toUpperCase().replace(/[^A-Z0-9 ]/g, ' ').split(/\s+/).filter((w) => w.length > 2));
const similarity = (a, b) => { const x = tokens(a); const y = tokens(b); let n = 0; for (const t of x) if (y.has(t)) n += 1; return n / Math.max(1, Math.min(x.size, y.size)); };

/** One-to-one matching of bank lines to ledger entries by amount, date and description. */
export function reconcile(bank, ledger) {
  const cands = [];
  for (const b of bank) for (const l of ledger) {
    const dd = Math.abs(b.day - l.day);
    if (dd > 4) continue;
    const sameAmt = b.amount === l.amount;
    const near = Math.sign(b.amount) === Math.sign(l.amount) && Math.abs(b.amount - l.amount) / Math.abs(b.amount) < 0.25;
    if (!sameAmt && !near) continue;
    const sim = similarity(b.desc, l.desc);
    const score = (sameAmt ? 0.6 : 0.25) + (1 - dd / 5) * 0.2 + sim * 0.2;
    cands.push({b, l, score, sameAmt, dd, sim});
  }
  cands.sort((p, q) => q.score - p.score);
  const usedB = new Set(); const usedL = new Set(); const matches = [];
  for (const c of cands) if (!usedB.has(c.b.id) && !usedL.has(c.l.id) && c.score >= 0.55) { usedB.add(c.b.id); usedL.add(c.l.id); matches.push(c); }
  return {matches, bankOnly: bank.filter((b) => !usedB.has(b.id)), ledgerOnly: ledger.filter((l) => !usedL.has(l.id))};
}

/** Discrepancies for review, each with the evidence behind it. */
export function discrepancies(bank, ledger, receipts = []) {
  const {matches, bankOnly, ledgerOnly} = reconcile(bank, ledger);
  const out = [];
  for (const m of matches) if (!m.sameAmt) out.push({id: `amt-${m.b.id}`, kind: 'amount', title: 'Amount differs between bank and ledger', detail: `Bank ${naira(m.b.amount)} on ${m.b.day} Oct vs ledger ${naira(m.l.amount)} (“${m.l.desc}”).`, refs: [m.b.id, m.l.id], impact: m.b.amount - m.l.amount});
  const seen = {};
  for (const b of bank) { const k = `${b.day}|${b.desc}|${b.amount}`; if (seen[k]) out.push({id: `dup-${b.id}`, kind: 'duplicate', title: 'Possible duplicate charge', detail: `“${b.desc}” ${naira(b.amount)} appears twice on ${b.day} Oct.`, refs: [seen[k], b.id], impact: b.amount}); else seen[k] = b.id; }
  const dupIds = new Set(out.filter((d) => d.kind === 'duplicate').map((d) => d.refs[1]));
  for (const b of bankOnly) if (!dupIds.has(b.id)) out.push({id: `bank-${b.id}`, kind: 'unbooked', title: 'In the bank, not in the ledger', detail: `“${b.desc}” ${naira(b.amount)} on ${b.day} Oct has no matching entry.${receipts.some((r) => r.day === b.day && Math.abs(r.total) === Math.abs(b.amount)) ? ' A receipt matches it.' : ''}`, refs: [b.id], impact: b.amount});
  for (const l of ledgerOnly) out.push({id: `led-${l.id}`, kind: 'unpaid', title: 'In the ledger, not in the bank', detail: `“${l.desc}” ${naira(l.amount)} booked on ${l.day} Oct has not cleared the bank.`, refs: [l.id], impact: -l.amount});
  return out;
}

/** 13-week cash-flow projection from today's balance, recurring items and expected receipts. */
export function forecast(balance, recurring, receivables, startDay = 1, startMonthDays = 30) {
  const weeks = [];
  let bal = balance;
  for (let w = 1; w <= 13; w += 1) {
    const from = startDay + (w - 1) * 7; const to = from + 6;
    let out = 0; const items = [];
    for (const r of recurring) for (let m = 0; m < 4; m += 1) { const due = r.dueDay + m * startMonthDays; if (due >= from && due <= to) { out += r.amount; items.push(r.label); } }
    const inc = receivables.filter((x) => x.week === w).reduce((s, x) => s + x.amount, 0);
    bal += out + inc;
    weeks.push({week: w, inflow: inc, outflow: out, balance: bal, items});
  }
  const low = weeks.reduce((m, w) => (w.balance < m.balance ? w : m), weeks[0]);
  return {weeks, low, belowZero: weeks.find((w) => w.balance < 0) || null};
}

export function closingBalance(bank) { return COMPANY.opening + bank.reduce((s, b) => s + b.amount, 0); }

export function initial(roles) { return {categories: {}, decisions: {}, log: [], role: roles[0].id}; }
const now = () => new Date().toISOString();

export function act(state, a, {roles, actor}) {
  const fail = (error) => ({state, ok: false, error});
  if (a.type === 'role') return {state: {...state, role: a.role}, ok: true};
  const allow = (p) => can(roles, state.role, p);
  const log = (id, summary, patch) => ({ok: true, state: {...state, ...patch, log: [{at: now(), actor, role: state.role, id, summary}, ...state.log]}});
  const why = (a.reason || '').trim();
  switch (a.type) {
    case 'category':
      if (!allow('approve')) return fail('Only accountants and finance managers approve categories.');
      if (!a.category) return fail('Choose a category.');
      return log(a.id, `Category ${a.category} approved`, {categories: {...state.categories, [a.id]: {category: a.category, by: actor}}});
    case 'resolve': {
      if (!allow(a.status === 'adjusted' ? 'adjust' : 'approve')) return fail(a.status === 'adjusted' ? 'Only the accountant posts adjustments.' : 'Only accountants and finance managers resolve discrepancies.');
      if (!['adjusted', 'explained'].includes(a.status)) return fail('Choose an outcome.');
      if (why.length < 8) return fail('Explain the decision (at least 8 characters) — it goes in the audit trail.');
      return log(a.id, `${a.status === 'adjusted' ? 'Adjustment posted' : 'Explained, no change'} — ${why}`, {decisions: {...state.decisions, [a.id]: {status: a.status, reason: why, by: actor}}});
    }
    default: return fail('Unknown action.');
  }
}
