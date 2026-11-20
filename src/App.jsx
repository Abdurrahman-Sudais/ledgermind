import React, {useState} from 'react';
import site from './content.js';
import {COMPANY, bank, ledger, naira, receipts, receivables, recurring} from './data.js';
import {categorise, closingBalance, discrepancies, forecast, reconcile} from './engine.js';
import {ACROSS, SERVICES, STAGES, WHY} from './aws.js';
import {PROGRESS} from './forms.js';
import Workspace from './Workspace.jsx';
import PilotForm from './PilotForm.jsx';
import ContactForm from './ContactForm.jsx';

export function Logo({size = 30}) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden="true">
      <rect width="40" height="40" rx="11" fill="#111" />
      <path d="M11 12h18M11 20h12M11 28h18" stroke="#fbfaf7" strokeWidth="2.4" strokeLinecap="round" />
      <circle cx="29" cy="20" r="3.4" fill="#2dd4bf" />
    </svg>
  );
}

const REC = reconcile(bank, ledger);
const DISC = discrepancies(bank, ledger, receipts);
const FC = forecast(closingBalance(bank), recurring, receivables);

/** Headline words that rise in one after another. Rendered on the server, animated by CSS. */
function Split({text, as: Tag = 'span', className = ''}) {
  return <Tag className={`split ${className}`} data-r>{text.split(' ').map((w, i) => <React.Fragment key={i}><span className="w" style={{'--i': i}}><span>{w}</span></span>{' '}</React.Fragment>)}</Tag>;
}

function Header() {
  const [open, setOpen] = useState(false);
  const links = [['Workflow', '/#workflow'], ['Features', '/#features'], ['Forecast', '/#forecast'], ['Pricing', '/#pricing'], ['Technology', '/#technology'], ['Contact', '/#contact']];
  return (
    <header className="hd">
      <a href="/" className="brand" aria-label="LedgerMind home"><Logo /><span>LedgerMind</span></a>
      <nav id="nav" className={open ? 'nav open' : 'nav'} aria-label="Main">
        {links.map(([t, h]) => <a key={t} href={h} onClick={() => setOpen(false)}>{t}</a>)}
        <a className="nav-app" href="/app" onClick={() => setOpen(false)}>Open the workspace</a>
      </nav>
      <a className="hd-cta" href="#demo" data-magnetic>Request a demo</a>
      <button className="menu" aria-expanded={open} aria-controls="nav" onClick={() => setOpen(!open)}>{open ? 'Close' : 'Menu'}</button>
    </header>
  );
}

const PAIRS = REC.matches.slice(0, 5);

function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-copy">
        <p className="eyebrow" data-r>AI-assisted accounting · for firms, SMEs and finance teams</p>
        <h1 id="hero-title"><Split text="Intelligent accounting." /><Split text="Clearer financial decisions." className="it" /></h1>
        <p className="lede" data-r>{site.about}</p>
        <div className="ctas" data-r>
          <a className="btn" href="#demo" data-magnetic data-cursor="Book">Request a demo</a>
          <a className="btn ghost" href="/app" data-cursor="Try it">Open the workspace</a>
        </div>
      </div>
      <figure className="recon" data-r data-tilt aria-label="Bank lines matched to ledger entries">
        <div className="recon-head"><span>Bank statement</span><span>{REC.matches.length} matched · {DISC.length} to review</span><span>Ledger</span></div>
        <div className="recon-body">
          <ul className="col">{PAIRS.map((m, i) => <li key={m.b.id} style={{'--i': i}}><b>{naira(m.b.amount)}</b><small>{m.b.desc}</small></li>)}<li className="miss" style={{'--i': 5}}><b>{naira(-184_000)}</b><small>POS JUMIA OFFICE CHAIRS</small></li></ul>
          <svg className="wires" viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden="true">
            {PAIRS.map((m, i) => <path key={m.b.id} d={`M0 ${25 + i * 50} C 50 ${25 + i * 50}, 50 ${25 + i * 50}, 100 ${25 + i * 50}`} pathLength="1" style={{'--i': i}} />)}
            <path className="bad" d="M0 275 C 50 275, 50 275, 100 275" pathLength="1" style={{'--i': 5}} />
          </svg>
          <ul className="col">{PAIRS.map((m, i) => <li key={m.l.id} style={{'--i': i}}><b>{naira(m.l.amount)}</b><small>{m.l.desc}</small></li>)}<li className="miss" style={{'--i': 5}}><b>{naira(-148_000)}</b><small>Office chairs (Jumia)</small></li></ul>
        </div>
        <figcaption><span className="dot bad" /> ₦36,000 difference flagged for the accountant — nothing is posted automatically.</figcaption>
      </figure>
    </section>
  );
}

function Tape() {
  const items = bank.slice(0, 14).map((b) => ({...b, ...categorise(b)}));
  return (
    <div className="tape" aria-label="Transactions categorised automatically">
      <div className="tape-track">{[...items, ...items].map((t, i) => <span key={i} className="chip"><i className={t.confidence < 0.6 ? 'low' : ''}>{t.category}</i>{t.desc.toLowerCase()} <b>{naira(t.amount)}</b></span>)}</div>
    </div>
  );
}

const STEPS = [
  ['Import', 'Upload bank CSVs and drop in receipts. Invoices and receipts are read for supplier, date and totals.', 'CSV · PDF · photo'],
  ['Categorise', 'Every transaction gets a suggested category with a confidence score. Low-confidence lines go to review.', `${bank.filter((b) => categorise(b).confidence < 0.6).length} of ${bank.length} need a look`],
  ['Reconcile', 'Bank lines are matched to ledger entries by amount, date and description — one to one.', `${REC.matches.length} matched automatically`],
  ['Review', 'Amount differences, duplicates and unbooked items are listed with the evidence for an accountant to resolve.', `${DISC.length} discrepancies with evidence`],
  ['Forecast', 'A 13-week cash-flow view from today’s balance, recurring costs and expected customer payments.', `Low point in week ${FC.low.week}`],
];

function Workflow() {
  return (
    <section className="sec flow" id="workflow" aria-labelledby="wf-title">
      <div className="flow-side">
        <p className="eyebrow">The core differentiator</p>
        <h2 id="wf-title">One workflow from bank line to forecast.</h2>
        <p className="intro">Most teams categorise in one tool, reconcile in a spreadsheet and forecast in another. LedgerMind connects transaction classification, reconciliation and forecasting in a single flow — with accountants reviewing every flagged discrepancy before anything is posted.</p>
      </div>
      <ol className="flow-steps">{STEPS.map(([t, d, m], i) => (
        <li key={t} data-r style={{'--d': '0ms'}}><span className="num">0{i + 1}</span><div><h3>{t}</h3><p>{d}</p><p className="meta">{m}</p></div></li>
      ))}</ol>
    </section>
  );
}

const FEATURES = [
  ['Intelligent transaction categorisation', 'Suggested categories with confidence, learned from your chart of accounts and past decisions.', 'wide'],
  ['Automated bank reconciliation', 'One-to-one matching by amount, date and description, with partial matches surfaced.', ''],
  ['Financial discrepancy detection', 'Amount differences, duplicates, unbooked and uncleared items — each with evidence.', ''],
  ['Cash-flow forecasting', 'Thirteen weeks ahead from recurring costs and expected receipts, with the low point marked.', 'tall'],
  ['Expense management and reporting', 'Receipts matched to card and bank lines; spend by category, supplier and team.', ''],
  ['Financial performance dashboards', 'Income, costs, margins and cash position on one page for owners and CFOs.', ''],
  ['Accounting integrations and audit trails', 'Planned exports to your accounting system, and a record of every approval and adjustment.', 'full'],
];

function Features() {
  return (
    <section className="sec" id="features" aria-labelledby="ft-title">
      <p className="eyebrow">Core product features</p>
      <h2 id="ft-title">Everything month-end needs, in one place.</h2>
      <div className="bento">{FEATURES.map(([t, d, size], i) => (
        <article key={t} className={`tile ${size}`} data-r data-spot style={{'--d': `${(i % 3) * 70}ms`}}><span className="tile-n">{String(i + 1).padStart(2, '0')}</span><h3>{t}</h3><p>{d}</p></article>
      ))}</div>
    </section>
  );
}

function Forecast() {
  const max = Math.max(...FC.weeks.map((w) => w.balance)); const min = Math.min(0, ...FC.weeks.map((w) => w.balance));
  const y = (v) => 180 - ((v - min) / (max - min)) * 160;
  const pts = FC.weeks.map((w, i) => [20 + i * 46, y(w.balance)]);
  const d = pts.map(([x, yy], i) => `${i ? 'L' : 'M'}${x} ${yy.toFixed(1)}`).join(' ');
  return (
    <section className="sec dark" id="forecast" aria-labelledby="fc-title">
      <div className="fc-grid">
        <div>
          <p className="eyebrow">Cash-flow forecasting</p>
          <h2 id="fc-title">See the tight week before it arrives.</h2>
          <p className="intro">Starting from a closing balance of {naira(closingBalance(bank))}, salaries, rent and subscriptions come out on their usual days while open invoices come in when customers usually pay. The low point is week {FC.low.week}, at {naira(FC.low.balance)}.</p>
        </div>
        <figure className="fc-chart" data-r aria-label="Thirteen-week cash balance projection">
          <svg viewBox="0 0 600 200" role="img" aria-label={`Balance falls to ${naira(FC.low.balance)} in week ${FC.low.week}`}>
            {min < 0 && <line x1="0" x2="600" y1={y(0)} y2={y(0)} className="zero" />}
            <path d={`${d} L ${pts.at(-1)[0]} 190 L 20 190 Z`} className="area" />
            <path d={d} className="line" pathLength="1" />
            {pts.map(([x, yy], i) => <circle key={i} cx={x} cy={yy} r={FC.weeks[i] === FC.low ? 6 : 3} className={FC.weeks[i] === FC.low ? 'low' : ''} />)}
          </svg>
          <div className="fc-axis"><span>Week 1</span><span>Week 7</span><span>Week 13</span></div>
        </figure>
      </div>
    </section>
  );
}

function Who() {
  return (
    <section className="sec" aria-labelledby="who-title">
      <div className="who">
        <div><p className="eyebrow">Target customers</p><h2 id="who-title">Built for the people who close the books.</h2></div>
        <div className="who-list">
          {[['Accounting firms', 'Many clients, many bank accounts, one review queue.'], ['SMEs', 'Owners who want clean books and a clear cash view without a full finance team.'], ['Corporate finance departments', 'Faster month-end with an audit trail for every adjustment.']].map(([t, d]) => <article key={t} data-r><h3>{t}</h3><p>{d}</p></article>)}
          <p className="decision" data-r><span>Decision-makers</span> CFOs · accountants · finance managers · business owners</p>
        </div>
      </div>
    </section>
  );
}

const PLANS = [
  ['Starter', 49, 'Up to 500 transactions a month', ['1 organisation', 'CSV imports and receipt uploads', 'Categorisation and reconciliation', 'Dashboards']],
  ['Growth', 149, 'Up to 5,000 transactions a month', ['Up to 3 organisations', 'Everything in Starter', 'Discrepancy review and audit trail', '13-week cash-flow forecast'], true],
  ['Firm', 399, 'For accounting firms', ['Up to 25 client organisations', 'Everything in Growth', 'Client and accountant roles', 'Bulk review queues']],
];

function Pricing() {
  const [annual, setAnnual] = useState(false);
  return (
    <section className="sec" id="pricing" aria-labelledby="pr-title">
      <div className="pr-head">
        <div><p className="eyebrow">Business model</p><h2 id="pr-title">Priced by transaction volume and organisation size.</h2></div>
        <div className="toggle" role="group" aria-label="Billing period"><button className={annual ? '' : 'on'} aria-pressed={!annual} onClick={() => setAnnual(false)}>Monthly</button><button className={annual ? 'on' : ''} aria-pressed={annual} onClick={() => setAnnual(true)}>Annual <small>−15%</small></button></div>
      </div>
      <div className="plans">{PLANS.map(([n, p, sub, items, hl]) => (
        <article key={n} className={hl ? 'plan hl' : 'plan'} data-r data-spot><h3>{n}</h3><p className="sub">{sub}</p><p className="price">${annual ? Math.round(p * 0.85) : p}<small>/ month{annual ? ', billed yearly' : ''}</small></p><ul>{items.map((x) => <li key={x}>{x}</li>)}</ul><a className={hl ? 'btn' : 'btn ghost'} href="#demo">Request a demo</a></article>
      ))}<article className="plan ent" data-r><h3>Enterprise</h3><p className="sub">Custom volumes, integrations and data-handling terms.</p><a className="btn ghost" href="#contact">Talk to us</a></article></div>
      <p className="fine">Illustrative pricing for a proposed product.</p>
    </section>
  );
}

function Technology() {
  return (
    <section className="sec" id="technology" aria-labelledby="tech-title">
      <p className="eyebrow">Planned AWS infrastructure</p>
      <h2 id="tech-title">How we use Amazon Web Services.</h2>
      <p className="intro">{WHY}</p>
      <ol className="stages">{STAGES.map(([t, svcs, d], i) => <li key={t} data-r><span className="num">0{i + 1}</span><h3>{t}</h3><p className="svcs">{svcs.map((s) => <span key={s}>{s}</span>)}</p><p>{d}</p></li>)}</ol>
      <div className="across" data-r><p className="eyebrow">Across every stage</p><ul>{ACROSS.map(([a, b]) => <li key={a}><b>{a}</b> {b}</li>)}</ul></div>
      <h3 className="sub">Services and their role in LedgerMind</h3>
      <dl className="svc">{SERVICES.map(([a, b]) => <div key={a} data-r><dt>{a}</dt><dd>{b}</dd></div>)}</dl>
      <p className="fine">Planned, not yet deployed. This website and the workspace run in your browser on fictional data.</p>
    </section>
  );
}

function Team() {
  const p = site.team[0];
  return (
    <section className="sec" id="team" aria-labelledby="team-title">
      <div className="team" data-r>
        <span className="av" aria-hidden="true">{p.initials}</span>
        <div><p className="eyebrow">Founder</p><h2 id="team-title">{p.name}</h2><p>{p.bio}</p><ul className="tags">{p.focus.map((f) => <li key={f}>{f}</li>)}</ul></div>
      </div>
    </section>
  );
}

function Demo() {
  return (
    <section className="sec" id="demo" aria-labelledby="demo-title">
      <div className="demo">
        <div>
          <p className="eyebrow">Progress & demos</p>
          <h2 id="demo-title">See LedgerMind on your own month-end.</h2>
          <p className="intro">LedgerMind is a proposed product in its building stage. A demo walks through categorisation, reconciliation review and the forecast; early pilots start with CSV imports and receipt uploads for one entity and one month.</p>
          <ol className="progress">{PROGRESS.map(([st, t, d]) => <li key={t} className={st === 'Next' ? 'next' : ''}><span>{st}</span><div><b>{t}</b><p>{d}</p></div></li>)}</ol>
        </div>
        <div className="card-form" data-r><PilotForm submitLabel="Request a demo" /></div>
      </div>
    </section>
  );
}

const FAQ = [['Does LedgerMind post entries to our books?', 'No. It suggests categories, matches and adjustments; an accountant approves every change.'], ['What can we import?', 'The first version takes bank CSV exports and receipt uploads. Accounting-system integrations are planned.'], ['How is the forecast built?', 'From today’s balance, recurring costs on their usual dates and expected receipts from open invoices. Every line can be traced.'], ['Is LedgerMind live?', 'Not yet. It is a proposed product; the workspace is a prototype running in your browser on fictional data.']];

function Faq() {
  return (
    <section className="sec" aria-labelledby="faq-title">
      <p className="eyebrow">FAQ</p>
      <h2 id="faq-title">Questions finance teams ask.</h2>
      <div className="faq">{FAQ.map(([q, a]) => <details key={q}><summary>{q}</summary><p>{a}</p></details>)}</div>
    </section>
  );
}

function Contact() {
  return (
    <section className="sec" id="contact" aria-labelledby="contact-title">
      <div className="demo">
        <div><p className="eyebrow">Contact</p><h2 id="contact-title">Talk to LedgerMind.</h2><p className="intro">Questions about the product, integrations, security or partnerships. Messages go directly to the founder.</p><p className="mail"><a href={`mailto:${site.email}`}>{site.email}</a></p></div>
        <div className="card-form" data-r><ContactForm /></div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="ft">
      <p className="ft-big" aria-hidden="true">LedgerMind</p>
      <div className="ft-row">
        <a href="/" className="brand" aria-label="LedgerMind home"><Logo /><span>LedgerMind</span></a>
        <nav aria-label="Footer"><a href="/app">Workspace</a><a href="/#technology">Technology (AWS)</a><a href="/#pricing">Pricing</a><a href="/#contact">Contact</a><a href="/privacy">Privacy</a><a href="/terms">Terms</a></nav>
      </div>
      <p className="fine">© 2026 LedgerMind · {site.email} · Founded by {site.team[0].name}. A proposed product: features, integrations and AWS services are planned, pricing is illustrative and the workspace uses fictional data.</p>
    </footer>
  );
}

function Home() {
  return (<><Hero /><Tape /><Workflow /><Features /><Forecast /><Who /><Pricing /><Technology /><Team /><Demo /><Faq /><Contact /></>);
}

const LEGAL = {
  privacy: ['Privacy notice', [['This website', 'LedgerMind is a proposed product. This website and the workspace run in your browser on fictional data.'], ['Workspace', 'Your changes are kept in your browser’s local storage (key ledgermind-workspace-v1) and never leave your device.'], ['Forms', `Until a form service is connected, the demo and contact forms open a pre-filled email to ${site.email}; nothing is sent until you send it.`], ['Cookies & analytics', 'None.']]],
  terms: ['Terms of use', [['A proposed product', 'Nothing here is an offer of service. Pricing is illustrative.'], ['Demonstration only', 'The workspace uses fictional data and must not be used for real accounting.'], ['Professionals decide', 'LedgerMind suggests; accountants approve every adjustment.']]],
};

function Legal({kind}) {
  const [title, items] = LEGAL[kind];
  return <section className="sec legal"><p className="eyebrow">Review draft</p><h1>{title}</h1>{items.map(([t, d]) => <div key={t}><h2>{t}</h2><p>{d}</p></div>)}</section>;
}

function NotFound() {
  return <section className="sec legal"><p className="eyebrow">404</p><h1>This page doesn’t reconcile.</h1><p>We couldn’t find it.</p><p><a className="btn" href="/">Back to LedgerMind</a></p></section>;
}

export default function App({path = '/'}) {
  if (path.startsWith('/app')) return <Workspace />;
  const page = path === '/' ? <Home /> : path === '/privacy' ? <Legal kind="privacy" /> : path === '/terms' ? <Legal kind="terms" /> : <NotFound />;
  return (<><a className="skip" href="#main">Skip to content</a><Header /><main id="main">{page}</main><Footer /></>);
}
