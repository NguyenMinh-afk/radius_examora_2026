import { randomUUID } from "node:crypto";

const DEFAULT_EXCHANGE = "examora.topic";

export function createOutboxWriter({
  sequelize,
  serviceName,
  exchange = DEFAULT_EXCHANGE,
}) {
  if (!sequelize?.query) {
    throw new Error("A Sequelize instance with query() is required");
  }
  if (!serviceName) {
    throw new Error("serviceName is required");
  }

  async function enqueue({
    routingKey,
    aggregateType,
    aggregateId,
    data,
    traceId,
    requestId,
    transaction,
    eventId = randomUUID(),
    occurredAt = new Date().toISOString(),
  }) {
    if (!routingKey || !aggregateType || !aggregateId) {
      throw new Error("routingKey, aggregateType and aggregateId are required");
    }
    if (!transaction) {
      throw new Error("An active database transaction is required");
    }

    const correlationId = traceId || requestId || eventId;
    const event = {
      event_id: eventId,
      event_type: routingKey,
      event_version: 1,
      aggregate_type: aggregateType,
      aggregate_id: String(aggregateId),
      source: serviceName,
      occurred_at: occurredAt,
      trace_id: correlationId,
      request_id: requestId || null,
      data: data || {},
    };

    await sequelize.query(
      `INSERT INTO infra_eventing.outbox_events
        (outbox_event_id, aggregate_type, aggregate_id, event_type,
         exchange_name, routing_key, message_id, payload, status,
         retry_count, trace_id, next_attempt_at)
       VALUES
        (:outboxEventId, :aggregateType, :aggregateId, :eventType,
         :exchangeName, :routingKey, :messageId, CAST(:payload AS JSONB),
         'PENDING', 0, :traceId, CURRENT_TIMESTAMP)`,
      {
        replacements: {
          outboxEventId: eventId,
          aggregateType,
          aggregateId: String(aggregateId),
          eventType: routingKey,
          exchangeName: exchange,
          routingKey,
          messageId: eventId,
          payload: JSON.stringify(event),
          traceId: correlationId,
        },
        transaction,
      },
    );

    return {
      queued: true,
      eventId,
      routingKey,
      event,
    };
  }

  return { enqueue };
}

export default { createOutboxWriter };
