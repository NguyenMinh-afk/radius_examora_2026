import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => {
  const channel = {
    assertExchange: vi.fn(),
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

  return { channel, connection, connect: vi.fn() };
});

vi.mock("amqplib", () => ({
  default: { connect: mocks.connect },
}));

import {
  closeRabbitMQ,
  publishUserCreated,
  USER_EVENTS,
} from "../src/config/rabbitmq.js";

describe("User domain event publisher", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connect.mockResolvedValue(mocks.connection);
    mocks.connection.createConfirmChannel.mockResolvedValue(mocks.channel);
    mocks.channel.assertExchange.mockResolvedValue(undefined);
    mocks.channel.waitForConfirms.mockResolvedValue(undefined);
    mocks.channel.close.mockResolvedValue(undefined);
    mocks.connection.close.mockResolvedValue(undefined);
  });

  afterEach(async () => {
    await closeRabbitMQ();
  });

  it("publishes user.created without sensitive fields", async () => {
    await publishUserCreated(
      {
        id: "user-id",
        role: "student",
        approvalStatus: "approved",
        emailVerified: false,
        registrationMethod: "password",
        password: "must-not-be-published",
      },
      { traceId: "trace-id", requestId: "request-id" },
    );

    expect(USER_EVENTS.CREATED).toBe("user.created");
    const [, routingKey, content] = mocks.channel.publish.mock.calls[0];
    const event = JSON.parse(content.toString());

    expect(routingKey).toBe("user.created");
    expect(event.data).toEqual({
      user_id: "user-id",
      role: "student",
      approval_status: "approved",
      email_verified: false,
      registration_method: "password",
    });
    expect(JSON.stringify(event)).not.toContain("must-not-be-published");
  });
});
