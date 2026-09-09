/**
 * RabbitMQ publisher for asynchronous notifications and emails.
 */
import amqp from "amqplib";
import { randomUUID } from "node:crypto";

const RABBITMQ_URL =
  process.env.RABBITMQ_URL ||
  `amqp://${process.env.RABBITMQ_USER || "admin"}:${process.env.RABBITMQ_PASSWORD || "StrongPassword123"}@${process.env.RABBITMQ_HOST || "localhost"}:${process.env.RABBITMQ_PORT || 5672}`;

const EXCHANGE = "examora.topic";
const DLX = "examora.dlx";

const DESTINATIONS = Object.freeze({
  notification: Object.freeze({
    queue: "notification.send",
    retryQueue: "notification.send.retry",
    dlq: "notification.send.dlq",
    routingKey: "notification.new",
    retryRoutingKey: "notification.send.retry",
  }),
  email: Object.freeze({
    queue: "email.send",
    retryQueue: "email.send.retry",
    dlq: "email.send.dlq",
    routingKey: "email.send",
    retryRoutingKey: "email.send.retry",
  }),
});

let connection = null;
let channel = null;
let connectingPromise = null;
const returnedMessages = new Map();

async function assertDestination(currentChannel, destination) {
  await currentChannel.assertQueue(destination.dlq, { durable: true });
  await currentChannel.bindQueue(destination.dlq, DLX, destination.dlq);
  await currentChannel.assertQueue(destination.retryQueue, {
    durable: true,
    arguments: {
      "x-message-ttl": 5_000,
      "x-dead-letter-exchange": EXCHANGE,
      "x-dead-letter-routing-key": destination.retryRoutingKey,
    },
  });
  await currentChannel.assertQueue(destination.queue, {
    durable: true,
    arguments: {
      "x-dead-letter-exchange": DLX,
      "x-dead-letter-routing-key": destination.dlq,
    },
  });
  await currentChannel.bindQueue(
    destination.queue,
    EXCHANGE,
    destination.routingKey,
  );
  await currentChannel.bindQueue(
    destination.queue,
    EXCHANGE,
    destination.retryRoutingKey,
  );
}

async function createConnection() {
  try {
    const currentConnection = await amqp.connect(RABBITMQ_URL);
    const currentChannel = await currentConnection.createConfirmChannel();

    currentConnection.on("error", (error) => {
      console.error("[Notification Publisher] Connection error:", error.message);
    });
    currentConnection.on("close", () => {
      if (connection === currentConnection) {
        connection = null;
        channel = null;
      }
      console.log("[Notification Publisher] Connection closed");
    });
    currentChannel.on("error", (error) => {
      console.error("[Notification Publisher] Channel error:", error.message);
    });
    currentChannel.on("close", () => {
      if (channel === currentChannel) {
        channel = null;
      }
    });
    currentChannel.on("return", (message) => {
      const messageId = message.properties.messageId;
      if (messageId) {
        returnedMessages.set(
          messageId,
          new Error(
            `RabbitMQ returned unroutable message ${messageId}: ${message.fields.replyText || "NO_ROUTE"}`,
          ),
        );
      }
    });

    await currentChannel.assertExchange(EXCHANGE, "topic", { durable: true });
    await currentChannel.assertExchange(DLX, "direct", { durable: true });
    await assertDestination(currentChannel, DESTINATIONS.notification);
    await assertDestination(currentChannel, DESTINATIONS.email);

    connection = currentConnection;
    channel = currentChannel;
    console.log("[Notification Publisher] Connected to RabbitMQ");
    return currentChannel;
  } catch (error) {
    connection = null;
    channel = null;
    console.error(
      "[Notification Publisher] Failed to connect:",
      error.message,
    );
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

async function publish(destination, message, traceId) {
  const currentChannel = await connect();
  const messageId = randomUUID();

  currentChannel.publish(
    EXCHANGE,
    destination.routingKey,
    Buffer.from(JSON.stringify(message)),
    {
      persistent: true,
      mandatory: true,
      contentType: "application/json",
      messageId,
      correlationId: traceId,
      type: destination.routingKey,
      timestamp: Date.now(),
      headers: {
        "x-service": "Notification_Service",
        "x-trace-id": traceId,
      },
    },
  );
  try {
    await currentChannel.waitForConfirms();
    await new Promise((resolve) => setImmediate(resolve));
    const returnedError = returnedMessages.get(messageId);
    if (returnedError) {
      throw returnedError;
    }
  } finally {
    returnedMessages.delete(messageId);
  }
  return { messageId };
}

export async function publishNotification(data) {
  const message = {
    userId: data.userId,
    type: data.type || "system",
    title: data.title,
    content: data.content,
    metadata: data.metadata || {},
    traceId: data.traceId,
    timestamp: new Date().toISOString(),
  };

  const result = await publish(
    DESTINATIONS.notification,
    message,
    data.traceId,
  );
  console.log(
    `[Notification Publisher] Published notification for user: ${data.userId}`,
  );
  return result;
}

export async function publishEmail(data) {
  const message = {
    to: data.to,
    subject: data.subject,
    html: data.html,
    text: data.text,
    from: data.from,
    traceId: data.traceId,
    timestamp: new Date().toISOString(),
  };

  const result = await publish(DESTINATIONS.email, message, data.traceId);
  console.log(`[Notification Publisher] Published email to: ${data.to}`);
  return result;
}

export async function close() {
  const currentChannel = channel;
  const currentConnection = connection;
  channel = null;
  connection = null;
  connectingPromise = null;
  returnedMessages.clear();

  try {
    if (currentChannel) {
      await currentChannel.close();
    }
    if (currentConnection) {
      await currentConnection.close();
    }
    console.log("[Notification Publisher] Connection closed gracefully");
  } catch (error) {
    console.error("[Notification Publisher] Error closing:", error.message);
  }
}

export default { publishNotification, publishEmail, close };
