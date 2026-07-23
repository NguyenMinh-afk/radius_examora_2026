/**
 * RabbitMQ connection and topology owned by Infrastructure Service.
 *
 * Python AI Worker is the only consumer of ai.generation. Infrastructure
 * declares that queue so the whole platform shares one durable topology, but
 * it only consumes email.send and notification.send.
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
  EMAIL_SEND_DLQ: 'email.send.dlq',
  NOTIFICATION_SEND: 'notification.send',
  NOTIFICATION_SEND_DLQ: 'notification.send.dlq',
  EXAM_RESULTS: 'exam.results',
  EXAM_RESULTS_DLQ: 'exam.results.dlq',
});

export const ROUTING_KEYS = Object.freeze({
  AI_GENERATE: 'ai.generate',
  EMAIL_SEND: 'email.send',
  NOTIFICATION_NEW: 'notification.new',
  EXAM_COMPLETED: 'exam.completed',
  USER_REGISTERED: 'user.registered',
  EXAM_CREATED: 'exam.created',
  QUESTION_CREATED: 'question.created',
  QUESTION_UPDATED: 'question.updated',
  QUESTION_DELETED: 'question.deleted',
});

export const QUEUE_CONFIGS = Object.freeze([
  Object.freeze({
    queue: QUEUES.AI_GENERATION,
    dlq: QUEUES.AI_GENERATION_DLQ,
    routingKeys: Object.freeze([ROUTING_KEYS.AI_GENERATE]),
    arguments: Object.freeze({
      'x-message-ttl': 3_600_000,
    }),
  }),
  Object.freeze({
    queue: QUEUES.EMAIL_SEND,
    dlq: QUEUES.EMAIL_SEND_DLQ,
    routingKeys: Object.freeze([ROUTING_KEYS.EMAIL_SEND]),
  }),
  Object.freeze({
    queue: QUEUES.NOTIFICATION_SEND,
    dlq: QUEUES.NOTIFICATION_SEND_DLQ,
    routingKeys: Object.freeze([ROUTING_KEYS.NOTIFICATION_NEW]),
  }),
  Object.freeze({
    queue: QUEUES.EXAM_RESULTS,
    dlq: QUEUES.EXAM_RESULTS_DLQ,
    routingKeys: Object.freeze([ROUTING_KEYS.EXAM_COMPLETED]),
  }),
]);

let connection = null;
let channel = null;
let connectingPromise = null;

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
          }
          console.log('[RabbitMQ] Connection closed');
        });
        currentChannel.on('error', (error) => {
          console.error('[RabbitMQ] Channel error:', error.message);
        });
        currentChannel.on('close', () => {
          if (channel === currentChannel) {
            channel = null;
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
  }
}

export default {
  connectRabbitMQ,
  setupExchangesAndQueues,
  getChannel,
  getRabbitMQStatus,
  closeRabbitMQ,
  EXCHANGES,
  QUEUES,
  ROUTING_KEYS,
  QUEUE_CONFIGS,
};
