import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
  };
});

vi.mock("amqplib", () => ({
  default: {
    connect: mocks.connect,
  },
}));

import {
  close,
  publishEmail,
  publishNotification,
} from "../src/config/rabbitmq.js";

describe("Notification Service RabbitMQ publisher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connect.mockResolvedValue(mocks.connection);
    mocks.connection.createConfirmChannel.mockResolvedValue(mocks.channel);
    mocks.channel.assertExchange.mockResolvedValue(undefined);
    mocks.channel.assertQueue.mockResolvedValue(undefined);
    mocks.channel.bindQueue.mockResolvedValue(undefined);
    mocks.channel.waitForConfirms.mockResolvedValue(undefined);
    mocks.channel.close.mockResolvedValue(undefined);
    mocks.connection.close.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await close();
  });

  it("declares topology with matching DLQ arguments and confirms notification", async () => {
    const result = await publishNotification({
      userId: "user-id",
      type: "system",
      title: "Title",
      content: "Content",
      traceId: "trace-id",
    });

    expect(mocks.connection.createConfirmChannel).toHaveBeenCalledOnce();
    expect(mocks.channel.assertExchange).toHaveBeenCalledWith(
      "examora.topic",
      "topic",
      { durable: true },
    );
    expect(mocks.channel.assertExchange).toHaveBeenCalledWith(
      "examora.dlx",
      "direct",
      { durable: true },
    );
    expect(mocks.channel.assertQueue).toHaveBeenCalledWith(
      "notification.send",
      {
        durable: true,
        arguments: {
          "x-dead-letter-exchange": "examora.dlx",
          "x-dead-letter-routing-key": "notification.send.dlq",
        },
      },
    );
    expect(mocks.channel.bindQueue).toHaveBeenCalledWith(
      "notification.send",
      "examora.topic",
      "notification.new",
    );
    expect(mocks.channel.publish).toHaveBeenCalledWith(
      "examora.topic",
      "notification.new",
      expect.any(Buffer),
      expect.objectContaining({
        persistent: true,
        contentType: "application/json",
        correlationId: "trace-id",
      }),
    );
    expect(mocks.channel.waitForConfirms).toHaveBeenCalledOnce();
    expect(result.messageId).toEqual(expect.any(String));
  });

  it("reuses the confirm channel for email publishing", async () => {
    await publishNotification({
      userId: "user-id",
      title: "Title",
      content: "Content",
    });
    await publishEmail({
      to: "test@example.com",
      subject: "Subject",
      text: "Text",
    });

    expect(mocks.connect).toHaveBeenCalledOnce();
    expect(mocks.connection.createConfirmChannel).toHaveBeenCalledOnce();
    expect(mocks.channel.publish).toHaveBeenLastCalledWith(
      "examora.topic",
      "email.send",
      expect.any(Buffer),
      expect.objectContaining({
        persistent: true,
        contentType: "application/json",
      }),
    );
    expect(mocks.channel.waitForConfirms).toHaveBeenCalledTimes(2);
  });
});
