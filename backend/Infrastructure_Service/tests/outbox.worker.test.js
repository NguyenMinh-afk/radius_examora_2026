import { beforeEach, describe, expect, it, vi } from 'vitest';
import { processNextOutboxEvent } from '../src/workers/outbox.worker.js';

const event = {
  outbox_event_id: '10000000-0000-4000-8000-000000000001',
  event_type: 'user.created',
  exchange_name: 'examora.topic',
  routing_key: 'user.created',
  message_id: '20000000-0000-4000-8000-000000000001',
  payload: {
    event_id: '20000000-0000-4000-8000-000000000001',
    event_type: 'user.created',
    event_version: 1,
    source: 'User_Service',
  },
  retry_count: 0,
  trace_id: 'trace-id',
};

function createDependencies() {
  const client = {
    query: vi.fn(),
    release: vi.fn(),
  };
  const databasePool = {
    connect: vi.fn().mockResolvedValue(client),
  };
  const listeners = new Map();
  const channel = {
    off: vi.fn((eventName) => listeners.delete(eventName)),
    on: vi.fn((eventName, handler) => listeners.set(eventName, handler)),
    publish: vi.fn(),
    waitForConfirms: vi.fn().mockResolvedValue(undefined),
    emitReturn: (message) => listeners.get('return')?.(message),
  };
  return { channel, client, databasePool };
}

describe('Transactional outbox publisher worker', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publishes a locked PENDING event and marks it PUBLISHED', async () => {
    const { channel, client, databasePool } = createDependencies();
    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rowCount: 1, rows: [event] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce(undefined);

    const result = await processNextOutboxEvent({
      channel,
      databasePool,
    });

    expect(result).toEqual({
      processed: true,
      published: true,
      messageId: event.message_id,
    });
    expect(client.query.mock.calls[1][0]).toContain('FOR UPDATE SKIP LOCKED');
    expect(channel.publish).toHaveBeenCalledWith(
      'examora.topic',
      'user.created',
      expect.any(Buffer),
      expect.objectContaining({
        persistent: true,
        mandatory: true,
        messageId: event.message_id,
        correlationId: 'trace-id',
      })
    );
    expect(channel.waitForConfirms).toHaveBeenCalledOnce();
    expect(client.query.mock.calls[2][0]).toContain("status = 'PUBLISHED'");
    expect(client.query.mock.calls[3][0]).toBe('COMMIT');
    expect(client.release).toHaveBeenCalledOnce();
  });

  it('returns without publishing when no event is ready', async () => {
    const { channel, client, databasePool } = createDependencies();
    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rowCount: 0, rows: [] })
      .mockResolvedValueOnce(undefined);

    const result = await processNextOutboxEvent({
      channel,
      databasePool,
    });

    expect(result).toEqual({ processed: false });
    expect(channel.publish).not.toHaveBeenCalled();
    expect(client.query.mock.calls[2][0]).toBe('COMMIT');
  });

  it('keeps a failed publish PENDING and schedules exponential backoff', async () => {
    const { channel, client, databasePool } = createDependencies();
    channel.publish.mockImplementation(() => {
      throw new Error('broker unavailable');
    });
    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rowCount: 1, rows: [event] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce(undefined);

    const result = await processNextOutboxEvent({
      channel,
      databasePool,
      maxRetries: 3,
    });

    expect(result).toEqual({
      processed: true,
      published: false,
      status: 'PENDING',
      retryCount: 1,
    });
    expect(client.query.mock.calls[2][1][1]).toBe('PENDING');
    expect(client.query.mock.calls[2][1][2]).toBe(1);
    expect(client.query.mock.calls[2][1][3]).toBeInstanceOf(Date);
  });

  it('marks the event FAILED and records a database dead letter at the limit', async () => {
    const { channel, client, databasePool } = createDependencies();
    channel.waitForConfirms.mockRejectedValue(new Error('confirm timeout'));
    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({
        rowCount: 1,
        rows: [{ ...event, retry_count: 2 }],
      })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce(undefined);

    const result = await processNextOutboxEvent({
      channel,
      databasePool,
      maxRetries: 3,
    });

    expect(result.status).toBe('FAILED');
    expect(result.retryCount).toBe(3);
    expect(client.query.mock.calls[2][1][1]).toBe('FAILED');
    expect(client.query.mock.calls[3][0]).toContain('infra_eventing.dead_letter_messages');
    expect(client.query.mock.calls[4][0]).toBe('COMMIT');
  });

  it('does not mark an unroutable confirmed message as PUBLISHED', async () => {
    const { channel, client, databasePool } = createDependencies();
    channel.publish.mockImplementation(() => {
      channel.emitReturn({
        fields: { replyText: 'NO_ROUTE' },
        properties: { messageId: event.message_id },
      });
    });
    client.query
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce({ rowCount: 1, rows: [event] })
      .mockResolvedValueOnce({ rowCount: 1 })
      .mockResolvedValueOnce(undefined);

    const result = await processNextOutboxEvent({
      channel,
      databasePool,
      maxRetries: 3,
    });

    expect(result).toEqual({
      processed: true,
      published: false,
      status: 'PENDING',
      retryCount: 1,
    });
    expect(client.query.mock.calls[2][1][4]).toContain('NO_ROUTE');
  });

  it('rolls back and releases the database client on database errors', async () => {
    const { channel, client, databasePool } = createDependencies();
    client.query
      .mockResolvedValueOnce(undefined)
      .mockRejectedValueOnce(new Error('database unavailable'))
      .mockResolvedValueOnce(undefined);

    await expect(processNextOutboxEvent({ channel, databasePool })).rejects.toThrow(
      'database unavailable'
    );

    expect(client.query.mock.calls[2][0]).toBe('ROLLBACK');
    expect(client.release).toHaveBeenCalledOnce();
  });
});
