import { describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  startEmailConsumer: vi.fn().mockResolvedValue(undefined),
  startNotificationConsumer: vi.fn().mockResolvedValue(undefined),
}));

vi.mock('../src/workers/email.consumer.js', () => ({
  startEmailConsumer: mocks.startEmailConsumer,
}));

vi.mock('../src/workers/notification.consumer.js', () => ({
  startNotificationConsumer: mocks.startNotificationConsumer,
}));

import { INFRASTRUCTURE_CONSUMERS, startInfrastructureConsumers } from '../src/workers/registry.js';

describe('Infrastructure consumer registry', () => {
  it('starts only the email and notification consumers', async () => {
    await startInfrastructureConsumers();

    expect(INFRASTRUCTURE_CONSUMERS).toEqual(['email.send', 'notification.send']);
    expect(mocks.startEmailConsumer).toHaveBeenCalledOnce();
    expect(mocks.startNotificationConsumer).toHaveBeenCalledOnce();
  });
});
