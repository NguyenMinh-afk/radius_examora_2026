-- Seed data for schema_optimized.sql
-- Safe to run once on empty database.

SET search_path = user_db, public;

-- Roles
INSERT INTO roles (id, name, description) VALUES
    (1, 'admin', 'System administrator'),
    (2, 'teacher', 'Teacher'),
    (3, 'student', 'Student')
ON CONFLICT (id) DO NOTHING;

-- Users
INSERT INTO users (
    id, email, phone, password_hash, full_name, role_id, is_active,
    email_verified, approval_status, approved_at, last_login
)
VALUES
    ('10000000-0000-0000-0000-000000000001', 'admin@examora.local', '0900000001', '{{ADMIN_PASSWORD_HASH}}', 'Admin User', 1, true, true, 'approved', CURRENT_TIMESTAMP, NULL),
    ('20000000-0000-0000-0000-000000000001', 'teacher1@examora.local', '0900000002', '{{TEACHER_PASSWORD_HASH}}', 'Teacher One', 2, true, true, 'approved', CURRENT_TIMESTAMP, NULL),
    ('20000000-0000-0000-0000-000000000002', 'teacher2@examora.local', '0900000003', '{{TEACHER_PASSWORD_HASH}}', 'Teacher Two', 2, true, true, 'approved', CURRENT_TIMESTAMP, NULL),
    ('30000000-0000-0000-0000-000000000001', 'student1@examora.local', '0900000004', '{{STUDENT_PASSWORD_HASH}}', 'Student One', 3, true, true, 'approved', CURRENT_TIMESTAMP, NULL),
    ('30000000-0000-0000-0000-000000000002', 'student2@examora.local', '0900000005', '{{STUDENT_PASSWORD_HASH}}', 'Student Two', 3, true, true, 'approved', CURRENT_TIMESTAMP, NULL)
ON CONFLICT (id) DO NOTHING;

-- User profiles
INSERT INTO user_profiles (id, user_id, date_of_birth, gender, school_name, class_code, student_code, teacher_code, bio)
VALUES
    ('40000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', '1988-05-20', 'male', 'Examora University', 'T1', NULL, 'TC001', 'Math teacher'),
    ('40000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', '1990-08-15', 'female', 'Examora University', 'T2', NULL, 'TC002', 'Physics teacher'),
    ('40000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', '2008-03-25', 'female', 'Examora University', 'S1', 'SV0001', NULL, 'Student profile'),
    ('40000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', '2008-07-18', 'male', 'Examora University', 'S1', 'SV0002', NULL, 'Student profile')
ON CONFLICT (id) DO NOTHING;

-- Devices + sessions (Web/Mobile)
INSERT INTO user_devices (id, user_id, device_id, platform, device_name, push_token, last_seen)
VALUES
    ('41000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'device-student-1', 'android', 'Student Phone', 'push-token-001', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO user_sessions (
    id, user_id, device_id, session_token, refresh_token,
    device_type, ip_address, user_agent,
    is_active, last_activity, created_at, updated_at, expires_at
)
VALUES
    ('42000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', '41000000-0000-0000-0000-000000000001',
     'session-token-001', 'refresh-token-001', 'mobile', '127.0.0.1', 'EPU-Mobile/1.0', true,
     CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP + INTERVAL '30 days')
ON CONFLICT (id) DO NOTHING;

-- Faculties
SET search_path = course_db, public;
INSERT INTO faculties (id, name, code)
VALUES
    (1, 'Khoa Công nghệ thông tin', 'CNTT')
ON CONFLICT (id) DO NOTHING;

-- Courses
INSERT INTO courses (id, faculty_id, name, code, description, credits, semester_type)
VALUES
    (1, 1, 'Lập trình cơ bản', '0101004548', NULL, 2, 'HK1'),
    (2, 1, 'Pháp luật đại cương', '0101002018', NULL, 2, 'HK1'),
    (3, 1, 'Toán cao cấp 1', '0101004545', NULL, 3, 'HK1'),
    (4, 1, 'Triết học Mác - Lênin', '0101003923', NULL, 3, 'HK1'),
    (5, 1, 'Vật lý đại cương', '0101003612', NULL, 3, 'HK1'),
    (6, 1, 'Xác suất thống kê', '0101003657', NULL, 2, 'HK1'),

    (7, 1, 'Đại cương về quản lý điều hành và khởi nghiệp', '0101004551', NULL, 3, 'HK2'),
    (8, 1, 'Giáo dục quốc phòng 1', '0101004342', NULL, 3, 'HK2'),
    (9, 1, 'Giáo dục quốc phòng 2', '0101004343', NULL, 2, 'HK2'),
    (10, 1, 'Giáo dục quốc phòng 3', '0101004344', NULL, 2, 'HK2'),
    (11, 1, 'Giáo dục quốc phòng 4', '0101004345', NULL, 4, 'HK2'),
    (12, 1, 'Giáo dục thể chất 1', '0101000801', NULL, 1, 'HK2'),
    (13, 1, 'Giáo dục thể chất 2', '0101000808', NULL, 1, 'HK2'),
    (14, 1, 'Giáo dục thể chất 3', '0101000813', NULL, 1, 'HK2'),
    (15, 1, 'Giáo dục thể chất 4', '0101000816', NULL, 1, 'HK2'),
    (16, 1, 'Kinh tế chính trị Mác - Lênin', '0101003925', NULL, 2, 'HK2'),
    (17, 1, 'Năng lượng cho phát triển bền vững', '0101004552', NULL, 2, 'HK2'),
    (18, 1, 'Tiếng Anh 1', '0101003137', NULL, 4, 'HK2'),
    (19, 1, 'Toán cao cấp 2', '0101004546', NULL, 3, 'HK2'),
    (20, 1, 'Toán rời rạc', '0101004205', NULL, 3, 'HK2'),

    (21, 1, 'Chủ nghĩa xã hội khoa học', '0101003926', NULL, 2, 'HK3'),
    (22, 1, 'Cơ sở dữ liệu', '0101004744', NULL, 4, 'HK3'),
    (23, 1, 'Công nghệ phần mềm', '0101000325', NULL, 2, 'HK3'),
    (24, 1, 'Kiến trúc máy tính', '0101001178', NULL, 2, 'HK3'),
    (25, 1, 'Lập trình C nâng cao', '0101004290', NULL, 3, 'HK3'),
    (26, 1, 'Mạng máy tính', '0101001640', NULL, 2, 'HK3'),
    (27, 1, 'Ngôn ngữ lập trình python', '0101003881', NULL, 2, 'HK3'),
    (28, 1, 'Tiếng Anh 2', '0101004549', NULL, 4, 'HK3'),

    (29, 1, 'Cơ sở lập trình Web', '0101004745', NULL, 3, 'HK4'),
    (30, 1, 'Công nghệ điện toán đám mây', '0101004746', NULL, 3, 'HK4'),
    (31, 1, 'Nguyên lý hệ điều hành', '0101001830', NULL, 2, 'HK4'),
    (32, 1, 'Nguyên lý lập trình hướng đối tượng', '0101001841', NULL, 2, 'HK4'),
    (33, 1, 'Nhập môn cấu trúc dữ liệu và giải thuật', '0101004291', NULL, 3, 'HK4'),
    (34, 1, 'Thiết bị mạng', '0101002563', NULL, 3, 'HK4'),
    (35, 1, 'Tiếng anh chuyên ngành CNPM', '0101004511', NULL, 3, 'HK4'),
    (36, 1, 'Tư tưởng Hồ Chí Minh', '0101003505', NULL, 2, 'HK4'),

    (37, 1, 'Cấu trúc dữ liệu và giải thuật nâng cao', '0101000146', NULL, 3, 'HK5'),
    (38, 1, 'Hệ phân tán', '0101000863', NULL, 2, 'HK5'),
    (39, 1, 'Lập trình Java', '0101001436', NULL, 3, 'HK5'),
    (40, 1, 'Lập trình .net', '0101004755', NULL, 4, 'HK5'),
    (41, 1, 'Lịch sử Đảng Cộng sản Việt Nam', '0101003928', NULL, 2, 'HK5'),
    (42, 1, 'Nhập môn An toàn và bảo mật thông tin', '0101001877', NULL, 2, 'HK5'),
    (43, 1, 'Phân tích thiết kế hướng đối tượng', '0101001995', NULL, 3, 'HK5'),

    (44, 1, 'Học máy cơ bản', '0101004750', NULL, 3, 'HK6'),
    (45, 1, 'Kiểm thử và đảm bảo chất lượng PM', '0101001132', NULL, 2, 'HK6'),
    (46, 1, 'Lập trình hệ thống', '0101001427', NULL, 2, 'HK6'),
    (47, 1, 'Lập trình trên thiết bị di động', '0101004294', NULL, 3, 'HK6'),
    (48, 1, 'Lập trình web nâng cao', '0101004754', NULL, 4, 'HK6'),
    (49, 1, 'Phần mềm mã nguồn mở', '0101001957', NULL, 2, 'HK6'),
    (50, 1, 'Quản trị dự án CNTT', '0101002234', NULL, 2, 'HK6'),
    (51, 1, 'Trí tuệ nhân tạo', '0101004758', NULL, 3, 'HK6'),

    (52, 1, 'Hệ thống IoT và ứng dụng', '0101004861', NULL, 2, 'HK7'),
    (53, 1, 'Hệ thống thông tin không gian', '0101000958', NULL, 2, 'HK7'),
    (54, 1, 'Học máy nâng cao', '0101004295', NULL, 3, 'HK7'),
    (55, 1, 'Lập trình Blockchain', '0101004753', NULL, 3, 'HK7'),
    (56, 1, 'Ngôn ngữ kịch bản', '0101004757', NULL, 3, 'HK7'),
    (57, 1, 'Nhập môn xử lý ảnh', '0101001901', NULL, 2, 'HK7'),
    (58, 1, 'Phân tích và trực quan hóa dữ liệu', '0101004759', NULL, 3, 'HK7'),
    (59, 1, 'Phát triển phần mềm web an toàn', '0101002033', NULL, 2, 'HK7'),

    (60, 1, 'Thực tập hệ thống thông tin quản lý', '0101002793', NULL, 4, 'HK8'),
    (61, 1, 'Thực tập hệ thống thông tin tích hợp', '0101002794', NULL, 4, 'HK8'),
    (62, 1, 'Thực tập quản trị dự án phần mềm', '0101002908', NULL, 4, 'HK8'),

    (63, 1, 'Đồ án tốt nghiệp', '0101004588', NULL, 8, 'HK9'),
    (64, 1, 'Thực tập tốt nghiệp', '0101004569', NULL, 4, 'HK9')
ON CONFLICT (id) DO NOTHING;

-- Chapters
SET search_path = course_db, public;
INSERT INTO chapters (id, course_id, year_level, chapter_number, name, description)
VALUES
    (1, 1, 'Year 1', 1, 'Nhập môn lập trình', 'Biến, kiểu dữ liệu và cú pháp cơ bản'),
    (2, 1, 'Year 1', 2, 'Cấu trúc điều khiển', 'Rẽ nhánh và vòng lặp'),
    (3, 22, 'Year 2', 1, 'Mô hình quan hệ', 'Khái niệm bảng, khóa và ràng buộc')
ON CONFLICT (id) DO NOTHING;

-- Knowledge units
SET search_path = course_db, public;
INSERT INTO knowledge_units (id, chapter_id, name, description)
VALUES
    (1, 1, 'Biến và kiểu dữ liệu', 'Kiểu số nguyên, số thực và chuỗi'),
    (2, 2, 'Vòng lặp', 'Vòng lặp for/while cơ bản'),
    (3, 3, 'Khóa chính', 'Khóa chính và ràng buộc toàn vẹn')
ON CONFLICT (id) DO NOTHING;

-- Question tags
SET search_path = question_db, public;
INSERT INTO question_tags (id, name, category, updated_at)
VALUES
    (1, 'algebra', 'math', CURRENT_TIMESTAMP),
    (2, 'calculus', 'math', CURRENT_TIMESTAMP),
    (3, 'basics', 'cs', CURRENT_TIMESTAMP),
    (4, 'loops', 'cs', CURRENT_TIMESTAMP),
    (5, 'database', 'cs', CURRENT_TIMESTAMP),
    (6, 'network', 'cs', CURRENT_TIMESTAMP),
    (7, 'web', 'cs', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

-- Questions
SET search_path = question_db, public;
INSERT INTO questions (
    id, course_id, chapter_id, knowledge_unit_id, created_by,
    question_type, difficulty, content, options, correct_answer,
    explanation, points, time_limit, keywords, is_ai_generated, ai_model
) VALUES
    (
        '50000000-0000-0000-0000-000000000001', 1, 1, 1, '20000000-0000-0000-0000-000000000001',
        'multiple_choice', 'easy',
        'Trong C, kiểu dữ liệu int dùng để lưu gì?',
        '[{"key":"A","text":"Số nguyên","is_correct":true},{"key":"B","text":"Chuỗi ký tự","is_correct":false},{"key":"C","text":"Số thực","is_correct":false},{"key":"D","text":"Giá trị logic","is_correct":false}]',
        'A',
        'int dùng để lưu số nguyên.',
        1.0, 60, ARRAY['c','basic'], false, NULL
    ),
    (
        '50000000-0000-0000-0000-000000000002', 1, 2, 2, '20000000-0000-0000-0000-000000000001',
        'multiple_choice', 'medium',
        'Vòng lặp nào chạy đúng 5 lần?',
        '[{"key":"A","text":"for(i=0;i<5;i++)","is_correct":true},{"key":"B","text":"for(i=1;i<=5;i++)","is_correct":true},{"key":"C","text":"while(i<5) with i starting 1","is_correct":false},{"key":"D","text":"for(i=0;i<=5;i++)","is_correct":false}]',
        'A',
        'Biến i chạy từ 0 đến 4 là 5 lần lặp.',
        1.0, 60, ARRAY['loop'], true, 'gpt-4'
    ),
    (
        '50000000-0000-0000-0000-000000000003', 22, 3, 3, '20000000-0000-0000-0000-000000000002',
        'true_false', 'easy',
        'Khóa chính giúp định danh duy nhất một bản ghi trong bảng.',
        '[{"key":"A","text":"Đúng","is_correct":true},{"key":"B","text":"Sai","is_correct":false}]',
        'A',
        'Khóa chính đảm bảo tính duy nhất.',
        1.0, 45, ARRAY['database'], false, NULL
    )
ON CONFLICT (id) DO NOTHING;

-- Question tag relations
SET search_path = question_db, public;
INSERT INTO question_tag_relations (question_id, tag_id)
VALUES
    ('50000000-0000-0000-0000-000000000001', 2),
    ('50000000-0000-0000-0000-000000000002', 2),
    ('50000000-0000-0000-0000-000000000003', 3)
ON CONFLICT DO NOTHING;

-- AI generation request + task + log (requests MUST come first due to FK)
SET search_path = ai_db, public;
INSERT INTO ai_generation_requests (
    id, user_id, course_id, chapter_id, knowledge_unit_id,
    difficulty, question_type, quantity, context, status, progress,
    trace_id, started_at, completed_at
) VALUES
    (
        '60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 2, 2,
        'medium', 'multiple_choice', 3, 'Generate basic programming questions', 'completed', 100,
        'trace-ai-0001', CURRENT_TIMESTAMP - INTERVAL '10 minutes', CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_generation_tasks (
    id, request_id, subject_id, topic, input_type, input_reference, number_of_questions,
    difficulty, status, created_by, created_at, completed_at
) VALUES
    (
        '60000000-0000-0000-0000-000000000010', '60000000-0000-0000-0000-000000000001', 1, 'Vong lap co ban', 'text',
        'Bai giang lap trinh co ban', 2, 'easy', 'completed',
        '20000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '12 minutes',
        CURRENT_TIMESTAMP - INTERVAL '6 minutes'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_generation_logs (
    id, request_id, question_id, ai_model, prompt, response, tokens_used, cost, status, trace_id
) VALUES
    (
        '60000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002',
        'gpt-4', 'Generate a loop question', 'Vòng lặp chạy 5 lần là for(i=0;i<5;i++)', 120, 0.0020, 'success', 'trace-ai-0001'
    )
ON CONFLICT (id) DO NOTHING;

INSERT INTO generated_questions (
    id, task_id, question_content, option_a, option_b, option_c, option_d,
    correct_answer, difficulty, topic, explanation, status, created_at
) VALUES
    (
        '60000000-0000-0000-0000-000000000011', '60000000-0000-0000-0000-000000000010',
        'Vong lap for trong C co dang nao?',
        'for(i=0;i<5;i++)', 'while(i<5)', 'loop(i=0; i<5)', 'repeat 5 times',
        'A', 'easy', 'Vong lap co ban', 'Cau lenh for dung theo cu phap chuan.',
        'approved', CURRENT_TIMESTAMP - INTERVAL '5 minutes'
    ),
    (
        '60000000-0000-0000-0000-000000000012', '60000000-0000-0000-0000-000000000010',
        'Kieu du lieu int dung de luu gi?',
        'So nguyen', 'So thuc', 'Chuoi ky tu', 'Gia tri logic',
        'A', 'easy', 'Kieu du lieu', 'int luu so nguyen.',
        'pending_review', CURRENT_TIMESTAMP - INTERVAL '4 minutes'
    )
ON CONFLICT (id) DO NOTHING;

-- Documents + AI jobs
SET search_path = ai_db, public;
INSERT INTO documents (
    document_id, course_id, uploaded_by, file_name, original_filename, storage_path,
    status, trace_id
) VALUES
    ('70000000-0000-0000-0000-000000000001', 1, '20000000-0000-0000-0000-000000000001',
     'math_ch1.pdf', 'math_ch1.pdf', '/storage/docs/math_ch1.pdf', 'COMPLETED', 'trace-doc-0001')
ON CONFLICT (document_id) DO NOTHING;

INSERT INTO ai_jobs (
    ai_job_id, document_id, requested_by, status, retry_count, result_artifact_path, trace_id, completed_at
) VALUES
    ('70000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001', 'COMPLETED', 0, '/storage/results/job-0001.json', 'trace-doc-0001', CURRENT_TIMESTAMP)
ON CONFLICT (ai_job_id) DO NOTHING;

-- RabbitMQ outbox and tracking
SET search_path = infra_eventing, public;
INSERT INTO outbox_events (
    outbox_event_id, aggregate_type, aggregate_id, event_type, exchange_name, routing_key,
    message_id, payload, status, retry_count, trace_id
) VALUES
    ('80000000-0000-0000-0000-000000000001', 'ai_job', '70000000-0000-0000-0000-000000000002',
     'AI_JOB_COMPLETED', 'examora.exchange', 'ai.job.completed', 'msg-0001',
     '{"jobId":"70000000-0000-0000-0000-000000000002","status":"COMPLETED"}', 'PUBLISHED', 0, 'trace-doc-0001')
ON CONFLICT (outbox_event_id) DO NOTHING;

INSERT INTO processed_messages (
    processed_message_id, outbox_event_id, consumer_name, message_id
) VALUES
    ('80000000-0000-0000-0000-000000000002', '80000000-0000-0000-0000-000000000001', 'ai-consumer', 'msg-0001')
ON CONFLICT (processed_message_id) DO NOTHING;

-- Queue jobs
SET search_path = infra_eventing, public;
INSERT INTO queue_jobs (
    id, job_type, queue_name, payload, status, attempts, max_attempts,
    user_id, related_id, trace_id
) VALUES
    ('80000000-0000-0000-0000-000000000003', 'ai_generation', 'ai.jobs', '{"requestId":"60000000-0000-0000-0000-000000000001"}',
     'completed', 1, 3, '20000000-0000-0000-0000-000000000001', '60000000-0000-0000-0000-000000000001', 'trace-ai-0001')
ON CONFLICT (id) DO NOTHING;

-- Notifications + email
SET search_path = notification_db, public;
INSERT INTO notifications (
    id, user_id, type, title, message, is_read, read_at
) VALUES
    ('90000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'assignment',
     'New Exam Assigned', 'You have a new exam assigned.', false, NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO email_templates (
    id, template_key, template_name, subject, html_body, text_body, variables, language, is_active, created_by
) VALUES
    (1, 'exam_assigned', 'Exam Assigned', 'New exam assigned',
     '<p>You have a new exam.</p>', 'You have a new exam.', '{"vars":["examTitle"]}', 'en', true, '10000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

INSERT INTO email_logs (
    id, to_email, to_user_id, template_key, subject, body, status, sent_at, provider, message_id
) VALUES
    ('90000000-0000-0000-0000-000000000002', 'student1@examora.local', '30000000-0000-0000-0000-000000000001',
     'exam_assigned', 'New exam assigned', 'You have a new exam.', 'sent', CURRENT_TIMESTAMP, 'smtp', 'mail-0001')
ON CONFLICT (id) DO NOTHING;

-- Audit + test + system event logs
SET search_path = infra_observability, public;
INSERT INTO audit_logs (id, actor_id, action, entity_type, entity_id, metadata, ip_address, user_agent)
VALUES
    ('91000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'create', 'question',
     '50000000-0000-0000-0000-000000000001', '{"source":"seed"}', '127.0.0.1', 'seed-script')
ON CONFLICT (id) DO NOTHING;

INSERT INTO test_runs (id, run_name, run_type, status, started_at, finished_at, summary)
VALUES
    ('91000000-0000-0000-0000-000000000002', 'Seed validation', 'integration', 'passed',
     CURRENT_TIMESTAMP - INTERVAL '5 minutes', CURRENT_TIMESTAMP, 'Seed data validated')
ON CONFLICT (id) DO NOTHING;

INSERT INTO system_events (id, event_type, source, aggregate_id, payload, status, trace_id)
VALUES
    ('91000000-0000-0000-0000-000000000003', 'AI_JOB_COMPLETED', 'ai-service',
     '70000000-0000-0000-0000-000000000002', '{"status":"COMPLETED"}', 'processed', 'trace-doc-0001')
ON CONFLICT (id) DO NOTHING;

-- Exams and assignments
SET search_path = exam_db, public;
INSERT INTO exams (
    id, created_by, title, description, course_id, year_level, exam_type, duration, total_points, passing_score, is_public
) VALUES
    ('A0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
     'Calculus Quiz 1', 'Limits and derivatives', 1, 'Year 1', 'quiz', 30, 10, 5, false)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_questions (
    id, exam_id, question_id, question_order, points
) VALUES
    ('A0000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 1, 1),
    ('A0000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002', 2, 1)
ON CONFLICT (id) DO NOTHING;

INSERT INTO classes (
    id, teacher_id, name, class_code, course_id, year_level, academic_year, semester, is_active
) VALUES
    ('B0000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001',
     'Calculus Class A', 'CAL-A', 1, 'Year 1', '2025-2026', 'HK1', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO class_members (
    id, class_id, user_id, role, status, joined_at
) VALUES
    ('B0000000-0000-0000-0000-000000000002', 'B0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'student', 'active', CURRENT_TIMESTAMP),
    ('B0000000-0000-0000-0000-000000000003', 'B0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000002', 'student', 'active', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_assignments (
    id, exam_id, class_id, assigned_by, title, instructions, start_time, end_time, max_attempts,
    shuffle_questions, shuffle_answers, show_result, show_answer, is_active, trace_id
) VALUES
    ('C0000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001', 'B0000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001', 'Calculus Quiz 1', 'Complete within 30 minutes',
     CURRENT_TIMESTAMP - INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day', 1,
     false, false, true, false, true, 'trace-exam-0001')
ON CONFLICT (id) DO NOTHING;

-- Student assignments (exam_db)
SET search_path = exam_db, public;
INSERT INTO student_assignments (id, assignment_id, student_id, status, attempts_used)
VALUES
    ('C0000000-0000-0000-0000-000000000002', 'C0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'assigned', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO attempts (
    attempt_id, exam_id, student_id, assignment_id, attempt_number, started_at, ended_at, submitted_at,
    time_taken, status, score, percentage, correct_answers, wrong_answers, graded_at, trace_id
) VALUES
    ('D0000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001',
     '30000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000001',
     1, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '30 minutes',
     CURRENT_TIMESTAMP - INTERVAL '30 minutes', 30, 'graded', 8.0, 80.0, 2, 0,
     CURRENT_TIMESTAMP - INTERVAL '29 minutes', 'trace-exam-0001')
ON CONFLICT (attempt_id) DO NOTHING;

INSERT INTO attempt_answers (
    id, attempt_id, question_id, selected_answer, is_correct, points_earned, time_spent
) VALUES
    ('D0000000-0000-0000-0000-000000000002', 'D0000000-0000-0000-0000-000000000001',
     '50000000-0000-0000-0000-000000000001', '"A"', true, 1.0, 30),
    ('D0000000-0000-0000-0000-000000000003', 'D0000000-0000-0000-0000-000000000001',
     '50000000-0000-0000-0000-000000000002', '"A"', true, 1.0, 40)
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- SEED DATA BỔ SUNG CHO STUDENT MODULE
-- Thêm classes cho student test
-- =====================================================
INSERT INTO classes (id, teacher_id, name, class_code, course_id, year_level, academic_year, semester, is_active)
VALUES
    ('B0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
     'Cơ sở dữ liệu - D22CQCN01', 'CSDL-D22-01', 22, 'Year 2', '2025-2026', 'HK1', true),
    ('B0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002',
     'Phát triển Web - D22WEB01', 'WEB-D22-01', 29, 'Year 2', '2025-2026', 'HK1', true),
    ('B0000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001',
     'Mạng máy tính - D22MMT01', 'MMT-D22-01', 26, 'Year 2', '2025-2026', 'HK1', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO class_members (id, class_id, user_id, role, status, joined_at)
VALUES
    ('B1000000-0000-0000-0000-000000000001', 'B0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'student', 'active', CURRENT_TIMESTAMP),
    ('B1000000-0000-0000-0000-000000000002', 'B0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'student', 'active', CURRENT_TIMESTAMP),
    ('B1000000-0000-0000-0000-000000000003', 'B0000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'student', 'active', CURRENT_TIMESTAMP),
    ('B1000000-0000-0000-0000-000000000004', 'B0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', 'student', 'pending', CURRENT_TIMESTAMP)
ON CONFLICT (id) DO NOTHING;

INSERT INTO exam_assignments (id, exam_id, class_id, assigned_by, title, instructions, start_time, end_time, max_attempts, shuffle_questions, shuffle_answers, show_result, show_answer, is_active, trace_id)
VALUES
    ('C0000000-0000-0000-0000-000000000002', 'A0000000-0000-0000-0000-000000000001',
     'B0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
     'Quiz Chương 3 - Cơ sở dữ liệu', 'Đọc kỹ đề trước khi làm. Thời gian 60 phút.',
     CURRENT_TIMESTAMP + INTERVAL '1 day', CURRENT_TIMESTAMP + INTERVAL '1 day' + INTERVAL '1 hour', 2,
     false, false, true, false, true, 'trace-exam-0002'),
    ('C0000000-0000-0000-0000-000000000003', 'A0000000-0000-0000-0000-000000000001',
     'B0000000-0000-0000-0000-000000000003', '20000000-0000-0000-0000-000000000002',
     'Quiz React nâng cao', 'Mỗi câu chỉ chọn 1 đáp án. Thời gian 30 phút.',
     CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP + INTERVAL '12 hours', 1,
     true, true, false, false, true, 'trace-exam-0003'),
    ('C0000000-0000-0000-0000-000000000004', 'A0000000-0000-0000-0000-000000000001',
     'B0000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001',
     'Kiểm tra Chương 2 - Cơ sở dữ liệu', 'Làm bài trong 45 phút. Không được sử dụng tài liệu.',
     CURRENT_TIMESTAMP - INTERVAL '3 days', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '45 minutes', 1,
     false, false, true, true, true, 'trace-exam-0004'),
    ('C0000000-0000-0000-0000-000000000005', 'A0000000-0000-0000-0000-000000000001',
     'B0000000-0000-0000-0000-000000000004', '20000000-0000-0000-0000-000000000001',
     'Quiz Mạng LAN', 'Ôn tập chương 4 về mạng LAN.',
     CURRENT_TIMESTAMP - INTERVAL '7 days', CURRENT_TIMESTAMP - INTERVAL '7 days' + INTERVAL '30 minutes', 3,
     true, false, true, false, true, 'trace-exam-0005')
ON CONFLICT (id) DO NOTHING;

INSERT INTO student_assignments (id, assignment_id, student_id, status, attempts_used)
VALUES
    ('EA000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'assigned', 0),
    ('EA000000-0000-0000-0000-000000000002', 'C0000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'assigned', 0),
    ('EA000000-0000-0000-0000-000000000003', 'C0000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'assigned', 0),
    ('EA000000-0000-0000-0000-000000000004', 'C0000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'assigned', 0)
ON CONFLICT (id) DO NOTHING;

INSERT INTO attempts (attempt_id, exam_id, student_id, assignment_id, attempt_number, started_at, ended_at, submitted_at, time_taken, status, score, percentage, correct_answers, wrong_answers, graded_at)
VALUES
    ('EB000000-0000-0000-0000-000000000001', 'A0000000-0000-0000-0000-000000000001',
     '30000000-0000-0000-0000-000000000001', 'C0000000-0000-0000-0000-000000000004',
     2, CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '8 hours', CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '8 hours' + INTERVAL '45 minutes',
     CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '8 hours' + INTERVAL '45 minutes',
     45, 'graded', 8.5, 85.0, 17, 3, CURRENT_TIMESTAMP - INTERVAL '3 days' + INTERVAL '8 hours' + INTERVAL '46 minutes')
ON CONFLICT (attempt_id) DO NOTHING;

INSERT INTO attempt_answers (id, attempt_id, question_id, selected_answer, is_correct, points_earned, time_spent)
VALUES
    ('EC000000-0000-0000-0000-000000000001', 'EB000000-0000-0000-0000-000000000001',
     '50000000-0000-0000-0000-000000000001', '"A"', true, 1.0, 20),
    ('EC000000-0000-0000-0000-000000000002', 'EB000000-0000-0000-0000-000000000001',
     '50000000-0000-0000-0000-000000000002', '"A"', true, 1.0, 25)
ON CONFLICT (id) DO NOTHING;

SET search_path = notification_db, public;
INSERT INTO notifications (id, user_id, type, title, message, action_url, is_read, created_at)
VALUES
    ('EE000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'assignment',
     'Bài thi mới được giao', 'Bài thi "Quiz Chương 3 - Cơ sở dữ liệu" đã được mở. Bạn có thể vào làm bài từ bây giờ.',
     '/student/assignments/EA000000-0000-0000-0000-000000000001', false, CURRENT_TIMESTAMP - INTERVAL '1 hour'),
    ('ED000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'grade',
     'Kết quả đã được công bố', 'Kết quả bài thi "Kiểm tra Chương 2" đã được công bố. Điểm của bạn: 8.5/10.',
     '/student/results/EB000000-0000-0000-0000-000000000001', false, CURRENT_TIMESTAMP - INTERVAL '1 day'),
    ('ED000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'system',
     'Nhắc nhở: Bài thi sắp đóng', 'Bài thi "Quiz React nâng cao" sẽ đóng sau 12 giờ nữa. Hãy hoàn thành bài thi kịp thời.',
     '/student/assignments/EA000000-0000-0000-0000-000000000002', true, CURRENT_TIMESTAMP - INTERVAL '2 days'),
    ('EF000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'assignment',
     'Bạn đã được thêm vào lớp mới', 'Bạn đã được thêm vào lớp "Mạng máy tính - D22MMT01". Giảng viên: Lê Văn C.',
     '/student/classes/B0000000-0000-0000-0000-000000000004', true, CURRENT_TIMESTAMP - INTERVAL '3 days'),
    ('F0000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'verification',
     'Xác minh email thành công', 'Email của bạn đã được xác minh thành công. Cảm ơn bạn đã đăng ký!',
     NULL, true, CURRENT_TIMESTAMP - INTERVAL '7 days')
ON CONFLICT (id) DO NOTHING;

SET search_path = exam_db, public;
UPDATE student_assignments
SET status = 'submitted'
WHERE id = 'EA000000-0000-0000-0000-000000000003';

-- =====================================================
-- SEED DATA CHO CLASS POSTS (THÔNG BÁO LỚP HỌC)
-- =====================================================

INSERT INTO class_posts (
    id, class_id, author_id, title, content, type, is_pinned, attachments, created_at
) VALUES
    (
        'F0000000-0000-0000-0000-000000000001',
        'B0000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Chào mừng các bạn đến với lớp Calculus Class A!',
        'Chào mừng các bạn sinh viên đã tham gia lớp học. Chúng ta sẽ bắt đầu học về giới hạn và đạo hàm trong tuần này.',
        'announcement',
        true,
        '[]',
        CURRENT_TIMESTAMP - INTERVAL '5 days'
    ),
    (
        'F0000000-0000-0000-0000-000000000002',
        'B0000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Bài giảng Chương 1 - Giới hạn',
        'Đây là tài liệu bài giảng về giới hạn hàm số. Các bạn đọc trước và chuẩn bị câu hỏi cho buổi seminar tuần sau.',
        'material',
        false,
        '[{"name":"Chuong1_GioiHan.pdf","url":"/materials/chuong1.pdf","type":"pdf"}]',
        CURRENT_TIMESTAMP - INTERVAL '3 days'
    ),
    (
        'F0000000-0000-0000-0000-000000000003',
        'B0000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000001',
        'Nhắc nhở: Quiz sắp diễn ra',
        'Nhắc nhở các bạn rằng quiz Chương 3 sẽ diễn ra vào ngày mai. Hãy ôn tập kỹ các kiến thức về mô hình quan hệ.',
        'assignment',
        true,
        '[]',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        'F0000000-0000-0000-0000-000000000004',
        'B0000000-0000-0000-0000-000000000003',
        '20000000-0000-0000-0000-000000000002',
        'Cài đặt môi trường React',
        'Trước buổi học React nâng cao, hãy cài đặt Node.js và create-react-app để chuẩn bị code theo.',
        'material',
        false,
        '[{"name":"Setup_Guide.pdf","url":"/materials/react-setup.pdf","type":"pdf"}]',
        CURRENT_TIMESTAMP - INTERVAL '2 days'
    ),
    (
        'F0000000-0000-0000-0000-000000000005',
        'B0000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'Câu hỏi thảo luận về đạo hàm',
        'Có bạn nào thắc mắc về cách tính đạo hàm của hàm hợp không? Để lại câu hỏi ở đây để cả lớp cùng thảo luận nhé!',
        'question',
        false,
        '[]',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    )
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- THÔNG BÁO CHO STUDENT 2 (pending membership)
-- =====================================================

INSERT INTO class_posts (
    id, class_id, author_id, title, content, type, is_pinned, attachments
) VALUES
    (
        'F0000000-0000-0000-0000-000000000006',
        'B0000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000001',
        'Yêu cầu tham gia lớp đang chờ duyệt',
        'Bạn đã yêu cầu tham gia lớp Cơ sở dữ liệu. Vui lòng chờ giảng viên duyệt.',
        'announcement',
        false,
        '[]'
    )
ON CONFLICT (id) DO NOTHING;
