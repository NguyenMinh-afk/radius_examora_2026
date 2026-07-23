import { pool } from '../config/db.js';
import { getChannel } from '../config/rabbitmq.js';

export const OUTBOX_WORKER_NAME = 'outbox-publisher';
export const MAX_OUTBOX_RETRIES = Number(process.env.OUTBOX_MAX_RETRIES || 5);
export const OUTBOX_POLL_INTERVAL_MS = Number(process.env.OUTBOX_POLL_INTERVAL_MS || 1_000);
export const OUTBOX_BATCH_SIZE = Number(process.env.OUTBOX_BATCH_SIZE || 10);

let pollTimer = null;
let pollingPromise = null;

function getBackoffMs(retryCount) {
  return Math.min(1_000 * 2 ** Math.max(retryCount - 1, 0), 60_000);
}

function parsePayload(payload) {
  return typeof payload === 'string' ? JSON.parse(payload) : payload;
}

async function publishOutboxEvent(channel, event) {
  const payload = parsePayload(event.payload);
  channel.publish(
    event.exchange_name || 'examora.topic',
    event.routing_key,
    Buffer.from(JSON.stringify(payload)),
    {
      persistent: true,
      contentType: 'application/json',
      contentEncoding: 'utf-8',
      messageId: event.message_id,
      correlationId: event.trace_id || event.message_id,
      type: event.event_type,
      timestamp: Date.now(),
      headers: {
        'x-service': payload.source,
        'x-trace-id': event.trace_id || event.message_id,
        'x-event-version': payload.event_version || 1,
        'x-outbox-id': event.outbox_event_id,
      },
    }
  );
  await channel.waitForConfirms();
}

export async function processNextOutboxEvent({
  channel,
  databasePool = pool,
  maxRetries = MAX_OUTBOX_RETRIES,
} = {}) {
  if (!channel) {
    throw new Error('A RabbitMQ confirm channel is required');
  }

  const client = await databasePool.connect();
  let event = null;

  try {
    await client.query('BEGIN');
    const result = await client.query(
      `SELECT outbox_event_id, event_type, exchange_name, routing_key,
              message_id, payload, retry_count, trace_id
         FROM infra_eventing.outbox_events
        WHERE status = 'PENDING'
          AND COALESCE(next_attempt_at, created_at) <= CURRENT_TIMESTAMP
        ORDER BY created_at
        LIMIT 1
        FOR UPDATE SKIP LOCKED`
    );

    if (result.rowCount === 0) {
      await client.query('COMMIT');
      return { processed: false };
    }

    [event] = result.rows;

    try {
      await publishOutboxEvent(channel, event);
    } catch (publishError) {
      const retryCount = Number(event.retry_count || 0) + 1;
      const failed = retryCount >= maxRetries;
      const nextAttemptAt = new Date(Date.now() + getBackoffMs(retryCount));

      await client.query(
        `UPDATE infra_eventing.outbox_events
            SET status = $2,
                retry_count = $3,
                next_attempt_at = $4,
                last_error = $5
          WHERE outbox_event_id = $1`,
        [
          event.outbox_event_id,
          failed ? 'FAILED' : 'PENDING',
          retryCount,
          nextAttemptAt,
          publishError.message,
        ]
      );

      if (failed) {
        await client.query(
          `INSERT INTO infra_eventing.dead_letter_messages
            (original_message_id, routing_key, exchange_name, payload,
             error_reason, trace_id)
           VALUES ($1, $2, $3, $4::jsonb, $5, $6)`,
          [
            event.message_id,
            event.routing_key,
            event.exchange_name,
            JSON.stringify(parsePayload(event.payload)),
            publishError.message,
            event.trace_id,
          ]
        );
      }

      await client.query('COMMIT');
      return {
        processed: true,
        published: false,
        status: failed ? 'FAILED' : 'PENDING',
        retryCount,
      };
    }

    await client.query(
      `UPDATE infra_eventing.outbox_events
          SET status = 'PUBLISHED',
              published_at = CURRENT_TIMESTAMP,
              last_error = NULL
        WHERE outbox_event_id = $1`,
      [event.outbox_event_id]
    );
    await client.query('COMMIT');

    return {
      processed: true,
      published: true,
      messageId: event.message_id,
    };
  } catch (error) {
    try {
      await client.query('ROLLBACK');
    } catch (rollbackError) {
      console.error(`[${OUTBOX_WORKER_NAME}] Rollback failed:`, rollbackError.message);
    }
    throw error;
  } finally {
    client.release();
  }
}

export async function processOutboxBatch({
  channel,
  databasePool = pool,
  batchSize = OUTBOX_BATCH_SIZE,
  maxRetries = MAX_OUTBOX_RETRIES,
} = {}) {
  let processed = 0;

  while (processed < batchSize) {
    const result = await processNextOutboxEvent({
      channel,
      databasePool,
      maxRetries,
    });
    if (!result.processed) break;
    processed += 1;
  }

  return processed;
}

function poll(channel) {
  if (pollingPromise) return pollingPromise;

  pollingPromise = processOutboxBatch({ channel })
    .catch((error) => {
      console.error(`[${OUTBOX_WORKER_NAME}] Poll failed:`, error.message);
    })
    .finally(() => {
      pollingPromise = null;
    });

  return pollingPromise;
}

export async function startOutboxWorker() {
  if (pollTimer) return;

  const channel = getChannel();
  await poll(channel);
  pollTimer = setInterval(() => {
    void poll(channel);
  }, OUTBOX_POLL_INTERVAL_MS);
  pollTimer.unref?.();
  console.log(
    `[${OUTBOX_WORKER_NAME}] Started (interval=${OUTBOX_POLL_INTERVAL_MS}ms, batch=${OUTBOX_BATCH_SIZE})`
  );
}

export async function stopOutboxWorker() {
  if (pollTimer) {
    clearInterval(pollTimer);
    pollTimer = null;
  }
  if (pollingPromise) {
    await pollingPromise;
  }
}

export default {
  processNextOutboxEvent,
  processOutboxBatch,
  startOutboxWorker,
  stopOutboxWorker,
};
