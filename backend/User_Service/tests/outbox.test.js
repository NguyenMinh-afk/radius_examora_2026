import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  enqueue: vi.fn(),
}));

vi.mock('../../shared/utils/outbox.js', () => ({
  createOutboxWriter: () => ({ enqueue: mocks.enqueue }),
}));

import { enqueueUserCreated, USER_EVENTS } from '../src/config/outbox.js';

describe('User transactional outbox event', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.enqueue.mockResolvedValue({ queued: true });
  });

  it('queues user.created without sensitive fields', async () => {
    const transaction = {};
    await enqueueUserCreated(
      {
        id: '10000000-0000-4000-8000-000000000001',
        role: 'student',
        approvalStatus: 'approved',
        emailVerified: false,
        registrationMethod: 'password',
        password: 'must-not-be-stored',
      },
      { traceId: 'trace-id', requestId: 'request-id' },
      transaction
    );

    expect(USER_EVENTS.CREATED).toBe('user.created');
    expect(mocks.enqueue).toHaveBeenCalledWith({
      routingKey: 'user.created',
      aggregateType: 'user',
      aggregateId: '10000000-0000-4000-8000-000000000001',
      traceId: 'trace-id',
      requestId: 'request-id',
      transaction,
      data: {
        user_id: '10000000-0000-4000-8000-000000000001',
        role: 'student',
        approval_status: 'approved',
        email_verified: false,
        registration_method: 'password',
      },
    });
    expect(JSON.stringify(mocks.enqueue.mock.calls[0][0])).not.toContain('must-not-be-stored');
  });
});
