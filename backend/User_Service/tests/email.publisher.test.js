import { beforeEach, describe, expect, it, vi } from 'vitest';

const mocks = vi.hoisted(() => {
  const channel = {
    on: vi.fn(),
    publish: vi.fn(),
  };
  const connection = {
    createConfirmChannel: vi.fn(),
    on: vi.fn(),
  };
  return {
    channel,
    connect: vi.fn(),
    connection,
  };
});

vi.mock('amqplib', () => ({
  default: {
    connect: mocks.connect,
  },
}));

import { sendPasswordChangedEmail } from '../src/services/email.service.js';

describe('User Service email publisher', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocks.connect.mockResolvedValue(mocks.connection);
    mocks.connection.createConfirmChannel.mockResolvedValue(mocks.channel);
    mocks.channel.publish.mockImplementation(
      (_exchange, _routingKey, _body, _options, callback) => callback(null)
    );
  });

  it('mandatory-publishes a persistent email with messageId', async () => {
    await sendPasswordChangedEmail({
      to: 'user@example.com',
      userName: 'User',
    });

    expect(mocks.channel.publish).toHaveBeenCalledWith(
      'examora.topic',
      'email.send',
      expect.any(Buffer),
      expect.objectContaining({
        contentType: 'application/json',
        mandatory: true,
        messageId: expect.any(String),
        persistent: true,
        type: 'email.send',
      }),
      expect.any(Function)
    );
  });
});
