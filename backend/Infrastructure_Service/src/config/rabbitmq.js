/**
 * RabbitMQ connection and topology owned by Infrastructure Service.
 *
 * Python AI Worker is the only consumer of ai.generation. Infrastructure
 * declares that queue so the whole platform shares one durable topology, but
 * it consumes the platform infrastructure queues.
 */
import amqp from 'amqplib';

const DEFAULT_RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  `amqp://${process.env.RABBITMQ_USER || 'admin'}:${process.env.RABBITMQ_PASSWORD || 'StrongPassword123'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;

export const EXCHANGES = Object.freeze({
  EXAMORA_TOPIC: 'examora.topic',
  EXAMORA_DLX: 'examora.dlx',
});

export const QUEUES = Object.freeze({
  AI_GENERATION: 'ai.generation',
  AI_GENERATION_DLQ: 'ai.generation.dlq',
  EMAIL_SEND: 'email.send',
  EMAIL_SEND_RETRY: 'email.send.retry',
  EMAIL_SEND_DLQ: 'email.send.dlq',
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_SEND_RETRY: 'notification.send.retry',
  NOTIFICATION_SEND_DLQ: 'notification.send.dlq',
  DOMAIN_EVENTS: 'domain.events',
  DOMAIN_EVENTS_RETRY: 'domain.events.retry',
  DOMAIN_EVENTS_DLQ: 'domain.events.dlq',
  EXAM_RESULTS: 'exam.results',
  EXAM_RESULTS_RETRY: 'exam.results.retry',
  EXAM_RESULTS_DLQ: 'exam.results.dlq',
});

export const ROUTING_KEYS = Object.freeze({
  AI_GENERATE: 'ai.generate',
  EMAIL_SEND: 'email.send',
  EMAIL_SEND_RETRY: 'email.send.retry',
  NOTIFICATION_NEW: 'notification.new',
  NOTIFICATION_SEND_RETRY: 'notification.send.retry',
  EXAM_COMPLETED: 'exam.completed',
  USER_CREATED: 'user.created',
  USER_UPDATED: 'user.updated',
  EXAM_CREATED: 'exam.created',
  EXAM_UPDATED: 'exam.updated',
  EXAM_DELETED: 'exam.deleted',
  QUESTION_CREATED: 'question.created',
  QUESTION_UPDATED: 'question.updated',
  QUESTION_DELETED: 'question.deleted',
  DOMAIN_EVENTS_RETRY: 'domain.events.retry',
  EXAM_RESULTS_RETRY: 'exam.results.retry',
});

export const QUEUE_CONFIGS = Object.freeze([
  Object.freeze({
    queue: QUEUES.AI_GENERATION,
    dlq: QUEUES.AI_GENERATION_DLQ,
    routingKeys: Object.freeze([ROUTING_KEYS.AI_GENERATE]),
    arguments: Object.freeze({
      'x-max-length': 1000,
      'x-overflow': 'reject-publish',
    }),
  }),
  Object.freeze({
    queue: QUEUES.EMAIL_SEND,
    retryQueue: QUEUES.EMAIL_SEND_RETRY,
    dlq: QUEUES.EMAIL_SEND_DLQ,
    retryRoutingKey: ROUTING_KEYS.EMAIL_SEND_RETRY,
    retryDelayMs: 5_000,
    routingKeys: Object.freeze([ROUTING_KEYS.EMAIL_SEND, ROUTING_KEYS.EMAIL_SEND_RETRY]),
  }),
  Object.freeze({
    queue: QUEUES.NOTIFICATION_SEND,
    retryQueue: QUEUES.NOTIFICATION_SEND_RETRY,
    dlq: QUEUES.NOTIFICATION_SEND_DLQ,
    retryRoutingKey: ROUTING_KEYS.NOTIFICATION_SEND_RETRY,
    retryDelayMs: 5_000,
    routingKeys: Object.freeze([
      ROUTING_KEYS.NOTIFICATION_NEW,
      ROUTING_KEYS.NOTIFICATION_SEND_RETRY,
    ]),
  }),
  Object.freeze({
    queue: QUEUES.DOMAIN_EVENTS,
    retryQueue: QUEUES.DOMAIN_EVENTS_RETRY,
    dlq: QUEUES.DOMAIN_EVENTS_DLQ,
    retryRoutingKey: ROUTING_KEYS.DOMAIN_EVENTS_RETRY,
    routingKeys: Object.freeze([
      ROUTING_KEYS.USER_CREATED,
      ROUTING_KEYS.USER_UPDATED,
      ROUTING_KEYS.EXAM_CREATED,
      ROUTING_KEYS.EXAM_UPDATED,
      ROUTING_KEYS.EXAM_DELETED,
      ROUTING_KEYS.QUESTION_CREATED,
      ROUTING_KEYS.QUESTION_UPDATED,
      ROUTING_KEYS.QUESTION_DELETED,
      ROUTING_KEYS.DOMAIN_EVENTS_RETRY,
    ]),
    retryDelayMs: 5_000,
  }),
  Object.freeze({
    queue: QUEUES.EXAM_RESULTS,
    retryQueue: QUEUES.EXAM_RESULTS_RETRY,
    dlq: QUEUES.EXAM_RESULTS_DLQ,
    retryRoutingKey: ROUTING_KEYS.EXAM_RESULTS_RETRY,
    routingKeys: Object.freeze([
      ROUTING_KEYS.EXAM_COMPLETED,
      ROUTING_KEYS.EXAM_RESULTS_RETRY,
    ]),
    retryDelayMs: 5_000,
  }),
]);

let connection = null;
let channel = null;
let connectingPromise = null;
let disconnectHandler = null;
let closing = false;

function notifyDisconnected(reason) {
  if (closing || !disconnectHandler) {
    return;
  }

  try {
    disconnectHandler(reason);
  } catch (error) {
    console.error('[RabbitMQ] Disconnect handler failed:', error.message);
  }
}

export function setRabbitMQDisconnectHandler(handler) {
  disconnectHandler = typeof handler === 'function' ? handler : null;
}

function sanitizeUrl(url) {
  return url.replace(/:[^:@]+@/, ':***@');
}

export async function connectRabbitMQ(url = DEFAULT_RABBITMQ_URL) {
  if (connection && channel) {
    return { connection, channel };
  }

  if (!connectingPromise) {
    connectingPromise = (async () => {
      try {
        closing = false;
        console.log('[RabbitMQ] Connecting to:', sanitizeUrl(url));
        const currentConnection = await amqp.connect(url);
        const currentChannel = await currentConnection.createConfirmChannel();

        await currentChannel.prefetch(1);

        currentConnection.on('error', (error) => {
          console.error('[RabbitMQ] Connection error:', error.message);
        });
        currentConnection.on('close', () => {
          if (connection === currentConnection) {
            connection = null;
            channel = null;
            notifyDisconnected(new Error('RabbitMQ connection closed'));
          }
          console.log('[RabbitMQ] Connection closed');
        });
        currentChannel.on('error', (error) => {
          console.error('[RabbitMQ] Channel error:', error.message);
        });
        currentChannel.on('close', () => {
          if (channel === currentChannel) {
            channel = null;
            connection = null;
            notifyDisconnected(new Error('RabbitMQ channel closed'));
            if (!closing) {
              void currentConnection.close().catch(() => {});
            }
          }
        });

        connection = currentConnection;
        channel = currentChannel;
        console.log('[RabbitMQ] Connected successfully');
        return { connection, channel };
      } catch (error) {
        connection = null;
        channel = null;
        console.error('[RabbitMQ] Failed to connect:', error.message);
        throw error;
      }
    })().finally(() => {
      connectingPromise = null;
    });
  }

  return connectingPromise;
}

export async function setupExchangesAndQueues() {
  const { channel: currentChannel } = await connectRabbitMQ();

  await currentChannel.assertExchange(EXCHANGES.EXAMORA_DLX, 'direct', {
    durable: true,
  });
  await currentChannel.assertExchange(EXCHANGES.EXAMORA_TOPIC, 'topic', {
    durable: true,
  });

  for (const config of QUEUE_CONFIGS) {
    await currentChannel.assertQueue(config.dlq, { durable: true });
    await currentChannel.bindQueue(config.dlq, EXCHANGES.EXAMORA_DLX, config.dlq);

    if (config.retryQueue) {
      await currentChannel.assertQueue(config.retryQueue, {
        durable: true,
        arguments: {
          'x-message-ttl': config.retryDelayMs,
          'x-dead-letter-exchange': EXCHANGES.EXAMORA_TOPIC,
          'x-dead-letter-routing-key': config.retryRoutingKey,
        },
      });
    }

    await currentChannel.assertQueue(config.queue, {
      durable: true,
      arguments: {
        'x-dead-letter-exchange': EXCHANGES.EXAMORA_DLX,
        'x-dead-letter-routing-key': config.dlq,
        ...(config.arguments || {}),
      },
    });

    for (const routingKey of config.routingKeys) {
      await currentChannel.bindQueue(config.queue, EXCHANGES.EXAMORA_TOPIC, routingKey);
    }

    console.log(`[RabbitMQ] Queue setup: ${config.queue}`);
  }

  console.log('[RabbitMQ] All exchanges and queues configured');
}

export function getChannel() {
  if (!channel) {
    throw new Error('RabbitMQ channel not initialized. Call connectRabbitMQ() first.');
  }
  return channel;
}

export function getRabbitMQStatus() {
  return {
    connected: Boolean(connection && channel),
    channelOpen: Boolean(channel),
  };
}

export async function closeRabbitMQ() {
  closing = true;
  const currentChannel = channel;
  const currentConnection = connection;
  channel = null;
  connection = null;
  connectingPromise = null;

  try {
    if (currentChannel) {
      await currentChannel.close();
    }
    if (currentConnection) {
      await currentConnection.close();
    }
    console.log('[RabbitMQ] Connection closed gracefully');
  } catch (error) {
    console.error('[RabbitMQ] Error closing:', error.message);
  } finally {
    closing = false;
  }
}

export default {
  connectRabbitMQ,
  setupExchangesAndQueues,
  getChannel,
  getRabbitMQStatus,
  setRabbitMQDisconnectHandler,
  closeRabbitMQ,
  EXCHANGES,
  QUEUES,
  ROUTING_KEYS,
  QUEUE_CONFIGS,
};
