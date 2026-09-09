import { randomUUID } from 'node:crypto';
import { pool } from '../config/db.js';

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export class NonRetryableMessageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NonRetryableMessageError';
  }
}

export function parseAndValidateEvent(message, allowedEventTypes) {
  let event;
  try {
    event = JSON.parse(message.content.toString());
  } catch {
    throw new NonRetryableMessageError('Message content is not valid JSON');
  }

  const requiredFields = [
    'event_id',
    'event_type',
    'event_version',
    'aggregate_type',
    'aggregate_id',
    'source',
    'occurred_at',
    'trace_id',
    'data',
  ];
  const missingFields = requiredFields.filter(
    (field) => event[field] === undefined || event[field] === null
  );
  if (missingFields.length > 0) {
    throw new NonRetryableMessageError(`Missing event fields: ${missingFields.join(', ')}`);
  }

  if (!UUID_PATTERN.test(event.event_id)) {
    throw new NonRetryableMessageError('event_id must be a UUID');
  }
  if (!UUID_PATTERN.test(event.aggregate_id)) {
    throw new NonRetryableMessageError('aggregate_id must be a UUID');
  }
  if (event.event_version !== 1) {
    throw new NonRetryableMessageError('Unsupported event_version');
  }
  if (Number.isNaN(Date.parse(event.occurred_at))) {
    throw new NonRetryableMessageError('occurred_at must be a valid ISO timestamp');
  }
  if (typeof event.data !== 'object' || Array.isArray(event.data) || event.data === null) {
    throw new NonRetryableMessageError('data must be a JSON object');
  }
  if (!allowedEventTypes.has(event.event_type)) {
    throw new NonRetryableMessageError(`Unsupported event type: ${event.event_type}`);
  }

  const messageId = message.properties.messageId || event.event_id;
  if (messageId !== event.event_id) {
    throw new NonRetryableMessageError('AMQP messageId must match event_id');
  }

  return { event, messageId };
}

export async function storeSystemEvent({ event, messageId, consumerName }) {
  const client = await pool.connect();

  try {
    await client.query('BEGIN');
    const processedResult = await client.query(
      `INSERT INTO infra_eventing.processed_messages
        (processed_message_id, consumer_name, message_id)
       VALUES ($1, $2, $3)
       ON CONFLICT (consumer_name, message_id) DO NOTHING
       RETURNING processed_message_id`,
      [randomUUID(), consumerName, messageId]
    );

    if (processedResult.rowCount === 0) {
      await client.query('COMMIT');
      return { duplicate: true };
    }

    await client.query(
      `INSERT INTO infra_observability.system_events
        (id, event_type, source, aggregate_id, payload, status, trace_id, created_at)
       VALUES ($1, $2, $3, $4, $5::jsonb, $6, $7, $8)`,
      [
        randomUUID(),
        event.event_type,
        event.source,
        event.aggregate_id,
        JSON.stringify(event),
        'processed',
        event.trace_id,
        event.occurred_at,
      ]
    );

    await client.query('COMMIT');
    return { duplicate: false };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export default {
  NonRetryableMessageError,
  parseAndValidateEvent,
  storeSystemEvent,
};
