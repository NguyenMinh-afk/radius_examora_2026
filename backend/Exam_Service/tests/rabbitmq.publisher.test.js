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
  publishExamCompleted,
  publishExamCreated,
  publishExamDeleted,
  publishExamUpdated,
} from "../src/config/rabbitmq.js";

describe("Exam domain event publisher", () => {
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

  it("publishes create, update, delete and completed routing keys", async () => {
    const context = { traceId: "trace-id", requestId: "request-id" };
    await publishExamCreated({ examId: "exam-id", title: "Exam" }, context);
    await publishExamUpdated(
      { examId: "exam-id", published: true },
      ["published"],
      context,
    );
    await publishExamDeleted("exam-id", "teacher-id", context);
    await publishExamCompleted(
      {
        attemptId: "attempt-id",
        assignmentId: "assignment-id",
        score: 10,
      },
      context,
    );

    expect(mocks.channel.publish.mock.calls.map((call) => call[1])).toEqual([
      "exam.created",
      "exam.updated",
      "exam.deleted",
      "exam.completed",
    ]);
    expect(mocks.connect).toHaveBeenCalledOnce();
    expect(mocks.channel.waitForConfirms).toHaveBeenCalledTimes(4);

    const completedEvent = JSON.parse(
      mocks.channel.publish.mock.calls[3][2].toString(),
    );
    expect(completedEvent.aggregate_type).toBe("attempt");
    expect(completedEvent.aggregate_id).toBe("attempt-id");
  });
});
