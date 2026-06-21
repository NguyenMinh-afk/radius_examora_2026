-- =====================================================
-- ADMIN DEMO SEED
-- Safe to run multiple times. Designed for Admin dashboard demos.
-- =====================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Roles and demo users
SET search_path = user_db, public;

INSERT INTO roles (id, name, description)
VALUES
    (1, 'admin', 'System administrator'),
    (2, 'teacher', 'Teacher account'),
    (3, 'student', 'Student account')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO users (
    id, email, phone, password_hash, full_name, role_id, is_active,
    email_verified, phone_verified, approval_status, approved_at, last_login
) VALUES
    (
        '10000000-0000-0000-0000-000000000001',
        'admin@examora.local',
        '0900000001',
        '$2b$10$06BFfWLZ4S5GBabnh/u.euG3eAiZQteJjjp.VNxxfYy1r63zCe5Pa',
        'Admin User',
        1,
        true,
        true,
        true,
        'approved',
        CURRENT_TIMESTAMP - INTERVAL '14 days',
        CURRENT_TIMESTAMP - INTERVAL '20 minutes'
    ),
    (
        '20000000-0000-0000-0000-000000000001',
        'teacher.demo@examora.local',
        '0900000101',
        '$2b$10$06BFfWLZ4S5GBabnh/u.euG3eAiZQteJjjp.VNxxfYy1r63zCe5Pa',
        'Teacher Demo',
        2,
        true,
        true,
        true,
        'approved',
        CURRENT_TIMESTAMP - INTERVAL '10 days',
        CURRENT_TIMESTAMP - INTERVAL '2 hours'
    ),
    (
        '30000000-0000-0000-0000-000000000001',
        'student.demo@examora.local',
        '0900000201',
        '$2b$10$06BFfWLZ4S5GBabnh/u.euG3eAiZQteJjjp.VNxxfYy1r63zCe5Pa',
        'Student Demo',
        3,
        true,
        true,
        true,
        'approved',
        CURRENT_TIMESTAMP - INTERVAL '8 days',
        CURRENT_TIMESTAMP - INTERVAL '1 day'
    ),
    (
        '30000000-0000-0000-0000-000000000002',
        'locked.student@examora.local',
        '0900000202',
        '$2b$10$06BFfWLZ4S5GBabnh/u.euG3eAiZQteJjjp.VNxxfYy1r63zCe5Pa',
        'Locked Student',
        3,
        false,
        true,
        false,
        'pending',
        NULL,
        NULL
    )
ON CONFLICT (id) DO UPDATE
SET email = EXCLUDED.email,
    phone = EXCLUDED.phone,
    full_name = EXCLUDED.full_name,
    role_id = EXCLUDED.role_id,
    is_active = EXCLUDED.is_active,
    email_verified = EXCLUDED.email_verified,
    phone_verified = EXCLUDED.phone_verified,
    approval_status = EXCLUDED.approval_status,
    approved_at = EXCLUDED.approved_at,
    last_login = EXCLUDED.last_login,
    updated_at = CURRENT_TIMESTAMP;

-- Demo courses
SET search_path = course_db, public;

INSERT INTO faculties (id, name, code)
VALUES (1, 'Information Systems', 'IS')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    code = EXCLUDED.code;

INSERT INTO courses (id, faculty_id, name, code, description, credits, semester_type, is_active)
VALUES
    (101, 1, 'Programming Fundamentals', 'DEMO-CS101', 'Core programming concepts for first year students.', 3, 'HK1', true),
    (102, 1, 'Database Systems', 'DEMO-DB201', 'Relational database design and SQL fundamentals.', 3, 'HK2', true),
    (103, 1, 'Distributed Systems', 'DEMO-DS301', 'Microservices, queues, and event-driven system design.', 3, 'HK5', false)
ON CONFLICT (id) DO UPDATE
SET faculty_id = EXCLUDED.faculty_id,
    name = EXCLUDED.name,
    code = EXCLUDED.code,
    description = EXCLUDED.description,
    credits = EXCLUDED.credits,
    semester_type = EXCLUDED.semester_type,
    is_active = EXCLUDED.is_active;

INSERT INTO chapters (id, course_id, year_level, chapter_number, name, description)
VALUES
    (101, 101, 'Year 1', 1, 'Data Types', 'Primitive data types and variables'),
    (102, 102, 'Year 2', 1, 'Relational Model', 'Tables, keys, and constraints')
ON CONFLICT (id) DO UPDATE
SET course_id = EXCLUDED.course_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description;

INSERT INTO knowledge_units (id, chapter_id, name, description)
VALUES
    (101, 101, 'Integer Type', 'Use integer types for whole numbers'),
    (102, 102, 'Primary Key', 'Unique identifier for table records')
ON CONFLICT (id) DO UPDATE
SET chapter_id = EXCLUDED.chapter_id,
    name = EXCLUDED.name,
    description = EXCLUDED.description;

-- Demo questions
SET search_path = question_db, public;

INSERT INTO questions (
    id, course_id, chapter_id, knowledge_unit_id, created_by,
    question_type, difficulty, content, options, correct_answer,
    explanation, points, time_limit, keywords, is_ai_generated, ai_model,
    is_active, is_public
) VALUES
    (
        '51000000-0000-0000-0000-000000000001',
        101,
        101,
        101,
        '20000000-0000-0000-0000-000000000001',
        'multiple_choice',
        'easy',
        'Which C data type is commonly used to store whole numbers?',
        '[{"key":"A","text":"int","is_correct":true},{"key":"B","text":"float","is_correct":false},{"key":"C","text":"char[]","is_correct":false},{"key":"D","text":"bool","is_correct":false}]',
        'A',
        'The int type stores integer values.',
        1.0,
        60,
        ARRAY['c','data-type'],
        false,
        NULL,
        true,
        true
    ),
    (
        '51000000-0000-0000-0000-000000000002',
        102,
        102,
        102,
        '20000000-0000-0000-0000-000000000001',
        'true_false',
        'medium',
        'A primary key uniquely identifies each record in a relational table.',
        '[{"key":"A","text":"True","is_correct":true},{"key":"B","text":"False","is_correct":false}]',
        'A',
        'A primary key enforces uniqueness for table records.',
        1.0,
        45,
        ARRAY['database','primary-key'],
        true,
        'gpt-4-proctor-v2',
        true,
        true
    ),
    (
        '51000000-0000-0000-0000-000000000003',
        103,
        NULL,
        NULL,
        '20000000-0000-0000-0000-000000000001',
        'multiple_choice',
        'hard',
        'Which RabbitMQ concept routes messages from producers to queues?',
        '[{"key":"A","text":"Exchange","is_correct":true},{"key":"B","text":"Consumer tag","is_correct":false},{"key":"C","text":"Acknowledgement","is_correct":false},{"key":"D","text":"Virtual host user","is_correct":false}]',
        'A',
        'Exchanges receive messages and route them to queues using bindings.',
        1.0,
        90,
        ARRAY['rabbitmq','exchange'],
        true,
        'gpt-4-proctor-v2',
        false,
        false
    )
ON CONFLICT (id) DO UPDATE
SET course_id = EXCLUDED.course_id,
    chapter_id = EXCLUDED.chapter_id,
    knowledge_unit_id = EXCLUDED.knowledge_unit_id,
    created_by = EXCLUDED.created_by,
    question_type = EXCLUDED.question_type,
    difficulty = EXCLUDED.difficulty,
    content = EXCLUDED.content,
    options = EXCLUDED.options,
    correct_answer = EXCLUDED.correct_answer,
    explanation = EXCLUDED.explanation,
    points = EXCLUDED.points,
    time_limit = EXCLUDED.time_limit,
    keywords = EXCLUDED.keywords,
    is_ai_generated = EXCLUDED.is_ai_generated,
    ai_model = EXCLUDED.ai_model,
    is_active = EXCLUDED.is_active,
    is_public = EXCLUDED.is_public,
    updated_at = CURRENT_TIMESTAMP;

-- Demo AI jobs and queue jobs
SET search_path = ai_db, public;

INSERT INTO documents (
    document_id, course_id, uploaded_by, file_name, original_filename,
    storage_path, file_url, mime_type, file_size, status, error_message, trace_id
) VALUES
    (
        '61000000-0000-0000-0000-000000000001',
        101,
        '20000000-0000-0000-0000-000000000001',
        'demo-programming.pdf',
        'Programming Chapter 1.pdf',
        '/demo/docs/programming-chapter-1.pdf',
        NULL,
        'application/pdf',
        204800,
        'COMPLETED',
        NULL,
        'trace-admin-demo-001'
    ),
    (
        '61000000-0000-0000-0000-000000000002',
        102,
        '20000000-0000-0000-0000-000000000001',
        'demo-database.pdf',
        'Database Keys.pdf',
        '/demo/docs/database-keys.pdf',
        NULL,
        'application/pdf',
        102400,
        'FAILED',
        'Text extraction timeout',
        'trace-admin-demo-002'
    )
ON CONFLICT (document_id) DO UPDATE
SET status = EXCLUDED.status,
    error_message = EXCLUDED.error_message,
    trace_id = EXCLUDED.trace_id,
    updated_at = CURRENT_TIMESTAMP;

INSERT INTO ai_jobs (
    ai_job_id, document_id, requested_by, status, retry_count,
    result_artifact_path, error_message, trace_id, completed_at
) VALUES
    (
        '71000000-0000-0000-0000-000000000001',
        '61000000-0000-0000-0000-000000000001',
        '20000000-0000-0000-0000-000000000001',
        'RUNNING',
        0,
        NULL,
        NULL,
        'trace-admin-demo-001',
        NULL
    ),
    (
        '71000000-0000-0000-0000-000000000002',
        '61000000-0000-0000-0000-000000000002',
        '20000000-0000-0000-0000-000000000001',
        'FAILED',
        2,
        NULL,
        'AI worker timeout while generating questions',
        'trace-admin-demo-002',
        CURRENT_TIMESTAMP - INTERVAL '10 minutes'
    )
ON CONFLICT (ai_job_id) DO UPDATE
SET status = EXCLUDED.status,
    retry_count = EXCLUDED.retry_count,
    error_message = EXCLUDED.error_message,
    trace_id = EXCLUDED.trace_id,
    completed_at = EXCLUDED.completed_at,
    updated_at = CURRENT_TIMESTAMP;

SET search_path = infra_eventing, public;

INSERT INTO queue_jobs (
    id, job_type, queue_name, payload, priority, status, attempts,
    max_attempts, queued_at, started_at, completed_at, failed_at,
    result, error_message, user_id, related_id, trace_id
) VALUES
    (
        '81000000-0000-0000-0000-000000000001',
        'ai.question.generate',
        'ai_generation_queue',
        '{"course_id":101,"quantity":5}',
        5,
        'queued',
        0,
        3,
        CURRENT_TIMESTAMP - INTERVAL '3 minutes',
        NULL,
        NULL,
        NULL,
        NULL,
        NULL,
        '20000000-0000-0000-0000-000000000001',
        '71000000-0000-0000-0000-000000000001',
        'trace-admin-demo-001'
    ),
    (
        '81000000-0000-0000-0000-000000000002',
        'ai.question.generate',
        'ai_generation_queue',
        '{"course_id":102,"quantity":10}',
        3,
        'failed',
        3,
        3,
        CURRENT_TIMESTAMP - INTERVAL '1 hour',
        CURRENT_TIMESTAMP - INTERVAL '55 minutes',
        NULL,
        CURRENT_TIMESTAMP - INTERVAL '50 minutes',
        NULL,
        'RabbitMQ consumer failed after max attempts',
        '20000000-0000-0000-0000-000000000001',
        '71000000-0000-0000-0000-000000000002',
        'trace-admin-demo-002'
    )
ON CONFLICT (id) DO UPDATE
SET status = EXCLUDED.status,
    attempts = EXCLUDED.attempts,
    error_message = EXCLUDED.error_message,
    trace_id = EXCLUDED.trace_id;

-- Demo notifications and logs
SET search_path = notification_db, public;

INSERT INTO notifications (
    id, user_id, type, title, message, action_data, is_read, read_at
) VALUES
    (
        '91000000-0000-0000-0000-000000000101',
        '20000000-0000-0000-0000-000000000001',
        'system',
        'Maintenance window',
        'The system will run a scheduled RabbitMQ health check tonight.',
        '{"source":"admin_broadcast","target_role":"teacher"}',
        false,
        NULL
    ),
    (
        '91000000-0000-0000-0000-000000000102',
        '30000000-0000-0000-0000-000000000001',
        'system',
        'Question bank updated',
        'New practice questions are available for Programming Fundamentals.',
        '{"source":"admin_broadcast","target_role":"student"}',
        true,
        CURRENT_TIMESTAMP - INTERVAL '30 minutes'
    )
ON CONFLICT (id) DO UPDATE
SET title = EXCLUDED.title,
    message = EXCLUDED.message,
    action_data = EXCLUDED.action_data,
    is_read = EXCLUDED.is_read,
    read_at = EXCLUDED.read_at;

SET search_path = infra_observability, public;

INSERT INTO audit_logs (
    id, actor_id, action, entity_type, entity_id, metadata, ip_address, user_agent
) VALUES
    (
        '92000000-0000-0000-0000-000000000001',
        '10000000-0000-0000-0000-000000000001',
        'admin.user.update_status',
        'user',
        '30000000-0000-0000-0000-000000000002',
        '{"is_active":false,"reason":"demo lock account"}',
        '127.0.0.1',
        'admin-demo-seed'
    ),
    (
        '92000000-0000-0000-0000-000000000002',
        '10000000-0000-0000-0000-000000000001',
        'admin.question.update_status',
        'question',
        '51000000-0000-0000-0000-000000000003',
        '{"is_active":false,"course_id":103}',
        '127.0.0.1',
        'admin-demo-seed'
    )
ON CONFLICT (id) DO UPDATE
SET action = EXCLUDED.action,
    entity_type = EXCLUDED.entity_type,
    entity_id = EXCLUDED.entity_id,
    metadata = EXCLUDED.metadata;

INSERT INTO system_events (
    id, event_type, source, aggregate_id, payload, status, trace_id
) VALUES
    (
        '93000000-0000-0000-0000-000000000001',
        'RABBITMQ_QUEUE_HEALTH',
        'user-service',
        '81000000-0000-0000-0000-000000000001',
        '{"queue":"ai_generation_queue","ready":1,"failed":1}',
        'processed',
        'trace-admin-demo-001'
    ),
    (
        '93000000-0000-0000-0000-000000000002',
        'AI_JOB_FAILED',
        'ai-service',
        '71000000-0000-0000-0000-000000000002',
        '{"error":"AI worker timeout while generating questions"}',
        'failed',
        'trace-admin-demo-002'
    )
ON CONFLICT (id) DO UPDATE
SET event_type = EXCLUDED.event_type,
    source = EXCLUDED.source,
    payload = EXCLUDED.payload,
    status = EXCLUDED.status,
    trace_id = EXCLUDED.trace_id;
