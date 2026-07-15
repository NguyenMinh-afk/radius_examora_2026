# Database Command Reference

This document is a complete reference for PostgreSQL commands, divided into four sections:
- **psql** — interactive terminal client commands
- **SQL** — common data operations
- **pg_dump / pg_restore** — backup and restore
- **docker exec** — running commands inside containers

All commands assume the default credentials unless noted otherwise:
- User: `postgres`
- Password: `123456`
- Database: `Exam_Bank`
- Host port: `5432`

---

## 1. psql — Interactive Commands

psql is the default PostgreSQL terminal client. Run it from the host or inside a container.

### Connect to a Database

```sql
-- Connect to Exam_Bank on the default host/port
psql -U postgres -d Exam_Bank

-- Connect with a specific host and port
psql -U postgres -d Exam_Bank -h localhost -p 5432

-- Connect with a password (prompts for password)
psql -U postgres -d Exam_Bank -W

-- Connect inside a Docker container
docker exec -it exmora-postgres psql -U postgres -d Exam_Bank

-- Connect as a specific user inside the container
docker exec -it exmora-postgres psql -U postgres -d Exam_Bank -W
```

### General Commands (inside psql)

```sql
-- List all databases
\l
\l+

-- List all tables in the current database
\dt
\dt+                       -- with extra info (size, description)

-- List all tables in a specific schema
\dt user_db.*              -- tables in user_db schema
\dt course_db.*
\dt exam_db.*

-- List all schemas
\dn
\dn+

-- List all roles/users
\du
\du+

-- List all indexes
\di

-- List all views
\dv

-- Describe a table (columns, types, constraints)
\d users
\d user_db.users          -- schema-qualified
\d+ users                  -- with extra detail

-- Describe a sequence
\ds

-- Describe a function
\df

-- Show the current schema search path
SHOW search_path;

-- Set the search path for the session
SET search_path TO user_db, public;

-- Show all tables in a schema (alternative)
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- List all indexes on a table
SELECT indexname, indexdef
FROM pg_indexes
WHERE tablename = 'users';

-- Show table size
SELECT pg_size_pretty(pg_total_relation_size('users'));
SELECT pg_size_pretty(pg_relation_size('users'));

-- Show database size
SELECT pg_size_pretty(pg_database_size('Exam_Bank'));

-- List all running queries (superuser)
SELECT pid, usename, application_name, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Kill a running query
SELECT pg_cancel_backend(pid);  -- graceful
SELECT pg_terminate_backend(pid); -- force

-- List active locks
SELECT pid, mode, granted, relation::regclass
FROM pg_locks
WHERE NOT granted;

-- List open transactions
SELECT pid, now() - xact_start AS duration, state, query
FROM pg_stat_activity
WHERE state IN ('active', 'idle in transaction')
AND xact_start IS NOT NULL;

-- Quit psql
\q
```

### Copy / Import / Export (inside psql)

```sql
-- Copy table data to a CSV file on the server
\copy users TO '/tmp/users.csv' WITH (FORMAT csv, HEADER);

-- Import CSV into a table
\copy users FROM '/tmp/users.csv' WITH (FORMAT csv, HEADER);

-- Import CSV with specific columns
\copy users(email, full_name) FROM '/tmp/users.csv' WITH (FORMAT csv, HEADER);

-- Export query results to CSV
\copy (SELECT id, email, full_name FROM users) TO '/tmp/users_export.csv' WITH (FORMAT csv, HEADER);

-- Enable server-side COPY (writes to server file system, needs superuser)
COPY users TO '/tmp/users.csv' WITH (FORMAT csv, HEADER);
```

### Transaction Control (inside psql)

```sql
-- Start a transaction
BEGIN;

-- Make changes
UPDATE users SET is_active = false WHERE email = 'test@test.com';

-- Undo everything since BEGIN
ROLLBACK;

-- Save changes permanently
COMMIT;

-- Savepoint examples
BEGIN;
SAVEPOINT sp1;
INSERT INTO users ...;
ROLLBACK TO SAVEPOINT sp1;  -- undo only the insert
COMMIT;
```

### Inspect Schema Objects

```sql
-- Show columns of a table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'users'
ORDER BY ordinal_position;

-- Show constraints on a table
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass;

-- Show foreign key references
SELECT
    tc.table_schema, tc.table_name, kcu.column_name,
    ccu.table_schema AS foreign_table_schema,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'users';

-- Show triggers on a table
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'users';

-- Show rules on a table
SELECT rulename, definition
FROM pg_rules
WHERE tablename = 'users';

-- List all enums
SELECT typname, enumlabel
FROM pg_type t
JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('difficulty_level', 'question_type');
```

---

## 2. SQL — Common Data Operations

### User Service (user_db)

```sql
-- Show all users
SELECT id, email, full_name, role_id, is_active, approval_status, created_at
FROM user_db.users;

-- Find a user by email
SELECT * FROM user_db.users WHERE email = 'student1@examora.local';

-- Find a user by student code
SELECT u.*, up.student_code
FROM user_db.users u
JOIN user_db.user_profiles up ON u.id = up.user_id
WHERE up.student_code = 'SV0001';

-- Count users by role
SELECT r.name, COUNT(u.id)
FROM user_db.roles r
LEFT JOIN user_db.users u ON u.role_id = r.id
GROUP BY r.name;

-- List all sessions for a user
SELECT * FROM user_db.user_sessions WHERE user_id = '30000000-0000-0000-0000-000000000001';

-- Deactivate a user
UPDATE user_db.users SET is_active = false WHERE id = '...';

-- Reset a user's password (set password_hash directly — normally done via the auth service)
-- UPDATE user_db.users SET password_hash = '$2b$10$...' WHERE email = '...';

-- Check OAuth providers for a user
SELECT * FROM user_db.oauth_providers WHERE user_id = '...';

-- List password reset tokens (active only)
SELECT u.email, prt.token_hash, prt.expires_at
FROM user_db.password_reset_tokens prt
JOIN user_db.users u ON u.id = prt.user_id
WHERE prt.used_at IS NULL
  AND prt.expires_at > NOW();
```

### Course Service (course_db)

```sql
-- List all faculties
SELECT * FROM course_db.faculties;

-- List all courses with faculty name
SELECT c.id, c.code, c.name, c.credits, c.semester_type, f.name AS faculty
FROM course_db.courses c
JOIN course_db.faculties f ON f.id = c.faculty_id;

-- Find a course by code
SELECT * FROM course_db.courses WHERE code = '0101004548';

-- List chapters for a course
SELECT * FROM course_db.chapters WHERE course_id = 1 ORDER BY year_level, chapter_number;

-- List knowledge units for a chapter
SELECT ku.*, c.name AS chapter
FROM course_db.knowledge_units ku
JOIN course_db.chapters c ON c.id = ku.chapter_id
WHERE ku.chapter_id = 1;

-- Count courses per faculty
SELECT f.name, COUNT(c.id)
FROM course_db.faculties f
LEFT JOIN course_db.courses c ON c.faculty_id = f.id
GROUP BY f.name;
```

### Question Service (question_db)

```sql
-- List all questions with course and chapter
SELECT q.id, q.question_type, q.difficulty, q.content, q.is_active, q.is_ai_generated,
       c.name AS course, ch.name AS chapter
FROM question_db.questions q
LEFT JOIN course_db.courses c ON c.id = q.course_id
LEFT JOIN course_db.chapters ch ON ch.id = q.chapter_id
ORDER BY q.created_at DESC;

-- Find questions by course
SELECT * FROM question_db.questions WHERE course_id = 1;

-- Find questions by difficulty
SELECT * FROM question_db.questions WHERE difficulty = 'easy';

-- Find AI-generated questions
SELECT * FROM question_db.questions WHERE is_ai_generated = true;

-- Count questions by type
SELECT question_type, COUNT(*) FROM question_db.questions GROUP BY question_type;

-- Count questions by difficulty
SELECT difficulty, COUNT(*) FROM question_db.questions GROUP BY difficulty;

-- Find untagged questions
SELECT q.*
FROM question_db.questions q
LEFT JOIN question_db.question_tag_relations qtr ON qtr.question_id = q.id
WHERE qtr.tag_id IS NULL;

-- List tags and question count
SELECT t.name, t.category, COUNT(qtr.question_id) AS question_count
FROM question_db.question_tags t
LEFT JOIN question_db.question_tag_relations qtr ON qtr.tag_id = t.id
GROUP BY t.id, t.name, t.category;

-- Search questions by keyword
SELECT * FROM question_db.questions
WHERE content ILIKE '%vòng lặp%';

-- Add a tag to a question
INSERT INTO question_db.question_tag_relations (question_id, tag_id)
VALUES ('50000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- Deactivate a question
UPDATE question_db.questions SET is_active = false WHERE id = '...';

-- Get answers for a question
SELECT * FROM question_db.answers WHERE question_id = '50000000-0000-0000-0000-000000000001';
```

### Exam Service (exam_db)

```sql
-- List all exams
SELECT e.*, c.name AS course, u.full_name AS created_by
FROM exam_db.exams e
JOIN course_db.courses c ON c.id = e.course_id
JOIN user_db.users u ON u.id = e.created_by;

-- List exams by course
SELECT * FROM exam_db.exams WHERE course_id = 1;

-- List questions in an exam
SELECT eq.*, q.content, q.question_type, q.difficulty
FROM exam_db.exam_questions eq
JOIN question_db.questions q ON q.id = eq.question_id
WHERE eq.exam_id = 'A0000000-0000-0000-0000-000000000001'
ORDER BY eq.question_order;

-- List all classes
SELECT cl.*, u.full_name AS teacher, c.name AS course
FROM exam_db.classes cl
JOIN user_db.users u ON u.id = cl.teacher_id
LEFT JOIN course_db.courses c ON c.id = cl.course_id;

-- List students in a class
SELECT u.id, u.email, u.full_name, cm.role, cm.status, cm.joined_at
FROM exam_db.class_members cm
JOIN user_db.users u ON u.id = cm.user_id
WHERE cm.class_id = 'B0000000-0000-0000-0000-000000000001';

-- Count students per class
SELECT cl.name, COUNT(cm.id) AS student_count
FROM exam_db.classes cl
LEFT JOIN exam_db.class_members cm ON cm.class_id = cl.id AND cm.role = 'student'
GROUP BY cl.id, cl.name;

-- List exam assignments
SELECT ea.*, e.title AS exam, cl.name AS class, u.full_name AS assigned_by
FROM exam_db.exam_assignments ea
JOIN exam_db.exams e ON e.id = ea.exam_id
LEFT JOIN exam_db.classes cl ON cl.id = ea.class_id
JOIN user_db.users u ON u.id = ea.assigned_by;

-- Find assignments for a student
SELECT sa.*, ea.title, ea.start_time, ea.end_time, e.title
FROM exam_db.student_assignments sa
JOIN exam_db.exam_assignments ea ON ea.id = sa.assignment_id
JOIN exam_db.exams e ON e.id = ea.exam_id
WHERE sa.student_id = '30000000-0000-0000-0000-000000000001';

-- List attempts for a student
SELECT a.*, e.title AS exam, sa.status AS assignment_status
FROM exam_db.attempts a
JOIN exam_db.exams e ON e.id = a.exam_id
LEFT JOIN exam_db.exam_assignments ea ON ea.id = a.assignment_id
LEFT JOIN exam_db.student_assignments sa ON sa.assignment_id = ea.id AND sa.student_id = a.student_id
WHERE a.student_id = '30000000-0000-0000-0000-000000000001'
ORDER BY a.started_at DESC;

-- Get attempt answers with correct answers
SELECT aa.*, q.content AS question, q.correct_answer,
       q.options -> (q.correct_answer || '")->>'text') AS correct_text
FROM exam_db.attempt_answers aa
JOIN question_db.questions q ON q.id = aa.question_id
WHERE aa.attempt_id = 'D0000000-0000-0000-0000-000000000001';

-- Calculate attempt score
SELECT
    a.attempt_id,
    COUNT(aa.id) AS total_questions,
    SUM(CASE WHEN aa.is_correct THEN 1 ELSE 0 END) AS correct,
    SUM(CASE WHEN aa.is_correct THEN 0 ELSE 1 END) AS wrong,
    ROUND(SUM(CASE WHEN aa.is_correct THEN aa.points_earned ELSE 0 END)::numeric, 2) AS total_score
FROM exam_db.attempts a
LEFT JOIN exam_db.attempt_answers aa ON aa.attempt_id = a.attempt_id
WHERE a.attempt_id = 'D0000000-0000-0000-0000-000000000001'
GROUP BY a.attempt_id;

-- List class posts
SELECT cp.*, u.full_name AS author, cl.name AS class
FROM exam_db.class_posts cp
JOIN user_db.users u ON u.id = cp.author_id
JOIN exam_db.classes cl ON cl.id = cp.class_id
ORDER BY cp.created_at DESC;

-- List pinned posts
SELECT * FROM exam_db.class_posts WHERE is_pinned = true;
```

### AI Service (ai_db)

```sql
-- List AI generation requests
SELECT * FROM ai_db.ai_generation_requests ORDER BY created_at DESC;

-- Find requests by status
SELECT * FROM ai_db.ai_generation_requests WHERE status = 'pending';

-- List tasks for a request
SELECT t.*, r.user_id, r.status AS request_status
FROM ai_db.ai_generation_tasks t
JOIN ai_db.ai_generation_requests r ON r.id = t.request_id
WHERE t.request_id = '60000000-0000-0000-0000-000000000001';

-- List generated questions pending review
SELECT * FROM ai_db.generated_questions WHERE status = 'pending_review';

-- Approve a generated question
UPDATE ai_db.generated_questions SET status = 'approved' WHERE id = '...';

-- Reject a generated question
UPDATE ai_db.generated_questions SET status = 'rejected' WHERE id = '...';

-- List AI generation logs
SELECT * FROM ai_db.ai_generation_logs ORDER BY created_at DESC LIMIT 20;

-- Find documents by status
SELECT * FROM ai_db.documents WHERE status = 'COMPLETED';

-- Find failed AI jobs
SELECT * FROM ai_db.ai_jobs WHERE status = 'FAILED';

-- Retry count for jobs
SELECT * FROM ai_db.ai_jobs WHERE retry_count > 0;
```

### Notification Service (notification_db)

```sql
-- List notifications for a user
SELECT * FROM notification_db.notifications
WHERE user_id = '30000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC;

-- Count unread notifications
SELECT COUNT(*) FROM notification_db.notifications
WHERE user_id = '...'
  AND is_read = false;

-- Mark all as read for a user
UPDATE notification_db.notifications
SET is_read = true, read_at = NOW()
WHERE user_id = '...'
  AND is_read = false;

-- Mark one as read
UPDATE notification_db.notifications
SET is_read = true, read_at = NOW()
WHERE id = '...';

-- List email logs
SELECT el.*, et.template_name
FROM notification_db.email_logs el
LEFT JOIN notification_db.email_templates et ON et.template_key = el.template_key
ORDER BY el.created_at DESC;

-- Find failed emails
SELECT * FROM notification_db.email_logs WHERE status = 'failed';

-- Retry failed email (reset attempts)
UPDATE notification_db.email_logs
SET status = 'pending', attempts = 0
WHERE id = '...';

-- List email templates
SELECT * FROM notification_db.email_templates;

-- Create a custom notification
INSERT INTO notification_db.notifications (user_id, type, title, message, action_url)
VALUES ('...', 'system', 'Test Notification', 'This is a test.', '/dashboard');
```

### Infrastructure (infra_eventing / infra_observability)

```sql
-- List pending outbox events
SELECT * FROM infra_eventing.outbox_events WHERE status = 'PENDING';

-- Find failed outbox events
SELECT * FROM infra_eventing.outbox_events WHERE status = 'FAILED';

-- Manually retry a failed outbox event
UPDATE infra_eventing.outbox_events
SET status = 'PENDING', retry_count = retry_count + 1
WHERE outbox_event_id = '...';

-- List dead letter messages
SELECT * FROM infra_eventing.dead_letter_messages ORDER BY failed_at DESC;

-- List queue jobs
SELECT * FROM infra_eventing.queue_jobs ORDER BY queued_at DESC LIMIT 20;

-- Find failed jobs
SELECT * FROM infra_eventing.queue_jobs WHERE status = 'failed';

-- Retry a failed job
UPDATE infra_eventing.queue_jobs
SET status = 'queued', attempts = 0
WHERE id = '...';

-- List audit logs
SELECT al.*, u.email AS actor_email
FROM infra_observability.audit_logs al
LEFT JOIN user_db.users u ON u.id = al.actor_id
ORDER BY al.created_at DESC LIMIT 50;

-- Find logs by action
SELECT * FROM infra_observability.audit_logs
WHERE action = 'create' AND entity_type = 'question';

-- List system events
SELECT * FROM infra_observability.system_events ORDER BY created_at DESC LIMIT 30;

-- List test runs
SELECT * FROM infra_observability.test_runs ORDER BY started_at DESC;
```

### Schema and DDL Operations

```sql
-- Create a new schema
CREATE SCHEMA IF NOT EXISTS new_service;

-- Drop a schema (and all objects)
DROP SCHEMA new_service CASCADE;

-- Create a new table
CREATE TABLE user_db.example (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add a column
ALTER TABLE user_db.example ADD COLUMN email VARCHAR(255);

-- Drop a column
ALTER TABLE user_db.example DROP COLUMN email;

-- Add a foreign key
ALTER TABLE user_db.example
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES user_db.users(id)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Create an index
CREATE INDEX idx_example_user ON user_db.example(user_id);

-- Create a composite index
CREATE INDEX idx_example_composite ON user_db.example(user_id, created_at);

-- Drop an index
DROP INDEX IF EXISTS user_db.idx_example_user;

-- Rename a column
ALTER TABLE user_db.example RENAME COLUMN name TO full_name;

-- Rename a table
ALTER TABLE user_db.example RENAME TO example_new;

-- Truncate a table (fast, no WHERE, cannot be rolled back)
TRUNCATE TABLE user_db.example;

-- Truncate with cascade (also truncates tables referencing this table)
TRUNCATE TABLE user_db.example CASCADE;

-- Delete all rows from a table
DELETE FROM user_db.example;

-- Drop and recreate a table (fresh start)
DROP TABLE IF EXISTS user_db.example CASCADE;
CREATE TABLE user_db.example (...);

-- Vacuum a table (reclaim space)
VACUUM user_db.users;

-- Full vacuum (requires superuser, locks table)
VACUUM FULL user_db.users;

-- Analyze a table (update statistics)
ANALYZE user_db.users;

-- Reindex a table
REINDEX TABLE user_db.users;

-- Check table size and row count
SELECT relname, n_live_tup, n_dead_tup, last_vacuum, last_analyze
FROM pg_stat_user_tables
WHERE relname = 'users';

-- Get total row count for a table
SELECT COUNT(*) FROM user_db.users;
```

### JSON / JSONB Operations

```sql
-- Extract value from JSONB options column
SELECT options FROM question_db.questions LIMIT 1;

-- Get a specific key from JSONB
SELECT options -> 'A' FROM question_db.questions WHERE id = '...';

-- Check if JSONB contains a value
SELECT * FROM question_db.questions
WHERE options @> '{"key": "A"}';

-- Update a JSONB column
UPDATE exam_db.class_posts
SET attachments = attachments || '{"name":"new.pdf"}'::jsonb
WHERE id = '...';

-- Count elements in JSONB array
SELECT jsonb_array_length(attachments) FROM exam_db.class_posts;

-- Search in JSONB text
SELECT * FROM exam_db.class_posts
WHERE content ILIKE '%quiz%';
```

### Date and Time

```sql
-- Current timestamp
SELECT NOW();

-- Date only
SELECT CURRENT_DATE;

-- Time only
SELECT CURRENT_TIME;

-- Timezone conversions
SELECT NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh';

-- Extract parts
SELECT
    NOW() AS now,
    EXTRACT(YEAR FROM NOW()) AS year,
    EXTRACT(MONTH FROM NOW()) AS month,
    EXTRACT(DAY FROM NOW()) AS day,
    EXTRACT(HOUR FROM NOW()) AS hour,
    EXTRACT(DOW FROM NOW()) AS day_of_week;

-- Age calculation
SELECT
    full_name,
    AGE(last_login) AS time_since_last_login
FROM user_db.users;

-- Find attempts in the last 7 days
SELECT * FROM exam_db.attempts
WHERE started_at >= NOW() - INTERVAL '7 days';

-- Find expired assignments
SELECT * FROM exam_db.exam_assignments
WHERE end_time < NOW() AND is_active = true;

-- Format timestamp
SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') FROM user_db.users;
```

---

## 3. pg_dump / pg_restore — Backup and Restore

### Backup

```sql
-- Dump a single database to a file
pg_dump -U postgres -d Exam_Bank -f backup.sql

-- Dump with compression
pg_dump -U postgres -d Exam_Bank -Fc -f backup.dump

-- Dump only schema (no data)
pg_dump -U postgres -d Exam_Bank --schema-only -f schema_backup.sql

-- Dump only data (no schema)
pg_dump -U postgres -d Exam_Bank --data-only -f data_backup.sql

-- Dump specific tables
pg_dump -U postgres -d Exam_Bank -t user_db.users -t user_db.roles -f users_backup.sql

-- Dump a specific schema
pg_dump -U postgres -d Exam_Bank -n user_db -f user_db_backup.sql

-- Dump all databases on the server
pg_dumpall -U postgres -f all_databases.sql

-- Run inside Docker container
docker exec exmora-postgres pg_dump -U postgres -d Exam_Bank -f /tmp/backup.sql
docker cp exmora-postgres:/tmp/backup.sql ./backup.sql
```

### Restore

```sql
-- Restore from plain SQL dump
psql -U postgres -d Exam_Bank -f backup.sql

-- Restore from compressed dump
pg_restore -U postgres -d Exam_Bank -Fc backup.dump

-- Restore to a different database
createdb -U postgres Exam_Bank_copy
pg_restore -U postgres -d Exam_Bank_copy backup.dump

-- Restore with schema-only then data-only separately
psql -U postgres -d Exam_Bank -f schema_backup.sql
psql -U postgres -d Exam_Bank -f data_backup.sql

-- Drop all connections before restore
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'Exam_Bank' AND pid <> pg_backend_pid();

-- Then restore
psql -U postgres -d Exam_Bank -f backup.sql
```

---

## 4. docker exec — Running Commands in Containers

```bash
# Connect to the Postgres interactive terminal
docker exec -it exmora-postgres psql -U postgres -d Exam_Bank

# Run a single SQL command without entering psql
docker exec -it exmora-postgres psql -U postgres -d Exam_Bank -c "SELECT COUNT(*) FROM user_db.users;"

# Run a SQL file inside the container
docker exec -i exmora-postgres psql -U postgres -d Exam_Bank < ./database/schema_optimized.sql

# Copy a backup file into the container
docker cp ./backup.sql exmora-postgres:/tmp/backup.sql

# Copy a backup out of the container
docker cp exmora-postgres:/tmp/backup.sql ./backup.sql

# Check Postgres version
docker exec exmora-postgres psql -U postgres -d Exam_Bank -c "SELECT version();"

# Check active connections
docker exec -it exmora-postgres psql -U postgres -d Exam_Bank -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';"

# List all databases inside the container
docker exec -it exmora-postgres psql -U postgres -c "\l"

# Restart Postgres (reload config)
docker exec exmora-postgres pg_ctl reload -D /var/lib/postgresql/data

# Verify Postgres is accepting connections
docker exec exmora-postgres pg_isready -U postgres

# Open a shell inside the container
docker exec -it exmora-postgres sh

# Check disk usage of the Postgres data directory
docker exec exmora-postgres du -sh /var/lib/postgresql/data

# Check RabbitMQ status
docker exec exmora-rabbitmq rabbitmqctl status

# List RabbitMQ queues
docker exec exmora-rabbitmq rabbitmqctl list_queues

# List RabbitMQ exchanges
docker exec exmora-rabbitmq rabbitmqctl list_exchanges

# List RabbitMQ bindings
docker exec exmora-rabbitmq rabbitmqctl list_bindings

# Purge a specific queue
docker exec exmora-rabbitmq rabbitmqctl purge_queue examora.exam.queue

# Check RabbitMQ health
docker exec exmora-rabbitmq rabbitmq-diagnostics -q ping
```

---

## 5. Quick Reference Cheat Sheet

| Task | Command |
| --- | --- |
| Enter psql | `docker exec -it exmora-postgres psql -U postgres -d Exam_Bank` |
| List tables | `\dt` |
| Describe table | `\d tablename` |
| List databases | `\l` |
| List schemas | `\dn` |
| List roles | `\du` |
| Quit psql | `\q` |
| Count rows | `SELECT COUNT(*) FROM table;` |
| Find by email | `SELECT * FROM users WHERE email = '...';` |
| Active sessions | `SELECT * FROM pg_stat_activity;` |
| Kill session | `SELECT pg_terminate_backend(pid);` |
| Backup DB | `pg_dump -U postgres -d Exam_Bank -f backup.sql` |
| Restore DB | `psql -U postgres -d Exam_Bank -f backup.sql` |
| Restart Postgres | `docker restart exmora-postgres` |
| Check health | `docker exec exmora-postgres pg_isready -U postgres` |
| View logs | `docker compose logs postgres-db` |
| Shell into container | `docker exec -it exmora-postgres sh` |
