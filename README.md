# LedgerMind

**Intelligent accounting. Clearer financial decisions.**

LedgerMind is a proposed AI-powered financial management platform for accounting firms, SMEs and corporate finance departments. It would automate bookkeeping, reconcile transactions, monitor expenses and explain financial performance, connecting transaction classification, reconciliation and forecasting in one workflow. Accountants review every flagged discrepancy.

> LedgerMind is a proposed product. Features, integrations and AWS services are planned until implemented and verified. Pricing is illustrative, and the prototype uses fictional data. Founder: **Daniel Chukwudi**. Website: `ledgermind.top` · contact: `daniel@ledgermind.top`.

## Design

The look is a modern ledger: warm paper, ink black, Fraunces display serif with tabular Geist Mono figures, teal for matched and vermilion for discrepancies.

- **Hero:** headline words rise in one by one. A reconciliation card that tilts with the pointer draws teal links between bank lines and ledger entries, and the mismatched pair is dashed in red.
- **Transaction tape:** auto-categorised lines scroll past, pausing on hover.
- **Workflow:** a sticky "one workflow" section (import → categorise → reconcile → review → forecast).
- **Features:** a bento grid of all seven core features with a pointer spotlight.
- **Forecast:** a 13-week cash-flow chart that draws itself.
- **Who it's for:** target customers and decision-makers.
- **Pricing:** priced by volume and organisation size, with a monthly/annual toggle.
- **Technology:** the planned AWS architecture (Bedrock, Textract, SageMaker AI, S3, DynamoDB, Lambda), with each service's role.
- **Closing sections:** founder, progress and the demo-request form, FAQ, contact form with a topic picker, and an outlined wordmark footer.
- **Interactions:** a ring cursor that inverts what's under it (and labels primary buttons), magnetic buttons, a scroll-progress bar and view-transition tab switches in the prototype.

## Prototype (`/app`)

The month-end workspace covers one fictional company's October.

- **Transactions:** suggested categories with confidence. Accountants or finance managers approve or change them.
- **Reconciliation:** one-to-one bank-to-ledger matching by amount, date and description similarity.
- **Discrepancies:** amount differences, duplicates, unbooked bank lines (noting matching receipts) and uncleared ledger entries, each with evidence. Only the accountant posts adjustments, and every resolution needs a reason.
- **Forecast:** a 13-week cash flow from the closing balance, recurring costs and expected receipts, with the low point marked.
- **Dashboard:** income, spend and net, with spend by category and CSV export.
- **Roles:** Accountant, Finance Manager, Business Owner and Viewer.

Every decision in the prototype is made by a person and written to a log. Changes persist in the browser's `localStorage`, and motion is skipped for visitors who prefer reduced motion. All pages are server-rendered and readable without JavaScript.

## Structure

```
src/content.js      site facts and founder
src/data.js         fictional data and roles
src/engine.js       the prototype's rules (pure functions, tested)
src/aws.js          the planned AWS architecture shown on the home page
src/forms.js        demo-request and contact form rules and HubSpot payloads (tested)
src/fx.js           interaction layer: reveals, cursor, magnetic and tilt effects, progress bar
src/App.jsx         marketing pages · src/Workspace.jsx the prototype
docs/architecture.md  planned AWS architecture and design rules
docs/crm-plan.md      HubSpot forms, properties and pipeline
```

## Develop

```bash
npm install
npm run dev
```

```bash
npm run build   # Vite build, server render, static prerender of /, /app, /privacy, /terms and 404.html
npm test        # node --test
```

The output in `dist/` is fully static. Configs are included for Netlify/Cloudflare (`public/_headers`, `public/_redirects`) and Vercel (`vercel.json`).

Until HubSpot is configured, the forms keep requests in the browser and open a pre-filled email. To connect it, set `VITE_HUBSPOT_PORTAL_ID`, `VITE_HUBSPOT_FORM_GUID` and `VITE_HUBSPOT_CONTACT_FORM_GUID` (see `.env.example`), and update the privacy notice first.
