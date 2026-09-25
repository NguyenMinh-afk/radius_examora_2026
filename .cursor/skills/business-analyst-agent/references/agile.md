# BA in Agile

## Domain Overview
Agile BA (also called Product Owner, Business Analyst, or Discovery Lead
depending on the organisation) is responsible for maintaining a healthy,
prioritised backlog and ensuring the team builds the right thing. The BA
works in dual-track agile: running discovery for future sprints while
supporting delivery of the current sprint. Requirements are expressed as
user stories with clear acceptance criteria, not as monolithic documents.

---

## Key Terminology
| Term | Definition |
|---|---|
| Product Backlog | Ordered list of everything the team might work on; owned by the Product Owner |
| Sprint | Time-boxed iteration (typically 1-4 weeks) during which the team delivers a shippable increment |
| Epic | Large body of work that spans multiple sprints; broken into stories |
| User Story | Requirement expressed from the user's perspective: "As a [persona], I want [goal], so that [benefit]" |
| Story Point | Relative unit of effort/complexity assigned to a story (Fibonacci: 1, 2, 3, 5, 8, 13, 21) |
| Velocity | Number of story points delivered per sprint; used for forecasting |
| Sprint Planning | Ceremony where team selects and commits to backlog items for the sprint |
| Sprint Review | Demo of completed work to stakeholders; gather feedback |
| Sprint Retrospective | Team reflection on process, practices, and improvement actions |
| Backlog Refinement (Grooming) | Ongoing process of adding detail, estimates, and priority to backlog items |
| Definition of Ready (DoR) | Criteria a story must meet before the team commits to it in sprint planning |
| Definition of Done (DoD) | Criteria that must be met before a story is accepted as complete |
| Acceptance Criteria | Specific, testable conditions that determine whether a story is done |
| Given/When/Then | BDD-style format for writing acceptance criteria |
| Story Mapping | Visual technique arranging stories by user journey to plan releases |
| PI Planning | Program Increment Planning — SAFe ceremony planning 8-12 weeks of work across teams |
| ART | Agile Release Train — SAFe team-of-teams structure |
| Dual-Track Agile | Running discovery (what to build) and delivery (building it) in parallel |
| Continuous Discovery | Ongoing user research and experimentation rather than one-time requirements gathering |
| WSJF | Weighted Shortest Job First — SAFe prioritisation method: (Business Value + Time Criticality + Risk Reduction) / Job Size |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| Product Owner | Backlog quality, priority, stakeholder alignment, sprint goals |
| Scrum Master | Team velocity, process health, impediment removal |
| Development Team | Clear acceptance criteria, minimal story changes mid-sprint |
| UX / Design | Discovery research, prototype validation, design system alignment |
| Business Stakeholders | Feature delivery, business outcomes, visibility into roadmap |
| Release Manager | Deployment risk, release coordination, regression scope |

---

## Story Quality Checklist (INVEST + SPIDR)

**INVEST Criteria (every story should be):**
- **I**ndependent: deliverable without depending on another incomplete story
- **N**egotiable: scope can be adjusted; not a fixed contract
- **V**aluable: delivers value to a user or business
- **E**stimable: team can size it
- **S**mall: completable within one sprint
- **T**estable: acceptance criteria are clear and verifiable

**Story Splitting Patterns (SPIDR):**
- **S**pike: separate research/exploration from implementation
- **P**aths: split by workflow path or user role
- **I**nterface: split UI from API/backend
- **D**ata: split by data type, format, or volume
- **R**ules: separate complex business rules into individual stories

---

## Backlog Management Standards

**Backlog Levels:**
```
Theme → Epic → Feature → User Story → Task
```

**Minimum backlog health requirements:**
- Sprint +1: fully groomed stories with acceptance criteria and estimates
- Sprint +2: stories written and acceptance criteria drafted
- Sprint +3: epics and features defined with enough detail to begin grooming

**MoSCoW for Release Planning:**
- Must: delivery failure if not included in release
- Should: high value, include if capacity allows
- Could: nice to have, defer if pressure arises
- Won't: explicitly excluded from this release

**WSJF Scoring (for SAFe environments):**
| Story | Business Value 1-10 | Time Criticality 1-10 | Risk Reduction 1-10 | Job Size (SP) | WSJF Score |
|---|---|---|---|---|---|
| US-001 | 8 | 5 | 3 | 5 | (8+5+3)/5 = 3.2 |

---

## Typical Requirements Patterns

**Backlog Refinement**
- Every story entering sprint planning must meet the Definition of Ready: written, estimated, acceptance criteria defined, dependencies identified, design attached (if applicable).
- Stories > 13 points must be split before sprint planning.
- All acceptance criteria must follow Given/When/Then format.

**Sprint Goal**
- Each sprint must have a single, measurable sprint goal agreed by the team at planning.
- Sprint goal format: "By the end of this sprint, [user type] will be able to [capability], which we will validate by [measure]."

**PI Planning (SAFe)**
- Business Owners must attend PI Planning to provide context and ratify priorities.
- Each team must identify and communicate programme risks (ROAM: Resolved, Owned, Accepted, Mitigated).
- PI Objectives: 5–10 business objectives per team, each with a committed confidence level (1–10).

---

## Definition of Ready Template
A story is Ready when:
- [ ] Story is written in "As a / I want / So that" format
- [ ] Acceptance criteria are in Given/When/Then format (minimum 2 criteria)
- [ ] Dependencies are identified and unblocked
- [ ] Design mockup attached (if UX change)
- [ ] Story is sized by the team (≤8 points; split if larger)
- [ ] Edge cases and error scenarios documented

## Definition of Done Template
A story is Done when:
- [ ] All acceptance criteria pass (verified by QA)
- [ ] Unit and integration tests written and passing
- [ ] Code reviewed and merged to main branch
- [ ] Product Owner has accepted the story in the sprint review
- [ ] No new high or critical defects introduced
- [ ] Monitoring / alerting configured if new feature has SLA
- [ ] Documentation updated (API docs, user guide)

---

## Regulatory & Compliance Considerations
- **Agile in regulated industries:** FDA (software as medical device), FCA (operational resilience), HIPAA — regulated industries require additional documentation beyond stories; traceability from story → test → deployment must be maintained.
- **Audit evidence:** Sprint reviews, retrospectives, and backlog state must be recorded; decisions documented in ADRs or decision logs.
- **Change control:** In some regulated contexts, changes to in-flight requirements require a formal change request even in Agile.

---

## Anti-Patterns to Avoid
1. **Stories written in technical tasks:** "As a developer, I want to refactor the database" is not a user story. Stories must describe user-facing value.
2. **Acceptance criteria written as test scripts:** AC should describe the observable behaviour, not the test steps. "System processes payment" not "click Pay button, observe database insert."
3. **Skipping Definition of Ready:** Bringing un-groomed stories into sprint planning wastes planning time and causes mid-sprint blockers.
4. **Epics that never end:** Epics must have clear completion criteria. An epic open for >6 months is a symptom of poor decomposition.
5. **Velocity as a performance metric:** Velocity is a planning tool. Using it to compare teams or pressure individuals destroys trust and inflates estimates.
6. **Discovery running behind delivery:** If discovery is always one sprint ahead at best, the team is feature-factory mode, not outcome-driven. Discovery should be 2-3 sprints ahead.

---

## Example Deliverable Snippet

**US-034 — Export Report as PDF**
```
Epic: Reporting & Exports
Title: Export any dashboard report as a PDF
Story: As a Regional Manager, I want to export any dashboard report as a
       PDF, so that I can share performance data with stakeholders who do
       not have system access.
Priority: Should
Complexity: M (5 points)
Dependencies: US-028 (Dashboard Filters must be complete)

Acceptance Criteria:
- Given I am viewing any dashboard report,
  When I click the "Export" button and select "PDF",
  Then a PDF is generated containing the current filtered view with all
  visible charts and tables, within 10 seconds.
- Given the PDF is generated,
  When I open it,
  Then it includes the report name, applied filters, data-as-of date,
  and the company logo in the header.
- Given the report contains >50 rows in a table,
  When exported to PDF,
  Then all rows are included (paginated across PDF pages, not truncated).

Definition of Ready: ✅ | Definition of Done criteria: standard DoD applies
```
