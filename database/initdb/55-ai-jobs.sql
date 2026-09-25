-- =====================================================
-- SEED 55: AI Jobs, Documents, Generation Requests
-- =====================================================

SET search_path = ai_db, public;

-- AI generation requests
INSERT INTO ai_generation_requests (
    id, user_id, course_id, chapter_id, knowledge_unit_id,
    difficulty, question_type, quantity, context, status, progress,
    trace_id, started_at, completed_at
) VALUES
    ('60000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 1, 2, 4,
     'medium', 'multiple_choice', 3, 'Generate basic programming questions', 'completed', 100,
     '60000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '10 minutes', CURRENT_TIMESTAMP - INTERVAL '5 minutes'),
    ('60000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000002', 22, 4, 7,
     'medium', 'multiple_choice', 5, 'Generate database questions', 'completed', 100,
     '60000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- AI generation tasks
INSERT INTO ai_generation_tasks (
    id, request_id, subject_id, topic, input_type, input_reference, number_of_questions,
    difficulty, status, created_by, created_at, completed_at
) VALUES
    ('60000000-0000-0000-0000-000000000010', '60000000-0000-0000-0000-000000000001', 1, 'Vong lap co ban', 'text',
     'Bai giang lap trinh co ban', 2, 'easy', 'completed',
     '20000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '12 minutes', CURRENT_TIMESTAMP - INTERVAL '6 minutes'),
    ('60000000-0000-0000-0000-000000000011', '60000000-0000-0000-0000-000000000002', 1, 'Database Fundamentals', 'text',
     'Chapter 1: Relational Model', 3, 'medium', 'completed',
     '20000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '2 hours', CURRENT_TIMESTAMP - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- Generated questions
INSERT INTO generated_questions (
    id, task_id, question_content, option_a, option_b, option_c, option_d,
    correct_answer, difficulty, topic, explanation, status, display_order, generation_source
) VALUES
    ('60000000-0000-0000-0000-000000000011', '60000000-0000-0000-0000-000000000010',
     'Vong lap for trong C co dang nao?',
     'for(i=0;i<5;i++)', 'while(i<5)', 'loop(i=0; i<5)', 'repeat 5 times',
     'A', 'easy', 'Vong lap co ban', 'Cau lenh for dung theo cu phap chuan.',
     'approved', 1, 'gemini'),
    ('60000000-0000-0000-0000-000000000012', '60000000-0000-0000-0000-000000000010',
     'Kieu du lieu int dung de luu gi?',
     'So nguyen', 'So thuc', 'Chuoi ky tu', 'Gia tri logic',
     'A', 'easy', 'Kieu du lieu', 'int luu so nguyen.',
     'pending_review', 2, 'gemini'),
    ('60000000-0000-0000-0000-000000000013', '60000000-0000-0000-0000-000000000011',
     'Khoa chinh trong co so du lieu quan he la gi?',
     'Tap hop cac cot danh dau tinh duy nhat cho moi ban ghi', 'Tap hop tat ca cac cot trong bang',
     'Tap hop cac khoa ngoai', 'Tap hop cac thuoc tinh co the trung nhau',
     'A', 'medium', 'Database Fundamentals', 'Khoa chinh dam bao tinh duy nhat cua ban ghi.',
     'approved', 1, 'gemini')
ON CONFLICT (id) DO NOTHING;

-- AI generation logs
INSERT INTO ai_generation_logs (
    id, request_id, question_id, ai_model, prompt, response, tokens_used, cost, status, trace_id
) VALUES
    ('60000000-0000-0000-0000-000000000002', '60000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000002',
     'gpt-4', 'Generate a loop question', 'Vòng lặp chạy 5 lần là for(i=0;i<5;i++)', 120, 0.0020, 'success', '60000000-0000-0000-0000-000000000001')
ON CONFLICT (id) DO NOTHING;

-- Documents
INSERT INTO documents (
    document_id, course_id, uploaded_by, file_name, original_filename, storage_path,
    mime_type, file_size, status, trace_id
) VALUES
    ('70000000-0000-0000-0000-000000000001', 1, '20000000-0000-0000-0000-000000000001',
     'math_ch1.pdf', 'math_ch1.pdf', '/storage/docs/math_ch1.pdf',
     'application/pdf', 1024000, 'COMPLETED', '70000000-0000-0000-0000-000000000001'),
    ('70000000-0000-0000-0000-000000000002', 22, '20000000-0000-0000-0000-000000000001',
     'database_ch1.pdf', 'Chuong1_CSDL.pdf', '/storage/docs/database_ch1.pdf',
     'application/pdf', 2048000, 'COMPLETED', '70000000-0000-0000-0000-000000000002')
ON CONFLICT (document_id) DO NOTHING;

-- AI jobs
INSERT INTO ai_jobs (
    ai_job_id, document_id, requested_by, status, retry_count, result_artifact_path, trace_id, completed_at
) VALUES
    ('70000000-0000-0000-0000-000000000002', '70000000-0000-0000-0000-000000000001',
     '20000000-0000-0000-0000-000000000001', 'COMPLETED', 0, '/storage/results/job-0001.json', '70000000-0000-0000-0000-000000000001', CURRENT_TIMESTAMP),
    ('70000000-0000-0000-0000-000000000003', '70000000-0000-0000-0000-000000000002',
     '20000000-0000-0000-0000-000000000001', 'COMPLETED', 0, '/storage/results/job-0002.json', '70000000-0000-0000-0000-000000000002', CURRENT_TIMESTAMP - INTERVAL '1 day')
ON CONFLICT (ai_job_id) DO NOTHING;

-- AI Worker: Courses and Subjects
INSERT INTO ai_db.courses (id, name) VALUES
    (1, 'Computer Science'),
    (2, 'Mathematics')
ON CONFLICT (id) DO NOTHING;

INSERT INTO ai_db.subjects (id, name, course_id) VALUES
    (1, 'Programming Basics', 1),
    (2, 'Data Structures', 1),
    (3, 'Calculus', 2)
ON CONFLICT (id) DO NOTHING;
