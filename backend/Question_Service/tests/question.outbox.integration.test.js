import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const transaction = { id: 'transaction' };
  return {
    transaction,
    questionCreate: vi.fn(),
    questionFindByPk: vi.fn(),
    relationBulkCreate: vi.fn(),
    enqueueQuestionCreated: vi.fn(),
  };
});

vi.mock('../src/models/index.js', () => ({
  sequelize: {
    transaction: vi.fn((callback) => callback(mocks.transaction)),
  },
  Question: {
    create: mocks.questionCreate,
    findByPk: mocks.questionFindByPk,
  },
  QuestionTag: {},
  QuestionTagRelation: {
    bulkCreate: mocks.relationBulkCreate,
  },
}));

vi.mock('../src/config/outbox.js', () => ({
  enqueueQuestionCreated: mocks.enqueueQuestionCreated,
  enqueueQuestionDeleted: vi.fn(),
  enqueueQuestionUpdated: vi.fn(),
}));

import questionService from '../src/services/question.service.js';

describe('Question creation transactional outbox', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.questionCreate.mockResolvedValue({
      id: '10000000-0000-4000-8000-000000000001',
    });
    mocks.questionFindByPk.mockResolvedValue({
      id: '10000000-0000-4000-8000-000000000001',
      content: 'Question',
      question_type: 'multiple_choice',
      difficulty: 'medium',
      chapter_id: 1,
      options: [],
      tags: [],
      created_at: new Date('2026-07-23T10:00:00.000Z'),
    });
    mocks.enqueueQuestionCreated.mockResolvedValue({ queued: true });
  });

  it('creates the question and outbox event in the same transaction', async () => {
    await questionService.createQuestion(
      '20000000-0000-4000-8000-000000000001',
      {
        content: 'Question',
        questionType: 'multiple_choice',
        answers: [],
      },
      { traceId: 'trace-id' }
    );

    expect(mocks.questionCreate.mock.calls[0][1]).toEqual({
      transaction: mocks.transaction,
    });
    expect(mocks.questionFindByPk.mock.calls[0][1].transaction).toBe(mocks.transaction);
    expect(mocks.enqueueQuestionCreated.mock.calls[0][3]).toBe(mocks.transaction);
  });
});
