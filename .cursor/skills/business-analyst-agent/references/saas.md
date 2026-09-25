# BA in SaaS (Software as a Service)

## Domain Overview
SaaS products are delivered over the internet with subscription-based pricing.
BA work centres on tenant isolation, subscription lifecycle, usage metering,
onboarding activation flows, and API integration ecosystems. The BA must
balance product-led growth goals with enterprise customisation demands.

---

## Key Terminology
| Term | Definition |
|---|---|
| Multi-tenancy | Single application instance serving multiple customer organisations (tenants) with data isolation |
| Tenant | A single customer organisation using the SaaS platform |
| Freemium | Free tier with limitations; conversion to paid is a core metric |
| MRR / ARR | Monthly / Annual Recurring Revenue — primary SaaS financial metrics |
| Churn Rate | Percentage of customers cancelling per period; must be minimised |
| NPS | Net Promoter Score — customer satisfaction indicator |
| Activation | Point at which a new user realises first value; measured by a key action event |
| Time to Value (TTV) | Duration from sign-up to activation moment |
| SSO / SAML | Single Sign-On / Security Assertion Markup Language — enterprise auth requirement |
| SCIM | System for Cross-domain Identity Management — automated user provisioning |
| Webhook | HTTP callback triggered by an event; key integration pattern |
| API Rate Limit | Cap on API calls per time window per tenant |
| SLA | Service Level Agreement — uptime and performance guarantees |
| Tenant Isolation | Ensuring one tenant cannot access another's data or degrade their performance |
| Usage-Based Billing | Charging based on consumption (API calls, seats, storage, events) |
| Entitlement | Feature or resource a tenant is permitted to access based on their plan |
| Rollout / Feature Flag | Controlled release of features to a subset of tenants |
| Data Residency | Requirement that tenant data is stored in a specific geographic region |
| Upgrade / Downgrade | Movement between subscription tiers |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| Product Manager | Feature prioritisation, OKRs, activation and retention metrics |
| Engineering Lead | API design, scalability, tenant isolation, deployment pipelines |
| Customer Success | Onboarding friction, churn signals, escalations |
| Sales / RevOps | Pricing tiers, deal-specific customisations, contract terms |
| Security / Compliance | Data isolation, GDPR, SOC 2, pen-test findings |
| Finance | MRR accuracy, billing reconciliation, dunning logic |
| End Users (Admins) | Workspace configuration, user management, integrations |

---

## Typical Requirements Patterns

**Subscription & Billing**
- System must support monthly, annual, and usage-based billing simultaneously.
- Tenants must be able to upgrade/downgrade self-serve; changes take effect at next billing cycle unless immediate upgrade.
- Failed payment retry logic: retry at 3, 7, and 14 days; suspend after 14 days; notify tenant admin at each stage.

**Multi-Tenancy & Isolation**
- Each tenant's data must be logically isolated; row-level security enforced at the database layer.
- One tenant's workload must not degrade response time for another (noisy-neighbour control).
- Tenant onboarding must provision workspace in <30 seconds.

**Onboarding & Activation**
- New users must be guided through a setup checklist; first key action (e.g., first report created) recorded as activation event.
- Onboarding completion rate and TTV tracked as product KPIs.

**API & Integrations**
- Public API must be RESTful with versioned endpoints (e.g., `/v1/`).
- API must return errors in standard format: `{ "error": { "code": "...", "message": "..." } }`.
- Webhook events must include retry logic with exponential backoff (3 retries).

**SSO & User Management**
- Enterprise plan must support SAML 2.0 SSO and SCIM provisioning.
- Admin must be able to assign roles (Owner, Admin, Member, Viewer) per workspace.

---

## Regulatory & Compliance Considerations
- **GDPR:** Data processing agreements, right to erasure (full tenant data deletion within 30 days of request), data portability export.
- **SOC 2 Type II:** Access controls, audit logs, incident response; common enterprise procurement requirement.
- **Data Residency:** Some enterprise clients require EU or country-specific data storage.
- **CCPA:** California consumer privacy obligations if users are US residents.
- **ISO 27001:** Information security management; increasingly required for enterprise deals.

---

## Common Integrations & Systems
- **Identity:** Okta, Azure AD, Google Workspace (SSO / SCIM)
- **Billing:** Stripe, Chargebee, Zuora, Recurly
- **CRM:** Salesforce, HubSpot (for customer data sync)
- **Support:** Zendesk, Intercom (in-app chat, support tickets)
- **Analytics:** Segment, Amplitude, Mixpanel (product analytics)
- **Email:** SendGrid, Postmark (transactional email)
- **Monitoring:** Datadog, PagerDuty, Sentry

---

## Anti-Patterns to Avoid
1. **Requirements without tenant context:** Always specify whether a requirement applies to all tenants, specific plans, or admins only.
2. **Billing requirements without edge cases:** Cover failed payments, prorations, free trial expiry, and grandfathering.
3. **Treating all users as one persona:** SaaS typically has workspace Admin, Power User, and Read-Only Viewer with distinct needs.
4. **Ignoring churn signals in requirements:** Requirements for customer health scores and early-warning alerts are often forgotten until post-launch.
5. **No API versioning strategy:** Not defining deprecation timelines causes breaking changes that churn developer customers.
6. **Vague SLA language:** "High availability" is not a requirement. Write: "System uptime ≥ 99.9% measured over each calendar month, excluding scheduled maintenance windows communicated ≥ 48 hours in advance."

---

## Example Deliverable Snippet

**FR-042 — Tenant Self-Serve Plan Downgrade**
> When an Admin selects a lower subscription tier, the system must:
> 1. Display a comparison of features that will be lost (FR-043).
> 2. Require Admin to type "CONFIRM DOWNGRADE" before proceeding.
> 3. Schedule the downgrade to take effect at the end of the current billing period.
> 4. Send a confirmation email to all Admin users within 60 seconds.
> 5. Retain all data for 90 days post-downgrade before archiving.
>
> **Priority:** Must | **Acceptance Criteria:**
> - Given an Admin on a Pro plan, When they initiate downgrade to Starter, Then the feature-loss comparison modal appears before any action is taken.
> - Given the Admin types "CONFIRM DOWNGRADE", When they submit, Then downgrade is scheduled and a confirmation email is sent within 60 seconds.
