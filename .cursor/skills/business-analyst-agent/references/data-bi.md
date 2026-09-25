# BA in Data Analytics & Business Intelligence

## Domain Overview
Data and BI BA work translates business questions into analytical requirements:
data sources, transformation rules, KPI definitions, and dashboard specifications.
The BA must bridge the gap between business stakeholders who ask "why is revenue
down?" and data engineers who need precise specifications for pipelines, models,
and access controls. Precision in KPI definitions is non-negotiable.

---

## Key Terminology
| Term | Definition |
|---|---|
| Data Warehouse | Centralised repository of structured, integrated data optimised for analytical queries |
| Data Lake | Storage repository holding raw data in native format until needed |
| Data Lakehouse | Architecture combining data lake flexibility with data warehouse structure (Delta Lake, Iceberg) |
| ETL | Extract, Transform, Load — data pipeline pattern (transform before loading) |
| ELT | Extract, Load, Transform — cloud-native pattern (load raw, transform in-warehouse) |
| Dimension | Descriptive attribute used to filter/group data (e.g., Date, Product, Region) |
| Fact Table | Contains measurable events/transactions (e.g., Sales, Orders, Clicks) |
| Grain | The level of detail represented by one row in a fact table; must be explicitly defined |
| KPI | Key Performance Indicator — quantified measure tied to a business objective |
| Metric | Quantified measurement; may or may not be a KPI |
| Data Quality Rule | Specification for what constitutes valid, accurate data (not null, within range, referential integrity) |
| Data Lineage | Documentation of data's origin, transformations, and destinations through the pipeline |
| Data Catalogue | Metadata repository describing available datasets, owners, and definitions |
| Data Governance | Policies, standards, and processes for managing data as an asset |
| Refresh Frequency | How often a dataset or dashboard is updated (real-time, hourly, daily, weekly) |
| SCD | Slowly Changing Dimension — how to handle historical changes to dimension attributes |
| Dashboard | Visual display of KPIs and metrics for decision-making |
| Drill-Down | Navigating from a summary metric to underlying detail |
| Self-Service Analytics | Ability for business users to query and visualise data without IT intervention |
| Row-Level Security (RLS) | Restricting data visible to a user based on their role or region |

---

## Common Stakeholders
| Role | Primary Concerns |
|---|---|
| Chief Data Officer | Data strategy, governance, data product quality |
| Business Analyst / Data Analyst | Report requirements, KPI definitions, ad hoc queries |
| Data Engineer | Pipeline specifications, data quality rules, schema design |
| BI Developer | Dashboard requirements, visualisation logic, refresh schedules |
| Business Unit Manager | Actionable insights, correct KPI definitions, report reliability |
| IT / Data Architect | Platform choice, security, scalability, cost |
| Compliance / Privacy | Data access controls, PII handling, audit logs |

---

## KPI Definition Template (Mandatory)
Every KPI must be documented with:

| Field | Value |
|---|---|
| KPI Name | [Name] |
| KPI ID | KPI-001 |
| Business Question | What decision does this KPI support? |
| Definition | Precise formula in plain English |
| Formula | e.g., (Orders Delivered On Time / Total Orders) × 100 |
| Data Source(s) | [Table/API/System] |
| Grain | [One row per day per region, etc.] |
| Numerator | [Field name, filter, and aggregation] |
| Denominator | [Field name, filter, and aggregation] |
| Include / Exclude | Filters applied (e.g., exclude cancelled orders) |
| Refresh Frequency | Daily at 06:00 UTC |
| Owner | [Name / Team] |
| Target / Threshold | ≥ 95% (Green), 90–94% (Amber), < 90% (Red) |
| Dimensions | Date, Region, Product Category |

---

## Typical Requirements Patterns

**Data Pipeline**
- Source system extract must complete within the batch window (23:00–05:00 UTC).
- Pipeline must fail loudly: alert data engineering on-call within 5 minutes of failure; dashboard must display "Data as of [last successful refresh]" when stale.
- All transformations must be idempotent: re-running a pipeline for the same date must not create duplicate records.

**Data Quality**
- Null rate for [critical field] must be < 1% per daily batch; alert if exceeded.
- Referential integrity: every order_id in the fact table must exist in the orders dimension.
- Duplicate records: no duplicate (order_id, line_item_id) combinations permitted.
- Timeliness: data for day D must be available in the warehouse by 06:00 on day D+1.

**Dashboard Requirements**
- Dashboard must load within 3 seconds for a standard date range (last 90 days) on a modern browser.
- All charts must include a data-as-of timestamp.
- Users must be able to drill down from any summary metric to transaction-level detail.
- Filters available: date range, region, product category, sales channel (multi-select).

**Access Control**
- Regional managers see data only for their assigned region (row-level security by user attribute).
- Executive dashboard visible to C-suite and board members only.
- Data containing PII must be masked for non-authorised users (e.g., customer name shows as "C****r S***h").

---

## Regulatory & Compliance Considerations
- **GDPR / CCPA:** PII in analytical systems must have documented legal basis; data minimisation applies; retention periods must be enforced.
- **SOX:** Financial reporting data must be immutable once period-closed; audit trail of any manual adjustments required.
- **HIPAA:** PHI in BI systems requires the same safeguards as operational systems; de-identification standard must be met before sharing analytical datasets.
- **Data Sovereignty:** Analytics platform must be hosted in approved regions; cross-border data transfer documentation required.

---

## Common Integrations & Systems
- **Data Warehouses:** Snowflake, Google BigQuery, Amazon Redshift, Azure Synapse Analytics, Databricks
- **ETL/ELT Tools:** dbt, Apache Spark, AWS Glue, Azure Data Factory, Fivetran, Airbyte, Matillion
- **BI / Visualisation:** Power BI, Tableau, Looker (Google), Qlik, MicroStrategy, Apache Superset
- **Data Catalogues:** Alation, Collibra, Atlan, Azure Purview, AWS Glue Data Catalog
- **Data Quality:** Great Expectations, Monte Carlo, Soda, dbt tests
- **Streaming:** Apache Kafka, AWS Kinesis, Azure Event Hubs (for near-real-time pipelines)

---

## Anti-Patterns to Avoid
1. **KPIs defined in a meeting and never written down:** Every KPI must have a written, signed-off definition before development starts. Verbal agreements lead to disputes over numbers.
2. **"Just give us all the data":** Undifferentiated data dumps are not requirements. Work with stakeholders to define specific business questions first.
3. **No grain definition:** Failing to define the grain of a fact table results in incorrect aggregations. Always state: one row per [X per Y].
4. **Dashboard requirements without performance SLAs:** If a dashboard takes 45 seconds to load, it won't be used. Define load time requirements up front.
5. **Ignoring data refresh latency:** "Real-time" means different things to different people. Define the maximum acceptable data latency (e.g., "data must be no more than 15 minutes old").
6. **No data quality monitoring requirements:** Pipelines will fail and data will be wrong. Require alerting, data quality dashboards, and SLA definitions from day one.

---

## Example Deliverable Snippet

**KPI-008 — Customer Churn Rate (Monthly)**

| Field | Value |
|---|---|
| Business Question | What percentage of active customers cancelled their subscription this month? |
| Formula | (Customers who cancelled in month M / Active customers at start of month M) × 100 |
| Data Source | `subscriptions` table (CRM database), `cancellation_events` table (product events) |
| Grain | One row per calendar month per subscription plan |
| Include | Only paid subscriptions (plan_type ≠ 'free') |
| Exclude | Customers cancelled within their free trial period |
| Refresh Frequency | Daily at 07:00 UTC; monthly rollup locked on the 2nd of the following month |
| Owner | Head of Customer Success |
| Target | ≤ 2.0% (Green), 2.1–3.0% (Amber), > 3.0% (Red) |
| Dimensions | Date (month), Subscription Plan, Acquisition Channel, Cohort |
| **FR-031** | Dashboard must allow drill-down from monthly churn rate to list of individual churned customers with their tenure, plan, and last login date. |
