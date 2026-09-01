-- =====================================================
-- MIGRATION 05: AI Service (ai_db)
-- =====================================================

SET search_path = ai_db, public;

-- AI generation requests
CREATE TABLE IF NOT EXISTS ai_generation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References user_db.users
    course_id INTEGER, -- References course_db.courses
    chapter_id INTEGER, -- References course_db.chapters
    title VARCHAR(255),
    description TEXT,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
    total_tasks INTEGER DEFAULT 0,
    completed_tasks INTEGER DEFAULT 0,
    total_questions_requested INTEGER DEFAULT 0,
    total_questions_generated INTEGER DEFAULT 0,
    difficulty difficulty_level DEFAULT 'medium',
    question_type question_type DEFAULT 'multiple_choice',
    options JSONB, -- Generation options
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI generation tasks
CREATE TABLE IF NOT EXISTS ai_generation_tasks (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_generation_requests(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    topic VARCHAR(255),
    num_questions INTEGER DEFAULT 5,
    difficulty difficulty_level DEFAULT 'medium',
    status VARCHAR(20) DEFAULT 'queued' CHECK (status IN ('queued', 'processing', 'completed', 'failed')),
    retry_count INTEGER DEFAULT 0,
    error_message TEXT,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated questions (pending review)
CREATE TABLE IF NOT EXISTS generated_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_generation_requests(id) ON UPDATE CASCADE ON DELETE SET NULL,
    task_id UUID REFERENCES ai_generation_tasks(id) ON UPDATE CASCADE ON DELETE SET NULL,
    course_id INTEGER,
    chapter_id INTEGER,
    question_type question_type DEFAULT 'multiple_choice',
    difficulty difficulty_level DEFAULT 'medium',
    content TEXT NOT NULL,
    options JSONB,
    correct_answer VARCHAR(10),
    explanation TEXT,
    ai_confidence_score DECIMAL(5,2),
    status VARCHAR(20) DEFAULT 'pending_review' CHECK (status IN ('pending_review', 'approved', 'rejected', 'merged')),
    reviewed_by UUID,
    reviewed_at TIMESTAMP,
    merged_question_id UUID, -- References question_db.questions if approved
    review_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI generation logs
CREATE TABLE IF NOT EXISTS ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_generation_requests(id) ON UPDATE CASCADE ON DELETE SET NULL,
    task_id UUID REFERENCES ai_generation_tasks(id) ON UPDATE CASCADE ON DELETE SET NULL,
    log_level VARCHAR(20) DEFAULT 'info' CHECK (log_level IN ('debug', 'info', 'warning', 'error')),
    message TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Documents (uploaded for AI processing)
CREATE TABLE IF NOT EXISTS documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL, -- References user_db.users
    file_name VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_type VARCHAR(50),
    file_size INTEGER,
    mime_type VARCHAR(100),
    status VARCHAR(20) DEFAULT 'uploaded' CHECK (status IN ('uploaded', 'processing', 'completed', 'failed')),
    extracted_text TEXT,
    error_message TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI jobs (async job tracking)
CREATE TABLE IF NOT EXISTS ai_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    payload JSONB NOT NULL,
    status job_status DEFAULT 'queued',
    priority INTEGER DEFAULT 5,
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    result JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_ai_requests_user ON ai_generation_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_requests_status ON ai_generation_requests(status);
CREATE INDEX IF NOT EXISTS idx_ai_requests_created ON ai_generation_requests(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_request ON ai_generation_tasks(request_id);
CREATE INDEX IF NOT EXISTS idx_ai_tasks_status ON ai_generation_tasks(status);
CREATE INDEX IF NOT EXISTS idx_generated_questions_request ON generated_questions(request_id);
CREATE INDEX IF NOT EXISTS idx_generated_questions_status ON generated_questions(status);
CREATE INDEX IF NOT EXISTS idx_generated_questions_pending ON generated_questions(status) WHERE status = 'pending_review';
CREATE INDEX IF NOT EXISTS idx_ai_logs_request ON ai_generation_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_task ON ai_generation_logs(task_id);
CREATE INDEX IF NOT EXISTS idx_ai_logs_level ON ai_generation_logs(log_level);
CREATE INDEX IF NOT EXISTS idx_documents_user ON documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_status ON documents(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_type ON ai_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_status ON ai_jobs(status);
CREATE INDEX IF NOT EXISTS idx_ai_jobs_created ON ai_jobs(created_at DESC);

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE TRIGGER update_ai_requests_updated_at
    BEFORE UPDATE ON ai_generation_requests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_ai_tasks_updated_at
    BEFORE UPDATE ON ai_generation_tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_documents_updated_at
    BEFORE UPDATE ON documents
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_ai_jobs_updated_at
    BEFORE UPDATE ON ai_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
