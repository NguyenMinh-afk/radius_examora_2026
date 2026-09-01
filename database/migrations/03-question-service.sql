-- =====================================================
-- MIGRATION 03: Question Service (question_db)
-- =====================================================

SET search_path = question_db, public;

-- Questions table
CREATE TABLE IF NOT EXISTS questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id INTEGER REFERENCES course_db.courses(id) ON UPDATE CASCADE ON DELETE SET NULL,
    chapter_id INTEGER REFERENCES course_db.chapters(id) ON UPDATE CASCADE ON DELETE SET NULL,
    knowledge_unit_id INTEGER REFERENCES course_db.knowledge_units(id) ON UPDATE CASCADE ON DELETE SET NULL,
    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    content TEXT NOT NULL,
    options JSONB, -- For multiple choice: {"A": "...", "B": "...", "C": "...", "D": "..."}
    correct_answer VARCHAR(10),
    correct_answers JSONB, -- For matching/fill_blank: {"1": "A", "2": "B"}
    explanation TEXT,
    media_url TEXT,
    media_type VARCHAR(50),
    tags TEXT[], -- Array of tag strings
    is_ai_generated BOOLEAN DEFAULT false,
    ai_confidence_score DECIMAL(5,2),
    is_active BOOLEAN DEFAULT true,
    is_approved BOOLEAN DEFAULT false,
    approved_by UUID,
    approved_at TIMESTAMP,
    created_by UUID, -- References user_db.users
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    version INTEGER DEFAULT 1
);

-- Question tags (for more complex tagging)
CREATE TABLE IF NOT EXISTS question_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question-tag relations (many-to-many)
CREATE TABLE IF NOT EXISTS question_tag_relations (
    id SERIAL PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    tag_id INTEGER REFERENCES question_tags(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (question_id, tag_id)
);

-- Question versions (audit trail)
CREATE TABLE IF NOT EXISTS question_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    version INTEGER NOT NULL,
    content TEXT NOT NULL,
    options JSONB,
    correct_answer VARCHAR(10),
    explanation TEXT,
    changed_by UUID, -- References user_db.users
    change_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (question_id, version)
);

-- Question statistics
CREATE TABLE IF NOT EXISTS question_statistics (
    id SERIAL PRIMARY KEY,
    question_id UUID REFERENCES questions(id) ON UPDATE CASCADE ON DELETE CASCADE UNIQUE,
    times_shown INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    total_score DECIMAL(10,2) DEFAULT 0,
    difficulty_index DECIMAL(5,4), -- Calculated based on results
    discrimination_index DECIMAL(5,4),
    last_calculated_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_questions_course ON questions(course_id);
CREATE INDEX IF NOT EXISTS idx_questions_chapter ON questions(chapter_id);
CREATE INDEX IF NOT EXISTS idx_questions_type ON questions(question_type);
CREATE INDEX IF NOT EXISTS idx_questions_difficulty ON questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_questions_active ON questions(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_questions_approved ON questions(is_approved) WHERE is_approved = false;
CREATE INDEX IF NOT EXISTS idx_questions_ai ON questions(is_ai_generated) WHERE is_ai_generated = true;
CREATE INDEX IF NOT EXISTS idx_questions_content_gin ON questions USING gin(to_tsvector('english', content));
CREATE INDEX IF NOT EXISTS idx_questions_created_by ON questions(created_by);
CREATE INDEX IF NOT EXISTS idx_question_tags_name ON question_tags(name);
CREATE INDEX IF NOT EXISTS idx_question_tags_category ON question_tags(category);
CREATE INDEX IF NOT EXISTS idx_question_tag_relations_question ON question_tag_relations(question_id);
CREATE INDEX IF NOT EXISTS idx_question_tag_relations_tag ON question_tag_relations(tag_id);
CREATE INDEX IF NOT EXISTS idx_question_versions_question ON question_versions(question_id);

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE TRIGGER update_questions_updated_at
    BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_question_statistics_updated_at
    BEFORE UPDATE ON question_statistics
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
