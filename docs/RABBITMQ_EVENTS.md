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

`exam.completed` is routed to the durable `exam.results` queue. Other domain
events are available through topic bindings such as `user.*`, `exam.*`, and
`question.*`; a consumer owns and declares its durable queue and bindings.

## Current delivery behavior

Producers wait for broker confirmation. A broker failure is logged and returned
internally as `published: false`, but it does not roll back an already completed
business operation. A transactional outbox is required in the reliability phase
to guarantee later delivery when RabbitMQ is unavailable.

Consumers must use `event_id`/AMQP `messageId` for idempotency because RabbitMQ
delivery is at least once.

## Data rules

- Never publish passwords, password hashes, access tokens, or refresh tokens.
- User events contain only identifiers and account state.
- Question events exclude question content, answers, and correct answers.
- Update events include `changed_fields` instead of the entire submitted body.
