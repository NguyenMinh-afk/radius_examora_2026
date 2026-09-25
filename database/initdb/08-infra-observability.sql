-- =====================================================
-- MIGRATION 08: Infrastructure Observability (infra_observability)
-- =====================================================

SET search_path = infra_observability, public;

-- Audit logs
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    actor_id UUID, -- References user_db.users (nullable for system actions)
    actor_email VARCHAR(255),
    actor_role VARCHAR(50),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100) NOT NULL,
    entity_id VARCHAR(255),
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- System events
-- Columns required by:
--   Infrastructure_Service/src/services/system-event.service.js (storeSystemEvent INSERT)
--   User_Service/src/models/SystemEvent.js  (read model for admin)
-- =====================================================
CREATE TABLE IF NOT EXISTS system_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    event_type VARCHAR(100) NOT NULL,
    severity VARCHAR(20) DEFAULT 'info'
        CHECK (severity IN ('debug', 'info', 'warning', 'error', 'critical')),
    source VARCHAR(100) NOT NULL,
    aggregate_id UUID,
    payload JSONB,
    status VARCHAR(50) DEFAULT 'processed',
    trace_id VARCHAR(100),
    message TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test runs (CI/CD)
-- summary column is referenced by database/initdb/57-infra-observability.sql
-- (SEED) and CI scripts.
CREATE TABLE IF NOT EXISTS test_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_type VARCHAR(50) NOT NULL, -- unit, integration, e2e
    test_suite VARCHAR(100),
    status VARCHAR(20) DEFAULT 'running' CHECK (status IN ('running', 'passed', 'failed', 'skipped')),
    total_tests INTEGER DEFAULT 0,
    passed_tests INTEGER DEFAULT 0,
    failed_tests INTEGER DEFAULT 0,
    skipped_tests INTEGER DEFAULT 0,
    coverage_percent DECIMAL(5,2),
    duration_ms INTEGER,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    summary TEXT,
    branch VARCHAR(100),
    commit_sha VARCHAR(40),
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- API request logs (optional, for debugging)
CREATE TABLE IF NOT EXISTS api_request_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    trace_id UUID,
    user_id UUID,
    method VARCHAR(10) NOT NULL,
    path VARCHAR(500) NOT NULL,
    status_code INTEGER,
    response_time_ms INTEGER,
    ip_address INET,
    user_agent TEXT,
    request_body JSONB,
    response_body JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =====================================================
-- INDEXES
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_audit_logs_actor ON audit_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_audit_logs_action ON audit_logs(action);
CREATE INDEX IF NOT EXISTS idx_audit_logs_created ON audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_system_events_type ON system_events(event_type);
CREATE INDEX IF NOT EXISTS idx_system_events_severity ON system_events(severity);
CREATE INDEX IF NOT EXISTS idx_system_events_source ON system_events(source);
CREATE INDEX IF NOT EXISTS idx_system_events_created ON system_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_test_runs_type ON test_runs(test_type);
CREATE INDEX IF NOT EXISTS idx_test_runs_status ON test_runs(status);
CREATE INDEX IF NOT EXISTS idx_test_runs_created ON test_runs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_trace ON api_request_logs(trace_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_user ON api_request_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_path ON api_request_logs(path);
CREATE INDEX IF NOT EXISTS idx_api_request_logs_created ON api_request_logs(created_at DESC);

-- =====================================================
-- AUTO UPDATE TIMESTAMP TRIGGERS
-- =====================================================
CREATE OR REPLACE TRIGGER update_audit_logs_updated_at
    BEFORE UPDATE ON audit_logs
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PARTITIONING (optional for large tables)
-- =====================================================
-- Uncomment for time-based partitioning on high-volume tables:

-- ALTER TABLE infra_observability.audit_logs
--     PARTITION BY RANGE (created_at);
--
-- CREATE TABLE infra_observability.audit_logs_2026_01 PARTITION OF infra_observability.audit_logs
--     FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
