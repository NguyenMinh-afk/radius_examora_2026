import {
  isMessageProcessed,
  markMessageProcessed,
} from '../services/message-idempotency.service.js';

export const MAX_MESSAGE_ATTEMPTS = 3;

export class NonRetryableMessageError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NonRetryableMessageError';
  }
}

function retryCount(message) {
  const value = Number(message.properties.headers?.['x-retry-count'] || 0);
  return Number.isFinite(value) && value >= 0 ? value : 0;
}

function requireMessageId(message) {
  const messageId = message.properties.messageId;
  if (!messageId) {
    throw new NonRetryableMessageError('AMQP messageId is required');
  }
  return messageId;
}

async function scheduleRetry({ channel, message, retryQueue, consumerName, currentRetryCount }) {
  let returnedMessage = null;
  const onReturn = (returned) => {
    if (returned.properties.messageId === message.properties.messageId) {
      returnedMessage = returned;
    }
  };

  channel.on('return', onReturn);
  try {
    channel.sendToQueue(retryQueue, message.content, {
      ...message.properties,
      persistent: true,
      mandatory: true,
      headers: {
        ...(message.properties.headers || {}),
        'x-retry-count': currentRetryCount + 1,
        'x-last-consumer': consumerName,
      },
    });
    await channel.waitForConfirms();
    await new Promise((resolve) => setImmediate(resolve));
    if (returnedMessage) {
      throw new Error(
        `RabbitMQ returned retry message: ${returnedMessage.fields.replyText || 'NO_ROUTE'}`
      );
    }
    channel.ack(message);
  } finally {
    channel.off('return', onReturn);
  }
}

export async function handleReliableMessage({
  channel,
  message,
  retryQueue,
  consumerName,
  processMessage,
  maxAttempts = MAX_MESSAGE_ATTEMPTS,
  idempotency = {
    isProcessed: isMessageProcessed,
    markProcessed: markMessageProcessed,
  },
}) {
  if (!message) {
    return;
  }

  let messageId;
  try {
    messageId = requireMessageId(message);
    if (await idempotency.isProcessed(consumerName, messageId)) {
      console.log(`[${consumerName}] Duplicate ACK: ${messageId}`);
      channel.ack(message);
      return;
    }

    await processMessage(message, messageId);
    await idempotency.markProcessed(consumerName, messageId);
    channel.ack(message);
  } catch (error) {
    if (error instanceof NonRetryableMessageError) {
      console.error(`[${consumerName}] Invalid message; sending to DLQ:`, error.message);
      channel.nack(message, false, false);
      return;
    }

    const currentRetryCount = retryCount(message);
    const attempt = currentRetryCount + 1;
    if (attempt >= maxAttempts) {
      console.error(`[${consumerName}] Attempt limit reached; sending to DLQ:`, error.message);
      channel.nack(message, false, false);
      return;
    }

    console.warn(
      `[${consumerName}] Temporary failure; scheduling attempt ${attempt + 1}/${maxAttempts}:`,
      error.message
    );
    try {
      await scheduleRetry({
        channel,
        message,
        retryQueue,
        consumerName,
        currentRetryCount,
      });
    } catch (retryError) {
      console.error(`[${consumerName}] Failed to schedule retry; requeueing delivery:`, retryError.message);
      channel.nack(message, false, true);
    }
  }
}

export default {
  MAX_MESSAGE_ATTEMPTS,
  NonRetryableMessageError,
  handleReliableMessage,
};
