import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const client = {
    query: vi.fn(),
    release: vi.fn(),
  };
  return {
    client,
    pool: {
      connect: vi.fn(),
    },
  };
});

vi.mock('../src/config/db.js', () => ({
  pool: mocks.pool,
}));

import {
  NonRetryableMessageError,
  parseAndValidateEvent,
  storeSystemEvent,
} from '../src/services/system-event.service.js';

const event = {
  event_id: '10000000-0000-4000-8000-000000000001',
  event_type: 'user.created',
  event_version: 1,
  aggregate_type: 'user',
  aggregate_id: '20000000-0000-4000-8000-000000000001',
  source: 'User_Service',
  occurred_at: '2026-07-23T10:00:00.000Z',
  trace_id: 'trace-id',
  request_id: 'request-id',
  data: { role: 'student' },
};

describe('System event persistence', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.pool.connect.mockResolvedValue(mocks.client);
  });

  it('validates the event envelope and matching AMQP messageId', () => {
    const result = parseAndValidateEvent(
      {
        content: Buffer.from(JSON.stringify(event)),
        properties: { messageId: event.event_id },
      },
      new Set(['user.created'])
    );

    expect(result).toEqual({
      event,
      messageId: event.event_id,
    });
  });

  it('rejects malformed or unsupported events without retrying', () => {
    expect(() =>
      parseAndValidateEvent(
        {
          content: Buffer.from('{invalid'),
          properties: {},
        },
        new Set(['user.created'])
      )
    ).toThrow(NonRetryableMessageError);

    expect(() =>
      parseAndValidateEvent(
        {
          content: Buffer.from(JSON.stringify({ ...event, event_type: 'unknown.event' })),
          properties: { messageId: event.event_id },
        },
        new Set(['user.created'])
      )
    ).toThrow('Unsupported event type');
  });

  it('stores idempotency and system event in one transaction', async () => {
    mocks.client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce(undefined);

    const result = await storeSystemEvent({
      event,
      messageId: event.event_id,
      consumerName: 'domain-events-consumer',
    });

    expect(result).toEqual({ duplicate: false });
    expect(mocks.client.query.mock.calls[0][0]).toBe('BEGIN');
    expect(mocks.client.query.mock.calls[1][0]).toContain('infra_eventing.processed_messages');
    expect(mocks.client.query.mock.calls[2][0]).toContain('infra_observability.system_events');
    expect(mocks.client.query.mock.calls[3][0]).toBe('COMMIT');
    expect(mocks.client.release).toHaveBeenCalledOnce();
  });

  it('does not create a second system event for a duplicate message', async () => {
    mocks.client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rowCount: 0 })
      .mockResolvedValueOnce(undefined);

    const result = await storeSystemEvent({
      event,
      messageId: event.event_id,
      consumerName: 'domain-events-consumer',
    });

    expect(result).toEqual({ duplicate: true });
    expect(mocks.client.query).toHaveBeenCalledTimes(3);
    expect(mocks.client.query.mock.calls[2][0]).toBe('COMMIT');
    expect(mocks.client.release).toHaveBeenCalledOnce();
  });

  it('rolls back and releases the client when persistence fails', async () => {
    mocks.client.query
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('database unavailable'))
      .mockResolvedValueOnce(undefined);

    await expect(
      storeSystemEvent({
        event,
        messageId: event.event_id,
        consumerName: 'domain-events-consumer',
      })
    ).rejects.toThrow('database unavailable');

    expect(mocks.client.query.mock.calls[2][0]).toBe('ROLLBACK');
    expect(mocks.client.release).toHaveBeenCalledOnce();
  });
});
