# BA in Healthcare & HealthTech

## Domain Overview
Healthcare BA work is defined by patient safety, regulatory compliance, and
clinical workflow sensitivity. Requirements must protect Protected Health
Information (PHI), support clinical decision-making, and integrate with
established health information standards. The BA must treat compliance not
as a constraint but as a foundational design principle.

---

## Key Terminology
| Term | Definition |
|---|---|
| PHI | Protected Health Information — any individually identifiable health data |
| HIPAA | Health Insurance Portability and Accountability Act — US health data privacy and security law |
| HL7 | Health Level 7 — standard for exchanging health data between systems |
| FHIR | Fast Healthcare Interoperability Resources — modern REST-based HL7 standard |
| EHR | Electronic Health Record — comprehensive digital patient health record |
| EMR | Electronic Medical Record — practice-specific patient clinical data |
| PMS | Practice Management System — scheduling, billing, administration |
| PACS | Picture Archiving and Communication System — medical imaging storage |
| DICOM | Digital Imaging and Communications in Medicine — medical image standard |
| ICD-10 | International Classification of Diseases (10th revision) — diagnosis coding |
| CPT | Current Procedural Terminology — medical procedure billing codes |
| CDS | Clinical Decision Support — system alerts and recommendations for clinicians |
| Care Plan | Structured plan of treatment and goals for a patient |
| Prior Authorisation | Insurer approval required before a procedure or medication |
| Telehealth | Remote clinical care delivered via video, phone, or messaging |
| Interoperability | Ability of systems to exchange and use health data |
| Consent | Patient's authorised agreement to data use, sharing, or treatment |
| BAA | Business Associate Agreement — HIPAA-required contract with vendors accessing PHI |
| SDOH | Social Determinants of Health — non-clinical factors affecting health outcomes |
| NPI | National Provider Identifier — unique 10-digit number for US healthcare providers |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| Clinical Lead / Physician | Workflow impact, clinical accuracy, alert fatigue, liability |
| Chief Medical Officer | Patient safety, regulatory risk, quality metrics |
| Compliance / Privacy Officer | HIPAA, state privacy laws, breach protocols |
| IT / Health Informatics | Integration standards, system uptime, data governance |
| Revenue Cycle Manager | Billing accuracy, claims denial rates, prior auth efficiency |
| Patient (end user) | Access to records, ease of use, privacy, care coordination |
| Health Information Manager | Record retention, coding accuracy, release of information |

---

## Typical Requirements Patterns

**PHI Handling**
- All PHI must be encrypted at rest (AES-256) and in transit (TLS 1.2 minimum).
- PHI access must be logged: user, timestamp, patient record accessed, action performed.
- Role-based access control: physicians access full records; admin staff access billing data only; patients access their own records.
- Minimum necessary rule: applications must request and display only the PHI required for the specific task.

**Interoperability / HL7 FHIR**
- System must support FHIR R4 for all patient data exchange.
- Patient demographic data must be exchangeable via FHIR Patient resource.
- Lab results must be transmitted using FHIR Observation resources.
- System must send HL7 ADT (Admit, Discharge, Transfer) messages to downstream systems within 60 seconds of event.

**Clinical Workflows**
- CDS alerts must not interrupt a clinical workflow for low-severity flags; present as a passive notification.
- High-severity CDS alerts (e.g., drug-drug interaction, critical lab value) must require clinician acknowledgement before proceeding.
- Order sets must be configurable by Clinical Lead without IT intervention.

**Telehealth**
- Video consultation platform must support a minimum of 1,080p resolution at 30fps.
- Session recording, if enabled, must require explicit patient consent captured in the system before recording starts.
- Appointment reminders must be sent via patient's preferred channel (SMS/email/app notification) 24 hours and 1 hour before appointment.

**Claims & Billing**
- Claims must be submitted in ANSI X12 837P (professional) or 837I (institutional) format.
- System must validate ICD-10 and CPT code combinations before submission; reject invalid combinations with reason code.

---

## Regulatory & Compliance Considerations
- **HIPAA Privacy Rule:** Governs use and disclosure of PHI; minimum necessary standard; patient rights (access, amendment, accounting of disclosures).
- **HIPAA Security Rule:** Administrative, physical, and technical safeguards for electronic PHI.
- **HITECH Act:** Strengthened HIPAA; breach notification requirements; increased penalties.
- **21st Century Cures Act:** Information blocking prohibition; patient access to electronic health information via FHIR APIs.
- **CMS Interoperability Rule:** Payers and providers must offer FHIR-based APIs.
- **State Privacy Laws:** California CMIA, New York SHIELD Act — may be stricter than HIPAA.
- **FDA (Software as a Medical Device):** If software makes clinical decisions, it may be classified as a medical device requiring FDA clearance.

---

## Common Integrations & Systems
- **EHR/EMR:** Epic, Cerner (Oracle Health), Allscripts, athenahealth, Meditech
- **Revenue Cycle:** Waystar, Change Healthcare, Availity
- **Telehealth:** Zoom for Healthcare, Teladoc, Doxy.me
- **Lab Systems:** Cerner PathNet, Sunquest, Orchard
- **Pharmacy:** Surescripts (e-prescribing), Epic Willow
- **FHIR Servers:** Google Cloud Healthcare API, Microsoft Azure Health Data Services, Smile CDR
- **Identity:** Epic MyChart, CommonWell, Carequality (national networks)

---

## Anti-Patterns to Avoid
1. **Treating consent as a checkbox:** Consent must be granular (research vs. treatment vs. billing), revocable, and auditable. Do not design a single "I agree" consent model for complex use cases.
2. **Ignoring alert fatigue:** If every requirement triggers a CDS alert, clinicians will override all of them. Tiered alert severity with evidence-based thresholds is required.
3. **Conflating EHR and PMS:** These are different systems with different data models. Understand which system owns which data before writing integration requirements.
4. **FHIR without a conformance statement:** Specify which FHIR resources, interactions, and profiles are supported. "We support FHIR" is not a requirement.
5. **No downtime recovery plan:** Healthcare systems must define requirements for downtime procedures (paper-based fallback, read-only access, priority recovery order).
6. **Skipping the patient journey:** Requirements written only from the provider perspective miss patient experience, consent touchpoints, and access rights.

---

## Example Deliverable Snippet

**FR-027 — Electronic Prior Authorisation Submission**
> When a clinician orders a procedure requiring prior authorisation (as defined by the payer's authorisation list), the system must:
> 1. Automatically detect that prior auth is required based on payer + procedure code (CPT) combination.
> 2. Pre-populate the auth request form with: patient demographics, diagnosis codes (ICD-10), procedure codes (CPT), ordering provider NPI.
> 3. Submit the request via FHIR CRD (Coverage Requirements Discovery) to the payer within 30 seconds.
> 4. Display the payer's real-time decision (Approved / Pending / Denied) in the patient chart within 60 seconds.
> 5. If Denied, display the denial reason code and present one-click appeal template.
>
> **NFR-011 — Prior Auth Response Time**
> Payer API response must be displayed to the clinician in <60 seconds for 90% of submissions.
>
> **Compliance:** 21st Century Cures Act — Prior Auth Rule (CMS-0057-F)
