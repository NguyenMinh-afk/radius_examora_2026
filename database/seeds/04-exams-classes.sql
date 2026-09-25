-- =====================================================
-- SEED 04: Exams, Classes, Assignments, Attempts
-- =====================================================

SET search_path = exam_db, public;

-- Classes
INSERT INTO classes (id, teacher_id, course_id, name, class_code, year_level, semester, academic_year, is_active)
VALUES
    ('B0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1,
     'Calculus Class A', 'CAL-A', 1, 'HK1', '2025-2026', true),
    ('B0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 22,
     'Cơ sở dữ liệu - D22CQCN01', 'CSDL-D22-01', 2, 'HK1', '2025-2026', true),
    ('B0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002', 29,
     'Phát triển Web - D22WEB01', 'WEB-D22-01', 2, 'HK1', '2025-2026', true),
    ('B0000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001', 26,
     'Mạng máy tính - D22MMT01', 'MMT-D22-01', 2, 'HK1', '2025-2026', true)
ON CONFLICT (id) DO NOTHING;

-- Class members
INSERT INTO class_members (id, class_id, user_id, role, status, joined_at)
VALUES
    ('B1000000-0000-0000-0000-000000000001', 'B0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'student', 'active', CURRENT_TIMESTAMP),
    ('B1000000-0000-0000-0000-000000000002', 'B0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'student', 'active', CURRENT_TIMESTAMP),
    ('B1000000-0000-0000-0000-000000000003', 'B0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'student', 'active', CURRENT_TIMESTAMP),
    ('B1000000-0000-0000-0000-000000000004', 'B0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'student', 'active', CURRENT_TIMESTAMP),
    ('B1000000-0000-0000-0000-000000000005', 'B0000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'student', 'active', CURRENT_TIMESTAMP),
    ('B1000000-0000-0000-0000-000000000006', 'B0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'student', 'pending', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Exams
INSERT INTO exams (id, course_id, created_by, title, description, exam_type, difficulty, duration_minutes, total_questions, total_score, passing_score, is_active)
VALUES
    ('A0000000-0000-0000-0000-000000000001', 1, '20000000-0000-0000-0000-000000000001',
     'Calculus Quiz 1', 'Limits and derivatives', 'quiz', 'easy', 30, 2, 10.0, 5.0, true)
ON CONFLICT (id) DO NOTHING;

-- Exam questions
INSERT INTO exam_questions (id, exam_id, question_id, question_order, points)
VALUES
    ('A0000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 1, 5.0),
    ('A0000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 2, 5.0)
ON CONFLICT (id) DO NOTHING;

-- Exam assignments
INSERT INTO exam_assignments (id, exam_id, class_id, assigned_by, title, instructions, start_time, end_time, is_active)
VALUES
    ('C0000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001', 'B0000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001', 'Calculus Quiz 1', 'Complete within 30 minutes',
     CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day', true),
    ('C0000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000001', 'B0000000-0000-0000-0000-000000000002',
     '20000000-0000-0000-0000-000000000001', 'Quiz Chương 3 - Cơ sở dữ liệu', 'Đọc kỹ đề trước khi làm',
     CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '2 days', true),
    ('C0000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000001', 'B0000000-0000-0000-0000-000000000003',
     '20000000-0000-0000-0000-000000000002', 'Quiz React nâng cao', 'Mỗi câu chỉ chọn 1 đáp án',
     CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '12 hours', true)
ON CONFLICT (id) DO NOTHING;

-- Student assignments
INSERT INTO student_assignments (id, assignment_id, student_id, status)
VALUES
    ('EA000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'assigned'),
    ('EA000000-0000-0000-0000-000000000002', 'C0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'assigned'),
    ('EA000000-0000-0000-0000-000000000003', 'C0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'assigned'),
    ('EA000000-0000-0000-0000-000000000004', 'C0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'in_progress')
ON CONFLICT (id) DO NOTHING;

-- Attempts
INSERT INTO attempts (attempt_id, exam_id, student_id, assignment_id, attempt_number, status, score, time_spent_seconds, started_at, submitted_at, graded_at)
VALUES
    ('EB000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001',
     '30000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
     1, 'graded', 8.0, 1800, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '30 minutes', CURRENT_TIMESTAMP - INTERVAL '29 minutes')
ON CONFLICT (attempt_id) DO NOTHING;

-- Attempt answers
INSERT INTO attempt_answers (id, attempt_id, question_id, question_order, answer, is_correct, points_earned, time_spent_seconds)
VALUES
    ('EC000000-0000-0000-0000-000000000001', 'EB000000-0000-0000-0000-000000000001',
     '50000000-0000-0000-0000-000000000001', 1, 'A', true, 5.0, 30),
    ('EC000000-0000-0000-0000-000000000002', 'EB000000-0000-0000-0000-000000000001',
     '50000000-0000-0000-0000-000000000002', 2, 'A', true, 5.0, 40)
ON CONFLICT (id) DO NOTHING;

-- Class posts
INSERT INTO class_posts (id, class_id, author_id, post_type, title, content, is_pinned, attachments)
VALUES
    ('F0000000-0000-0000-0000-000000000001', 'B0000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001', 'announcement', 'Chào mừng các bạn đến với lớp Calculus Class A!',
     'Chào mừng các bạn sinh viên đã tham gia lớp học.', true, '[]'::jsonb),
    ('F0000000-0000-0000-0000-000000000002', 'B0000000-0000-0000-0000-000000000002',
     '20000000-0000-0000-0000-000000000001', 'announcement', 'Nhắc nhở: Quiz sắp diễn ra',
     'Quiz Chương 3 sẽ diễn ra vào ngày mai.', true, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;
