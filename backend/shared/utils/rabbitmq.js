/**
 * Shared RabbitMQ client for Node services.
 *
 * Topology names must stay aligned with Infrastructure Service and the Python
 * AI Worker. Service-specific consumers remain in their owning services.
 */
export const EXCHANGES = Object.freeze({
  EXAMORA_TOPIC: "examora.topic",
  EXAMORA_DLX: "examora.dlx",
});

export const QUEUES = Object.freeze({
  AI_GENERATION: "ai.generation",
  AI_GENERATION_DLQ: "ai.generation.dlq",
  EMAIL_SEND: "email.send",
  EMAIL_SEND_RETRY: "email.send.retry",
  EMAIL_SEND_DLQ: "email.send.dlq",
  NOTIFICATION_SEND: "notification.send",
  NOTIFICATION_SEND_RETRY: "notification.send.retry",
  NOTIFICATION_SEND_DLQ: "notification.send.dlq",
  DOMAIN_EVENTS: "domain.events",
  DOMAIN_EVENTS_RETRY: "domain.events.retry",
  DOMAIN_EVENTS_DLQ: "domain.events.dlq",
  EXAM_RESULTS: "exam.results",
  EXAM_RESULTS_RETRY: "exam.results.retry",
  EXAM_RESULTS_DLQ: "exam.results.dlq",
});

export const ROUTING_KEYS = Object.freeze({
  AI_GENERATE: "ai.generate",
  EMAIL_SEND: "email.send",
  EMAIL_SEND_RETRY: "email.send.retry",
  NOTIFICATION_NEW: "notification.new",
  NOTIFICATION_SEND_RETRY: "notification.send.retry",
  EXAM_COMPLETED: "exam.completed",
  USER_CREATED: "user.created",
  USER_UPDATED: "user.updated",
  EXAM_CREATED: "exam.created",
  EXAM_UPDATED: "exam.updated",
  EXAM_DELETED: "exam.deleted",
  QUESTION_CREATED: "question.created",
  QUESTION_UPDATED: "question.updated",
  QUESTION_DELETED: "question.deleted",
  DOMAIN_EVENTS_RETRY: "domain.events.retry",
  EXAM_RESULTS_RETRY: "exam.results.retry",
});

const QUEUE_CONFIGS = Object.freeze([
  {
    queue: QUEUES.AI_GENERATION,
    dlq: QUEUES.AI_GENERATION_DLQ,
    routingKeys: [ROUTING_KEYS.AI_GENERATE],
    arguments: {
      'x-max-length': 1000,
      'x-overflow': 'reject-publish',
    },
  },
  {
    queue: QUEUES.EMAIL_SEND,
    retryQueue: QUEUES.EMAIL_SEND_RETRY,
    dlq: QUEUES.EMAIL_SEND_DLQ,
    retryRoutingKey: ROUTING_KEYS.EMAIL_SEND_RETRY,
    retryDelayMs: 5_000,
    routingKeys: [ROUTING_KEYS.EMAIL_SEND, ROUTING_KEYS.EMAIL_SEND_RETRY],
  },
  {
    queue: QUEUES.NOTIFICATION_SEND,
    retryQueue: QUEUES.NOTIFICATION_SEND_RETRY,
    dlq: QUEUES.NOTIFICATION_SEND_DLQ,
    retryRoutingKey: ROUTING_KEYS.NOTIFICATION_SEND_RETRY,
    retryDelayMs: 5_000,
    routingKeys: [
      ROUTING_KEYS.NOTIFICATION_NEW,
      ROUTING_KEYS.NOTIFICATION_SEND_RETRY,
    ],
  },
  {
    queue: QUEUES.DOMAIN_EVENTS,
    retryQueue: QUEUES.DOMAIN_EVENTS_RETRY,
    dlq: QUEUES.DOMAIN_EVENTS_DLQ,
    retryRoutingKey: ROUTING_KEYS.DOMAIN_EVENTS_RETRY,
    retryDelayMs: 5_000,
    routingKeys: [
      ROUTING_KEYS.USER_CREATED,
      ROUTING_KEYS.USER_UPDATED,
      ROUTING_KEYS.EXAM_CREATED,
      ROUTING_KEYS.EXAM_UPDATED,
      ROUTING_KEYS.EXAM_DELETED,
      ROUTING_KEYS.QUESTION_CREATED,
      ROUTING_KEYS.QUESTION_UPDATED,
      ROUTING_KEYS.QUESTION_DELETED,
      ROUTING_KEYS.DOMAIN_EVENTS_RETRY,
    ],
  },
  {
    queue: QUEUES.EXAM_RESULTS,
    retryQueue: QUEUES.EXAM_RESULTS_RETRY,
    dlq: QUEUES.EXAM_RESULTS_DLQ,
    retryRoutingKey: ROUTING_KEYS.EXAM_RESULTS_RETRY,
    retryDelayMs: 5_000,
    routingKeys: [
      ROUTING_KEYS.EXAM_COMPLETED,
      ROUTING_KEYS.EXAM_RESULTS_RETRY,
    ],
  },
]);

let channel = null;
let connection = null;

export async function connectRabbitMQ(url) {
  if (connection) {
    return connection;
  }

  const amqpModule = await import("amqplib");
  const amqp = amqpModule.default || amqpModule;
  const currentConnection = await amqp.connect(url);

  currentConnection.on("error", (error) => {
    console.error("[RabbitMQ] Connection error:", error.message);
  });
  currentConnection.on("close", () => {
    if (connection === currentConnection) {
      connection = null;
      channel = null;
    }
    console.warn("[RabbitMQ] Connection closed");
  });

  connection = currentConnection;
  return currentConnection;
}

export async function createChannel(prefetch = 10) {
  if (!connection) {
    throw new Error("RabbitMQ not connected");
  }
  if (channel) {
    return channel;
  }

  const currentChannel = await connection.createConfirmChannel();
  await currentChannel.prefetch(prefetch);
  currentChannel.on("close", () => {
    if (channel === currentChannel) {
      channel = null;
    }
  });
  channel = currentChannel;
  return currentChannel;
}

export async function setupExchangesAndQueues() {
  if (!channel) {
    throw new Error("RabbitMQ channel not created");
  }

  await channel.assertExchange(EXCHANGES.EXAMORA_TOPIC, "topic", {
    durable: true,
  });
  await channel.assertExchange(EXCHANGES.EXAMORA_DLX, "direct", {
    durable: true,
  });

  for (const config of QUEUE_CONFIGS) {
    await channel.assertQueue(config.dlq, { durable: true });
    await channel.bindQueue(config.dlq, EXCHANGES.EXAMORA_DLX, config.dlq);
    if (config.retryQueue) {
      await channel.assertQueue(config.retryQueue, {
        durable: true,
        arguments: {
          "x-message-ttl": config.retryDelayMs,
          "x-dead-letter-exchange": EXCHANGES.EXAMORA_TOPIC,
          "x-dead-letter-routing-key": config.retryRoutingKey,
        },
      });
    }
    await channel.assertQueue(config.queue, {
      durable: true,
      arguments: {
        "x-dead-letter-exchange": EXCHANGES.EXAMORA_DLX,
        "x-dead-letter-routing-key": config.dlq,
        ...(config.arguments || {}),
      },
    });
    for (const routingKey of config.routingKeys) {
      await channel.bindQueue(
        config.queue,
        EXCHANGES.EXAMORA_TOPIC,
        routingKey,
      );
    }
  }

  console.log("[RabbitMQ] Standard EXAMORA topology configured");
}

export async function publishMessage(
  exchange,
  routingKey,
  message,
  options = {},
) {
  if (!channel) {
    throw new Error("RabbitMQ channel not created");
  }

  channel.publish(exchange, routingKey, Buffer.from(JSON.stringify(message)), {
    persistent: true,
    mandatory: true,
    contentType: "application/json",
    timestamp: Date.now(),
    ...options,
  });
  await channel.waitForConfirms();
  return true;
}

export async function consumeMessages(queue, handler) {
  if (!channel) {
    throw new Error("RabbitMQ channel not created");
  }

  await channel.consume(
    queue,
    async (message) => {
      if (!message) {
        return;
      }

      try {
        const content = JSON.parse(message.content.toString());
        await handler(content, message);
        channel.ack(message);
      } catch (error) {
        console.error("[RabbitMQ] Error processing message:", error.message);
        channel.nack(message, false, false);
      }
    },
    { noAck: false },
  );
}

export function getRabbitMQStatus() {
  return {
    status: connection ? "CONNECTED" : "DISCONNECTED",
    channelOpen: Boolean(channel),
  };
}

export async function closeRabbitMQ() {
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
    console.log("[RabbitMQ] Connection closed");
  } catch (error) {
    console.error("[RabbitMQ] Error closing:", error.message);
  }
}

export { channel, connection };
