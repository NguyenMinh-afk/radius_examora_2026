# Database Documentation

This document describes the PostgreSQL database setup, schema organization, initialization, seeding, and reset procedures for the EXMORA project.

## 1. Database Setup

- The project uses a single PostgreSQL instance with multiple schemas.
- Database name: `Exam_Bank`
- Default user/password: `postgres` / `123456`
- Port: `5432:5432`
- Init scripts:
  - `schema_optimized.sql` — creates schemas, tables, indexes, triggers
  - `seed_data.sql` — inserts sample data for local development and testing

## 2. Schema Architecture

The schema is split by service domain into separate PostgreSQL schemas:

- `user_db` — User service tables
- `course_db` — Course service tables
- `question_db` — Question bank tables
- `exam_db` — Exam, class, assignment tables
- `ai_db` — AI generation pipeline tables
- `notification_db` — Notification and email tables
- `infra_eventing` — Outbox, queue jobs, dead letter queue
- `infra_observability` — Audit logs, system events, test runs
- `public` — Shared enums and helper functions

Shared types:
- `public.difficulty_level` — `easy`, `medium`, `hard`, `very_hard`
- `public.question_type` — `multiple_choice`, `true_false`, `matching`, `fill_blank`

## 3. Key Tables by Schema

### `user_db`
- `roles` — admin, teacher, student
- `users` — core user accounts
- `user_profiles` — student/teacher profile fields
- `user_devices` — device tracking
- `user_sessions` — session management
- `oauth_providers` — Google/Microsoft OAuth links
- `password_reset_tokens` — password reset flow

### `course_db`
- `faculties` — faculty list
- `courses` — course catalog
- `chapters` — course chapters
- `knowledge_units` — chapter knowledge units

### `question_db`
- `questions` — question bank
- `question_tags` — tags for questions
- `question_tag_relations` — question-tag mapping
- `answers` — answer options

### `exam_db`
- `exams` — exam definitions
- `exam_questions` — exam-to-question mapping
- `classes` — class/room definitions
- `class_members` — students in classes
- `class_posts` — announcements/materials/assignments
- `exam_assignments` — exams assigned to classes
- `student_assignments` — student assignment status
- `attempts` — exam attempts
- `attempt_answers` — per-question answers in attempts

### `ai_db`
- `ai_generation_requests` — user requests to generate questions
- `ai_generation_tasks` — tasks within a request
- `generated_questions` — AI-generated questions pending review
- `ai_generation_logs` — Gemini/OCR logs
- `documents` — uploaded documents for AI pipeline
- `ai_jobs` — async AI job tracking

### `notification_db`
- `notifications` — in-app notifications
- `email_templates` — email template definitions
- `email_logs` — email send logs

### `infra_eventing`
- `outbox_events` — outbox pattern for reliable event publishing
- `processed_messages` — consumer deduplication
- `dead_letter_messages` — DLQ tracking
- `queue_jobs` — internal task/job tracking

### `infra_observability`
- `audit_logs` — admin/action audit trail
- `test_runs` — test execution records
- `system_events` — system-level events

## 4. Docker Compose Mount

In `docker-compose.yml`, Postgres mounts:

```yaml
volumes:
  - ./database/schema_optimized.sql:/docker-entrypoint-initdb.d/01-schema.sql
  - ./database/seed_data.sql:/docker-entrypoint-initdb.d/02-seed.sql
  - postgres-data:/var/lib/postgresql/data
```

Init scripts run only when the `postgres-data` volume is created fresh.

## 5. Seed Data

The seed data includes:

- Default roles: `admin`, `teacher`, `student`
- Sample users:
  - `admin@examora.local`
  - `teacher1@examora.local`
  - `teacher2@examora.local`
  - `student1@examora.local`
  - `student2@examora.local`
- Sample courses under faculty `CNTT`
- Sample classes and class members
- Sample exams, questions, attempts
- Sample AI jobs and generated questions
- Sample notifications and email templates
- Sample outbox events and queue jobs

## 6. Re-initializing the Database

If you need to drop and recreate the database:

```bash
docker compose down
docker volume remove Project_Exmora_postgres-data
docker compose up -d postgres-db
```

Or apply manually from host:

```bash
psql -U postgres -d Exam_Bank -f "c:\Users\Admin\Project_Exmora\database\schema_optimized.sql"
psql -U postgres -d Exam_Bank -f "c:\Users\Admin\Project_Exmora\database\seed_data.sql"
```

## 7. Notes

- All schemas except `public` are service-scoped.
- Cross-service references are usually logical UUIDs rather than foreign keys.
- `queue_jobs` intentionally omits hard FK to `user_db.users` to preserve microservice isolation.
- Triggers auto-update `updated_at` for many tables.
