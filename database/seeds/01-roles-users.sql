-- =====================================================
-- SEED 01: Roles + Users
-- =====================================================

SET search_path = user_db, public;

-- Insert roles
INSERT INTO roles (name, description) VALUES
    ('admin', 'System administrator with full access'),
    ('teacher', 'Teacher/ Instructor who creates exams and manages classes'),
    ('student', 'Student who takes exams and tracks progress')
ON CONFLICT (name) DO NOTHING;

-- Sample users (password: Password123!)
-- Hash generated with bcrypt, cost factor 10
INSERT INTO users (id, email, password_hash, full_name, role_id, is_active, email_verified, approval_status) VALUES
    ('00000000-0000-0000-0000-000000000001',
     'admin@examora.local',
     '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZxZxZ',
     'Admin User',
     1, true, true, 'approved'),
    ('00000000-0000-0000-0000-000000000002',
     'teacher1@examora.local',
     '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZxZ',
     'Nguyen Van A',
     2, true, true, 'approved'),
    ('00000000-0000-0000-0000-000000000003',
     'teacher2@examora.local',
     '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZxZ',
     'Tran Thi B',
     2, true, true, 'approved'),
    ('00000000-0000-0000-0000-000000000004',
     'student1@examora.local',
     '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZxZ',
     'Le Van C',
     3, true, true, 'approved'),
    ('00000000-0000-0000-0000-000000000005',
     'student2@examora.local',
     '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZxZ',
     'Pham Thi D',
     3, true, true, 'approved'),
    ('00000000-0000-0000-0000-000000000006',
     'student3@examora.local',
     '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZxZ',
     'Hoang Van E',
     3, true, true, 'approved')
ON CONFLICT (email) DO NOTHING;

-- Sample user profiles
INSERT INTO user_profiles (user_id, date_of_birth, gender, school_name, student_code, teacher_department) VALUES
    ('00000000-0000-0000-0000-000000000002', '1985-03-15', 'male', 'University of Science', NULL, 'Computer Science'),
    ('00000000-0000-0000-0000-000000000003', '1990-07-22', 'female', 'University of Science', NULL, 'Mathematics'),
    ('00000000-0000-0000-0000-000000000004', '2005-01-10', 'male', 'THPT Chu Van An', 'SV0001', NULL),
    ('00000000-0000-0000-0000-000000000005', '2005-05-20', 'female', 'THPT Chu Van An', 'SV0002', NULL),
    ('00000000-0000-0000-0000-000000000006', '2005-08-30', 'male', 'THPT Nguyen Hue', 'SV0003', NULL)
ON CONFLICT (user_id) DO NOTHING;
