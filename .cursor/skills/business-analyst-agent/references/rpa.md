# BA in RPA / Intelligent Automation

## Domain Overview
RPA (Robotic Process Automation) BA work focuses on identifying automatable
processes, documenting them rigorously, and building the business case for
automation. The BA bridges business SMEs and bot developers, producing Process
Definition Documents (PDD) and Solution Design Documents (SDD). A critical
principle: never automate a broken process — fix it first.

---

## Key Terminology
| Term | Definition |
|---|---|
| PDD | Process Definition Document — AS-IS process documented for bot development |
| SDD | Solution Design Document — technical design of the automation solution |
| Attended Bot | Bot that runs alongside a human, triggered manually or by desktop events |
| Unattended Bot | Bot that runs autonomously on a schedule or event trigger, without human interaction |
| Orchestrator | Central server that schedules, monitors, and manages bots (e.g., UiPath Orchestrator) |
| Queue | Orchestrator-managed list of work items for bots to process |
| FTE | Full-Time Equivalent — unit for measuring human effort replaced by automation |
| FTE Savings | Estimated reduction in human working hours; key ROI metric |
| Exception Handling | How the bot handles errors, unexpected inputs, or process deviations |
| Business Exception | A case the process rules cannot handle; requires human intervention |
| System Exception | Technical failure (timeout, unavailable system) requiring retry or escalation |
| Process Mining | Data-driven analysis of event logs to discover and map actual process execution |
| Automation Feasibility | Assessment of how suitable a process is for automation |
| Rule-Based | Process decisions are deterministic and can be codified; required for standard RPA |
| Credential Vault | Secure storage for bot login credentials (e.g., CyberArk, UiPath Credential Store) |
| Change Management | People-side plan to manage employee concerns about automation |
| Bot Persona | Named identity (e.g., "RPA-Bot-01") used by bots to log into systems |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| Process Owner | Business outcome, SLAs, exception handling decisions |
| SME (Subject Matter Expert) | Detailed process steps, variations, edge cases |
| IT / Infrastructure | Bot server provisioning, network access, credential management |
| Security | Bot user accounts, access control, audit trails |
| Finance | ROI calculations, FTE cost data, benefit realisation tracking |
| Change Manager | Employee communication, redeployment planning |
| Centre of Excellence (CoE) | Governance, standards, bot library, reusability |

---

## Automation Feasibility Scoring Matrix
Rate each criterion 1 (low suitability) to 5 (high suitability):

| Criterion | Description | Score 1-5 |
|---|---|---|
| Rule-based | Decisions are deterministic, no judgement required | |
| Digital inputs | Inputs are available digitally (not handwritten/image) | |
| Volume | High transaction volume (>100/day recommended) | |
| Stability | Process and systems are stable, low change frequency | |
| Standardisation | Low variation across process instances | |
| Time-critical | Clear SLA or time pressure making automation valuable | |
| **Total (÷6)** | **Average score; >3.5 = viable candidate** | |

---

## Typical Requirements Patterns

**Process Definition**
- Process must be executed in [system name] using credentials stored in the credential vault.
- Bot must handle the following exception types: [list with disposition for each].
- Processing SLA: all items in the queue must be completed within 4 hours of queue population.

**Exception Handling**
- Business exceptions must be logged to the exception log and routed to the [team] Outlook shared mailbox within 5 minutes.
- System exceptions must trigger 3 automated retries with 2-minute intervals before escalation.
- All exceptions must include: timestamp, transaction ID, process step, error description, screenshot.

**Audit & Logging**
- Every transaction processed must be logged with: timestamp, input data hash, outcome (Success/Business Exception/System Exception), processing time.
- Audit log must be retained for 7 years (or per regulatory requirement).

**Orchestrator / Scheduling**
- Bot must run Monday–Friday, 06:00–22:00 local time.
- Orchestrator must alert [team] via email if bot fails to start or if queue depth exceeds [N] items.

---

## Regulatory & Compliance Considerations
- **SOX:** Automated financial processes must maintain full audit trails; bot actions are treated as human actions for control purposes.
- **GDPR/CCPA:** Bots that process personal data must comply with data minimisation and deletion requirements.
- **HIPAA:** Bots processing PHI must use encrypted channels; all access logged.
- **Change Control:** Production bot deployment requires change management board approval in regulated industries.
- **Credential Security:** Bot credentials must be stored in approved vault; no hardcoded passwords in bot code.

---

## Common Integrations & Systems
- **RPA Platforms:** UiPath, Automation Anywhere (A360), Blue Prism, Power Automate Desktop
- **Orchestration:** UiPath Orchestrator, A360 Control Room, SS&C Blue Prism Hub
- **Credential Management:** CyberArk, BeyondTrust, UiPath Credential Store
- **Monitoring:** UiPath Insights, Power BI (bot performance dashboards)
- **Process Mining:** Celonis, UiPath Process Mining, SAP Signavio
- **Target Systems:** SAP, Oracle ERP, Salesforce, legacy web apps, desktop apps, Excel, email

---

## Anti-Patterns to Avoid
1. **Automating a broken process:** If the AS-IS process has defects, fix the process first. Automating waste produces faster waste.
2. **Skipping exception design:** Most bot failures come from unhandled exceptions. The exception handling matrix must be completed before development starts.
3. **No change management plan:** Employees who fear job loss will sabotage automation. Address this explicitly.
4. **Ignoring system stability:** Bots break when UIs change. Capture system change frequency and plan for bot maintenance cycles.
5. **Vague ROI claims:** "This will save time" is not acceptable. Calculate: (FTE hours saved/year × loaded cost/hour) − (bot licence cost + development cost + maintenance cost) = Net Annual Benefit.
6. **Single-bot architecture for high volume:** Plan for bot scalability; design queues that support parallel processing.

---

## Example Deliverable Snippet

**PDD — Invoice Processing Automation (Accounts Payable)**

> **Process Step 4: Validate Invoice Against Purchase Order**
> - **Actor (AS-IS):** AP Clerk
> - **Actor (TO-BE):** Unattended Bot (RPA-AP-Bot-01)
> - **System:** SAP S/4HANA (Transaction ME23N)
> - **Input:** Invoice number extracted from email attachment (PDF, parsed by IDP)
> - **Steps:**
>   1. Open SAP transaction ME23N.
>   2. Enter PO number from invoice header field.
>   3. Compare line-item amounts: invoice vs. PO (tolerance: ±2% or ±£50).
>   4. If match → flag as "Approved" in queue; proceed to Step 5.
>   5. If mismatch → log as Business Exception; email AP Supervisor with invoice + PO PDF.
> - **Volume:** ~250 invoices/day | **SLA:** Processed within 2 hours of receipt
> - **FTE Savings:** 1.5 FTE (3 hours/day clerk time reclaimed)
