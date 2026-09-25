# Database Command Reference

Tham chiếu đầy đủ các lệnh PostgreSQL, gồm 4 phần:
- **psql** — interactive terminal client
- **SQL** — common data operations
- **pg_dump / pg_restore** — backup & restore
- **docker exec** — chạy lệnh trong container

**Thông số mặc định** (đúng theo `infrastructure/docker-compose.yml`):
- User: `postgres`
- Password: `123456`
- Database: `Exam_Bank`
- Container: `examora-postgres`
- Host port: `5432`

> Tất cả ví dụ dưới đây dùng project path `C:\Users\Admin\radius_examora_2026` và container name `examora-*` (lowercase). Khi chạy, thay thế bằng path thực tế trên máy.

---

## 1. psql — Interactive Commands

### Connect to Database

```bash
# Trên host (cần psql client cài sẵn)
psql -U postgres -d Exam_Bank

# Kèm host + port
psql -U postgres -d Exam_Bank -h localhost -p 5432

# Prompt password
psql -U postgres -d Exam_Bank -W

# Qua Docker container (khuyến nghị)
docker exec -it examora-postgres psql -U postgres -d Exam_Bank
```

### General Commands (trong psql)

```sql
-- List databases
\l
\l+

-- List tables trong schema hiện tại
\dt
\dt+

-- List tables trong một schema cụ thể
\dt user_db.*
\dt exam_db.*
\dt course_db.*

-- List tất cả schemas
\dn
\dn+

-- List roles
\du

-- List indexes
\di

-- List views
\dv

-- Describe table
\d users
\d user_db.users
\d+ exam_db.exam_assignments          -- với size, comment

-- List sequences / functions
\ds
\df

-- Current search_path
SHOW search_path;

-- Set search_path cho session
SET search_path TO user_db, public;
```

### Liệt kê nâng cao

```sql
-- Tất cả tables theo schema
SELECT table_schema, table_name
FROM information_schema.tables
WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
ORDER BY table_schema, table_name;

-- Indexes của một table
SELECT indexname, indexdef
FROM pg_indexes WHERE tablename = 'exams';

-- Size table
SELECT pg_size_pretty(pg_total_relation_size('exam_db.attempts'));

-- Size database
SELECT pg_size_pretty(pg_database_size('Exam_Bank'));

-- Queries đang chạy (cần superuser)
SELECT pid, usename, application_name, state, query, query_start
FROM pg_stat_activity
WHERE state != 'idle'
ORDER BY query_start;

-- Kill một query
SELECT pg_cancel_backend(pid);     -- graceful
SELECT pg_terminate_backend(pid);  -- force

-- Active locks
SELECT pid, mode, granted, relation::regclass
FROM pg_locks WHERE NOT granted;

-- Quit
\q
```

### Copy / Import / Export (trong psql)

```sql
-- Export table ra CSV (file nằm trong container)
\copy user_db.users TO '/tmp/users.csv' WITH (FORMAT csv, HEADER);

-- Import CSV vào table
\copy user_db.users FROM '/tmp/users.csv' WITH (FORMAT csv, HEADER);

-- Import có chọn cột
\copy user_db.users(email, full_name) FROM '/tmp/users.csv' WITH (FORMAT csv, HEADER);

-- Export query result
\copy (SELECT id, email, full_name FROM user_db.users) TO '/tmp/export.csv' WITH (FORMAT csv, HEADER);
```

### Transaction Control

```sql
BEGIN;
UPDATE user_db.users SET is_active = false WHERE email = 'test@test.com';
ROLLBACK;     -- undo
COMMIT;       -- save

-- Savepoint
BEGIN;
SAVEPOINT sp1;
INSERT INTO user_db.users ...;
ROLLBACK TO SAVEPOINT sp1;
COMMIT;
```

### Inspect Schema Objects

```sql
-- Columns của table
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'exams'
ORDER BY ordinal_position;

-- Constraints
SELECT conname, conrelid::regclass, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'exam_db.exams'::regclass;

-- Foreign keys
SELECT tc.table_schema, tc.table_name, kcu.column_name,
       ccu.table_schema AS foreign_table_schema,
       ccu.table_name AS foreign_table_name,
       ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
 AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_name = 'exam_assignments';

-- Triggers
SELECT trigger_name, event_manipulation, action_statement
FROM information_schema.triggers
WHERE event_object_table = 'attempts';

-- Enums
SELECT typname, enumlabel
FROM pg_type t JOIN pg_enum e ON t.oid = e.enumtypid
WHERE typname IN ('difficulty_level', 'question_type', 'job_status');
```

---

## 2. SQL — Common Data Operations

### User Service (user_db)

```sql
-- Liệt kê users
SELECT id, email, full_name, role_id, is_active, approval_status, created_at
FROM user_db.users ORDER BY created_at;

-- Tìm theo email
SELECT * FROM user_db.users WHERE email = 'student1@examora.local';

-- Tìm theo student code
SELECT u.*, up.student_code
FROM user_db.users u
JOIN user_db.user_profiles up ON u.id = up.user_id
WHERE up.student_code = 'SV0001';

-- Đếm users theo role
SELECT r.name, COUNT(u.id)
FROM user_db.roles r
LEFT JOIN user_db.users u ON u.role_id = r.id
GROUP BY r.name;

-- Sessions của user
SELECT * FROM user_db.user_sessions WHERE user_id = '30000000-0000-0000-0000-000000000001';

-- Deactivate user
UPDATE user_db.users SET is_active = false WHERE id = '...';

-- Reset password (chạy script backend/User_Service/scripts/resetPassword.mjs thay vì UPDATE trực tiếp)

-- OAuth providers của user
SELECT * FROM user_db.oauth_providers WHERE user_id = '...';

-- Reset tokens còn hiệu lực
SELECT u.email, prt.token_hash, prt.expires_at
FROM user_db.password_reset_tokens prt
JOIN user_db.users u ON u.id = prt.user_id
WHERE prt.used_at IS NULL AND prt.expires_at > NOW();
```

### Course Service (course_db)

```sql
-- Faculties
SELECT * FROM course_db.faculties;

-- Courses kèm faculty
SELECT c.id, c.code, c.name, c.credits, c.semester_type, f.name AS faculty
FROM course_db.courses c
JOIN course_db.faculties f ON f.id = c.faculty_id;

-- Tìm course theo code
SELECT * FROM course_db.courses WHERE code = '0101004548';

-- Chapters theo course
SELECT * FROM course_db.chapters WHERE course_id = 1 ORDER BY year_level, chapter_number;

-- Knowledge units theo chapter
SELECT ku.*, ch.name AS chapter
FROM course_db.knowledge_units ku
JOIN course_db.chapters ch ON ch.id = ku.chapter_id
WHERE ku.chapter_id = 1;

-- Đếm courses / faculty
SELECT f.name, COUNT(c.id)
FROM course_db.faculties f
LEFT JOIN course_db.courses c ON c.faculty_id = f.id
GROUP BY f.name;
```

### Question Service (question_db)

```sql
-- Questions kèm course + chapter
SELECT q.id, q.question_type, q.difficulty, q.content, q.is_active, q.is_ai_generated,
       c.name AS course, ch.name AS chapter
FROM question_db.questions q
LEFT JOIN course_db.courses c ON c.id = q.course_id
LEFT JOIN course_db.chapters ch ON ch.id = q.chapter_id
ORDER BY q.created_at DESC;

-- Tìm theo course / difficulty / AI flag
SELECT * FROM question_db.questions WHERE course_id = 1;
SELECT * FROM question_db.questions WHERE difficulty = 'easy';
SELECT * FROM question_db.questions WHERE is_ai_generated = true;

-- Đếm theo type / difficulty
SELECT question_type, COUNT(*) FROM question_db.questions GROUP BY question_type;
SELECT difficulty, COUNT(*) FROM question_db.questions GROUP BY difficulty;

-- Questions chưa gắn tag
SELECT q.* FROM question_db.questions q
LEFT JOIN question_db.question_tag_relations qtr ON qtr.question_id = q.id
WHERE qtr.tag_id IS NULL;

-- Tags và số questions
SELECT t.name, t.category, COUNT(qtr.question_id) AS question_count
FROM question_db.question_tags t
LEFT JOIN question_db.question_tag_relations qtr ON qtr.tag_id = t.id
GROUP BY t.id, t.name, t.category;

-- Full-text search trong content
SELECT * FROM question_db.questions WHERE content ILIKE '%vòng lặp%';

-- Answers của question
SELECT * FROM question_db.answers WHERE question_id = '50000000-0000-0000-0000-000000000001';

-- Add tag cho question
INSERT INTO question_db.question_tag_relations (question_id, tag_id)
VALUES ('50000000-0000-0000-0000-000000000001', 1)
ON CONFLICT DO NOTHING;

-- Deactivate question
UPDATE question_db.questions SET is_active = false WHERE id = '...';
```

### Exam Service (exam_db)

```sql
-- Danh sách exams
SELECT e.id, e.title, e.duration, e.total_points, e.passing_score,
       c.name AS course, u.full_name AS created_by
FROM exam_db.exams e
LEFT JOIN course_db.courses c ON c.id = e.course_id
JOIN user_db.users u ON u.id = e.created_by;

-- Exams theo course
SELECT * FROM exam_db.exams WHERE course_id = 1;

-- Questions trong exam
SELECT eq.exam_id, eq.question_order, eq.points,
       q.content, q.question_type, q.difficulty
FROM exam_db.exam_questions eq
JOIN question_db.questions q ON q.id = eq.question_id
WHERE eq.exam_id = 'A0000000-0000-0000-0000-000000000001'
ORDER BY eq.question_order;

-- Classes
SELECT cl.*, u.full_name AS teacher, c.name AS course
FROM exam_db.classes cl
JOIN user_db.users u ON u.id = cl.teacher_id
LEFT JOIN course_db.courses c ON c.id = cl.course_id;

-- Students trong class
SELECT u.id, u.email, u.full_name, cm.role, cm.status, cm.joined_at
FROM exam_db.class_members cm
JOIN user_db.users u ON u.id = cm.user_id
WHERE cm.class_id = 'B0000000-0000-0000-0000-000000000001';

-- Đếm students / class
SELECT cl.name, COUNT(cm.id) AS student_count
FROM exam_db.classes cl
LEFT JOIN exam_db.class_members cm ON cm.class_id = cl.id AND cm.role = 'student'
GROUP BY cl.id, cl.name;

-- Exam assignments
SELECT ea.id, ea.title, ea.start_time, ea.end_time, ea.max_attempts,
       e.title AS exam, cl.name AS class, u.full_name AS assigned_by
FROM exam_db.exam_assignments ea
JOIN exam_db.exams e ON e.id = ea.exam_id
LEFT JOIN exam_db.classes cl ON cl.id = ea.class_id
JOIN user_db.users u ON u.id = ea.assigned_by;

-- Student assignments (bài của từng sinh viên)
SELECT sa.*, ea.title AS assignment, e.title AS exam
FROM exam_db.student_assignments sa
JOIN exam_db.exam_assignments ea ON ea.id = sa.assignment_id
JOIN exam_db.exams e ON e.id = ea.exam_id
WHERE sa.student_id = '30000000-0000-0000-0000-000000000001';

-- Attempts của student
SELECT a.attempt_id, a.attempt_number, a.status, a.score, a.percentage,
       a.started_at, a.submitted_at, e.title AS exam
FROM exam_db.attempts a
JOIN exam_db.exams e ON e.id = a.exam_id
WHERE a.student_id = '30000000-0000-0000-0000-000000000001'
ORDER BY a.started_at DESC;

-- Attempt answers kèm question
SELECT aa.id, aa.attempt_id, aa.is_correct, aa.points_earned,
       q.id AS question_id, q.content AS question
FROM exam_db.attempt_answers aa
JOIN question_db.questions q ON q.id = aa.question_id
WHERE aa.attempt_id = 'D0000000-0000-0000-0000-000000000001';

-- Tính điểm attempt
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

-- Class posts
SELECT cp.*, u.full_name AS author, cl.name AS class
FROM exam_db.class_posts cp
JOIN user_db.users u ON u.id = cp.author_id
JOIN exam_db.classes cl ON cl.id = cp.class_id
ORDER BY cp.created_at DESC;

-- Pinned posts
SELECT * FROM exam_db.class_posts WHERE is_pinned = true;
```

### AI Service (ai_db)

```sql
-- Generation requests
SELECT * FROM ai_db.ai_generation_requests ORDER BY created_at DESC;

-- Theo status
SELECT * FROM ai_db.ai_generation_requests WHERE status = 'pending';

-- Tasks của request
SELECT t.*, r.user_id, r.status AS request_status
FROM ai_db.ai_generation_tasks t
JOIN ai_db.ai_generation_requests r ON r.id = t.request_id
WHERE t.request_id = '60000000-0000-0000-0000-000000000001';

-- Generated questions chờ review
SELECT * FROM ai_db.generated_questions WHERE status = 'pending_review';

-- Approve / reject
UPDATE ai_db.generated_questions SET status = 'approved' WHERE id = '...';
UPDATE ai_db.generated_questions SET status = 'rejected' WHERE id = '...';

-- AI logs
SELECT * FROM ai_db.ai_generation_logs ORDER BY created_at DESC LIMIT 20;

-- API usage tracking
SELECT * FROM ai_db.ai_api_usage ORDER BY created_at DESC LIMIT 50;

-- Documents theo status
SELECT * FROM ai_db.documents WHERE status = 'COMPLETED';

-- AI jobs
SELECT * FROM ai_db.ai_jobs WHERE status = 'FAILED';
SELECT * FROM ai_db.ai_jobs WHERE retry_count > 0;
```

### Notification Service (notification_db)

```sql
-- Notifications của user
SELECT * FROM notification_db.notifications
WHERE user_id = '30000000-0000-0000-0000-000000000001'
ORDER BY created_at DESC;

-- Unread count
SELECT COUNT(*) FROM notification_db.notifications
WHERE user_id = '...' AND is_read = false;

-- Mark all as read
UPDATE notification_db.notifications
SET is_read = true, read_at = NOW()
WHERE user_id = '...' AND is_read = false;

-- Email logs kèm template
SELECT el.*, et.template_name
FROM notification_db.email_logs el
LEFT JOIN notification_db.email_templates et ON et.template_key = el.template_key
ORDER BY el.created_at DESC;

-- Retry email fail
UPDATE notification_db.email_logs SET status = 'pending', attempts = 0 WHERE id = '...';

-- Email templates
SELECT * FROM notification_db.email_templates;

-- Insert custom notification
INSERT INTO notification_db.notifications (user_id, type, title, message, action_url)
VALUES ('...', 'system', 'Test Notification', 'This is a test.', '/dashboard');
```

### Infrastructure (infra_eventing / infra_observability)

```sql
-- Pending outbox events
SELECT * FROM infra_eventing.outbox_events WHERE status = 'PENDING';

-- Failed outbox events
SELECT * FROM infra_eventing.outbox_events WHERE status = 'FAILED';

-- Retry failed outbox event
UPDATE infra_eventing.outbox_events
SET status = 'PENDING', retry_count = retry_count + 1
WHERE outbox_event_id = '...';

-- Dead letter messages
SELECT * FROM infra_eventing.dead_letter_messages ORDER BY failed_at DESC;

-- Queue jobs
SELECT * FROM infra_eventing.queue_jobs ORDER BY queued_at DESC LIMIT 20;

-- Retry failed job
UPDATE infra_eventing.queue_jobs SET status = 'queued', attempts = 0 WHERE id = '...';

-- Audit logs kèm actor email
SELECT al.*, u.email AS actor_email
FROM infra_observability.audit_logs al
LEFT JOIN user_db.users u ON u.id = al.actor_id
ORDER BY al.created_at DESC LIMIT 50;

-- Audit logs theo action
SELECT * FROM infra_observability.audit_logs
WHERE action = 'create' AND entity_type = 'question';

-- System events
SELECT * FROM infra_observability.system_events ORDER BY created_at DESC LIMIT 30;

-- API request logs
SELECT * FROM infra_observability.api_request_logs
WHERE status_code >= 400 ORDER BY created_at DESC LIMIT 50;

-- Test runs
SELECT * FROM infra_observability.test_runs ORDER BY started_at DESC;
```

### Schema and DDL Operations

```sql
-- Create schema
CREATE SCHEMA IF NOT EXISTS new_service;

-- Drop schema (cascade mọi object bên trong)
DROP SCHEMA new_service CASCADE;

-- Create table
CREATE TABLE user_db.example (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Add / drop column
ALTER TABLE user_db.example ADD COLUMN email VARCHAR(255);
ALTER TABLE user_db.example DROP COLUMN email;

-- Add foreign key
ALTER TABLE user_db.example
ADD CONSTRAINT fk_user
FOREIGN KEY (user_id) REFERENCES user_db.users(id)
ON UPDATE CASCADE ON DELETE RESTRICT;

-- Indexes
CREATE INDEX idx_example_user ON user_db.example(user_id);
CREATE INDEX idx_example_composite ON user_db.example(user_id, created_at);
DROP INDEX IF EXISTS user_db.idx_example_user;

-- Rename column / table
ALTER TABLE user_db.example RENAME COLUMN name TO full_name;
ALTER TABLE user_db.example RENAME TO example_new;

-- Truncate / delete
TRUNCATE TABLE user_db.example;
TRUNCATE TABLE user_db.example CASCADE;   -- kèm dependent tables
DELETE FROM user_db.example;

-- Drop & recreate
DROP TABLE IF EXISTS user_db.example CASCADE;

-- Maintenance
VACUUM user_db.users;
VACUUM FULL user_db.users;
ANALYZE user_db.users;
REINDEX TABLE user_db.users;

-- Table stats
SELECT relname, n_live_tup, n_live_tup, last_vacuum, last_analyze
FROM pg_stat_user_tables WHERE relname = 'users';
```

### JSON / JSONB Operations

```sql
-- Extract value từ JSONB options
SELECT options -> 'A' FROM question_db.questions WHERE id = '...';

-- Contains
SELECT * FROM question_db.questions WHERE options @> '{"key": "A"}';

-- Update JSONB column (merge)
UPDATE exam_db.class_posts
SET attachments = attachments || '{"name":"new.pdf"}'::jsonb
WHERE id = '...';

-- Đếm phần tử trong JSONB array
SELECT jsonb_array_length(attachments) FROM exam_db.class_posts;

-- Search trong JSONB text
SELECT * FROM exam_db.class_posts WHERE content::text ILIKE '%quiz%';
```

### Date and Time

```sql
SELECT NOW();
SELECT CURRENT_DATE;
SELECT CURRENT_TIME;
SELECT NOW() AT TIME ZONE 'Asia/Ho_Chi_Minh';

SELECT NOW() AS now,
       EXTRACT(YEAR FROM NOW()) AS year,
       EXTRACT(MONTH FROM NOW()) AS month,
       EXTRACT(DAY FROM NOW()) AS day,
       EXTRACT(HOUR FROM NOW()) AS hour,
       EXTRACT(DOW FROM NOW()) AS day_of_week;

-- Age
SELECT full_name, AGE(last_login) AS time_since_last_login FROM user_db.users;

-- Last 7 days
SELECT * FROM exam_db.attempts WHERE started_at >= NOW() - INTERVAL '7 days';

-- Expired assignments
SELECT * FROM exam_db.exam_assignments WHERE end_time < NOW() AND is_active = true;

SELECT TO_CHAR(created_at, 'YYYY-MM-DD HH24:MI:SS') FROM user_db.users;
```

---

## 3. pg_dump / pg_restore — Backup & Restore

### Backup

```bash
# Dump database (plain SQL)
docker exec examora-postgres pg_dump -U postgres -d Exam_Bank -f /tmp/backup.sql
docker cp examora-postgres:/tmp/backup.sql ./backup.sql

# Dump compressed (custom format)
docker exec examora-postgres pg_dump -U postgres -d Exam_Bank -Fc -f /tmp/backup.dump
docker cp examora-postgres:/tmp/backup.dump ./backup.dump

# Chỉ schema / chỉ data
docker exec examora-postgres pg_dump -U postgres -d Exam_Bank --schema-only -f /tmp/schema.sql
docker exec examora-postgres pg_dump -U postgres -d Exam_Bank --data-only -f /tmp/data.sql

# Tables cụ thể
docker exec examora-postgres pg_dump -U postgres -d Exam_Bank \
  -t user_db.users -t user_db.roles -f /tmp/users.sql

# Toàn bộ cluster
docker exec examora-postgres pg_dumpall -U postgres -f /tmp/all.sql
```

### Restore

```bash
# Plain SQL
docker cp ./backup.sql examora-postgres:/tmp/backup.sql
docker exec examora-postgres psql -U postgres -d Exam_Bank -f /tmp/backup.sql

# Custom format
docker cp ./backup.dump examora-postgres:/tmp/backup.dump
docker exec examora-postgres pg_restore -U postgres -d Exam_Bank -Fc /tmp/backup.dump

# Drop mọi connection trước khi restore
docker exec examora-postgres psql -U postgres -d Exam_Bank -c "
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'Exam_Bank' AND pid <> pg_backend_pid();"

docker exec examora-postgres psql -U postgres -d Exam_Bank -f /tmp/backup.sql
```

---

## 4. docker exec — Running Commands in Containers

```bash
# Connect Postgres interactive
docker exec -it examora-postgres psql -U postgres -d Exam_Bank

# Chạy SQL command đơn
docker exec examora-postgres psql -U postgres -d Exam_Bank -c "SELECT COUNT(*) FROM user_db.users;"

# Chạy SQL file (từ host vào container)
docker exec -i examora-postgres psql -U postgres -d Exam_Bank < ./database/initdb/04-exam-service.sql

# Tương đương PowerShell
Get-Content ./database/initdb/04-exam-service.sql | docker exec -i examora-postgres psql -U postgres -d Exam_Bank

# Copy file in/out
docker cp ./backup.sql examora-postgres:/tmp/backup.sql
docker cp examora-postgres:/tmp/backup.sql ./backup.sql

# Postgres version
docker exec examora-postgres psql -U postgres -d Exam_Bank -c "SELECT version();"

# Active connections
docker exec examora-postgres psql -U postgres -d Exam_Bank -c "SELECT COUNT(*) FROM pg_stat_activity WHERE state = 'active';"

# Reload config
docker exec examora-postgres pg_ctl reload -D /var/lib/postgresql/data

# Health check
docker exec examora-postgres pg_isready -U postgres

# Shell trong container
docker exec -it examora-postgres sh

# Disk usage
docker exec examora-postgres du -sh /var/lib/postgresql/data

# RabbitMQ
docker exec examora-rabbitmq rabbitmqctl status
docker exec examora-rabbitmq rabbitmqctl list_queues
docker exec examora-rabbitmq rabbitmqctl list_exchanges
docker exec examora-rabbitmq rabbitmqctl list_bindings
docker exec examora-rabbitmq rabbitmqctl purge_queue examora.exam.queue
docker exec examora-rabbitmq rabbitmq-diagnostics -q ping
```

---

## 5. Quick Reference Cheat Sheet

| Task | Command |
| --- | --- |
| Enter psql | `docker exec -it examora-postgres psql -U postgres -d Exam_Bank` |
| List tables | `\dt` |
| Describe table | `\d tablename` |
| List databases | `\l` |
| List schemas | `\dn` |
| List roles | `\du` |
| Quit | `\q` |
| Count rows | `SELECT COUNT(*) FROM table;` |
| Find by email | `SELECT * FROM users WHERE email = '...';` |
| Active sessions | `SELECT * FROM pg_stat_activity;` |
| Kill session | `SELECT pg_terminate_backend(pid);` |
| Backup DB | `docker exec examora-postgres pg_dump -U postgres -d Exam_Bank -f /tmp/backup.sql` |
| Restore DB | `docker exec -i examora-postgres psql -U postgres -d Exam_Bank < backup.sql` |
| Restart Postgres | `docker restart examora-postgres` |
| Health check | `docker exec examora-postgres pg_isready -U postgres` |
| View logs | `docker compose -f infrastructure/docker-compose.yml logs postgres-db` |
| Shell vào container | `docker exec -it examora-postgres sh` |
