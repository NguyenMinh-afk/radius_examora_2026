# BA in ERP / CRM Implementation

## Domain Overview
ERP and CRM implementations are among the highest-risk IT projects due to
scope complexity, data migration requirements, and business process change.
The BA's primary job is to bridge business process requirements and system
configuration decisions, produce fit-gap analysis, and drive data migration
planning — all while managing stakeholder expectations for a multi-year programme.

---

## Key Terminology
| Term | Definition |
|---|---|
| Fit-Gap Analysis | Comparison of business requirements against standard system functionality; identifies configuration gaps and customisation needs |
| Vanilla / Standard | Out-of-the-box system functionality requiring no customisation |
| Configuration | System setup using built-in tools (no code change); preferred over customisation |
| Customisation | Code change or extension to standard system; increases upgrade risk |
| WRICEF | Workproducts: Workflows, Reports, Interfaces, Conversions, Enhancements, Forms — SAP deliverable taxonomy |
| Go-Live | Date when the new system is put into production use |
| Cutover | Period of transition from legacy to new system; includes data freeze and migration |
| Data Migration | Moving data from legacy systems to the new ERP/CRM |
| Master Data | Core reference data: customers, vendors, materials, chart of accounts, employees |
| Chart of Accounts (CoA) | Structured list of financial accounts used by the organisation |
| Business Blueprint | SAP term for the documented design of business processes in the system |
| Conference Room Pilot (CRP) | Testing of configured system with real business scenarios before UAT |
| Training Needs Analysis (TNA) | Assessment of what training each user group requires |
| Hypercare | Intensive post-go-live support period (typically 4–8 weeks) |
| Change Request | Formal request to alter scope, timeline, or budget after project baseline |
| Data Quality | Accuracy, completeness, and consistency of data to be migrated |
| Cleansing | Process of correcting or removing inaccurate legacy data before migration |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| Executive Sponsor | ROI, timeline, business disruption, strategic alignment |
| Project Manager | Scope, budget, risk, delivery milestones |
| Business Process Owner | Process design, configuration decisions, UAT sign-off |
| IT Director | Integration architecture, infrastructure, security, licence management |
| Finance Lead | CoA design, financial closing process, reporting accuracy |
| Data Migration Lead | Data quality, extraction, transformation, reconciliation |
| Change Manager | Adoption, training, resistance management |
| System Integrator (SI) | Configuration, development, testing, go-live support |
| Vendor (SAP/Salesforce/Oracle) | Licence, standard functionality, upgrade path |

---

## Fit-Gap Analysis Template
| Req ID | Business Requirement | Standard System Capability | Fit / Gap | Gap Type | Recommended Approach | Complexity H/M/L | Priority |
|---|---|---|---|---|---|---|---|
| BR-001 | ... | ... | Fit / Partial / Gap | Config / Report / Interface / Enhancement | Config change / Custom dev / Workaround | H/M/L | Must |

**Gap Types (WRICEF):**
- **W** — Workflow
- **R** — Report
- **I** — Interface (integration)
- **C** — Conversion (data migration)
- **E** — Enhancement (custom code)
- **F** — Form (document output)

---

## Typical Requirements Patterns

**Business Process Design**
- As-is and to-be process maps required for every in-scope process area.
- Process decisions (configure vs. customise vs. workaround) must be signed off by the business process owner and documented in the decision log.
- All customisations must be justified by a written business case; customisations < £10K ROI annually will not be approved.

**Data Migration**
- Data migration requirements must specify: source system, target object, field mappings, transformation rules, data quality thresholds (e.g., ≥98% of records must pass validation to proceed to production load).
- Mock data migration must be completed at least twice (Mock 1, Mock 2) before cutover.
- Data reconciliation report must compare record counts and key field totals between source and target after each migration run.

**Integration**
- All integrations must be documented in an interface catalogue: system A, system B, direction, frequency, volume, method, error handling.
- Real-time integrations: response expected in <5 seconds; batch integrations: completed within the batch window (typically overnight).

**Training**
- Training must be role-based; each user group receives only the modules relevant to their function.
- eLearning modules must be available in the LMS at least 3 weeks before go-live.

---

## Regulatory & Compliance Considerations
- **SOX (Sarbanes-Oxley):** Financial controls must be maintained; segregation of duties (SoD) required in financial modules — no user should be able to both create and approve a purchase order.
- **GDPR:** CRM systems holding EU personal data must meet data subject rights requirements (access, erasure, portability).
- **IFRS / GAAP:** Financial configuration must align with the organisation's accounting standards.
- **Audit Trail:** All financial transactions must be immutable with full audit history; configuration-only changes must also be logged.
- **Tax Compliance:** Tax engine configuration must be validated against local tax authority requirements per operating country.

---

## Common Integrations & Systems
- **ERP:** SAP S/4HANA, SAP ECC, Oracle Fusion, Oracle EBS, Microsoft Dynamics 365 F&SCM, IFS, Infor
- **CRM:** Salesforce Sales Cloud, HubSpot, Microsoft Dynamics 365 Sales, Oracle Siebel
- **HR/HCM:** SAP SuccessFactors, Workday, ADP
- **E-commerce:** Shopify, Magento (via middleware: MuleSoft, Boomi, Azure Integration Services)
- **Middleware / Integration:** MuleSoft, Dell Boomi, Azure Logic Apps, SAP Integration Suite (PI/PO)
- **BI/Reporting:** SAP Analytics Cloud, Power BI, Tableau

---

## Anti-Patterns to Avoid
1. **Gold-plating in requirements:** Teams ask for every possible feature. The BA must challenge each requirement with "What business outcome does this achieve?" and enforce MoSCoW ruthlessly.
2. **Skipping the data quality assessment:** Poor data quality is the #1 cause of delayed go-lives. Mandate a data quality audit in the first 4 weeks of the project.
3. **Designing around the legacy system:** The to-be process should be designed for the new system's capabilities, not to replicate the legacy system exactly.
4. **Undefined SoD rules:** Segregation of duties must be explicitly designed — not left to IT to figure out during configuration.
5. **No hypercare plan:** Documenting hypercare resources, escalation contacts, and triage procedures must be a formal project deliverable.
6. **Scope creep through CRs without impact assessment:** Every change request must include a formal impact assessment on scope, timeline, budget, and testing before approval.

---

## Example Deliverable Snippet

**GAP-017 — Automated Three-Way Match for Purchase Orders**

| Field | Detail |
|---|---|
| Business Requirement | System must automatically match purchase orders, goods receipts, and vendor invoices; flag discrepancies ≥ 5% or ≥ £500 for manual review |
| Standard System Capability | SAP S/4HANA supports two-way and three-way match via standard MM-IV functionality |
| Fit / Gap | **Partial Fit** |
| Gap Description | Standard functionality matches by quantity; business requires value-based matching with configurable tolerances |
| Gap Type | Configuration (tolerance settings) + Enhancement (custom tolerance report) |
| Recommended Approach | Configure standard tolerance keys; develop Z-report for discrepancy dashboard |
| Complexity | Medium |
| Priority | Must |
| Effort Estimate | 5 days configuration + 10 days development |
