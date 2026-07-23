import { randomUUID } from "node:crypto";

const DEFAULT_EXCHANGE = "examora.topic";

export function createDomainEventPublisher({
  amqp,
  serviceName,
  url,
  exchange = DEFAULT_EXCHANGE,
}) {
  if (!amqp?.connect) {
    throw new Error("An AMQP client with connect() is required");
  }
  if (!serviceName || !url) {
    throw new Error("serviceName and RabbitMQ url are required");
  }

  let connection = null;
  let channel = null;
  let connectingPromise = null;

  async function createConnection() {
    try {
      const currentConnection = await amqp.connect(url);
      const currentChannel = await currentConnection.createConfirmChannel();

      currentConnection.on("error", (error) => {
        console.error(`[${serviceName}] RabbitMQ connection error:`, error.message);
      });
      currentConnection.on("close", () => {
        if (connection === currentConnection) {
          connection = null;
          channel = null;
        }
      });
      currentChannel.on("error", (error) => {
        console.error(`[${serviceName}] RabbitMQ channel error:`, error.message);
      });
      currentChannel.on("close", () => {
        if (channel === currentChannel) {
          channel = null;
        }
      });

      await currentChannel.assertExchange(exchange, "topic", { durable: true });

      connection = currentConnection;
      channel = currentChannel;
      return currentChannel;
    } catch (error) {
      connection = null;
      channel = null;
      throw error;
    }
  }

  async function getChannel() {
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

  async function publish({
    routingKey,
    aggregateType,
    aggregateId,
    data,
    traceId,
    requestId,
    eventId = randomUUID(),
    occurredAt = new Date().toISOString(),
  }) {
    if (!routingKey || !aggregateType || !aggregateId) {
      throw new Error(
        "routingKey, aggregateType and aggregateId are required",
      );
    }

    const currentChannel = await getChannel();
    const correlationId = traceId || requestId || eventId;
    const event = {
      event_id: eventId,
      event_type: routingKey,
      event_version: 1,
      aggregate_type: aggregateType,
      aggregate_id: String(aggregateId),
      source: serviceName,
      occurred_at: occurredAt,
      trace_id: correlationId,
      request_id: requestId || null,
      data: data || {},
    };

    currentChannel.publish(
      exchange,
      routingKey,
      Buffer.from(JSON.stringify(event)),
      {
        persistent: true,
        contentType: "application/json",
        contentEncoding: "utf-8",
        messageId: eventId,
        correlationId,
        type: routingKey,
        timestamp: Date.now(),
        headers: {
          "x-service": serviceName,
          "x-trace-id": correlationId,
          "x-event-version": 1,
        },
      },
    );
    await currentChannel.waitForConfirms();

    return {
      published: true,
      eventId,
      routingKey,
    };
  }

  async function publishSafely(event) {
    try {
      return await publish(event);
    } catch (error) {
      console.error(
        `[${serviceName}] Failed to publish ${event.routingKey}:`,
        error.message,
      );
      return {
        published: false,
        routingKey: event.routingKey,
        error: error.message,
      };
    }
  }

  async function close() {
    const currentChannel = channel;
    const currentConnection = connection;
    channel = null;
    connection = null;
    connectingPromise = null;

    if (currentChannel) {
      await currentChannel.close();
    }
    if (currentConnection) {
      await currentConnection.close();
    }
  }

  return {
    publish,
    publishSafely,
    close,
  };
}

export default { createDomainEventPublisher };
