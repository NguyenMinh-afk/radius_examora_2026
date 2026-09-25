-- =====================================================
-- MIGRATION 03: Question Service (question_db)
-- =====================================================

SET search_path = question_db, public;

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
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
    source_generated_question_id UUID,
    subject_id INTEGER,

    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answers table (for detailed answer options)
CREATE TABLE IF NOT EXISTS answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT false,
    order_index INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question tags (for more complex tagging)
CREATE TABLE IF NOT EXISTS question_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question-tag relations (many-to-many)
CREATE TABLE IF NOT EXISTS question_tag_relations (
    question_id UUID REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    tag_id INTEGER REFERENCES question_tags(id) ON UPDATE CASCADE ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

-- Question versions (for tracking changes and version control)
CREATE TABLE IF NOT EXISTS question_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    options JSONB NOT NULL,
    correct_answer TEXT NOT NULL,
    explanation TEXT,
    changed_by UUID,
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT question_versions_qid_version_unique UNIQUE (question_id, version_number)
);

-- Question statistics
CREATE TABLE IF NOT EXISTS question_statistics (
    id SERIAL PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE UNIQUE,
    times_shown INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    total_score DECIMAL(10,2) DEFAULT 0,
    difficulty_index DECIMAL(5,4),
    discrimination_index DECIMAL(5,4),
    last_calculated_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active);
CREATE INDEX IF NOT EXISTS idx_answers_question ON answers(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tags_name ON question_tags(name);
CREATE INDEX IF NOT EXISTS idx_question_tag_relations_question ON question_tag_relations(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tag_relations_tag ON question_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_question_versions_question_id ON question_versions(question_id);
CREATE INDEX IF NOT EXISTS idx_question_versions_version_number ON question_versions(question_id, version_number DESC);

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGERS
-- Note: The update_updated_at_column() function is defined in public schema (migration 00)
-- =====================================================
CREATE OR REPLACE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_answers_updated_at
    BEFORE UPDATE ON answers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_question_tags_updated_at
    BEFORE UPDATE ON question_tags
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_question_statistics_updated_at
    BEFORE UPDATE ON question_statistics
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
