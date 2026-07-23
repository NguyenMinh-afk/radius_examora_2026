import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ack: vi.fn(),
  consume: vi.fn(),
  nack: vi.fn(),
  post: vi.fn(),
}));

vi.mock('axios', () => ({
  default: {
    post: mocks.post,
  },
}));

vi.mock('../src/config/rabbitmq.js', () => ({
  getChannel: () => ({
    ack: mocks.ack,
    consume: mocks.consume,
    nack: mocks.nack,
  }),
  QUEUES: {
    NOTIFICATION_SEND: 'notification.send',
  },
}));

import { startNotificationConsumer } from '../src/workers/notification.consumer.js';

describe('Notification RabbitMQ consumer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('calls the internal notification endpoint and ACKs valid messages', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });
    mocks.post.mockResolvedValue({ data: { id: 'notification-id' } });

    await startNotificationConsumer();

    const message = {
      content: Buffer.from(
        JSON.stringify({
          userId: 'user-id',
          type: 'system',
          title: 'Test',
          content: 'RabbitMQ works',
          metadata: {},
        })
      ),
    };
    await handler(message);

    expect(mocks.consume).toHaveBeenCalledWith('notification.send', expect.any(Function));
    expect(mocks.post).toHaveBeenCalledWith(
      'http://localhost:3004/api/notifications/internal',
      {
        user_id: 'user-id',
        type: 'system',
        title: 'Test',
        content: 'RabbitMQ works',
        metadata: {},
      },
      expect.objectContaining({ timeout: 10_000 })
    );
    expect(mocks.ack).toHaveBeenCalledWith(message);
    expect(mocks.nack).not.toHaveBeenCalled();
  });

  it('rejects invalid messages to the configured DLQ', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });

    await startNotificationConsumer();

    const message = {
      content: Buffer.from(JSON.stringify({ userId: 'user-id' })),
    };
    await handler(message);

    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.ack).not.toHaveBeenCalled();
    expect(mocks.nack).toHaveBeenCalledWith(message, false, false);
  });
});
