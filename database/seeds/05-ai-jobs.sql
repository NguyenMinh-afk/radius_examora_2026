-- =====================================================
-- SEED 05: AI Jobs
-- =====================================================

SET search_path = ai_db, public;

-- Insert AI generation requests
INSERT INTO ai_generation_requests (id, user_id, course_id, chapter_id, title, description, status, total_tasks, completed_tasks, total_questions_requested, total_questions_generated, difficulty, question_type, started_at, completed_at) VALUES
    ('50000000-0000-0000-0000-000000000001',
     '00000000-0000-0000-0000-000000000002',
     1, 2,
     'Generate Python Variables Questions',
     'Generate 10 questions about Python variables and data types',
     'completed', 2, 2, 10, 8, 'medium', 'multiple_choice',
     '2026-08-20 10:00:00', '2026-08-20 10:05:00'),
    ('50000000-0000-0000-0000-000000000002',
     '00000000-0000-0000-0000-000000000002',
     1, 3,
     'Generate Python Loops Questions',
     'Generate 15 questions about for and while loops',
     'completed', 3, 3, 15, 14, 'medium', 'multiple_choice',
     '2026-08-21 14:00:00', '2026-08-21 14:08:00'),
    ('50000000-0000-0000-0000-000000000003',
     '00000000-0000-0000-0000-000000000002',
     2, 10,
     'Generate Data Structures Questions',
     'Generate questions about arrays and linked lists',
     'processing', 2, 1, 20, 10, 'hard', 'multiple_choice',
     '2026-09-01 09:00:00', NULL),
    ('50000000-0000-0000-0000-000000000004',
     '00000000-0000-0000-0000-000000000003',
     10, 21,
     'Generate Calculus Derivatives Questions',
     'Generate questions about derivatives',
     'pending', 1, 0, 10, 0, 'medium', 'multiple_choice',
     NULL, NULL);

-- Insert AI generation tasks
INSERT INTO ai_generation_tasks (id, request_id, topic, num_questions, difficulty, status, started_at, completed_at) VALUES
    ('51000000-0000-0000-0000-000000000001', '50000000-0000-0000-0000-000000000001', 'Variables', 5, 'easy', 'completed', '2026-08-20 10:00:00', '2026-08-20 10:02:30'),
    ('51000000-0000-0000-0000-000000000002', '50000000-0000-0000-0000-000000000001', 'Data Types', 5, 'medium', 'completed', '2026-08-20 10:02:30', '2026-08-20 10:05:00'),
    ('51000000-0000-0000-0000-000000000003', '50000000-0000-0000-0000-000000000002', 'For Loops', 5, 'easy', 'completed', '2026-08-21 14:00:00', '2026-08-21 14:03:00'),
    ('51000000-0000-0000-0000-000000000004', '50000000-0000-0000-0000-000000000002', 'While Loops', 5, 'medium', 'completed', '2026-08-21 14:03:00', '2026-08-21 14:06:00'),
    ('51000000-0000-0000-0000-000000000005', '50000000-0000-0000-0000-000000000002', 'Loop Patterns', 5, 'hard', 'completed', '2026-08-21 14:06:00', '2026-08-21 14:08:00'),
    ('51000000-0000-0000-0000-000000000006', '50000000-0000-0000-0000-000000000003', 'Arrays', 10, 'medium', 'completed', '2026-09-01 09:00:00', '2026-09-01 09:04:00'),
    ('51000000-0000-0000-0000-000000000007', '50000000-0000-0000-0000-000000000003', 'Linked Lists', 10, 'hard', 'queued', NULL, NULL),
    ('51000000-0000-0000-0000-000000000008', '50000000-0000-0000-0000-000000000004', 'Derivatives', 10, 'medium', 'queued', NULL, NULL);

-- Insert AI generation logs
INSERT INTO ai_generation_logs (request_id, task_id, log_level, message, metadata) VALUES
    ('50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'info', 'Starting AI generation for Variables', '{"course_id": 1, "chapter_id": 2}'::jsonb),
    ('50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'info', 'Calling Gemini API', '{"model": "gemini-1.5-pro"}'::jsonb),
    ('50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000001', 'info', 'Generated 5 questions successfully', '{"questions_generated": 5}'::jsonb),
    ('50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000002', 'info', 'Starting AI generation for Data Types', '{"course_id": 1, "chapter_id": 2}'::jsonb),
    ('50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000002', 'info', 'Generated 3 questions successfully', '{"questions_generated": 3}'::jsonb),
    ('50000000-0000-0000-0000-000000000001', '51000000-0000-0000-0000-000000000002', 'warning', '2 questions filtered due to low confidence score', '{"threshold": 0.7}'::jsonb),
    ('50000000-0000-0000-0000-000000000002', '51000000-0000-0000-0000-000000000003', 'info', 'Starting AI generation for For Loops', '{"course_id": 1, "chapter_id": 3}'::jsonb),
    ('50000000-0000-0000-0000-000000000002', '51000000-0000-0000-0000-000000000003', 'info', 'Generated 5 questions successfully', '{"questions_generated": 5}'::jsonb),
    ('50000000-0000-0000-0000-000000000003', '51000000-0000-0000-0000-000000000006', 'info', 'Starting AI generation for Arrays', '{"course_id": 2, "chapter_id": 10}'::jsonb),
    ('50000000-0000-0000-0000-000000000003', '51000000-0000-0000-0000-000000000006', 'info', 'Generated 10 questions', '{"questions_generated": 10}'::jsonb);

-- Insert AI jobs
INSERT INTO ai_jobs (id, job_type, payload, status, priority, result, started_at, completed_at) VALUES
    ('52000000-0000-0000-0000-000000000001',
     'ai_generation',
     '{"request_id": "50000000-0000-0000-0000-000000000001", "task_id": "51000000-0000-0000-0000-000000000001"}'::jsonb,
     'completed', 10,
     '{"questions_generated": 5, "questions_approved": 5}'::jsonb,
     '2026-08-20 10:00:00', '2026-08-20 10:02:30'),
    ('52000000-0000-0000-0000-000000000002',
     'ai_generation',
     '{"request_id": "50000000-0000-0000-0000-000000000001", "task_id": "51000000-0000-0000-0000-000000000002"}'::jsonb,
     'completed', 10,
     '{"questions_generated": 5, "questions_approved": 3}'::jsonb,
     '2026-08-20 10:02:30', '2026-08-20 10:05:00'),
    ('52000000-0000-0000-0000-000000000003',
     'grading',
     '{"attempt_id": "60000000-0000-0000-0000-000000000001"}'::jsonb,
     'completed', 5,
     '{"score": 80, "total_questions": 10, "correct_answers": 8}'::jsonb,
     '2026-08-25 14:30:00', '2026-08-25 14:30:15'),
    ('52000000-0000-0000-0000-000000000004',
     'analytics',
     '{"user_id": "00000000-0000-0000-0000-000000000004", "period": "weekly"}'::jsonb,
     'completed', 3,
     '{"total_exams": 3, "avg_score": 75.5}'::jsonb,
     '2026-09-01 00:00:00', '2026-09-01 00:00:30');
