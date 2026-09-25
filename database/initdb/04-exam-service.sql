-- =====================================================
-- MIGRATION 04: Exam Service (exam_db)
-- =====================================================

SET search_path = exam_db, public;

-- Classes table
CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID NOT NULL, -- References user_db.users
    course_id INTEGER REFERENCES course_db.courses(id) ON UPDATE CASCADE ON DELETE SET NULL,
    name VARCHAR(255) NOT NULL,
    class_code VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    year_level INTEGER DEFAULT 10,
    semester VARCHAR(20),
    academic_year VARCHAR(20),
    max_students INTEGER DEFAULT 50,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class members
CREATE TABLE IF NOT EXISTS class_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    user_id UUID NOT NULL, -- References user_db.users
    role VARCHAR(20) NOT NULL DEFAULT 'student' CHECK (role IN ('teacher', 'student')),
    status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'invited', 'pending', 'rejected')),
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (class_id, user_id)
);

-- Exams table
CREATE TABLE IF NOT EXISTS exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id INTEGER REFERENCES course_db.courses(id) ON UPDATE CASCADE ON DELETE SET NULL,
    created_by UUID NOT NULL, -- References user_db.users
    title VARCHAR(255) NOT NULL,
    description TEXT,
    exam_type VARCHAR(50) DEFAULT 'practice', -- practice, midterm, final, quiz
    difficulty difficulty_level DEFAULT 'medium',
    duration INTEGER DEFAULT 60,
    total_questions INTEGER DEFAULT 0,
    total_points DECIMAL(10,2) DEFAULT 100,
    passing_score DECIMAL(10,2) DEFAULT 50,
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_answers BOOLEAN DEFAULT false,
    show_results BOOLEAN DEFAULT true,
    allow_review BOOLEAN DEFAULT true,
    max_attempts INTEGER DEFAULT 1,
    year_level VARCHAR(50),
    is_public BOOLEAN DEFAULT true,
    scheduled_start TIMESTAMP,
    scheduled_end TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam questions (many-to-many with order)
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES question_db.questions(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    question_order INTEGER NOT NULL,
    points DECIMAL(10,2) DEFAULT 10,
    UNIQUE (exam_id, question_id),
    UNIQUE (exam_id, question_order)
);

-- Exam assignments (assign exam to class)
CREATE TABLE IF NOT EXISTS exam_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    class_id UUID REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE,
    assigned_by UUID NOT NULL, -- References user_db.users
    title VARCHAR(255),
    instructions TEXT,
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    max_attempts INTEGER DEFAULT 1,
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_answers BOOLEAN DEFAULT false,
    show_result BOOLEAN DEFAULT true,
    show_answer BOOLEAN DEFAULT false,
    trace_id VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Student assignments (status per student)
CREATE TABLE IF NOT EXISTS student_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES exam_assignments(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    student_id UUID NOT NULL, -- References user_db.users
    status VARCHAR(20) DEFAULT 'assigned' CHECK (status IN ('assigned', 'in_progress', 'submitted', 'graded', 'reviewed')),
    attempts_used INTEGER DEFAULT 0,
    assigned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    submitted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (assignment_id, student_id)
);

-- Attempts (exam attempts by students)
CREATE TABLE IF NOT EXISTS attempts (
    attempt_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    assignment_id UUID, -- References exam_assignments.id (nullable for practice)
    student_id UUID NOT NULL, -- References user_db.users
    attempt_number INTEGER DEFAULT 1,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'expired')),
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    submitted_at TIMESTAMP,
    graded_at TIMESTAMP,
    score DECIMAL(10,2),
    ended_at TIMESTAMP,
    time_taken INTEGER,
    percentage DECIMAL(5,2),
    correct_answers INTEGER DEFAULT 0,
    wrong_answers INTEGER DEFAULT 0,
    trace_id VARCHAR(100),
    time_spent_seconds INTEGER,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Attempt answers
CREATE TABLE IF NOT EXISTS attempt_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID REFERENCES attempts(attempt_id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    question_id UUID REFERENCES question_db.questions(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    question_order INTEGER NOT NULL,
    answer TEXT, -- User's answer
    is_correct BOOLEAN,
    points_earned DECIMAL(10,2) DEFAULT 0,
    time_spent_seconds INTEGER,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (attempt_id, question_id)
);

-- Class posts (announcements, materials, assignments)
CREATE TABLE IF NOT EXISTS class_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON UPDATE CASCADE ON DELETE CASCADE NOT NULL,
    author_id UUID NOT NULL, -- References user_db.users
    post_type VARCHAR(20) NOT NULL CHECK (post_type IN ('announcement', 'material', 'assignment')),
    title VARCHAR(255) NOT NULL,
    content TEXT,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_pinned BOOLEAN DEFAULT false,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_classes_teacher ON classes(teacher_id);
CREATE INDEX IF NOT EXISTS idx_classes_code ON classes(class_code);
CREATE INDEX IF NOT EXISTS idx_class_members_class ON class_members(class_id);
CREATE INDEX IF NOT EXISTS idx_class_members_user ON class_members(user_id);
CREATE INDEX IF NOT EXISTS idx_exams_course ON exams(course_id);
CREATE INDEX IF NOT EXISTS idx_exams_creator ON exams(created_by);
CREATE INDEX IF NOT EXISTS idx_exams_public ON exams(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_exam_questions_exam ON exam_questions(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_exam ON exam_assignments(exam_id);
CREATE INDEX IF NOT EXISTS idx_exam_assignments_class ON exam_assignments(class_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_assignment ON student_assignments(assignment_id);
CREATE INDEX IF NOT EXISTS idx_student_assignments_student ON student_assignments(student_id);
CREATE INDEX IF NOT EXISTS idx_attempts_exam ON attempts(exam_id);
CREATE INDEX IF NOT EXISTS idx_attempts_student ON attempts(student_id);
CREATE INDEX IF NOT EXISTS idx_attempt_answers_attempt ON attempt_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_class_posts_class ON class_posts(class_id);

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGERS
-- Note: The update_updated_at_column() function is defined in public schema (migration 00)
-- =====================================================
CREATE OR REPLACE TRIGGER update_classes_updated_at
    BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_exams_updated_at
    BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_class_members_updated_at
    BEFORE UPDATE ON class_members
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_exam_assignments_updated_at
    BEFORE UPDATE ON exam_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_student_assignments_updated_at
    BEFORE UPDATE ON student_assignments
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_attempts_updated_at
    BEFORE UPDATE ON attempts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_attempt_answers_updated_at
    BEFORE UPDATE ON attempt_answers
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_class_posts_updated_at
    BEFORE UPDATE ON class_posts
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
