import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const channel = {
    assertExchange: vi.fn(),
    assertQueue: vi.fn(),
    bindQueue: vi.fn(),
    close: vi.fn(),
    on: vi.fn(),
    publish: vi.fn(),
    waitForConfirms: vi.fn(),
  };
  const connection = {
    close: vi.fn(),
    createConfirmChannel: vi.fn(),
    on: vi.fn(),
  };
  return {
    channel,
    connection,
    connect: vi.fn(),
    listeners: new Map(),
  };
});

vi.mock('amqplib', () => ({
  default: {
    connect: mocks.connect,
  },
}));

import {
  close,
  publishAIGeneration,
} from '../src/config/rabbitmq.js';

describe('AI Generation RabbitMQ publisher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.listeners.clear();
    mocks.connect.mockResolvedValue(mocks.connection);
    mocks.connection.createConfirmChannel.mockResolvedValue(mocks.channel);
    mocks.channel.assertExchange.mockResolvedValue(undefined);
    mocks.channel.assertQueue.mockResolvedValue(undefined);
    mocks.channel.bindQueue.mockResolvedValue(undefined);
    mocks.channel.close.mockResolvedValue(undefined);
    mocks.connection.close.mockResolvedValue(undefined);
    mocks.channel.waitForConfirms.mockResolvedValue(undefined);
    mocks.channel.on.mockImplementation((eventName, handler) => {
      mocks.listeners.set(eventName, handler);
    });
  });

  afterEach(async () => {
    await close();
  });

  it('declares AI queue without expiry and mandatory-publishes the contract', async () => {
    const result = await publishAIGeneration({
      requestId: 'request-id',
      taskId: 'task-id',
      traceId: 'trace-id',
    });

    expect(mocks.channel.assertQueue).toHaveBeenCalledWith('ai.generation', {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': 'examora.dlx',
        'x-dead-letter-routing-key': 'ai.generation.dlq',
        'x-max-length': 1000,
        'x-overflow': 'reject-publish',
      },
    });
    expect(mocks.channel.publish).toHaveBeenCalledWith(
      'examora.topic',
      'ai.generate',
      expect.any(Buffer),
      expect.objectContaining({
        mandatory: true,
        persistent: true,
        correlationId: 'trace-id',
      })
    );
    expect(mocks.channel.waitForConfirms).toHaveBeenCalledOnce();
    expect(result.messageId).toEqual(expect.any(String));
  });

  it('rejects an unroutable confirmed task', async () => {
    mocks.channel.publish.mockImplementation((_exchange, _routingKey, _body, options) => {
      mocks.listeners.get('return')?.({
        fields: { replyText: 'NO_ROUTE' },
        properties: { messageId: options.messageId },
      });
    });

    await expect(
      publishAIGeneration({
        requestId: 'request-id',
        taskId: 'task-id',
        traceId: 'trace-id',
      })
    ).rejects.toThrow('NO_ROUTE');
  });
});
