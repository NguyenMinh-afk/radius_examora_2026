# RabbitMQ Domain Events

## Exchange

- Exchange: `examora.topic`
- Type: `topic`
- Messages: durable/persistent
- Producer confirmation: RabbitMQ publisher confirms

## Event envelope

```json
{
  "event_id": "uuid",
  "event_type": "question.created",
  "event_version": 1,
  "aggregate_type": "question",
  "aggregate_id": "uuid",
  "source": "Question_Service",
  "occurred_at": "2026-07-23T10:00:00.000Z",
  "trace_id": "uuid-or-correlation-id",
  "request_id": "uuid-or-null",
  "data": {}
}
```

`event_id` is also sent as the AMQP `messageId`. `trace_id` is sent as the
AMQP `correlationId`.

## Routing keys

| Producer | Routing key | Meaning |
| --- | --- | --- |
| User Service | `user.created` | A password or Google registration created a user |
| Exam Service | `exam.created` | A teacher created an exam |
| Exam Service | `exam.updated` | A teacher updated an exam |
| Exam Service | `exam.deleted` | A teacher deleted an exam |
| Exam Service | `exam.completed` | A student submitted a new completed attempt |
| Question Service | `question.created` | A question was created |
| Question Service | `question.updated` | A question was updated |
| Question Service | `question.deleted` | A question was deleted |

`exam.completed` is routed to the durable `exam.results` queue. User, Exam CRUD,
and Question events are routed to the durable `domain.events` queue.

## Consumer queues

| Main queue | Retry queue | Dead-letter queue | Consumer |
| --- | --- | --- | --- |
| `domain.events` | `domain.events.retry` | `domain.events.dlq` | `domain-events-consumer` |
| `exam.results` | `exam.results.retry` | `exam.results.dlq` | `exam-results-consumer` |

Both consumers store an event in `infra_observability.system_events`. They use
the AMQP `messageId` and `infra_eventing.processed_messages` to ACK duplicate
deliveries without processing them again.

Invalid contracts go directly to the queue DLQ. Temporary database failures are
retried up to three times through a retry queue with a five-second delay. When
the retry limit is reached, the message is dead-lettered.

## Transactional outbox

User, Exam, and Question services do not publish domain events directly. Each
business mutation and its event are committed in the same database transaction:

1. The producer writes the standard envelope to
   `infra_eventing.outbox_events` with status `PENDING`.
2. Infrastructure Service locks ready rows with
   `FOR UPDATE SKIP LOCKED`.
3. The Outbox Worker publishes to `examora.topic` and waits for a RabbitMQ
   publisher confirm.
4. A confirmed event becomes `PUBLISHED`. A temporary failure stays `PENDING`
   and is retried with exponential backoff.
5. After `OUTBOX_MAX_RETRIES` (default: 5), the event becomes `FAILED` and a
   diagnostic copy is stored in `infra_eventing.dead_letter_messages`.

The worker polls every `OUTBOX_POLL_INTERVAL_MS` (default: 1000 ms) and processes
up to `OUTBOX_BATCH_SIZE` events per cycle (default: 10).

Existing databases must apply the retry metadata migration before deploying the
new worker:

```bash
psql -U postgres -d Exam_Bank \
  -f database/Upgrade/20260723_outbox_retry.sql
```

Consumers must use `event_id`/AMQP `messageId` for idempotency because RabbitMQ
delivery is at least once. If RabbitMQ confirms a publish but the database update
fails, the Outbox Worker may publish the event again; Step 8 consumer
idempotency makes that safe.

## Data rules

- Never publish passwords, password hashes, access tokens, or refresh tokens.
- User events contain only identifiers and account state.
- Question events exclude question content, answers, and correct answers.
- Update events include `changed_fields` instead of the entire submitted body.
