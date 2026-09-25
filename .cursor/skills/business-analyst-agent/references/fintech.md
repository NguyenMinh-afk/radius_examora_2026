# BA in Fintech & Banking

## Domain Overview
Fintech BA work sits at the intersection of financial regulation, real-time
transaction processing, and digital customer experience. Requirements must
be precise, auditable, and compliant by design — not bolted on. The BA must
understand money movement, risk controls, and the regulatory landscape
before writing a single requirement.

---

## Key Terminology
| Term | Definition |
|---|---|
| KYC | Know Your Customer — identity verification and due diligence at onboarding |
| AML | Anti-Money Laundering — monitoring and reporting of suspicious transactions |
| PCI-DSS | Payment Card Industry Data Security Standard — card data security compliance |
| PSD2 | EU Payment Services Directive 2 — open banking, SCA, and TPP access requirements |
| SCA | Strong Customer Authentication — multi-factor auth required for EU payments |
| Open Banking | API-based access to bank account data by authorised third parties (TPPs) |
| Ledger | Record of all financial transactions; must balance (debits = credits) |
| Reconciliation | Process of matching internal records with external statements |
| FX | Foreign Exchange — currency conversion, rate management |
| Chargeback | Reversal of a payment initiated by the cardholder's bank |
| Dunning | Automated process for recovering failed payments |
| Core Banking System (CBS) | Central platform managing accounts, transactions, and balances |
| Card Scheme | Network that processes card transactions (Visa, Mastercard, Amex) |
| Acquiring Bank | Bank that processes card payments on behalf of merchants |
| Issuing Bank | Bank that issues cards to consumers |
| IBAN | International Bank Account Number — standard format for bank accounts |
| SWIFT | Messaging network for international bank-to-bank transfers |
| SEPA | Single Euro Payments Area — harmonised EU payment framework |
| Risk Score | Numerical assessment of fraud or credit risk for a transaction or customer |
| Waterfall Funding | Sequential fund distribution from a pooled account to sub-accounts |
| Virtual IBAN | Unique account number that routes funds to a master account |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| Chief Risk Officer | Credit risk, fraud, AML compliance |
| Compliance Officer | Regulatory obligations, audit readiness, reporting timelines |
| Product Manager | Customer experience, onboarding conversion, payment success rates |
| Engineering Lead | API design, transaction throughput, system reliability |
| Finance / Treasury | Liquidity, reconciliation, FX exposure |
| Customer Operations | KYC dispute resolution, chargeback handling, customer escalations |
| Regulator (FCA, FRB, etc.) | Capital requirements, reporting, licencing conditions |

---

## Typical Requirements Patterns

**KYC / Onboarding**
- System must verify identity documents (passport, driving licence) using an approved third-party KYC provider within 60 seconds for 95% of submissions.
- Enhanced due diligence (EDD) required for all customers with risk score ≥ 70 or transaction value > £10,000.
- KYC status must be re-verified annually for business customers.

**Payment Processing**
- Payment initiation API must respond in <3 seconds at P99 under 1,000 concurrent transactions.
- All payment state transitions must be logged with timestamp, actor (user/system), and reason code.
- Idempotency key required on all payment API calls to prevent duplicate transactions.

**AML & Fraud**
- Transactions ≥ £10,000 must trigger an automated Suspicious Activity Report (SAR) workflow.
- Real-time fraud scoring must be applied to all card transactions before authorisation; reject if score > threshold.
- Rule engine must support configurable fraud rules without code deployment.

**Reconciliation**
- End-of-day reconciliation must match internal ledger totals with card scheme settlement files within ±£0.01.
- Reconciliation exceptions must be flagged in the ops dashboard within 30 minutes of EOD file receipt.

---

## Regulatory & Compliance Considerations
- **PCI-DSS:** Card data (PAN, CVV) must never be stored post-authorisation; tokenisation required.
- **GDPR:** Right to erasure applies; financial records have mandatory retention periods (typically 5–7 years) — balance these requirements explicitly.
- **PSD2 / Open Banking:** Strong Customer Authentication for all electronic payments over €30; TPP access via regulated APIs.
- **KYC/AML:** FATF recommendations, FinCEN (US), FCA (UK), BaFin (DE) — specific to operating jurisdiction.
- **SOX:** Public company financial reporting controls; material transactions must be auditable end-to-end.
- **Consumer Duty (UK FCA):** Evidence that products deliver good outcomes for customers.

---

## Common Integrations & Systems
- **Core Banking:** Thought Machine Vault, Temenos, Mambu, FIS, Finastra
- **Payments:** Stripe, Adyen, Checkout.com, Worldpay, Rapyd, Modulr
- **KYC/AML:** Onfido, Jumio, ComplyAdvantage, Refinitiv World-Check
- **Card Issuance:** Marqeta, GPS, Thredd (formerly GPS)
- **Open Banking:** TrueLayer, Plaid, Token.io
- **FX:** Currencycloud, Banking Circle, OpenPayd
- **Fraud:** Sardine, Featurespace, NICE Actimize

---

## Anti-Patterns to Avoid
1. **Compliance as an afterthought:** Regulatory requirements must be embedded in FRDs from day one, not added post-design.
2. **Vague fraud rules:** "Flag suspicious transactions" is not a requirement. Define thresholds, rule logic, and disposition actions explicitly.
3. **Missing idempotency requirements:** In payment systems, duplicate API calls must be handled deterministically. Always specify idempotency key requirements.
4. **No reconciliation requirements:** Every money-movement requirement must have a corresponding reconciliation and exception-handling requirement.
5. **Ignoring data retention conflicts:** GDPR erasure and financial record retention requirements conflict. Document the legal basis for retention explicitly.
6. **Treating all markets as one:** Payment rules differ by country. Specify jurisdiction in every payment requirement.

---

## Example Deliverable Snippet

**FR-018 — Card Transaction Fraud Screening**
> Before authorising any card transaction, the system must:
> 1. Submit the transaction details to the fraud scoring engine within 500ms.
> 2. If risk score ≤ 65 → authorise; proceed to FR-019 (settlement).
> 3. If risk score 66–85 → step-up authentication (3DS); re-evaluate on result.
> 4. If risk score > 85 → decline; return decline code "DO NOT HONOUR"; log event.
> 5. All decisions (authorise/step-up/decline) must be stored in the transaction audit log with: timestamp, risk score, rule IDs triggered, decision.
>
> **NFR-004 — Fraud Scoring Latency**
> Fraud scoring engine must return a result in <200ms at P95, <500ms at P99, under 2,000 concurrent transactions.
>
> **Priority:** Must | **Regulatory basis:** FCA PS19/26 (fraud prevention obligations)
