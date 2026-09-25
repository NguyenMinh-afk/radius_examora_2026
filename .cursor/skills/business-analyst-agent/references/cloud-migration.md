# BA in Cloud Migration & Modernisation

## Domain Overview
Cloud migration BA work translates business objectives into a structured
migration strategy. The BA must facilitate workload classification, dependency
mapping, TCO analysis, and risk assessment — producing an evidence-based
migration plan that balances speed, cost, and risk. The 7 Rs framework is
the primary analytical tool.

---

## Key Terminology
| Term | Definition |
|---|---|
| 7 Rs | Rehost, Replatform, Refactor, Repurchase, Retire, Retain, Relocate — migration strategy options |
| Rehost (Lift & Shift) | Move application to cloud with no changes; fastest, least optimised |
| Replatform | Minor modifications to leverage cloud capabilities (e.g., managed DB) without re-architecting |
| Refactor / Re-architect | Significantly redesign the application to use cloud-native patterns |
| Repurchase | Replace on-premises software with a SaaS equivalent |
| Retire | Decommission applications no longer needed |
| Retain | Keep application on-premises (for now); exclude from migration wave |
| Relocate | Move infrastructure to cloud using VMware Cloud or similar hypervisor portability |
| TCO | Total Cost of Ownership — comparison of on-premises vs. cloud costs over 3–5 years |
| CapEx vs. OpEx | Capital Expenditure (upfront hardware/licence) vs. Operating Expenditure (cloud consumption) |
| Landing Zone | Pre-configured cloud environment with networking, security, and governance guardrails |
| Migration Wave | Grouped set of workloads migrated together in a single sprint |
| Dependency Map | Visual representation of application-to-application and application-to-infrastructure dependencies |
| Application Portfolio | Full inventory of applications, their owners, and technical attributes |
| RPO | Recovery Point Objective — maximum acceptable data loss (e.g., "last 15 minutes") |
| RTO | Recovery Time Objective — maximum acceptable downtime before recovery (e.g., "4 hours") |
| DR | Disaster Recovery — plan for restoring operations after a failure |
| CSPM | Cloud Security Posture Management — continuous monitoring of cloud security configuration |
| FinOps | Practice of financial accountability for cloud spending |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| CIO / CTO | Strategic alignment, risk, vendor relationships, timeline |
| Application Owner | Application-specific downtime risk, data integrity, user impact |
| Infrastructure Lead | Network architecture, security, landing zone design |
| Security / CISO | Data sovereignty, identity, encryption, compliance in cloud |
| Finance | TCO comparison, budget commitment vs. consumption model |
| Operations | Runbook changes, monitoring tools, on-call procedures |
| Business Units | Service continuity, SLA compliance during migration |
| Cloud Provider (AWS/Azure/GCP) | Migration support, credits, architecture guidance |

---

## The 7 Rs Decision Framework

Capture this for every application in the portfolio:

| App Name | Owner | Complexity H/M/L | Business Criticality H/M/L | Current State | Recommended R | Rationale | Wave | Target State |
|---|---|---|---|---|---|---|---|---|

**Decision criteria:**
- **Rehost:** App runs without modification on IaaS; EOS hardware; fast exit required
- **Replatform:** Managed services (RDS, App Service) provide clear benefit with minimal change
- **Refactor:** App is a business-critical differentiator; cloud-native redesign has clear ROI
- **Repurchase:** SaaS equivalent exists and TCO is lower over 3 years
- **Retire:** App usage <5% of users; functionality duplicated elsewhere
- **Retain:** Regulatory, latency, or integration constraints prevent migration

---

## Typical Requirements Patterns

**Migration Requirements**
- Cutover window must not exceed 4 hours for Tier 1 (business-critical) applications.
- Rollback plan must be documented and tested for every application before production migration.
- Data integrity validation: record counts and checksums must match between source and target before cutover sign-off.

**Performance & Availability**
- Post-migration performance must be ≥ pre-migration baseline (defined by load test results); validated by a 30-day post-migration monitoring period.
- RPO: 15 minutes for Tier 1 applications; 1 hour for Tier 2; 24 hours for Tier 3.
- RTO: 4 hours for Tier 1 applications; 8 hours for Tier 2; 24 hours for Tier 3.

**Security Requirements**
- All data in transit must use TLS 1.2 or higher.
- All data at rest must be encrypted using cloud-provider managed keys (minimum) or customer-managed keys (for regulated workloads).
- Identity and access must use cloud-native IAM; no shared service accounts.
- CSPM tool must be deployed before Wave 1 migration begins.

**Landing Zone**
- Landing zone must include: hub-and-spoke network topology, baseline security policies (no public IPs without WAF), centralised logging to SIEM, identity federation with on-premises AD.

**FinOps**
- Cloud cost budgets must be tagged by application, environment, and cost centre.
- Cost anomaly alerts: notify FinOps team if any resource exceeds 120% of 7-day rolling average.

---

## Regulatory & Compliance Considerations
- **Data Sovereignty:** Specific countries require data to remain within national borders; cloud region selection must be justified per workload.
- **GDPR:** Cloud provider must sign a Data Processing Agreement; data transfers outside EEA require SCCs or adequacy decision.
- **ISO 27001 / SOC 2:** Cloud provider compliance certifications must be validated; shared responsibility model must be documented.
- **PCI-DSS:** Cardholder data environments have specific requirements for network segmentation, encryption, and access logging in cloud.
- **Industry Regulations:** Financial services (FCA operational resilience), healthcare (HIPAA), government (FedRAMP, IL3/IL4) add cloud-specific constraints.

---

## Common Integrations & Systems
- **Cloud Platforms:** AWS, Microsoft Azure, Google Cloud Platform, Oracle Cloud Infrastructure
- **Migration Tools:** AWS Migration Hub, Azure Migrate, Google Migrate, CloudEndure, Carbonite Migrate
- **Assessment Tools:** Movere (Microsoft), CAST Highlight, AWS Application Discovery Service
- **Landing Zone Frameworks:** AWS Landing Zone Accelerator, Azure Landing Zone (CAF), Google Cloud Foundation
- **FinOps Tools:** CloudHealth, Apptio Cloudability, AWS Cost Explorer, Azure Cost Management
- **Security:** Prisma Cloud (Palo Alto), AWS Security Hub, Microsoft Defender for Cloud

---

## Anti-Patterns to Avoid
1. **Lift-and-shift as a default:** Rehosting without assessment misses cost-saving opportunities and often results in higher cloud bills than on-premises costs.
2. **No dependency mapping:** Migrating an application without mapping its dependencies causes unexpected outages when dependent services are not migrated simultaneously.
3. **TCO without realistic estimates:** Including only compute costs and ignoring egress fees, licence changes (BYOL), training, and migration tooling leads to budget overruns.
4. **Big-bang migration:** Migrating everything in one wave maximises risk. Requirement: Wave 1 must be non-critical applications for learning; critical workloads in later waves.
5. **No rollback requirements:** Every migration must have a tested, documented rollback plan. "We'll figure it out" is not acceptable.
6. **Ignoring operational readiness:** Operations teams need new runbooks, monitoring tools, and training. These are formal requirements, not afterthoughts.

---

## Example Deliverable Snippet

**Application Assessment — Finance Reporting Portal**

| Attribute | Value |
|---|---|
| Application Name | Finance Reporting Portal |
| Owner | Head of Financial Reporting |
| Business Criticality | High |
| Current Environment | On-premises Windows Server 2016, SQL Server 2017 |
| User Count | 45 internal users |
| Dependency Count | 3 (SAP ECC, Active Directory, SharePoint) |
| Complexity | Medium |
| Data Classification | Confidential (financial data) |
| Recommended Strategy | **Replatform** — migrate to Azure App Service + Azure SQL Managed Instance |
| Rationale | SQL Managed Instance supports SQL Server 2017 compatibility; managed PaaS reduces ops overhead; dependencies remain on-premises connected via ExpressRoute |
| RPO / RTO | 1 hour / 8 hours |
| Estimated Wave | Wave 2 (Q3 2025) |
| Estimated Effort | 15 days (assessment + migration + testing) |
