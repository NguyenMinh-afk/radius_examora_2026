# ============================================
# EXAMORA - Branch + Commit Workflow
# Run from: C:\Users\Admin\radius_examora_2026
# ============================================

# --- 0. Đảm bảo working tree clean trước khi tạo branch ---
cd C:\Users\Admin\radius_examora_2026
git fetch origin

# --- 1. Tạo branch mới từ developer ---
git checkout developer
git pull origin developer
git checkout -b fix/db-schema-sync-and-docs

# ============================================
# COMMIT 1 — fix(db): sync exams schema with Exam model
# Scope: migrations + seeds để column names khớp Sequelize model
# ============================================
git add database/migrations/00-init-schemas.sql
git add database/migrations/01-user-service.sql
git add database/migrations/02-course-service.sql
git add database/migrations/03-question-service.sql
git add database/migrations/04-exam-service.sql
git add database/migrations/05-ai-service.sql
git add database/migrations/06-notification-service.sql
git add database/migrations/07-infra-eventing.sql
git add database/migrations/08-infra-observability.sql
git add database/seeds/01-roles-users.sql
git add database/seeds/02-courses.sql
git add database/seeds/03-questions.sql
git add database/seeds/04-exams-classes.sql
git add database/seeds/05-ai-jobs.sql
git add database/seeds/06-notifications.sql

git commit -m "fix(db): sync schema with Exam model

Rename columns to match Sequelize Exam model:
- exams.duration_minutes  -> exams.duration
- exams.total_score       -> exams.total_points
- exams.is_active         -> exams.is_public

Add exams.year_level for course year targeting.
Refresh migrations + seeds so fresh deploys match production state."

# ============================================
# COMMIT 2 — chore(db): consolidate init scripts into initdb/
# Scope: gộp scripts + xóa init-scripts bash cũ
# ============================================
git add database/initdb/
git add database/init-scripts/00-init.sh   # staged for delete

git commit -m "chore(db): consolidate init scripts into initdb folder

Mount single initdb/ directory into Postgres /docker-entrypoint-initdb.d
so schema + seed files run in one place with deterministic order (00-init
-> 08-infra-observability, then 51-roles-users -> 57-infra-observability).
Remove obsolete bash init-scripts/ wrapper."

# ============================================
# COMMIT 3 — docs(db): rewrite Data.md and Command.md
# Scope: tài liệu DB khớp thực tế
# ============================================
git add database/Data.md
git add database/Command.md

git commit -m "docs(db): rewrite Data.md and Command.md to match actual state

- Data.md: correct DB name (Exam_Bank), credentials (postgres/123456),
  init scripts path (initdb/), exact 48 tables across 8 schemas
- Command.md: use lowercase examora-* container names, project path
  radius_examora_2026, PowerShell-friendly docker exec one-liners,
  schema-qualified queries"

# ============================================
# COMMIT 4 — docs(docker): update Docker.md to match compose
# ============================================
git add infrastructure/Docker.md

git commit -m "docs(docker): update Docker.md to match current compose

- Container names lowercase examora-* (was EXAMORA-*)
- Frontend port 5173:80 (nginx in container)
- Init mount path ../database/initdb
- Project path radius_examora_2026
- Add Redis 6379, RabbitMQ/Grafana credentials, cleanup section"

# ============================================
# COMMIT 5 (OPTIONAL) — fix(docker): compose + frontend tweaks
# Bỏ comment nếu muốn gộp luôn; nếu không, đã có sẵn trên branch khác
# ============================================
# git add infrastructure/docker-compose.yml
# git add frontend/.dockerignore
# git add frontend/src/components/teacher/exams/ExamBuilderWizard.tsx
# git add frontend/src/pages/Dashboard/Admin/AdminDashboardPage.tsx
# git commit -m "fix(docker): compose ports + frontend UI tweaks"

# ============================================
# 5. Push branch
# ============================================
git push -u origin fix/db-schema-sync-and-docs

# ============================================
# 6. Mở PR (nếu dùng GitHub CLI)
# ============================================
# gh pr create --base developer --head fix/db-schema-sync-and-rules `
#   --title "fix(db): sync exams schema with Exam model" `
#   --body "Sync exams.duration / total_points / is_public / year_level with Sequelize model.
            Rewrite DB + Docker docs to match actual container names, ports, and init paths."
