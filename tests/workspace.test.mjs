import test from 'node:test';
import assert from 'node:assert/strict';
import site from '../src/content.js';
import {bank, ledger, people, receipts, receivables, recurring, roles} from '../src/data.js';
import {act, categorise, closingBalance, discrepancies, forecast, initial, reconcile} from '../src/engine.js';

test('categorisation gives every line a category and confidence, uncertain ones low', () => {
  for (const b of bank) { const c = categorise(b); assert.ok(c.category && c.confidence > 0 && c.confidence <= 1); }
  assert.equal(categorise({desc: 'SALARIES OCT BATCH'}).category, 'Salaries');
  assert.ok(categorise({desc: 'TRF TO TEMI DESIGNS'}).confidence < 0.6);
});

test('reconciliation is one-to-one and finds the planted discrepancies', () => {
  const r = reconcile(bank, ledger);
  assert.equal(new Set(r.matches.map((m) => m.b.id)).size, r.matches.length);
  assert.equal(new Set(r.matches.map((m) => m.l.id)).size, r.matches.length);
  const kinds = discrepancies(bank, ledger, receipts).map((d) => d.kind);
  for (const k of ['amount', 'duplicate', 'unbooked', 'unpaid']) assert.ok(kinds.includes(k), k);
  const amt = discrepancies(bank, ledger, receipts).find((d) => d.kind === 'amount');
  assert.equal(amt.impact, -36000);
});

test('forecast runs 13 weeks from the closing balance and marks the low point', () => {
  const f = forecast(closingBalance(bank), recurring, receivables);
  assert.equal(f.weeks.length, 13);
  assert.ok(f.weeks.every((w) => w.balance >= f.low.balance));
  assert.ok(f.weeks.some((w) => w.items.includes('Salaries')));
});

test('approvals need a reason and the right role', () => {
  const ctx = (s) => ({roles, actor: people[s.role]});
  let s = initial(roles);
  assert.match(act(s, {type: 'resolve', id: 'amt-B12', status: 'adjusted', reason: 'fix'}, ctx(s)).error, /8 characters/);
  s = act(s, {type: 'resolve', id: 'amt-B12', status: 'adjusted', reason: 'Invoice shows ₦184,000; ledger corrected'}, ctx(s)).state;
  assert.equal(s.decisions['amt-B12'].status, 'adjusted');
  const mgr = act(s, {type: 'role', role: 'manager'}, ctx(s)).state;
  assert.match(act(mgr, {type: 'resolve', id: 'dup-B18', status: 'adjusted', reason: 'Refund requested from Google'}, ctx(mgr)).error, /accountant/);
  const owner = act(s, {type: 'role', role: 'owner'}, ctx(s)).state;
  assert.equal(act(owner, {type: 'category', id: 'B23', category: 'Professional fees'}, ctx(owner)).ok, false);
});

test('founder and contact', () => {
  assert.equal(site.team[0].name, 'Daniel Chukwudi');
  assert.equal(site.email, 'daniel@ledgermind.top');
});
