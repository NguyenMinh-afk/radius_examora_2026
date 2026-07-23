import { describe, expect, it, vi } from "vitest";
import { createDomainEventPublisher } from "../../shared/utils/domainEventPublisher.js";

function createAmqpMocks() {
  const channel = {
    assertExchange: vi.fn().mockResolvedValue(undefined),
    close: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
    publish: vi.fn(),
    waitForConfirms: vi.fn().mockResolvedValue(undefined),
  };
  const connection = {
    close: vi.fn().mockResolvedValue(undefined),
    createConfirmChannel: vi.fn().mockResolvedValue(channel),
    on: vi.fn(),
  };
  const amqp = {
    connect: vi.fn().mockResolvedValue(connection),
  };

  return { amqp, channel, connection };
}

describe("Shared domain event publisher", () => {
  it("publishes the standard envelope and waits for broker confirmation", async () => {
    const mocks = createAmqpMocks();
    const publisher = createDomainEventPublisher({
      amqp: mocks.amqp,
      serviceName: "Test_Service",
      url: "amqp://rabbitmq",
    });

    const result = await publisher.publish({
      routingKey: "question.created",
      aggregateType: "question",
      aggregateId: "question-id",
      traceId: "trace-id",
      requestId: "request-id",
      eventId: "event-id",
      occurredAt: "2026-07-23T10:00:00.000Z",
      data: { question_id: "question-id" },
    });

    expect(mocks.connection.createConfirmChannel).toHaveBeenCalledOnce();
    expect(mocks.channel.assertExchange).toHaveBeenCalledWith(
      "examora.topic",
      "topic",
      { durable: true },
    );
    expect(mocks.channel.waitForConfirms).toHaveBeenCalledOnce();

    const [exchange, routingKey, content, properties] =
      mocks.channel.publish.mock.calls[0];
    expect(exchange).toBe("examora.topic");
    expect(routingKey).toBe("question.created");
    expect(JSON.parse(content.toString())).toEqual({
      event_id: "event-id",
      event_type: "question.created",
      event_version: 1,
      aggregate_type: "question",
      aggregate_id: "question-id",
      source: "Test_Service",
      occurred_at: "2026-07-23T10:00:00.000Z",
      trace_id: "trace-id",
      request_id: "request-id",
      data: { question_id: "question-id" },
    });
    expect(properties).toEqual(
      expect.objectContaining({
        persistent: true,
        contentType: "application/json",
        messageId: "event-id",
        correlationId: "trace-id",
        type: "question.created",
      }),
    );
    expect(result).toEqual({
      published: true,
      eventId: "event-id",
      routingKey: "question.created",
    });

    await publisher.close();
  });

  it("reports a publish failure without throwing into the business API", async () => {
    const amqp = {
      connect: vi.fn().mockRejectedValue(new Error("broker unavailable")),
    };
    const publisher = createDomainEventPublisher({
      amqp,
      serviceName: "Test_Service",
      url: "amqp://rabbitmq",
    });

    const result = await publisher.publishSafely({
      routingKey: "user.created",
      aggregateType: "user",
      aggregateId: "user-id",
      data: {},
    });

    expect(result).toEqual({
      published: false,
      routingKey: "user.created",
      error: "broker unavailable",
    });
  });
});
