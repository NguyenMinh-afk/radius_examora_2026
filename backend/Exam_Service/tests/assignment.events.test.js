import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  publishExamCompleted: vi.fn().mockResolvedValue({ published: true }),
  submitAttempt: vi.fn(),
}));

vi.mock("../src/services/student/exam.service.js", () => ({
  default: {
    submitAttempt: mocks.submitAttempt,
  },
}));

vi.mock("../src/services/student/assignment.service.js", () => ({
  default: {},
}));

vi.mock("../src/config/rabbitmq.js", () => ({
  publishExamCompleted: mocks.publishExamCompleted,
}));

import { submitAssignment } from "../src/controllers/student/assignment.controller.js";

function createResponse() {
  return {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  };
}

describe("Exam completion event integration", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("publishes exam.completed after a new submission", async () => {
    mocks.submitAttempt.mockResolvedValue({
      attempt: {
        id: "attempt-id",
        score: 8,
        percentage: 80,
        correct_answers: 8,
        wrong_answers: 2,
        submitted_at: "2026-07-23T10:00:00.000Z",
      },
      wasAlreadySubmitted: false,
      summary: {
        score: 8,
        percentage: 80,
        correctAnswers: 8,
        wrongAnswers: 2,
      },
    });
    const req = {
      user: { id: "student-id" },
      params: { assignmentId: "assignment-id" },
      body: { answers: [] },
      requestId: "request-id",
      correlationId: "trace-id",
    };
    const res = createResponse();

    await submitAssignment(req, res);

    expect(mocks.publishExamCompleted).toHaveBeenCalledWith(
      {
        attemptId: "attempt-id",
        assignmentId: "assignment-id",
        studentId: "student-id",
        score: 8,
        percentage: 80,
        correctAnswers: 8,
        wrongAnswers: 2,
        submittedAt: "2026-07-23T10:00:00.000Z",
      },
      {
        traceId: "trace-id",
        requestId: "request-id",
      },
    );
    expect(res.json).toHaveBeenCalledOnce();
  });

  it("does not publish a duplicate event for an already submitted attempt", async () => {
    mocks.submitAttempt.mockResolvedValue({
      attempt: {
        id: "attempt-id",
        score: 8,
        percentage: 80,
        correct_answers: 8,
        wrong_answers: 2,
        submitted_at: "2026-07-23T10:00:00.000Z",
      },
      wasAlreadySubmitted: true,
      summary: {
        score: 8,
        percentage: 80,
        correctAnswers: 8,
        wrongAnswers: 2,
      },
    });
    const req = {
      user: { id: "student-id" },
      params: { assignmentId: "assignment-id" },
      body: { answers: [] },
    };
    const res = createResponse();

    await submitAssignment(req, res);

    expect(mocks.publishExamCompleted).not.toHaveBeenCalled();
    expect(res.json).toHaveBeenCalledOnce();
  });
});
