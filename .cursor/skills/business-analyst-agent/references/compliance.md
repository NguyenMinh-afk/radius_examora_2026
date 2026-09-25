# BA in Compliance & Regulatory

## Domain Overview
Compliance BA work translates regulatory obligations into system and process
requirements. The BA must understand the regulatory framework, map controls
to system capabilities, and produce requirements that are auditable, traceable
to their regulatory source, and verifiable. Every requirement must reference
its regulatory basis — compliance requirements are not negotiable.

---

## Key Terminology
| Term | Definition |
|---|---|
| Control | A safeguard or countermeasure that reduces risk (preventive, detective, corrective) |
| Control Framework | Structured set of controls (SOX, ISO 27001, COBIT, NIST) |
| Audit Trail | Chronological record of system/user activity; must be tamper-evident |
| Data Retention | Minimum period data must be kept; defined by regulation or contract |
| Data Subject Rights | GDPR rights: access, erasure, rectification, portability, objection |
| PIA / DPIA | Privacy Impact Assessment / Data Protection Impact Assessment — pre-deployment privacy risk review |
| Consent | Legal basis for processing personal data; must be freely given, specific, informed, unambiguous |
| Legal Hold | Suspension of data deletion obligations due to legal proceedings |
| Regulatory Reporting | Mandatory submission of data to a regulator on a defined schedule |
| Segregation of Duties (SoD) | No single person should control a complete business process end-to-end |
| Four-Eyes Principle | Critical actions require approval from two authorised individuals |
| Immutability | Data that cannot be altered or deleted once written (audit logs, financial records) |
| Cross-Border Transfer | Movement of personal data across national boundaries; subject to specific legal requirements |
| Standard Contractual Clauses (SCCs) | EU-approved legal mechanism for cross-border data transfer |
| Adequacy Decision | EU Commission ruling that a third country provides equivalent data protection |
| Data Minimisation | Collect only the personal data necessary for the specified purpose |
| Pseudonymisation | Replacing identifying data with artificial identifiers; reduces but does not eliminate privacy risk |
| Anonymisation | Irreversible removal of all identifying information; GDPR no longer applies |
| Right to Erasure | GDPR Article 17 — "right to be forgotten" under defined conditions |
| SOX | Sarbanes-Oxley Act — US law governing financial reporting controls and audit |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| Chief Compliance Officer | Regulatory obligations, audit findings, enforcement risk |
| Data Protection Officer (DPO) | GDPR compliance, DPIA completion, regulator liaison |
| Internal Audit | Control effectiveness, evidence quality, audit trail integrity |
| Legal Counsel | Regulatory interpretation, contract terms, liability |
| CISO / Security | Technical control implementation, breach response |
| Business Process Owner | Impact of controls on operational efficiency |
| IT / Engineering | System configuration, access logs, encryption, retention enforcement |
| Regulator | Accurate reporting, timely responses, evidence of compliance |

---

## Regulatory Requirement Mapping Template

Every compliance requirement must include:

| Field | Value |
|---|---|
| Req ID | COMP-001 |
| Regulation | GDPR Article 17 |
| Obligation | Data subjects may request erasure of their personal data |
| Control Type | Preventive / Detective / Corrective |
| System Requirement | System must provide a "Delete My Data" function accessible to authenticated users in the account settings page |
| Verification Method | Test: submit deletion request; verify all personal data removed within 30 days; verify confirmation email sent |
| Evidence Required | Deletion request log (timestamp, user ID, completion status), test evidence |
| Responsible Team | Engineering + Data |
| Deadline | Continuous compliance required |

---

## Typical Requirements Patterns

**Data Retention & Deletion**
- Personal data must be automatically deleted [N] days after the account is closed, unless a legal hold is active.
- Financial transaction records must be retained for 7 years (UK HMRC requirement); deletion prohibited before that period.
- Legal hold flag must override automated deletion; release of hold must be logged with: who released it, when, and authorisation.
- Data deletion must cascade across all systems (primary database, backups [on next cycle], archives, third-party processors).

**Audit Logging**
- All access to personal data must be logged: user identity, timestamp, record accessed, action performed, IP address.
- Audit logs must be tamper-evident (append-only, hash-chained or immutable storage).
- Audit logs must be retained for a minimum of [regulatory period, e.g., 7 years for financial, 5 years for healthcare].
- Audit log search must return results within 30 seconds for queries spanning up to 12 months.

**Access Control & SoD**
- Payment approval requires four-eyes: the person who creates a payment cannot be the person who approves it.
- Role changes for privileged accounts must require manager approval and be logged.
- Privileged access reviews must be conducted quarterly; automated report sent to IT Security Lead.

**Consent Management**
- Consent must be captured with: timestamp, version of privacy notice shown, channel (web/app/phone), explicit user action.
- Users must be able to withdraw consent in as many steps as it took to give it.
- System must not change the purpose of data processing without re-obtaining consent.

**Regulatory Reporting**
- Regulatory report must be generated in [format] by [deadline] on [frequency].
- Report generation must be automated; manual editing of source data is prohibited.
- Submission status (Submitted / Acknowledged / Rejected) must be tracked and stored.

---

## Regulatory & Compliance Considerations by Framework

| Framework | Scope | Key Requirements |
|---|---|---|
| GDPR | EU personal data | Consent, data subject rights, breach notification (72hrs), DPA with processors, DPIA |
| CCPA / CPRA | California consumer data | Right to know, delete, opt-out of sale; privacy notice; annual audits |
| SOX | US public company financials | Internal controls, audit trail, SoD, management assertion, external audit |
| PCI-DSS v4 | Card payment data | No PAN storage, tokenisation, encryption, network segmentation, penetration testing |
| ISO 27001 | Information security | Risk treatment plan, ISMS, 93 controls, annual audit, continual improvement |
| HIPAA | US health data | PHI safeguards, BAAs, breach notification, minimum necessary |
| FCA / PRA (UK) | Financial services | Operational resilience, consumer duty, senior managers regime |
| DORA (EU) | Financial digital operations | ICT risk management, incident reporting, third-party risk, resilience testing |

---

## Anti-Patterns to Avoid
1. **Requirements without regulatory reference:** Every compliance requirement must cite its source (GDPR Article 17, SOX Section 302). Orphaned compliance requirements are unverifiable.
2. **Treating compliance as a project phase:** Compliance requirements must be embedded in the FRD from the start, not appended at the end.
3. **Assuming deletion means deletion:** True deletion must cascade to backups, archives, and third-party processors. Define each system separately.
4. **DPIA as a rubber stamp:** A DPIA must identify risks and document mitigations. A DPIA that concludes "no risks" for a high-risk processing activity is not credible.
5. **No breach notification requirements:** Systems that hold personal data must have breach detection and notification requirements (72 hours under GDPR).
6. **Consent without granularity:** "I agree to terms" covers everything is non-compliant. Separate consent for: necessary processing, analytics, marketing.

---

## Example Deliverable Snippet

**COMP-007 — GDPR Right to Erasure — System Requirement**

| Field | Value |
|---|---|
| Regulation | GDPR Article 17 — Right to Erasure ("Right to Be Forgotten") |
| Trigger | User submits a deletion request via the account settings portal or via written request to DPO |
| System Response | System must delete or pseudonymise all personal data associated with the user's account within 30 days of verified request |
| Scope | Personal data in: user profile, activity logs (PII fields), marketing preferences, support tickets (PII redacted), third-party processor data (Salesforce, Intercom — deletion request forwarded via API within 5 days) |
| Exceptions | Data subject to legal hold; financial transaction records required by HMRC (retain for 7 years, anonymised beyond that) |
| Evidence | Deletion request log: request ID, user ID, request date, completion date, systems actioned, exceptions applied |
| Confirmation | User receives email confirmation of deletion within 24 hours of completion |
| Priority | Must |
| Acceptance Criteria | Given an authenticated user submits a deletion request, When 30 days elapse, Then all personal data is removed from all in-scope systems and a confirmation email has been sent. |
