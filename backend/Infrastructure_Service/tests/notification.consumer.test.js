import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ack: vi.fn(),
  consume: vi.fn(),
  isMessageProcessed: vi.fn(),
  markMessageProcessed: vi.fn(),
  nack: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  post: vi.fn(),
  sendToQueue: vi.fn(),
  waitForConfirms: vi.fn(),
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
    off: mocks.off,
    on: mocks.on,
    sendToQueue: mocks.sendToQueue,
    waitForConfirms: mocks.waitForConfirms,
  }),
  QUEUES: {
    NOTIFICATION_SEND: 'notification.send',
    NOTIFICATION_SEND_RETRY: 'notification.send.retry',
  },
}));

vi.mock('../src/services/message-idempotency.service.js', () => ({
  isMessageProcessed: mocks.isMessageProcessed,
  markMessageProcessed: mocks.markMessageProcessed,
}));

import { startNotificationConsumer } from '../src/workers/notification.consumer.js';

describe('Notification RabbitMQ consumer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.isMessageProcessed.mockResolvedValue(false);
    mocks.markMessageProcessed.mockResolvedValue(true);
    mocks.waitForConfirms.mockResolvedValue(undefined);
  });

  it('calls the internal notification endpoint and ACKs valid messages', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });
    mocks.post.mockResolvedValue({ data: { id: 'notification-id' } });

    await startNotificationConsumer();

    const message = {
      properties: {
        headers: {},
        messageId: 'message-id',
      },
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
        message_id: 'message-id',
      },
      expect.objectContaining({ timeout: 10_000 })
    );
    expect(mocks.ack).toHaveBeenCalledWith(message);
    expect(mocks.nack).not.toHaveBeenCalled();
    expect(mocks.markMessageProcessed).toHaveBeenCalledWith(
      'notification-consumer',
      'message-id'
    );
  });

  it('rejects invalid messages to the configured DLQ', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });

    await startNotificationConsumer();

    const message = {
      properties: {
        headers: {},
        messageId: 'message-id',
      },
      content: Buffer.from(JSON.stringify({ userId: 'user-id' })),
    };
    await handler(message);

    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.ack).not.toHaveBeenCalled();
    expect(mocks.nack).toHaveBeenCalledWith(message, false, false);
  });

  it('schedules a bounded retry for temporary HTTP failures', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });
    mocks.post.mockRejectedValue(new Error('service unavailable'));

    await startNotificationConsumer();

    const message = {
      properties: {
        headers: {},
        messageId: 'message-id',
      },
      content: Buffer.from(
        JSON.stringify({
          userId: 'user-id',
          title: 'Test',
          content: 'Retry me',
        })
      ),
    };
    await handler(message);

    expect(mocks.sendToQueue).toHaveBeenCalledWith(
      'notification.send.retry',
      message.content,
      expect.objectContaining({
        mandatory: true,
        headers: expect.objectContaining({ 'x-retry-count': 1 }),
      })
    );
    expect(mocks.waitForConfirms).toHaveBeenCalledOnce();
    expect(mocks.ack).toHaveBeenCalledWith(message);
  });

  it('ACKs a duplicate without calling Notification Service again', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });
    mocks.isMessageProcessed.mockResolvedValue(true);

    await startNotificationConsumer();

    const message = {
      properties: {
        headers: {},
        messageId: 'message-id',
      },
      content: Buffer.from('{}'),
    };
    await handler(message);

    expect(mocks.post).not.toHaveBeenCalled();
    expect(mocks.ack).toHaveBeenCalledWith(message);
  });
});
