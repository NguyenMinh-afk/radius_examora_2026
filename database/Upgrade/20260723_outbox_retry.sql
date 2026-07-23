BEGIN;

ALTER TABLE infra_eventing.outbox_events
    ADD COLUMN IF NOT EXISTS next_attempt_at
        TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    ADD COLUMN IF NOT EXISTS last_error TEXT;

DROP INDEX IF EXISTS infra_eventing.idx_outbox_events_status;

CREATE INDEX idx_outbox_events_status
    ON infra_eventing.outbox_events(status, next_attempt_at, created_at);

COMMIT;
