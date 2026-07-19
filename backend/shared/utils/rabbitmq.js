/**
 * RabbitMQ Configuration với production features
 * - durable queue
 * - persistent message
 * - manual ACK
 * - retry queue
 * - dead letter queue
 * - prefetch
 * - publisher confirm
 */

let channel = null;
let connection = null;

export async function connectRabbitMQ(url) {
  const amqp = await import("amqplib");
  connection = await amqp.connect(url);

  // Publisher confirms
  await connection.confirmConnect();

  connection.on("error", (err) => {
    console.error("[RabbitMQ] Connection error:", err.message);
  });

  connection.on("close", () => {
    console.warn("[RabbitMQ] Connection closed");
  });

  return connection;
}

export async function createChannel(prefetch = 10) {
  if (!connection) throw new Error("RabbitMQ not connected");

  channel = await connection.createConfirmChannel();
  await channel.prefetch(prefetch);

  return channel;
}

export async function setupExchangesAndQueues() {
  if (!channel) throw new Error("Channel not created");

  // ========== Exchanges ==========
  // Main exchange cho AI tasks
  await channel.assertExchange("ai.exchange", "direct", { durable: true });

  // Exchange cho notifications
  await channel.assertExchange("notification.exchange", "direct", { durable: true });

  // Exchange cho email
  await channel.assertExchange("email.exchange", "direct", { durable: true });

  // Dead letter exchange
  await channel.assertExchange("dlx.exchange", "direct", { durable: true });

  // ========== Queues ==========
  // Main AI processing queue
  await channel.assertQueue("ai.tasks", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dlx.exchange",
      "x-dead-letter-routing-key": "ai.failed",
    },
  });

  // Retry queue với TTL (5 phút)
  await channel.assertQueue("ai.retry", {
    durable: true,
    arguments: {
      "x-message-ttl": 5 * 60 * 1000,
      "x-dead-letter-exchange": "ai.exchange",
      "x-dead-letter-routing-key": "ai.task",
    },
  });

  // Dead letter queue (AI)
  await channel.assertQueue("ai.failed", { durable: true });

  // Notification queue
  await channel.assertQueue("notifications", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dlx.exchange",
      "x-dead-letter-routing-key": "notification.failed",
    },
  });

  // Email queue
  await channel.assertQueue("emails", {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": "dlx.exchange",
      "x-dead-letter-routing-key": "email.failed",
    },
  });

  // Failed queues
  await channel.assertQueue("notification.failed", { durable: true });
  await channel.assertQueue("email.failed", { durable: true });

  // ========== Bindings ==========
  await channel.bindQueue("ai.tasks", "ai.exchange", "ai.task");
  await channel.bindQueue("ai.retry", "ai.exchange", "ai.retry");
  await channel.bindQueue("notifications", "notification.exchange", "notification.send");
  await channel.bindQueue("emails", "email.exchange", "email.send");

  console.log("[RabbitMQ] Exchanges and queues setup complete");
}

/**
 * Publish message với confirm
 */
export async function publishMessage(exchange, routingKey, message) {
  if (!channel) throw new Error("Channel not created");

  const messageBuffer = Buffer.from(JSON.stringify(message));

  return new Promise((resolve, reject) => {
    channel.publish(
      exchange,
      routingKey,
      messageBuffer,
      {
        persistent: true, // durable message
        contentType: "application/json",
        timestamp: Date.now(),
      },
      (err) => {
        if (err) {
          reject(err);
        } else {
          resolve(true);
        }
      }
    );
  });
}

/**
 * Consume message với manual ACK
 */
export async function consumeMessages(queue, handler) {
  if (!channel) throw new Error("Channel not created");

  await channel.consume(
    queue,
    async (msg) => {
      if (!msg) return;

      try {
        const content = JSON.parse(msg.content.toString());
        await handler(content);

        // ACK thành công
        channel.ack(msg);
      } catch (error) {
        console.error("[RabbitMQ] Error processing message:", error.message);

        // Check retry count
        const retryCount = (msg.properties.headers?.["x-retry-count"] || 0) + 1;

        if (retryCount < 3) {
          // Retry bằng cách gửi sang retry queue
          await publishMessage("ai.exchange", "ai.retry", {
            ...JSON.parse(msg.content.toString()),
            _retryCount: retryCount,
            _lastError: error.message,
          });
        }

        // ACK để không nhận lại nữa (message đã sang DLQ)
        channel.ack(msg);
      }
    },
    { noAck: false }
  );
}

export function getRabbitMQStatus() {
  if (!connection) {
    return { status: "DISCONNECTED" };
  }
  return {
    status: connection.isOpen() ? "CONNECTED" : "DISCONNECTED",
    channelOpen: channel?.isOpen() || false,
  };
}

export async function closeRabbitMQ() {
  try {
    if (channel) {
      await channel.close();
      channel = null;
    }
    if (connection) {
      await connection.close();
      connection = null;
    }
    console.log("[RabbitMQ] Connection closed");
  } catch (error) {
    console.error("[RabbitMQ] Error closing:", error.message);
  }
}

export { channel, connection };
