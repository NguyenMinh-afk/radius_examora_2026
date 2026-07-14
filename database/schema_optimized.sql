-- =====================================================
-- OPTIMIZED SCHEMA (MICROSERVICE-ORIENTED)
-- Level 1: Single PostgreSQL with per-service schemas
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
CREATE TYPE public.difficulty_level AS ENUM ('easy', 'medium', 'hard', 'very_hard');
CREATE TYPE public.question_type AS ENUM (
    'multiple_choice',
    'true_false',
    'matching',
    'fill_blank'
);

-- =====================================================
-- 1. USER SERVICE (user_db)
-- =====================================================

SET search_path = user_db, public;

CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role_id INTEGER REFERENCES roles(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    approval_status VARCHAR(20) DEFAULT 'pending'
        CHECK (approval_status IN ('pending', 'approved', 'rejected')),
    approved_by UUID,
    approved_at TIMESTAMP,
    approval_note TEXT,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Optional lightweight profile table (teacher/student info collapsed)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE UNIQUE,
    date_of_birth DATE,
    gender VARCHAR(10),
    school_name VARCHAR(255),
    class_code VARCHAR(50),
    student_code VARCHAR(50),
    teacher_code VARCHAR(50),
    teacher_department VARCHAR(150),
    teacher_specialization VARCHAR(150),
    bio TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Device + session tracking (Web/Mobile)
CREATE TABLE user_devices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    device_id VARCHAR(255) NOT NULL,
    platform VARCHAR(50) NOT NULL,
    device_name VARCHAR(255),
    push_token TEXT,
    last_seen TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, device_id)
);

CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    device_id UUID REFERENCES user_devices(id) ON UPDATE CASCADE ON DELETE SET NULL,
    session_token TEXT NOT NULL UNIQUE,
    refresh_token TEXT,
    device_type VARCHAR(50),
    device_name VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address INET,
    user_agent TEXT,
    country VARCHAR(100),
    city VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    revoked_at TIMESTAMP
);

-- OAuth providers (Google/Microsoft/etc.)
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (provider, provider_user_id)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_student_code ON user_profiles(student_code);
CREATE INDEX idx_user_profiles_teacher_code ON user_profiles(teacher_code);
CREATE INDEX idx_user_devices_user ON user_devices(user_id);
CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_expires ON user_sessions(expires_at);
CREATE INDEX idx_oauth_providers_user ON oauth_providers(user_id);

CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL
        REFERENCES user_db.users(id)
        ON DELETE CASCADE,
    token_hash VARCHAR(255) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_token ON password_reset_tokens(token_hash);

-- =====================================================
-- 2. COURSE SERVICE (course_db)
-- =====================================================

SET search_path = course_db, public;

CREATE TABLE faculties (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) UNIQUE NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Seed data: faculties
INSERT INTO faculties (id, name, code) VALUES
(1, 'Khoa học Máy tính', 'CS'),
(2, 'Toán học', 'MATH'),
(3, 'Vật lý', 'PHYS'),
(4, 'Hóa học', 'CHEM'),
(5, 'Kinh tế', 'ECON')
ON CONFLICT (id) DO NOTHING;

CREATE TABLE courses (
    id SERIAL PRIMARY KEY,
    faculty_id INTEGER REFERENCES faculties(id) ON UPDATE CASCADE ON DELETE RESTRICT NOT NULL,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    credits INTEGER DEFAULT 3,
    semester_type VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_courses_faculty ON courses(faculty_id);

CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    course_id INTEGER REFERENCES courses(id) ON UPDATE CASCADE ON DELETE CASCADE,
    year_level VARCHAR(20) NOT NULL,
    chapter_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(course_id, year_level, chapter_number)
);

CREATE TABLE knowledge_units (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapters(id) ON UPDATE CASCADE ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. QUESTION SERVICE (question_db)
-- =====================================================

SET search_path = question_db, public;

CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id INTEGER NOT NULL,
    chapter_id INTEGER,
    knowledge_unit_id INTEGER,
    created_by UUID,

    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    difficulty difficulty_level NOT NULL DEFAULT 'medium',

    content TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,

    points DECIMAL(5,2) DEFAULT 1.0,
    time_limit INTEGER,
    keywords TEXT[],

    is_ai_generated BOOLEAN DEFAULT false,
    ai_model VARCHAR(100),

    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE question_tag_relations (
    question_id UUID REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    tag_id INTEGER REFERENCES question_tags(id) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

CREATE TABLE answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_answers_question ON answers(question_id);

CREATE INDEX idx_questions_course ON questions(course_id);
CREATE INDEX idx_questions_chapter ON questions(chapter_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_active ON questions(is_active);

-- =====================================================
-- 4. AI SERVICE (ai_db)
-- =====================================================

SET search_path = ai_db, public;

CREATE TABLE ai_generation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    course_id INTEGER NOT NULL,
    chapter_id INTEGER,
    knowledge_unit_id INTEGER,
    difficulty difficulty_level,
    question_type question_type,
    quantity INTEGER NOT NULL,

    context TEXT,
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    progress INTEGER DEFAULT 0,
    error_message TEXT,

    trace_id VARCHAR(100),

    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_generation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_generation_requests(id) ON UPDATE CASCADE ON DELETE SET NULL,
    subject_id INTEGER NOT NULL,
    topic TEXT,
    input_type VARCHAR(50),
    input_reference TEXT,
    number_of_questions INTEGER NOT NULL,
    difficulty VARCHAR(20),
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'processing', 'completed', 'failed')),
    created_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    error_message TEXT
);

CREATE TABLE generated_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    task_id UUID REFERENCES ai_generation_tasks(id) ON UPDATE CASCADE ON DELETE CASCADE,
    question_content TEXT NOT NULL,
    option_a TEXT,
    option_b TEXT,
    option_c TEXT,
    option_d TEXT,
    correct_answer CHAR(1),
    difficulty VARCHAR(20),
    topic TEXT,
    explanation TEXT,
    status VARCHAR(50) DEFAULT 'pending_review'
        CHECK (status IN ('pending_review', 'approved', 'rejected', 'edited')),
    display_order INTEGER,
    generation_source VARCHAR(20) DEFAULT 'gemini',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_generation_requests(id) ON UPDATE CASCADE ON DELETE CASCADE,
    question_id UUID,
    ai_model VARCHAR(100) NOT NULL,
    prompt TEXT,
    response TEXT,
    tokens_used INTEGER,
    cost DECIMAL(10,4),
    status VARCHAR(50) DEFAULT 'success',
    error_message TEXT,
    trace_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_ai_requests_user ON ai_generation_requests(user_id);
CREATE INDEX idx_ai_requests_status ON ai_generation_requests(status);
CREATE INDEX idx_ai_requests_created ON ai_generation_requests(created_at);
CREATE INDEX idx_ai_requests_course ON ai_generation_requests(course_id);
CREATE INDEX idx_ai_requests_chapter ON ai_generation_requests(chapter_id);
CREATE INDEX idx_ai_tasks_request ON ai_generation_tasks(request_id);
CREATE INDEX idx_ai_tasks_subject ON ai_generation_tasks(subject_id);
CREATE INDEX idx_ai_tasks_status ON ai_generation_tasks(status);
CREATE INDEX idx_generated_questions_task ON generated_questions(task_id);
CREATE INDEX idx_generated_questions_status ON generated_questions(status);

-- =====================================================
-- 4.1 AI ASYNC PIPELINE (OPTIONAL BUT RECOMMENDED)
-- =====================================================

CREATE TABLE documents (
    document_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id INTEGER NOT NULL,
    uploaded_by UUID NOT NULL,
    file_name VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    file_url TEXT,
    mime_type VARCHAR(100),
    file_size BIGINT,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    error_message TEXT,
    trace_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE ai_jobs (
    ai_job_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    document_id UUID REFERENCES documents(document_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    requested_by UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'RUNNING', 'COMPLETED', 'FAILED')),
    retry_count INTEGER DEFAULT 0,
    result_artifact_path TEXT,
    error_message TEXT,
    trace_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

CREATE INDEX idx_documents_course_status ON documents(course_id, status);
CREATE INDEX idx_ai_jobs_status ON ai_jobs(status, created_at);
CREATE UNIQUE INDEX uq_ai_jobs_active_per_document
    ON ai_jobs(document_id) WHERE status IN ('PENDING', 'RUNNING');

-- =====================================================
-- 4.2 INFRA EVENTING (infra_eventing)
-- =====================================================

SET search_path = infra_eventing, public;

CREATE TABLE outbox_events (
    outbox_event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(50) NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    exchange_name VARCHAR(100),
    routing_key VARCHAR(100),
    message_id VARCHAR(255) UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    retry_count INTEGER DEFAULT 0,
    trace_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP
);

CREATE TABLE processed_messages (
    processed_message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outbox_event_id UUID REFERENCES outbox_events(outbox_event_id) ON UPDATE CASCADE ON DELETE SET NULL,
    consumer_name VARCHAR(100) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (consumer_name, message_id)
);

CREATE TABLE dead_letter_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_message_id VARCHAR(255) NOT NULL,
    routing_key VARCHAR(100),
    exchange_name VARCHAR(100),
    payload JSONB NOT NULL,
    error_reason TEXT,
    trace_id VARCHAR(100),
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_outbox_events_status ON outbox_events(status, created_at);
CREATE INDEX idx_dlq_routing_key ON dead_letter_messages(routing_key);
CREATE INDEX idx_dlq_failed_at ON dead_letter_messages(failed_at);

-- =====================================================
-- 4.3 QUEUE JOBS (INTERNAL TASK TRACKING)
-- =====================================================

CREATE TABLE queue_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(100) NOT NULL,
    queue_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'queued',
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    result JSONB,
    error_message TEXT,
    user_id UUID,
    related_id UUID,
    trace_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

COMMENT ON COLUMN queue_jobs.user_id IS 'Logical reference to user_db.users.id (no FK in microservice mode).';

CREATE INDEX idx_queue_jobs_status ON queue_jobs(status);
CREATE INDEX idx_queue_jobs_type ON queue_jobs(job_type);
CREATE INDEX idx_queue_jobs_queued ON queue_jobs(queued_at);
CREATE INDEX idx_queue_jobs_user ON queue_jobs(user_id);

-- =====================================================
-- 4.4 NOTIFICATION SERVICE (notification_db)
-- =====================================================

SET search_path = notification_db, public;

CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID,
    type VARCHAR(50) NOT NULL
        CHECK (type IN ('assignment', 'grade', 'ai_complete', 'system', 'verification', 'password_reset', 'email')),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    action_url TEXT,
    action_data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at);

CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    template_key VARCHAR(100) UNIQUE NOT NULL,
    template_name VARCHAR(255) NOT NULL,
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    variables JSONB,
    language VARCHAR(10) DEFAULT 'vi',
    is_active BOOLEAN DEFAULT true,
    created_by UUID,
    updated_by UUID,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    to_email VARCHAR(255) NOT NULL,
    to_user_id UUID,
    template_key VARCHAR(100) REFERENCES email_templates(template_key),
    subject TEXT NOT NULL,
    body TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    sent_at TIMESTAMP,
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    provider VARCHAR(50),
    message_id TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_logs_user ON email_logs(to_user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at);
CREATE INDEX idx_email_logs_template ON email_logs(template_key);

INSERT INTO notification_db.email_templates (template_key, template_name, subject, html_body, text_body, variables, language, is_active)
VALUES (
  'PASSWORD_RESET',
  'Password Reset',
  'Đặt lại mật khẩu EXMORA',
  '<p>Xin chào {{name}},</p><p>Nhấn vào liên kết sau để đặt lại mật khẩu: <a href="{{reset_url}}">{{reset_url}}</a></p><p>Liên kết có hiệu lực trong {{expires_in}}.</p>',
  'Xin chào {{name}}, dùng liên kết sau để đặt lại mật khẩu: {{reset_url}}. Có hiệu lực trong {{expires_in}}.',
  '{"name": "", "reset_url": "", "expires_in": "15 phút"}',
  'vi',
  true
)
ON CONFLICT (template_key) DO NOTHING;

CREATE OR REPLACE FUNCTION set_notification_read_at()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.is_read = true AND OLD.is_read = false THEN
        NEW.read_at = CURRENT_TIMESTAMP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_notifications_read_at
BEFORE UPDATE ON notifications
FOR EACH ROW
EXECUTE FUNCTION set_notification_read_at();

-- =====================================================
-- 4.5 OBSERVABILITY (infra_observability)
-- =====================================================

SET search_path = infra_observability, public;

CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    metadata JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_name VARCHAR(255) NOT NULL,
    run_type VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    finished_at TIMESTAMP,
    summary TEXT,
    error_message TEXT
);

CREATE TABLE system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    source VARCHAR(100),
    aggregate_id UUID,
    payload JSONB,
    status VARCHAR(50) DEFAULT 'created',
    trace_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_system_events_type ON system_events(event_type);
CREATE INDEX idx_system_events_status ON system_events(status);
CREATE INDEX idx_system_events_trace ON system_events(trace_id);

-- =====================================================
-- 5. EXAM SERVICE (exam_db)
-- =====================================================

SET search_path = exam_db, public;

CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    course_id INTEGER NOT NULL,
    year_level VARCHAR(20),
    exam_type VARCHAR(50),
    duration INTEGER NOT NULL,
    total_points DECIMAL(5,2) NOT NULL,
    passing_score DECIMAL(5,2),
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON UPDATE CASCADE ON DELETE CASCADE,
    question_id UUID NOT NULL,
    question_order INTEGER NOT NULL,
    points DECIMAL(5,2) NOT NULL,
    time_limit INTEGER,
    is_required BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, question_order),
    UNIQUE(exam_id, question_id)
);

CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    class_code VARCHAR(50) UNIQUE NOT NULL,
    course_id INTEGER,
    year_level VARCHAR(20),
    academic_year VARCHAR(20),
    semester VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE class_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    user_id UUID,
    role VARCHAR(50) DEFAULT 'student',
    status VARCHAR(30) DEFAULT 'active'
        CHECK (status IN ('active', 'pending', 'removed')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(class_id, user_id)
);

-- Thông báo/Posts của lớp học (giống Google Classroom)
CREATE TABLE class_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    author_id UUID NOT NULL,
    title VARCHAR(500),
    content TEXT NOT NULL,
    type VARCHAR(50) DEFAULT 'announcement', -- announcement, material, assignment, question
    is_pinned BOOLEAN DEFAULT false,
    attachments JSONB DEFAULT '[]',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_class_posts_class_id ON class_posts(class_id);
CREATE INDEX idx_class_posts_created_at ON class_posts(created_at DESC);
CREATE INDEX idx_class_posts_author ON class_posts(author_id);
CREATE INDEX idx_class_posts_type ON class_posts(type);

CREATE INDEX idx_class_members_class ON class_members(class_id);
CREATE INDEX idx_exam_questions_order ON exam_questions(exam_id, question_order);

CREATE TABLE exam_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON UPDATE CASCADE ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON UPDATE CASCADE ON DELETE SET NULL,
    assigned_by UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    CHECK (end_time > start_time),
    max_attempts INTEGER DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_answers BOOLEAN DEFAULT false,
    show_result BOOLEAN DEFAULT true,
    show_answer BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    trace_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE student_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES exam_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE,
    student_id UUID,
    status VARCHAR(50) DEFAULT 'assigned',
    attempts_used INTEGER DEFAULT 0,
    UNIQUE(assignment_id, student_id)
);

CREATE TABLE attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    student_id UUID NOT NULL,
    assignment_id UUID REFERENCES exam_assignments(id) ON UPDATE CASCADE ON DELETE SET NULL,

    attempt_number INTEGER NOT NULL CHECK (attempt_number > 0),
    started_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    ended_at TIMESTAMP,
    submitted_at TIMESTAMP,
    time_taken INTEGER,

    status VARCHAR(20) NOT NULL DEFAULT 'in_progress'
        CHECK (status IN ('in_progress', 'submitted', 'graded', 'abandoned')),

    score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    graded_at TIMESTAMP,

    trace_id VARCHAR(100),

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    UNIQUE(exam_id, student_id, attempt_number)
);

CREATE TABLE attempt_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES attempts(attempt_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    question_id UUID NOT NULL,
    selected_answer JSONB,
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2) DEFAULT 0,
    time_spent INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(attempt_id, question_id)
);

CREATE INDEX idx_exams_course ON exams(course_id);
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX idx_exam_questions_question ON exam_questions(question_id);
CREATE INDEX idx_exam_assignments_class ON exam_assignments(class_id);
CREATE INDEX idx_exam_assignments_exam ON exam_assignments(exam_id);
CREATE INDEX idx_exam_assignments_assigned_by ON exam_assignments(assigned_by);
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_course ON classes(course_id);
CREATE INDEX idx_class_members_user ON class_members(user_id);
CREATE INDEX idx_student_assignments_student ON student_assignments(student_id);
CREATE INDEX idx_attempts_assignment ON attempts(assignment_id);
CREATE INDEX idx_attempts_exam_student ON attempts(exam_id, student_id);
CREATE INDEX idx_attempts_student ON attempts(student_id);
CREATE INDEX idx_attempt_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX idx_attempt_answers_question ON attempt_answers(question_id);

-- =====================================================
-- 6. SIMPLE UPDATED_AT TRIGGER (SHARED)
-- =====================================================

SET search_path = public;

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON user_db.users
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_db.user_profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON question_db.questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exam_db.exams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON exam_db.classes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exam_assignments_updated_at BEFORE UPDATE ON exam_db.exam_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_attempts_updated_at BEFORE UPDATE ON exam_db.attempts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_documents_updated_at BEFORE UPDATE ON ai_db.documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ai_jobs_updated_at BEFORE UPDATE ON ai_db.ai_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON notification_db.email_templates
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_email_logs_updated_at BEFORE UPDATE ON notification_db.email_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_answers_updated_at BEFORE UPDATE ON question_db.answers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_question_tags_updated_at BEFORE UPDATE ON question_db.question_tags
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exam_questions_updated_at BEFORE UPDATE ON exam_db.exam_questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_members_updated_at BEFORE UPDATE ON exam_db.class_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_class_posts_updated_at BEFORE UPDATE ON exam_db.class_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- END OF OPTIMIZED CORE SCHEMA
-- =====================================================
