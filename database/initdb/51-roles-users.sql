-- =====================================================
-- SEED 51: Roles + Users + Profiles
-- =====================================================

SET search_path = user_db, public;

-- Roles
INSERT INTO roles (id, name, description) VALUES
    (1, 'admin', 'System administrator'),
    (2, 'teacher', 'Teacher'),
    (3, 'student', 'Student')
ON CONFLICT (id) DO NOTHING;

-- Users (password: Test@123 for all)
INSERT INTO users (
    id, email, phone, password_hash, full_name, role_id, is_active,
    email_verified, approval_status, approved_at
)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'admin@examora.local', '0900000001', '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZxZ', 'Admin User', 1, true, true, 'approved', CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000001', 'teacher1@examora.local', '0900000002', '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZ', 'Teacher One', 2, true, true, 'approved', CURRENT_TIMESTAMP),
    ('20000000-0000-0000-0000-000000000002', 'teacher2@examora.local', '0900000003', '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZ', 'Teacher Two', 2, true, true, 'approved', CURRENT_TIMESTAMP),
    ('30000000-0000-0000-0000-000000000001', 'student1@examora.local', '0900000004', '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZ', 'Student One', 3, true, true, 'approved', CURRENT_TIMESTAMP),
    ('30000000-0000-0000-0000-000000000002', 'student2@examora.local', '0900000005', '$2b$10$rQZ8qPQZPZQZQZQZQZQZQZOwZcYbJdJxZxZxZxZxZxZxZxZxZ', 'Student Two', 3, true, true, 'approved', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- User profiles
INSERT INTO user_profiles (id, user_id, date_of_birth, gender, school_name, class_code, student_code, teacher_code, bio)
VALUES
    ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '1988-05-20', 'male', 'Examora University', 'T1', NULL, 'TC001', 'Math teacher'),
    ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '1990-08-15', 'female', 'Examora University', 'T2', NULL, 'TC002', 'Physics teacher'),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '2008-03-25', 'female', 'Examora University', 'S1', 'SV0001', NULL, 'Student profile'),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '2008-07-18', 'male', 'Examora University', 'S1', 'SV0002', NULL, 'Student profile')
ON CONFLICT (id) DO NOTHING;

-- User devices
INSERT INTO user_devices (id, user_id, device_id, platform, device_name, last_seen)
VALUES
    ('41000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'device-student-1', 'android', 'Student Phone', CURRENT_TIMESTAMP),
    ('41000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'device-student-web', 'web', 'Chrome Browser', CURRENT_TIMESTAMP),
    ('41000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000001', 'device-teacher-1', 'web', 'Chrome Browser', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;
