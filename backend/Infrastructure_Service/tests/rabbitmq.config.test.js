import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const channel = {
    ack: vi.fn(),
    assertExchange: vi.fn(),
    assertQueue: vi.fn(),
    bindQueue: vi.fn(),
    close: vi.fn(),
    consume: vi.fn(),
    nack: vi.fn(),
    on: vi.fn(),
    prefetch: vi.fn(),
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
  };
});

vi.mock('amqplib', () => ({
  default: {
    connect: mocks.connect,
  },
}));

import {
  closeRabbitMQ,
  connectRabbitMQ,
  EXCHANGES,
  QUEUE_CONFIGS,
  QUEUES,
  ROUTING_KEYS,
  setupExchangesAndQueues,
} from '../src/config/rabbitmq.js';

describe('RabbitMQ infrastructure topology', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connect.mockResolvedValue(mocks.connection);
    mocks.connection.createConfirmChannel.mockResolvedValue(mocks.channel);
    mocks.channel.prefetch.mockResolvedValue(undefined);
    mocks.channel.assertExchange.mockResolvedValue(undefined);
    mocks.channel.assertQueue.mockResolvedValue(undefined);
    mocks.channel.bindQueue.mockResolvedValue(undefined);
    mocks.channel.close.mockResolvedValue(undefined);
    mocks.connection.close.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await closeRabbitMQ();
  });

  it('uses the agreed EXMORA names', () => {
    expect(EXCHANGES).toEqual({
      EXAMORA_TOPIC: 'examora.topic',
      EXAMORA_DLX: 'examora.dlx',
    });
    expect(QUEUES.AI_GENERATION).toBe('ai.generation');
    expect(QUEUES.AI_GENERATION_DLQ).toBe('ai.generation.dlq');
    expect(QUEUES.DOMAIN_EVENTS).toBe('domain.events');
    expect(QUEUES.DOMAIN_EVENTS_DLQ).toBe('domain.events.dlq');
    expect(QUEUES.EXAM_RESULTS).toBe('exam.results');
    expect(ROUTING_KEYS.AI_GENERATE).toBe('ai.generate');
  });

  it('creates one confirm channel with controlled prefetch', async () => {
    const result = await connectRabbitMQ('amqp://test:test@rabbitmq:5672');

    expect(mocks.connect).toHaveBeenCalledWith('amqp://test:test@rabbitmq:5672');
    expect(mocks.connection.createConfirmChannel).toHaveBeenCalledOnce();
    expect(mocks.channel.prefetch).toHaveBeenCalledWith(1);
    expect(result).toEqual({
      connection: mocks.connection,
      channel: mocks.channel,
    });
  });

  it('declares each durable queue, DLQ and binding consistently', async () => {
    await connectRabbitMQ('amqp://test:test@rabbitmq:5672');
    await setupExchangesAndQueues();

    expect(mocks.channel.assertExchange).toHaveBeenCalledWith(EXCHANGES.EXAMORA_DLX, 'direct', {
      durable: true,
    });
    expect(mocks.channel.assertExchange).toHaveBeenCalledWith(EXCHANGES.EXAMORA_TOPIC, 'topic', {
      durable: true,
    });

    for (const config of QUEUE_CONFIGS) {
      expect(mocks.channel.assertQueue).toHaveBeenCalledWith(config.dlq, {
        durable: true,
      });
      expect(mocks.channel.bindQueue).toHaveBeenCalledWith(
        config.dlq,
        EXCHANGES.EXAMORA_DLX,
        config.dlq
      );

      if (config.retryQueue) {
        expect(mocks.channel.assertQueue).toHaveBeenCalledWith(config.retryQueue, {
          durable: true,
          arguments: {
            'x-message-ttl': config.retryDelayMs,
            'x-dead-letter-exchange': EXCHANGES.EXAMORA_TOPIC,
            'x-dead-letter-routing-key': config.retryRoutingKey,
          },
        });
      }

      expect(mocks.channel.assertQueue).toHaveBeenCalledWith(config.queue, {
        durable: true,
        arguments: {
          'x-dead-letter-exchange': EXCHANGES.EXAMORA_DLX,
          'x-dead-letter-routing-key': config.dlq,
          ...(config.arguments || {}),
        },
      });

      for (const routingKey of config.routingKeys) {
        expect(mocks.channel.bindQueue).toHaveBeenCalledWith(
          config.queue,
          EXCHANGES.EXAMORA_TOPIC,
          routingKey
        );
      }
    }
  });
});
