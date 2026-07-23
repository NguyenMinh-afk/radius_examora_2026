import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  submitAttempt: vi.fn(),
}));

vi.mock('../src/services/student/exam.service.js', () => ({
  default: {
    submitAttempt: mocks.submitAttempt,
  },
}));

vi.mock('../src/services/student/assignment.service.js', () => ({
  default: {},
}));

import { submitAssignment } from '../src/controllers/student/assignment.controller.js';

function createResponse() {
  return {
    json: vi.fn().mockReturnThis(),
    status: vi.fn().mockReturnThis(),
  };
}

describe('Exam completion outbox integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('passes tracing context into the transactional submission', async () => {
    mocks.submitAttempt.mockResolvedValue({
      attempt: {
        id: 'attempt-id',
        score: 8,
        percentage: 80,
        correct_answers: 8,
        wrong_answers: 2,
        submitted_at: '2026-07-23T10:00:00.000Z',
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
      user: { id: 'student-id' },
      params: { assignmentId: 'assignment-id' },
      body: { answers: [] },
      requestId: 'request-id',
      correlationId: 'trace-id',
    };
    const res = createResponse();

    await submitAssignment(req, res);

    expect(mocks.submitAttempt).toHaveBeenCalledWith('student-id', 'assignment-id', [], {
      traceId: 'trace-id',
      requestId: 'request-id',
    });
    expect(res.json).toHaveBeenCalledOnce();
  });

  it('returns an already submitted attempt without controller-side publishing', async () => {
    mocks.submitAttempt.mockResolvedValue({
      attempt: {
        id: 'attempt-id',
        score: 8,
        percentage: 80,
        correct_answers: 8,
        wrong_answers: 2,
        submitted_at: '2026-07-23T10:00:00.000Z',
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
      user: { id: 'student-id' },
      params: { assignmentId: 'assignment-id' },
      body: { answers: [] },
    };
    const res = createResponse();

    await submitAssignment(req, res);

    expect(mocks.submitAttempt).toHaveBeenCalledOnce();
    expect(res.json).toHaveBeenCalledOnce();
  });
});
