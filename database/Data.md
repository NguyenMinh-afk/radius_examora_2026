# Database Schema Documentation

## Tổng quan

EXAMORA sử dụng **PostgreSQL 15** với kiến trúc **per-service schemas** — mỗi service có schema riêng để đảm bảo isolation và independence. Tất cả nằm trong **một database duy nhất** (`Exam_Bank`), mỗi service chỉ truy cập schema của mình.

## Database

- **PostgreSQL** 15-alpine (container `examora-postgres`)
- **Database name:** `Exam_Bank`
- **User:** `postgres`
- **Password:** `123456` (override bằng biến `POSTGRES_PASSWORD` trong `.env`)
- **Port:** `5432`

## Service Schemas

| Schema | Service | Tables | Mục đích |
|--------|---------|--------|----------|
| `user_db` | User Service | 8 | User management, sessions, OAuth |
| `course_db` | Course Service | 4 | Courses, faculties, chapters |
| `question_db` | Question Service | 6 | Question bank, tags, statistics |
| `exam_db` | Exam Service | 9 | Exams, classes, assignments, attempts |
| `ai_db` | AI Service | 9 | AI generation requests, jobs, documents |
| `notification_db` | Notification Service | 4 | Notifications, email templates |
| `infra_eventing` | Infrastructure | 4 | Outbox, queue jobs, DLQ |
| `infra_observability` | Infrastructure | 4 | Audit logs, system events, test runs |

**Tổng cộng: 48 tables** trên 8 schemas.

## Schema Details

### user_db (User Management) — 8 tables

- `roles` — Vai trò hệ thống (admin, teacher, student)
- `users` — Tài khoản người dùng
- `user_profiles` — Thông tin mở rộng (sinh viên/giáo viên)
- `user_sessions` — Quản lý đăng nhập
- `user_devices` — Device tracking
- `oauth_providers` — OAuth2 (Google, Microsoft)
- `password_reset_tokens` — Password reset token
- `password_reset_otps` — OTP reset

### course_db (Course Management) — 4 tables

- `faculties` — Khoa/Viện
- `courses` — Môn học
- `chapters` — Chương trong môn học
- `knowledge_units` — Đơn vị kiến thức

### question_db (Question Bank) — 6 tables

- `questions` — Ngân hàng câu hỏi (JSONB options)
- `answers` — Đáp án cho từng câu hỏi
- `question_tags` — Tags phân loại
- `question_tag_relations` — Question-tag mapping
- `question_versions` — Lịch sử chỉnh sửa
- `question_statistics` — Thống kê sử dụng

### exam_db (Exam Management) — 9 tables

- `exams` — Đề thi
- `exam_questions` — Câu hỏi trong đề
- `classes` — Lớp học
- `class_members` — Thành viên lớp
- `class_posts` — Bài đăng lớp
- `exam_assignments` — Giao bài cho lớp
- `student_assignments` — Trạng thái bài của sinh viên
- `attempts` — Lần thi của sinh viên
- `attempt_answers` — Câu trả lời trong attempt

### ai_db (AI Generation) — 9 tables

- `ai_generation_requests` — Yêu cầu tạo câu hỏi
- `ai_generation_tasks` — Tasks trong request
- `generated_questions` — Câu hỏi AI chờ duyệt
- `ai_generation_logs` — Logs
- `ai_jobs` — Async job tracking
- `ai_api_usage` — Theo dõi usage API AI
- `documents` — Tài liệu upload
- `courses` — Bản sao courses cho AI (denormalized)
- `subjects` — Môn học cho AI

### notification_db (Notifications) — 4 tables

- `notifications` — Thông báo in-app
- `email_templates` — Email templates
- `email_logs` — Email logs
- `sms_logs` — SMS logs

### infra_eventing (Event Infrastructure) — 4 tables

- `outbox_events` — Outbox pattern
- `processed_messages` — Consumer deduplication
- `dead_letter_messages` — DLQ
- `queue_jobs` — Internal jobs

### infra_observability (System Observability) — 4 tables

- `audit_logs` — Audit trail
- `system_events` — System events
- `test_runs` — CI/CD test runs
- `api_request_logs` — API logs

## Shared Enums

```sql
-- Difficulty levels
'difficulty_level': easy, medium, hard, very_hard

-- Question types
'question_type': multiple_choice, true_false, matching, fill_blank

-- Job statuses
'job_status': queued, processing, completed, failed, cancelled

-- Notification types
'notification_type': assignment, grade, ai_generation, system, reminder
```

## Database Setup

### Docker Compose

Postgres service trong `infrastructure/docker-compose.yml`:

```yaml
postgres-db:
  image: postgres:15-alpine
  container_name: examora-postgres
  environment:
    POSTGRES_USER: postgres
    POSTGRES_PASSWORD: 123456
    POSTGRES_DB: Exam_Bank
  ports:
    - "5432:5432"
  volumes:
    - postgres_data:/var/lib/postgresql/data
    - ../database/initdb:/docker-entrypoint-initdb.d:ro
```

### Init Scripts Order

Tất cả file `.sql` trong `database/initdb/` chạy theo thứ tự alphabet khi volume khởi tạo lần đầu:

1. `00-init-schemas.sql` — Tạo schemas + enums
2. `01-user-service.sql` — user_db tables
3. `02-course-service.sql` — course_db tables
4. `03-question-service.sql` — question_db tables
5. `04-exam-service.sql` — exam_db tables
6. `05-ai-service.sql` — ai_db tables
7. `06-notification-service.sql` — notification_db tables
8. `07-infra-eventing.sql` — infra_eventing tables
9. `08-infra-observability.sql` — infra_observability tables
10. `51-roles-users.sql` — Seed roles + users + profiles
11. `52-courses.sql` — Seed courses/chapters
12. `53-questions.sql` — Seed questions
13. `54-exams-classes.sql` — Seed exams + classes
14. `55-ai-jobs.sql` — Seed AI jobs
15. `56-notifications.sql` — Seed notifications
16. `57-infra-observability.sql` — Seed observability

### Reset Database

```bash
# Cách 1: xóa volume (re-init toàn bộ)
docker compose -f infrastructure/docker-compose.yml down -v
docker compose -f infrastructure/docker-compose.yml up -d postgres-db
docker compose -f infrastructure/docker-compose.yml logs postgres-db | Select-String "initialization complete"

# Cách 2: chỉ re-run init script mà không mất data
Get-Content database/initdb/04-exam-service.sql | docker exec -i examora-postgres psql -U postgres -d Exam_Bank
```

## Performance

- Indexes trên tất cả foreign keys
- GIN index cho full-text search (`questions.content`)
- Partial indexes cho active/inactive filtering
- JSONB columns cho flexible data storage (questions.options, class_posts.attachments)
- Composite indexes cho query patterns phổ biến

## Security

- UUID primary keys cho mọi bảng user-related
- Soft delete pattern (is_active flag)
- Timestamps (`created_at`, `updated_at`) trên mọi bảng
- Audit logs cho sensitive actions
- Mỗi service chỉ SELECT/INSERT/UPDATE schema của mình — DB-per-service boundary enforced ở application layer
