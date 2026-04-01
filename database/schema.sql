-- =====================================================
-- DATABASE SCHEMA FOR AI-POWERED EXAM BANK SYSTEM
-- Subject: High School Multiple Choice Exam Management
-- =====================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- 1. USER MANAGEMENT
-- =====================================================

-- Roles table
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default roles
INSERT INTO roles (name, description) VALUES 
    ('admin', 'System Administrator'),
    ('teacher', 'Teacher/Instructor'),
    ('student', 'Student/Learner');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone VARCHAR(20) UNIQUE, -- UNIQUE constraint to prevent duplicate phone numbers
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    role_id INTEGER REFERENCES roles(id) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    email_verified BOOLEAN DEFAULT false,
    phone_verified BOOLEAN DEFAULT false,
    
    -- Account Approval System
    approval_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
    approved_by UUID REFERENCES users(id), -- Admin who approved/rejected
    approved_at TIMESTAMP, -- When account was approved/rejected
    approval_note TEXT, -- Reason for rejection or admin notes
    
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users table indexes
CREATE INDEX idx_users_email_verified ON users(email_verified) WHERE email_verified = false;
CREATE INDEX idx_users_phone_verified ON users(phone_verified) WHERE phone_verified = false;
CREATE INDEX idx_users_role ON users(role_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_approval_status ON users(approval_status) WHERE approval_status = 'pending';

-- =====================================================
-- SUBJECTS (Must be created before teacher_profiles)
-- =====================================================

CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    icon_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert common high school subjects
INSERT INTO subjects (name, code, description) VALUES 
    ('Toán', 'MATH', 'Toán học'),
    ('Văn', 'LIT', 'Ngữ văn'),
    ('Tiếng Anh', 'ENG', 'Tiếng Anh'),
    ('Vật lý', 'PHY', 'Vật lý'),
    ('Hóa học', 'CHEM', 'Hóa học'),
    ('Sinh học', 'BIO', 'Sinh học'),
    ('Lịch sử', 'HIST', 'Lịch sử'),
    ('Địa lý', 'GEO', 'Địa lý'),
    ('GDCD', 'CIV', 'Giáo dục công dân');

-- =====================================================
-- USER PROFILES
-- =====================================================

-- User profiles (extended information)
CREATE TABLE user_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Personal Information
    date_of_birth DATE,
    gender VARCHAR(10), -- 'male', 'female', 'other'
    place_of_birth VARCHAR(255), -- Nơi sinh
    nationality VARCHAR(100) DEFAULT 'Việt Nam',
    ethnicity VARCHAR(100), -- Dân tộc
    religion VARCHAR(100), -- Tôn giáo
    
    -- Identification
    identification_number VARCHAR(20), -- Số CMND/CCCD/Passport
    identification_type VARCHAR(20), -- 'cmnd', 'cccd', 'passport'
    identification_issued_date DATE,
    identification_issued_place VARCHAR(255),
    
    -- Contact Information
    address TEXT, -- Địa chỉ hiện tại
    permanent_address TEXT, -- Địa chỉ thường trú
    city VARCHAR(100),
    district VARCHAR(100),
    ward VARCHAR(100),
    postal_code VARCHAR(20),
    
    -- Education/Work Information
    school_name VARCHAR(255),
    grade_level VARCHAR(50),
    class_name VARCHAR(100), -- Tên lớp cụ thể (10A1, 11B2, etc.)
    student_code VARCHAR(50), -- Mã học sinh/giáo viên
    
    -- Emergency Contact
    emergency_contact_name VARCHAR(255),
    emergency_contact_relationship VARCHAR(100),
    emergency_contact_phone VARCHAR(20),
    
    -- Social Media & Communication
    facebook_url TEXT,
    zalo_id VARCHAR(100),
    telegram_id VARCHAR(100),
    
    -- Additional Info
    bio TEXT,
    health_notes TEXT, -- Ghi chú sức khỏe (optional)
    special_needs TEXT, -- Nhu cầu đặc biệt
    
    -- System fields
    preferences JSONB, -- Store user preferences
    metadata JSONB, -- Additional flexible data
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_profiles_user ON user_profiles(user_id);
CREATE INDEX idx_user_profiles_student_code ON user_profiles(student_code);
CREATE INDEX idx_user_profiles_identification ON user_profiles(identification_number);

-- Teacher-specific profiles
CREATE TABLE teacher_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Professional Information
    teacher_code VARCHAR(50) UNIQUE, -- Mã giáo viên
    employee_id VARCHAR(50), -- Mã nhân viên
    
    -- Education Background
    highest_degree VARCHAR(100), -- 'bachelor', 'master', 'phd'
    major VARCHAR(255), -- Chuyên ngành
    university VARCHAR(255), -- Trường đại học
    graduation_year INTEGER,
    
    -- Teaching Information
    subjects_teaching INTEGER[], -- Array of subject IDs
    main_subject_id INTEGER REFERENCES subjects(id), -- Môn chính
    grade_levels_teaching VARCHAR(50)[], -- ['10', '11', '12']
    teaching_experience_years INTEGER,
    
    -- Certifications & Training
    certifications JSONB, -- [{name, issuer, date, url}]
    training_courses JSONB, -- [{course, institution, completion_date}]
    
    -- Professional Development
    specializations TEXT[], -- Chuyên môn đặc biệt
    awards JSONB, -- Giải thưởng
    publications JSONB, -- Công trình nghiên cứu
    
    -- Work History
    start_date DATE, -- Ngày vào làm
    contract_type VARCHAR(50), -- 'permanent', 'contract', 'part-time'
    employment_status VARCHAR(50) DEFAULT 'active', -- 'active', 'on_leave', 'resigned', 'retired'
    
    -- Additional
    office_location VARCHAR(255),
    office_hours TEXT,
    consultation_hours TEXT,
    personal_website TEXT,
    linkedin_url TEXT,
    
    -- Ratings & Reviews
    average_rating DECIMAL(3,2),
    total_reviews INTEGER DEFAULT 0,
    
    -- Statistics
    total_classes_taught INTEGER DEFAULT 0,
    total_students_taught INTEGER DEFAULT 0,
    total_exams_created INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_teacher_profiles_user ON teacher_profiles(user_id);
CREATE INDEX idx_teacher_profiles_code ON teacher_profiles(teacher_code);
CREATE INDEX idx_teacher_profiles_main_subject ON teacher_profiles(main_subject_id);
CREATE INDEX idx_teacher_profiles_status ON teacher_profiles(employment_status);

-- Student-specific profiles
CREATE TABLE student_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE UNIQUE,
    
    -- Student Information
    student_code VARCHAR(50) UNIQUE, -- Mã học sinh
    admission_year INTEGER, -- Năm vào học
    expected_graduation_year INTEGER,
    
    -- Current Academic Status
    current_grade_level VARCHAR(20), -- '10', '11', '12'
    current_class_id UUID, -- Will be linked to classes table if needed
    academic_year VARCHAR(20), -- '2025-2026'
    semester VARCHAR(20), -- 'HK1', 'HK2'
    enrollment_status VARCHAR(50) DEFAULT 'active', -- 'active', 'suspended', 'graduated', 'transferred', 'dropped'
    
    -- Academic Track
    academic_track VARCHAR(50), -- 'natural_science', 'social_science', 'both'
    major_subjects INTEGER[], -- Array of main subject IDs
    elective_subjects INTEGER[], -- Array of elective subject IDs
    
    -- Academic Performance
    gpa DECIMAL(4,2), -- Grade Point Average
    class_rank INTEGER, -- Xếp hạng trong lớp
    grade_rank INTEGER, -- Xếp hạng trong khối
    conduct_grade VARCHAR(20), -- 'excellent', 'good', 'average', 'weak'
    
    -- Attendance
    total_absences INTEGER DEFAULT 0,
    total_tardies INTEGER DEFAULT 0,
    attendance_rate DECIMAL(5,2), -- Percentage
    
    -- Achievements & Activities
    achievements JSONB, -- [{name, date, description}]
    extracurricular_activities JSONB, -- [{activity, role, start_date, end_date}]
    competitions JSONB, -- [{competition, result, date}]
    scholarships JSONB, -- [{name, amount, year}]
    
    -- Learning Support
    learning_disabilities TEXT[],
    support_programs TEXT[],
    individual_education_plan BOOLEAN DEFAULT false,
    
    -- Career Goals
    career_interests TEXT[],
    university_aspirations TEXT[],
    
    -- Previous Education
    previous_school VARCHAR(255),
    transfer_notes TEXT,
    
    -- Statistics
    total_exams_taken INTEGER DEFAULT 0,
    average_exam_score DECIMAL(5,2),
    total_study_hours INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_student_profiles_user ON student_profiles(user_id);
CREATE INDEX idx_student_profiles_code ON student_profiles(student_code);
CREATE INDEX idx_student_profiles_grade ON student_profiles(current_grade_level);
CREATE INDEX idx_student_profiles_class ON student_profiles(current_class_id);
CREATE INDEX idx_student_profiles_status ON student_profiles(enrollment_status);
CREATE INDEX idx_student_profiles_admission_year ON student_profiles(admission_year);

-- OAuth providers (Google, Microsoft login)
CREATE TABLE oauth_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL, -- 'google', 'microsoft'
    provider_user_id VARCHAR(255) NOT NULL,
    access_token TEXT,
    refresh_token TEXT,
    token_expires_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(provider, provider_user_id)
);

-- Email/Phone verification tokens
CREATE TABLE verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    token VARCHAR(255) UNIQUE NOT NULL,
    token_type VARCHAR(50) NOT NULL, -- 'email_verification', 'phone_verification'
    
    -- Contact info
    email VARCHAR(255),
    phone VARCHAR(20),
    
    -- Token status
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Metadata
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_tokens_user ON verification_tokens(user_id);
CREATE INDEX idx_verification_tokens_token ON verification_tokens(token) WHERE is_used = false;
CREATE INDEX idx_verification_tokens_expires ON verification_tokens(expires_at) WHERE is_used = false;

-- Password reset tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    token VARCHAR(255) UNIQUE NOT NULL,
    
    -- Token status
    is_used BOOLEAN DEFAULT false,
    used_at TIMESTAMP,
    expires_at TIMESTAMP NOT NULL,
    
    -- Security
    ip_address INET,
    user_agent TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_password_reset_tokens_user ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_token ON password_reset_tokens(token) WHERE is_used = false;
CREATE INDEX idx_password_reset_tokens_expires ON password_reset_tokens(expires_at) WHERE is_used = false;

-- =====================================================
-- 2. SUBJECT & CURRICULUM MANAGEMENT
-- =====================================================

-- Subjects (Môn học)
-- Chapters/Units (Chương/Bài)
CREATE TABLE chapters (
    id SERIAL PRIMARY KEY,
    subject_id INTEGER REFERENCES subjects(id) ON DELETE CASCADE,
    grade_level VARCHAR(20) NOT NULL, -- '10', '11', '12'
    chapter_number INTEGER NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    curriculum_standard TEXT, -- CT2018, etc.
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(subject_id, grade_level, chapter_number)
);

-- Knowledge Units (Đơn vị kiến thức)
CREATE TABLE knowledge_units (
    id SERIAL PRIMARY KEY,
    chapter_id INTEGER REFERENCES chapters(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    learning_objectives TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 3. QUESTION BANK MANAGEMENT
-- =====================================================

-- Question difficulty levels
CREATE TYPE difficulty_level AS ENUM ('easy', 'medium', 'hard', 'very_hard');

-- Question types
CREATE TYPE question_type AS ENUM (
    'multiple_choice', -- Trắc nghiệm 4 đáp án
    'true_false',      -- Đúng/Sai
    'matching',        -- Ghép đôi
    'fill_blank'       -- Điền khuyết
);

-- Questions table
CREATE TABLE questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    subject_id INTEGER REFERENCES subjects(id) NOT NULL,
    chapter_id INTEGER REFERENCES chapters(id),
    knowledge_unit_id INTEGER REFERENCES knowledge_units(id),
    created_by UUID REFERENCES users(id),
    question_type question_type NOT NULL DEFAULT 'multiple_choice',
    difficulty difficulty_level NOT NULL DEFAULT 'medium',
    
    -- Question content
    content TEXT NOT NULL,
    content_html TEXT,
    content_latex TEXT, -- For math formulas
    images JSONB, -- Array of image URLs
    audio_url TEXT,
    video_url TEXT,
    
    -- Answer options (for multiple choice)
    options JSONB NOT NULL, -- [{"key": "A", "text": "...", "is_correct": true}, ...]
    correct_answer TEXT NOT NULL, -- "A", "B", "C", "D" or combination
    explanation TEXT, -- Giải thích đáp án
    explanation_html TEXT,
    
    -- Metadata
    points DECIMAL(5,2) DEFAULT 1.0,
    time_limit INTEGER, -- seconds
    keywords TEXT[],
    
    -- AI Generation info
    is_ai_generated BOOLEAN DEFAULT false,
    ai_model VARCHAR(100),
    ai_generation_id UUID,
    
    -- Quality control
    is_verified BOOLEAN DEFAULT false,
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    quality_score DECIMAL(3,2), -- 0.00 to 1.00
    
    -- Usage statistics
    times_used INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    difficulty_index DECIMAL(3,2), -- Based on student performance
    
    is_active BOOLEAN DEFAULT true,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question tags
CREATE TABLE question_tags (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    category VARCHAR(50),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Question-Tag relationship (many-to-many)
CREATE TABLE question_tag_relations (
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    tag_id INTEGER REFERENCES question_tags(id) ON DELETE CASCADE,
    PRIMARY KEY (question_id, tag_id)
);

-- Question versions (for tracking changes)
CREATE TABLE question_versions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    content TEXT NOT NULL,
    options JSONB NOT NULL,
    changed_by UUID REFERENCES users(id),
    change_note TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 4. AI GENERATION SYSTEM
-- =====================================================

-- AI generation requests
CREATE TABLE ai_generation_requests (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    -- Request parameters
    subject_id INTEGER REFERENCES subjects(id) NOT NULL,
    chapter_id INTEGER REFERENCES chapters(id),
    knowledge_unit_id INTEGER REFERENCES knowledge_units(id),
    difficulty difficulty_level,
    question_type question_type,
    quantity INTEGER NOT NULL, -- Number of questions to generate
    
    -- Additional context for AI
    context TEXT, -- Additional instructions
    reference_materials TEXT,
    style_preferences JSONB,
    
    -- Request status
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, failed
    progress INTEGER DEFAULT 0, -- 0-100
    
    -- Results
    questions_generated INTEGER DEFAULT 0,
    questions_accepted INTEGER DEFAULT 0,
    error_message TEXT,
    
    -- Queue info
    queue_job_id VARCHAR(255),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI generation logs
CREATE TABLE ai_generation_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    request_id UUID REFERENCES ai_generation_requests(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id),
    
    -- AI Model info
    ai_model VARCHAR(100) NOT NULL,
    ai_provider VARCHAR(50), -- 'openai', 'gemini', 'custom'
    model_version VARCHAR(50),
    
    -- Generation details
    prompt TEXT,
    response TEXT,
    tokens_used INTEGER,
    generation_time DECIMAL(10,3), -- seconds
    cost DECIMAL(10,4), -- API cost
    
    -- Quality metrics
    confidence_score DECIMAL(3,2),
    quality_assessment JSONB,
    
    status VARCHAR(50) DEFAULT 'success', -- success, rejected, error
    error_message TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 5. EXAM/TEST MANAGEMENT
-- =====================================================

-- Exam templates
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id) NOT NULL,
    
    -- Basic info
    title VARCHAR(255) NOT NULL,
    description TEXT,
    subject_id INTEGER REFERENCES subjects(id) NOT NULL,
    grade_level VARCHAR(20),
    exam_type VARCHAR(50), -- 'practice', 'midterm', 'final', 'mock'
    
    -- Exam configuration
    duration INTEGER NOT NULL, -- minutes
    total_points DECIMAL(5,2) NOT NULL,
    passing_score DECIMAL(5,2),
    
    -- Question selection
    total_questions INTEGER NOT NULL,
    questions_config JSONB, -- Configuration for question selection
    shuffle_questions BOOLEAN DEFAULT false,
    shuffle_options BOOLEAN DEFAULT false,
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    requires_password BOOLEAN DEFAULT false,
    password_hash VARCHAR(255),
    
    -- Scheduling
    start_time TIMESTAMP,
    end_time TIMESTAMP,
    
    -- Monitoring
    allow_review BOOLEAN DEFAULT true,
    show_correct_answers BOOLEAN DEFAULT true,
    show_score_immediately BOOLEAN DEFAULT true,
    enable_proctoring BOOLEAN DEFAULT false, -- AI proctoring
    proctoring_settings JSONB,
    
    -- Statistics
    times_assigned INTEGER DEFAULT 0,
    times_taken INTEGER DEFAULT 0,
    avg_score DECIMAL(5,2),
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam questions (specific questions in an exam)
CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) NOT NULL,
    
    question_order INTEGER NOT NULL,
    points DECIMAL(5,2) NOT NULL,
    
    -- Custom question settings for this exam
    time_limit INTEGER,
    is_required BOOLEAN DEFAULT true,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(exam_id, question_order)
);

-- =====================================================
-- 6. CLASS & COURSE MANAGEMENT
-- =====================================================

-- Classes/Groups
CREATE TABLE classes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    teacher_id UUID REFERENCES users(id) NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    class_code VARCHAR(50) UNIQUE NOT NULL, -- For students to join
    
    subject_id INTEGER REFERENCES subjects(id),
    grade_level VARCHAR(20),
    academic_year VARCHAR(20), -- '2025-2026'
    semester VARCHAR(20), -- 'HK1', 'HK2'
    
    -- Settings
    max_students INTEGER,
    is_active BOOLEAN DEFAULT true,
    allow_self_enrollment BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Class members
CREATE TABLE class_members (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    role VARCHAR(50) DEFAULT 'student', -- 'teacher', 'assistant', 'student'
    joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(class_id, user_id)
);

-- =====================================================
-- 7. EXAM ASSIGNMENTS & SUBMISSIONS
-- =====================================================

-- Exam assignments (Assign exam to class/students)
CREATE TABLE exam_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID REFERENCES exams(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id),
    assigned_by UUID REFERENCES users(id) NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    instructions TEXT,
    
    -- Scheduling
    assigned_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    start_time TIMESTAMP NOT NULL,
    end_time TIMESTAMP NOT NULL,
    late_submission_allowed BOOLEAN DEFAULT false,
    late_penalty DECIMAL(5,2), -- Penalty percentage
    
    -- Settings
    max_attempts INTEGER DEFAULT 1,
    require_webcam BOOLEAN DEFAULT false,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Individual student assignments (many-to-many)
CREATE TABLE student_assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES exam_assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    status VARCHAR(50) DEFAULT 'assigned', -- assigned, started, submitted, graded
    attempts_used INTEGER DEFAULT 0,
    
    UNIQUE(assignment_id, student_id)
);

-- Exam submissions
CREATE TABLE exam_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID REFERENCES exam_assignments(id) ON DELETE CASCADE,
    student_id UUID REFERENCES users(id) NOT NULL,
    exam_id UUID REFERENCES exams(id) NOT NULL,
    
    attempt_number INTEGER NOT NULL,
    
    -- Submission details
    started_at TIMESTAMP NOT NULL,
    submitted_at TIMESTAMP,
    time_taken INTEGER, -- seconds
    
    -- Answers
    answers JSONB NOT NULL, -- {question_id: selected_answer}
    
    -- Scoring
    status VARCHAR(50) DEFAULT 'in_progress', -- in_progress, submitted, graded
    score DECIMAL(5,2),
    percentage DECIMAL(5,2),
    correct_answers INTEGER,
    wrong_answers INTEGER,
    skipped_answers INTEGER,
    
    -- AI Proctoring results
    proctoring_data JSONB,
    violations_detected INTEGER DEFAULT 0,
    flagged_for_review BOOLEAN DEFAULT false,
    
    -- Grading
    graded_by UUID REFERENCES users(id),
    graded_at TIMESTAMP,
    teacher_feedback TEXT,
    
    is_late BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Answer details for each question
CREATE TABLE submission_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID REFERENCES exam_submissions(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) NOT NULL,
    
    selected_answer TEXT, -- Student's answer
    is_correct BOOLEAN,
    points_earned DECIMAL(5,2),
    time_spent INTEGER, -- seconds on this question
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 8. ANALYTICS & STATISTICS
-- =====================================================

-- Student progress tracking
CREATE TABLE student_progress (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    subject_id INTEGER REFERENCES subjects(id) NOT NULL,
    chapter_id INTEGER REFERENCES chapters(id),
    
    -- Progress metrics
    total_questions_attempted INTEGER DEFAULT 0,
    correct_answers INTEGER DEFAULT 0,
    accuracy_rate DECIMAL(5,2),
    avg_time_per_question DECIMAL(10,2), -- seconds
    
    -- Strengths & Weaknesses
    strong_topics TEXT[],
    weak_topics TEXT[],
    
    -- Recommendations
    recommended_topics TEXT[],
    recommended_difficulty difficulty_level,
    
    last_activity TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, subject_id, chapter_id)
);

-- Question statistics
CREATE TABLE question_statistics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE UNIQUE,
    
    times_appeared INTEGER DEFAULT 0,
    times_answered INTEGER DEFAULT 0,
    times_correct INTEGER DEFAULT 0,
    
    avg_time_spent DECIMAL(10,2), -- seconds
    difficulty_index DECIMAL(3,2), -- 0.00 to 1.00 (based on correct rate)
    discrimination_index DECIMAL(3,2), -- How well it differentiates students
    
    -- Answer distribution
    option_selection_count JSONB, -- {"A": 10, "B": 5, "C": 2, "D": 3}
    
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System analytics
CREATE TABLE system_analytics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    metric_date DATE NOT NULL,
    
    -- User metrics
    total_users INTEGER DEFAULT 0,
    active_users INTEGER DEFAULT 0,
    new_users INTEGER DEFAULT 0,
    
    -- Question metrics
    total_questions INTEGER DEFAULT 0,
    ai_generated_questions INTEGER DEFAULT 0,
    verified_questions INTEGER DEFAULT 0,
    
    -- Exam metrics
    total_exams INTEGER DEFAULT 0,
    active_assignments INTEGER DEFAULT 0,
    total_submissions INTEGER DEFAULT 0,
    
    -- AI metrics
    ai_requests INTEGER DEFAULT 0,
    ai_questions_generated INTEGER DEFAULT 0,
    ai_cost DECIMAL(10,4),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(metric_date)
);

-- =====================================================
-- 9. RABBITMQ QUEUE JOBS
-- =====================================================

-- Queue jobs tracking
CREATE TABLE queue_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(100) NOT NULL, -- 'ai_generation', 'exam_grading', 'analytics'
    queue_name VARCHAR(100) NOT NULL,
    
    -- Job data
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    
    -- Status tracking
    status VARCHAR(50) DEFAULT 'queued', -- queued, processing, completed, failed, retrying
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Timing
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    
    -- Results
    result JSONB,
    error_message TEXT,
    
    -- Related entities
    user_id UUID REFERENCES users(id),
    related_id UUID, -- ID of related entity (exam, request, etc.)
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 10. NOTIFICATIONS & COMMUNICATIONS
-- =====================================================

-- Notifications
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    type VARCHAR(50) NOT NULL, -- 'assignment', 'grade', 'ai_complete', 'system', 'verification', 'password_reset'
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    
    -- Action data
    action_url TEXT,
    action_data JSONB,
    
    -- Status
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;
CREATE INDEX idx_notifications_type ON notifications(type);

-- Email templates
CREATE TABLE email_templates (
    id SERIAL PRIMARY KEY,
    
    template_key VARCHAR(100) UNIQUE NOT NULL, -- 'welcome', 'email_verification', 'password_reset', 'exam_assigned', etc.
    template_name VARCHAR(255) NOT NULL,
    
    -- Template content
    subject TEXT NOT NULL,
    html_body TEXT NOT NULL,
    text_body TEXT,
    
    -- Variables (for documentation)
    variables JSONB, -- List of available variables: {name, description, example}
    
    -- Localization
    language VARCHAR(10) DEFAULT 'vi',
    
    -- Status
    is_active BOOLEAN DEFAULT true,
    
    -- Metadata
    created_by UUID REFERENCES users(id),
    updated_by UUID REFERENCES users(id),
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Email logs
CREATE TABLE email_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    -- Recipient
    to_email VARCHAR(255) NOT NULL,
    to_user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Email details
    template_key VARCHAR(100),
    subject TEXT NOT NULL,
    body TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'sent', 'failed', 'bounced'
    sent_at TIMESTAMP,
    
    -- Error handling
    error_message TEXT,
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    
    -- Provider info
    provider VARCHAR(50), -- 'smtp', 'sendgrid', 'ses', etc.
    message_id TEXT,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_email_logs_user ON email_logs(to_user_id);
CREATE INDEX idx_email_logs_status ON email_logs(status);
CREATE INDEX idx_email_logs_created ON email_logs(created_at);

-- =====================================================
-- 11. SYSTEM SETTINGS & CONFIGURATIONS
-- =====================================================

-- System settings
CREATE TABLE system_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(100) UNIQUE NOT NULL,
    value TEXT NOT NULL,
    data_type VARCHAR(50) DEFAULT 'string', -- string, number, boolean, json
    category VARCHAR(50),
    description TEXT,
    
    updated_by UUID REFERENCES users(id),
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- AI Model configurations
CREATE TABLE ai_models (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    provider VARCHAR(50) NOT NULL, -- 'openai', 'gemini', 'custom'
    model_id VARCHAR(100) NOT NULL,
    version VARCHAR(50),
    
    -- Capabilities
    supports_question_types TEXT[], -- question types it can generate
    supports_subjects TEXT[], -- subject codes
    
    -- Configuration
    api_endpoint TEXT,
    config JSONB, -- Model-specific configuration
    
    -- Limits & Costs
    rate_limit INTEGER, -- requests per minute
    cost_per_token DECIMAL(10,6),
    
    is_active BOOLEAN DEFAULT true,
    is_default BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES FOR PERFORMANCE
-- =====================================================

-- Users indexes (additional ones, basic ones created earlier)
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(is_active);

-- Questions indexes
CREATE INDEX idx_questions_subject ON questions(subject_id);
CREATE INDEX idx_questions_chapter ON questions(chapter_id);
CREATE INDEX idx_questions_difficulty ON questions(difficulty);
CREATE INDEX idx_questions_created_by ON questions(created_by);
CREATE INDEX idx_questions_ai_generated ON questions(is_ai_generated);
CREATE INDEX idx_questions_active ON questions(is_active);
CREATE INDEX idx_questions_public ON questions(is_public);

-- Exams indexes
CREATE INDEX idx_exams_subject ON exams(subject_id);
CREATE INDEX idx_exams_created_by ON exams(created_by);
CREATE INDEX idx_exams_active ON exams(is_active);

-- Assignments indexes
CREATE INDEX idx_exam_assignments_class ON exam_assignments(class_id);
CREATE INDEX idx_exam_assignments_exam ON exam_assignments(exam_id);
CREATE INDEX idx_exam_assignments_dates ON exam_assignments(start_time, end_time);

-- Submissions indexes
CREATE INDEX idx_submissions_student ON exam_submissions(student_id);
CREATE INDEX idx_submissions_assignment ON exam_submissions(assignment_id);
CREATE INDEX idx_submissions_status ON exam_submissions(status);
CREATE INDEX idx_submissions_created ON exam_submissions(created_at);

-- Class indexes
CREATE INDEX idx_classes_teacher ON classes(teacher_id);
CREATE INDEX idx_classes_code ON classes(class_code);
CREATE INDEX idx_class_members_class ON class_members(class_id);
CREATE INDEX idx_class_members_user ON class_members(user_id);

-- AI generation indexes
CREATE INDEX idx_ai_requests_user ON ai_generation_requests(user_id);
CREATE INDEX idx_ai_requests_status ON ai_generation_requests(status);
CREATE INDEX idx_ai_requests_created ON ai_generation_requests(created_at);

-- Queue jobs indexes
CREATE INDEX idx_queue_jobs_status ON queue_jobs(status);
CREATE INDEX idx_queue_jobs_type ON queue_jobs(job_type);
CREATE INDEX idx_queue_jobs_queued ON queue_jobs(queued_at);
-- =====================================================
-- TRIGGERS FOR AUTO-UPDATE
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply trigger to tables with updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_questions_updated_at BEFORE UPDATE ON questions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exams_updated_at BEFORE UPDATE ON exams
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_classes_updated_at BEFORE UPDATE ON classes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_learning_paths_updated_at BEFORE UPDATE ON learning_paths
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- CREATE TRIGGER update_leaderboards_updated_at BEFORE UPDATE ON leaderboards
--     FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_email_templates_updated_at BEFORE UPDATE ON email_templates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teacher_profiles_updated_at BEFORE UPDATE ON teacher_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_profiles_updated_at BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- VIEWS FOR COMMON QUERIES
-- =====================================================

-- View: Teacher's question bank summary
CREATE VIEW teacher_question_summary AS
SELECT 
    u.id as teacher_id,
    u.full_name as teacher_name,
    s.name as subject_name,
    COUNT(q.id) as total_questions,
    SUM(CASE WHEN q.is_ai_generated THEN 1 ELSE 0 END) as ai_generated_count,
    SUM(CASE WHEN q.is_verified THEN 1 ELSE 0 END) as verified_count,
    AVG(q.quality_score) as avg_quality_score
FROM users u
LEFT JOIN questions q ON u.id = q.created_by
LEFT JOIN subjects s ON q.subject_id = s.id
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'teacher')
GROUP BY u.id, u.full_name, s.name;

-- View: Student performance summary
CREATE VIEW student_performance_summary AS
SELECT 
    u.id as student_id,
    u.full_name as student_name,
    COUNT(DISTINCT es.id) as total_submissions,
    AVG(es.score) as avg_score,
    AVG(es.percentage) as avg_percentage,
    SUM(es.correct_answers) as total_correct,
    SUM(es.wrong_answers) as total_wrong
FROM users u
LEFT JOIN exam_submissions es ON u.id = es.student_id
WHERE u.role_id = (SELECT id FROM roles WHERE name = 'student')
  AND es.status = 'graded'
GROUP BY u.id, u.full_name;

-- View: Active exam assignments
CREATE VIEW active_assignments AS
SELECT 
    ea.id,
    ea.title,
    e.title as exam_title,
    c.name as class_name,
    u.full_name as teacher_name,
    ea.start_time,
    ea.end_time,
    COUNT(DISTINCT sa.student_id) as total_students,
    COUNT(DISTINCT es.id) as submissions_count
FROM exam_assignments ea
JOIN exams e ON ea.exam_id = e.id
LEFT JOIN classes c ON ea.class_id = c.id
JOIN users u ON ea.assigned_by = u.id
LEFT JOIN student_assignments sa ON ea.id = sa.assignment_id
LEFT JOIN exam_submissions es ON ea.id = es.assignment_id
WHERE ea.is_active = true
  AND ea.end_time > CURRENT_TIMESTAMP
GROUP BY ea.id, ea.title, e.title, c.name, u.full_name, ea.start_time, ea.end_time;

-- =====================================================
-- 12. FILE MANAGEMENT
-- =====================================================

-- File attachments (for questions, exams, materials)
CREATE TABLE file_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    uploaded_by UUID REFERENCES users(id),
    
    -- File info
    filename VARCHAR(255) NOT NULL,
    original_filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_url TEXT NOT NULL,
    mime_type VARCHAR(100),
    file_size BIGINT, -- bytes
    
    -- File type
    file_type VARCHAR(50), -- 'image', 'audio', 'video', 'document', 'other'
    
    -- Related entity
    entity_type VARCHAR(50), -- 'question', 'exam', 'material', 'submission'
    entity_id UUID,
    
    -- Storage info
    storage_provider VARCHAR(50) DEFAULT 'local', -- 'local', 's3', 'azure', 'cloudinary'
    
    is_deleted BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_file_attachments_entity ON file_attachments(entity_type, entity_id);
CREATE INDEX idx_file_attachments_uploaded_by ON file_attachments(uploaded_by);

-- =====================================================
-- 13. LEARNING MATERIALS
-- =====================================================

-- Learning materials/resources
CREATE TABLE learning_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id) NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    description TEXT,
    content TEXT,
    content_type VARCHAR(50), -- 'document', 'video', 'link', 'pdf', 'slides'
    
    -- Classification
    subject_id INTEGER REFERENCES subjects(id),
    chapter_id INTEGER REFERENCES chapters(id),
    knowledge_unit_id INTEGER REFERENCES knowledge_units(id),
    
    -- Content
    file_url TEXT,
    external_url TEXT,
    thumbnail_url TEXT,
    
    -- Metadata
    duration INTEGER, -- for videos (seconds)
    page_count INTEGER, -- for documents
    
    -- Access control
    is_public BOOLEAN DEFAULT false,
    is_premium BOOLEAN DEFAULT false,
    
    -- Statistics
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_materials_subject ON learning_materials(subject_id);
CREATE INDEX idx_materials_chapter ON learning_materials(chapter_id);
CREATE INDEX idx_materials_created_by ON learning_materials(created_by);

-- Material access tracking
CREATE TABLE material_access_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    material_id UUID REFERENCES learning_materials(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id),
    
    action VARCHAR(50), -- 'view', 'download', 'share'
    access_duration INTEGER, -- seconds
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- 14. QUESTION COLLECTIONS & SHARING
-- =====================================================

-- Question collections (bộ sưu tập câu hỏi)
CREATE TABLE question_collections (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id) NOT NULL,
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    
    subject_id INTEGER REFERENCES subjects(id),
    grade_level VARCHAR(20),
    
    is_public BOOLEAN DEFAULT false,
    is_collaborative BOOLEAN DEFAULT false, -- Allow multiple teachers to contribute
    
    total_questions INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Questions in collections
CREATE TABLE collection_questions (
    collection_id UUID REFERENCES question_collections(id) ON DELETE CASCADE,
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    added_by UUID REFERENCES users(id),
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, question_id)
);

-- Collection collaborators
CREATE TABLE collection_collaborators (
    collection_id UUID REFERENCES question_collections(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    permission VARCHAR(50) DEFAULT 'view', -- 'view', 'edit', 'admin'
    added_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (collection_id, user_id)
);

-- Question sharing
CREATE TABLE question_shares (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID REFERENCES questions(id) ON DELETE CASCADE,
    shared_by UUID REFERENCES users(id) NOT NULL,
    shared_with UUID REFERENCES users(id),
    share_token VARCHAR(255) UNIQUE, -- For public sharing
    
    permission VARCHAR(50) DEFAULT 'view', -- 'view', 'copy', 'edit'
    
    expires_at TIMESTAMP,
    access_count INTEGER DEFAULT 0,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_question_shares_token ON question_shares(share_token);
CREATE INDEX idx_question_shares_question ON question_shares(question_id);

-- =====================================================
-- 15. DISCUSSIONS & COMMENTS
-- =====================================================

-- Comments on questions/exams
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) NOT NULL,
    
    entity_type VARCHAR(50) NOT NULL, -- 'question', 'exam', 'material'
    entity_id UUID NOT NULL,
    
    parent_comment_id UUID REFERENCES comments(id) ON DELETE CASCADE, -- For replies
    
    content TEXT NOT NULL,
    
    -- Reactions
    likes_count INTEGER DEFAULT 0,
    
    is_edited BOOLEAN DEFAULT false,
    is_deleted BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_comments_entity ON comments(entity_type, entity_id);
CREATE INDEX idx_comments_user ON comments(user_id);
CREATE INDEX idx_comments_parent ON comments(parent_comment_id);

-- Comment reactions
CREATE TABLE comment_reactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    comment_id UUID REFERENCES comments(id) ON DELETE CASCADE,
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    reaction_type VARCHAR(50) DEFAULT 'like', -- 'like', 'helpful', 'insightful'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, user_id)
);

-- =====================================================
-- 16. STUDENT LEARNING PATHS
-- =====================================================

-- Learning paths (lộ trình học tập)
CREATE TABLE learning_paths (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    
    subject_id INTEGER REFERENCES subjects(id) NOT NULL,
    grade_level VARCHAR(20),
    
    -- Path status
    status VARCHAR(50) DEFAULT 'in_progress', -- 'not_started', 'in_progress', 'completed'
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    -- Goals
    target_score DECIMAL(5,2),
    target_date DATE,
    
    -- Current focus
    current_chapter_id INTEGER REFERENCES chapters(id),
    current_knowledge_unit_id INTEGER REFERENCES knowledge_units(id),
    
    -- AI recommendations
    recommended_topics TEXT[],
    recommended_materials UUID[],
    next_practice_exam UUID,
    
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    
    UNIQUE(student_id, subject_id)
);

-- Learning activities log
CREATE TABLE learning_activities (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID REFERENCES users(id) ON DELETE CASCADE,
    learning_path_id UUID REFERENCES learning_paths(id) ON DELETE CASCADE,
    
    activity_type VARCHAR(50) NOT NULL, -- 'practice', 'exam', 'material_view', 'question_attempt'
    entity_type VARCHAR(50), -- 'question', 'exam', 'material'
    entity_id UUID,
    
    -- Activity details
    duration INTEGER, -- seconds
    score DECIMAL(5,2),
    result JSONB,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_learning_activities_student ON learning_activities(student_id);
CREATE INDEX idx_learning_activities_path ON learning_activities(learning_path_id);

-- =====================================================
-- 17. SESSION MANAGEMENT
-- =====================================================

-- User sessions
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,

    session_token TEXT UNIQUE NOT NULL,
    refresh_token TEXT UNIQUE,

    -- Device info
    device_type VARCHAR(50), -- 'web', 'mobile', 'tablet'
    device_name VARCHAR(255),
    browser VARCHAR(100),
    os VARCHAR(100),
    ip_address INET,
    user_agent TEXT,

    -- Location
    country VARCHAR(100),
    city VARCHAR(100),

    -- Session status
    is_active BOOLEAN DEFAULT true,
    last_activity TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_user_sessions_user ON user_sessions(user_id);
CREATE INDEX idx_user_sessions_token ON user_sessions(session_token);
CREATE INDEX idx_user_sessions_active ON user_sessions(is_active);

-- =====================================================
-- 18. AUDIT LOGS
-- =====================================================

-- Audit trail for important actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    
    -- Action details
    action VARCHAR(100) NOT NULL, -- 'create', 'update', 'delete', 'login', 'logout', 'export'
    entity_type VARCHAR(50) NOT NULL, -- 'user', 'question', 'exam', 'assignment'
    entity_id UUID,
    
    -- Change details
    old_values JSONB,
    new_values JSONB,
    changes JSONB,
    
    -- Request info
    ip_address INET,
    user_agent TEXT,
    
    -- Additional context
    description TEXT,
    severity VARCHAR(50) DEFAULT 'info', -- 'info', 'warning', 'critical'
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created ON audit_logs(created_at);

-- =====================================================
-- 19. REPORTS & EXPORTS
-- =====================================================

-- Report templates
CREATE TABLE report_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID REFERENCES users(id),
    
    name VARCHAR(255) NOT NULL,
    description TEXT,
    report_type VARCHAR(50) NOT NULL, -- 'student_progress', 'class_performance', 'question_analytics'
    
    -- Template configuration
    config JSONB NOT NULL,
    
    is_public BOOLEAN DEFAULT false,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Generated reports
CREATE TABLE generated_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    template_id UUID REFERENCES report_templates(id),
    generated_by UUID REFERENCES users(id) NOT NULL,
    
    title VARCHAR(255) NOT NULL,
    report_type VARCHAR(50) NOT NULL,
    
    -- Report parameters
    parameters JSONB,
    
    -- Report data
    data JSONB,
    file_path TEXT,
    file_url TEXT,
    
    -- Status
    status VARCHAR(50) DEFAULT 'generating', -- 'generating', 'completed', 'failed'
    
    generated_at TIMESTAMP,
    expires_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_generated_reports_user ON generated_reports(generated_by);
CREATE INDEX idx_generated_reports_status ON generated_reports(status);

-- =====================================================
-- 20. GAMIFICATION & ACHIEVEMENTS
-- =====================================================

-- Achievements/Badges
CREATE TABLE achievements (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    icon_url TEXT,
    
    achievement_type VARCHAR(50), -- 'milestone', 'streak', 'mastery', 'contribution'
    
    -- Criteria
    criteria JSONB NOT NULL,
    
    -- Rewards
    points INTEGER DEFAULT 0,
    
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- User achievements
CREATE TABLE user_achievements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE CASCADE,
    achievement_id INTEGER REFERENCES achievements(id) ON DELETE CASCADE,
    
    progress_percentage DECIMAL(5,2) DEFAULT 0.00,
    
    earned_at TIMESTAMP,
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_id, achievement_id)
);

-- Leaderboards
CREATE TABLE leaderboards (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    
    leaderboard_type VARCHAR(50) NOT NULL, -- 'weekly', 'monthly', 'all_time'
    subject_id INTEGER REFERENCES subjects(id),
    grade_level VARCHAR(20),
    
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    
    rankings JSONB NOT NULL, -- [{user_id, rank, score, achievements}]
    
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_leaderboards_type ON leaderboards(leaderboard_type);
CREATE INDEX idx_leaderboards_subject ON leaderboards(subject_id);

-- =====================================================
-- ADDITIONAL CONSTRAINTS & BUSINESS RULES
-- =====================================================

-- Ensure exam end time is after start time
ALTER TABLE exam_assignments 
    ADD CONSTRAINT check_assignment_dates 
    CHECK (end_time > start_time);

-- Ensure positive values
ALTER TABLE questions 
    ADD CONSTRAINT check_question_points 
    CHECK (points > 0);

ALTER TABLE exam_questions 
    ADD CONSTRAINT check_exam_question_points 
    CHECK (points > 0);

-- Ensure percentage values are valid
ALTER TABLE exam_submissions 
    ADD CONSTRAINT check_percentage_range 
    CHECK (percentage >= 0 AND percentage <= 100);

-- Ensure score is within valid range
ALTER TABLE questions 
    ADD CONSTRAINT check_quality_score 
    CHECK (quality_score IS NULL OR (quality_score >= 0 AND quality_score <= 1));

-- =====================================================
-- ADDITIONAL TRIGGERS
-- =====================================================

-- Update question count in collections
CREATE OR REPLACE FUNCTION update_collection_question_count()
RETURNS TRIGGER AS $$
BEGIN
    IF TG_OP = 'INSERT' THEN
        UPDATE question_collections 
        SET total_questions = total_questions + 1 
        WHERE id = NEW.collection_id;
    ELSIF TG_OP = 'DELETE' THEN
        UPDATE question_collections 
        SET total_questions = total_questions - 1 
        WHERE id = OLD.collection_id;
    END IF;
    RETURN NULL;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_collection_count
AFTER INSERT OR DELETE ON collection_questions
FOR EACH ROW EXECUTE FUNCTION update_collection_question_count();

-- Update question usage statistics
CREATE OR REPLACE FUNCTION update_question_usage()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE questions 
    SET times_used = times_used + 1 
    WHERE id = NEW.question_id;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_usage
AFTER INSERT ON exam_questions
FOR EACH ROW EXECUTE FUNCTION update_question_usage();

-- Auto-update question statistics
CREATE OR REPLACE FUNCTION update_question_statistics_on_submission()
RETURNS TRIGGER AS $$
DECLARE
    q_stat RECORD;
BEGIN
    FOR q_stat IN 
        SELECT question_id, is_correct 
        FROM submission_answers 
        WHERE submission_id = NEW.id
    LOOP
        INSERT INTO question_statistics (
            question_id, 
            times_answered, 
            times_correct
        ) VALUES (
            q_stat.question_id, 
            1, 
            CASE WHEN q_stat.is_correct THEN 1 ELSE 0 END
        )
        ON CONFLICT (question_id) 
        DO UPDATE SET
            times_answered = question_statistics.times_answered + 1,
            times_correct = question_statistics.times_correct + 
                CASE WHEN q_stat.is_correct THEN 1 ELSE 0 END,
            difficulty_index = 
                CASE WHEN question_statistics.times_answered + 1 > 0 
                THEN (question_statistics.times_correct + 
                    CASE WHEN q_stat.is_correct THEN 1 ELSE 0 END)::DECIMAL / 
                    (question_statistics.times_answered + 1)
                ELSE 0 
                END;
    END LOOP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_question_stats
AFTER INSERT ON exam_submissions
FOR EACH ROW 
WHEN (NEW.status = 'graded')
EXECUTE FUNCTION update_question_statistics_on_submission();

-- Auto-create audit log for critical changes
CREATE OR REPLACE FUNCTION create_audit_log()
RETURNS TRIGGER AS $$
DECLARE
    v_user_id UUID;
BEGIN
    -- Safely get user_id, handle NULL or empty string
    BEGIN
        v_user_id := NULLIF(CURRENT_SETTING('app.current_user_id', true), '')::UUID;
    EXCEPTION
        WHEN OTHERS THEN
            v_user_id := NULL;
    END;

    IF TG_OP = 'DELETE' THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id, 
            old_values, description
        ) VALUES (
            v_user_id,
            'delete',
            TG_TABLE_NAME,
            OLD.id,
            row_to_json(OLD),
            'Record deleted'
        );
        RETURN OLD;
    ELSIF TG_OP = 'UPDATE' THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id,
            old_values, new_values, description
        ) VALUES (
            v_user_id,
            'update',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(OLD),
            row_to_json(NEW),
            'Record updated'
        );
        RETURN NEW;
    ELSIF TG_OP = 'INSERT' THEN
        INSERT INTO audit_logs (
            user_id, action, entity_type, entity_id,
            new_values, description
        ) VALUES (
            v_user_id,
            'create',
            TG_TABLE_NAME,
            NEW.id,
            row_to_json(NEW),
            'Record created'
        );
        RETURN NEW;
    END IF;
END;
$$ LANGUAGE plpgsql;

-- Apply audit logging to critical tables
CREATE TRIGGER audit_users AFTER INSERT OR UPDATE OR DELETE ON users
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_exams AFTER INSERT OR UPDATE OR DELETE ON exams
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

CREATE TRIGGER audit_questions AFTER INSERT OR UPDATE OR DELETE ON questions
    FOR EACH ROW EXECUTE FUNCTION create_audit_log();

-- =====================================================
-- ADDITIONAL VIEWS
-- =====================================================

-- View: Question bank overview by subject
CREATE VIEW question_bank_overview AS
SELECT 
    s.name as subject_name,
    COUNT(q.id) as total_questions,
    COUNT(DISTINCT q.chapter_id) as chapters_covered,
    SUM(CASE WHEN q.difficulty = 'easy' THEN 1 ELSE 0 END) as easy_count,
    SUM(CASE WHEN q.difficulty = 'medium' THEN 1 ELSE 0 END) as medium_count,
    SUM(CASE WHEN q.difficulty = 'hard' THEN 1 ELSE 0 END) as hard_count,
    SUM(CASE WHEN q.difficulty = 'very_hard' THEN 1 ELSE 0 END) as very_hard_count,
    SUM(CASE WHEN q.is_ai_generated THEN 1 ELSE 0 END) as ai_generated,
    SUM(CASE WHEN q.is_verified THEN 1 ELSE 0 END) as verified,
    AVG(q.quality_score) as avg_quality_score
FROM subjects s
LEFT JOIN questions q ON s.id = q.subject_id
WHERE q.is_active = true
GROUP BY s.id, s.name;

-- View: Class performance overview
CREATE VIEW class_performance_overview AS
SELECT 
    c.id as class_id,
    c.name as class_name,
    c.teacher_id,
    u.full_name as teacher_name,
    COUNT(DISTINCT cm.user_id) as total_students,
    COUNT(DISTINCT ea.id) as total_assignments,
    COUNT(DISTINCT es.id) as total_submissions,
    AVG(es.score) as avg_class_score,
    AVG(es.percentage) as avg_class_percentage
FROM classes c
JOIN users u ON c.teacher_id = u.id
LEFT JOIN class_members cm ON c.id = cm.class_id AND cm.role = 'student'
LEFT JOIN exam_assignments ea ON c.id = ea.class_id
LEFT JOIN exam_submissions es ON ea.id = es.assignment_id AND es.status = 'graded'
WHERE c.is_active = true
GROUP BY c.id, c.name, c.teacher_id, u.full_name;

-- View: AI generation statistics
CREATE VIEW ai_generation_stats AS
SELECT 
    DATE(agr.created_at) as generation_date,
    COUNT(agr.id) as total_requests,
    SUM(CASE WHEN agr.status = 'completed' THEN 1 ELSE 0 END) as completed_requests,
    SUM(CASE WHEN agr.status = 'failed' THEN 1 ELSE 0 END) as failed_requests,
    SUM(agr.questions_generated) as total_questions_generated,
    SUM(agr.questions_accepted) as total_questions_accepted,
    AVG(agl.generation_time) as avg_generation_time,
    SUM(agl.cost) as total_cost
FROM ai_generation_requests agr
LEFT JOIN ai_generation_logs agl ON agr.id = agl.request_id
GROUP BY DATE(agr.created_at)
ORDER BY generation_date DESC;

-- =====================================================
-- SAMPLE DATA (Optional - for testing)
-- =====================================================

-- Insert sample admin user (password: Admin@123)
-- Note: Password hash auto-generated by init-db.js script
INSERT INTO users (id, email, phone, full_name, password_hash, role_id, is_active, email_verified, phone_verified, approval_status, approved_at) 
VALUES (
    '10000000-0000-0000-0000-000000000001',
    'admin@examora.vn',
    '0901234567',
    'Nguyễn Văn Admin',
    '{{ADMIN_PASSWORD_HASH}}', -- Will be replaced by init-db.js
    (SELECT id FROM roles WHERE name = 'admin'),
    true,
    true,
    true,
    'approved',
    CURRENT_TIMESTAMP
);

-- Insert admin profile
INSERT INTO user_profiles (
    user_id, 
    date_of_birth, 
    gender, 
    place_of_birth,
    nationality,
    ethnicity,
    identification_number,
    identification_type,
    identification_issued_date,
    identification_issued_place,
    address,
    permanent_address,
    city,
    district,
    ward,
    postal_code,
    emergency_contact_name,
    emergency_contact_relationship,
    emergency_contact_phone,
    bio
) VALUES (
    '10000000-0000-0000-0000-000000000001',
    '1985-03-15',
    'male',
    'Hà Nội',
    'Việt Nam',
    'Kinh',
    '001085012345',
    'cccd',
    '2020-01-15',
    'Công an TP Hà Nội',
    'Số 1 Đại Cồ Việt, P. Bách Khoa, Q. Hai Bà Trưng',
    'Số 123 Ngõ Giếng, P. Đống Đa, Q. Đống Đa',
    'Hà Nội',
    'Hai Bà Trưng',
    'Bách Khoa',
    '100000',
    'Trần Thị B',
    'Vợ',
    '0912345678',
    'Quản trị viên hệ thống EXAMORA - Chuyên gia về công nghệ giáo dục'
);

-- Insert sample teachers (password: Teacher@123 for all)
-- Teachers are approved for demo purposes
-- Note: Password hash auto-generated by init-db.js script
INSERT INTO users (id, email, phone, full_name, password_hash, role_id, is_active, email_verified, approval_status, approved_by, approved_at) VALUES
    ('20000000-0000-0000-0000-000000000001', 'nguyenvana@examora.vn', '0911111111', 'Nguyễn Văn A', '{{TEACHER_PASSWORD_HASH}}', (SELECT id FROM roles WHERE name = 'teacher'), true, true, 'approved', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000002', 'tranthib@examora.vn', '0922222222', 'Trần Thị B', '{{TEACHER_PASSWORD_HASH}}', (SELECT id FROM roles WHERE name = 'teacher'), true, true, 'approved', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000003', 'levanc@examora.vn', '0933333333', 'Lê Văn C', '{{TEACHER_PASSWORD_HASH}}', (SELECT id FROM roles WHERE name = 'teacher'), true, true, 'approved', '10000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP);

-- Insert teacher profiles
INSERT INTO user_profiles (user_id, date_of_birth, gender, place_of_birth, address, city, district, school_name, bio) VALUES
    ('20000000-0000-0000-0000-000000000001', '1988-05-20', 'male', 'Hà Nội', 'Số 45 Phố Huế, Q. Hai Bà Trưng', 'Hà Nội', 'Hai Bà Trưng', 'THPT Chu Văn An', 'Giáo viên Toán với 12 năm kinh nghiệm'),
    ('20000000-0000-0000-0000-000000000002', '1990-08-15', 'female', 'Hải Phòng', 'Số 78 Nguyễn Trãi, Q. Thanh Xuân', 'Hà Nội', 'Thanh Xuân', 'THPT Nguyễn Huệ', 'Giáo viên Vật lý, chuyên gia Olympic'),
    ('20000000-0000-0000-0000-000000000003', '1987-12-10', 'male', 'Nam Định', 'Số 123 Láng Hạ, Q. Đống Đa', 'Hà Nội', 'Đống Đa', 'THPT Lê Quý Đôn', 'Giáo viên Hóa học, Thạc sĩ Sư phạm');

INSERT INTO teacher_profiles (
    user_id, 
    teacher_code, 
    employee_id,
    highest_degree, 
    major, 
    university, 
    graduation_year,
    subjects_teaching,
    main_subject_id,
    grade_levels_teaching,
    teaching_experience_years,
    certifications,
    awards,
    start_date,
    contract_type,
    employment_status,
    office_location,
    average_rating,
    total_reviews,
    total_classes_taught,
    total_students_taught,
    total_exams_created
) VALUES
    (
        '20000000-0000-0000-0000-000000000001',
        'GV2020001',
        'NV123456',
        'master',
        'Sư phạm Toán học',
        'Đại học Sư phạm Hà Nội',
        2012,
        ARRAY[1], -- Toán
        1,
        ARRAY['10', '11', '12'],
        12,
        '[{"name": "Chứng chỉ giảng dạy nâng cao", "issuer": "Bộ GD&ĐT", "date": "2020-06-15"}]'::jsonb,
        '[{"name": "Giáo viên giỏi cấp thành phố", "year": 2023}]'::jsonb,
        '2012-09-01',
        'permanent',
        'active',
        'Phòng 301, Tòa A',
        4.85,
        127,
        45,
        1250,
        320
    ),
    (
        '20000000-0000-0000-0000-000000000002',
        'GV2019002',
        'NV789012',
        'bachelor',
        'Sư phạm Vật lý',
        'Đại học Sư phạm Hà Nội',
        2014,
        ARRAY[4], -- Vật lý
        4,
        ARRAY['10', '11', '12'],
        10,
        '[{"name": "Chứng chỉ STEM Education", "issuer": "British Council", "date": "2021-03-20"}]'::jsonb,
        '[{"name": "Huấn luyện Olympic Vật lý", "year": 2022}]'::jsonb,
        '2014-09-01',
        'permanent',
        'active',
        'Phòng 205, Tòa B',
        4.92,
        98,
        38,
        980,
        245
    ),
    (
        '20000000-0000-0000-0000-000000000003',
        'GV2021003',
        'NV345678',
        'master',
        'Sư phạm Hóa học',
        'Đại học Khoa học Tự nhiên Hà Nội',
        2015,
        ARRAY[5], -- Hóa học
        5,
        ARRAY['10', '11', '12'],
        9,
        '[{"name": "Chứng chỉ thí nghiệm an toàn", "issuer": "Viện Hóa học", "date": "2019-11-10"}]'::jsonb,
        '[{"name": "Giáo viên xuất sắc", "year": 2023}]'::jsonb,
        '2015-09-01',
        'permanent',
        'active',
        'Phòng 108, Tòa C',
        4.78,
        85,
        32,
        850,
        198
    );

-- Insert sample students (password: Student@123 for all)
-- Students are auto-approved
-- Note: Password hash auto-generated by init-db.js script
INSERT INTO users (id, email, phone, full_name, password_hash, role_id, is_active, email_verified, approval_status, approved_at) VALUES
    ('30000000-0000-0000-0000-000000000001', 'nguyenthid@student.examora.vn', '0961111111', 'Nguyễn Thị D', '{{STUDENT_PASSWORD_HASH}}', (SELECT id FROM roles WHERE name = 'student'), true, true, 'approved', CURRENT_TIMESTAMP),
    ('30000000-0000-0000-0000-000000000002', 'phamvane@student.examora.vn', '0962222222', 'Phạm Văn E', '{{STUDENT_PASSWORD_HASH}}', (SELECT id FROM roles WHERE name = 'student'), true, true, 'approved', CURRENT_TIMESTAMP),
    ('30000000-0000-0000-0000-000000000003', 'hoangthif@student.examora.vn', '0963333333', 'Hoàng Thị F', '{{STUDENT_PASSWORD_HASH}}', (SELECT id FROM roles WHERE name = 'student'), true, true, 'approved', CURRENT_TIMESTAMP),
    ('30000000-0000-0000-0000-000000000004', 'dovang@student.examora.vn', '0964444444', 'Đỗ Văn G', '{{STUDENT_PASSWORD_HASH}}', (SELECT id FROM roles WHERE name = 'student'), true, true, 'approved', CURRENT_TIMESTAMP),
    ('30000000-0000-0000-0000-000000000005', 'buithibh@student.examora.vn', '0965555555', 'Bùi Thị H', '{{STUDENT_PASSWORD_HASH}}', (SELECT id FROM roles WHERE name = 'student'), true, true, 'approved', CURRENT_TIMESTAMP);

-- Insert student profiles
INSERT INTO user_profiles (user_id, date_of_birth, gender, place_of_birth, address, city, district, school_name, grade_level, class_name, student_code) VALUES
    ('30000000-0000-0000-0000-000000000001', '2008-03-25', 'female', 'Hà Nội', 'Số 12 Hoàng Cầu, Q. Đống Đa', 'Hà Nội', 'Đống Đa', 'THPT Chu Văn An', '11', '11A1', 'HS2023001'),
    ('30000000-0000-0000-0000-000000000002', '2008-07-18', 'male', 'Hà Nội', 'Số 56 Nguyễn Lương Bằng, Q. Đống Đa', 'Hà Nội', 'Đống Đa', 'THPT Chu Văn An', '11', '11A1', 'HS2023002'),
    ('30000000-0000-0000-0000-000000000003', '2008-11-05', 'female', 'Hải Dương', 'Số 89 Giải Phóng, Q. Hoàng Mai', 'Hà Nội', 'Hoàng Mai', 'THPT Nguyễn Huệ', '11', '11B2', 'HS2023003'),
    ('30000000-0000-0000-0000-000000000004', '2008-01-20', 'male', 'Nam Định', 'Số 34 Lê Duẩn, Q. Hai Bà Trưng', 'Hà Nội', 'Hai Bà Trưng', 'THPT Lê Quý Đôn', '11', '11C3', 'HS2023004'),
    ('30000000-0000-0000-0000-000000000005', '2008-09-12', 'female', 'Hà Nội', 'Số 67 Trần Đại Nghĩa, Q. Hai Bà Trưng', 'Hà Nội', 'Hai Bà Trưng', 'THPT Lê Quý Đôn', '11', '11C3', 'HS2023005');

INSERT INTO student_profiles (
    user_id,
    student_code,
    admission_year,
    expected_graduation_year,
    current_grade_level,
    academic_year,
    semester,
    enrollment_status,
    academic_track,
    major_subjects,
    elective_subjects,
    gpa,
    class_rank,
    grade_rank,
    conduct_grade,
    total_absences,
    total_tardies,
    attendance_rate,
    achievements,
    extracurricular_activities,
    competitions,
    career_interests,
    university_aspirations,
    total_exams_taken,
    average_exam_score,
    total_study_hours
) VALUES
    (
        '30000000-0000-0000-0000-000000000001',
        'HS2023001',
        2023,
        2026,
        '11',
        '2025-2026',
        'HK1',
        'active',
        'natural_science',
        ARRAY[1, 4, 5], -- Toán, Lý, Hóa
        ARRAY[3], -- Tiếng Anh
        8.75,
        3,
        15,
        'excellent',
        2,
        1,
        98.50,
        '[{"name": "Học sinh giỏi cấp trường", "date": "2024-05-15", "description": "Giải Nhì môn Toán"}]'::jsonb,
        '[{"activity": "CLB Toán học", "role": "Thành viên", "start_date": "2023-09-01"}]'::jsonb,
        '[{"competition": "Olympic Toán cấp tỉnh", "result": "Giải Ba", "date": "2024-03-20"}]'::jsonb,
        ARRAY['Kỹ sư phần mềm', 'Data Scientist'],
        ARRAY['ĐH Bách Khoa Hà Nội', 'ĐH FPT'],
        28,
        8.65,
        450
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        'HS2023002',
        2023,
        2026,
        '11',
        '2025-2026',
        'HK1',
        'active',
        'natural_science',
        ARRAY[1, 4, 5],
        ARRAY[3],
        8.25,
        8,
        45,
        'good',
        3,
        2,
        97.20,
        '[{"name": "Học sinh tiên tiến", "date": "2024-05-15"}]'::jsonb,
        '[{"activity": "Đội bóng đá trường", "role": "Cầu thủ", "start_date": "2023-09-01"}]'::jsonb,
        '[]'::jsonb,
        ARRAY['Kỹ sư cơ khí', 'Kiến trúc sư'],
        ARRAY['ĐH Xây Dựng', 'ĐH Bách Khoa'],
        25,
        8.15,
        380
    ),
    (
        '30000000-0000-0000-0000-000000000003',
        'HS2023003',
        2023,
        2026,
        '11',
        '2025-2026',
        'HK1',
        'active',
        'social_science',
        ARRAY[2, 7, 8], -- Văn, Sử, Địa
        ARRAY[3],
        8.90,
        2,
        10,
        'excellent',
        1,
        0,
        99.20,
        '[{"name": "Học sinh giỏi toàn diện", "date": "2024-05-15"}, {"name": "Học sinh 3 tốt", "date": "2024-05-15"}]'::jsonb,
        '[{"activity": "CLB Văn học", "role": "Chủ tịch", "start_date": "2023-09-01"}, {"activity": "Báo tường trường", "role": "Biên tập viên", "start_date": "2023-09-01"}]'::jsonb,
        '[{"competition": "Cuộc thi viết văn cấp tỉnh", "result": "Giải Nhất", "date": "2024-04-10"}]'::jsonb,
        ARRAY['Nhà báo', 'Biên tập viên'],
        ARRAY['ĐH Khoa học Xã hội và Nhân văn', 'ĐH Ngoại Thương'],
        32,
        8.85,
        520
    ),
    (
        '30000000-0000-0000-0000-000000000004',
        'HS2023004',
        2023,
        2026,
        '11',
        '2025-2026',
        'HK1',
        'active',
        'natural_science',
        ARRAY[1, 4, 6], -- Toán, Lý, Sinh
        ARRAY[3],
        7.85,
        12,
        78,
        'good',
        4,
        3,
        96.00,
        '[]'::jsonb,
        '[{"activity": "Tình nguyện", "role": "Tình nguyện viên", "start_date": "2023-09-01"}]'::jsonb,
        '[]'::jsonb,
        ARRAY['Bác sĩ', 'Dược sĩ'],
        ARRAY['ĐH Y Hà Nội', 'ĐH Dược Hà Nội'],
        22,
        7.75,
        320
    ),
    (
        '30000000-0000-0000-0000-000000000005',
        'HS2023005',
        2023,
        2026,
        '11',
        '2025-2026',
        'HK1',
        'active',
        'both',
        ARRAY[1, 3, 4], -- Toán, Anh, Lý
        ARRAY[5],
        8.55,
        5,
        28,
        'excellent',
        2,
        1,
        98.00,
        '[{"name": "Học sinh xuất sắc", "date": "2024-05-15"}]'::jsonb,
        '[{"activity": "CLB Tiếng Anh", "role": "Phó chủ tịch", "start_date": "2023-09-01"}]'::jsonb,
        '[{"competition": "Olympic Tiếng Anh", "result": "Giải Khuyến khích", "date": "2024-02-28"}]'::jsonb,
        ARRAY['Giáo viên', 'Thông dịch viên'],
        ARRAY['ĐH Ngoại Ngữ', 'ĐH Sư phạm Hà Nội'],
        30,
        8.50,
        480
    );

-- Insert sample AI models
INSERT INTO ai_models (name, provider, model_id, version, supports_question_types, is_default, cost_per_token)
VALUES 
    ('GPT-4 Turbo', 'openai', 'gpt-4-turbo-preview', '0125', 
     ARRAY['multiple_choice', 'true_false', 'fill_blank'], true, 0.00003),
    ('GPT-3.5 Turbo', 'openai', 'gpt-3.5-turbo', '0125',
     ARRAY['multiple_choice', 'true_false'], false, 0.000002),
    ('Gemini Pro', 'gemini', 'gemini-pro', '1.0',
     ARRAY['multiple_choice', 'true_false', 'fill_blank'], false, 0.000001);

-- Insert system settings
INSERT INTO system_settings (key, value, data_type, category, description) VALUES
    ('site_name', 'EXAMORA - Hệ thống Quản lý Đề thi', 'string', 'general', 'Tên hệ thống'),
    ('site_url', 'https://examora.vn', 'string', 'general', 'URL hệ thống'),
    ('max_ai_requests_per_day', '50', 'number', 'ai', 'Số lượng yêu cầu AI tối đa mỗi ngày'),
    ('max_ai_questions_per_request', '20', 'number', 'ai', 'Số câu hỏi tối đa mỗi lần tạo'),
    ('default_exam_duration', '45', 'number', 'exam', 'Thời gian làm bài mặc định (phút)'),
    ('enable_ai_proctoring', 'true', 'boolean', 'exam', 'Bật giám sát AI'),
    ('max_exam_attempts', '3', 'number', 'exam', 'Số lần làm bài tối đa'),
    ('rabbitmq_host', 'localhost', 'string', 'queue', 'RabbitMQ host'),
    ('rabbitmq_port', '5672', 'number', 'queue', 'RabbitMQ port'),
    ('rabbitmq_username', 'guest', 'string', 'queue', 'RabbitMQ username'),
    ('file_max_size', '10485760', 'number', 'storage', 'Kích thước file tối đa (10MB)'),
    ('allowed_file_types', 'jpg,jpeg,png,pdf,doc,docx', 'string', 'storage', 'Loại file được phép'),
    ('session_timeout', '7200', 'number', 'security', 'Thời gian timeout phiên (giây)'),
    ('enable_email_verification', 'true', 'boolean', 'security', 'Bật xác thực email'),
    ('enable_two_factor', 'false', 'boolean', 'security', 'Bật xác thực 2 yếu tố');

-- Insert sample achievements
INSERT INTO achievements (name, description, achievement_type, criteria, points) VALUES
    ('First Steps', 'Hoàn thành đề thi đầu tiên', 'milestone', '{"exams_completed": 1}', 10),
    ('Knowledge Seeker', 'Hoàn thành 10 đề thi', 'milestone', '{"exams_completed": 10}', 50),
    ('Master Mind', 'Đạt điểm 9+ trong 5 đề thi', 'mastery', '{"high_scores": 5}', 100),
    ('Week Warrior', 'Học liên tục 7 ngày', 'streak', '{"consecutive_days": 7}', 30),
    ('Question Creator', 'Tạo 50 câu hỏi', 'contribution', '{"questions_created": 50}', 75);

-- Insert email templates
INSERT INTO email_templates (template_key, template_name, subject, html_body, text_body, variables, language) VALUES
    ('welcome', 'Email chào mừng', 
     'Chào mừng bạn đến với EXAMORA!',
     '<h1>Chào {{fullName}},</h1><p>Chào mừng bạn đến với EXAMORA - Hệ thống quản lý đề thi thông minh!</p><p>Email của bạn: {{email}}</p><p>Vai trò: {{role}}</p>',
     'Chào {{fullName}}, Chào mừng bạn đến với EXAMORA!',
     '{"variables": [{"name": "fullName", "description": "Tên đầy đủ"}, {"name": "email", "description": "Email"}, {"name": "role", "description": "Vai trò"}]}',
     'vi'),
    
    ('email_verification', 'Xác thực email',
     'Xác thực địa chỉ email của bạn',
     '<h1>Xin chào {{fullName}},</h1><p>Vui lòng nhấp vào liên kết bên dưới để xác thực email của bạn:</p><p><a href="{{verificationLink}}">Xác thực email</a></p><p>Hoặc sử dụng mã: <strong>{{verificationCode}}</strong></p><p>Mã có hiệu lực trong {{expiryMinutes}} phút.</p>',
     'Xin chào {{fullName}}, Mã xác thực email của bạn: {{verificationCode}}. Có hiệu lực trong {{expiryMinutes}} phút.',
     '{"variables": [{"name": "fullName", "description": "Tên đầy đủ"}, {"name": "verificationLink", "description": "Link xác thực"}, {"name": "verificationCode", "description": "Mã xác thực"}, {"name": "expiryMinutes", "description": "Thời gian hết hạn"}]}',
     'vi'),
    
    ('password_reset', 'Đặt lại mật khẩu',
     'Yêu cầu đặt lại mật khẩu',
     '<h1>Xin chào {{fullName}},</h1><p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p><p>Nhấp vào liên kết bên dưới để đặt lại mật khẩu:</p><p><a href="{{resetLink}}">Đặt lại mật khẩu</a></p><p>Hoặc sử dụng mã: <strong>{{resetCode}}</strong></p><p>Liên kết có hiệu lực trong {{expiryMinutes}} phút.</p><p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>',
     'Xin chào {{fullName}}, Mã đặt lại mật khẩu của bạn: {{resetCode}}. Có hiệu lực trong {{expiryMinutes}} phút.',
     '{"variables": [{"name": "fullName", "description": "Tên đầy đủ"}, {"name": "resetLink", "description": "Link reset"}, {"name": "resetCode", "description": "Mã reset"}, {"name": "expiryMinutes", "description": "Thời gian hết hạn"}]}',
     'vi'),
    
    ('exam_assigned', 'Thông báo bài thi mới',
     'Bạn có bài thi mới: {{examTitle}}',
     '<h1>Xin chào {{studentName}},</h1><p>Giáo viên {{teacherName}} đã giao cho bạn một bài thi mới:</p><p><strong>{{examTitle}}</strong></p><p>Lớp: {{className}}</p><p>Môn học: {{subjectName}}</p><p>Thời gian bắt đầu: {{startTime}}</p><p>Thời gian kết thúc: {{endTime}}</p><p>Thời lượng: {{duration}} phút</p><p><a href="{{examLink}}">Vào làm bài</a></p>',
     'Bạn có bài thi mới: {{examTitle}}. Thời gian: {{startTime}} - {{endTime}}',
     '{"variables": [{"name": "studentName", "description": "Tên học sinh"}, {"name": "teacherName", "description": "Tên giáo viên"}, {"name": "examTitle", "description": "Tên đề thi"}, {"name": "className", "description": "Tên lớp"}, {"name": "subjectName", "description": "Tên môn"}, {"name": "startTime", "description": "Thời gian bắt đầu"}, {"name": "endTime", "description": "Thời gian kết thúc"}, {"name": "duration", "description": "Thời lượng"}, {"name": "examLink", "description": "Link làm bài"}]}',
     'vi'),
    
    ('exam_graded', 'Kết quả bài thi',
     'Kết quả bài thi {{examTitle}}',
     '<h1>Xin chào {{studentName}},</h1><p>Bài thi <strong>{{examTitle}}</strong> của bạn đã được chấm điểm.</p><p>Điểm số: <strong>{{score}}/{{totalPoints}}</strong> ({{percentage}}%)</p><p>Số câu đúng: {{correctAnswers}}/{{totalQuestions}}</p><p>Nhận xét: {{feedback}}</p><p><a href="{{resultLink}}">Xem chi tiết kết quả</a></p>',
     'Kết quả bài thi {{examTitle}}: {{score}}/{{totalPoints}} ({{percentage}}%)',
     '{"variables": [{"name": "studentName", "description": "Tên học sinh"}, {"name": "examTitle", "description": "Tên đề thi"}, {"name": "score", "description": "Điểm số"}, {"name": "totalPoints", "description": "Tổng điểm"}, {"name": "percentage", "description": "Phần trăm"}, {"name": "correctAnswers", "description": "Số câu đúng"}, {"name": "totalQuestions", "description": "Tổng số câu"}, {"name": "feedback", "description": "Nhận xét"}, {"name": "resultLink", "description": "Link xem kết quả"}]}',
     'vi');

-- =====================================================
-- UTILITY FUNCTIONS
-- =====================================================

-- Function to calculate student's overall progress
CREATE OR REPLACE FUNCTION calculate_student_progress(student_uuid UUID, subject_int INTEGER)
RETURNS DECIMAL AS $$
DECLARE
    total_chapters INTEGER;
    completed_chapters INTEGER;
    progress DECIMAL;
BEGIN
    SELECT COUNT(*) INTO total_chapters
    FROM chapters
    WHERE subject_id = subject_int;
    
    SELECT COUNT(DISTINCT chapter_id) INTO completed_chapters
    FROM submission_answers sa
    JOIN questions q ON sa.question_id = q.id
    JOIN exam_submissions es ON sa.submission_id = es.id
    WHERE es.student_id = student_uuid
      AND q.subject_id = subject_int
      AND sa.is_correct = true;
    
    IF total_chapters > 0 THEN
        progress := (completed_chapters::DECIMAL / total_chapters::DECIMAL) * 100;
    ELSE
        progress := 0;
    END IF;
    
    RETURN ROUND(progress, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to get recommended difficulty for student
CREATE OR REPLACE FUNCTION get_recommended_difficulty(student_uuid UUID, subject_int INTEGER)
RETURNS difficulty_level AS $$
DECLARE
    avg_accuracy DECIMAL;
    recommended difficulty_level;
BEGIN
    SELECT AVG(percentage) INTO avg_accuracy
    FROM exam_submissions
    WHERE student_id = student_uuid
      AND exam_id IN (
          SELECT id FROM exams WHERE subject_id = subject_int
      )
      AND status = 'graded'
    LIMIT 10;
    
    IF avg_accuracy IS NULL THEN
        recommended := 'easy';
    ELSIF avg_accuracy >= 85 THEN
        recommended := 'hard';
    ELSIF avg_accuracy >= 70 THEN
        recommended := 'medium';
    ELSE
        recommended := 'easy';
    END IF;
    
    RETURN recommended;
END;
$$ LANGUAGE plpgsql;

-- Function to clean up expired sessions
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions
    WHERE expires_at < CURRENT_TIMESTAMP
       OR (is_active = false AND last_activity < CURRENT_TIMESTAMP - INTERVAL '30 days');
    
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- SCHEDULED JOBS (To be implemented in application)
-- =====================================================

-- Daily cleanup tasks:
-- 1. cleanup_expired_sessions()
-- 2. Delete old audit_logs (> 1 year)
-- 3. Archive completed exam_submissions (> 6 months)
-- 4. Update leaderboards
-- 5. Calculate daily analytics

-- =====================================================
-- END OF ENHANCED SCHEMA
-- =====================================================
