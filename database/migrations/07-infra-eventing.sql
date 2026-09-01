-- =====================================================
-- MIGRATION 07: Infrastructure Eventing (infra_eventing)
-- =====================================================

SET search_path = infra_eventing, public;

-- Outbox events (for reliable event publishing)
CREATE TABLE IF NOT EXISTS outbox_events (
    outbox_event_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    aggregate_type VARCHAR(100) NOT NULL,
    aggregate_id VARCHAR(255) NOT NULL,
    event_type VARCHAR(100) NOT NULL,
    event_version VARCHAR(20) DEFAULT '1.0',
    payload JSONB NOT NULL,
    trace_id UUID,
    correlation_id UUID,
    status VARCHAR(20) DEFAULT 'PENDING' CHECK (status IN ('PENDING', 'PROCESSING', 'COMPLETED', 'FAILED')),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 5,
    error_message TEXT,
    scheduled_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Processed messages (consumer deduplication)
CREATE TABLE IF NOT EXISTS processed_messages (
    message_id VARCHAR(255) PRIMARY KEY,
    event_type VARCHAR(100),
    processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    expires_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP + INTERVAL '7 days'
);

-- Dead letter messages (failed messages)
CREATE TABLE IF NOT EXISTS dead_letter_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    original_queue VARCHAR(100) NOT NULL,
    routing_key VARCHAR(255),
    message_id VARCHAR(255),
    payload JSONB NOT NULL,
    error_type VARCHAR(100),
    error_message TEXT,
    stack_trace TEXT,
    headers JSONB,
    retry_count INTEGER DEFAULT 0,
    failed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Queue jobs (internal task tracking)
CREATE TABLE IF NOT EXISTS queue_jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_type VARCHAR(50) NOT NULL,
    job_name VARCHAR(255),
    payload JSONB NOT NULL,
    status job_status DEFAULT 'queued',
    priority INTEGER DEFAULT 5,
    queue_name VARCHAR(100),
    retry_count INTEGER DEFAULT 0,
    max_retries INTEGER DEFAULT 3,
    error_message TEXT,
    result JSONB,
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    scheduled_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_outbox_aggregate ON outbox_events(aggregate_type, aggregate_id);
CREATE INDEX IF NOT EXISTS idx_outbox_status ON outbox_events(status) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_outbox_created ON outbox_events(created_at ASC) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_processed_messages_expires ON processed_messages(expires_at);
CREATE INDEX IF NOT EXISTS idx_dlq_original_queue ON dead_letter_messages(original_queue);
CREATE INDEX IF NOT EXISTS idx_dlq_failed_at ON dead_letter_messages(failed_at DESC);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_type ON queue_jobs(job_type);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_status ON queue_jobs(status);
CREATE INDEX IF NOT EXISTS idx_queue_jobs_priority ON queue_jobs(priority DESC, created_at ASC) WHERE status = 'queued';
CREATE INDEX IF NOT EXISTS idx_queue_jobs_scheduled ON queue_jobs(scheduled_at) WHERE scheduled_at IS NOT NULL;

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGER
-- =====================================================
CREATE OR REPLACE TRIGGER update_outbox_events_updated_at
    BEFORE UPDATE ON outbox_events
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE TRIGGER update_queue_jobs_updated_at
    BEFORE UPDATE ON queue_jobs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
