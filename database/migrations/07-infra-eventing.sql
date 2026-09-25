-- =====================================================
-- MIGRATION 07: Infrastructure Eventing (infra_eventing)
-- Aligned with backend/shared/utils/outbox.js and
-- backend/Infrastructure_Service/src/workers/outbox.worker.js
-- =====================================================

SET search_path = infra_eventing, public;

-- =====================================================
-- Outbox events (for reliable event publishing)
-- =====================================================
-- Columns are consumed by:
--   - backend/shared/utils/outbox.js        (writer.enqueue INSERT)
--   - Infrastructure_Service/src/workers/outbox.worker.js
--       (poll SELECT + retry UPDATE + DLQ INSERT)
-- =====================================================
CREATE TABLE IF NOT EXISTS outbox_events (
    outbox_event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id UUID NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    exchange_name VARCHAR(100) NOT NULL,
    routing_key VARCHAR(100) NOT NULL,
    message_id VARCHAR(255) UNIQUE NOT NULL,
    payload JSONB NOT NULL,
    status VARCHAR(20) DEFAULT 'PENDING'
        CHECK (status IN ('PENDING', 'PUBLISHED', 'FAILED')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    trace_id VARCHAR(100),
    next_attempt_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_error TEXT,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Processed messages (consumer deduplication)
-- =====================================================
-- Consumed by:
--   - Infrastructure_Service/src/services/message-idempotency.service.js
--   - Infrastructure_Service/src/services/system-event.service.js
--   - Notification_Service/src/routes/notification.routes.js (/internal)
-- =====================================================
CREATE TABLE IF NOT EXISTS processed_messages (
    processed_message_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    outbox_event_id UUID REFERENCES outbox_events(outbox_event_id)
        ON UPDATE CASCADE ON DELETE SET NULL,
    consumer_name VARCHAR(100) NOT NULL,
    message_id VARCHAR(255) NOT NULL,
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (consumer_name, message_id)
);

-- =====================================================
-- Dead letter messages (failed messages)
-- =====================================================
CREATE TABLE IF NOT EXISTS dead_letter_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_message_id VARCHAR(255) NOT NULL,
    routing_key VARCHAR(100),
    exchange_name VARCHAR(100),
    payload JSONB NOT NULL,
    error_reason TEXT,
    trace_id VARCHAR(100),
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- Queue jobs (internal task tracking)
-- Columns required by:
--   User_Service/src/models/QueueJob.js (admin read model)
-- =====================================================
CREATE TABLE IF NOT EXISTS queue_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(100) NOT NULL,
    job_name VARCHAR(255),
    queue_name VARCHAR(100) NOT NULL,
    payload JSONB NOT NULL,
    priority INTEGER DEFAULT 0,
    status VARCHAR(50) DEFAULT 'queued'
        CHECK (status IN ('queued', 'running', 'completed', 'failed')),
    attempts INTEGER DEFAULT 0,
    max_attempts INTEGER DEFAULT 3,
    queued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    failed_at TIMESTAMP,
    result JSONB,
    error_message TEXT,
    user_id UUID,
    related_id UUID,
    trace_id VARCHAR(100),
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_outbox_events_status_attempt
    ON outbox_events(status, next_attempt_at, created_at);
CREATE INDEX IF NOT EXISTS idx_outbox_events_aggregate
    ON outbox_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_outbox_events_message_id ON outbox_events(message_id);
CREATE INDEX IF NOT EXISTS idx_processed_messages_consumer
    ON processed_messages(consumer_name, message_id);
CREATE INDEX IF NOT EXISTS idx_dlq_routing_key ON dead_letter_messages(routing_key);
CREATE INDEX IF NOT EXISTS idx_dlq_failed_at ON dead_letter_messages(failed_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_type ON queue_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_status ON queue_jobs(status);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_priority
    ON queue_jobs(priority DESC, created_at ASC) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_queue_jobs_scheduled
    ON queue_jobs(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGERS
-- Note: The update_updated_at_column() function is defined in public schema (migration 00)
-- =====================================================
CREATE OR REPLACE TRIGGER update_outbox_events_updated_at
    BEFORE UPDATE ON outbox_events
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE TRIGGER update_queue_jobs_updated_at
    BEFORE UPDATE ON queue_jobs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
