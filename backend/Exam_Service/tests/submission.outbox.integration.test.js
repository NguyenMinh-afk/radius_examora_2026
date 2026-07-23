import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const transaction = { id: 'transaction' };
  const attempt = {
    id: '30000000-0000-4000-8000-000000000001',
    student_id: '20000000-0000-4000-8000-000000000001',
    status: 'in_progress',
    started_at: new Date('2026-07-23T09:55:00.000Z'),
    submitted_at: null,
    update: vi.fn(async function update(values) {
      Object.assign(this, values);
    }),
  };
  const studentAssignment = {
    attempts_used: 0,
    update: vi.fn(),
  };
  return {
    transaction,
    attempt,
    studentAssignment,
    enqueueExamCompleted: vi.fn(),
    attemptAnswerCreate: vi.fn(),
  };
});

vi.mock('../src/models/index.js', () => ({
  sequelize: {
    transaction: vi.fn((callback) => callback(mocks.transaction)),
  },
  ExamAssignment: {
    findByPk: vi.fn().mockResolvedValue({
      id: '40000000-0000-4000-8000-000000000001',
      exam_id: '50000000-0000-4000-8000-000000000001',
      class_id: null,
      title: 'Exam',
      is_active: true,
      max_attempts: 1,
      total_points: 10,
      examQuestions: [{ question_id: 'question-1', points: 10 }],
    }),
  },
  Exam: {},
  StudentAssignment: {
    findOrCreate: vi.fn(() => [mocks.studentAssignment]),
  },
  Attempt: {
    findOne: vi.fn(() => mocks.attempt),
    create: vi.fn(),
  },
  AttemptAnswer: {
    create: mocks.attemptAnswerCreate,
  },
  ExamQuestion: {},
  User: { findByPk: vi.fn() },
  Class: { findByPk: vi.fn().mockResolvedValue(null) },
}));

vi.mock('../src/config/outbox.js', () => ({
  enqueueExamCompleted: mocks.enqueueExamCompleted,
}));

import examService from '../src/services/student/exam.service.js';

describe('Exam submission transactional outbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.attempt.status = 'in_progress';
    mocks.attempt.submitted_at = null;
    mocks.studentAssignment.attempts_used = 0;
    mocks.attemptAnswerCreate.mockResolvedValue({ id: 'answer-id' });
    mocks.enqueueExamCompleted.mockResolvedValue({ queued: true });
  });

  it('stores submission changes and exam.completed in the same transaction', async () => {
    const result = await examService.submitAttempt(
      '20000000-0000-4000-8000-000000000001',
      '40000000-0000-4000-8000-000000000001',
      [{ questionId: 'question-1', isCorrect: true }],
      { traceId: 'trace-id', requestId: 'request-id' }
    );

    expect(mocks.attemptAnswerCreate.mock.calls[0][1]).toEqual({
      transaction: mocks.transaction,
    });
    expect(mocks.attempt.update.mock.calls[0][1]).toEqual({
      transaction: mocks.transaction,
    });
    expect(mocks.studentAssignment.update.mock.calls[0][1]).toEqual({
      transaction: mocks.transaction,
    });
    expect(mocks.enqueueExamCompleted.mock.calls[0][2]).toBe(mocks.transaction);
    expect(result.wasAlreadySubmitted).toBe(false);
    expect(result.summary.score).toBe(10);
  });
});
