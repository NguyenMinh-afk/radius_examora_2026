-- =====================================================
-- SEED 57: Infrastructure Observability Data
-- Aligned with the updated 07/08 migrations.
-- =====================================================

SET search_path = infra_observability, public;

-- Audit logs
INSERT INTO audit_logs (id, actor_id, actor_email, actor_role, action, entity_type, entity_id, metadata)
VALUES
    ('91000000-0000-0000-0000-000000000001', '20000000-0000-0000-0000-000000000001', 'teacher1@examora.local', 'teacher',
     'create', 'question', '50000000-0000-0000-0000-000000000001', '{"source":"seed"}'),
    ('91000000-0000-0000-0000-000000000002', '20000000-0000-0000-0000-000000000001', 'teacher1@examora.local', 'teacher',
     'create', 'exam', 'A0000000-0000-0000-0000-000000000001', '{"source":"seed"}'),
    ('91000000-0000-0000-0000-000000000003', '30000000-0000-0000-0000-000000000001', 'student1@examora.local', 'student',
     'submit', 'attempt', 'EB000000-0000-0000-0000-000000000001', '{"source":"seed"}'),
    ('91000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', 'admin@examora.local', 'admin',
     'approve', 'user', '30000000-0000-0000-0000-000000000001', '{"source":"seed"}')
ON CONFLICT (id) DO NOTHING;

-- Test runs
INSERT INTO test_runs (id, test_type, test_suite, status, total_tests, passed_tests, failed_tests, duration_ms, started_at, completed_at, summary)
VALUES
    ('92000000-0000-0000-0000-000000000001', 'integration', 'seed_validation', 'passed',
     10, 10, 0, 1500, CURRENT_TIMESTAMP - INTERVAL '5 minutes', CURRENT_TIMESTAMP, 'All seed data validated successfully'),
    ('92000000-0000-0000-0000-000000000002', 'unit', 'user_service', 'passed',
     50, 50, 0, 2300, CURRENT_TIMESTAMP - INTERVAL '1 hour', CURRENT_TIMESTAMP - INTERVAL '55 minutes', 'User service tests passed')
ON CONFLICT (id) DO NOTHING;

-- System events
INSERT INTO system_events (id, event_type, severity, source, aggregate_id, payload, status, trace_id, message, metadata, created_at)
VALUES
    ('93000000-0000-0000-0000-000000000001', 'AI_JOB_COMPLETED', 'info', 'ai-service',
     '70000000-0000-0000-0000-000000000002',
     '{"jobId":"70000000-0000-0000-0000-000000000002","status":"COMPLETED"}'::jsonb,
     'processed', NULL,
     'AI job completed successfully',
     '{"jobId":"70000000-0000-0000-0000-000000000002","status":"COMPLETED"}'::jsonb,
     CURRENT_TIMESTAMP - INTERVAL '1 minute'),
    ('93000000-0000-0000-0000-000000000002', 'USER_LOGIN', 'info', 'user-service',
     '30000000-0000-0000-0000-000000000001',
     '{"userId":"30000000-0000-0000-0000-000000000001"}'::jsonb,
     'processed', NULL,
     'User logged in successfully',
     '{"userId":"30000000-0000-0000-0000-000000000001"}'::jsonb,
     CURRENT_TIMESTAMP - INTERVAL '30 minutes'),
    ('93000000-0000-0000-0000-000000000003', 'EXAM_STARTED', 'info', 'exam-service',
     '30000000-0000-0000-0000-000000000001',
     '{"examId":"A0000000-0000-0000-0000-000000000001"}'::jsonb,
     'processed', NULL,
     'Student started exam attempt',
     '{"studentId":"30000000-0000-0000-0000-000000000001","examId":"A0000000-0000-0000-0000-000000000001"}'::jsonb,
     CURRENT_TIMESTAMP - INTERVAL '1 hour')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- INFRA EVENTING SEED DATA
-- =====================================================

SET search_path = infra_eventing, public;

-- Outbox events
-- Must include exchange_name, routing_key, message_id (NOT NULL).
INSERT INTO outbox_events (
    outbox_event_id, aggregate_type, aggregate_id, event_type,
    exchange_name, routing_key, message_id,
    payload, status, published_at, created_at
) VALUES
    ('80000000-0000-0000-0000-000000000001', 'ai_job', '70000000-0000-0000-0000-000000000002',
     'AI_JOB_COMPLETED',
     'examora.topic', 'ai_job.completed', '80000000-0000-0000-0000-000000000001',
     '{"event_id":"80000000-0000-0000-0000-000000000001","event_type":"ai_job.completed","event_version":1,"aggregate_type":"ai_job","aggregate_id":"70000000-0000-0000-0000-000000000002","source":"ai-service","occurred_at":"2026-09-25T10:00:00.000Z","trace_id":"80000000-0000-0000-0000-000000000001","data":{"jobId":"70000000-0000-0000-0000-000000000002","status":"COMPLETED"}}'::jsonb,
     'PUBLISHED', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP - INTERVAL '1 minute')
ON CONFLICT (outbox_event_id) DO NOTHING;

-- Processed messages
-- Requires consumer_name NOT NULL.
INSERT INTO processed_messages (processed_message_id, consumer_name, message_id, processed_at)
VALUES
    ('80000000-0000-0000-0000-000000000010', 'seed-init', 'msg-0001', CURRENT_TIMESTAMP)
ON CONFLICT (consumer_name, message_id) DO NOTHING;

-- Queue jobs
INSERT INTO queue_jobs (
    id, job_type, job_name, queue_name, payload, status, priority,
    attempts, max_attempts, queued_at, created_at, completed_at, result
) VALUES
    ('80000000-0000-0000-0000-000000000003', 'ai_generation', 'Generate Questions', 'ai.jobs',
     '{"requestId":"60000000-0000-0000-0000-000000000001"}'::jsonb,
     'completed', 5, 1, 3, CURRENT_TIMESTAMP - INTERVAL '15 minutes', CURRENT_TIMESTAMP - INTERVAL '15 minutes',
     CURRENT_TIMESTAMP - INTERVAL '5 minutes',
     '{"questions_generated": 2}'::jsonb)
ON CONFLICT (id) DO NOTHING;
