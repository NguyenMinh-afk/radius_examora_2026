# 💾 Database

Quản lý database cho EXAMORA.

## Cấu trúc

| Thư mục | Mục đích |
|---------|----------|
| [migrations/](./migrations/) | Database migrations (per-service) |
| [seeds/](./seeds/) | Seed data |
| [schemas/](./schemas/) | SQL DDL definitions |
| [init-scripts/](./init-scripts/) | Docker init scripts |

## Databases

- **PostgreSQL 15** - Primary database
- **RabbitMQ** - Message broker

## Service Schemas

| Schema | Mục đích |
|--------|----------|
| `user_db` | User management, sessions, OAuth |
| `course_db` | Courses, faculties, chapters |
| `question_db` | Question bank, answers, tags |
| `exam_db` | Exams, classes, assignments, attempts |
| `ai_db` | AI generation requests, jobs |
| `notification_db` | Notifications, email templates |
| `infra_eventing` | Outbox, queue jobs, dead letter |
| `infra_observability` | Audit logs, system events |

## Quick Start

```bash
# Run migrations (fresh database)
docker compose exec -T postgres psql -U examora -d examora \
  < database/migrations/00-init-schemas.sql

docker compose exec -T postgres psql -U examora -d examora \
  < database/migrations/01-user-service.sql

# Run seeds
docker compose exec -T postgres psql -U examora -d examora \
  < database/seeds/01-roles-users.sql

# Reset database
docker compose down -v
docker compose up -d postgres-db
docker compose exec -T postgres psql -U examora -d examora \
  < database/migrations/00-init-schemas.sql
docker compose exec -T postgres psql -U examora -d examora \
  < database/migrations/01-user-service.sql
# ... other migrations and seeds
```

## Migrations Order

1. `00-init-schemas.sql` - Create schemas + shared enums
2. `01-user-service.sql` - user_db tables
3. `02-course-service.sql` - course_db tables
4. `03-question-service.sql` - question_db tables
5. `04-exam-service.sql` - exam_db tables
6. `05-ai-service.sql` - ai_db tables
7. `06-notification-service.sql` - notification_db tables
8. `07-infra-eventing.sql` - infra_eventing tables
9. `08-infra-observability.sql` - infra_observability tables

## Seeds Order

1. `01-roles-users.sql` - Default roles + sample users
2. `02-courses.sql` - Sample courses
3. `03-questions.sql` - Sample questions
4. `04-exams-classes.sql` - Sample exams + classes
5. `05-ai-jobs.sql` - Sample AI jobs
6. `06-notifications.sql` - Sample notifications
