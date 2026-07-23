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
  publishQuestionCreated,
  publishQuestionDeleted,
  publishQuestionUpdated,
} from "../src/config/rabbitmq.js";

describe("Question domain event publisher", () => {
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

  it("publishes question lifecycle events with compact payloads", async () => {
    const question = {
      id: "question-id",
      content: "Content is deliberately excluded",
      questionType: "multiple_choice",
      difficulty: "medium",
      chapterId: 1,
    };
    const context = { traceId: "trace-id", requestId: "request-id" };

    await publishQuestionCreated(question, "user-id", context);
    await publishQuestionUpdated(
      { ...question, difficulty: "hard" },
      "user-id",
      ["difficulty"],
      context,
    );
    await publishQuestionDeleted("question-id", "user-id", context);

    expect(mocks.channel.publish.mock.calls.map((call) => call[1])).toEqual([
      "question.created",
      "question.updated",
      "question.deleted",
    ]);
    const createdEvent = JSON.parse(
      mocks.channel.publish.mock.calls[0][2].toString(),
    );
    expect(createdEvent.data).toEqual({
      question_id: "question-id",
      created_by: "user-id",
      question_type: "multiple_choice",
      difficulty: "medium",
      chapter_id: 1,
    });
    expect(JSON.stringify(createdEvent)).not.toContain(
      "Content is deliberately excluded",
    );
  });
});
