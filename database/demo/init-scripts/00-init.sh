-- =====================================================
-- INIT SCRIPT: Docker Database Initialization
-- This script runs automatically when Postgres container starts
-- with a fresh data volume
-- =====================================================

-- Wait for Postgres to be ready
SELECT 'PostgreSQL init script starting...' AS status;

-- =====================================================
-- STEP 1: Run migrations in order
-- =====================================================

-- 00: Init schemas + enums
\i /docker-entrypoint-initdb.d/migrations/00-init-schemas.sql

-- 01: User service
\i /docker-entrypoint-initdb.d/migrations/01-user-service.sql

-- 02: Course service
\i /docker-entrypoint-initdb.d/migrations/02-course-service.sql

-- 03: Question service
\i /docker-entrypoint-initdb.d/migrations/03-question-service.sql

-- 04: Exam service
\i /docker-entrypoint-initdb.d/migrations/04-exam-service.sql

-- 05: AI service
\i /docker-entrypoint-initdb.d/migrations/05-ai-service.sql

-- 06: Notification service
\i /docker-entrypoint-initdb.d/migrations/06-notification-service.sql

-- 07: Infra eventing
\i /docker-entrypoint-initdb.d/migrations/07-infra-eventing.sql

-- 08: Infra observability
\i /docker-entrypoint-initdb.d/migrations/08-infra-observability.sql

-- =====================================================
-- STEP 2: Run seeds in order
-- =====================================================

-- 01: Roles and users
\i /docker-entrypoint-initdb.d/seeds/01-roles-users.sql

-- 02: Courses
\i /docker-entrypoint-initdb.d/seeds/02-courses.sql

-- 03: Questions
\i /docker-entrypoint-initdb.d/seeds/03-questions.sql

-- 04: Exams and classes
\i /docker-entrypoint-initdb.d/seeds/04-exams-classes.sql

-- 05: AI jobs
\i /docker-entrypoint-initdb.d/seeds/05-ai-jobs.sql

-- 06: Notifications
\i /docker-entrypoint-initdb.d/seeds/06-notifications.sql

-- =====================================================
-- COMPLETION
-- =====================================================

SELECT 'Database initialization complete!' AS status;

-- Verify tables created
SELECT count(*) AS total_tables FROM pg_tables 
WHERE schemaname IN ('user_db', 'course_db', 'question_db', 'exam_db', 'ai_db', 'notification_db', 'infra_eventing', 'infra_observability');
