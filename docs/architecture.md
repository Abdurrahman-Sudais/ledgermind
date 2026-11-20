# Architecture

Status: **proposed**. The website and the prototype run entirely in the browser on fictional data. None of the AWS services below are deployed or connected.

## Today: browser-only prototype

- Vite + React, server-rendered to static HTML for every route (`scripts/prerender.mjs`).
- Fictional bank lines, ledger entries and receipts live in `src/data.js`; categorisation, reconciliation, discrepancy checks and the forecast are pure functions in `src/engine.js`, tested with `node --test`.
- Changes persist in `localStorage`; roles are switched in the UI, not authenticated.

## Why AWS

LedgerMind is a proposed AI-powered accounting automation platform for SMEs, accounting firms and finance departments. Its work is document- and transaction-heavy: bank exports, invoices and receipts arrive every day, and every figure must stay traceable to its source. Designing on AWS lets extraction, interpretation, forecasting and reconciliation run as managed services, with each organisation’s books isolated as it grows.

## Proposed production service

| Stage | Services | What happens |
|---|---|---|
| 1. Import | Amazon S3 | Bank CSV exports, invoices and receipts land in per-organisation encrypted storage. |
| 2. Extract | Amazon Textract | Receipts and invoices are read for supplier, date, totals and tax, with confidence for each field. |
| 3. Interpret | Amazon Bedrock | Free-text descriptions and documents are interpreted to suggest categories and explain discrepancies for review. |
| 4. Reconcile | AWS Lambda, Amazon DynamoDB | Lambda matches bank lines to ledger entries; transactions, matches and approvals are stored in DynamoDB. |
| 5. Forecast & detect | Amazon SageMaker AI | Models project cash flow from recurring items and history, and score unusual transactions. |
| Across every stage | AWS Lambda, Amazon CloudWatch, AWS KMS, Amazon Cognito | AWS Lambda runs reconciliation and review workflows; Amazon CloudWatch monitors imports, jobs and APIs; AWS KMS encrypts financial records; Amazon Cognito separates accountant and client roles |

### Services and their role

- **Amazon Bedrock** — Interprets financial documents and descriptions to suggest categories and summarise discrepancies for accountants.
- **Amazon Textract** — Extracts supplier, date, line items, totals and tax from invoices and receipts.
- **Amazon SageMaker AI** — Trains and hosts cash-flow forecasting and transaction anomaly-detection models.
- **Amazon S3** — Stores bank exports, invoices, receipts and exported reports, encrypted per organisation.
- **Amazon DynamoDB** — Holds transactions, categories, matches, adjustments and the approval trail.
- **AWS Lambda** — Runs reconciliation matching, discrepancy checks and review workflows.
- **Amazon Cognito** — Signs users in and separates accountant, finance-manager and client roles.
- **Amazon CloudWatch** — Collects logs and metrics for imports, extraction jobs and API latency.
- **AWS KMS** — Encrypts financial records at rest with customer-specific keys.

The same lists live in `src/aws.js` and are shown on the home page (`#technology`).

### Design rules

1. **Accountants approve.** LedgerMind suggests categories, matches and adjustments; an accountant approves every change to the books.
2. **Every number traceable.** Each match, flag and forecast line links back to the bank line, ledger entry or receipt it came from.
3. **Confidence on show.** Categories carry a confidence score; anything uncertain goes to review instead of being posted.
4. **Isolated by customer.** Each organisation's books sit in their own partition, encrypted, with role checks on every request.

## Website lead capture

The pilot and contact forms post to HubSpot (see `docs/crm-plan.md`). If a server-side intake is needed later, Amazon API Gateway + AWS Lambda can validate submissions and Amazon SES can notify the founder.
