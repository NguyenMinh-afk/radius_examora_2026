import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  class NonRetryableMessageError extends Error {}

  return {
    NonRetryableMessageError,
    parseAndValidateEvent: vi.fn(),
    storeSystemEvent: vi.fn(),
  };
});

vi.mock('../src/services/system-event.service.js', () => ({
  NonRetryableMessageError: mocks.NonRetryableMessageError,
  parseAndValidateEvent: mocks.parseAndValidateEvent,
  storeSystemEvent: mocks.storeSystemEvent,
}));

import { handleEventMessage, MAX_EVENT_RETRIES } from '../src/workers/event.consumer.js';

function createChannel() {
  return {
    ack: vi.fn(),
    nack: vi.fn(),
    sendToQueue: vi.fn(),
    waitForConfirms: vi.fn().mockResolvedValue(undefined),
  };
}

function createMessage(retryCount = 0) {
  return {
    content: Buffer.from('{}'),
    properties: {
      messageId: 'event-id',
      headers: retryCount ? { 'x-retry-count': retryCount } : {},
    },
  };
}

const options = {
  retryQueue: 'domain.events.retry',
  consumerName: 'domain-events-consumer',
  allowedEventTypes: new Set(['user.created']),
};

describe('Generic event consumer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.parseAndValidateEvent.mockReturnValue({
      event: { event_type: 'user.created' },
      messageId: 'event-id',
    });
    mocks.storeSystemEvent.mockResolvedValue({ duplicate: false });
  });

  it('ACKs a successfully stored event', async () => {
    const channel = createChannel();
    const message = createMessage();

    await handleEventMessage({ channel, message, ...options });

    expect(mocks.storeSystemEvent).toHaveBeenCalledOnce();
    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.nack).not.toHaveBeenCalled();
  });

  it('ACKs a duplicate without storing a second system event', async () => {
    const channel = createChannel();
    const message = createMessage();
    mocks.storeSystemEvent.mockResolvedValue({ duplicate: true });

    await handleEventMessage({ channel, message, ...options });

    expect(channel.ack).toHaveBeenCalledWith(message);
    expect(channel.sendToQueue).not.toHaveBeenCalled();
  });

  it('sends invalid payloads directly to DLQ', async () => {
    const channel = createChannel();
    const message = createMessage();
    mocks.parseAndValidateEvent.mockImplementation(() => {
      throw new mocks.NonRetryableMessageError('invalid payload');
    });

    await handleEventMessage({ channel, message, ...options });

    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
    expect(channel.sendToQueue).not.toHaveBeenCalled();
  });

  it('schedules a confirmed retry and ACKs the original message', async () => {
    const channel = createChannel();
    const message = createMessage(1);
    mocks.storeSystemEvent.mockRejectedValue(new Error('database temporarily unavailable'));

    await handleEventMessage({ channel, message, ...options });

    expect(channel.sendToQueue).toHaveBeenCalledWith(
      'domain.events.retry',
      message.content,
      expect.objectContaining({
        persistent: true,
        headers: expect.objectContaining({
          'x-retry-count': 2,
          'x-last-consumer': 'domain-events-consumer',
        }),
      })
    );
    expect(channel.waitForConfirms).toHaveBeenCalledOnce();
    expect(channel.ack).toHaveBeenCalledWith(message);
  });

  it('moves a message to DLQ after the retry limit', async () => {
    const channel = createChannel();
    const message = createMessage(MAX_EVENT_RETRIES);
    mocks.storeSystemEvent.mockRejectedValue(new Error('database still unavailable'));

    await handleEventMessage({ channel, message, ...options });

    expect(channel.nack).toHaveBeenCalledWith(message, false, false);
    expect(channel.sendToQueue).not.toHaveBeenCalled();
  });
});
