# Database Schema Documentation

## Tổng quan

EXAMORA sử dụng **PostgreSQL** với kiến trúc **per-service schemas** — mỗi service có schema riêng để đảm bảo isolation và independence.

## Database

- **PostgreSQL 15** - Primary database
- **Database name:** `examora`
- **Port:** `5432`

## Service Schemas

| Schema | Service | Tables | Mục đích |
|--------|---------|--------|----------|
| `user_db` | User Service | 8 | User management, sessions, OAuth |
| `course_db` | Course Service | 4 | Courses, faculties, chapters |
| `question_db` | Question Service | 5 | Question bank, tags, statistics |
| `exam_db` | Exam Service | 8 | Exams, classes, assignments, attempts |
| `ai_db` | AI Service | 6 | AI generation requests, jobs |
| `notification_db` | Notification Service | 4 | Notifications, email templates |
| `infra_eventing` | Infrastructure | 4 | Outbox, queue jobs, DLQ |
| `infra_observability` | Infrastructure | 4 | Audit logs, system events |

## Schema Details

### user_db (User Management)

**Tables:**
- `roles` — Vai trò hệ thống (admin, teacher, student)
- `users` — Tài khoản người dùng
- `user_profiles` — Thông tin mở rộng (sinh viên/giáo viên)
- `user_sessions` — Quản lý đăng nhập
- `user_devices` — Device tracking
- `oauth_providers` — OAuth2 (Google, Microsoft)
- `password_reset_tokens` — Password reset
- `password_reset_otps` — OTP reset

### course_db (Course Management)

**Tables:**
- `faculties` — Khoa/Viện
- `courses` — Môn học
- `chapters` — Chương trong môn học
- `knowledge_units` — Đơn vị kiến thức

### question_db (Question Bank)

**Tables:**
- `questions` — Ngân hàng câu hỏi (JSONB options)
- `question_tags` — Tags phân loại
- `question_tag_relations` — Question-tag mapping
- `question_versions` — Lịch sử chỉnh sửa
- `question_statistics` — Thống kê sử dụng

### exam_db (Exam Management)

**Tables:**
- `exams` — Đề thi
- `exam_questions` — Câu hỏi trong đề
- `classes` — Lớp học
- `class_members` — Thành viên lớp
- `class_posts` — Bài đăng lớp
- `exam_assignments` — Giao bài cho lớp
- `student_assignments` — Trạng thái bài của sinh viên
- `attempts` — Lần thi của sinh viên
- `attempt_answers` — Câu trả lời

### ai_db (AI Generation)

**Tables:**
- `ai_generation_requests` — Yêu cầu tạo câu hỏi
- `ai_generation_tasks` — Tasks trong request
- `generated_questions` — Câu hỏi AI chờ duyệt
- `ai_generation_logs` — Logs
- `documents` — Tài liệu upload
- `ai_jobs` — Async job tracking

### notification_db (Notifications)

**Tables:**
- `notifications` — Thông báo in-app
- `email_templates` — Email templates
- `email_logs` — Email logs
- `sms_logs` — SMS logs

### infra_eventing (Event Infrastructure)

**Tables:**
- `outbox_events` — Outbox pattern
- `processed_messages` — Consumer deduplication
- `dead_letter_messages` — DLQ
- `queue_jobs` — Internal jobs

### infra_observability (System Observability)

**Tables:**
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

```yaml
postgres-db:
  image: postgres:15
  environment:
    POSTGRES_DB: examora
    POSTGRES_USER: examora
    POSTGRES_PASSWORD: examora123
  ports:
    - "5432:5432"
  volumes:
    - postgres-data:/var/lib/postgresql/data
    - ./database/migrations:/docker-entrypoint-initdb.d/migrations
    - ./database/seeds:/docker-entrypoint-initdb.d/seeds
```

### Init Scripts Order

1. `migrations/00-init-schemas.sql` - Create schemas + enums
2. `migrations/01-user-service.sql` - user_db tables
3. `migrations/02-course-service.sql` - course_db tables
4. `migrations/03-question-service.sql` - question_db tables
5. `migrations/04-exam-service.sql` - exam_db tables
6. `migrations/05-ai-service.sql` - ai_db tables
7. `migrations/06-notification-service.sql` - notification_db tables
8. `migrations/07-infra-eventing.sql` - infra_eventing tables
9. `migrations/08-infra-observability.sql` - infra_observability tables

### Reset Database

```bash
docker compose down -v
docker compose up -d postgres-db
# Wait for init scripts to complete
docker compose logs postgres-db | grep "initialization complete"
```

## Performance

- Indexes trên tất cả foreign keys
- GIN index cho full-text search (`questions.content`)
- Partial indexes cho active/inactive filtering
- JSONB columns cho flexible data storage

## Security

- UUID primary keys cho tất cả user-related tables
- Soft delete pattern (is_active flag)
- Timestamps trên mọi bảng
- Audit logs cho sensitive actions
