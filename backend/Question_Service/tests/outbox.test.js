import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enqueue: vi.fn(),
}));

vi.mock('../../shared/utils/outbox.js', () => ({
  createOutboxWriter: () => ({ enqueue: mocks.enqueue }),
}));

import {
  enqueueQuestionCreated,
  enqueueQuestionDeleted,
  enqueueQuestionUpdated,
} from '../src/config/outbox.js';

describe('Question transactional outbox events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueue.mockResolvedValue({ queued: true });
  });

  it('queues compact question lifecycle events', async () => {
    const transaction = {};
    const context = { traceId: 'trace-id', requestId: 'request-id' };
    const question = {
      id: '10000000-0000-4000-8000-000000000001',
      content: 'Content is deliberately excluded',
      questionType: 'multiple_choice',
      difficulty: 'medium',
      chapterId: 1,
    };

    await enqueueQuestionCreated(
      question,
      '20000000-0000-4000-8000-000000000001',
      context,
      transaction
    );
    await enqueueQuestionUpdated(
      { ...question, difficulty: 'hard' },
      '20000000-0000-4000-8000-000000000001',
      ['difficulty'],
      context,
      transaction
    );
    await enqueueQuestionDeleted(
      question.id,
      '20000000-0000-4000-8000-000000000001',
      context,
      transaction
    );

    expect(mocks.enqueue.mock.calls.map(([event]) => event.routingKey)).toEqual([
      'question.created',
      'question.updated',
      'question.deleted',
    ]);
    expect(mocks.enqueue.mock.calls[0][0].data).toEqual({
      question_id: question.id,
      created_by: '20000000-0000-4000-8000-000000000001',
      question_type: 'multiple_choice',
      difficulty: 'medium',
      chapter_id: 1,
    });
    expect(JSON.stringify(mocks.enqueue.mock.calls[0][0])).not.toContain(
      'Content is deliberately excluded'
    );
  });
});
