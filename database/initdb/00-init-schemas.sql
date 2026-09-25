-- =====================================================
-- INITDB 00: Init Schemas + Shared Enums + Trigger Function
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Service schemas
CREATE SCHEMA IF NOT EXISTS user_db;
CREATE SCHEMA IF NOT EXISTS course_db;
CREATE SCHEMA IF NOT EXISTS question_db;
CREATE SCHEMA IF NOT EXISTS exam_db;
CREATE SCHEMA IF NOT EXISTS ai_db;
CREATE SCHEMA IF NOT EXISTS notification_db;
CREATE SCHEMA IF NOT EXISTS infra_eventing;
CREATE SCHEMA IF NOT EXISTS infra_observability;

-- Shared enums (public schema)
DROP TYPE IF EXISTS public.difficulty_level CASCADE;
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard', 'very_hard');

DROP TYPE IF EXISTS public.question_type CASCADE;
CREATE TYPE public.question_type AS ENUM (
    'multiple_choice',
    'true_false',
    'matching',
    'fill_blank'
);

DROP TYPE IF EXISTS public.job_status CASCADE;
CREATE TYPE public.job_status AS ENUM (
    'queued',
    'processing',
    'completed',
    'failed',
    'cancelled'
);

DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM (
    'assignment',
    'grade',
    'ai_generation',
    'system',
    'reminder'
);

DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM (
    'admin',
    'teacher',
    'student'
);

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGER FUNCTION (shared across all schemas)
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;
