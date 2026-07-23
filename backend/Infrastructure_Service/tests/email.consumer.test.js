import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => ({
  ack: vi.fn(),
  consume: vi.fn(),
  createTransport: vi.fn(),
  isMessageProcessed: vi.fn(),
  markMessageProcessed: vi.fn(),
  nack: vi.fn(),
  off: vi.fn(),
  on: vi.fn(),
  sendMail: vi.fn(),
  sendToQueue: vi.fn(),
  waitForConfirms: vi.fn(),
}));

vi.mock('nodemailer', () => ({
  default: {
    createTransport: mocks.createTransport,
  },
}));

vi.mock('../src/config/rabbitmq.js', () => ({
  getChannel: () => ({
    ack: mocks.ack,
    consume: mocks.consume,
    nack: mocks.nack,
    off: mocks.off,
    on: mocks.on,
    sendToQueue: mocks.sendToQueue,
    waitForConfirms: mocks.waitForConfirms,
  }),
  QUEUES: {
    EMAIL_SEND: 'email.send',
    EMAIL_SEND_RETRY: 'email.send.retry',
  },
}));

vi.mock('../src/services/message-idempotency.service.js', () => ({
  isMessageProcessed: mocks.isMessageProcessed,
  markMessageProcessed: mocks.markMessageProcessed,
}));

import { startEmailConsumer } from '../src/workers/email.consumer.js';

function createMessage(payload, retryCount = 0) {
  return {
    content: Buffer.from(JSON.stringify(payload)),
    properties: {
      headers: retryCount ? { 'x-retry-count': retryCount } : {},
      messageId: 'email-message-id',
    },
  };
}

describe('Email RabbitMQ consumer', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.createTransport.mockReturnValue({ sendMail: mocks.sendMail });
    mocks.isMessageProcessed.mockResolvedValue(false);
    mocks.markMessageProcessed.mockResolvedValue(true);
    mocks.sendMail.mockResolvedValue({ messageId: 'provider-id' });
    mocks.waitForConfirms.mockResolvedValue(undefined);
  });

  it('sends and ACKs email with a stable SMTP Message-ID', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });
    await startEmailConsumer();

    const message = createMessage({
      to: 'user@example.com',
      subject: 'Subject',
      text: 'Body',
    });
    await handler(message);

    expect(mocks.sendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'user@example.com',
        messageId: '<email-message-id@rabbitmq.examora.local>',
      })
    );
    expect(mocks.markMessageProcessed).toHaveBeenCalledWith(
      'email-consumer',
      'email-message-id'
    );
    expect(mocks.ack).toHaveBeenCalledWith(message);
  });

  it('sends invalid contracts directly to DLQ', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });
    await startEmailConsumer();

    const message = createMessage({ to: 'user@example.com' });
    await handler(message);

    expect(mocks.sendMail).not.toHaveBeenCalled();
    expect(mocks.nack).toHaveBeenCalledWith(message, false, false);
  });

  it('retries temporary SMTP errors and stops after three total attempts', async () => {
    let handler;
    mocks.consume.mockImplementation(async (_queue, callback) => {
      handler = callback;
    });
    mocks.sendMail.mockRejectedValue(new Error('SMTP unavailable'));
    await startEmailConsumer();

    const firstAttempt = createMessage({
      to: 'user@example.com',
      subject: 'Subject',
    });
    await handler(firstAttempt);
    expect(mocks.sendToQueue).toHaveBeenCalledWith(
      'email.send.retry',
      firstAttempt.content,
      expect.objectContaining({
        mandatory: true,
        headers: expect.objectContaining({ 'x-retry-count': 1 }),
      })
    );

    vi.clearAllMocks();
    mocks.isMessageProcessed.mockResolvedValue(false);
    mocks.sendMail.mockRejectedValue(new Error('SMTP still unavailable'));
    const thirdAttempt = createMessage(
      {
        to: 'user@example.com',
        subject: 'Subject',
      },
      2
    );
    await handler(thirdAttempt);

    expect(mocks.sendToQueue).not.toHaveBeenCalled();
    expect(mocks.nack).toHaveBeenCalledWith(thirdAttempt, false, false);
  });
});
