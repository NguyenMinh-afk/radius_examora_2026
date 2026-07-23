import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  startDomainEventConsumer: vi.fn().mockResolvedValue(undefined),
  startEmailConsumer: vi.fn().mockResolvedValue(undefined),
  startExamResultsConsumer: vi.fn().mockResolvedValue(undefined),
  startNotificationConsumer: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/workers/domain-event.consumer.js', () => ({
  startDomainEventConsumer: mocks.startDomainEventConsumer,
}));

vi.mock('../src/workers/email.consumer.js', () => ({
  startEmailConsumer: mocks.startEmailConsumer,
}));

vi.mock('../src/workers/exam-results.consumer.js', () => ({
  startExamResultsConsumer: mocks.startExamResultsConsumer,
}));

vi.mock('../src/workers/notification.consumer.js', () => ({
  startNotificationConsumer: mocks.startNotificationConsumer,
}));

import { INFRASTRUCTURE_CONSUMERS, startInfrastructureConsumers } from '../src/workers/registry.js';

describe('Infrastructure consumer registry', () => {
  it('starts every Infrastructure-owned consumer', async () => {
    await startInfrastructureConsumers();

    expect(INFRASTRUCTURE_CONSUMERS).toEqual([
      'email.send',
      'notification.send',
      'domain.events',
      'exam.results',
    ]);
    expect(mocks.startDomainEventConsumer).toHaveBeenCalledOnce();
    expect(mocks.startEmailConsumer).toHaveBeenCalledOnce();
    expect(mocks.startExamResultsConsumer).toHaveBeenCalledOnce();
    expect(mocks.startNotificationConsumer).toHaveBeenCalledOnce();
  });
});
