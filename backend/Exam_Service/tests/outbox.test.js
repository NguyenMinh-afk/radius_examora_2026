import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enqueue: vi.fn(),
}));

vi.mock('../../shared/utils/outbox.js', () => ({
  createOutboxWriter: () => ({ enqueue: mocks.enqueue }),
}));

import {
  enqueueExamCompleted,
  enqueueExamCreated,
  enqueueExamDeleted,
  enqueueExamUpdated,
} from '../src/config/outbox.js';

describe('Exam transactional outbox events', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueue.mockResolvedValue({ queued: true });
  });

  it('queues exam lifecycle events in the supplied transaction', async () => {
    const transaction = {};
    const context = { traceId: 'trace-id', requestId: 'request-id' };

    await enqueueExamCreated(
      {
        examId: '10000000-0000-4000-8000-000000000001',
        title: 'Exam',
      },
      context,
      transaction
    );
    await enqueueExamUpdated(
      {
        examId: '10000000-0000-4000-8000-000000000001',
        published: true,
      },
      ['published'],
      context,
      transaction
    );
    await enqueueExamDeleted(
      '10000000-0000-4000-8000-000000000001',
      '20000000-0000-4000-8000-000000000001',
      context,
      transaction
    );
    await enqueueExamCompleted(
      {
        attemptId: '30000000-0000-4000-8000-000000000001',
        score: 10,
      },
      context,
      transaction
    );

    expect(mocks.enqueue.mock.calls.map(([event]) => event.routingKey)).toEqual([
      'exam.created',
      'exam.updated',
      'exam.deleted',
      'exam.completed',
    ]);
    expect(mocks.enqueue.mock.calls[3][0]).toEqual(
      expect.objectContaining({
        aggregateType: 'attempt',
        aggregateId: '30000000-0000-4000-8000-000000000001',
        transaction,
      })
    );
  });
});
