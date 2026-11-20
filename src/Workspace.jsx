import React, {useEffect, useState} from 'react';
import {flushSync} from 'react-dom';
import site from './content.js';
import {CATEGORIES, COMPANY, bank, ledger, naira, people, receipts, receivables, recurring, roles} from './data.js';
import {act, can, categorise, closingBalance, discrepancies, forecast, initial, reconcile} from './engine.js';
import {vt} from './fx.js';
import {Logo} from './App.jsx';

const KEY = 'ledgermind-workspace-v1';
const REC = reconcile(bank, ledger);
const DISC = discrepancies(bank, ledger, receipts);
const FC = forecast(closingBalance(bank), recurring, receivables);
const KIND = {amount: 'Amount differs', duplicate: 'Possible duplicate', unbooked: 'Not in ledger', unpaid: 'Not in bank'};

export default function Workspace() {
  const [state, setState] = useState(() => initial(roles));
  const [tab, setTab] = useState('review');
  const [msg, setMsg] = useState('');
  const [txt, setTxt] = useState({});
  const [pick, setPick] = useState({});
  useEffect(() => { try { const s = JSON.parse(localStorage.getItem(KEY) || 'null'); if (s?.decisions) setState(s); } catch { /* ignore */ } }, []);
  useEffect(() => { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ } }, [state]);

  const actor = people[state.role];
  const allow = (p) => can(roles, state.role, p);
  const run = (a) => { const r = act(state, a, {roles, actor}); setMsg(r.ok ? '' : r.error); if (r.ok) setState(r.state); };
  const go = (t) => vt(() => flushSync(() => { setTab(t); setMsg(''); }));
  const lines = bank.map((b) => ({...b, ...categorise(b), approved: state.categories[b.id]}));
  const toReview = lines.filter((l) => l.confidence < 0.6 && !l.approved).length;
  const open = DISC.filter((d) => !state.decisions[d.id]).length;
  const byCat = CATEGORIES.map((c) => ({c, v: lines.filter((l) => (l.approved?.category ?? l.category) === c).reduce((s, l) => s + l.amount, 0)})).filter((x) => x.v !== 0);
  const income = byCat.filter((x) => x.v > 0).reduce((s, x) => s + x.v, 0); const spend = -byCat.filter((x) => x.v < 0).reduce((s, x) => s + x.v, 0);
  const exportCsv = () => { const rows = [['bank id', 'day', 'description', 'amount', 'category', 'confidence', 'approved by'], ...lines.map((l) => [l.id, l.day, l.desc, l.amount, l.approved?.category ?? l.category, l.confidence, l.approved?.by ?? ''])].map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')); const url = URL.createObjectURL(new Blob([rows.join('\n')], {type: 'text/csv'})); const a = document.createElement('a'); a.href = url; a.download = 'ledgermind-october.csv'; a.click(); URL.revokeObjectURL(url); };

  return (
    <div className="ws">
      <header className="ws-top">
        <a href="/" className="brand" aria-label="Back to the LedgerMind website"><Logo size={26} /><span>LedgerMind</span></a>
        <span className="mono">{COMPANY.name} · {COMPANY.period}</span>
        <label className="ws-role">Signed in as <select value={state.role} onChange={(e) => run({type: 'role', role: e.target.value})}>{roles.map((r) => <option key={r.id} value={r.id}>{r.label}</option>)}</select></label>
        <button className="btn ghost sm" onClick={() => { setState(initial(roles)); setMsg(''); }}>Reset</button>
      </header>
      <p className="ws-banner">Fictional books. Suggestions are for an accountant to approve — nothing is posted automatically.</p>
      <main className="ws-main">
        <div className="ws-head"><h1>{site.app.title}</h1>
          <dl className="ws-kpis"><div><dt>Matched</dt><dd>{REC.matches.length}/{bank.length}</dd></div><div><dt>Discrepancies open</dt><dd>{open}</dd></div><div><dt>Categories to review</dt><dd>{toReview}</dd></div><div><dt>Closing balance</dt><dd>{naira(closingBalance(bank))}</dd></div></dl></div>
        <div className="ws-tabs" role="tablist" aria-label="Workspace">{[['review', `Discrepancies (${open})`], ['tx', 'Transactions'], ['rec', 'Reconciliation'], ['fc', 'Cash-flow forecast'], ['dash', 'Dashboard']].map(([id, l]) => <button key={id} role="tab" aria-selected={tab === id} className={tab === id ? 'on' : ''} onClick={() => go(id)}>{l}</button>)}</div>
        {msg && <p className="ws-err" role="alert">{msg}</p>}

        <section className="ws-panel" key={tab}>
          {tab === 'review' && (<ul className="disc">{DISC.map((d) => { const r = state.decisions[d.id]; return (
            <li key={d.id} className={`${d.kind}${r ? ' done' : ''}`}>
              <div className="disc-h"><span className="tag">{KIND[d.kind]}</span><b>{naira(d.impact)}</b></div>
              <h3>{d.title}</h3><p>{d.detail}</p><p className="mono">Evidence: {d.refs.join(' · ')}</p>
              {r ? <p className="ok">{r.status === 'adjusted' ? 'Adjustment posted' : 'Explained'} by {r.by} — “{r.reason}”</p> : (
                <div className="row"><input aria-label="Reason" placeholder="Reason for the audit trail (required)" value={txt[d.id] ?? ''} onChange={(e) => setTxt({...txt, [d.id]: e.target.value})} disabled={!allow('approve')} />
                  <button className="btn sm" disabled={!allow('adjust')} onClick={() => run({type: 'resolve', id: d.id, status: 'adjusted', reason: txt[d.id]})}>Post adjustment</button>
                  <button className="btn ghost sm" disabled={!allow('approve')} onClick={() => run({type: 'resolve', id: d.id, status: 'explained', reason: txt[d.id]})}>Explained</button></div>
              )}
            </li>); })}</ul>)}

          {tab === 'tx' && (<table className="tbl"><thead><tr><th scope="col">Day</th><th scope="col">Description</th><th scope="col">Amount</th><th scope="col">Suggested</th><th scope="col">Confidence</th><th scope="col">Approve</th></tr></thead>
            <tbody>{lines.map((l) => <tr key={l.id} className={l.confidence < 0.6 && !l.approved ? 'low' : ''}><td>{l.day} Oct</td><td>{l.desc}</td><td className={l.amount > 0 ? 'pos' : ''}>{naira(l.amount)}</td><td>{l.approved?.category ?? l.category}</td><td><span className="conf" style={{'--c': l.confidence}}>{Math.round(l.confidence * 100)}%</span></td>
              <td>{l.approved ? <span className="mono">✓ {l.approved.by}</span> : <span className="row tight"><select aria-label={`Category for ${l.id}`} value={pick[l.id] ?? l.category} onChange={(e) => setPick({...pick, [l.id]: e.target.value})} disabled={!allow('approve')}>{CATEGORIES.map((c) => <option key={c}>{c}</option>)}</select><button className="btn ghost sm" disabled={!allow('approve')} onClick={() => run({type: 'category', id: l.id, category: pick[l.id] ?? l.category})}>OK</button></span>}</td></tr>)}</tbody></table>)}

          {tab === 'rec' && (<table className="tbl"><thead><tr><th scope="col">Bank line</th><th scope="col">Ledger entry</th><th scope="col">Match</th></tr></thead>
            <tbody>{REC.matches.map((m) => <tr key={m.b.id}><td>{m.b.day} Oct · {m.b.desc}<small>{naira(m.b.amount)}</small></td><td>{m.l.day} Oct · {m.l.desc}<small>{naira(m.l.amount)}</small></td><td><span className={m.sameAmt ? 'pill ok' : 'pill warn'}>{m.sameAmt ? 'Exact amount' : 'Amount differs'} · {Math.round(m.score * 100)}%</span></td></tr>)}
              {REC.bankOnly.map((b) => <tr key={b.id} className="low"><td>{b.day} Oct · {b.desc}<small>{naira(b.amount)}</small></td><td>—</td><td><span className="pill bad">Unmatched</span></td></tr>)}
              {REC.ledgerOnly.map((l) => <tr key={l.id} className="low"><td>—</td><td>{l.day} Oct · {l.desc}<small>{naira(l.amount)}</small></td><td><span className="pill bad">Not cleared</span></td></tr>)}</tbody></table>)}

          {tab === 'fc' && (<div><p className="note">Low point: week {FC.low.week} at <b>{naira(FC.low.balance)}</b>{FC.belowZero ? ` — the balance goes negative in week ${FC.belowZero.week}.` : '.'}</p>
            <div className="bars">{FC.weeks.map((w) => <div key={w.week} className={w === FC.low ? 'low' : ''} title={`${naira(w.balance)}`}><i style={{height: `${Math.max(2, (w.balance / Math.max(...FC.weeks.map((x) => x.balance))) * 100)}%`}} /><small>W{w.week}</small></div>)}</div>
            <table className="tbl"><thead><tr><th scope="col">Week</th><th scope="col">In</th><th scope="col">Out</th><th scope="col">Items</th><th scope="col">Balance</th></tr></thead><tbody>{FC.weeks.map((w) => <tr key={w.week}><td>{w.week}</td><td className="pos">{naira(w.inflow)}</td><td>{naira(w.outflow)}</td><td>{w.items.join(', ') || '—'}</td><td><b>{naira(w.balance)}</b></td></tr>)}</tbody></table></div>)}

          {tab === 'dash' && (<div className="dash"><div className="dash-k"><div><span>Income</span><b>{naira(income)}</b></div><div><span>Spend</span><b>{naira(spend)}</b></div><div><span>Net</span><b>{naira(income - spend)}</b></div></div>
            <ul className="cats">{byCat.filter((x) => x.v < 0).sort((a, b) => a.v - b.v).map((x) => <li key={x.c}><span>{x.c}</span><i style={{width: `${(-x.v / spend) * 100}%`}} /><b>{naira(-x.v)}</b></li>)}</ul>
            {allow('export') && <button className="btn ghost sm" onClick={exportCsv}>Export categorised transactions (CSV)</button>}</div>)}
        </section>

        <aside className="ws-log" aria-label="Audit trail"><h2>Audit trail</h2><ul>{state.log.slice(0, 8).map((l, i) => <li key={i}><time>{new Date(l.at).toLocaleTimeString()}</time> <b>{l.actor}</b> · {l.id} · {l.summary}</li>)}{!state.log.length && <li className="fine">Approvals and adjustments appear here.</li>}</ul></aside>
      </main>
    </div>
  );
}
