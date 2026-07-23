import { describe, expect, it, vi } from 'vitest';
import { createOutboxWriter } from '../../shared/utils/outbox.js';

describe('Shared transactional outbox writer', () => {
  it('stores the standard event envelope using the supplied transaction', async () => {
    const sequelize = { query: vi.fn().mockResolvedValue([[], {}]) };
    const transaction = {};
    const writer = createOutboxWriter({
      sequelize,
      serviceName: 'Test_Service',
    });

    const result = await writer.enqueue({
      routingKey: 'user.created',
      aggregateType: 'user',
      aggregateId: '10000000-0000-4000-8000-000000000001',
      data: { role: 'student' },
      traceId: 'trace-id',
      requestId: 'request-id',
      transaction,
      eventId: '20000000-0000-4000-8000-000000000001',
      occurredAt: '2026-07-23T10:00:00.000Z',
    });

    expect(result.queued).toBe(true);
    expect(sequelize.query).toHaveBeenCalledOnce();
    const [, options] = sequelize.query.mock.calls[0];
    expect(options.transaction).toBe(transaction);
    expect(JSON.parse(options.replacements.payload)).toEqual({
      event_id: '20000000-0000-4000-8000-000000000001',
      event_type: 'user.created',
      event_version: 1,
      aggregate_type: 'user',
      aggregate_id: '10000000-0000-4000-8000-000000000001',
      source: 'Test_Service',
      occurred_at: '2026-07-23T10:00:00.000Z',
      trace_id: 'trace-id',
      request_id: 'request-id',
      data: { role: 'student' },
    });
  });

  it('requires an active transaction', async () => {
    const writer = createOutboxWriter({
      sequelize: { query: vi.fn() },
      serviceName: 'Test_Service',
    });

    await expect(
      writer.enqueue({
        routingKey: 'user.created',
        aggregateType: 'user',
        aggregateId: '10000000-0000-4000-8000-000000000001',
      })
    ).rejects.toThrow('active database transaction');
  });
});
