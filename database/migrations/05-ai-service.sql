-- =====================================================
-- MIGRATION 05: AI Service (ai_db)
-- =====================================================

SET search_path = ai_db, public;

-- AI generation requests
CREATE TABLE IF NOT EXISTS ai_generation_requests (
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

-- AI generation tasks
CREATE TABLE IF NOT EXISTS ai_generation_tasks (
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

-- Generated questions (pending review)
CREATE TABLE IF NOT EXISTS generated_questions (
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

-- AI generation logs
CREATE TABLE IF NOT EXISTS ai_generation_logs (
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

-- AI API usage tracking
CREATE TABLE IF NOT EXISTS ai_api_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider VARCHAR(50) NOT NULL,
    model VARCHAR(100) NOT NULL,
    usage_date VARCHAR(10) NOT NULL,
    request_count INTEGER NOT NULL DEFAULT 0,
    token_estimate INTEGER,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_api_usage_provider_model_date UNIQUE (provider, model, usage_date)
);

-- Documents (uploaded for AI processing)
CREATE TABLE IF NOT EXISTS documents (
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

-- AI jobs (async job tracking)
CREATE TABLE IF NOT EXISTS ai_jobs (
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

-- AI Worker: Courses table
CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) UNIQUE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- AI Worker: Subjects table
CREATE TABLE IF NOT EXISTS subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    course_id INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ai_requests_user ON ai_generation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_status ON ai_generation_requests(status);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created ON ai_generation_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_ai_requests_course ON ai_generation_requests(course_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_chapter ON ai_generation_requests(chapter_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_request ON ai_generation_tasks(request_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_subject ON ai_generation_tasks(subject_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_generation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_generated_questions_task ON generated_questions(task_id);
CREATE INDEX IF NOT EXISTS idx_generated_questions_status ON generated_questions(status);
CREATE INDEX IF NOT EXISTS idx_ai_api_usage_date ON ai_api_usage(usage_date);
CREATE INDEX IF NOT EXISTS idx_documents_course_status ON documents(course_id, status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status, created_at);
CREATE UNIQUE INDEX IF NOT EXISTS uq_ai_jobs_active_per_document
    ON ai_jobs(document_id) WHERE status IN ('PENDING', 'RUNNING');

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGERS
-- =====================================================
CREATE OR REPLACE TRIGGER update_ai_requests_updated_at
    BEFORE UPDATE ON ai_generation_requests
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_ai_jobs_updated_at
    BEFORE UPDATE ON ai_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_ai_api_usage_updated_at
    BEFORE UPDATE ON ai_api_usage
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_courses_updated_at
    BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_subjects_updated_at
    BEFORE UPDATE ON subjects
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
