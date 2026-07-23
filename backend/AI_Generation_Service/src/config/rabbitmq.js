/**
 * RabbitMQ publisher for asynchronous AI generation tasks.
 */
import amqp from 'amqplib';
import { randomUUID } from 'node:crypto';

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  `amqp://${process.env.RABBITMQ_USER || 'admin'}:${process.env.RABBITMQ_PASSWORD || 'StrongPassword123'}@${process.env.RABBITMQ_HOST || 'localhost'}:${process.env.RABBITMQ_PORT || 5672}`;

const EXCHANGE_NAME = process.env.RABBITMQ_EXCHANGE || 'examora.topic';
const ROUTING_KEY = process.env.RABBITMQ_ROUTING_KEY || 'ai.generate';
const QUEUE_NAME = process.env.RABBITMQ_QUEUE || 'ai.generation';
const DLX_NAME = process.env.RABBITMQ_DLX || 'examora.dlx';
const DLQ_NAME = process.env.RABBITMQ_DLQ || 'ai.generation.dlq';
const MESSAGE_TTL_MS = 3_600_000;

let connection = null;
let channel = null;
let connectingPromise = null;

async function setupTopology(currentChannel) {
  await currentChannel.assertExchange(EXCHANGE_NAME, 'topic', { durable: true });
  await currentChannel.assertExchange(DLX_NAME, 'direct', { durable: true });

  await currentChannel.assertQueue(DLQ_NAME, { durable: true });
  await currentChannel.bindQueue(DLQ_NAME, DLX_NAME, DLQ_NAME);

  await currentChannel.assertQueue(QUEUE_NAME, {
    durable: true,
    arguments: {
      'x-dead-letter-exchange': DLX_NAME,
      'x-dead-letter-routing-key': DLQ_NAME,
      'x-message-ttl': MESSAGE_TTL_MS,
    },
  });
  await currentChannel.bindQueue(QUEUE_NAME, EXCHANGE_NAME, ROUTING_KEY);
}

async function createConnection() {
  try {
    const currentConnection = await amqp.connect(RABBITMQ_URL);
    const currentChannel = await currentConnection.createConfirmChannel();

    currentConnection.on('error', (error) => {
      console.error('[AI Publisher] Connection error:', error.message);
    });
    currentConnection.on('close', () => {
      if (connection === currentConnection) {
        connection = null;
        channel = null;
      }
      console.log('[AI Publisher] Connection closed');
    });
    currentChannel.on('error', (error) => {
      console.error('[AI Publisher] Channel error:', error.message);
    });
    currentChannel.on('close', () => {
      if (channel === currentChannel) {
        channel = null;
      }
    });

    await setupTopology(currentChannel);

    connection = currentConnection;
    channel = currentChannel;
    console.log(
      `[AI Publisher] RabbitMQ ready: ${EXCHANGE_NAME} --${ROUTING_KEY}--> ${QUEUE_NAME}`
    );
    return currentChannel;
  } catch (error) {
    connection = null;
    channel = null;
    console.error('[AI Publisher] Failed to connect or configure topology:', error.message);
    throw error;
  }
}

async function connect() {
  if (channel) {
    return channel;
  }
  if (!connectingPromise) {
    connectingPromise = createConnection().finally(() => {
      connectingPromise = null;
    });
  }
  return connectingPromise;
}

/**
 * Publish an AI generation task and wait for broker confirmation.
 */
export async function publishAIGeneration(data) {
  const currentChannel = await connect();
  const messageId = randomUUID();
  const message = {
    request_id: data.requestId,
    task_id: data.taskId,
    trace_id: data.traceId,
  };

  currentChannel.publish(EXCHANGE_NAME, ROUTING_KEY, Buffer.from(JSON.stringify(message)), {
    persistent: true,
    contentType: 'application/json',
    contentEncoding: 'utf-8',
    messageId,
    correlationId: data.traceId,
    type: ROUTING_KEY,
    timestamp: Date.now(),
    headers: {
      'x-service': 'AI_Generation_Service',
      'x-trace-id': data.traceId,
    },
  });
  await currentChannel.waitForConfirms();

  console.log(
    `[AI Publisher] Message confirmed: id=${messageId}, request=${data.requestId}, task=${data.taskId}`
  );
  return { messageId };
}

export async function close() {
  const currentChannel = channel;
  const currentConnection = connection;
  channel = null;
  connection = null;

  try {
    if (currentChannel) {
      await currentChannel.close();
    }
    if (currentConnection) {
      await currentConnection.close();
    }
    console.log('[AI Publisher] Connection closed gracefully');
  } catch (error) {
    console.error('[AI Publisher] Error closing connection:', error.message);
  }
}

export default { publishAIGeneration, close };
